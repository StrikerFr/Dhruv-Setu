import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, Section, SectionHeader, StatusBadge } from "./primitives";
import type { StatusTone } from "./primitives";
import { cn } from "@/lib/utils";

type Row = { a: string; b: string; c: string; tone: StatusTone; state: string };

type View = {
  id: string;
  name: string;
  summary: string;
  columns: [string, string, string];
  rows: Row[];
};

const views: View[] = [
  {
    id: "command",
    name: "Command Center",
    summary: "Exceptions, blockers and edge state for expedition E-46.",
    columns: ["Record", "Context", "Owner"],
    rows: [
      {
        a: "INC-2291",
        b: "Sortie S-214 · injury",
        c: "Duty officer",
        tone: "critical",
        state: "P0 active",
      },
      {
        a: "C-128",
        b: "Temperature excursion",
        c: "Logistics",
        tone: "warning",
        state: "Exception",
      },
      {
        a: "Gate 04",
        b: "Cargo declaration",
        c: "Expedition lead",
        tone: "pending",
        state: "Blocker",
      },
      { a: "Node 09", b: "11 operations queued", c: "Maitri", tone: "offline", state: "Offline" },
    ],
  },
  {
    id: "readiness",
    name: "Expedition Readiness",
    summary: "Six gates, fifty requirements, every blocker attributable.",
    columns: ["Gate", "Requirements", "Owner"],
    rows: [
      {
        a: "01 Mission Scope",
        b: "9 / 9",
        c: "Expedition lead",
        tone: "connected",
        state: "Cleared",
      },
      {
        a: "03 Permit & Environment",
        b: "6 / 8",
        c: "Compliance",
        tone: "warning",
        state: "Blocked",
      },
      { a: "04 Cargo & Customs", b: "7 / 10", c: "Logistics", tone: "warning", state: "Blocked" },
      { a: "06 Closeout", b: "2 / 4", c: "Operations", tone: "pending", state: "Open" },
    ],
  },
  {
    id: "cargo",
    name: "Cargo Control",
    summary: "Demand to station receipt with custody attached to each line.",
    columns: ["Cargo", "Custody point", "Container"],
    rows: [
      { a: "C-126", b: "Bharati · received", c: "BX-0409", tone: "connected", state: "Closed" },
      {
        a: "C-128",
        b: "Polar leg · MV Ashwini",
        c: "BX-0412",
        tone: "syncing",
        state: "In transit",
      },
      { a: "C-131", b: "Cape Town hub", c: "BX-0417", tone: "warning", state: "Seal mismatch" },
      { a: "C-140", b: "Mumbai · awaiting customs", c: "BX-0421", tone: "pending", state: "Held" },
    ],
  },
  {
    id: "sync",
    name: "Edge Sync",
    summary: "Queued operations ordered by priority, per edge node.",
    columns: ["Operation", "Node", "Priority"],
    rows: [
      {
        a: "Incident report",
        b: "Node 04 · Bharati",
        c: "P0",
        tone: "connected",
        state: "Delivered",
      },
      { a: "Custody event", b: "Node 04 · Bharati", c: "P1", tone: "syncing", state: "Syncing" },
      { a: "Check-in batch", b: "Node 09 · Maitri", c: "P1", tone: "pending", state: "Queued" },
      { a: "Station report", b: "Node 09 · Maitri", c: "P2", tone: "pending", state: "Queued" },
    ],
  },
  {
    id: "incident",
    name: "Incident Command",
    summary: "Incident lifecycle from local capture to audited resolution.",
    columns: ["Event", "Time", "Actor"],
    rows: [
      {
        a: "Captured locally",
        b: "11:04 IST",
        c: "Field device FD-22",
        tone: "critical",
        state: "P0",
      },
      {
        a: "Delivered",
        b: "11:19 IST",
        c: "Operations portal",
        tone: "connected",
        state: "Delivered",
      },
      {
        a: "Acknowledged",
        b: "11:19 IST",
        c: "Duty officer",
        tone: "connected",
        state: "Acknowledged",
      },
      {
        a: "Responder assigned",
        b: "11:22 IST",
        c: "Team 03",
        tone: "syncing",
        state: "In progress",
      },
    ],
  },
];

export function ProductPreviewSection() {
  const [active, setActive] = useState(views[0]!.id);
  const view = views.find((v) => v.id === active) ?? views[0]!;

  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="Product preview"
        title="The system, view by view."
        lede="Five working surfaces of DhruvSetu. Each one opens on the records an operator is accountable for."
      />

      <div className="mt-12 flex flex-wrap gap-2">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(v.id)}
            aria-pressed={v.id === active}
            className={cn(
              "rounded-sm border px-4 py-2 mono-xs uppercase transition-colors duration-300",
              v.id === active
                ? "border-navy bg-navy text-onnavy"
                : "border-border bg-card text-muted-foreground hover:border-cyan hover:text-ink",
            )}
          >
            {v.name}
          </button>
        ))}
      </div>

      <Reveal>
        <div className="mt-6 overflow-hidden rounded-sm border border-border bg-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={view.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="text-[1rem] tracking-[-0.02em] text-ink">{view.name}</p>
                  <p className="mt-1 text-[0.85rem] text-muted-foreground">{view.summary}</p>
                </div>
                <StatusBadge tone="connected" label="E-46 · 46th ISEA" dense />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {[...view.columns, "State"].map((c) => (
                        <th
                          key={c}
                          scope="col"
                          className="mono-xs px-5 py-3 text-left uppercase text-muted-foreground"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {view.rows.map((r) => (
                      <tr
                        key={r.a}
                        className="border-b border-border last:border-0 transition-colors duration-200 hover:bg-ice/40"
                      >
                        <td className="mono-xs px-5 py-4 text-ink">{r.a}</td>
                        <td className="px-5 py-4 text-[0.87rem] text-muted-foreground">{r.b}</td>
                        <td className="px-5 py-4 text-[0.87rem] text-muted-foreground">{r.c}</td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={r.tone} label={r.state} dense />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mono-xs border-t border-border px-5 py-3 uppercase text-muted-foreground">
                Synthetic demonstration data
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}
