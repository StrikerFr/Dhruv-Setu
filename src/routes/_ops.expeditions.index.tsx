import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDemo } from "@/demo/engine";
import { readinessService } from "@/demo/services";
import type { Expedition } from "@/demo/types";
import {
  Btn,
  DataTable,
  EmptyState,
  FilterSelect,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/expeditions/")({
  head: () => ({
    meta: [
      { title: "Expeditions | DhruvSetu" },
      {
        name: "description",
        content:
          "All Indian Scientific Expeditions to Antarctica tracked in DhruvSetu (synthetic demo data).",
      },
      { property: "og:title", content: "Expeditions | DhruvSetu" },
      {
        property: "og:description",
        content: "Expedition register with readiness, blockers and cargo cutoffs.",
      },
    ],
  }),
  component: Expeditions,
});

function Expeditions() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [season, setSeason] = useState("");
  const rd = readinessService.summary(state).pct;
  const rows = state.expeditions.filter(
    (e) =>
      (!q || e.name.toLowerCase().includes(q.toLowerCase())) &&
      (!status || e.status === status) &&
      (!season || e.season === season),
  );
  return (
    <>
      <PageHeader
        eyebrow="Expedition"
        title="Expeditions"
        subtitle="Every season, one operational record."
        actions={
          <Btn
            variant="primary"
            onClick={() =>
              toast("Expedition creation is disabled in the simulation", {
                description:
                  "The 47th ISEA planning record shows what a new expedition looks like.",
              })
            }
          >
            <Plus className="size-4" /> Create Expedition
          </Btn>
        }
      />
      <Panel>
        <Toolbar search={q} onSearch={setQ} placeholder="Search expeditions">
          <FilterSelect
            label="Season"
            value={season}
            onChange={setSeason}
            options={state.expeditions.map((e) => e.season)}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={["ACTIVE", "PLANNING", "CLOSED"]}
          />
        </Toolbar>
        <DataTable<Expedition>
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate({ to: "/expeditions/$id", params: { id: r.slug } })}
          empty={
            <EmptyState
              text="No expeditions currently match these filters."
              action={
                <Btn
                  onClick={() => {
                    setQ("");
                    setStatus("");
                    setSeason("");
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
              header: "Expedition",
              primary: true,
              render: (r) => <span className="font-semibold">{r.name}</span>,
            },
            { key: "s", header: "Season", render: (r) => r.season },
            { key: "st", header: "Stations", render: (r) => r.stations },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "r",
              header: "Readiness",
              render: (r) => (
                <Mono>
                  {r.status === "ACTIVE" ? `${rd}%` : r.status === "CLOSED" ? "100%" : "12%"}
                </Mono>
              ),
            },
            { key: "b", header: "Blockers", render: (r) => r.blockers },
            { key: "c", header: "Cargo cutoff", render: (r) => r.cutoff },
            { key: "o", header: "Owner", render: (r) => r.owner },
          ]}
        />
      </Panel>
    </>
  );
}
