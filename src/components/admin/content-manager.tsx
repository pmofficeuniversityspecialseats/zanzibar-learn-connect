import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, EyeOff, Plus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAdminContent, saveContent, updateContentFlags, deleteContent } from "@/lib/cms.functions";
import { Confirm, Empty, Field, errMsg, uploadFile } from "./shared";

type Kind = "news" | "event" | "document" | "opportunity" | "announcement" | "project";
export const KINDS: { id: Kind; label: string; cats: string[] }[] = [
  { id: "news", label: "Habari", cats: ["Habari", "Taarifa", "Ziara", "Mikutano", "Hotuba", "Press Release"] },
  { id: "event", label: "Matukio", cats: ["Mkutano", "Semina", "Ziara", "Kongamano", "Mahafali"] },
  { id: "document", label: "Nyaraka", cats: ["Ripoti", "Barua Rasmi", "Taarifa", "Hotuba", "Machapisho", "Sera", "Fomu", "Nyinginezo"] },
  { id: "opportunity", label: "Fursa", cats: ["Scholarship", "Internship", "Ajira", "Utafiti", "Ubunifu", "Mafunzo"] },
  { id: "announcement", label: "Matangazo", cats: ["Tangazo", "Taarifa kwa Umma"] },
  { id: "project", label: "Miradi", cats: ["Elimu", "Vijana", "Ubunifu", "Utafiti", "Maendeleo ya Wanafunzi", "Jamii"] },
];

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Imechapishwa", variant: "default" },
  draft: { label: "Rasimu", variant: "secondary" },
  archived: { label: "Imehifadhiwa", variant: "outline" },
};

const toLocal = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);
const toHtml = (t: string) => (!t.trim() || /<\w+/.test(t) ? t : t.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join(""));

function blank(kind: Kind) {
  return {
    kind, title_sw: "", title_en: "", summary_sw: "", summary_en: "", body_sw: "", body_en: "",
    category: KINDS.find((k) => k.id === kind)!.cats[0], image_url: "", video_url: "", document_url: "", file_size: "",
    tags: [] as string[], author: "", location: "", organization: "", deadline: "", event_date: "", project_status: "planned",
    is_featured: false, status: "draft", published_at: "",
  } as any;
}

