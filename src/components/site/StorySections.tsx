import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Reveal, Section, SectionHeader, StatusBadge } from "./primitives";

/* ------------------------------ The problem -------------------------------- */

const fragments = [
  { label: "Planning", from: { x: -140, y: -60 } },
  { label: "Cargo", from: { x: 150, y: -70 } },
  { label: "Personnel", from: { x: -170, y: 40 } },
  { label: "Station", from: { x: 120, y: 60 } },
  { label: "Field Team", from: { x: -60, y: 90 } },
  { label: "Emergency", from: { x: 70, y: -110 } },
];

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduced = useReducedMotion();

  return (
    <Section id="platform">
      <SectionHeader
        eyebrow="The operational gap"
        title="Polar operations don't fail in one place."
        lede="They become difficult to manage when critical information is scattered across people, spreadsheets, messages, transit systems and disconnected operational records."
      />

      <div ref={ref} className="relative mt-20 flex min-h-[360px] items-center justify-center">
        <div className="absolute inset-0 hairline-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative flex flex-col items-center">
          <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {fragments.map((f, i) => (
              <motion.span
                key={f.label}
                initial={{
                  opacity: 0,
                  x: reduced ? 0 : f.from.x,
                  y: reduced ? 0 : f.from.y,
                  rotate: reduced ? 0 : i % 2 ? 2 : -2,
                }}
                animate={inView ? { opacity: 1, x: 0, y: 0, rotate: 0 } : { opacity: 0 }}
                transition={{
                  duration: 1.1,
                  delay: 0.1 + i * 0.05,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                className="rounded-sm border border-border bg-card px-4 py-2.5 mono-xs uppercase text-ink"
              >
                {f.label}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="mt-10 h-14 w-px bg-border"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            style={{ originY: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          />

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <p className="display-md text-ink">DhruvSetu</p>
            <p className="mono-xs mt-3 uppercase text-teal">One operational record</p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------- The core promise ----------------------------- */

const pillars = [
  {
    key: "PLAN",
    copy: "Mission scope, readiness, personnel and permits.",
    detail: ["Expedition E-46", "6 readiness gates", "Permits tracked with evidence"],
    tone: "connected" as const,
    state: "Gates active",
  },
  {
    key: "MOVE",
    copy: "Cargo demands, manifests, custody and transit.",
    detail: ["214 cargo lines", "38 containers sealed", "Custody chain recorded"],
    tone: "syncing" as const,
    state: "In transit",
  },
  {
    key: "OPERATE",
    copy: "Inventory, assets, personnel, stations and field sorties.",
    detail: ["Bharati & Maitri", "Asset register live", "Sortie check-ins"],
    tone: "connected" as const,
    state: "Operating",
  },
  {
    key: "RESPOND",
    copy: "Emergency incidents, acknowledgements, response and audit.",
    detail: ["P0 priority delivery", "Responder assignment", "Full audit trail"],
    tone: "warning" as const,
    state: "Standby",
  },
];

export function PromiseSection() {
  return (
    <Section id="capabilities">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h2 className="display-lg text-ink">
              Plan.
              <br />
              Move.
              <br />
              Operate.
              <br />
              Respond.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-sm text-[0.98rem] leading-relaxed text-muted-foreground">
              One system connecting the expedition from first readiness gate to final closeout.
            </p>
          </Reveal>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {pillars.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.06}>
              <article className="group grid gap-4 py-8 transition-colors duration-300 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-8">
                <div>
                  <p className="text-[0.95rem] font-semibold tracking-[-0.01em] text-ink">
                    {p.key}
                  </p>
                  <span className="mono-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <div>
                  <p className="text-[0.98rem] leading-relaxed text-ink">{p.copy}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {p.detail.map((d) => (
                      <li
                        key={d}
                        className="mono-xs text-muted-foreground before:mr-2 before:text-teal before:content-['—']"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                  <StatusBadge tone={p.tone} label={p.state} className="mt-4" dense />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
