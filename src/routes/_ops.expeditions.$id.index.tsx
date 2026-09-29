import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useDemo } from "@/demo/engine";
import { cargoService, expeditionService, readinessService } from "@/demo/services";
import { GateGrid, GateDrawer, RouteMap } from "@/components/app/records";
import { LifecycleTimeline } from "@/components/app/lifecycle";
import {
  btn,
  Btn,
  DataTable,
  KV,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
  Tabs,
} from "@/components/app/ui";
import type { Gate } from "@/demo/types";

export const Route = createFileRoute("/_ops/expeditions/$id/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id.replace(/-/g, " ").toUpperCase()} | Expedition | DhruvSetu` },
      {
        name: "description",
        content:
          "Expedition overview: objective, stations, personnel, cargo, risks and decision log.",
      },
      { property: "og:title", content: `${params.id} | DhruvSetu expedition` },
      { property: "og:description", content: "Expedition operational overview (synthetic data)." },
    ],
  }),
  component: ExpeditionDetail,
  notFoundComponent: () => <p className="text-muted-foreground">Expedition not found.</p>,
});

const TABS = [
  "Overview",
  "Timeline",
  "Readiness",
  "Personnel",
  "Cargo",
  "Stations",
  "Assets",
  "Risks",
  "Decision Log",
  "Closeout",
];

