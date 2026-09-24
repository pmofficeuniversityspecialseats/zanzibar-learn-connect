import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0">{eyebrow && <p className="mb-2 text-xs font-bold uppercase text-gold">{eyebrow}</p>}<h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}</div>{action}</div>;
}

export function SearchBar({ placeholder = "Tafuta...", value, onChange }: { placeholder?: string; value: string; onChange: (value: string) => void }) {
  return <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 pl-10" /></div>;
}

export function PlaceholderNotice({ children }: { children: ReactNode }) {
  return <div className="border-l-4 border-gold bg-gold-soft px-4 py-3 text-sm text-foreground"><strong>Inasubiri uthibitisho:</strong> {children}</div>;
}