import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDemo } from "@/demo/engine";
import { cargoService } from "@/demo/services";
import type { Manifest } from "@/demo/types";
import {
  btn,
  Btn,
  DataTable,
  Drawer,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/manifests")({
  head: () => ({
    meta: [
      { title: "Manifests | DhruvSetu" },
      {
        name: "description",
        content: "Locked cargo manifests with controlled amendment workflow.",
      },
      { property: "og:title", content: "Manifests | DhruvSetu" },
      {
        property: "og:description",
        content: "Manifest register: items, weights, hazardous lines and lock state.",
      },
    ],
  }),
  component: Manifests,
});

function Manifests() {
  const { state } = useDemo();
  const [sel, setSel] = useState<string | null>(null);
  const m18 = state.manifests.find((m) => m.id === "M-018")!;
  const i18 = cargoService.manifestItems(state, "M-018");
  const summary = (m: Manifest) => {
    const it = cargoService.manifestItems(state, m.id);
    return {
      items: it.length,
      weight: it.reduce((a, c) => a + c.weight, 0),
      haz: it.filter((c) => c.hazard).length,
    };
  };
  const cur = sel ? state.manifests.find((m) => m.id === sel)! : null;
  const curItems = cur ? cargoService.manifestItems(state, cur.id) : [];

  return (
    <>
      <PageHeader
        eyebrow="Logistics"
        title="Manifests"
        subtitle="Manifests lock at dispatch. Changes after lock require a controlled amendment."
      />
      <Panel
        className="mb-6"
        eyebrow="Featured"
        title={`Manifest ${m18.id}`}
        action={<StatusBadge status={m18.status} />}
      >
        <div className="flex flex-wrap items-end gap-10">
          {[
            ["Items", i18.length],
            ["Weight", `${summary(m18).weight.toLocaleString()} kg`],
            ["Hazardous", summary(m18).haz],
          ].map(([k, v]) => (
            <div key={k as string}>
              <p className="eyebrow text-muted-foreground">{k}</p>
              <p className="mt-2 text-[30px] font-semibold tabular-nums text-ink">{v}</p>
            </div>
          ))}
          <div className="ml-auto flex gap-2">
            <Btn variant="primary" onClick={() => setSel("M-018")}>
              View Manifest
            </Btn>
          </div>
        </div>
        {m18.status === "LOCKED" && (
          <p className="mt-6 flex items-center gap-2 rounded-[8px] bg-surface px-4 py-3 text-[14px] text-ink">
            <Lock className="size-4 text-navy" /> Manifest locked: edits require controlled
            amendment.
          </p>
        )}
      </Panel>
      <Panel title="All manifests">
        <DataTable<Manifest>
          rows={state.manifests}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSel(r.id)}
          columns={[
            {
              key: "i",
              header: "Manifest",
              primary: true,
              render: (r) => <Mono className="font-medium">{r.id}</Mono>,
            },
            { key: "c", header: "Container", render: (r) => <Mono>{r.container}</Mono> },
            { key: "n", header: "Items", render: (r) => summary(r).items },
            {
              key: "w",
              header: "Weight",
              render: (r) => <Mono>{summary(r).weight.toLocaleString()} kg</Mono>,
            },
            { key: "h", header: "Hazardous", render: (r) => summary(r).haz },
            { key: "v", header: "Vessel", render: (r) => r.vessel },
            { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </Panel>
      <Drawer
        open={!!cur}
        onClose={() => setSel(null)}
        eyebrow={cur ? `${cur.container} · ${cur.vessel}` : ""}
        title={cur ? `Manifest ${cur.id}` : ""}
        footer={
          cur && (
            <>
              <Btn
                onClick={() =>
                  toast("Amendment request AMD-" + cur.id.slice(2) + " drafted", {
                    description: "Requires Logistics Officer and Expedition Leader approval.",
                  })
                }
              >
                Request amendment
              </Btn>
              <Link to="/edge" className={btn("primary")}>
                Receive on Edge
              </Link>
            </>
          )
        }
      >
        {cur && (
          <>
            {cur.status === "LOCKED" && (
              <p className="mb-5 flex items-center gap-2 rounded-[8px] bg-surface px-4 py-3 text-[14px]">
                <Lock className="size-4" /> Manifest locked: edits require controlled amendment.
              </p>
            )}
            <ul className="divide-y divide-hairline/70 border-y border-hairline/70">
              {curItems.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/cargo/$id"
                    params={{ id: c.id }}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-surface"
                  >
                    <span className="min-w-0 truncate">
                      <Mono className="font-medium text-navy">{c.id}</Mono>
                      <span className="ml-3 text-[14px]">{c.item}</span>
                    </span>
                    <span className="flex shrink-0 gap-1.5">
                      {c.hazard && <StatusBadge status="HIGH" className="hidden" />}
                      {c.exception && !c.exceptionResolved ? (
                        <StatusBadge status={c.exception} />
                      ) : (
                        <StatusBadge status={c.status === "AT RISK" ? "AT RISK" : c.status} />
                      )}
                      <SyncBadge state={c.sync} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Drawer>
    </>
  );
}
