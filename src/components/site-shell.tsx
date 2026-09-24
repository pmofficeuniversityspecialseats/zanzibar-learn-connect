import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShieldCheck } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { assets, navItems } from "@/lib/site-data";

type Language = "sw" | "en";
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: "sw", setLanguage: () => undefined });
export const useLanguage = () => useContext(LanguageContext);

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Mwanzo">
      <img src={assets.logo} alt="Nembo rasmi ya Ofisi ya Mbunge wa Vyuo na Vyuo Vikuu Zanzibar" className={compact ? "h-12 w-12 shrink-0 object-contain" : "h-16 w-16 shrink-0 object-contain lg:h-20 lg:w-20"} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-gold sm:text-xs">Ofisi Rasmi</p>
        <p className="max-w-xl text-xs font-bold leading-tight text-primary-foreground sm:text-sm lg:text-lg">OFISI YA MBUNGE WA VYUO NA VYUO VIKUU ZANZIBAR</p>
      </div>
    </Link>
  );
}

function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center border border-primary-foreground/30" aria-label="Chagua lugha">
      <Button variant="ghost" size="sm" className={language === "sw" ? "bg-primary-foreground text-primary hover:bg-primary-foreground" : "text-primary-foreground hover:bg-primary-foreground/10"} onClick={() => setLanguage("sw")}>SW</Button>
      <Button variant="ghost" size="sm" className={language === "en" ? "bg-primary-foreground text-primary hover:bg-primary-foreground" : "text-primary-foreground hover:bg-primary-foreground/10"} onClick={() => setLanguage("en")}>EN</Button>
    </div>
  );
}

function Header() {
  const { language } = useLanguage();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <header className="sticky top-0 z-40 shadow-institutional">
      <div className="bg-primary">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Brand compact />
          <div className="hidden items-center gap-3 md:flex"><LanguageSwitch /></div>
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-primary-foreground" aria-label="Tafuta"><Search /></Button>
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-primary-foreground" aria-label="Fungua menyu"><Menu /></Button></SheetTrigger>
              <SheetContent className="w-[88%] p-0">
                <SheetHeader className="bg-primary p-5 pr-12 text-left"><SheetTitle className="text-primary-foreground">Menyu Kuu</SheetTitle><SheetDescription className="text-primary-foreground/80">Kurasa na huduma za ofisi</SheetDescription></SheetHeader>
                <nav className="flex flex-col p-3">
                  {navItems.map((item) => <Link key={item.to} to={item.to} className={`border-b border-border px-3 py-3 text-sm font-semibold ${pathname === item.to ? "text-primary" : "text-foreground"}`}>{item[language]}</Link>)}
                  <Link to="/shiriki" className="mt-4 bg-gold px-4 py-3 text-center text-sm font-bold text-gold-foreground">Shiriki Nasi</Link>
                </nav>
                <div className="px-6"><LanguageSwitch /></div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          <nav className="flex min-w-0 items-stretch overflow-x-auto">
            {navItems.map((item) => <Link key={item.to} to={item.to} className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition-colors lg:text-sm ${pathname === item.to ? "border-gold text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}>{item[language]}</Link>)}
          </nav>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Tafuta"><Search /></Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const columns = [
    ["OFISI", ["Kuhusu Ofisi", "Mbunge", "Kazi na Majukumu", "Mawasiliano"]],
    ["TAARIFA", ["Habari", "Matukio", "Nyaraka", "Hotuba"]],
    ["WANAFUNZI", ["Fursa", "Elimu", "Ubunifu", "Utafiti"]],
    ["LINKS MUHIMU", ["Baraza la Wawakilishi Zanzibar", "Serikali ya Zanzibar", "Taasisi za Elimu ya Juu"]],
  ] as const;
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-footer-foreground/20 pb-10 lg:grid-cols-[1.2fr_2fr]">
          <div><Brand /><p className="mt-5 max-w-md text-sm leading-6 text-footer-foreground/75">Jukwaa rasmi la uwakilishi, mawasiliano na ufuatiliaji wa masuala ya wanafunzi na elimu ya juu Zanzibar.</p></div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">{columns.map(([title, links]) => <div key={title}><h2 className="mb-4 text-xs font-bold text-gold">{title}</h2><ul className="space-y-2">{links.map((link) => <li key={link} className="text-sm text-footer-foreground/75">{link}</li>)}</ul></div>)}</div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-footer-foreground/65 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Ofisi ya Mbunge wa Vyuo na Vyuo Vikuu Zanzibar.</p><div className="flex flex-wrap gap-4"><span>Sera ya Faragha</span><span>Ufikivu</span><span>Ramani ya Tovuti</span></div></div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("sw");
  return <LanguageContext.Provider value={{ language, setLanguage }}><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:p-3">Ruka hadi maudhui</a><Header /><main id="main-content">{children}</main><Footer /></LanguageContext.Provider>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="border-b border-border bg-secondary"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-primary"><ShieldCheck className="size-4 text-gold" />{eyebrow}</p><h1 className="max-w-4xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p></div></section>;
}