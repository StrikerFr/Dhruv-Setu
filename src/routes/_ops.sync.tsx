import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { syncService } from "@/demo/services";
import type { SyncOp } from "@/demo/types";
import { SyncProgress } from "@/components/app/SyncProgress";
import {
  btn,
  Btn,
  DataTable,
  FilterSelect,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
} from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/sync")({
  head: () => ({
    meta: [
      { title: "Synchronization | DhruvSetu" },
      {
        name: "description",
        content:
          "Priority sync queue across central and edge nodes: P0 emergency, P1 operational, P2 background.",
      },
      { property: "og:title", content: "Synchronization | DhruvSetu" },
      {
        property: "og:description",
        content: "Offline-first synchronization with priority ordering (simulation).",
      },
    ],
  }),
  component: SyncPage,
});

function SyncPage() {
  const { state, actions } = useDemo();
  const q = syncService.byPriority(state);
  const [prio, setPrio] = useState("");
  const [showDone, setShowDone] = useState(false);
  const rows = state.syncQueue.filter(
    (o) => (!prio || o.priority === prio) && (showDone || o.status !== "SYNCED"),
  );
  const conn = state.connection;

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Synchronization"
        subtitle="Emergency traffic always moves first. Nothing is discarded while offline."
        actions={
          <>
            {conn === "CONNECTED" && <Btn onClick={actions.disconnect}>Simulate disconnect</Btn>}
            {conn === "OFFLINE" && (
              <Btn variant="primary" onClick={() => void actions.reconnect()}>
                Reconnect
              </Btn>
            )}
            <Link to="/edge" className={btn()}>
              Open Edge tablet
            </Link>
          </>
        }
      />
      <div className="mb-6 grid gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline md:grid-cols-4">
        <div className="bg-card p-5">
          <p className="eyebrow text-muted-foreground">Central</p>
          <div className="mt-3">
            <StatusBadge status="CONNECTED" />
          </div>
        </div>
        {state.edgeNodes.map((n) => (
          <div key={n.id} className="bg-card p-5">
            <p className="eyebrow text-muted-foreground">{n.name}</p>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={n.state} />
              <Mono className="text-muted-foreground">{n.lastSync}</Mono>
            </div>
          </div>
        ))}
      </div>

      {(state.syncPhase || state.lastSummary) && (
        <div className="mb-6">
          <SyncProgress />
        </div>
      )}

      {conn === "OFFLINE" && !state.syncPhase && (
        <Panel className="mb-6 border-orange/40">
          <p className="text-[16px] font-semibold text-ink">Unable to synchronize</p>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            Reason: connection unavailable. Operations remain safely stored locally.
          </p>
          <Btn className="mt-4" onClick={() => void actions.reconnect()}>
            Retry
          </Btn>
        </Panel>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {(
          [
            ["P0", "Emergency"],
            ["P1", "Operational"],
            ["P2", "Background"],
          ] as const
        ).map(([p, l]) => (
          <div
            key={p}
            className={cn(
              "rounded-[10px] border bg-card p-6",
              p === "P0" ? "border-critical/30" : "border-hairline",
            )}
          >
            <p
              className={cn(
                "font-mono text-[13px] font-semibold",
                p === "P0" ? "text-critical" : "text-navy",
              )}
            >
              {p}
            </p>
            <p className="text-[14px] text-muted-foreground">{l}</p>
            <p className="mt-4 text-[44px] font-semibold leading-none tabular-nums text-ink">
              {q[p]}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">pending</p>
          </div>
        ))}
      </div>

      <Panel
        title="Operations"
        action={
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Priority"
              value={prio}
              onChange={setPrio}
              options={["P0", "P1", "P2"]}
            />
            <Btn size="sm" onClick={() => setShowDone((s) => !s)}>
              {showDone ? "Hide synchronized" : "Show synchronized"}
            </Btn>
          </div>
        }
      >
        <DataTable<SyncOp>
          rows={rows}
          rowKey={(r) => r.id}
          dense
          empty={
            <p className="py-8 text-center text-[15px] text-muted-foreground">
              No pending operations match this filter. Everything shown is synchronized.
            </p>
          }
          columns={[
            {
              key: "o",
              header: "Operation",
              primary: true,
              render: (r) => (
                <span>
                  <Mono className="mr-3 text-muted-foreground">{r.id}</Mono>
                  {r.label}
                </span>
              ),
            },
            { key: "r", header: "Record", render: (r) => <Mono>{r.record}</Mono> },
            { key: "p", header: "Priority", render: (r) => <StatusBadge status={r.priority} /> },
            { key: "c", header: "Created", render: (r) => <Mono>{r.created}</Mono> },
            { key: "s", header: "Source", render: (r) => r.source },
            { key: "st", header: "Status", render: (r) => <SyncBadge state={r.status} /> },
          ]}
        />
        <p className="mt-4 text-[13px] text-muted-foreground">
          Maitri Edge 02 operations remain queued on that node until it reconnects. They are visible
          here from its last heartbeat.
        </p>
      </Panel>
    </>
  );
}
