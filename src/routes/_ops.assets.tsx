import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import type { Asset } from "@/demo/types";
import {
  Btn,
  DataTable,
  Drawer,
  EmptyState,
  FilterSelect,
  KV,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  Tabs,
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/assets")({
  head: () => ({
    meta: [
      { title: "Assets | DhruvSetu" },
      {
        name: "description",
        content:
          "Vehicles, generators, communications and field equipment with maintenance and assignment state.",
      },
      { property: "og:title", content: "Assets | DhruvSetu" },
      { property: "og:description", content: "Asset register for Bharati and Maitri (synthetic)." },
    ],
  }),
  component: Assets,
});

function Assets() {
  const { state } = useDemo();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [sel, setSel] = useState<Asset | null>(null);
  const [tab, setTab] = useState("Overview");
  const rows = state.assets.filter(
    (a) =>
      (!q || `${a.id} ${a.name}`.toLowerCase().includes(q.toLowerCase())) &&
      (!st || a.status === st),
  );
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Assets"
        subtitle={`${state.assets.length} assets across Bharati and Maitri.`}
      />
      <Panel>
        <Toolbar search={q} onSearch={setQ} placeholder="Asset ID or name">
          <FilterSelect
            label="Status"
            value={st}
            onChange={setSt}
            options={["AVAILABLE", "ASSIGNED", "MAINTENANCE", "OUT OF SERVICE", "RETIRED"]}
          />
        </Toolbar>
        <DataTable<Asset>
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(a) => {
            setSel(a);
            setTab("Overview");
          }}
          empty={
            <EmptyState
              text="No assets currently match these filters."
              action={
                <Btn
                  onClick={() => {
                    setQ("");
                    setSt("");
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
              header: "Asset ID",
              primary: true,
              render: (r) => (
                <span>
                  <Mono className="font-medium">{r.id}</Mono>
                  <span className="ml-3 text-muted-foreground">{r.name}</span>
                </span>
              ),
            },
            { key: "t", header: "Type", render: (r) => r.type },
            { key: "s", header: "Station", render: (r) => r.station },
            { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "m", header: "Maintenance", render: (r) => r.maintenance },
            { key: "a", header: "Assignment", render: (r) => r.assignment },
          ]}
        />
      </Panel>
      <Drawer open={!!sel} onClose={() => setSel(null)} eyebrow={sel?.type} title={sel?.id ?? ""}>
        {sel && (
          <>
            <Tabs
              tabs={["Overview", "Assignments", "Maintenance", "Documents", "Audit"]}
              value={tab}
              onChange={setTab}
            />
            {tab === "Overview" && (
              <KV
                items={[
                  ["Name", sel.name],
                  ["Station", sel.station],
                  ["Status", <StatusBadge key="s" status={sel.status} />],
                  ["Assignment", sel.assignment],
                  ["Maintenance", sel.maintenance],
                  ["Hours", `${(parseInt(sel.id.slice(-2)) * 137) % 2400} h`],
                ]}
              />
            )}
            {tab === "Assignments" && (
              <p className="text-[15px] text-ink">
                {sel.assignment === "—"
                  ? "Not currently assigned."
                  : `Assigned to ${sel.assignment} since 08:00 today.`}
              </p>
            )}
            {tab === "Maintenance" && (
              <ul className="space-y-3 text-[14.5px]">
                <li>{sel.maintenance}</li>
                <li className="text-muted-foreground">
                  Last service 02 Oct 2026 · Station Engineer
                </li>
              </ul>
            )}
            {tab === "Documents" && (
              <ul className="space-y-2 text-[14.5px]">
                <li>Operating manual (PDF)</li>
                <li>Service log sheet</li>
              </ul>
            )}
            {tab === "Audit" && (
              <p className="text-[14.5px] text-muted-foreground">
                Status last changed 12 Oct 2026 by Station Engineer (Central Portal · Synced).
              </p>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
