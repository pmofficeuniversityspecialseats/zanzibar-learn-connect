import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, Menu, Phone, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { assets, navItems } from "@/lib/site-data";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { getSiteInfo, recordEvent } from "@/lib/public.functions";
import { SocialIcons } from "@/components/social-icons";

export { useLanguage };

export const siteInfoQuery = { queryKey: ["site-info"], queryFn: () => getSiteInfo(), staleTime: 5 * 60 * 1000 };

function Brand({ compact = false }: { compact?: boolean }) {
  const { tr, language } = useLanguage();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={tr("Mwanzo")}>
      <img src={assets.logo} alt="Nembo rasmi ya Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar" className={compact ? "h-12 w-12 shrink-0 object-contain" : "h-16 w-16 shrink-0 object-contain lg:h-20 lg:w-20"} />
      <p className="max-w-xl text-xs font-bold uppercase leading-tight text-primary-foreground sm:text-sm lg:text-base">
        {language === "en" ? "Office of the MP for Colleges and Universities Zanzibar" : "Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar"}
      </p>
    </Link>
  );
}

function LanguageSwitch() {
  const { language, setLanguage, tr } = useLanguage();
  return (
    <div className="flex items-center border border-primary-foreground/30" role="group" aria-label={tr("Chagua lugha")}>
      <Button variant="ghost" size="sm" aria-pressed={language === "sw"} className={language === "sw" ? "bg-primary-foreground text-primary hover:bg-primary-foreground" : "text-primary-foreground hover:bg-primary-foreground/10"} onClick={() => setLanguage("sw")}>SW</Button>
      <Button variant="ghost" size="sm" aria-pressed={language === "en"} className={language === "en" ? "bg-primary-foreground text-primary hover:bg-primary-foreground" : "text-primary-foreground hover:bg-primary-foreground/10"} onClick={() => setLanguage("en")}>EN</Button>
    </div>
  );
}

function SearchForm({ onDone }: { onDone?: () => void }) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form role="search" className="flex gap-2" onSubmit={(e) => { e.preventDefault(); navigate({ to: "/tafuta", search: { q } }); onDone?.(); }}>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Tafuta habari, nyaraka, matukio...")} aria-label={tr("Tafuta kwenye tovuti")} className="h-10" />
      <Button type="submit" size="icon" aria-label={tr("Tafuta")}><Search /></Button>
    </form>
  );
}

