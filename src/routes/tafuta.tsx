import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site-shell";
import { formatDate } from "@/components/cms-public";
import { useLanguage } from "@/lib/i18n";
import { searchSite } from "@/lib/public.functions";

export const Route = createFileRoute("/tafuta")({
  validateSearch: z.object({ q: z.string().max(100).optional().default(""), kind: z.string().max(20).optional().default("") }),
  head: () => ({ meta: [{ title: "Utafutaji | Ofisi ya Mbunge" }, { name: "description", content: "Tafuta habari, nyaraka, matukio na matangazo ya ofisi." }, { property: "og:title", content: "Utafutaji wa Tovuti" }, { property: "og:description", content: "Tafuta taarifa rasmi za ofisi." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SearchPage,
});

const kinds: [string, string, string][] = [["", "Aina zote", "All types"], ["news", "Habari", "News"], ["document", "Nyaraka", "Documents"], ["event", "Matukio", "Events"], ["announcement", "Matangazo", "Announcements"], ["opportunity", "Fursa", "Opportunities"], ["project", "Miradi", "Projects"]];

function SearchPage() {
  const { q, kind } = Route.useSearch();
  const navigate = useNavigate({ from: "/tafuta" });
  const { tr, pick, language } = useLanguage();
  const [term, setTerm] = useState(q);
  const { data, isFetching } = useQuery({ queryKey: ["search", q, kind], queryFn: () => searchSite({ data: { q, kind: kind || undefined } }), enabled: q.trim().length >= 2 });
  const groups = kinds.slice(1).map(([k, sw, en]) => [k, language === "en" ? en : sw, (data?.items ?? []).filter((i) => i.kind === k)] as const).filter(([, , items]) => items.length);
  return (
    <>
      <PageHero eyebrow="Utafutaji" title="Tafuta kwenye tovuti" description="Tafuta habari, nyaraka, matukio..." />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: term, kind } }); }}>
          <Input value={term} onChange={(e) => setTerm(e.target.value)} className="h-12" placeholder={tr("Tafuta habari, nyaraka, matukio...")} aria-label={tr("Tafuta")} />
          <Button type="submit" size="lg"><Search />{tr("Tafuta")}</Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">{kinds.map(([k, sw, en]) => <Button key={k} size="sm" variant={kind === k ? "default" : "outline"} onClick={() => navigate({ search: { q, kind: k } })}>{language === "en" ? en : sw}</Button>)}</div>
        <div className="mt-8">
          {q.trim().length < 2 ? null : isFetching ? <p className="text-muted-foreground">…</p> : !groups.length ? <p className="border border-dashed border-border py-12 text-center text-muted-foreground">{tr("Hakuna matokeo yaliyopatikana.")}</p> :
            groups.map(([k, label, items]) => <div key={k} className="mb-10"><h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl font-bold">{label} <span className="text-sm text-muted-foreground">({items.length})</span></h2><ul className="divide-y divide-border">{items.map((i) => <li key={i.id} className="py-4"><Link to="/chapisho/$slug" params={{ slug: i.slug }} className="font-bold hover:text-primary">{pick(i.title_sw, i.title_en)}</Link><p className="mt-1 text-xs text-muted-foreground">{i.category} · {formatDate(i.published_at, language)}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{pick(i.summary_sw, i.summary_en)}</p></li>)}</ul></div>)}
        </div>
      </section>
    </>
  );
}
