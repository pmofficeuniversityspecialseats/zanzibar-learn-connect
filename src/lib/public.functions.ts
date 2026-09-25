import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const CONTENT_COLUMNS =
  "id,kind,slug,title_sw,title_en,summary_sw,summary_en,category,image_url,document_url,video_url,organization,location,deadline,event_date,file_size,project_status,published_at,created_at,is_featured,tags,author,source,gallery";

export type PublicContent = {
  id: string; kind: string; slug: string; title_sw: string; title_en: string; summary_sw: string; summary_en: string;
  category: string; image_url: string | null; document_url: string | null; video_url: string | null; organization: string | null;
  location: string | null; deadline: string | null; event_date: string | null; file_size: string | null; project_status: string | null;
  published_at: string | null; created_at: string; is_featured: boolean; tags: string[]; author: string | null; source: string; gallery: string[];
};

export type GeneralSettings = { site_name_sw?: string; site_name_en?: string; email?: string; phone?: string; address?: string; hours_sw?: string; hours_en?: string; seo_description?: string };
export type HomepageSettings = { show_slider?: boolean; show_news?: boolean; show_documents?: boolean; show_events?: boolean; show_announcements?: boolean; show_links?: boolean; show_social?: boolean; slide_duration?: number; feed_mode?: "manual" | "social" | "both" };

export const getSiteInfo = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [settings, links, socials] = await Promise.all([
    sb.from("site_settings").select("key,value"),
    sb.from("important_links").select("id,title_sw,title_en,url").eq("is_active", true).order("sort_order"),
    sb.from("social_links").select("id,platform,url").eq("is_active", true).order("sort_order"),
  ]);
  const map = Object.fromEntries((settings.data ?? []).map((s) => [s.key, s.value]));
  return {
    general: (map.general ?? {}) as GeneralSettings,
    homepage: (map.homepage ?? {}) as HomepageSettings,
    links: links.data ?? [],
    socials: socials.data ?? [],
  };
});

function feedFilter<T extends { neq: (c: string, v: string) => T; eq: (c: string, v: string) => T }>(q: T, mode?: string) {
  if (mode === "manual") return q.neq("source", "youtube");
  if (mode === "social") return q.eq("source", "youtube");
  return q;
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  await maybeSyncYoutube().catch((e) => console.error("youtube sync", e));
  const { data: hs } = await sb.from("site_settings").select("value").eq("key", "homepage").maybeSingle();
  const mode = (hs?.value as HomepageSettings | null)?.feed_mode;
  const [slides, featured, media, news, docs, events, announcements] = await Promise.all([
    sb.from("slider_items").select("*").eq("is_active", true).order("sort_order"),
    sb.from("content_items").select(CONTENT_COLUMNS).eq("is_featured", true).order("published_at", { ascending: false }).limit(8),
    sb.from("media_assets").select("id,name,public_url,media_type").eq("is_featured", true).neq("media_type", "document").order("created_at", { ascending: false }).limit(8),
    feedFilter(sb.from("content_items").select(CONTENT_COLUMNS).eq("kind", "news"), mode).order("published_at", { ascending: false }).limit(6),
    sb.from("content_items").select(CONTENT_COLUMNS).eq("kind", "document").order("published_at", { ascending: false }).limit(5),
    sb.from("content_items").select(CONTENT_COLUMNS).eq("kind", "event").order("event_date", { ascending: false }).limit(4),
    sb.from("content_items").select(CONTENT_COLUMNS).eq("kind", "announcement").order("published_at", { ascending: false }).limit(4),
  ]);
  return {
    slides: slides.data ?? [],
    featured: (featured.data ?? []) as PublicContent[],
    featuredMedia: media.data ?? [],
    news: (news.data ?? []) as PublicContent[],
    documents: (docs.data ?? []) as PublicContent[],
    events: (events.data ?? []) as PublicContent[],
    announcements: (announcements.data ?? []) as PublicContent[],
  };
});

const listSchema = z.object({
  kind: z.enum(["news", "event", "document", "opportunity", "announcement", "project"]),
  q: z.string().max(100).optional().default(""),
  category: z.string().max(60).optional().default(""),
  year: z.string().max(4).optional().default(""),
  page: z.number().int().min(1).max(500).optional().default(1),
  pageSize: z.number().int().min(1).max(48).optional().default(9),
});

