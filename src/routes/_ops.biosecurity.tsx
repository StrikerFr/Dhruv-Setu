import { createFileRoute } from "@tanstack/react-router";
import { useDemo } from "@/demo/engine";
import { RecordTable } from "@/components/app/RecordTable";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/_ops/biosecurity")({
  head: () => ({
    meta: [
      { title: "Biosecurity | DhruvSetu" },
      {
        name: "description",
        content:
          "Biosecurity inspections of clothing, cargo and equipment with evidence and officer.",
      },
      { property: "og:title", content: "Biosecurity | DhruvSetu" },
      { property: "og:description", content: "Biosecurity inspection log (synthetic)." },
    ],
  }),
  component: Biosecurity,
});

function Biosecurity() {
  const { state } = useDemo();
  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Biosecurity"
        subtitle="Inspections prevent non-native species reaching Antarctica."
      />
      <RecordTable rows={state.biosecurity} />
    </>
  );
}
