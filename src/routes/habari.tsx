import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-shell";
import { ContentListPage } from "@/components/cms-public";

export const Route = createFileRoute("/habari")({
  head: () => ({ meta: [{ title: "Habari na Matukio | Ofisi ya Mbunge" }, { name: "description", content: "Habari, taarifa, mikutano, ziara na matukio ya ofisi." }, { property: "og:title", content: "Habari na Matukio" }, { property: "og:description", content: "Taarifa rasmi na shughuli za ofisi." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <><PageHero eyebrow="Taarifa kwa Umma" title="Habari na Matukio" description="Habari, taarifa, matukio, ziara, mikutano, hotuba na taarifa kwa vyombo vya habari." /><ContentListPage kind="news" /></>,
});