function Header() {
  const { language, tr } = useLanguage();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 shadow-institutional">
      <div className="bg-primary">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Brand compact />
          <div className="hidden items-center gap-3 md:flex"><LanguageSwitch /></div>
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-primary-foreground" aria-label={tr("Tafuta")} onClick={() => setSearchOpen((v) => !v)}><Search /></Button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-primary-foreground" aria-label={tr("Fungua menyu")}><Menu /></Button></SheetTrigger>
              <SheetContent className="w-[88%] overflow-y-auto p-0">
                <SheetHeader className="bg-primary p-5 pr-12 text-left"><SheetTitle className="text-primary-foreground">{tr("Menyu Kuu")}</SheetTitle><SheetDescription className="text-primary-foreground/80">{tr("Kurasa na huduma za ofisi")}</SheetDescription></SheetHeader>
                <div className="p-3"><SearchForm onDone={() => setMenuOpen(false)} /></div>
                <nav className="flex flex-col p-3">
                  {navItems.map((item) => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={`border-b border-border px-3 py-3 text-sm font-semibold ${pathname === item.to ? "text-primary" : "text-foreground"}`}>{tr(item.sw)}</Link>)}
                  <Link to="/shiriki" onClick={() => setMenuOpen(false)} className="mt-4 bg-gold px-4 py-3 text-center text-sm font-bold text-gold-foreground">{tr("Shiriki Nasi")}</Link>
                </nav>
                <div className="flex justify-center bg-primary p-4"><LanguageSwitch /></div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {searchOpen && <div className="border-t border-primary-foreground/20 bg-background px-4 py-3 md:hidden"><SearchForm onDone={() => setSearchOpen(false)} /></div>}
      </div>
      <div className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
          <nav className="flex min-w-0 items-stretch overflow-x-auto">
            {navItems.map((item) => <Link key={item.to} to={item.to} className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition-colors lg:text-sm ${pathname === item.to ? "border-gold text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}>{language === "en" ? tr(item.sw) : item.sw}</Link>)}
          </nav>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label={tr("Tafuta")} onClick={() => setSearchOpen((v) => !v)}><Search /></Button>
        </div>
        {searchOpen && <div className="border-t border-border bg-secondary"><div className="mx-auto max-w-xl px-6 py-3"><SearchForm onDone={() => setSearchOpen(false)} /></div></div>}
      </div>
    </header>
  );
}

function Footer() {
  const { tr, pick, language } = useLanguage();
  const { data } = useQuery(siteInfoQuery);
  const g = data?.general ?? {};
  const columns: [string, [string, string][]][] = [
    ["OFISI", [["Kuhusu Ofisi", "/kuhusu"], ["Mbunge", "/mbunge"], ["Kazi na Majukumu", "/majukumu"], ["Mawasiliano", "/mawasiliano"]]],
    ["TAARIFA", [["Habari", "/habari"], ["Matukio", "/matukio"], ["Nyaraka", "/nyaraka"], ["Shiriki Nasi", "/shiriki"]]],
    ["WANAFUNZI", [["Fursa", "/fursa"], ["Elimu", "/elimu"], ["Miradi na Shughuli", "/miradi"]]],
  ];
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-footer-foreground/20 pb-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Brand />
            <p className="mt-5 max-w-md text-sm leading-6 text-footer-foreground/75">{tr("Jukwaa rasmi la uwakilishi, mawasiliano na ufuatiliaji wa masuala ya wanafunzi na elimu ya juu Zanzibar.")}</p>
            <ul className="mt-5 space-y-2 text-sm text-footer-foreground/80">
              <li className="flex gap-2"><Clock className="size-4 shrink-0 text-gold" />{pick(g.hours_sw, g.hours_en) || (language === "en" ? "Mon–Fri, 08:00–15:30" : "Jumatatu–Ijumaa, 2:00 asubuhi – 9:30 mchana")}</li>
              {g.email && <li className="flex gap-2"><Mail className="size-4 shrink-0 text-gold" /><a href={`mailto:${g.email}`} className="hover:underline">{g.email}</a></li>}
              {g.phone && <li className="flex gap-2"><Phone className="size-4 shrink-0 text-gold" /><a href={`tel:${g.phone}`} className="hover:underline">{g.phone}</a></li>}
            </ul>
            {!!data?.socials.length && <div className="mt-6"><h2 className="mb-3 text-xs font-bold text-gold">{tr("Tufuate")}</h2><SocialIcons items={data.socials} variant="footer" /></div>}
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map(([title, links]) => <div key={title}><h2 className="mb-4 text-xs font-bold text-gold">{tr(title)}</h2><ul className="space-y-2">{links.map(([label, to]) => <li key={label}><Link to={to} className="text-sm text-footer-foreground/75 hover:text-footer-foreground">{tr(label)}</Link></li>)}</ul></div>)}
            <div><h2 className="mb-4 text-xs font-bold text-gold">{tr("LINKS MUHIMU")}</h2><ul className="space-y-2">{(data?.links ?? []).map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-footer-foreground/75 hover:text-footer-foreground">{pick(l.title_sw, l.title_en)}</a></li>)}</ul></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-footer-foreground/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {language === "en" ? "Office of the MP for Colleges and Universities Zanzibar." : "Ofisi ya Mbunge Vyuo na Vyuo Vikuu Zanzibar."}</p>
          <div className="flex flex-wrap gap-4"><Link to="/privacy">{tr("Sera ya Faragha")}</Link><Link to="/privacy">{tr("Ufikivu")}</Link><a href="/sitemap.xml">{tr("Ramani ya Tovuti")}</a><Link to="/admin">Admin</Link></div>
        </div>
      </div>
    </footer>
  );
}

function PageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return;
    recordEvent({ data: { type: "page_view", path: pathname.slice(0, 300) } }).catch(() => undefined);
  }, [pathname]);
  return null;
}

function SkipLink() {
  const { tr } = useLanguage();
  return <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:p-3">{tr("Ruka hadi maudhui")}</a>;
}

export function SiteShell({ children }: { children: ReactNode }) {
  return <LanguageProvider><SkipLink /><PageViewTracker /><Header /><main id="main-content">{children}</main><Footer /></LanguageProvider>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const { tr } = useLanguage();
  return <section className="border-b border-border bg-secondary"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-primary"><ShieldCheck className="size-4 text-gold" />{tr(eyebrow)}</p><h1 className="max-w-4xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">{tr(title)}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{tr(description)}</p></div></section>;
}
