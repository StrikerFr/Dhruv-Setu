import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { Mono, PageHeader, Panel } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/waste")({
  head: () => ({
    meta: [
      { title: "Waste | DhruvSetu" },
      { name: "description", content: "Waste lifecycle from generation to backhaul and closure." },
      { property: "og:title", content: "Waste | DhruvSetu" },
      {
        property: "og:description",
        content: "Waste records tracked through seven lifecycle stages (synthetic).",
      },
    ],
  }),
  component: Waste,
});

const STAGES = [
  "Generated",
  "Segregated",
  "Stored",
  "Backhaul planned",
  "Loaded",
  "Backhauled",
  "Closed",
];

function Waste() {
  const { state } = useDemo();
  const [stages, setStages] = useState<Record<string, number>>({});
  const stageOf = (r: { Record: string; Stage: string }) => stages[r.Record] ?? Number(r.Stage);
  const counts = STAGES.map((_, i) => state.waste.filter((r) => stageOf(r as never) === i).length);

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Waste"
        subtitle="All waste leaves Antarctica. Each record moves through seven stages."
      />
      <Panel className="mb-6" title="Lifecycle">
        <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-hairline bg-hairline sm:grid-cols-4 lg:grid-cols-7">
          {STAGES.map((s, i) => (
            <li key={s} className="bg-card p-4">
              <Mono className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</Mono>
              <p className="mt-1 text-[14px] font-medium text-ink">{s}</p>
              <p className="mt-2 text-[26px] font-semibold tabular-nums text-ink">{counts[i]}</p>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="Records">
        <ul className="divide-y divide-hairline/70">
          {state.waste.map((r) => {
            const st = stageOf(r as never);
            return (
              <li key={r.Record} className="flex flex-wrap items-center gap-4 py-4">
                <Mono className="w-16 font-medium">{r.Record}</Mono>
                <span className="w-36 text-ink">{r.Stream}</span>
                <Mono className="w-20 text-muted-foreground">{r.Quantity}</Mono>
                <div
                  className="flex flex-1 gap-1"
                  aria-label={`Stage ${st + 1} of 7: ${STAGES[st]}`}
                >
                  {STAGES.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        i <= st ? "bg-teal" : "bg-surface",
                      )}
                    />
                  ))}
                </div>
                <span className="w-36 text-[13.5px] text-muted-foreground">{STAGES[st]}</span>
                <button
                  disabled={st >= 6}
                  onClick={() => setStages((p) => ({ ...p, [r.Record]: st + 1 }))}
                  className="h-9 rounded-[6px] border border-hairline px-3 text-[13px] text-navy hover:bg-surface disabled:opacity-40"
                >
                  Advance
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
