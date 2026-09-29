import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { auditService, cargoService } from "@/demo/services";
import { CustodyTimeline } from "@/components/app/records";
import {
  btn,
  Btn,
  DataTable,
  Field,
  inputCls,
  KV,
  Modal,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
  Tabs,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/cargo/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Cargo ${params.id} | DhruvSetu` },
      {
        name: "description",
        content: `Custody, items, evidence, exceptions and audit history for cargo ${params.id}.`,
      },
      { property: "og:title", content: `Cargo ${params.id} | DhruvSetu` },
      { property: "og:description", content: "Cargo custody record (synthetic data)." },
    ],
  }),
  component: CargoDetail,
  notFoundComponent: () => (
    <p className="text-muted-foreground">This cargo record does not exist in the simulation.</p>
  ),
});

const TABS = ["Overview", "Custody", "Items", "Evidence", "Exceptions", "Audit"];
const DISPOSITIONS = [
  "Damage logged: replacement requested",
  "Repaired on station: returned to service",
  "Written off: insurer notified",
];

function CargoDetail() {
  const { id } = Route.useParams();
  const { state, actions } = useDemo();
  const c = cargoService.byId(state, id);
  const [tab, setTab] = useState("Overview");
  const [resolving, setResolving] = useState(false);
  const [disp, setDisp] = useState(DISPOSITIONS[0]);
  if (!c) throw notFound();
  const openEx = !!c.exception && !c.exceptionResolved;
  const history = auditService.forRecord(state, c.id);

  return (
    <>
      <PageHeader
        eyebrow={`Manifest ${c.manifest} · ${c.container}`}
        title={`Cargo ${c.id}`}
        subtitle={c.item}
        badges={
          <>
            <StatusBadge status={c.criticality} />
            {c.exception && <StatusBadge status={c.exceptionResolved ? "RESOLVED" : c.exception} />}
            <SyncBadge state={c.sync} />
          </>
        }
        actions={
          <>
            <Link to="/manifests" className={btn()}>
              Manifest {c.manifest}
            </Link>
            {c.sync === "CONFLICT" && (
              <Link to="/conflicts" className={btn()}>
                Review conflict
              </Link>
            )}
            {openEx && (
              <span data-guide="exception">
                <Btn variant="primary" onClick={() => setResolving(true)}>
                  Resolve Exception
                </Btn>
              </span>
            )}
          </>
        }
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Overview" && (
        <div className="space-y-6">
          <Panel title="Record">
            <KV
              cols={4}
              items={[
                ["Container", c.container],
                ["Owner", c.owner],
                ["Destination", c.destination],
                ["Hazard", c.hazard ?? "None"],
                ["Weight", `${c.weight} kg`],
                ["Current custody", c.custody],
                ["Last confirmed", c.lastConfirmed],
                ["ETA", c.eta],
              ]}
            />
          </Panel>
          <Panel title="Custody" data-guide="custody">
            <CustodyTimeline cargo={c} />
          </Panel>
        </div>
      )}
      {tab === "Custody" && (
        <Panel title="Custody chain" data-guide="custody">
          <CustodyTimeline cargo={c} />
        </Panel>
      )}
      {tab === "Items" && (
        <Panel title="Packed items">
          <DataTable
            rows={[
              { n: 1, d: c.item, q: 1, u: "unit" },
              { n: 2, d: "Packing documentation", q: 1, u: "set" },
              { n: 3, d: "Shock indicator label", q: 2, u: "pcs" },
            ]}
            rowKey={(r) => String(r.n)}
            columns={[
              { key: "n", header: "Line", render: (r) => <Mono>{r.n}</Mono> },
              { key: "d", header: "Description", render: (r) => r.d },
              { key: "q", header: "Qty", render: (r) => `${r.q} ${r.u}` },
            ]}
          />
        </Panel>
      )}
      {tab === "Evidence" && (
        <Panel title="Evidence">
          <ul className="divide-y divide-hairline/70">
            {[
              ["Packing list (signed)", "Complete"],
              ["Seal photograph", "Complete"],
              [
                c.hazard ? `Dangerous goods declaration (${c.hazard})` : "Customs declaration",
                c.id === "C-128" && state.gates.find((g) => g.id === "g4")?.blocker
                  ? "Missing"
                  : "Complete",
              ],
            ].map(([d, s]) => (
              <li key={d} className="flex items-center justify-between py-3.5 text-[15px]">
                <span className="text-ink">{d}</span>
                <StatusBadge status={s === "Missing" ? "MISSING" : "COMPLETE"} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {tab === "Exceptions" && (
        <Panel title="Exceptions">
          {c.exception ? (
            <div className="rounded-[8px] border border-hairline p-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={c.exception} />
                <StatusBadge status={c.exceptionResolved ? "RESOLVED" : "OPEN"} />
              </div>
              <p className="mt-3 text-[15px] text-ink">
                {c.exception === "DAMAGED"
                  ? "Casing impact damage observed on receipt; shock indicator triggered."
                  : c.exception === "MISSING"
                    ? "Item not present at receipt against manifest."
                    : "Held pending customs documentation."}
              </p>
              {openEx && (
                <Btn variant="primary" className="mt-5" onClick={() => setResolving(true)}>
                  Resolve Exception
                </Btn>
              )}
            </div>
          ) : (
            <p className="text-[15px] text-muted-foreground">
              No exceptions have been raised for this cargo.
            </p>
          )}
        </Panel>
      )}
      {tab === "Audit" && (
        <Panel title="Audit history">
          <DataTable
            rows={history}
            rowKey={(r) => r.id}
            empty={
              <p className="text-[15px] text-muted-foreground">
                No audit events have been recorded for this cargo in this session.
              </p>
            }
            columns={[
              { key: "t", header: "Time", render: (r) => <Mono>{r.ts}</Mono> },
              { key: "u", header: "User", render: (r) => r.user },
              { key: "a", header: "Action", render: (r) => r.action },
              { key: "o", header: "Old → New", render: (r) => `${r.oldState} → ${r.newState}` },
              { key: "d", header: "Device", render: (r) => r.device },
              { key: "s", header: "Sync", render: (r) => <SyncBadge state={r.sync} /> },
            ]}
          />
        </Panel>
      )}
      <Modal
        open={resolving}
        onClose={() => setResolving(false)}
        title={`Resolve exception · ${c.id}`}
        footer={
          <>
            <Btn onClick={() => setResolving(false)}>Cancel</Btn>
            <Btn
              variant="primary"
              onClick={() => {
                actions.resolveCargoException(c.id, disp);
                setResolving(false);
              }}
            >
              Record disposition
            </Btn>
          </>
        }
      >
        <Field label="Disposition">
          <select value={disp} onChange={(e) => setDisp(e.target.value)} className={inputCls}>
            {DISPOSITIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <p className="mt-4 text-[13.5px] text-muted-foreground">
          The exception record is preserved. Resolution is appended to the audit trail; it is never
          deleted.
        </p>
      </Modal>
    </>
  );
}
