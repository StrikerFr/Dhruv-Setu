import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import type { Container } from "@/demo/types";
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
  SyncBadge,
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/containers")({
  head: () => ({
    meta: [
      { title: "Containers | DhruvSetu" },
      { name: "description", content: "Containers, seals, weights, locations and cargo contents." },
      { property: "og:title", content: "Containers | DhruvSetu" },
      { property: "og:description", content: "Container register for the 46th ISEA (synthetic)." },
    ],
  }),
  component: Containers,
});

function Containers() {
  const { state } = useDemo();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [sel, setSel] = useState<Container | null>(null);
  const rows = state.containers.filter(
    (c) => (!q || c.id.toLowerCase().includes(q.toLowerCase())) && (!st || c.status === st),
  );
  const exc = (id: string) =>
    state.cargo.filter((c) => c.container === id && c.exception && !c.exceptionResolved).length;
  const cur = sel ? state.containers.find((c) => c.id === sel.id)! : null;
  const items = cur ? state.cargo.filter((c) => c.container === cur.id) : [];

  return (
    <>
      <PageHeader
        eyebrow="Logistics"
        title="Containers"
        subtitle={`${state.containers.length} containers across Goa, Cape Town, the polar leg and stations.`}
      />
      <Panel>
        <Toolbar search={q} onSearch={setQ} placeholder="Container ID">
          <FilterSelect
            label="Status"
            value={st}
            onChange={setSt}
            options={["SEALED", "IN TRANSIT", "RECEIVED", "INSPECTION"]}
          />
        </Toolbar>
        <DataTable<Container>
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={setSel}
          empty={
            <EmptyState
              text="No containers currently match these filters."
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
              header: "Container ID",
              primary: true,
              render: (r) => <Mono className="font-medium">{r.id}</Mono>,
            },
            { key: "t", header: "Type", render: (r) => r.type },
            {
              key: "w",
              header: "Weight",
              render: (r) => <Mono>{r.weight.toLocaleString()} kg</Mono>,
            },
            { key: "s", header: "Seal", render: (r) => <Mono>{r.seal}</Mono> },
            { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "l", header: "Current location", render: (r) => r.location },
            { key: "m", header: "Manifest", render: (r) => <Mono>{r.manifest}</Mono> },
            {
              key: "e",
              header: "Exceptions",
              render: (r) =>
                exc(r.id) ? (
                  <StatusBadge status="OPEN" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            },
          ]}
        />
      </Panel>
      <Drawer open={!!cur} onClose={() => setSel(null)} eyebrow="Container" title={cur?.id ?? ""}>
        {cur && (
          <div className="space-y-6">
            <KV
              items={[
                ["Type", cur.type],
                ["Seal", cur.seal],
                ["Status", <StatusBadge key="s" status={cur.status} />],
                ["Location", cur.location],
                ["Manifest", cur.manifest],
                ["Weight", `${cur.weight} kg`],
              ]}
            />
            <div>
              <p className="eyebrow mb-3 text-muted-foreground">Cargo inside · {items.length}</p>
              <ul className="divide-y divide-hairline/70 border-y border-hairline/70">
                {items.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/cargo/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-surface"
                    >
                      <span className="min-w-0">
                        <Mono className="font-medium text-navy">{c.id}</Mono>
                        <span className="ml-3 truncate text-[14px] text-ink">{c.item}</span>
                      </span>
                      <span className="flex gap-1.5">
                        {c.exception && !c.exceptionResolved && (
                          <StatusBadge status={c.exception} />
                        )}
                        <SyncBadge state={c.sync} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
