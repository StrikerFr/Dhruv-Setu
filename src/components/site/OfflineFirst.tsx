import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Section, SectionHeader, StatusBadge } from "./primitives";
import { cn } from "@/lib/utils";

const stages = [
  "Connected",
  "Mission data downloaded",
  "Edge device",
  "No connection",
  "Operate locally",
  "Operations queued",
  "Connection restored",
  "Priority synchronization",
];

type QueueItem = {
  priority: "P0" | "P1" | "P2";
  label: string;
  id: string;
};

const queue: QueueItem[] = [
  { priority: "P0", label: "Emergency incident", id: "INC-2291" },
  { priority: "P1", label: "Cargo custody update", id: "C-128" },
  { priority: "P1", label: "Personnel check-in", id: "FT-07" },
  { priority: "P2", label: "Daily station report", id: "RPT-0914" },
];

const syncStateFor = (step: number, index: number) => {
  if (step < 6) return index === 0 ? "Queued" : "Queued";
  const order = step - 6; // 0 -> P0 delivering, 1 -> P1, 2 -> P2
  if (index === 0) return order >= 0 ? "Delivered" : "Queued";
  if (index <= 2) return order >= 1 ? "Delivered" : order === 0 ? "Syncing" : "Queued";
  return order >= 2 ? "Syncing" : "Queued";
};

const toneFor = (state: string) =>
  state === "Delivered" ? "connected" : state === "Syncing" ? "syncing" : "pending";

export function OfflineFirstSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-30%" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 9), 1400);
    return () => clearInterval(t);
  }, [inView, reduced]);

  const offline = step >= 3 && step <= 5;
  const restored = step >= 6;

  return (
    <Section id="how-it-works" dark>
      <SectionHeader
        onDark
        eyebrow="Offline-first"
        title="Built for the edge."
        lede="Connectivity cannot be the dependency for critical operations. Operate locally when connectivity disappears; when the link returns, the most critical events synchronize first."
      />

      <div
        ref={ref}
        className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16"
      >
        <ol className="relative border-l border-onnavy/15 pl-6">
          {stages.map((s, i) => {
            const active = step >= i;
            return (
              <li key={s} className="relative py-3">
                <span
                  className={cn(
                    "absolute -left-[26px] top-[18px] size-[7px] rounded-full border transition-colors duration-500",
                    active
                      ? i === 3
                        ? "border-orange bg-orange"
                        : "border-cyan bg-cyan"
                      : "border-onnavy/30 bg-transparent",
                  )}
                />
                <p
                  className={cn(
                    "mono-xs uppercase transition-colors duration-500",
                    active ? "text-onnavy" : "text-onnavy-muted/60",
                  )}
                >
                  {s}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="rounded-sm border border-onnavy/12 bg-onnavy/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-onnavy/12 pb-4">
            <p className="mono-xs uppercase text-onnavy">Edge node 04 · Bharati</p>
            <StatusBadge
              tone={offline ? "offline" : restored ? "syncing" : "connected"}
              label={offline ? "Offline" : restored ? "Synchronizing" : "Connected"}
              dense
            />
          </div>

          <ul className="mt-4 divide-y divide-onnavy/10">
            {queue.map((q, i) => {
              const state = syncStateFor(step, i);
              return (
                <motion.li
                  key={q.id}
                  layout
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "mono-xs rounded-sm border px-1.5 py-0.5",
                        q.priority === "P0"
                          ? "border-critical/60 text-critical"
                          : q.priority === "P1"
                            ? "border-cyan/50 text-cyan"
                            : "border-onnavy/25 text-onnavy-muted",
                      )}
                    >
                      {q.priority}
                    </span>
                    <span className="truncate text-[0.85rem] text-onnavy">{q.label}</span>
                    <span className="mono-xs hidden text-onnavy-muted sm:inline">{q.id}</span>
                  </span>
                  <StatusBadge tone={toneFor(state)} label={state} dense />
                </motion.li>
              );
            })}
          </ul>

          <p className="mono-xs mt-5 border-t border-onnavy/12 pt-4 uppercase text-onnavy-muted">
            P0 emergency delivery precedes all operational traffic · Synthetic data
          </p>
        </div>
      </div>
    </Section>
  );
}
