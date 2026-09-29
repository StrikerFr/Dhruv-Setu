import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { inventoryService, readinessService } from "@/demo/services";
import { CUSTODY_STAGES, type Cargo, type Gate } from "@/demo/types";
import { cn } from "@/lib/utils";
import { Badge, btn, Drawer, KV, StatusBadge, SyncBadge } from "./ui";

/* ------------------------------------------------------- cargo drawer */

export function CargoDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state } = useDemo();
  const c = id ? state.cargo.find((x) => x.id === id) : null;
  return (
    <Drawer
      open={!!c}
      onClose={onClose}
      eyebrow="Cargo record"
      title={c ? `Cargo ${c.id}` : ""}
      footer={
        c && (
          <>
            <Link
              to="/cargo/$id"
              params={{ id: c.id }}
              className={btn("primary")}
              onClick={onClose}
            >
              Open full record
            </Link>
            <Link to="/manifests" className={btn()} onClick={onClose}>
              Manifest {c.manifest}
            </Link>
          </>
        )
      }
    >
      {c && (
        <div className="space-y-7">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={c.criticality} />
            <StatusBadge status={c.status} />
            {c.exception && <StatusBadge status={c.exceptionResolved ? "RESOLVED" : c.exception} />}
            <SyncBadge state={c.sync} />
          </div>
          <p className="text-[15px] text-ink">{c.item}</p>
          <KV
            items={[
              ["Container", c.container],
              ["Destination", c.destination],
              ["Current custody", c.custody],
              ["Last confirmed", c.lastConfirmed],
              ["Hazard", c.hazard ?? "None"],
              ["Weight", `${c.weight} kg`],
            ]}
          />
          <div>
            <p className="eyebrow mb-3 text-muted-foreground">Custody</p>
            <CustodyTimeline cargo={c} compact />
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* --------------------------------------------------- custody timeline */

export function CustodyTimeline({ cargo, compact }: { cargo: Cargo; compact?: boolean }) {
  const [sel, setSel] = useState<number | null>(compact ? null : Math.min(cargo.stage, 7));
  const ev = sel != null ? cargo.events.find((e) => e.stage === sel) : null;
  const problemStage =
    cargo.exception && !cargo.exceptionResolved
      ? cargo.status === "MISSING"
        ? 7
        : cargo.stage === 7
          ? 7
          : 6
      : -1;

  return (
    <div>
      <ol className={cn("grid gap-0", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-8")}>
        {CUSTODY_STAGES.map((label, i) => {
          const done = i <= cargo.stage && !(i === problemStage && cargo.status === "MISSING");
          const problem = i === problemStage;
          const glyph = problem ? "⚠" : done ? "✓" : "○";
          return (
            <li
              key={label}
              className={cn(
                "relative",
                compact ? "flex gap-3 pb-3" : "flex gap-3 pb-4 md:block md:pb-0",
              )}
            >
              {!compact && i < 7 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[13px] top-7 h-full w-px md:left-7 md:top-[13px] md:h-px md:w-full",
                    i < cargo.stage ? "bg-teal" : "bg-hairline",
                  )}
                />
              )}
              {compact && i < 7 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[11px] top-6 h-full w-px",
                    i < cargo.stage ? "bg-teal" : "bg-hairline",
                  )}
                />
              )}
              <button
                onClick={() => setSel(i)}
                disabled={!cargo.events.some((e) => e.stage === i)}
                aria-label={`${label}: ${problem ? "exception" : done ? "complete" : "pending"}`}
                className={cn(
                  "relative z-[1] grid shrink-0 place-items-center rounded-full border text-[12px] font-semibold transition-colors disabled:cursor-default",
                  compact ? "size-6" : "size-7",
                  problem
                    ? "border-critical bg-critical text-destructive-foreground"
                    : done
                      ? "border-teal bg-teal text-primary-foreground"
                      : "border-hairline bg-card text-muted-foreground",
                  sel === i && "ring-2 ring-cyan ring-offset-2",
                )}
              >
                {glyph}
              </button>
              <div className={cn(!compact && "md:mt-3 md:pr-2")}>
                <p
                  className={cn(
                    "text-[13.5px] font-medium",
                    problem ? "text-critical" : done ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
                {compact && cargo.events.find((e) => e.stage === i) && (
                  <p className="font-mono text-[11.5px] text-muted-foreground">
                    {cargo.events.find((e) => e.stage === i)!.ts}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {!compact && ev && (
        <motion.div
          key={sel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[8px] border border-hairline bg-surface p-5"
        >
          <p className="eyebrow mb-4 text-teal">{CUSTODY_STAGES[ev.stage]} · event detail</p>
          <KV
            cols={3}
            items={[
              ["Timestamp", ev.ts],
              ["Location", ev.location],
              ["Operator", ev.operator],
              ["Device", ev.device],
              ["Source", ev.source],
              ["Sync state", <SyncBadge key="s" state={ev.sync} />],
            ]}
          />
        </motion.div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- gates */

export function GateGrid({ onOpen }: { onOpen?: (g: Gate) => void }) {
  const { state } = useDemo();
  return (
    <div className="grid gap-px overflow-hidden rounded-[8px] border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-3">
      {state.gates.map((g) => {
        const st = readinessService.gateStatus(g);
        const done = g.requirements.filter((r) => r.done).length;
        return (
          <button
            key={g.id}
            onClick={() => onOpen?.(g)}
            className="bg-card p-4 text-left hover:bg-surface focus-visible:bg-ice"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[12px] text-muted-foreground">{g.n}</span>
              <StatusBadge status={st} />
            </div>
            <p className="mt-3 text-[15px] font-medium text-ink">{g.name}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className={cn(
                    "h-full",
                    st === "BLOCKED" ? "bg-critical" : st === "ATTENTION" ? "bg-orange" : "bg-teal",
                  )}
                  animate={{ width: `${(done / g.requirements.length) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                {done}/{g.requirements.length}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function GateDrawer({ gate, onClose }: { gate: Gate | null; onClose: () => void }) {
  const { state, actions } = useDemo();
  const g = gate ? state.gates.find((x) => x.id === gate.id)! : null;
  return (
    <Drawer
      open={!!g}
      onClose={onClose}
      eyebrow={g ? `Readiness gate ${g.n}` : ""}
      title={g?.name ?? ""}
      footer={
        g && (
          <>
            {g.blocker && (
              <button className={btn("primary")} onClick={() => actions.resolveBlocker(g.id)}>
                Resolve Blocker
              </button>
            )}
            <Link
              to="/expeditions/$id/readiness"
              params={{ id: "46th-isea" }}
              className={btn()}
              onClick={onClose}
            >
              Open Readiness
            </Link>
          </>
        )
      }
    >
      {g && <GateBody gate={g} />}
    </Drawer>
  );
}

export function GateBody({ gate: g }: { gate: Gate }) {
  const { actions } = useDemo();
  const done = g.requirements.filter((r) => r.done).length;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StatusBadge status={readinessService.gateStatus(g)} />
        <span className="text-[14px] text-muted-foreground">
          {done} / {g.requirements.length} requirements complete
        </span>
      </div>
      {g.blocker && (
        <div className="rounded-[8px] border border-critical/30 bg-critical/[0.04] p-4">
          <p className="eyebrow text-critical">Blocking</p>
          <p className="mt-1.5 text-[15px] font-medium text-ink">{g.blocker}</p>
        </div>
      )}
      <KV
        items={[
          ["Owner", g.owner],
          ["Due", g.due],
          ["Evidence", `${g.evidence[0]} / ${g.evidence[1]} documents`],
          ["Requirements", `${done} / ${g.requirements.length}`],
        ]}
      />
      <ul className="divide-y divide-hairline/70 border-y border-hairline/70">
        {g.requirements.map((r) => (
          <li key={r.id}>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2 text-[14px]">
              <input
                type="checkbox"
                checked={r.done}
                onChange={() => actions.toggleRequirement(g.id, r.id)}
                className="size-4 accent-[var(--color-teal)]"
              />
              <span className={r.done ? "text-ink" : "text-muted-foreground"}>{r.label}</span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {r.done ? "COMPLETE" : "OPEN"}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------ route map */

export function RouteMap() {
  const { state } = useDemo();
  const polarEx = state.cargo.filter(
    (c) => c.stage === 6 && c.exception && !c.exceptionResolved,
  ).length;
  const overdue = state.sorties.some(
    (s) => s.status === "OVERDUE" && s.route.includes("Field Camp 08"),
  );
  const nodes: { name: string; status: string; tone: "ok" | "warn" | "active"; to: string }[] = [
    { name: "GOA", status: "Complete", tone: "ok", to: "/containers" },
    { name: "MUMBAI", status: "Complete", tone: "ok", to: "/containers" },
    { name: "CAPE TOWN", status: "Received", tone: "ok", to: "/cargo" },
    {
      name: "POLAR LEG",
      status: polarEx ? `${polarEx + 1} cargo exceptions` : "In transit",
      tone: polarEx ? "warn" : "active",
      to: "/cargo",
    },
    { name: "BHARATI", status: "Active", tone: "active", to: "/dashboard" },
    {
      name: "FIELD CAMP 08",
      status: overdue ? "Check-in overdue" : "Checked in",
      tone: overdue ? "warn" : "ok",
      to: "/sorties",
    },
  ];
  return (
    <ol className="relative">
      <span aria-hidden className="absolute bottom-6 left-[15px] top-6 w-px bg-hairline" />
      {nodes.map((n) => (
        <li key={n.name}>
          <Link
            to={n.to}
            className="relative flex min-h-[52px] items-center gap-4 rounded-[6px] py-1.5 pr-2 hover:bg-surface"
          >
            <span className="relative z-[1] grid size-[31px] shrink-0 place-items-center rounded-full border border-hairline bg-card">
              {n.tone === "active" && (
                <span className="absolute inset-1.5 rounded-full bg-cyan/30 node-pulse" />
              )}
              <span
                className={cn(
                  "relative size-2.5 rounded-full",
                  n.tone === "ok" ? "bg-teal" : n.tone === "warn" ? "bg-orange" : "bg-cyan",
                )}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[12px] font-medium tracking-[0.1em] text-ink">
                {n.name}
              </span>
            </span>
            <span
              className={cn(
                "text-right text-[12.5px]",
                n.tone === "warn" ? "font-medium text-orange" : "text-muted-foreground",
              )}
            >
              {n.tone === "ok" ? "✓ " : n.tone === "warn" ? "⚠ " : "● "}
              {n.status}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------- inventory bars */

export function InventoryBars() {
  const { state } = useDemo();
  const cats = inventoryService.categories(state);
  return (
    <ul className="space-y-5">
      {cats.map((c) => {
        const warn = c.days < 14 || c.pct < 45;
        return (
          <li key={c.category}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-[14.5px] font-medium text-ink">{c.category}</span>
              <span className="flex items-baseline gap-3">
                {warn && (
                  <Badge tone="orange" glyph="⚠">
                    Below threshold
                  </Badge>
                )}
                <span className="font-mono text-[13px] tabular-nums text-ink">{c.pct}%</span>
                <span
                  className={cn(
                    "w-16 text-right font-mono text-[13px] tabular-nums",
                    warn ? "text-orange" : "text-muted-foreground",
                  )}
                >
                  {c.days} days
                </span>
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-surface">
              <motion.div
                className={cn("h-full rounded-full", warn ? "bg-orange" : "bg-teal")}
                initial={{ width: 0 }}
                animate={{ width: `${c.pct}%` }}
                transition={{ duration: 0.6 }}
              />
              <span
                aria-hidden
                className="absolute inset-y-0 left-[40%] w-px bg-ink/25"
                title="Reorder threshold"
              />
            </div>
          </li>
        );
      })}
      <li className="font-mono text-[11px] text-muted-foreground">
        Marker = 40% reorder threshold · days of cover at current consumption
      </li>
    </ul>
  );
}
