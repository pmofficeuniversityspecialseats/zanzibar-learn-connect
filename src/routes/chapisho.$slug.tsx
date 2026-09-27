import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Download, Link2, MapPin, User } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContentCard, formatDate } from "@/components/cms-public";
import { useLanguage } from "@/lib/i18n";
import { getContentBySlug, recordEvent } from "@/lib/public.functions";

export const Route = createFileRoute("/chapisho/$slug")({
  loader: async ({ params }) => {
    const res = await getContentBySlug({ data: { slug: params.slug } });
    if (!res.item) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const i = loaderData?.item;
    const title = i ? `${i.title_sw} | Ofisi ya Mbunge` : "Chapisho | Ofisi ya Mbunge";
    const desc = i?.summary_sw?.slice(0, 160) || "Taarifa rasmi ya Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar.";
    const img = i?.image_url?.startsWith("https://") ? i.image_url : null;
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: i?.title_sw ?? title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }, ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : [])] };
  },
  notFoundComponent: () => <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-display text-2xl font-bold">Chapisho halikupatikana</h1><Link to="/habari" className="mt-4 inline-block text-primary underline">Rudi kwenye habari</Link></div>,
  component: Article,
});

function Article() {
  const { item, related } = Route.useLoaderData();
  const { pick, tr, language } = useLanguage();
  const it = item!;
  useEffect(() => { recordEvent({ data: { type: "content_view", path: `/chapisho/${it.slug}`.slice(0, 300), contentId: it.id } }).catch(() => undefined); }, [it.id, it.slug]);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = pick(it.title_sw, it.title_en);
  const body = pick(it.body_sw, it.body_en);
  const back = it.kind === "document" ? "/nyaraka" : it.kind === "event" ? "/matukio" : it.kind === "opportunity" ? "/fursa" : "/habari";
  return (
    <article>
      <header className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <Link to={back} className="inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />{tr("Rudi kwenye habari")}</Link>
          <p className="mt-5 text-xs font-bold uppercase text-gold">{it.category} · {formatDate(it.event_date ?? it.published_at, language)}</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">{it.author && <span className="flex items-center gap-1"><User className="size-4" />{it.author}</span>}{it.location && <span className="flex items-center gap-1"><MapPin className="size-4" />{it.location}</span>}</div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {it.video_url ? <div className="aspect-video w-full bg-secondary">{/youtube\.com\/embed/.test(it.video_url) ? <iframe src={it.video_url} title={title} className="size-full" allowFullScreen loading="lazy" /> : <video src={it.video_url} controls className="size-full" poster={it.image_url ?? undefined} />}</div>
          : it.image_url && <img src={it.image_url} alt="" className="w-full object-cover" />}
        <p className="mt-8 text-lg leading-8 text-foreground">{pick(it.summary_sw, it.summary_en)}</p>
        {body && <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: body }} />}
        {it.gallery.length > 0 && <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">{it.gallery.map((g) => <a key={g} href={g} target="_blank" rel="noopener noreferrer"><img src={g} alt="" className="aspect-square w-full object-cover" loading="lazy" /></a>)}</div>}
        {it.document_url && <Button asChild className="mt-8"><a href={it.document_url} target="_blank" rel="noopener noreferrer" onClick={() => recordEvent({ data: { type: "download", path: back, contentId: it.id } }).catch(() => undefined)}><Download />{tr("Pakua")}{it.file_size ? ` (${it.file_size})` : ""}</a></Button>}
        {it.tags.length > 0 && <ul className="mt-8 flex flex-wrap gap-2">{it.tags.map((t) => <li key={t} className="border border-border px-2 py-1 text-xs">#{t}</li>)}</ul>}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <span className="mr-2 text-sm font-bold">{tr("Shiriki")}:</span>
          <Button asChild variant="outline" size="icon"><a aria-label="Facebook" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}><FaFacebookF /></a></Button>
          <Button asChild variant="outline" size="icon"><a aria-label="X" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}><FaXTwitter /></a></Button>
          <Button asChild variant="outline" size="icon"><a aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}><FaWhatsapp /></a></Button>
          <Button variant="outline" size="icon" aria-label={tr("Nakili kiungo")} onClick={() => { navigator.clipboard.writeText(url); toast.success(language === "en" ? "Link copied" : "Kiungo kimenakiliwa"); }}><Link2 /></Button>
        </div>
      </div>
      {related.length > 0 && <section className="bg-secondary"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><h2 className="mb-6 font-display text-2xl font-bold">{tr("Habari Zinazohusiana")}</h2><div className="grid gap-6 md:grid-cols-3">{related.map((r) => <ContentCard key={r.id} item={r} />)}</div></div></section>}
    </article>
  );
}