export function ContentManager() {
  const [kind, setKind] = useState<Kind>("news");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const qc = useQueryClient();
  const key = ["admin-content", kind, q, status, page];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => listAdminContent({ data: { kind, q, status, page } }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-content"] }); qc.invalidateQueries({ queryKey: ["dash"] }); };

  async function flag(id: string, patch: { status?: any; is_featured?: boolean }) {
    try { await updateContentFlags({ data: { id, ...patch } }); toast.success("Imesasishwa"); refresh(); } catch (e) { toast.error(errMsg(e)); }
  }
  async function remove(id: string) {
    try { await deleteContent({ data: { id } }); toast.success("Imefutwa"); refresh(); } catch (e) { toast.error(errMsg(e)); }
  }
  const items = (data?.items ?? []) as any[];
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 15)));

  return (
    <div className="space-y-4">
      <Tabs value={kind} onValueChange={(v) => { setKind(v as Kind); setPage(1); }}>
        <TabsList className="h-auto flex-wrap justify-start">
          {KINDS.map((k) => <TabsTrigger key={k.id} value={k.id}>{k.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tafuta kwa kichwa au kategoria..." className="max-w-xs" />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hali zote</SelectItem>
            <SelectItem value="published">Zilizochapishwa</SelectItem>
            <SelectItem value="draft">Rasimu</SelectItem>
            <SelectItem value="archived">Zilizohifadhiwa</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-auto" onClick={() => setEditing(blank(kind))}><Plus />Ongeza {KINDS.find((k) => k.id === kind)!.label}</Button>
      </div>

      <div className="border border-border bg-background">
        {isLoading ? <Empty>Inapakia...</Empty> : !items.length ? <Empty>Hakuna maudhui hapa bado. Bofya “Ongeza” kuanza.</Empty> : (
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                <div className="size-14 shrink-0 overflow-hidden bg-secondary">{it.image_url && <img src={it.image_url} alt="" className="size-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{it.title_sw}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={STATUS[it.status]?.variant}>{STATUS[it.status]?.label}</Badge>
                    {it.is_featured && <Badge variant="outline" className="border-gold text-gold">Featured</Badge>}
                    {it.source !== "manual" && <Badge variant="outline">{it.source}</Badge>}
                    <span>{it.category}</span>·<span>{new Date(it.published_at ?? it.created_at).toLocaleDateString("sw-TZ")}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" title="Featured" onClick={() => flag(it.id, { is_featured: !it.is_featured })}><Star className={it.is_featured ? "fill-current text-gold" : ""} /></Button>
                  {it.status === "published"
                    ? <Button size="icon" variant="ghost" title="Ondoa kwenye tovuti" onClick={() => flag(it.id, { status: "draft" })}><EyeOff /></Button>
                    : <Button size="icon" variant="ghost" title="Chapisha" onClick={() => flag(it.id, { status: "published" })}><Eye /></Button>}
                  <Button size="icon" variant="ghost" title="Hariri" onClick={() => setEditing({ ...blank(kind), ...Object.fromEntries(Object.entries(it).map(([k, v]) => [k, v ?? ""])) })}><Edit /></Button>
                  <Confirm title="Futa chapisho hili?" onConfirm={() => remove(it.id)} trigger={<Button size="icon" variant="ghost" title="Futa"><Trash2 className="text-destructive" /></Button>} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Nyuma</Button>
          <span>Ukurasa {page} / {pages}</span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Mbele</Button>
        </div>
      )}
      {editing && <ContentForm value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </div>
  );
}

function ContentForm({ value, onClose, onSaved }: { value: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>({ ...value, event_date: toLocal(value.event_date), published_at: toLocal(value.published_at) });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const kind = f.kind as Kind;
  const meta = KINDS.find((k) => k.id === kind)!;

  async function upload(file: File | undefined, target: "image_url" | "document_url") {
    if (!file) return;
    setUploading(target);
    try {
      const r = await uploadFile(file, kind);
      set(target, r.url);
      if (target === "document_url") set("file_size", r.size);
      toast.success("Faili limepakiwa");
    } catch (e) { toast.error(errMsg(e)); } finally { setUploading(null); }
  }

  async function save(nextStatus?: string) {
    if (f.title_sw.trim().length < 2) { toast.error("Weka kichwa cha Kiswahili."); return; }
    setSaving(true);
    try {
      const payload: any = {
        ...f,
        status: nextStatus ?? f.status,
        body_sw: toHtml(f.body_sw), body_en: toHtml(f.body_en),
        tags: typeof f.tags === "string" ? f.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : f.tags,
        event_date: fromLocal(f.event_date), published_at: fromLocal(f.published_at),
      };
      for (const k of ["image_url", "video_url", "document_url", "file_size", "author", "location", "organization", "deadline", "project_status"]) if (!payload[k]) payload[k] = null;
      const allowed = ["id", "kind", "title_sw", "title_en", "summary_sw", "summary_en", "body_sw", "body_en", "category", "image_url", "video_url", "document_url", "file_size", "gallery", "tags", "author", "location", "organization", "deadline", "event_date", "project_status", "is_featured", "status", "published_at"];
      const clean = Object.fromEntries(Object.entries(payload).filter(([k]) => allowed.includes(k)));
      if (!clean.id) delete clean.id;
      if (!Array.isArray(clean.gallery)) clean.gallery = [];
      await saveContent({ data: clean as any });
      toast.success(clean.status === "published" ? "Imechapishwa kwenye tovuti" : "Imehifadhiwa");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? "Hariri" : "Ongeza"} — {meta.label}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kichwa (Kiswahili) *"><Input value={f.title_sw} onChange={(e) => set("title_sw", e.target.value)} /></Field>
          <Field label="Title (English)"><Input value={f.title_en} onChange={(e) => set("title_en", e.target.value)} /></Field>
          <Field label="Muhtasari (Kiswahili)"><Textarea rows={3} value={f.summary_sw} onChange={(e) => set("summary_sw", e.target.value)} /></Field>
          <Field label="Summary (English)"><Textarea rows={3} value={f.summary_en} onChange={(e) => set("summary_en", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Maelezo kamili (Kiswahili)" hint="Acha mstari mtupu kati ya aya."><Textarea rows={7} value={f.body_sw} onChange={(e) => set("body_sw", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Full text (English)"><Textarea rows={5} value={f.body_en} onChange={(e) => set("body_en", e.target.value)} /></Field></div>
          <Field label="Kategoria">
            <Input list={`cats-${kind}`} value={f.category} onChange={(e) => set("category", e.target.value)} />
            <datalist id={`cats-${kind}`}>{meta.cats.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Tagi" hint="Tenganisha kwa koma"><Input value={Array.isArray(f.tags) ? f.tags.join(", ") : f.tags} onChange={(e) => set("tags", e.target.value)} /></Field>

          <Field label="Picha kuu">
            <div className="flex items-center gap-3">
              {f.image_url && <img src={f.image_url} alt="" className="size-14 object-cover" />}
              <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-sm hover:bg-secondary">
                <Upload className="size-4" />{uploading === "image_url" ? "Inapakia..." : "Pakia picha"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "image_url")} />
              </label>
              {f.image_url && <Button size="sm" variant="ghost" onClick={() => set("image_url", "")}>Ondoa</Button>}
            </div>
          </Field>
          {(kind === "news" || kind === "event" || kind === "project") && (
            <Field label="Video ya YouTube (hiari)"><Input placeholder="https://youtube.com/..." value={f.video_url} onChange={(e) => set("video_url", e.target.value)} /></Field>
          )}
          {(kind === "document" || kind === "opportunity" || kind === "announcement") && (
            <Field label="Faili (PDF/DOCX)" hint={f.document_url ? `Faili limeambatishwa ${f.file_size ?? ""}` : "Hadi 25MB"}>
              <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-sm hover:bg-secondary">
                <Upload className="size-4" />{uploading === "document_url" ? "Inapakia..." : f.document_url ? "Badilisha faili" : "Pakia faili"}
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={(e) => upload(e.target.files?.[0], "document_url")} />
              </label>
            </Field>
          )}
          {kind === "news" && <Field label="Mwandishi"><Input value={f.author} onChange={(e) => set("author", e.target.value)} /></Field>}
          {kind === "event" && <Field label="Tarehe na saa ya tukio"><Input type="datetime-local" value={f.event_date} onChange={(e) => set("event_date", e.target.value)} /></Field>}
          {(kind === "event" || kind === "project") && <Field label="Mahali"><Input value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>}
          {kind === "opportunity" && <Field label="Taasisi / Mtoaji"><Input value={f.organization} onChange={(e) => set("organization", e.target.value)} /></Field>}
          {(kind === "opportunity" || kind === "announcement") && <Field label="Mwisho wa kutuma"><Input type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>}
          {kind === "project" && (
            <Field label="Hali ya mradi">
              <Select value={f.project_status || "planned"} onValueChange={(v) => set("project_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="planned">Umepangwa</SelectItem><SelectItem value="ongoing">Unaendelea</SelectItem><SelectItem value="completed">Umekamilika</SelectItem></SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Panga muda wa kuchapisha (hiari)" hint="Ukiacha wazi, itachapishwa mara moja."><Input type="datetime-local" value={f.published_at} onChange={(e) => set("published_at", e.target.value)} /></Field>
          <div className="flex items-center gap-3 pt-6"><Switch checked={!!f.is_featured} onCheckedChange={(v) => set("is_featured", v)} id="feat" /><label htmlFor="feat" className="text-sm">Onyesha kwenye slider ya ukurasa wa mwanzo (Featured)</label></div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>Ghairi</Button>
          <Button variant="outline" disabled={saving || !!uploading} onClick={() => save("draft")}>Hifadhi kama Rasimu</Button>
          <Button disabled={saving || !!uploading} onClick={() => save("published")}>{saving ? "Inahifadhi..." : "Chapisha"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
