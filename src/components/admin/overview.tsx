import { useQuery } from "@tanstack/react-query";
import { Eye, Download, FileText, Image, Inbox, Newspaper, PenLine, Star } from "lucide-react";
import { getDashboard } from "@/lib/cms.functions";
import { Panel, Empty } from "./shared";

const TABLES: Record<string, string> = { content_items: "Maudhui", media_assets: "Media", slider_items: "Slider", important_links: "Viungo", social_links: "Mitandao", user_roles: "Majukumu", public_submissions: "Mawasilisho" };
const ACTIONS: Record<string, string> = { INSERT: "Imeongezwa", UPDATE: "Imebadilishwa", DELETE: "Imefutwa" };

export function Overview({ go }: { go: (tab: string) => void }) {
  const { data, isLoading, error } = useQuery({ queryKey: ["dash"], queryFn: () => getDashboard() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Inapakia takwimu...</p>;
  if (error || !data) return <Empty>Imeshindikana kupakia muhtasari.</Empty>;
  const s = data.stats;
  const cards = [
    { t: "Habari zote", n: s.totalNews, I: Newspaper, tab: "content" },
    { t: "Zilizochapishwa", n: s.publishedNews, I: FileText, tab: "content" },
    { t: "Rasimu", n: s.draftNews, I: PenLine, tab: "content" },
    { t: "Nyaraka", n: s.totalDocs, I: FileText, tab: "content" },
    { t: "Media", n: s.media, I: Image, tab: "media" },
    { t: "Featured", n: s.featured, I: Star, tab: "content" },
    { t: "Mawasilisho mapya", n: s.newSubs, I: Inbox, tab: "submissions" },
    { t: "Kutazamwa (siku 30)", n: s.views, I: Eye, tab: "overview" },
    { t: "Vipakuliwa (siku 30)", n: s.downloads, I: Download, tab: "overview" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <button key={c.t} onClick={() => go(c.tab)} className="border border-border bg-background p-4 text-left transition-colors hover:border-primary">
            <c.I className="size-5 text-primary" />
            <p className="mt-3 text-2xl font-bold">{c.n}</p>
            <p className="text-xs text-muted-foreground">{c.t}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Shughuli za karibuni">
          {data.activity.length ? (
            <ul className="divide-y divide-border text-sm">
              {data.activity.map((a: any) => (
                <li key={a.id} className="flex justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate"><strong>{ACTIONS[a.action] ?? a.action}</strong> · {TABLES[a.table] ?? a.table} {a.label && `— ${a.label}`}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(a.at).toLocaleString("sw-TZ")}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Hakuna shughuli bado.</Empty>}
        </Panel>
        <Panel title="Kurasa zinazotembelewa zaidi (siku 30)">
          {data.topPages.length ? (
            <ul className="divide-y divide-border text-sm">
              {data.topPages.map((p: any) => <li key={p.path} className="flex justify-between py-2.5"><span>{p.path}</span><strong>{p.n}</strong></li>)}
            </ul>
          ) : <Empty>Hakuna takwimu bado.</Empty>}
        </Panel>
        <Panel title="Machapisho yanayosomwa zaidi">
          {data.topViewed.length ? <ul className="divide-y divide-border text-sm">{data.topViewed.map((p: any, i: number) => <li key={i} className="flex justify-between gap-3 py-2.5"><span className="truncate">{p.title}</span><strong>{p.n}</strong></li>)}</ul> : <Empty>Hakuna takwimu bado.</Empty>}
        </Panel>
        <Panel title="Nyaraka zinazopakuliwa zaidi">
          {data.topDownloads.length ? <ul className="divide-y divide-border text-sm">{data.topDownloads.map((p: any, i: number) => <li key={i} className="flex justify-between gap-3 py-2.5"><span className="truncate">{p.title}</span><strong>{p.n}</strong></li>)}</ul> : <Empty>Hakuna takwimu bado.</Empty>}
        </Panel>
      </div>
    </div>
  );
}
