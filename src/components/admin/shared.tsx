import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { registerMedia } from "@/lib/cms.functions";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type Access = {
  roles: string[]; isSuper: boolean; isAdmin: boolean; canContent: boolean;
  canSubmissions: boolean; canFinance: boolean; isStaff: boolean;
};

export const ROLE_LABELS: Record<string, { label: string; desc: string }> = {
  super_admin: { label: "Super Admin", desc: "Mamlaka yote, pamoja na kuwapa watumiaji majukumu" },
  admin: { label: "Admin", desc: "Maudhui, mipangilio, viungo, mawasilisho na kumbukumbu" },
  editor: { label: "Mhariri wa Machapisho", desc: "Kupakia na kuchapisha habari, matukio, nyaraka na picha" },
  finance: { label: "Fedha", desc: "Kuona muhtasari na sehemu ya fedha" },
  reviewer: { label: "Mkaguzi wa Mawasilisho", desc: "Kusoma na kujibu maoni/hoja za umma" },
};

const LIMITS = { image: 10, video: 100, document: 25 } as const;

export function mediaTypeOf(file: File): "image" | "video" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function uploadFile(file: File, folder = "uploads") {
  const type = mediaTypeOf(file);
  if (file.size > LIMITS[type] * 1024 * 1024) throw new Error(`${file.name}: faili ni kubwa kuliko ${LIMITS[type]}MB`);
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, file.type ? { contentType: file.type } : {});
  if (error) throw new Error(`${file.name}: imeshindikana kupakia`);
  const row = (await registerMedia({
    data: { name: file.name.slice(0, 200), file_path: path, mime_type: file.type || "application/octet-stream", size_bytes: file.size, media_type: type },
  })) as { public_url: string };
  return { url: row.public_url, size: formatSize(file.size), type };
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Confirm({ trigger, title, onConfirm }: { trigger: ReactNode; title: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>Kitendo hiki hakiwezi kurudishwa.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ghairi</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Ndiyo, futa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

export function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "Imeshindikana. Jaribu tena.";
}
