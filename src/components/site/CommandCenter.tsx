import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, Section, SectionHeader, StatusBadge } from "./primitives";
import type { StatusTone } from "./primitives";
import { cn } from "@/lib/utils";

type Panel = {
  id: string;
  title: string;
  value: string;
  unit?: string;
  tone: StatusTone;
  state: string;
  detail: string[];
};

const panels: Panel[] = [
  {
    id: "readiness",
    title: "Expedition readiness",
    value: "41",
    unit: "/ 50 requirements",
    tone: "pending",
    state: "2 gates open",
    detail: [
      "Gate 03 · Permit evidence pending",
      "Gate 04 · Cargo declaration pending",
      "Gate 06 · Closeout not started",
    ],
  },
  {
    id: "exceptions",
    title: "Critical exceptions",
    value: "3",
    unit: "open",
    tone: "warning",
    state: "Attention",
    detail: [
      "C-128 · Temperature excursion",
      "BX-0417 · Seal mismatch at hub",
      "FT-07 · Check-in overdue",
    ],
  },
  {
    id: "cargo",
    title: "Cargo at risk",
    value: "6",
    unit: "lines",
    tone: "warning",
    state: "Monitored",
    detail: [
      "4 lines awaiting customs clearance",
      "2 lines short-shipped at Cape Town",
      "Next polar leg departs 29 Oct",
    ],
  },
  {
    id: "inventory",
    title: "Inventory alerts",
    value: "9",
    unit: "items",
    tone: "pending",
    state: "Below threshold",
    detail: [
      "Bharati · Store 02 · fuel additive",
      "Maitri · Store 01 · medical consumables",
      "Reorder window closes 18 Nov",
    ],
  },
  {
    id: "personnel",
    title: "Personnel unaccounted",
    value: "1",
    unit: "of 58",
    tone: "critical",
    state: "Overdue",
    detail: ["P-1290 · Sortie S-214", "Last check-in 11:00 IST", "Muster escalation triggered"],
  },
  {
    id: "edge",
    title: "Edge nodes",
    value: "7",
    unit: "/ 9 connected",
    tone: "syncing",
    state: "2 offline",
    detail: [
      "Node 04 · offline · 3 operations queued",
      "Node 09 · offline · 11 operations queued",
      "Priority sync on next uplink window",
    ],
  },
];

const streams = [
  { label: "Active incidents", value: "1 P0 · 2 P2" },
  { label: "Cargo exceptions", value: "3 open" },
  { label: "Readiness blockers", value: "2 critical" },
  { label: "Synchronization", value: "14 operations queued" },
];

