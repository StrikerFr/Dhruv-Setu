import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { personnelService } from "@/demo/services";
import type { Person } from "@/demo/types";
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
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/personnel/")({
  head: () => ({
    meta: [
      { title: "Personnel | DhruvSetu" },
      {
        name: "description",
        content:
          "Deployed personnel with role, assignment, station, clearance and last confirmed location.",
      },
      { property: "og:title", content: "Personnel | DhruvSetu" },
      {
        property: "og:description",
        content: "Personnel accountability for the 46th ISEA (synthetic people).",
      },
    ],
  }),
  component: Personnel,
});

function Personnel() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const c = personnelService.counts(state);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [status, setStatus] = useState("");
  const rows = state.personnel.filter(
    (p) =>
      (!q || `${p.name} ${p.role}`.toLowerCase().includes(q.toLowerCase())) &&
      (!st || p.station === st) &&
      (!status || (p.accounted ? p.status : "UNACCOUNTED") === status),
  );
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Personnel"
        subtitle="Operational information only. Medical records are restricted to the Medical Officer."
      />
      <MetricRow className="mb-8 lg:grid-cols-4">
        <MetricCell label="Deployed" value={c.deployed} />
        <MetricCell label="Station" value={c.station} />
        <MetricCell label="Field" value={c.field} />
        <MetricCell
          label="Unaccounted"
          value={c.unaccounted}
          tone={c.unaccounted ? "red" : "teal"}
        />
      </MetricRow>
      <Panel>
        <Toolbar search={q} onSearch={setQ} placeholder="Name or role">
          <FilterSelect
            label="Station"
            value={st}
            onChange={setSt}
            options={["Bharati", "Maitri"]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={["STATION", "FIELD", "UNACCOUNTED"]}
          />
        </Toolbar>
        <DataTable<Person>
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate({ to: "/personnel/$id", params: { id: r.id } })}
          highlight={(r) => !r.accounted}
          empty={
            <EmptyState
              text="No personnel currently match these filters."
              action={
                <Btn
                  onClick={() => {
                    setQ("");
                    setSt("");
                    setStatus("");
                  }}
                >
                  Clear Filters
                </Btn>
              }
            />
          }
          columns={[
            {
              key: "n",
              header: "Person",
              primary: true,
              render: (r) => <span className="font-medium">{r.name}</span>,
            },
            { key: "r", header: "Role", render: (r) => r.role },
            { key: "a", header: "Assignment", render: (r) => r.assignment },
            { key: "s", header: "Station", render: (r) => r.station },
            { key: "c", header: "Clearance", render: (r) => <StatusBadge status={r.clearance} /> },
            {
              key: "st",
              header: "Status",
              render: (r) => <StatusBadge status={r.accounted ? r.status : "UNACCOUNTED"} />,
            },
            { key: "l", header: "Last confirmed", render: (r) => <Mono>{r.lastConfirmed}</Mono> },
          ]}
        />
      </Panel>
    </>
  );
}
