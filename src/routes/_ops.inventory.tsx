import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { inventoryService } from "@/demo/services";
import type { InventoryItem } from "@/demo/types";
import { InventoryBars } from "@/components/app/records";
import {
  Btn,
  DataTable,
  Field,
  FilterSelect,
  inputCls,
  Modal,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  SyncBadge,
  Toolbar,
} from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ops/inventory")({
  head: () => ({
    meta: [
      { title: "Station Inventory | DhruvSetu" },
      {
        name: "description",
        content:
          "Bharati station inventory: available, reserved, in transit, critical lines and days of cover.",
      },
      { property: "og:title", content: "Station Inventory | DhruvSetu" },
      {
        property: "og:description",
        content: "Days of cover for fuel, food, medical and spare parts (synthetic).",
      },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const { state } = useDemo();
  const cats = inventoryService.categories(state);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState(false);
  const rows = state.inventory.filter(
    (i) => (!q || i.name.toLowerCase().includes(q.toLowerCase())) && (!cat || i.category === cat),
  );

  return (
    <>
      <PageHeader
        eyebrow="Resources · Bharati"
        title="Station Inventory"
        subtitle="Station: Bharati"
        actions={
          <Btn variant="primary" onClick={() => setOpen(true)}>
            Record Count
          </Btn>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cats.map((c) => {
          const warn = c.days < 14;
          return (
            <div
              key={c.category}
              className={cn(
                "rounded-[10px] border bg-card p-5",
                warn ? "border-orange/40" : "border-hairline",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-semibold text-ink">{c.category}</p>
                {warn && <StatusBadge status="ATTENTION" />}
              </div>
              <p
                className={cn(
                  "mt-4 text-[36px] font-semibold leading-none tabular-nums",
                  warn ? "text-orange" : "text-ink",
                )}
              >
                {c.days}
                <span className="ml-1.5 text-[14px] font-normal text-muted-foreground">
                  days of cover
                </span>
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-2 text-[13px]">
                {[
                  ["Available", c.available],
                  ["Reserved", c.reserved],
                  ["In transit", c.inTransit],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono tabular-nums text-ink">
                      {Number(v).toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12.5px] text-muted-foreground">
                {c.below} of {c.items} lines below threshold
              </p>
            </div>
          );
        })}
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Days of cover by category">
          <InventoryBars />
        </Panel>
        <Panel title="Inventory transactions">
          <DataTable
            rows={state.txns.slice(0, 8)}
            rowKey={(r) => r.id}
            dense
            columns={[
              { key: "t", header: "Time", render: (r) => <Mono>{r.ts}</Mono> },
              {
                key: "i",
                header: "Item",
                primary: true,
                render: (r) => <span className="block max-w-[200px] truncate">{r.item}</span>,
              },
              { key: "ty", header: "Type", render: (r) => <Mono>{r.type}</Mono> },
              {
                key: "d",
                header: "Δ",
                render: (r) => (
                  <Mono className={r.delta < 0 ? "text-orange" : r.delta > 0 ? "text-teal" : ""}>
                    {r.delta > 0 ? "+" : ""}
                    {r.delta}
                  </Mono>
                ),
              },
              {
                key: "r",
                header: "Reason",
                render: (r) => <span className="block max-w-[180px] truncate">{r.reason}</span>,
              },
              { key: "s", header: "Sync", render: (r) => <SyncBadge state={r.sync} /> },
            ]}
          />
        </Panel>
      </div>
      <Panel title="All lines">
        <Toolbar search={q} onSearch={setQ} placeholder="Search items">
          <FilterSelect
            label="Category"
            value={cat}
            onChange={setCat}
            options={["Fuel", "Food", "Medical", "Spare Parts"]}
          />
        </Toolbar>
        <DataTable<InventoryItem>
          rows={rows}
          rowKey={(r) => r.id}
          highlight={(r) => r.available < r.threshold}
          columns={[
            { key: "n", header: "Item", primary: true, render: (r) => r.name },
            { key: "c", header: "Category", render: (r) => r.category },
            { key: "l", header: "Location", render: (r) => r.location },
            {
              key: "a",
              header: "Available",
              render: (r) => (
                <Mono>
                  {r.available.toLocaleString()} {r.unit}
                </Mono>
              ),
            },
            { key: "re", header: "Reserved", render: (r) => <Mono>{r.reserved}</Mono> },
            { key: "tr", header: "In transit", render: (r) => <Mono>{r.inTransit}</Mono> },
            {
              key: "cr",
              header: "Critical",
              render: (r) =>
                r.available < r.threshold ? (
                  <StatusBadge status="AT RISK" />
                ) : r.critical ? (
                  "Yes"
                ) : (
                  "—"
                ),
            },
            {
              key: "d",
              header: "Days of cover",
              render: (r) => <Mono>{Math.min(inventoryService.daysCover(r), 365)}</Mono>,
            },
          ]}
        />
      </Panel>
      <CountModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function CountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useDemo();
  const [id, setId] = useState(state.inventory[0].id);
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("Scheduled count");
  const [evidence, setEvidence] = useState("");
  const it = state.inventory.find((i) => i.id === id)!;
  const online = state.connection === "CONNECTED";
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Inventory Count"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            variant="primary"
            disabled={qty === ""}
            onClick={() => {
              actions.recordCount({ itemId: id, qty: Number(qty), reason, evidence });
              setQty("");
              onClose();
            }}
          >
            {online ? "Save and synchronize" : "Save Locally"}
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Item">
          <select value={id} onChange={(e) => setId(e.target.value)} className={inputCls}>
            {state.inventory.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Location">
            <input readOnly value={it.location} className={inputCls} />
          </Field>
          <Field label="Unit">
            <input readOnly value={it.unit} className={inputCls} />
          </Field>
        </div>
        <Field label={`Quantity (system: ${it.available})`}>
          <input
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))}
            className={inputCls}
          />
        </Field>
        <Field label="Reason">
          <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Evidence">
          <input
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="e.g. photo reference or tank dip sheet"
            className={inputCls}
          />
        </Field>
        {!online && (
          <p className="rounded-[6px] bg-orange/10 px-3 py-2 text-[13px] text-ink">
            Offline: this count will be stored locally and synchronized when connectivity returns.
          </p>
        )}
      </div>
    </Modal>
  );
}