export function CommandCenterSection() {
  const [active, setActive] = useState<string>("exceptions");
  const activePanel = panels.find((p) => p.id === active) ?? panels[0]!;

  return (
    <Section id="command-center" className="bg-surface">
      <SectionHeader
        eyebrow="Command center"
        title="See what needs attention now."
        lede="The operations portal opens on exceptions, not dashboards. Select a panel to inspect the underlying operational records."
      />

      <Reveal>
        <div className="mt-14 overflow-hidden rounded-sm border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-4">
              <span className="mono-xs uppercase text-ink">DhruvSetu · Command Center</span>
              <span className="mono-xs text-muted-foreground">Expedition E-46 · 46th ISEA</span>
            </div>
            <StatusBadge tone="connected" label="Portal connected · 14:32 IST" dense />
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {panels.map((p) => {
                const selected = p.id === active;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(p.id)}
                    onMouseEnter={() => setActive(p.id)}
                    aria-pressed={selected}
                    className={cn(
                      "group bg-card p-5 text-left transition-colors duration-300",
                      selected ? "bg-ice/70" : "hover:bg-ice/40",
                    )}
                  >
                    <p className="mono-xs uppercase text-muted-foreground">{p.title}</p>
                    <p className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tracking-[-0.03em] text-ink">
                        {p.value}
                      </span>
                      <span className="mono-xs text-muted-foreground">{p.unit}</span>
                    </p>
                    <StatusBadge tone={p.tone} label={p.state} className="mt-3" dense />
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border p-5 lg:border-l lg:border-t-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="mono-xs uppercase text-teal">Detail</p>
                  <p className="mt-2 text-[1.05rem] tracking-[-0.02em] text-ink">
                    {activePanel.title}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {activePanel.detail.map((d) => (
                      <li
                        key={d}
                        className="border-b border-dashed border-border pb-3 text-[0.85rem] text-muted-foreground last:border-0"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 border-t border-border pt-4">
                {streams.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between py-1.5">
                    <span className="mono-xs uppercase text-muted-foreground">{s.label}</span>
                    <span className="mono-xs text-ink">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mono-xs border-t border-border px-5 py-3 uppercase text-muted-foreground">
            Demonstration environment · synthetic operational data
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------------------------- Operational states ---------------------------- */

const states: { label: string; tone: StatusTone; note: string }[] = [
  { label: "Connected", tone: "connected", note: "Live link to the portal" },
  { label: "Offline", tone: "offline", note: "Operating locally" },
  { label: "Syncing", tone: "syncing", note: "Priority order applied" },
  { label: "Pending", tone: "pending", note: "Awaiting uplink window" },
  { label: "Delivered", tone: "connected", note: "Received centrally" },
  { label: "Acknowledged", tone: "connected", note: "Owner confirmed" },
  { label: "Conflict", tone: "warning", note: "Two edits, one record" },
  { label: "Retry", tone: "pending", note: "Backoff scheduled" },
  { label: "Failed", tone: "critical", note: "Escalated to duty officer" },
];

export function StatesSection() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Operational states"
        title="Operational truth includes its state."
        lede="A record is never only its value. Every event carries how it was captured, whether it reached the portal, and whether anyone confirmed it."
      />

      <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {states.map((s, i) => (
          <Reveal as="li" key={s.label} delay={i * 0.04}>
            <div className="h-full bg-card p-5 transition-colors duration-300 hover:bg-ice/40">
              <StatusBadge tone={s.tone} label={s.label} />
              <p className="mt-3 text-[0.85rem] text-muted-foreground">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------- Lifecycle ---------------------------------- */

const lifecycle = [
  { stage: "Plan", caps: ["Mission scope", "Readiness gates", "Permits"] },
  { stage: "Prepare", caps: ["Personnel records", "Training evidence", "Medical clearance"] },
  { stage: "Pack", caps: ["Cargo demands", "Packing lists", "Container sealing"] },
  { stage: "Move", caps: ["Manifests", "Custody events", "Exceptions", "Transit legs"] },
  { stage: "Receive", caps: ["Station receipt", "Discrepancy capture", "Putaway"] },
  { stage: "Operate", caps: ["Inventory", "Assets", "Station logs"] },
  { stage: "Sortie", caps: ["Team declaration", "Check-in schedule", "Muster"] },
  { stage: "Respond", caps: ["Incident capture", "Acknowledgement", "Responder assignment"] },
  { stage: "Backhaul", caps: ["Return cargo", "Waste records", "Environmental compliance"] },
  { stage: "Close", caps: ["Reconciliation", "Audit export", "Expedition closeout"] },
];

export function LifecycleSection() {
  const [active, setActive] = useState(3);
  const current = lifecycle[active] ?? lifecycle[0]!;

  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Full expedition"
        title="Designed for the full expedition."
        lede="Select a stage to see the capabilities DhruvSetu carries through it."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <ul className="flex flex-col border-t border-border">
          {lifecycle.map((l, i) => {
            const selected = i === active;
            return (
              <li key={l.stage} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-pressed={selected}
                  className="group flex w-full items-center gap-5 py-4 text-left"
                >
                  <span className="mono-xs w-6 text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[1.25rem] tracking-[-0.025em] transition-colors duration-300 sm:text-[1.6rem]",
                      selected ? "text-ink" : "text-muted-foreground",
                    )}
                  >
                    {l.stage}
                  </span>
                  <span
                    className={cn(
                      "ml-auto h-px flex-1 transition-colors duration-300",
                      selected ? "bg-teal" : "bg-border",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "transition-all duration-300",
                      selected ? "translate-x-0 text-teal" : "-translate-x-1 text-border",
                    )}
                  >
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-sm border border-border bg-card p-6"
            >
              <p className="mono-xs uppercase text-teal">{current.stage}</p>
              <ul className="mt-4 space-y-3">
                {current.caps.map((c) => (
                  <li
                    key={c}
                    className="border-b border-dashed border-border pb-3 text-[0.9rem] text-ink last:border-0"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
