import { createFileRoute } from "@tanstack/react-router";
import { LifecycleTimeline } from "@/components/app/lifecycle";
import { PageHeader, Panel } from "@/components/app/ui";

export const Route = createFileRoute("/_ops/timeline")({
  head: () => ({
    meta: [
      { title: "Expedition Timeline | DhruvSetu" },
      { name: "description", content: "46th ISEA lifecycle from mission scope to closeout." },
      { property: "og:title", content: "Expedition Timeline | DhruvSetu" },
      {
        property: "og:description",
        content: "Lifecycle stages and current position of the 46th ISEA.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHeader
        eyebrow="46th ISEA"
        title="Timeline"
        subtitle="Expedition lifecycle: mission scope through closeout."
      />
      <Panel>
        <LifecycleTimeline />
      </Panel>
    </>
  ),
});