function ExpeditionDetail() {
  const { id } = Route.useParams();
  const { state } = useDemo();
  const e = expeditionService.bySlug(state, id);
  const [tab, setTab] = useState("Overview");
  const [gate, setGate] = useState<Gate | null>(null);
  if (!e) throw notFound();
  const rd = readinessService.summary(state);
  const blockers = state.gates.filter((g) => g.blocker);

  return (
    <>
      <PageHeader
        eyebrow="Expedition"
        title={e.name}
        subtitle={`${e.season} · ${e.stations}`}
        badges={<StatusBadge status={e.status} />}
        actions={
          <>
            <Btn
              onClick={() => toast("Edits require an approved change request in the simulation.")}
            >
              Edit
            </Btn>
            <Btn
              onClick={() =>
                toast.success("Expedition summary exported", {
                  description: "46th-ISEA-summary.pdf (synthetic)",
                })
              }
            >
              Export
            </Btn>
            <Link to="/expeditions/$id/readiness" params={{ id }} className={btn("primary")}>
              Open Readiness
            </Link>
          </>
        }
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Overview" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Panel title="Mission">
              <p className="mb-6 max-w-2xl text-[15.5px] leading-relaxed text-ink">{e.objective}</p>
              <KV
                cols={4}
                items={[
                  ["Season", e.season],
                  ["Start", e.start],
                  ["End", e.end],
                  ["Stations", e.stations],
                  ["Expedition leader", e.leader],
                  ["Personnel", String(state.personnel.length)],
                  ["Cargo", String(state.cargo.length)],
                  ["Active risks", String(blockers.length + 2)],
                ]}
              />
            </Panel>
            <Panel title="Blockers" eyebrow={`${blockers.length} open`}>
              {blockers.length ? (
                <ul className="divide-y divide-hairline/70">
                  {blockers.map((g) => (
                    <li key={g.id}>
                      <button
                        onClick={() => setGate(g)}
                        className="flex w-full items-center justify-between gap-4 py-3.5 text-left hover:bg-surface"
                      >
                        <span>
                          <span className="block font-medium text-ink">{g.blocker}</span>
                          <span className="text-[13px] text-muted-foreground">
                            Gate {g.n} · {g.name} · {g.owner} · due {g.due}
                          </span>
                        </span>
                        <StatusBadge status={readinessService.gateStatus(g)} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] text-teal">✓ No open blockers.</p>
              )}
            </Panel>
          </div>
          <Panel title="Operational route">
            <RouteMap />
          </Panel>
        </div>
      )}
      {tab === "Timeline" && (
        <Panel>
          <LifecycleTimeline />
        </Panel>
      )}
      {tab === "Readiness" && (
        <Panel title={`${rd.pct}% · ${rd.done} / ${rd.total} requirements`}>
          <GateGrid onOpen={setGate} />
        </Panel>
      )}
      {tab === "Personnel" && (
        <Panel
          title={`${state.personnel.length} deployed`}
          action={
            <Link to="/personnel" className={btn("ghost", "sm")}>
              Open Personnel
            </Link>
          }
        >
          <DataTable
            rows={state.personnel.slice(0, 10)}
            rowKey={(r) => r.id}
            columns={[
              { key: "n", header: "Person", render: (r) => r.name },
              { key: "r", header: "Role", render: (r) => r.role },
              { key: "s", header: "Station", render: (r) => r.station },
              {
                key: "st",
                header: "Status",
                render: (r) => <StatusBadge status={r.accounted ? r.status : "UNACCOUNTED"} />,
              },
            ]}
          />
        </Panel>
      )}
      {tab === "Cargo" && (
        <Panel
          title="Cargo with open exceptions"
          action={
            <Link to="/cargo" className={btn("ghost", "sm")}>
              Open Cargo Control
            </Link>
          }
        >
          <DataTable
            rows={cargoService.openExceptions(state)}
            rowKey={(r) => r.id}
            columns={[
              {
                key: "i",
                header: "Cargo",
                render: (r) => (
                  <Link
                    to="/cargo/$id"
                    params={{ id: r.id }}
                    className="font-mono font-medium text-navy hover:underline"
                  >
                    {r.id}
                  </Link>
                ),
              },
              { key: "it", header: "Item", render: (r) => r.item },
              {
                key: "e",
                header: "Exception",
                render: (r) => <StatusBadge status={r.exception!} />,
              },
              { key: "s", header: "Sync", render: (r) => <SyncBadge state={r.sync} /> },
            ]}
          />
        </Panel>
      )}
      {tab === "Stations" && (
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ["Bharati", "Primary · Larsemann Hills · 69°S", 36],
            ["Maitri", "Secondary · Schirmacher Oasis · 70°S", 6],
          ].map(([n, d, p]) => (
            <Panel key={n as string} title={n as string}>
              <p className="text-[14px] text-muted-foreground">{d}</p>
              <p className="mt-4 text-[32px] font-semibold text-ink">
                {p}
                <span className="ml-2 text-[14px] font-normal text-muted-foreground">
                  personnel
                </span>
              </p>
            </Panel>
          ))}
        </div>
      )}
      {tab === "Assets" && (
        <Panel
          title="Assets"
          action={
            <Link to="/assets" className={btn("ghost", "sm")}>
              Open Assets
            </Link>
          }
        >
          <DataTable
            rows={state.assets.slice(0, 8)}
            rowKey={(r) => r.id}
            columns={[
              { key: "i", header: "Asset", render: (r) => <Mono>{r.id}</Mono> },
              { key: "t", header: "Type", render: (r) => r.type },
              { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        </Panel>
      )}
      {tab === "Risks" && (
        <Panel title="Risk register">
          <DataTable
            rows={[
              {
                id: "R-07",
                risk: "Hazardous cargo declaration incomplete",
                l: "HIGH",
                o: "Logistics Officer",
              },
              {
                id: "R-11",
                risk: "Maitri edge node connectivity",
                l: "ATTENTION",
                o: "IT Officer",
              },
              {
                id: "R-03",
                risk: "Spare parts cover below 14 days",
                l: "HIGH",
                o: "Station Engineer",
              },
              {
                id: "R-14",
                risk: "Katabatic wind windows for field sorties",
                l: "ATTENTION",
                o: "Field Guide",
              },
            ]}
            rowKey={(r) => r.id}
            columns={[
              { key: "i", header: "Risk", render: (r) => <Mono>{r.id}</Mono> },
              { key: "r", header: "Description", render: (r) => r.risk },
              { key: "l", header: "Level", render: (r) => <StatusBadge status={r.l} /> },
              { key: "o", header: "Owner", render: (r) => r.o },
            ]}
          />
        </Panel>
      )}
      {tab === "Decision Log" && (
        <Panel title="Decision log">
          <ol className="space-y-4">
            {[
              [
                "12 Oct",
                "Use MV Southern Tern for Voyage 2; MV Polar Arc as contingency.",
                "Expedition Leader",
              ],
              [
                "09 Oct",
                "Field Camp 08 sorties limited to 8 persons with hourly check-ins.",
                "Operations Controller",
              ],
              [
                "04 Oct",
                "Class 9 cargo to travel in dedicated half-height container.",
                "Logistics Officer",
              ],
            ].map(([d, t, by]) => (
              <li key={d} className="flex gap-5 border-b border-hairline/60 pb-4">
                <Mono className="w-16 text-muted-foreground">{d}</Mono>
                <span>
                  <span className="block text-ink">{t}</span>
                  <span className="text-[13px] text-muted-foreground">{by}</span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      )}
      {tab === "Closeout" && (
        <Panel title="Closeout">
          <p className="text-[15px] text-muted-foreground">
            Closeout begins after the last field sortie. Backhaul, waste closure, asset
            reconciliation and the post-activity report are tracked in gate 06.
          </p>
          <div className="mt-5">
            <StatusBadge status="NOT STARTED" />
          </div>
        </Panel>
      )}
      <GateDrawer gate={gate} onClose={() => setGate(null)} />
    </>
  );
}
