import { createFileRoute } from "@tanstack/react-router";
import { useDemo } from "@/demo/engine";
import { RecordTable } from "@/components/app/RecordTable";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/_ops/permits")({
  head: () => ({
    meta: [
      { title: "Permits | DhruvSetu" },
      {
        name: "description",
        content: "Environmental and operational permits with conditions, evidence and expiry.",
      },
      { property: "og:title", content: "Permits | DhruvSetu" },
      { property: "og:description", content: "Permit register for the 46th ISEA (synthetic)." },
    ],
  }),
  component: Permits,
});

function Permits() {
  const { state } = useDemo();
  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Permits"
        subtitle="Every permit condition is tied to evidence. P-031 evidence is due 14 Oct."
      />
      <RecordTable rows={state.permits} mono={["Expiry"]} />
    </>
  );
}
