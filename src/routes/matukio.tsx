import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-shell";
import { ContentListPage } from "@/components/cms-public";

export const Route = createFileRoute("/matukio")({
  head: () => ({ meta: [{ title: "Matukio | Ofisi ya Mbunge" }, { name: "description", content: "Ratiba na kumbukumbu za matukio rasmi ya ofisi." }, { property: "og:title", content: "Matukio" }, { property: "og:description", content: "Mikutano, ziara na shughuli rasmi." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <><PageHero eyebrow="Ratiba" title="Matukio" description="Ratiba na kumbukumbu za mikutano, ziara na shughuli rasmi." /><ContentListPage kind="event" /></>,
});
