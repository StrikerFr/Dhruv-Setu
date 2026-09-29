import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { incidentService } from "@/demo/services";
import type { Incident } from "@/demo/types";
import {
  Btn,
  DataTable,
  EmptyState,
  FilterSelect,
  MetricCell,
  MetricRow,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/incidents/")({
  head: () => ({
    meta: [
      { title: "Incidents | DhruvSetu" },
      {
        name: "description",
        content: "Active and resolved incidents with severity, acknowledgement and sync state.",
      },
      { property: "og:title", content: "Incidents | DhruvSetu" },
      { property: "og:description", content: "Safety and response register (synthetic)." },
    ],
  }),
  component: Incidents,
});

function Incidents() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const m = incidentService.metrics(state);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("");
  const rows = state.incidents.filter(
    (i) =>
      (!q || `${i.id} ${i.type} ${i.location}`.toLowerCase().includes(q.toLowerCase())) &&
      (!sev || i.severity === sev),
  );
  return (
    <>
      <PageHeader
        eyebrow="Safety & Response"
        title="Incidents"
        subtitle="P0 incidents are delivered before any other traffic, online or offline."
      />
      <MetricRow className="mb-8 lg:grid-cols-4">
        <MetricCell label="Active" value={m.active} />
        <MetricCell
          label="Acknowledgement required"
          value={m.ackRequired + m.local}
          tone={m.ackRequired + m.local ? "red" : "teal"}
        />
        <MetricCell label="Responding" value={m.responding} />
        <MetricCell label="Resolved today" value={m.resolvedToday} />
      </MetricRow>
      <Panel data-guide="incidents-table">
        <Toolbar search={q} onSearch={setQ} placeholder="Incident, type or location">
          <FilterSelect
            label="Severity"
            value={sev}
            onChange={setSev}
            options={["P0", "P1", "P2"]}
          />
        </Toolbar>
        <DataTable<Incident>
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate({ to: "/incidents/$id", params: { id: r.id } })}
          highlight={(r) => r.status === "ACK REQUIRED" || r.status === "LOCAL"}
          empty={
            <EmptyState
              text="No incidents currently match these filters."
              action={
                <Btn
                  onClick={() => {
                    setQ("");
                    setSev("");
                  }}
                >
                  Clear Filters
                </Btn>
              }
            />
          }
          columns={[
            {
              key: "i",
              header: "Incident",
              primary: true,
              render: (r) => (
                <span>
                  <Mono className="font-medium">{r.id}</Mono>
                  <span className="ml-3">{r.type}</span>
                </span>
              ),
            },
            { key: "s", header: "Severity", render: (r) => <StatusBadge status={r.severity} /> },
            { key: "l", header: "Location", render: (r) => r.location },
            { key: "r", header: "Reported", render: (r) => <Mono>{r.reported}</Mono> },
            { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "y", header: "Sync", render: (r) => <SyncBadge state={r.sync} /> },
          ]}
        />
      </Panel>
    </>
  );
}
