import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useDemo } from "@/demo/engine";
import { personnelService } from "@/demo/services";
import { Btn, Mono, PageHeader } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/muster")({
  head: () => ({
    meta: [
      { title: "Muster: Field Team 07 | DhruvSetu" },
      { name: "description", content: "Rapid personnel accountability for Field Team 07." },
      { property: "og:title", content: "Muster | DhruvSetu" },
      {
        property: "og:description",
        content: "Expected, accounted and missing personnel at a glance.",
      },
    ],
  }),
  component: Muster,
});

function Muster() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const team = personnelService.team(state, "Field Team 07");
  const ok = team.filter((p) => p.accounted).length;
  const missing = team.length - ok;

  return (
    <>
      <PageHeader
        eyebrow="People · Muster"
        title="Field Team 07"
        subtitle="Sortie S-024 · Bharati → Field Camp 08"
      />
      <div
        className={cn(
          "mb-8 grid grid-cols-3 overflow-hidden rounded-[12px] border",
          missing ? "border-critical/40" : "border-teal/40",
        )}
      >
        {[
          ["Expected", team.length, ""],
          ["Accounted", ok, "text-teal"],
          ["Missing", missing, missing ? "text-critical" : "text-ink"],
        ].map(([k, v, c]) => (
          <div
            key={k as string}
            className="border-r border-hairline/70 bg-card px-4 py-6 text-center last:border-0 md:py-8"
          >
            <p className="eyebrow text-muted-foreground">{k}</p>
            <motion.p
              key={String(v)}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "mt-2 text-[48px] font-semibold leading-none tabular-nums md:text-[64px]",
                c as string,
              )}
            >
              {String(v).padStart(2, "0")}
            </motion.p>
          </div>
        ))}
      </div>
      <ul className="mb-8 space-y-2">
        <AnimatePresence initial={false}>
          {team.map((p) => (
            <motion.li
              layout
              key={p.id}
              className={cn(
                "flex min-h-[64px] flex-wrap items-center gap-4 rounded-[10px] border bg-card px-5 py-3",
                p.accounted ? "border-hairline" : "border-critical/50 bg-critical/[0.03]",
              )}
            >
              <span
                aria-hidden
                className={cn("text-[20px]", p.accounted ? "text-teal" : "text-critical")}
              >
                {p.accounted ? "✓" : "⚠"}
              </span>
              <span className="min-w-[160px] flex-1">
                <span className="block text-[16px] font-medium text-ink">{p.name}</span>
                <span className="text-[13px] text-muted-foreground">{p.role}</span>
              </span>
              <Mono className="text-muted-foreground">Last confirmed {p.lastConfirmed}</Mono>
              <span className="sr-only">{p.accounted ? "Accounted" : "Not accounted"}</span>
              {!p.accounted && (
                <Btn variant="teal" size="lg" onClick={() => actions.musterMark(p.id)}>
                  Mark accounted
                </Btn>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="grid gap-3 sm:grid-cols-3">
        <Btn
          size="lg"
          variant="teal"
          disabled={!missing}
          onClick={() => team.filter((p) => !p.accounted).forEach((p) => actions.musterMark(p.id))}
        >
          MARK ACCOUNTED
        </Btn>
        <Btn size="lg" disabled={!missing} onClick={() => actions.escalateMuster("Field Team 07")}>
          ESCALATE
        </Btn>
        <Btn
          size="lg"
          variant="danger"
          onClick={() => {
            const id = actions.createIncident({
              type: "Personnel Unaccounted",
              location: "Field Camp 08",
              personnel: missing || 1,
              description: "Muster incomplete for Field Team 07.",
              device: "Central Portal",
            });
            navigate({ to: "/incidents/$id", params: { id } });
          }}
        >
          CREATE INCIDENT
        </Btn>
      </div>
    </>
  );
}
