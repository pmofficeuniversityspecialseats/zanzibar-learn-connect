import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileQuestion, Files, GraduationCap, MessageSquare, Newspaper, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/content-ui";
import { assets, newsItems, opportunities, quickLinks, responsibilityItems } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Mwanzo | Ofisi ya Mbunge wa Vyuo na Vyuo Vikuu Zanzibar" },
    { name: "description", content: "Ofisi rasmi ya uwakilishi, mawasiliano na ufuatiliaji wa masuala ya wanafunzi wa vyuo Zanzibar." },
    { property: "og:title", content: "Ofisi ya Mbunge wa Vyuo na Vyuo Vikuu Zanzibar" },
    { property: "og:description", content: "Uwakilishi, elimu, fursa na ushiriki wa wanafunzi Zanzibar." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: HomePage,
});

const iconMap = { MessageSquare, FileQuestion, Files, Newspaper, GraduationCap, Phone };

function HomePage() {
  return <>
    <section className="relative min-h-[620px] overflow-hidden bg-primary lg:min-h-[680px]">
      <img src={assets.hero} alt="Wawakilishi wakishiriki katika mkutano wa kitaasisi" className="absolute inset-0 size-full object-cover object-center" fetchPriority="high" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-24 pt-24 sm:px-6 lg:min-h-[680px] lg:px-8 lg:pb-28">
        <div className="max-w-4xl text-primary-foreground"><p className="mb-4 inline-block border-l-4 border-gold pl-3 text-xs font-bold uppercase sm:text-sm">Jamhuri ya Muungano wa Tanzania · Zanzibar</p><h1 className="font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">OFISI YA MBUNGE WA VYUO NA VYUO VIKUU ZANZIBAR</h1><p className="mt-6 max-w-3xl text-base leading-7 text-primary-foreground/90 sm:text-xl sm:leading-8">Ofisi rasmi ya uwakilishi, mawasiliano na ufuatiliaji wa masuala yanayohusu wanafunzi wa vyuo na vyuo vikuu Zanzibar.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="gold" size="lg"><Link to="/kuhusu">Kuhusu Ofisi <ArrowRight /></Link></Button><Button asChild variant="institutional" size="lg"><Link to="/mawasiliano">Wasiliana Nasi</Link></Button></div></div>
      </div>
    </section>

    <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Huduma za haraka"><div className="grid border border-border bg-background shadow-institutional sm:grid-cols-2 lg:grid-cols-6">{quickLinks.map((item) => { const Icon = iconMap[item.icon as keyof typeof iconMap]; return <Link to={item.href} key={item.title} className="group flex min-h-32 flex-col justify-between border-b border-r border-border p-5 transition-colors hover:bg-secondary"><Icon className="size-6 text-primary" /><span className="mt-4 text-sm font-bold text-foreground group-hover:text-primary">{item.title}</span></Link>; })}</div></section>

    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8"><div><SectionHeading eyebrow="Kuhusu Ofisi" title="Uwakilishi wenye kusikiliza na kufuatilia" description="Ofisi ni jukwaa la kitaasisi la kupokea hoja, kuimarisha mawasiliano na kufuatilia masuala yanayohusu wanafunzi na taasisi za elimu ya juu Zanzibar." /><div className="grid gap-4 sm:grid-cols-2"><div className="border-l-4 border-primary bg-secondary p-5"><h3 className="font-bold">Dhamira</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Kuimarisha uwakilishi, ushirikishwaji na upatikanaji wa taarifa kwa wanafunzi.</p></div><div className="border-l-4 border-gold bg-gold-soft p-5"><h3 className="font-bold">Maono</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Jamii ya elimu ya juu inayosikilizwa, kushirikishwa na kuunganishwa na fursa.</p></div></div><Button asChild variant="link" className="mt-5 px-0"><Link to="/kuhusu">Soma zaidi kuhusu ofisi <ArrowRight /></Link></Button></div><img src={assets.meeting} alt="Ushirikishwaji wa wadau katika shughuli rasmi" className="aspect-[4/3] size-full object-cover" loading="lazy" /></section>

    <section className="bg-secondary"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Kazi Yetu" title="Kazi na Majukumu" description="Ofisi huwezesha uwakilishi na ushirikishwaji; haina mamlaka ya kiutendaji isipokuwa pale yanapotolewa rasmi na sheria au taratibu husika." action={<Button asChild variant="outline"><Link to="/majukumu">Tazama yote</Link></Button>} /><div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{responsibilityItems.map(([title, text], index) => <article key={title} className="bg-background p-6"><span className="text-sm font-bold text-gold">0{index + 1}</span><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Taarifa" title="Habari na Matukio" description="Taarifa za shughuli za ofisi, mikutano na ushirikishwaji wa wadau." action={<Button asChild variant="outline"><Link to="/habari">Habari zote</Link></Button>} /><div className="grid gap-6 lg:grid-cols-3">{newsItems.map((item) => <article key={item.title} className="border border-border bg-card"><img src={item.image} alt="" className="aspect-video w-full object-cover" loading="lazy" /><div className="p-5"><div className="flex gap-3 text-xs font-semibold text-primary"><span>{item.category}</span><span className="text-muted-foreground">{item.date}</span></div><h3 className="mt-3 font-display text-lg font-bold leading-snug">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p></div></article>)}</div></section>

    <section className="bg-primary text-primary-foreground"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionHeading eyebrow="Elimu na Maendeleo" title="Fursa kwa wanafunzi na vijana" description="Taarifa rasmi za elimu, utafiti, mafunzo, ubunifu na maendeleo zitawekwa hapa baada ya kuthibitishwa." action={<Button asChild variant="gold"><Link to="/fursa">Tazama fursa</Link></Button>} /><div className="grid gap-px bg-primary-foreground/20 sm:grid-cols-2 lg:grid-cols-4">{opportunities.map((item) => <article key={item.title} className="bg-primary p-6"><p className="text-xs font-bold uppercase text-gold">{item.title}</p><h3 className="mt-3 font-display text-xl font-bold">{item.sw}</h3><p className="mt-3 text-sm leading-6 text-primary-foreground/75">{item.description}</p></article>)}</div></div></section>

    <section className="bg-gold-soft"><div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:px-6"><h2 className="font-display text-3xl font-bold">Sauti yako ni muhimu</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Wasilisha hoja, maoni au changamoto yako kupitia njia rasmi. Kila ujumbe hupokelewa na kufuatiliwa kwa mujibu wa taratibu husika.</p><Button asChild className="mt-7" size="lg"><Link to="/shiriki">Shiriki Nasi <ArrowRight /></Link></Button></div></section>
  </>;
}