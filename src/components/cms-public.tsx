import { Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CalendarDays, Download, FileText, MapPin, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/content-ui";
import { useLanguage } from "@/lib/i18n";
import { listContent, recordEvent, type PublicContent } from "@/lib/public.functions";

export function formatDate(value: string | null | undefined, language: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(language === "en" ? "en-GB" : "sw-TZ", { day: "numeric", month: "long", year: "numeric" });
}

export function ContentCard({ item }: { item: PublicContent }) {
  const { pick, language } = useLanguage();
  return (
    <article className="group flex flex-col border border-border bg-card">
      <Link to="/chapisho/$slug" params={{ slug: item.slug }} className="relative block overflow-hidden bg-secondary">
        {item.image_url ? <img src={item.image_url} alt="" className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" /> : <div className="grid aspect-video place-items-center"><FileText className="size-10 text-primary/40" /></div>}
        {item.video_url && <PlayCircle className="absolute right-3 top-3 size-8 text-primary-foreground drop-shadow" />}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap gap-x-3 text-xs font-semibold text-primary"><span>{item.category}</span><span className="text-muted-foreground">{formatDate(item.event_date ?? item.published_at, language)}</span></p>
        <h3 className="mt-3 font-display text-lg font-bold leading-snug"><Link to="/chapisho/$slug" params={{ slug: item.slug }} className="hover:text-primary">{pick(item.title_sw, item.title_en)}</Link></h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{pick(item.summary_sw, item.summary_en)}</p>
        {item.location && <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{item.location}</p>}
      </div>
    </article>
  );
}

export function DocumentRow({ item }: { item: PublicContent }) {
  const { pick, tr, language } = useLanguage();
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-5">
      <FileText className="size-8 text-primary" />
      <div className="min-w-0">
        <h3 className="font-bold"><Link to="/chapisho/$slug" params={{ slug: item.slug }} className="hover:text-primary">{pick(item.title_sw, item.title_en)}</Link></h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.category} · {formatDate(item.published_at, language)}{item.file_size ? ` · ${item.file_size}` : ""}</p>
      </div>
      {item.document_url && <Button asChild variant="outline" size="sm"><a href={item.document_url} target="_blank" rel="noopener noreferrer" onClick={() => recordEvent({ data: { type: "download", path: "/nyaraka", contentId: item.id } }).catch(() => undefined)}><Download />{tr("Pakua")}</a></Button>}
    </article>
  );
}

export function ContentListPage({ kind, layout = "grid", placeholder }: { kind: "news" | "event" | "document" | "opportunity" | "announcement" | "project"; layout?: "grid" | "list"; placeholder?: string }) {
  const { tr } = useLanguage();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = layout === "list" ? 15 : 9;
  const { data, isLoading } = useQuery({ queryKey: ["list", kind, q, category, year, page], queryFn: () => listContent({ data: { kind, q, category, year, page, pageSize } }), placeholderData: keepPreviousData });
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const years = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_160px]">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={tr(placeholder ?? "Tafuta habari, nyaraka, matukio...")} />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="h-11 border border-input bg-background px-3 text-sm" aria-label={tr("Kategoria zote")}>
          <option value="">{tr("Kategoria zote")}</option>{(data?.categories ?? []).map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} className="h-11 border border-input bg-background px-3 text-sm" aria-label={tr("Miaka yote")}>
          <option value="">{tr("Miaka yote")}</option>{years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
      <div className="mt-8">
        {isLoading ? <p className="py-12 text-center text-muted-foreground">…</p> : !data?.items.length ? <p className="border border-dashed border-border py-16 text-center text-muted-foreground">{tr("Hakuna matokeo yaliyopatikana.")}</p> :
          layout === "list" ? <div className="divide-y divide-border border-y border-border">{data.items.map((i) => <DocumentRow key={i.id} item={i} />)}</div> :
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((i) => <ContentCard key={i.id} item={i} />)}</div>}
      </div>
      {pages > 1 && <div className="mt-8 flex items-center justify-center gap-3"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{tr("Iliyotangulia")}</Button><span className="text-sm">{page} / {pages}</span><Button variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>{tr("Inayofuata")}</Button></div>}
    </section>
  );
}

export function EventDate({ value }: { value: string | null }) {
  const { language } = useLanguage();
  return <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />{formatDate(value, language)}</span>;
}
