import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { OpsCard, Reveal, Section, SectionHeader, StatusBadge } from "./primitives";
import { cn } from "@/lib/utils";

/* ----------------------------- Emergency response --------------------------- */

const incidentSteps = [
  { label: "Local incident active", meta: "Field device · 11:04:22" },
  { label: "Central delivery pending", meta: "No connection" },
  { label: "Connection restored", meta: "Uplink window 11:19" },
  { label: "Delivered", meta: "Operations portal · 11:19:08" },
  { label: "Acknowledged", meta: "Duty officer · 11:19:41" },
  { label: "Responder assigned", meta: "Team 03 · 11:22" },
  { label: "Resolved", meta: "12:47 · audit recorded" },
];

export function EmergencySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-25%" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(reduced ? incidentSteps.length - 1 : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = setInterval(() => setStep((s) => (s + 1) % (incidentSteps.length + 2)), 1300);
    return () => clearInterval(t);
  }, [inView, reduced]);

  return (
    <Section dark>
      <SectionHeader
        onDark
        eyebrow="Emergency response"
        title="When connectivity fails, response cannot."
        lede="A P0 incident is recorded and acted on locally the moment it happens. When the link returns, it is the first record to reach the operations portal."
      />

      <div
        ref={ref}
        className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14"
      >
        <OpsCard onDark className="p-6">
          <p className="mono-xs uppercase text-onnavy-muted">Field device · FD-22</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="mono-xs rounded-sm border border-critical/60 px-1.5 py-0.5 text-critical">
              P0
            </span>
            <p className="text-lg font-semibold tracking-[-0.02em] text-onnavy">INC-2291</p>
          </div>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-onnavy-muted">
            Crevasse injury reported during sortie S-214, 11 km south-east of Bharati. Local
            response initiated from the device.
          </p>
          <div className="mt-5 space-y-2 border-t border-onnavy/12 pt-4">
            <StatusBadge tone="critical" label="Local incident active" dense />
            <StatusBadge
              tone={step >= 3 ? "connected" : "offline"}
              label={step >= 3 ? "Central delivery complete" : "Central delivery pending"}
              dense
            />
          </div>
        </OpsCard>

        <ol className="relative border-l border-onnavy/15 pl-6">
          {incidentSteps.map((s, i) => {
            const reached = step >= i;
            return (
              <li key={s.label} className="relative py-3.5">
                <motion.span
                  className={cn(
                    "absolute -left-[26px] top-[20px] size-[7px] rounded-full border transition-colors duration-500",
                    reached
                      ? i <= 1
                        ? "border-critical bg-critical"
                        : "border-cyan bg-cyan"
                      : "border-onnavy/25",
                  )}
                  animate={reached && step === i ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <p
                  className={cn(
                    "text-[0.95rem] transition-colors duration-500",
                    reached ? "text-onnavy" : "text-onnavy-muted/55",
                  )}
                >
                  {s.label}
                </p>
                <p className="mono-xs text-onnavy-muted/80">{s.meta}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

/* --------------------------- One operational record -------------------------- */

const entities = [
  "Personnel",
  "Cargo",
  "Containers",
  "Assets",
  "Inventory",
  "Sorties",
  "Incidents",
  "Permits",
  "Environment",
  "Audit",
];

export function OneRecordSection() {
  const radius = 36;
  return (
    <Section>
      <SectionHeader
        eyebrow="One operational record"
        title="Every operational event belongs to a traceable record."
        lede="Cargo, people, assets, sorties and incidents are not separate logs. They are relationships on a single expedition record that can be reconciled and audited."
      />

      <div className="relative mx-auto mt-16 aspect-square w-full max-w-[640px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          {entities.map((_, i) => {
            const a = (i / entities.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(a) * radius;
            const y = 50 + Math.sin(a) * radius;
            return (
              <g key={i}>
                <motion.line
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="var(--color-hairline)"
                  strokeWidth="0.2"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.07 }}
                />
                <line
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="var(--color-cyan)"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                  className="flow-dash"
                  opacity="0.5"
                />
              </g>
            );
          })}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="0.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="mono-xs uppercase text-teal">Expedition</p>
          <p className="text-lg font-semibold tracking-[-0.02em] text-ink">E-46</p>
        </div>

        {entities.map((e, i) => {
          const a = (i / entities.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(a) * radius;
          const y = 50 + Math.sin(a) * radius;
          return (
            <motion.span
              key={e}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm border border-border bg-card px-2.5 py-1.5 mono-xs uppercase text-ink"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.06 }}
            >
              {e}
            </motion.span>
          );
        })}
      </div>

      <Reveal>
        <p className="mono-xs mt-8 text-center uppercase text-muted-foreground">
          Synthetic relationship graph · expedition E-46
        </p>
      </Reveal>
    </Section>
  );
}
