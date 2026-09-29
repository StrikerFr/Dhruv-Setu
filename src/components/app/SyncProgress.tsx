import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useDemo } from "@/demo/engine";
import { cn } from "@/lib/utils";

const PHASES = [
  "CONNECTING",
  "AUTHENTICATING",
  "SYNCING P0",
  "SYNCING P1",
  "SYNCING P2",
  "COMPLETE",
];

export function SyncProgress({ dark = false }: { dark?: boolean }) {
  const { state } = useDemo();
  const phase = state.syncPhase;
  const sum = state.lastSummary;
  if (!phase && !sum) return null;
  const idx = phase ? PHASES.indexOf(phase) : PHASES.length - 1;
  const muted = dark ? "text-onnavy-muted" : "text-muted-foreground";
  const strong = dark ? "text-onnavy" : "text-ink";

  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-[10px] border p-5",
        dark ? "border-onnavy/15 bg-onnavy/[0.04]" : "border-hairline bg-card",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className={cn("eyebrow", dark ? "text-cyan" : "text-teal")}>Synchronization</p>
        <p className={cn("font-mono text-[12px]", muted)}>{phase ?? "COMPLETE"}</p>
      </div>
      <ol className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {PHASES.map((p, i) => {
          const done = i < idx || (i === idx && p === "COMPLETE");
          const active = i === idx && p !== "COMPLETE";
          return (
            <li key={p} className="min-w-0">
              <div
                className={cn(
                  "h-1 overflow-hidden rounded-full",
                  dark ? "bg-onnavy/10" : "bg-surface",
                )}
              >
                <motion.div
                  className={cn(
                    "h-full",
                    p.includes("P0") ? "bg-critical" : dark ? "bg-cyan" : "bg-teal",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: done ? "100%" : active ? "60%" : "0%" }}
                  transition={{ duration: active ? 0.8 : 0.3 }}
                />
              </div>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 truncate font-mono text-[10.5px] tracking-[0.06em]",
                  done ? strong : active ? strong : muted,
                )}
              >
                {done && <Check aria-hidden className="size-3" />}
                {active && (
                  <span aria-hidden className="inline-block animate-spin">
                    ↻
                  </span>
                )}
                {p.replace("SYNCING ", "SYNC ")}
              </p>
            </li>
          );
        })}
      </ol>
      {sum && (phase === "COMPLETE" || !phase) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 grid grid-cols-3 gap-4 border-t pt-4"
          style={{ borderColor: "color-mix(in oklab, currentColor 12%, transparent)" }}
        >
          {[
            [sum.synced, "operations synchronized"],
            [sum.exceptions, sum.exceptions === 1 ? "exception created" : "exceptions created"],
            [sum.audits, "audit record added"],
          ].map(([n, l]) => (
            <div key={String(l)}>
              <p className={cn("text-[26px] font-semibold tabular-nums leading-none", strong)}>
                {n}
              </p>
              <p className={cn("mt-1 text-[12.5px]", muted)}>{l}</p>
            </div>
          ))}
          {sum.byPriority.P0 > 0 && (
            <p className={cn("col-span-3 font-mono text-[11.5px]", muted)}>
              Order: P0 ×{sum.byPriority.P0} → P1 ×{sum.byPriority.P1} → P2 ×{sum.byPriority.P2} ·
              emergency traffic delivered first
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
