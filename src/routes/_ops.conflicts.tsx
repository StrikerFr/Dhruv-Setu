import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import {
  btn,
  Btn,
  EmptyState,
  KV,
  Modal,
  PageHeader,
  Panel,
  StatusBadge,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/conflicts")({
  head: () => ({
    meta: [
      { title: "Conflict Center | DhruvSetu" },
      {
        name: "description",
        content: "Review edge-versus-central conflicts. No destructive silent overwrite.",
      },
      { property: "og:title", content: "Conflict Center | DhruvSetu" },
      { property: "og:description", content: "Versioned conflict review for offline operations." },
    ],
  }),
  component: Conflicts,
});

function Conflicts() {
  const { state, actions } = useDemo();
  const [review, setReview] = useState<string | null>(null);
  const open = state.conflicts.filter((c) => c.status === "REVIEW REQUIRED");
  const done = state.conflicts.filter((c) => c.status === "RESOLVED");
  const cur = review ? state.conflicts.find((c) => c.id === review) : null;

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Conflict Center"
        subtitle="When edge and central disagree, both versions are kept until a person decides."
      />
      <div data-guide="conflicts" className="space-y-4">
        {open.length === 0 && (
          <EmptyState
            text="No conflicts currently require review. Receive cargo offline on the Edge tablet and reconnect to see how conflicts are handled."
            action={
              <Link to="/edge" className={btn()}>
                Open Edge tablet
              </Link>
            }
          />
        )}
        <AnimatePresence>
          {open.map((c) => (
            <motion.div key={c.id} layout exit={{ opacity: 0, height: 0 }}>
              <Panel
                eyebrow={`Conflict #${c.id.slice(3)}`}
                title={`${c.record.startsWith("C-") ? "Cargo" : "Record"} ${c.record}`}
                action={<StatusBadge status={c.status} />}
                className="border-orange/40"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[8px] border border-hairline p-5">
                    <p className="eyebrow text-muted-foreground">Server · version {c.base}</p>
                    <p className="mt-2 text-[22px] font-semibold text-ink">{c.server}</p>
                  </div>
                  <div className="rounded-[8px] border border-orange/40 bg-orange/[0.04] p-5">
                    <p className="eyebrow text-orange">Edge · version {c.current}</p>
                    <p className="mt-2 text-[22px] font-semibold text-ink">{c.edge}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <KV
                    cols={4}
                    items={[
                      ["Field", c.field],
                      ["Base version", String(c.base)],
                      ["Current version", String(c.current)],
                      ["Status", "Review required"],
                    ]}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Btn onClick={() => setReview(c.id)}>Review</Btn>
                  <Btn variant="primary" onClick={() => actions.resolveConflict(c.id, "accept")}>
                    Accept Edge Event
                  </Btn>
                  <Btn onClick={() => actions.resolveConflict(c.id, "reject")}>Reject</Btn>
                  <Btn onClick={() => actions.resolveConflict(c.id, "exception")}>
                    Create Exception
                  </Btn>
                </div>
                <p className="mt-4 text-[13px] text-muted-foreground">
                  Every option appends a new version. Neither the server nor the edge event is
                  deleted.
                </p>
              </Panel>
            </motion.div>
          ))}
        </AnimatePresence>
        {done.length > 0 && (
          <Panel title="Resolved">
            <ul className="divide-y divide-hairline/70">
              {done.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <span>
                    <span className="font-mono text-[13px] font-medium">{c.id}</span>
                    <span className="ml-3 text-ink">
                      {c.record} · {c.field}
                    </span>
                  </span>
                  <span className="text-[13.5px] text-muted-foreground">{c.resolution}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
      <Modal
        open={!!cur}
        onClose={() => setReview(null)}
        title={cur ? `Review ${cur.id}` : ""}
        wide
      >
        {cur && (
          <ol className="space-y-3 border-l border-hairline pl-5 text-[14.5px]">
            <li>
              <span className="font-mono text-muted-foreground">v{cur.base}</span> · Common base:
              both sides agreed.
            </li>
            <li>
              <span className="font-mono text-muted-foreground">v{cur.base + 1}</span> · Central:{" "}
              <strong>{cur.server}</strong> (reconciliation at Cape Town, online)
            </li>
            <li>
              <span className="font-mono text-muted-foreground">v{cur.current}</span> · Edge:{" "}
              <strong>{cur.edge}</strong> (Bharati Edge 01, recorded offline)
            </li>
            <li className="text-muted-foreground">
              Recommendation: accept the edge event (the latest physical observation) and keep the
              exception open.
            </li>
          </ol>
        )}
      </Modal>
    </>
  );
}
