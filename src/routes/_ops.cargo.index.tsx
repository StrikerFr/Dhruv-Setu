import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDemo } from "@/demo/engine";
import { cargoService } from "@/demo/services";
import type { Cargo } from "@/demo/types";
import { CargoDrawer } from "@/components/app/records";
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

export const Route = createFileRoute("/_ops/cargo/")({
  head: () => ({
    meta: [
      { title: "Cargo Control | DhruvSetu" },
      {
        name: "description",
        content:
          "Track cargo custody from demand to station receipt with exceptions and sync state.",
      },
      { property: "og:title", content: "Cargo Control | DhruvSetu" },
      {
        property: "og:description",
        content: "124 synthetic cargo records with custody, criticality, hazards and sync state.",
      },
    ],
  }),
  component: CargoPage,
});

function CargoPage() {
  const { state } = useDemo();
  const m = cargoService.metrics(state);
  const [q, setQ] = useState("");
  const [f, setF] = useState({
    station: "",
    custody: "",
    crit: "",
    hazard: "",
    exception: "",
    sync: "",
  });
  const [sel, setSel] = useState<string | null>(null);
  const [limit, setLimit] = useState(25);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const rows = useMemo(
    () =>
      state.cargo.filter((c) => {
        const s = q.toLowerCase();
        return (
          (!s ||
            c.id.toLowerCase().includes(s) ||
            c.container.toLowerCase().includes(s) ||
            c.item.toLowerCase().includes(s)) &&
          (!f.station || c.destination === f.station) &&
          (!f.custody || c.custody === f.custody) &&
          (!f.crit || c.criticality === f.crit) &&
          (!f.hazard || (f.hazard === "Hazardous" ? !!c.hazard : !c.hazard)) &&
          (!f.exception ||
            (f.exception === "Open" ? !!c.exception && !c.exceptionResolved : !c.exception)) &&
          (!f.sync || c.sync === f.sync)
        );
      }),
    [state.cargo, q, f],
  );
  const clear = () => {
    setQ("");
    setF({ station: "", custody: "", crit: "", hazard: "", exception: "", sync: "" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Logistics"
        title="Cargo Control"
        subtitle="Track custody from demand to station receipt."
      />
      <MetricRow className="mb-8">
        <MetricCell label="Total cargo" value={m.total} />
        <MetricCell label="In transit" value={m.inTransit} />
        <MetricCell label="At risk" value={m.atRisk} tone={m.atRisk ? "orange" : undefined} />
        <MetricCell
          label="Exceptions"
          value={m.exceptions}
          tone={m.exceptions ? "red" : undefined}
        />
        <MetricCell label="Reconciliation" value={m.reconciliation} />
      </MetricRow>
      <Panel>
        <Toolbar search={q} onSearch={setQ} placeholder="Cargo ID / container / item">
          <FilterSelect label="Expedition" value="" onChange={() => {}} options={["46th ISEA"]} />
          <FilterSelect
            label="Station"
            value={f.station}
            onChange={set("station")}
            options={["Bharati", "Maitri"]}
          />
          <FilterSelect
            label="Custody"
            value={f.custody}
            onChange={set("custody")}
            options={[
              "Goa",
              "Mumbai",
              "Cape Town",
              "Polar Leg",
              "Bharati",
              "Maitri",
              "Unconfirmed",
            ]}
          />
          <FilterSelect
            label="Criticality"
            value={f.crit}
            onChange={set("crit")}
            options={["CRITICAL", "HIGH", "STANDARD"]}
          />
          <FilterSelect
            label="Hazard"
            value={f.hazard}
            onChange={set("hazard")}
            options={["Hazardous", "None"]}
          />
          <FilterSelect
            label="Exception"
            value={f.exception}
            onChange={set("exception")}
            options={["Open", "None"]}
          />
          <FilterSelect
            label="Sync"
            value={f.sync}
            onChange={set("sync")}
            options={["SYNCED", "LOCAL", "CONFLICT"]}
          />
        </Toolbar>
        <p className="mb-3 font-mono text-[12px] text-muted-foreground">{rows.length} records</p>
        <DataTable<Cargo>
          rows={rows.slice(0, limit)}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSel(r.id)}
          highlight={(r) => !!r.exception && !r.exceptionResolved}
          empty={
            <EmptyState
              text="No cargo currently matches these filters."
              action={<Btn onClick={clear}>Clear Filters</Btn>}
            />
          }
          columns={[
            {
              key: "id",
              header: "Cargo ID",
              primary: true,
              render: (r) => <Mono className="font-medium">{r.id}</Mono>,
            },
            {
              key: "it",
              header: "Item",
              render: (r) => <span className="block max-w-[220px] truncate">{r.item}</span>,
            },
            { key: "c", header: "Container", render: (r) => <Mono>{r.container}</Mono> },
            { key: "d", header: "Destination", render: (r) => r.destination },
            {
              key: "cr",
              header: "Criticality",
              render: (r) => <StatusBadge status={r.criticality} />,
            },
            { key: "cu", header: "Custody", render: (r) => r.custody },
            {
              key: "h",
              header: "Hazard",
              render: (r) => r.hazard ?? <span className="text-muted-foreground">—</span>,
            },
            {
              key: "x",
              header: "Exception",
              render: (r) =>
                r.exception ? (
                  <StatusBadge status={r.exceptionResolved ? "RESOLVED" : r.exception} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            },
            { key: "s", header: "Sync", render: (r) => <SyncBadge state={r.sync} /> },
          ]}
        />
        {rows.length > limit && (
          <div className="mt-5 text-center">
            <Btn onClick={() => setLimit((l) => l + 25)}>
              Show more ({rows.length - limit} remaining)
            </Btn>
          </div>
        )}
      </Panel>
      <CargoDrawer id={sel} onClose={() => setSel(null)} />
    </>
  );
}
