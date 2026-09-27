import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-shell";
import { ContentListPage } from "@/components/cms-public";

export const Route = createFileRoute("/nyaraka")({
  head: () => ({ meta: [{ title: "Nyaraka | Ofisi ya Mbunge" }, { name: "description", content: "Maktaba ya hotuba, taarifa, ripoti, miongozo na machapisho rasmi." }, { property: "og:title", content: "Maktaba ya Nyaraka" }, { property: "og:description", content: "Tafuta na pakua nyaraka rasmi za ofisi." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <><PageHero eyebrow="Maktaba ya Kidijitali" title="Nyaraka" description="Tafuta nyaraka kwa kichwa, aina na mwaka. Hakikisho na upakuaji utawezeshwa kwa kila nyaraka rasmi." /><ContentListPage kind="document" layout="list" /></>,
});
