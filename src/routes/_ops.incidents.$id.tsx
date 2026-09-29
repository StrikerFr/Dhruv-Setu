import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import {
  btn,
  Btn,
  Field,
  inputCls,
  KV,
  Modal,
  Mono,
  Panel,
  StatusBadge,
  SyncBadge,
} from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/incidents/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Incident Command · ${params.id} | DhruvSetu` },
      {
        name: "description",
        content: "Incident command: information, response state, actions and a complete timeline.",
      },
      { property: "og:title", content: `Incident Command ${params.id} | DhruvSetu` },
      { property: "og:description", content: "Emergency response record (synthetic)." },
    ],
  }),
  component: IncidentCommand,
  notFoundComponent: () => <p className="text-muted-foreground">Incident not found.</p>,
});

const STEPS = ["REPORTED", "DELIVERED", "ACKNOWLEDGED", "RESPONDING", "RESOLVED"] as const;

function IncidentCommand() {
  const { id } = Route.useParams();
  const { state, actions } = useDemo();
  const inc = state.incidents.find((i) => i.id === id);
  const [modal, setModal] = useState<null | "assign" | "action">(null);
  const [text, setText] = useState("");
  if (!inc) throw notFound();

  const stepIdx =
    inc.status === "LOCAL"
      ? 0
      : inc.status === "ACK REQUIRED"
        ? 1
        : inc.status === "ACKNOWLEDGED"
          ? 2
          : inc.status === "RESPONDING"
            ? 3
            : 4;
  const p0 = inc.severity === "P0" && inc.status !== "RESOLVED";

  return (
    <>
      <div
        className={cn(
          "mb-8 rounded-[12px] border p-6 md:p-8",
          p0 ? "border-critical/50 bg-critical/[0.03]" : "border-hairline bg-card",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow text-muted-foreground">Incident Command</p>
          <SyncBadge state={inc.sync} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-[34px] font-semibold tracking-[0.02em] text-ink md:text-[42px]">
            {inc.id}
          </h1>
          <StatusBadge status={inc.severity} className="h-7 text-[12px]" />
          <span
            className={cn(
              "rounded-[5px] px-2 py-1 font-mono text-[12px] tracking-[0.1em]",
              inc.severity === "P0"
                ? "bg-critical text-destructive-foreground"
                : "bg-surface text-ink",
            )}
          >
            {inc.severity === "P0" ? "CRITICAL" : inc.severity === "P1" ? "HIGH" : "MODERATE"}
          </span>
        </div>
        <p className="mt-2 text-[22px] font-semibold uppercase tracking-[0.04em] text-ink">
          {inc.type}
        </p>
        <p className="text-[15px] text-muted-foreground">{inc.location.toUpperCase()}</p>

        <ol className="mt-8 grid grid-cols-5 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className={cn(
                    "h-full",
                    i <= stepIdx
                      ? inc.status === "RESOLVED"
                        ? "bg-teal"
                        : i === stepIdx && stepIdx < 2
                          ? "bg-critical"
                          : "bg-teal"
                      : "",
                  )}
                  initial={false}
                  animate={{ width: i <= stepIdx ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p
                className={cn(
                  "mt-2 font-mono text-[10.5px] tracking-[0.08em] md:text-[11.5px]",
                  i <= stepIdx ? "text-ink" : "text-muted-foreground",
                )}
              >
                {s}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {inc.status === "LOCAL" && (
        <div className="mb-6 rounded-[10px] border border-orange/40 bg-orange/[0.05] p-5">
          <p className="font-semibold text-ink">
            Stored locally on Bharati Edge 01 (central delivery pending)
          </p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Queued as P0. It will be the first operation delivered when the link returns.
          </p>
          <Btn className="mt-3" onClick={() => void actions.reconnect()}>
            Reconnect now
          </Btn>
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Incident information">
          <p className="mb-6 text-[15.5px] leading-relaxed text-ink">{inc.description}</p>
          <KV
            items={[
              ["Type", inc.type],
              ["Location", inc.location],
              ["Reported", `${inc.reported} IST`],
              ["Personnel involved", String(inc.personnel)],
              ["Severity", inc.severity],
              ["Source", inc.timeline[0]?.by ?? "—"],
            ]}
          />
        </Panel>
        <Panel title="Response state">
          <div className="mb-6 flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.span
                key={inc.status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <StatusBadge status={inc.status} className="h-8 px-3 text-[12.5px]" />
              </motion.span>
            </AnimatePresence>
          </div>
          <KV
            items={[
              ["Responder", inc.responder ?? "Unassigned"],
              ["Actions logged", String(inc.actions.length)],
              ["Delivery", inc.sync === "LOCAL" ? "Pending (P0)" : "Delivered"],
              ["Commander", "Aryan Garg"],
            ]}
          />
          {inc.actions.length > 0 && (
            <ul className="mt-5 space-y-1.5 text-[14px]">
              {inc.actions.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          )}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Btn
              size="lg"
              variant="danger"
              disabled={inc.status !== "ACK REQUIRED"}
              onClick={() => actions.incidentUpdate(inc.id, "ack")}
            >
              ACKNOWLEDGE
            </Btn>
            <Btn
              size="lg"
              disabled={inc.status === "RESOLVED" || inc.status === "LOCAL"}
              onClick={() => {
                setText("SAR Team Alpha (PistenBully PB-02)");
                setModal("assign");
              }}
            >
              ASSIGN RESPONDER
            </Btn>
            <Btn
              size="lg"
              disabled={inc.status === "RESOLVED" || inc.status === "LOCAL"}
              onClick={() => {
                setText("");
                setModal("action");
              }}
            >
              ADD ACTION
            </Btn>
            <Btn
              size="lg"
              variant="teal"
              disabled={
                inc.status === "RESOLVED" || inc.status === "LOCAL" || inc.status === "ACK REQUIRED"
              }
              onClick={() => actions.incidentUpdate(inc.id, "resolve")}
            >
              RESOLVE INCIDENT
            </Btn>
          </div>
        </Panel>
      </div>

      <Panel
        title="Incident timeline"
        action={
          <Link to="/audit" className={btn("ghost", "sm")}>
            Audit trail
          </Link>
        }
      >
        <ol className="relative ml-2 border-l border-hairline">
          <AnimatePresence initial={false}>
            {inc.timeline.map((t, i) => (
              <motion.li
                key={`${t.ts}-${t.label}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative pb-5 pl-6 last:pb-0"
              >
                <span
                  className={cn(
                    "absolute -left-[5px] top-1.5 size-2.5 rounded-full",
                    i === inc.timeline.length - 1 ? "bg-teal" : "bg-hairline",
                  )}
                />
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <Mono className="text-ink">{t.ts}</Mono>
                  <span className="text-[15px] font-medium text-ink">{t.label}</span>
                  {t.by && <span className="text-[13px] text-muted-foreground">{t.by}</span>}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </Panel>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "assign" ? "Assign responder" : "Add action"}
        footer={
          <>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn
              variant="primary"
              disabled={!text}
              onClick={() => {
                actions.incidentUpdate(inc.id, modal === "assign" ? "assign" : "action", text);
                setModal(null);
              }}
            >
              Save
            </Btn>
          </>
        }
      >
        <Field label={modal === "assign" ? "Responder" : "Action"}>
          {modal === "assign" ? (
            <select className={inputCls} value={text} onChange={(e) => setText(e.target.value)}>
              {[
                "SAR Team Alpha (PistenBully PB-02)",
                "Medical Officer + Field Guide",
                "Helicopter standby (Maitri)",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              className={inputCls}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Iridium contact attempted on channel 2"
            />
          )}
        </Field>
      </Modal>
    </>
  );
}
