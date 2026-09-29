import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDemo } from "@/demo/engine";
import type { AuditEvent } from "@/demo/types";
import {
  Btn,
  DataTable,
  EmptyState,
  FilterSelect,
  Mono,
  PageHeader,
  Panel,
  SyncBadge,
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail | DhruvSetu" },
      {
        name: "description",
        content:
          "Append-only audit trail: user, action, record, old and new state, device, source and sync.",
      },
      { property: "og:title", content: "Audit Trail | DhruvSetu" },
      { property: "og:description", content: "Every operational change, traceable (synthetic)." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const { state } = useDemo();
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("");
  const [limit, setLimit] = useState(40);
  const rows = state.audit.filter(
    (a) =>
      (!q || `${a.action} ${a.record} ${a.user}`.toLowerCase().includes(q.toLowerCase())) &&
      (!src || a.source === src),
  );
  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Audit Trail"
        subtitle={`${state.audit.length} entries · append-only · entries are never edited or deleted`}
        actions={
          <Btn
            onClick={() =>
              toast.success("Audit export prepared", {
                description: `${rows.length} entries · CSV (synthetic)`,
              })
            }
          >
            <Download className="size-4" /> Export
          </Btn>
        }
      />
      <Panel data-guide="audit-table">
        <Toolbar search={q} onSearch={setQ} placeholder="Action, record or user">
          <FilterSelect
            label="Source"
            value={src}
            onChange={setSrc}
            options={["Central", "Edge"]}
          />
        </Toolbar>
        <DataTable<AuditEvent>
          rows={rows.slice(0, limit)}
          rowKey={(r) => r.id}
          dense
          empty={
            <EmptyState
              text="No audit entries currently match these filters."
              action={
                <Btn
                  onClick={() => {
                    setQ("");
                    setSrc("");
                  }}
                >
                  Clear Filters
                </Btn>
              }
            />
          }
          columns={[
            { key: "t", header: "Timestamp", render: (r) => <Mono>{r.ts}</Mono> },
            { key: "u", header: "User", render: (r) => r.user },
            {
              key: "a",
              header: "Action",
              primary: true,
              render: (r) => <span className="font-medium">{r.action}</span>,
            },
            { key: "r", header: "Record", render: (r) => <Mono>{r.record}</Mono> },
            {
              key: "o",
              header: "Old state",
              render: (r) => <span className="text-muted-foreground">{r.oldState}</span>,
            },
            { key: "n", header: "New state", render: (r) => r.newState },
            { key: "d", header: "Device", render: (r) => r.device },
            { key: "s", header: "Source", render: (r) => r.source },
            { key: "y", header: "Sync", render: (r) => <SyncBadge state={r.sync} /> },
          ]}
        />
        {rows.length > limit && (
          <div className="mt-5 text-center">
            <Btn onClick={() => setLimit((l) => l + 40)}>Load older entries</Btn>
          </div>
        )}
      </Panel>
    </>
  );
}
