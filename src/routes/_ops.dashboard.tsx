import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Compass, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import {
  cargoService,
  incidentService,
  personnelService,
  readinessService,
  syncService,
} from "@/demo/services";
import type { Cargo, Gate } from "@/demo/types";
import {
  CargoDrawer,
  GateDrawer,
  GateGrid,
  InventoryBars,
  RouteMap,
} from "@/components/app/records";
import { useShellUI } from "@/components/app/overlays";
import { Mark } from "@/components/app/Shell";
import {
  btn,
  Btn,
  DataTable,
  Metric,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
} from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center | DhruvSetu" },
      {
        name: "description",
        content:
          "46th ISEA command center: readiness, cargo, personnel, incidents and synchronization in one operational view.",
      },
      { property: "og:title", content: "Command Center | DhruvSetu" },
      {
        property: "og:description",
        content: "Live operational picture for the 46th ISEA at Bharati Station (simulation).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type Item = { label: string; sub: string; to: string };

function useAttention() {
  const { state } = useDemo();
  const critical: Item[] = [];
  const attention: Item[] = [];
  const upcoming: Item[] = [];
  cargoService
    .openExceptions(state)
    .filter((c) => c.criticality === "CRITICAL" || c.exception !== "CUSTOMS HOLD")
    .slice(0, 2)
    .forEach((c) =>
      critical.push({
        label: `Cargo ${c.id} ${c.exception?.toLowerCase()}`,
        sub: `${c.item} · ${c.custody}`,
        to: `/cargo/${c.id}`,
      }),
    );
  state.sorties
    .filter((s) => s.status === "OVERDUE")
    .forEach((s) =>
      critical.push({
        label: `${s.team} overdue`,
        sub: `${s.id} · missed ${s.nextCheckIn.replace(" (missed)", "")} check-in`,
        to: `/sorties/${s.id}`,
      }),
    );
  state.incidents
    .filter((i) => i.status === "ACK REQUIRED" || i.status === "LOCAL")
    .forEach((i) =>
      critical.push({
        label: `${i.id} ${i.status === "LOCAL" ? "awaiting delivery" : "needs acknowledgement"}`,
        sub: `${i.type} · ${i.location}`,
        to: `/incidents/${i.id}`,
      }),
    );
  state.edgeNodes
    .filter((n) => n.state !== "CONNECTED")
    .forEach((n) =>
      critical.push({
        label: `${n.name} ${n.state.toLowerCase()}`,
        sub: `Last sync ${n.lastSync} IST`,
        to: "/sync",
      }),
    );
  const g3 = state.gates.find((g) => g.id === "g3");
  if (g3?.blocker)
    attention.push({
      label: "Permit P-031 evidence due",
      sub: "Waste management plan · 14 Oct",
      to: "/permits",
    });
  const g4 = state.gates.find((g) => g.id === "g4");
  if (g4?.blocker)
    attention.push({
      label: "C-128 hazardous declaration",
      sub: "Blocks Cargo & Customs gate",
      to: "/expeditions/46th-isea/readiness",
    });
  attention.push({
    label: "Spare parts below threshold",
    sub: "9 days of cover · 4 lines",
    to: "/inventory",
  });
  state.conflicts
    .filter((c) => c.status === "REVIEW REQUIRED")
    .forEach((c) =>
      attention.push({
        label: `Conflict ${c.id} on ${c.record}`,
        sub: `${c.field}: server ${c.server} vs edge ${c.edge}`,
        to: "/conflicts",
      }),
    );
  upcoming.push({
    label: "Cargo cutoff 18 Oct",
    sub: "Manifests for Voyage 2 lock",
    to: "/manifests",
  });
  const planned = state.sorties.find((s) => s.status === "PLANNED");
  if (planned)
    upcoming.push({
      label: `Sortie ${planned.id} departure`,
      sub: `${planned.team} · ${planned.departure}`,
      to: `/sorties/${planned.id}`,
    });
  upcoming.push({
    label: "Vessel departs Cape Town",
    sub: "MV Southern Tern · 20 Oct",
    to: "/timeline",
  });
  return { critical, attention, upcoming };
}

function Dashboard() {
  const { state, actions } = useDemo();
  const ui = useShellUI();
  const [gate, setGate] = useState<Gate | null>(null);
  const [cargoId, setCargoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const rd = readinessService.summary(state);
  const cm = cargoService.metrics(state);
  const pc = personnelService.counts(state);
  const edge = syncService.edgeSummary(state);
  const im = incidentService.metrics(state);
  const att = useAttention();

  const cargoRows = [...state.cargo].sort((a, b) => score(b) - score(a)).slice(0, 8);

  return (
    <>
      <AnimatePresence>
        {!state.welcomed && !state.guide.active && (
          <Welcome onContinue={actions.setWelcomed} att={att} />
        )}
      </AnimatePresence>
      <PageHeader
        eyebrow="Command"
        title="Command Center"
        subtitle="46th ISEA · Bharati Station"
        actions={
          <>
            <Link to="/expeditions/$id" params={{ id: "46th-isea" }} className={btn()}>
              View Expedition
            </Link>
            <Btn onClick={ui.openGuide}>
              <Compass className="size-4" /> Demo Guide
            </Btn>
            <Btn
              aria-label="Refresh"
              onClick={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 700);
              }}
            >
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} /> Refresh
            </Btn>
          </>
        }
      />

      {/* Status strip */}
      <div className="mb-10 grid grid-cols-2 overflow-hidden rounded-[10px] border border-hairline bg-card sm:grid-cols-4 xl:grid-cols-7">
        {[
          ["Expedition", "46th ISEA", null],
          ["Station", "Bharati", null],
          ["Readiness", `${rd.pct}%`, null],
          [
            "Connectivity",
            state.connection === "RECONNECTING"
              ? "Syncing"
              : state.connection === "CONNECTED"
                ? "Connected"
                : "Offline",
            state.connection === "CONNECTED" ? "teal" : "orange",
          ],
          ["Edge nodes", `${edge.up} / ${edge.total}`, edge.up < edge.total ? "orange" : null],
          ["Active incidents", String(im.active), im.ackRequired ? "red" : null],
          ["Cargo at risk", String(cm.atRisk), cm.atRisk ? "orange" : null],
        ].map(([k, v, t]) => (
          <div key={k} className="border-b border-r border-hairline/70 px-5 py-4">
            <p className="eyebrow text-muted-foreground">{k}</p>
            <p
              className={cn(
                "mt-1.5 text-[17px] font-semibold tabular-nums",
                t === "red"
                  ? "text-critical"
                  : t === "orange"
                    ? "text-orange"
                    : t === "teal"
                      ? "text-teal"
                      : "text-ink",
              )}
            >
              {v}
            </p>
          </div>
        ))}
      </div>

      {/* Attention */}
      <section className="mb-10" data-guide="attention">
        <h2 className="mb-5 text-[22px] font-semibold tracking-[-0.02em] text-ink">
          What needs attention now?
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <AttentionCol title="Critical" tone="red" items={att.critical} />
          <AttentionCol title="Attention" tone="orange" items={att.attention} />
          <AttentionCol title="Upcoming" tone="navy" items={att.upcoming} />
        </div>
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel
          eyebrow="Expedition"
          title="Expedition Readiness"
          action={
            <Link
              to="/expeditions/$id/readiness"
              params={{ id: "46th-isea" }}
              className={btn("ghost", "sm")}
            >
              Open Readiness <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <div className="mb-6 flex flex-wrap items-end gap-6">
            <p className="text-[56px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-ink">
              {rd.pct}%
            </p>
            <div className="pb-1.5">
              <p className="text-[15px] font-medium text-ink">
                {rd.done} / {rd.total} requirements complete
              </p>
              <p className="text-[13px] text-muted-foreground">
                Percentage = completed requirements ÷ total. No weighting.
              </p>
            </div>
          </div>
          <GateGrid onOpen={setGate} />
        </Panel>
        <Panel eyebrow="Route" title="Operational Route">
          <RouteMap />
        </Panel>
      </div>

      <Panel
        className="mb-6"
        eyebrow="Logistics"
        title="Cargo Control"
        action={
          <Link to="/cargo" className={btn("ghost", "sm")}>
            All cargo <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <Metric label="Critical cargo" value={cm.critical} />
          <Metric label="At risk" value={cm.atRisk} tone={cm.atRisk ? "orange" : undefined} />
          <Metric
            label="Exceptions"
            value={cm.exceptions}
            tone={cm.exceptions ? "red" : undefined}
          />
          <Metric label="Awaiting receipt" value={cm.awaitingReceipt} />
        </div>
        <DataTable<Cargo>
          rows={cargoRows}
          rowKey={(r) => r.id}
          onRowClick={(r) => setCargoId(r.id)}
          highlight={(r) => !!r.exception && !r.exceptionResolved}
          columns={[
            {
              key: "id",
              header: "Cargo ID",
              primary: true,
              render: (r) => <Mono className="font-medium">{r.id}</Mono>,
            },
            { key: "c", header: "Container", render: (r) => <Mono>{r.container}</Mono> },
            { key: "d", header: "Destination", render: (r) => r.destination },
            {
              key: "cr",
              header: "Criticality",
              render: (r) => <StatusBadge status={r.criticality} />,
            },
            { key: "cu", header: "Current custody", render: (r) => r.custody },
            { key: "l", header: "Last confirmed", render: (r) => <Mono>{r.lastConfirmed}</Mono> },
            { key: "e", header: "ETA", render: (r) => r.eta },
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
      </Panel>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Panel
          eyebrow="Resources"
          title="Station Inventory"
          action={
            <Link to="/inventory" className={btn("ghost", "sm")}>
              View Inventory
            </Link>
          }
        >
          <InventoryBars />
        </Panel>
        <Panel
          eyebrow="People"
          title="Personnel Accountability"
          action={
            <Link to="/muster" className={btn("ghost", "sm")}>
              Open Muster
            </Link>
          }
        >
          <p className="text-[44px] font-semibold leading-none tracking-[-0.03em] text-ink">
            {pc.deployed}
            <span className="ml-2 text-[15px] font-normal text-muted-foreground">deployed</span>
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-y border-hairline/70 py-5">
            <Metric label="Station" value={pc.station} />
            <Metric label="Field" value={pc.field} />
            <Metric
              label="Unaccounted"
              value={pc.unaccounted}
              tone={pc.unaccounted ? "red" : "teal"}
            />
          </div>
          <div className="mt-5">
            <p className="font-mono text-[12px] tracking-[0.1em] text-ink">FIELD TEAM 07</p>
            {(() => {
              const t = personnelService.team(state, "Field Team 07");
              const ok = t.filter((p) => p.accounted).length;
              return (
                <div className="mt-2 flex gap-5 text-[14px]">
                  <span className="text-teal">✓ {ok} accounted</span>
                  {t.length - ok > 0 && (
                    <span className="font-medium text-critical">⚠ {t.length - ok} overdue</span>
                  )}
                </div>
              );
            })()}
          </div>
        </Panel>
        <IncidentPanel />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <SyncHealth />
        <Panel
          eyebrow="Record"
          title="Recent Activity"
          action={
            <Link to="/audit" className={btn("ghost", "sm")}>
              Audit trail
            </Link>
          }
        >
          <ol className="relative">
            <AnimatePresence initial={false}>
              {state.activity.slice(0, 7).map((a) => (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Link
                    to={a.href}
                    className="flex min-h-12 items-baseline gap-4 rounded-[6px] px-2 py-2 hover:bg-surface"
                  >
                    <Mono className="w-12 shrink-0 text-muted-foreground">{a.ts}</Mono>
                    <span className="text-[14.5px] text-ink">{a.text}</span>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </Panel>
      </div>

      <GateDrawer gate={gate} onClose={() => setGate(null)} />
      <CargoDrawer id={cargoId} onClose={() => setCargoId(null)} />
    </>
  );
}

function score(c: Cargo) {
  return (
    (c.exception && !c.exceptionResolved ? 100 : 0) +
    (c.atRisk ? 50 : 0) +
    (c.criticality === "CRITICAL" ? 20 : 0) +
    (c.sync !== "SYNCED" ? 30 : 0) -
    c.stage
  );
}

function AttentionCol({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "red" | "orange" | "navy";
  items: Item[];
}) {
  return (
    <div className="rounded-[10px] border border-hairline bg-card">
      <div className="flex items-center justify-between border-b border-hairline/70 px-5 py-3.5">
        <p
          className={cn(
            "eyebrow",
            tone === "red" ? "text-critical" : tone === "orange" ? "text-orange" : "text-navy",
          )}
        >
          {tone === "red" ? "▲ " : tone === "orange" ? "⚠ " : "○ "}
          {title}
        </p>
        <Mono className="text-muted-foreground">{items.length}</Mono>
      </div>
      {items.length ? (
        <ul>
          {items.map((i) => (
            <li key={i.label} className="border-b border-hairline/50 last:border-0">
              <Link
                to={i.to}
                className="group flex min-h-[60px] items-center gap-3 px-5 py-3 hover:bg-surface"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{i.label}</span>
                  <span className="block truncate text-[13px] text-muted-foreground">{i.sub}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-6 text-[14px] text-muted-foreground">
          Nothing in this category. All clear.
        </p>
      )}
    </div>
  );
}

function IncidentPanel() {
  const { state } = useDemo();
  const inc = incidentService.primary(state);
  return (
    <Panel
      eyebrow="Safety"
      title="Active Incident"
      className={cn(inc.status !== "RESOLVED" && inc.severity === "P0" && "border-critical/40")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Mono className="text-[15px] font-semibold text-ink">{inc.id}</Mono>
        <StatusBadge status={inc.severity} />
        <StatusBadge status={inc.status} />
      </div>
      <p className="mt-3 text-[20px] font-semibold uppercase tracking-[0.02em] text-ink">
        {inc.type}
      </p>
      <p className="text-[14px] text-muted-foreground">{inc.location}</p>
      <ol className="mt-5 space-y-2 border-l border-hairline pl-4">
        {inc.timeline.slice(-4).map((t, i) => (
          <li key={i} className="flex gap-3 text-[13.5px]">
            <Mono className="text-muted-foreground">{t.ts}</Mono>
            <span className="text-ink">{t.label}</span>
          </li>
        ))}
      </ol>
      <Link
        to="/incidents/$id"
        params={{ id: inc.id }}
        className={cn(btn(inc.status === "ACK REQUIRED" ? "danger" : "primary"), "mt-6 w-full")}
      >
        Open Incident Command
      </Link>
    </Panel>
  );
}

function SyncHealth() {
  const { state } = useDemo();
  const q = syncService.byPriority(state);
  return (
    <Panel
      eyebrow="Platform"
      title="Sync Health"
      action={
        <Link to="/sync" className={btn("ghost", "sm")}>
          Open Sync Center
        </Link>
      }
    >
      <ul className="space-y-3">
        <li className="flex items-center justify-between text-[14.5px]">
          <span className="font-medium text-ink">Central</span>
          <StatusBadge status="CONNECTED" />
        </li>
        {state.edgeNodes.slice(0, 2).map((n) => (
          <li key={n.id} className="flex items-center justify-between text-[14.5px]">
            <span className="text-ink">{n.name}</span>
            <StatusBadge status={n.state} />
          </li>
        ))}
      </ul>
      <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-hairline bg-hairline">
        {(["P0", "P1", "P2"] as const).map((p) => (
          <div key={p} className="bg-card p-4">
            <p
              className={cn(
                "font-mono text-[12px]",
                p === "P0" ? "text-critical" : "text-muted-foreground",
              )}
            >
              {p}
            </p>
            <p className="mt-1 text-[26px] font-semibold tabular-nums leading-none text-ink">
              {q[p]}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">pending</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[12px] text-muted-foreground">
        Last sync {state.lastSync} IST
      </p>
    </Panel>
  );
}

function Welcome({
  onContinue,
  att,
}: {
  onContinue: () => void;
  att: ReturnType<typeof useAttention>;
}) {
  const { state } = useDemo();
  const navigate = useNavigate();
  const rd = readinessService.summary(state);
  const cm = cargoService.metrics(state);
  const pc = personnelService.counts(state);
  const edge = syncService.edgeSummary(state);
  const cards = [
    { label: "Cargo C-128", sub: "Critical cargo exception", to: "/cargo/C-128" },
    { label: "Field Team 07", sub: "Missed check-in", to: "/muster" },
    { label: "Maitri Edge 02", sub: "Last sync 3h ago", to: "/sync" },
  ];
  void att;
  return (
    <motion.div
      className="fixed inset-0 z-[55] overflow-y-auto bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center px-6 py-14">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
            <div className="flex items-center gap-3">
              <Mark className="size-9" />
              <div>
                <p className="text-[14px] font-semibold tracking-[0.16em] text-ink">DHRUVSETU</p>
                <p className="text-[13px] text-muted-foreground">
                  Command Center · 46th ISEA · Bharati Station
                </p>
              </div>
            </div>
            <div className="rounded-[6px] border border-dashed border-orange/50 px-3 py-1.5">
              <p className="font-mono text-[10.5px] tracking-[0.14em] text-orange">
                SIMULATION ENVIRONMENT
              </p>
              <p className="text-[12px] text-muted-foreground">Synthetic operational data</p>
            </div>
          </div>
          <h1 className="mt-12 text-[40px] font-semibold tracking-[-0.03em] text-ink md:text-[52px]">
            Good evening, Aryan.
          </h1>
          <p className="eyebrow mt-10 text-muted-foreground">Current operational state</p>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline md:grid-cols-5">
            {[
              ["Readiness", `${rd.pct}%`, undefined],
              ["Critical exceptions", String(cm.exceptions), "red"],
              ["Cargo at risk", String(cm.atRisk), "orange"],
              ["Personnel unaccounted", String(pc.unaccounted), "red"],
              ["Edge nodes", `${edge.up} / ${edge.total}`, undefined],
            ].map(([l, v, t]) => (
              <Metric
                key={l}
                label={l!}
                value={v}
                tone={t as "red" | "orange" | undefined}
                className="bg-card px-5 py-5"
              />
            ))}
          </div>
          <p className="eyebrow mt-10 text-muted-foreground">What needs attention</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {cards.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  onContinue();
                  navigate({ to: c.to });
                }}
                className="rounded-[10px] border border-hairline bg-card p-5 text-left hover:border-navy/40"
              >
                <p className="text-[16px] font-semibold text-ink">{c.label}</p>
                <p className="mt-1 text-[14px] text-critical">{c.sub}</p>
              </button>
            ))}
          </div>
          <Btn variant="primary" size="lg" className="mt-10" onClick={onContinue}>
            Continue Operations <ArrowRight className="size-4" />
          </Btn>
        </motion.div>
      </div>
    </motion.div>
  );
}
