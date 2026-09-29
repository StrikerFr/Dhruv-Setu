import { createFileRoute } from "@tanstack/react-router";
import { useDemo } from "@/demo/engine";
import { RecordTable } from "@/components/app/RecordTable";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/_ops/environment")({
  head: () => ({
    meta: [
      { title: "Environment | DhruvSetu" },
      {
        name: "description",
        content:
          "Environmental events, monitoring and incidents recorded across stations and field camps.",
      },
      { property: "og:title", content: "Environment | DhruvSetu" },
      { property: "og:description", content: "Environmental event log (synthetic)." },
    ],
  }),
  component: Environment,
});

function Environment() {
  const { state } = useDemo();
  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Environment"
        subtitle="Events, monitoring and sampling recorded against location and category."
      />
      <RecordTable rows={state.environment} mono={["Date"]} />
    </>
  );
}
