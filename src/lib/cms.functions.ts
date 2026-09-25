import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function rolesOf(ctx: Ctx) {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  return (data ?? []).map((r: { role: string }) => r.role) as string[];
}
async function requireStaff(ctx: Ctx) {
  const roles = await rolesOf(ctx);
  if (!roles.includes("admin") && !roles.includes("editor")) throw new Error("Huna ruhusa ya kufanya kitendo hiki.");
  return roles;
}
async function requireAdmin(ctx: Ctx) {
  const roles = await rolesOf(ctx);
  if (!roles.includes("admin")) throw new Error("Kitendo hiki kinahitaji msimamizi mkuu.");
}
function check<T>(res: { data: T; error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await rolesOf(context);
    return { roles, isStaff: roles.includes("admin") || roles.includes("editor") || roles.includes("reviewer"), isAdmin: roles.includes("admin") };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context);
    const sb = context.supabase;
    const count = async (q: any) => (await q).count ?? 0;
    const c = () => sb.from("content_items").select("id", { count: "exact", head: true });
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [totalNews, publishedNews, draftNews, totalDocs, media, featured, newSubs, views, downloads, events, logs] = await Promise.all([
      count(c().eq("kind", "news")), count(c().eq("kind", "news").eq("status", "published")), count(c().eq("kind", "news").eq("status", "draft")),
      count(c().eq("kind", "document")), count(sb.from("media_assets").select("id", { count: "exact", head: true })), count(c().eq("is_featured", true)),
      count(sb.from("public_submissions").select("id", { count: "exact", head: true }).eq("status", "new")),
      count(sb.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "page_view").gte("created_at", since)),
      count(sb.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "download").gte("created_at", since)),
      sb.from("analytics_events").select("event_type,path,content_id,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(1000),
      sb.from("audit_logs").select("id,action,table_name,created_at,new_data,old_data").order("created_at", { ascending: false }).limit(10),
    ]);
    const tally = (type: string) => {
      const m = new Map<string, number>();
      for (const e of events.data ?? []) if (e.event_type === type && e.content_id) m.set(e.content_id, (m.get(e.content_id) ?? 0) + 1);
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    };
    const topViewed = tally("content_view"), topDownloads = tally("download");
    const ids = [...topViewed, ...topDownloads].map(([id]) => id);
    const titles = ids.length ? (await sb.from("content_items").select("id,title_sw").in("id", ids)).data ?? [] : [];
    const name = (id: string) => titles.find((t: any) => t.id === id)?.title_sw ?? "—";
    const pages = new Map<string, number>();
    for (const e of events.data ?? []) if (e.event_type === "page_view") pages.set(e.path, (pages.get(e.path) ?? 0) + 1);
    return {
      stats: { totalNews, publishedNews, draftNews, totalDocs, media, featured, newSubs, views, downloads },
      topViewed: topViewed.map(([id, n]) => ({ title: name(id), n })),
      topDownloads: topDownloads.map(([id, n]) => ({ title: name(id), n })),
      topPages: [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([path, n]) => ({ path, n })),
      recentVisits: (events.data ?? []).filter((e: any) => e.event_type === "page_view").slice(0, 8).map((e: any) => ({ path: e.path, at: e.created_at })),
      activity: (logs.data ?? []).map((l: any) => ({ id: l.id, action: l.action, table: l.table_name, at: l.created_at, label: l.new_data?.title_sw ?? l.new_data?.name ?? l.old_data?.title_sw ?? l.old_data?.name ?? "" })),
    };
  });

// ---------- Content ----------
const kinds = ["news", "event", "document", "opportunity", "announcement", "project"] as const;

export const listAdminContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; q?: string; status?: string; page?: number }) =>
    z.object({ kind: z.enum(kinds), q: z.string().max(100).optional(), status: z.string().max(20).optional(), page: z.number().int().min(1).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const size = 15, page = data.page ?? 1;
    let q = context.supabase.from("content_items").select("*", { count: "exact" }).eq("kind", data.kind);
    const term = (data.q ?? "").replace(/[%,()]/g, " ").trim();
    if (term) q = q.or(`title_sw.ilike.%${term}%,title_en.ilike.%${term}%,category.ilike.%${term}%`);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const res = await q.order("created_at", { ascending: false }).range((page - 1) * size, page * size - 1);
    return { items: check(res) ?? [], total: res.count ?? 0, pageSize: size };
  });

const contentSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(kinds),
  title_sw: z.string().trim().min(2).max(250),
  title_en: z.string().trim().max(250).default(""),
  summary_sw: z.string().max(1000).default(""),
  summary_en: z.string().max(1000).default(""),
  body_sw: z.string().max(100000).default(""),
  body_en: z.string().max(100000).default(""),
  category: z.string().trim().min(1).max(60),
  image_url: z.string().max(500).nullable().optional(),
  video_url: z.string().max(500).nullable().optional(),
  document_url: z.string().max(500).nullable().optional(),
  file_size: z.string().max(30).nullable().optional(),
  gallery: z.array(z.string().max(500)).max(30).default([]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  author: z.string().max(100).nullable().optional(),
  location: z.string().max(150).nullable().optional(),
  organization: z.string().max(150).nullable().optional(),
  deadline: z.string().max(10).nullable().optional(),
  event_date: z.string().max(40).nullable().optional(),
  project_status: z.string().max(20).nullable().optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]),
  published_at: z.string().max(40).nullable().optional(),
});

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 70) || "chapisho";
}
function toEmbed(url?: string | null) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof contentSchema>) => contentSchema.parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const sanitizeHtml = (await import("sanitize-html")).default;
    const clean = (html: string) => sanitizeHtml(html, {
      allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "hr", "code", "pre"],
      allowedAttributes: { a: ["href", "target", "rel"] },
      allowedSchemes: ["http", "https", "mailto"],
      transformTags: { a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }) },
    });
    const safeUrl = (u?: string | null) => (u && /^(https:\/\/|\/api\/public\/media\/)/.test(u) ? u : null);
    const row = {
      ...data,
      body_sw: clean(data.body_sw), body_en: clean(data.body_en),
      image_url: safeUrl(data.image_url), document_url: safeUrl(data.document_url), video_url: safeUrl(toEmbed(data.video_url)),
      gallery: data.gallery.filter((g) => safeUrl(g)),
      deadline: data.deadline || null, event_date: data.event_date || null,
      published_at: data.status === "published" ? data.published_at || new Date().toISOString() : data.published_at || null,
    };
    delete (row as { id?: string }).id;
    if (data.id) {
      const res = await context.supabase.from("content_items").update(row).eq("id", data.id).select("id,slug").single();
      return check(res);
    }
    const slug = `${slugify(data.title_sw)}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await context.supabase.from("content_items").insert({ ...row, slug, created_by: context.userId }).select("id,slug").single();
    return check(res);
  });

export const updateContentFlags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status?: "draft" | "published" | "archived"; is_featured?: boolean }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["draft", "published", "archived"]).optional(), is_featured: z.boolean().optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const patch: Record<string, unknown> = {};
    if (data.status) { patch.status = data.status; if (data.status === "published") patch.published_at = new Date().toISOString(); }
    if (data.is_featured !== undefined) patch.is_featured = data.is_featured;
    check(await context.supabase.from("content_items").update(patch).eq("id", data.id).select("id"));
    return { ok: true };
  });

export const deleteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    check(await context.supabase.from("content_items").delete().eq("id", data.id).select("id"));
    return { ok: true };
  });

// ---------- Media ----------
export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { q?: string; type?: string }) => z.object({ q: z.string().max(100).optional(), type: z.string().max(20).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    let q = context.supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(200);
    if (data.type && data.type !== "all") q = q.eq("media_type", data.type);
    const term = (data.q ?? "").replace(/[%,()]/g, " ").trim();
    if (term) q = q.ilike("name", `%${term}%`);
    return check(await q) ?? [];
  });

export const registerMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; file_path: string; mime_type: string; size_bytes: number; media_type: "image" | "video" | "document" }) =>
    z.object({ name: z.string().min(1).max(200), file_path: z.string().regex(/^[a-zA-Z0-9/_\-.]+$/).max(300), mime_type: z.string().max(100), size_bytes: z.number().int().min(0), media_type: z.enum(["image", "video", "document"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const res = await context.supabase.from("media_assets").insert({ ...data, public_url: `/api/public/media/${data.file_path}`, created_by: context.userId }).select("*").single();
    return check(res);
  });

export const updateMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name?: string; is_featured?: boolean }) => z.object({ id: z.string().uuid(), name: z.string().min(1).max(200).optional(), is_featured: z.boolean().optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const { id, ...patch } = data;
    check(await context.supabase.from("media_assets").update(patch).eq("id", id).select("id"));
    return { ok: true };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const row = check(await context.supabase.from("media_assets").select("file_path").eq("id", data.id).single()) as { file_path: string };
    await context.supabase.storage.from("site-media").remove([row.file_path]);
    check(await context.supabase.from("media_assets").delete().eq("id", data.id).select("id"));
    return { ok: true };
  });

// ---------- Slider / links / socials (generic list tables) ----------
const tables = ["slider_items", "important_links", "social_links"] as const;
export const listTable = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: (typeof tables)[number] }) => z.object({ table: z.enum(tables) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    return check(await context.supabase.from(data.table).select("*").order("sort_order")) ?? [];
  });

const rowSchemas = {
  slider_items: z.object({ title_sw: z.string().max(200), title_en: z.string().max(200), caption_sw: z.string().max(400), caption_en: z.string().max(400), media_url: z.string().min(1).max(500), media_type: z.enum(["image", "video"]), link_url: z.string().max(500).nullable(), duration_seconds: z.number().int().min(2).max(60), sort_order: z.number().int(), is_active: z.boolean() }).partial(),
  important_links: z.object({ title_sw: z.string().min(1).max(200), title_en: z.string().min(1).max(200), url: z.string().url().max(500), sort_order: z.number().int(), is_active: z.boolean() }).partial(),
  social_links: z.object({ platform: z.enum(["instagram", "tiktok", "youtube", "facebook", "threads", "x", "linkedin", "whatsapp"]), url: z.string().url().max(500), sort_order: z.number().int(), is_active: z.boolean() }).partial(),
};

export const saveRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: (typeof tables)[number]; id?: string; values: Record<string, unknown> }) => {
    const p = z.object({ table: z.enum(tables), id: z.string().uuid().optional(), values: z.record(z.string(), z.unknown()) }).parse(d);
    return { ...p, values: rowSchemas[p.table].parse(p.values) };
  })
  .handler(async ({ context, data }) => {
    if (data.table === "slider_items") await requireStaff(context); else await requireAdmin(context);
    const t = context.supabase.from(data.table);
    const res = data.id ? await t.update(data.values).eq("id", data.id).select("id") : await t.insert(data.values).select("id");
    check(res);
    return { ok: true };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: (typeof tables)[number]; id: string }) => z.object({ table: z.enum(tables), id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    if (data.table === "slider_items") await requireStaff(context); else await requireAdmin(context);
    check(await context.supabase.from(data.table).delete().eq("id", data.id).select("id"));
    return { ok: true };
  });

// ---------- Settings ----------
export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context);
    const rows = check(await context.supabase.from("site_settings").select("key,value")) as { key: string; value: Record<string, unknown> }[];
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, Record<string, unknown>>;
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: "general" | "homepage" | "youtube"; value: Record<string, unknown> }) =>
    z.object({ key: z.enum(["general", "homepage", "youtube"]), value: z.record(z.string(), z.union([z.string().max(1000), z.boolean(), z.number(), z.null()])) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    check(await context.supabase.from("site_settings").upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() }).select("key"));
    return { ok: true };
  });

export const syncYoutubeNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context);
    const { maybeSyncYoutube } = await import("./public.functions");
    try { return await maybeSyncYoutube(true); } catch (e) { return { imported: 0, error: e instanceof Error ? e.message : "Imeshindikana" }; }
  });

// ---------- Submissions ----------
export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string }) => z.object({ status: z.string().max(20).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const roles = await rolesOf(context);
    if (!roles.includes("admin") && !roles.includes("reviewer")) throw new Error("Huna ruhusa.");
    let q = context.supabase.from("public_submissions").select("*").order("created_at", { ascending: false }).limit(100);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    return check(await q) ?? [];
  });

export const updateSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "new" | "in_review" | "closed"; internal_notes?: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "in_review", "closed"]), internal_notes: z.string().max(2000).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const roles = await rolesOf(context);
    if (!roles.includes("admin") && !roles.includes("reviewer")) throw new Error("Huna ruhusa.");
    check(await context.supabase.from("public_submissions").update({ status: data.status, internal_notes: data.internal_notes ?? null }).eq("id", data.id).select("id"));
    return { ok: true };
  });

// ---------- Users & roles ----------
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    const roles = check(await context.supabase.from("user_roles").select("user_id,role")) as { user_id: string; role: string }[];
    return (users?.users ?? []).map((u) => ({ id: u.id, email: u.email ?? "", created_at: u.created_at, last_sign_in_at: u.last_sign_in_at ?? null, roles: roles.filter((r) => r.user_id === u.id).map((r) => r.role) }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "editor" | "reviewer"; enabled: boolean }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["admin", "editor", "reviewer"]), enabled: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    if (data.userId === context.userId && data.role === "admin" && !data.enabled) throw new Error("Huwezi kujiondolea mamlaka ya msimamizi mkuu.");
    if (data.enabled) check(await context.supabase.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" }).select("id"));
    else check(await context.supabase.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role).select("id"));
    return { ok: true };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const rows = check(await context.supabase.from("audit_logs").select("id,actor_id,action,table_name,record_id,created_at,new_data,old_data").order("created_at", { ascending: false }).limit(150)) as any[];
    return rows.map((l) => ({ id: l.id, actor: l.actor_id, action: l.action, table: l.table_name, at: l.created_at, label: l.new_data?.title_sw ?? l.new_data?.name ?? l.new_data?.subject ?? l.old_data?.title_sw ?? l.old_data?.name ?? l.record_id }));
  });
