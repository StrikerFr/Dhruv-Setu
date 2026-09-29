import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { FieldRow, OpsCard, Reveal, Section, SectionHeader, StatusBadge } from "./primitives";
import { cn } from "@/lib/utils";

/* ------------------------------ Cargo custody ------------------------------ */

const custody = [
  { stage: "Demand", at: "Goa · 04 Oct 09:12" },
  { stage: "Packed", at: "Goa · 07 Oct 16:40" },
  { stage: "Sealed", at: "Container BX-0412" },
  { stage: "Dispatched", at: "Mumbai · 11 Oct 07:05" },
  { stage: "Transit", at: "Ocean leg · 12 Oct" },
  { stage: "Hub", at: "Cape Town · 26 Oct" },
  { stage: "Polar leg", at: "MV Ashwini · 29 Oct" },
  { stage: "Station", at: "Bharati · 08 Nov" },
  { stage: "Inventory", at: "Store 02 · pending" },
];

export function CargoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-25%" });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(reduced ? custody.length - 2 : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = setInterval(() => setActive((a) => (a + 1) % (custody.length + 1)), 1100);
    return () => clearInterval(t);
  }, [inView, reduced]);

  const current = custody[Math.min(active, custody.length - 1)]!;

  return (
    <Section>
      <SectionHeader
        eyebrow="Cargo custody"
        title="Know where every critical item was last confirmed."
        lede="Track every custody event from dispatch to station receipt, with the exception and synchronization state attached to the record."
      />

      <div
        ref={ref}
        className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14"
      >
        {/* Timeline: horizontal on desktop, vertical on mobile */}
        <div className="relative">
          <div className="hidden lg:block">
            <div className="relative h-px w-full bg-border">
              <motion.div
                className="absolute left-0 top-0 h-px bg-teal"
                animate={{
                  width: `${(Math.min(active, custody.length - 1) / (custody.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
              />
            </div>
            <div className="mt-0 flex justify-between px-6">
              {custody.map((c, i) => {
                const done = i <= active;
                return (
                  <div key={c.stage} className="-mt-[5px] flex w-0 flex-col items-center">
                    <span
                      className={cn(
                        "size-[9px] rounded-full border transition-colors duration-500",
                        done ? "border-teal bg-teal" : "border-border bg-background",
                      )}
                    />
                    <span
                      className={cn(
                        "mono-xs mt-3 whitespace-nowrap text-[0.6rem] uppercase transition-colors duration-500",
                        done ? "text-ink" : "text-muted-foreground",
                      )}
                    >
                      {c.stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <ol className="border-l border-border pl-6 lg:hidden">
            {custody.map((c, i) => (
              <li key={c.stage} className="relative py-2.5">
                <span
                  className={cn(
                    "absolute -left-[27px] top-4 size-[9px] rounded-full border",
                    i <= active ? "border-teal bg-teal" : "border-border bg-background",
                  )}
                />
                <p className="mono-xs uppercase text-ink">{c.stage}</p>
                <p className="mono-xs text-muted-foreground">{c.at}</p>
              </li>
            ))}
          </ol>
        </div>

        <OpsCard className="p-6">
          <p className="mono-xs uppercase text-muted-foreground">Cargo record</p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">C-128</p>
          <div className="mt-5">
            <FieldRow label="Container" value="BX-0412" />
            <FieldRow label="Expedition" value="E-46 · 46th ISEA" />
            <FieldRow label="Custody point" value={current.stage} />
            <FieldRow label="Last confirmed" value={current.at} />
            <FieldRow label="ETA Bharati" value="08 Nov · 11:20 IST" />
            <FieldRow
              label="Exception"
              value={<span className="text-orange">Temperature excursion · logged</span>}
            />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <StatusBadge tone="syncing" label="Sync pending" dense />
            <span className="mono-xs text-muted-foreground">Synthetic data</span>
          </div>
        </OpsCard>
      </div>
    </Section>
  );
}

/* ---------------------------- Expedition readiness --------------------------- */

const gates = [
  { no: "01", name: "Mission Scope", done: 9, total: 9 },
  { no: "02", name: "Personnel", done: 11, total: 12 },
  { no: "03", name: "Permit & Environment", done: 6, total: 8 },
  { no: "04", name: "Cargo & Customs", done: 7, total: 10 },
  { no: "05", name: "Travel / Vessel / Flight", done: 6, total: 7 },
  { no: "06", name: "Closeout", done: 2, total: 4 },
];

export function ReadinessSection() {
  return (
    <Section className="bg-surface">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            eyebrow="Expedition readiness"
            title="Readiness should be explainable."
            lede="No unexplained score. Readiness is the sum of concrete gates, the requirements inside them, and the blockers still open."
          />
          <Reveal delay={0.16}>
            <div className="mt-10 flex items-baseline gap-3">
              <span className="text-5xl font-semibold tracking-[-0.04em] text-ink">41</span>
              <span className="text-xl text-muted-foreground">/ 50</span>
              <span className="mono-xs uppercase text-muted-foreground">requirements complete</span>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 rounded-sm border border-orange/40 bg-card p-5">
              <p className="mono-xs uppercase text-orange">▲ Critical blockers</p>
              <ul className="mt-3 space-y-2">
                <li className="text-[0.9rem] text-ink">Cargo declaration pending</li>
                <li className="text-[0.9rem] text-ink">Permit evidence pending</li>
              </ul>
            </div>
          </Reveal>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {gates.map((g, i) => {
            const complete = g.done === g.total;
            return (
              <Reveal as="li" key={g.no} delay={i * 0.05}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 py-5">
                  <span className="mono-xs text-muted-foreground">{g.no}</span>
                  <div>
                    <p className="text-[0.95rem] text-ink">{g.name}</p>
                    <div className="mt-2.5 h-px w-full bg-border">
                      <motion.div
                        className={cn("h-px", complete ? "bg-teal" : "bg-cyan")}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(g.done / g.total) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.05 }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="mono-xs text-ink">
                      {g.done}/{g.total}
                    </span>
                    <StatusBadge
                      tone={complete ? "connected" : "pending"}
                      label={complete ? "Cleared" : "Open"}
                      className="mt-1 justify-end"
                      dense
                    />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* --------------------------- People & field ops ----------------------------- */

const chain = ["Station", "Field Team", "Sortie", "Check-in", "Muster"];

const roster = [
  { id: "P-1042", role: "Glaciologist", state: "Accounted" },
  { id: "P-1118", role: "Field engineer", state: "Accounted" },
  { id: "P-1203", role: "Medical officer", state: "Accounted" },
  { id: "P-1290", role: "Survey technician", state: "Check-in overdue" },
];

export function PeopleSection() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Personnel & field operations"
        title="Accountability doesn't stop at the station."
        lede="Sorties leave the station with a declared team, a return window and a check-in schedule. Overdue check-ins surface as operational exceptions, not notifications."
      />

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <ol className="flex flex-col gap-0">
            {chain.map((c, i) => (
              <Reveal as="li" key={c} delay={i * 0.06}>
                <div className="flex items-center gap-4 border-b border-border py-5">
                  <span className="mono-xs w-6 text-muted-foreground">0{i + 1}</span>
                  <span className="text-[1.05rem] tracking-[-0.01em] text-ink">{c}</span>
                  <span className="ml-auto h-px flex-1 bg-border" />
                  <span aria-hidden className="text-teal">
                    ↓
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <OpsCard className="p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="mono-xs uppercase text-muted-foreground">Sortie S-214</p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">
                Field Team 07
              </p>
            </div>
            <div className="text-right">
              <p className="mono-xs text-ink">4 personnel</p>
              <p className="mono-xs text-muted-foreground">Next check-in 14:30</p>
            </div>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {roster.map((p, i) => {
              const overdue = p.state !== "Accounted";
              return (
                <Reveal as="li" key={p.id} delay={i * 0.06}>
                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <span className="flex items-center gap-3">
                      <span aria-hidden className={overdue ? "text-orange" : "text-teal"}>
                        {overdue ? "⚠" : "✓"}
                      </span>
                      <span className="mono-xs text-ink">{p.id}</span>
                      <span className="text-[0.85rem] text-muted-foreground">{p.role}</span>
                    </span>
                    <StatusBadge tone={overdue ? "warning" : "connected"} label={p.state} dense />
                  </div>
                </Reveal>
              );
            })}
          </ul>
          <p className="mono-xs mt-4 border-t border-border pt-4 uppercase text-muted-foreground">
            Identifiers only · no sensitive personal data · synthetic
          </p>
        </OpsCard>
      </div>
    </Section>
  );
}