export const listContent = createServerFn({ method: "GET" })
  .inputValidator((d: z.input<typeof listSchema>) => listSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (data.kind === "news") await maybeSyncYoutube().catch(() => undefined);
    let q = sb.from("content_items").select(CONTENT_COLUMNS, { count: "exact" }).eq("kind", data.kind);
    const term = data.q.replace(/[%,()]/g, " ").trim();
    if (term) q = q.or(`title_sw.ilike.%${term}%,title_en.ilike.%${term}%,summary_sw.ilike.%${term}%,summary_en.ilike.%${term}%`);
    if (data.category) q = q.eq("category", data.category);
    if (/^\d{4}$/.test(data.year)) q = q.gte("published_at", `${data.year}-01-01`).lt("published_at", `${Number(data.year) + 1}-01-01`);
    const from = (data.page - 1) * data.pageSize;
    const order = data.kind === "event" ? "event_date" : "published_at";
    const { data: rows, count, error } = await q.order(order, { ascending: false, nullsFirst: false }).range(from, from + data.pageSize - 1);
    if (error) console.error(error);
    const cats = await sb.from("content_items").select("category").eq("kind", data.kind).limit(500);
    return { items: (rows ?? []) as PublicContent[], total: count ?? 0, categories: [...new Set((cats.data ?? []).map((c) => c.category))].sort() };
  });

export const getContentBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: item } = await sb.from("content_items").select(`${CONTENT_COLUMNS},body_sw,body_en`).eq("slug", data.slug).maybeSingle();
    if (!item) return { item: null, related: [] as PublicContent[] };
    const { data: related } = await sb.from("content_items").select(CONTENT_COLUMNS).eq("kind", item.kind).neq("id", item.id).order("published_at", { ascending: false }).limit(3);
    return { item: item as PublicContent & { body_sw: string; body_en: string }, related: (related ?? []) as PublicContent[] };
  });

export const searchSite = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; kind?: string }) => z.object({ q: z.string().max(100), kind: z.string().max(20).optional() }).parse(d))
  .handler(async ({ data }) => {
    const term = data.q.replace(/[%,()]/g, " ").trim();
    if (term.length < 2) return { items: [] as PublicContent[] };
    const sb = publicClient();
    let q = sb.from("content_items").select(CONTENT_COLUMNS).or(`title_sw.ilike.%${term}%,title_en.ilike.%${term}%,summary_sw.ilike.%${term}%,summary_en.ilike.%${term}%,category.ilike.%${term}%`);
    if (data.kind) q = q.eq("kind", data.kind);
    const { data: rows } = await q.order("published_at", { ascending: false }).limit(50);
    return { items: (rows ?? []) as PublicContent[] };
  });

export const recordEvent = createServerFn({ method: "POST" })
  .inputValidator((d: { type: "page_view" | "content_view" | "download"; path: string; contentId?: string }) =>
    z.object({ type: z.enum(["page_view", "content_view", "download"]), path: z.string().max(300), contentId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data }) => {
    await publicClient().from("analytics_events").insert({ event_type: data.type, path: data.path, content_id: data.contentId ?? null });
    return { ok: true };
  });

/** Pulls latest videos from the office's public YouTube RSS feed (official, ToS-compliant). Throttled to once per hour. */
export async function maybeSyncYoutube(force = false) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: s } = await supabaseAdmin.from("site_settings").select("value").eq("key", "youtube").maybeSingle();
  const cfg = (s?.value ?? {}) as { channel_id?: string; last_sync?: string | null };
  if (!cfg.channel_id) return { imported: 0 };
  if (!force && cfg.last_sync && Date.now() - new Date(cfg.last_sync).getTime() < 60 * 60 * 1000) return { imported: 0 };
  await supabaseAdmin.from("site_settings").upsert({ key: "youtube", value: { ...cfg, last_sync: new Date().toISOString() } });
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(cfg.channel_id)}`);
  if (!res.ok) throw new Error(`YouTube feed failed [${res.status}]`);
  const xml = await res.text();
  const decode = (t: string) => t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 15).map((m) => {
    const e = m[1];
    const get = (re: RegExp) => decode(e.match(re)?.[1]?.trim() ?? "");
    const vid = get(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const description = get(/<media:description>([\s\S]*?)<\/media:description>/);
    return { vid, title: get(/<title>([^<]*)<\/title>/), published: get(/<published>([^<]+)<\/published>/), description };
  }).filter((e) => e.vid);
  const rows = entries.map((e) => ({
    kind: "news", source: "youtube", external_id: `yt:${e.vid}`, slug: `youtube-${e.vid.toLowerCase()}`,
    title_sw: e.title.slice(0, 250) || "Video mpya ya YouTube", title_en: e.title.slice(0, 250) || "New YouTube video",
    summary_sw: e.description.slice(0, 400), summary_en: e.description.slice(0, 400),
    body_sw: e.description.split("\n").filter(Boolean).map((p) => `<p>${p.replace(/</g, "&lt;")}</p>`).join(""), body_en: "",
    category: "Video", image_url: `https://i.ytimg.com/vi/${e.vid}/hqdefault.jpg`, video_url: `https://www.youtube.com/embed/${e.vid}`,
    status: "published" as const, published_at: e.published || new Date().toISOString(), author: "YouTube",
  }));
  if (rows.length) {
    const { error } = await supabaseAdmin.from("content_items").upsert(rows, { onConflict: "external_id", ignoreDuplicates: true });
    if (error) throw error;
  }
  return { imported: rows.length };
}
