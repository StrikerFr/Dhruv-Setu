import { motion, useReducedMotion } from "motion/react";
import { ActionButton, StatusBadge } from "./primitives";

const nodes = [
  { id: "goa", label: "GOA", sub: "Mobilisation", x: 12, y: 78 },
  { id: "mumbai", label: "TRANSIT HUB", sub: "Mumbai", x: 30, y: 58 },
  { id: "cpt", label: "CAPE TOWN", sub: "Staging", x: 50, y: 44 },
  { id: "vessel", label: "POLAR VESSEL", sub: "MV Ashwini", x: 68, y: 52 },
  { id: "bharati", label: "BHARATI", sub: "Station", x: 86, y: 30 },
  { id: "field", label: "FIELD TEAM 07", sub: "Sortie", x: 92, y: 74 },
];

const path = "M 12 78 L 30 58 L 50 44 L 68 52 L 86 30 M 86 30 L 92 74";

export function HeroVisual() {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-[320px] w-full sm:h-[400px] lg:h-[480px]">
      <div className="absolute inset-0 hairline-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <motion.path
          d={path}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth="0.25"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 0.61, 0.36, 1] }}
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          className="flow-dash"
          opacity="0.85"
        />
      </svg>

      {nodes.map((n, i) => (
        <motion.div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 + i * 0.16, duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="relative flex size-2 items-center justify-center">
              {(n.id === "bharati" || n.id === "vessel") && (
                <span className="absolute size-2 rounded-full bg-teal node-pulse" />
              )}
              <span className="relative size-[7px] rounded-full border border-navy bg-background" />
            </span>
            <span className="mono-xs whitespace-nowrap text-[0.6rem] uppercase text-ink">
              {n.label}
            </span>
            <span className="mono-xs hidden whitespace-nowrap text-[0.58rem] text-muted-foreground sm:block">
              {n.sub}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const annotations = [
  {
    title: "BHARATI STATION",
    tone: "connected" as const,
    state: "Connected",
    meta: "Last confirmed 14:32 IST",
  },
  {
    title: "CARGO C-128",
    tone: "syncing" as const,
    state: "In transit",
    meta: "Cape Town → Bharati",
  },
  {
    title: "EDGE NODE 04",
    tone: "offline" as const,
    state: "Offline",
    meta: "3 operations queued",
  },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] flex-col justify-center px-6 pb-16 pt-28 md:px-10 md:pt-32"
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16">
        <div>
          <motion.p
            className="eyebrow text-teal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Polar Operations Platform
          </motion.p>

          <motion.h1
            className="display-xl mt-6 text-balance text-ink"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            One operational record
            <br className="hidden sm:block" /> for polar expeditions.
          </motion.h1>

          <motion.p
            className="mt-7 max-w-xl text-[1rem] leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            From mission readiness to cargo custody, station operations and emergency response |
            DhruvSetu connects the expedition lifecycle into one operational system.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <ActionButton href="/dashboard">Launch Platform</ActionButton>
            <ActionButton href="#platform" variant="ghost" arrow={false}>
              Explore the System
            </ActionButton>
          </motion.div>

          <motion.p
            className="mono-xs mt-8 uppercase text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            Offline-first • Auditable • Built for the edge
          </motion.p>
        </div>

        <div>
          <HeroVisual />
          <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
            {annotations.map((a) => (
              <div key={a.title} className="bg-card p-4">
                <p className="mono-xs uppercase text-ink">{a.title}</p>
                <StatusBadge tone={a.tone} label={a.state} className="mt-2" dense />
                <p className="mono-xs mt-2 text-muted-foreground">{a.meta}</p>
              </div>
            ))}
          </div>
          <p className="mono-xs mt-3 uppercase text-muted-foreground">
            Synthetic demonstration data • 46th ISEA
          </p>
        </div>
      </div>
    </section>
  );
}
