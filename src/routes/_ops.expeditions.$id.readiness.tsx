import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { readinessService } from "@/demo/services";
import { GateBody } from "@/components/app/records";
import { Btn, PageHeader, StatusBadge } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/expeditions/$id/readiness")({
  head: () => ({
    meta: [
      { title: "Readiness: 46th ISEA | DhruvSetu" },
      {
        name: "description",
        content:
          "Six readiness gates, each explained by its actual requirements, owners, due dates and evidence.",
      },
      { property: "og:title", content: "Expedition Readiness | DhruvSetu" },
      {
        property: "og:description",
        content: "Explainable readiness: requirements complete out of total, per gate.",
      },
    ],
  }),
  component: Readiness,
});

function Readiness() {
  const { state, actions } = useDemo();
  const [open, setOpen] = useState<string | null>("g4");
  const rd = readinessService.summary(state);
  return (
    <>
      <PageHeader
        eyebrow="46th ISEA · 2026-2027"
        title="Expedition Readiness"
        subtitle={`${rd.done} of ${rd.total} requirements complete across six gates`}
        badges={
          <span className="rounded-[6px] bg-ice px-3 py-1 font-mono text-[15px] font-semibold text-navy">
            {rd.pct}%
          </span>
        }
      />
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-surface">
        <motion.div className="h-full bg-teal" animate={{ width: `${rd.pct}%` }} />
      </div>
      <ul className="space-y-3">
        {state.gates.map((g) => {
          const st = readinessService.gateStatus(g);
          const done = g.requirements.filter((r) => r.done).length;
          const isOpen = open === g.id;
          return (
            <li
              key={g.id}
              data-guide={`gate-${g.id}`}
              className={cn(
                "rounded-[10px] border bg-card",
                st === "BLOCKED" ? "border-critical/40" : "border-hairline",
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : g.id)}
                aria-expanded={isOpen}
                className="flex min-h-[72px] w-full flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 text-left md:px-6"
              >
                <span className="font-mono text-[13px] text-muted-foreground">{g.n}</span>
                <span className="min-w-[180px] flex-1 text-[17px] font-semibold text-ink">
                  {g.name}
                </span>
                <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
                  {done} / {g.requirements.length}
                </span>
                <StatusBadge status={st} />
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-hairline px-5 py-6 md:px-6">
                      <GateBody gate={g} />
                      {g.blocker && (
                        <Btn
                          variant="primary"
                          className="mt-6"
                          onClick={() => actions.resolveBlocker(g.id)}
                        >
                          Resolve Blocker
                        </Btn>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </>
  );
}
