import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import type { Sortie } from "@/demo/types";
import {
  Btn,
  DataTable,
  EmptyState,
  Field,
  FilterSelect,
  inputCls,
  Modal,
  Mono,
  PageHeader,
  Panel,
  StatusBadge,
  Toolbar,
} from "@/components/app/ui";

export const Route = createFileRoute("/_ops/sorties/")({
  head: () => ({
    meta: [
      { title: "Sorties | DhruvSetu" },
      {
        name: "description",
        content: "Field sorties with routes, departures, ETAs and next check-in.",
      },
      { property: "og:title", content: "Sorties | DhruvSetu" },
      {
        property: "og:description",
        content: "Field operations monitored by scheduled check-ins (synthetic).",
      },
    ],
  }),
  component: Sorties,
});

function Sorties() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    team: "Field Team 08",
    route: "Bharati → Field Camp 07",
    departure: "15:00",
    eta: "19:30",
    members: 5,
    lead: "Sana Pillai",
  });
  const rows = state.sorties.filter(
    (s) =>
      (!q || `${s.id} ${s.team} ${s.route}`.toLowerCase().includes(q.toLowerCase())) &&
      (!st || s.status === st),
  );

  return (
    <>
      <PageHeader
        eyebrow="Field Operations"
        title="Sorties"
        subtitle="Every departure has a route, a team and a check-in schedule."
        actions={
          <span data-guide="create-sortie">
            <Btn variant="primary" onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Create Sortie
            </Btn>
          </span>
        }
      />
      <Panel data-guide="sorties-table">
        <Toolbar search={q} onSearch={setQ} placeholder="Sortie, team or route">
          <FilterSelect
            label="Status"
            value={st}
            onChange={setSt}
            options={["ACTIVE", "OVERDUE", "DELAYED", "PLANNED", "COMPLETE"]}
          />
        </Toolbar>
        <DataTable<Sortie>
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate({ to: "/sorties/$id", params: { id: r.id } })}
          highlight={(r) => r.status === "OVERDUE"}
          empty={
            <EmptyState
              text="No sorties currently match these filters."
              action={
                <Btn
                  onClick={() => {
                    setQ("");
                    setSt("");
                  }}
                >
                  Clear Filters
                </Btn>
              }
            />
          }
          columns={[
            {
              key: "i",
              header: "Sortie ID",
              primary: true,
              render: (r) => <Mono className="font-medium">{r.id}</Mono>,
            },
            { key: "t", header: "Team", render: (r) => r.team },
            { key: "r", header: "Route", render: (r) => r.route },
            { key: "d", header: "Departure", render: (r) => <Mono>{r.departure}</Mono> },
            { key: "e", header: "ETA", render: (r) => <Mono>{r.eta}</Mono> },
            { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "n",
              header: "Next check-in",
              render: (r) => (
                <Mono className={r.status === "OVERDUE" ? "text-critical" : ""}>
                  {r.nextCheckIn}
                </Mono>
              ),
            },
          ]}
        />
      </Panel>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Sortie"
        footer={
          <>
            <Btn onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn
              variant="primary"
              onClick={() => {
                const id = actions.createSortie(form);
                setOpen(false);
                navigate({ to: "/sorties/$id", params: { id } });
              }}
            >
              Start sortie
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Team">
            <select
              className={inputCls}
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
            >
              {["Field Team 08", "Field Team 05", "Survey Team 02", "Glacier Team 01"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Route">
            <select
              className={inputCls}
              value={form.route}
              onChange={(e) => setForm({ ...form, route: e.target.value })}
            >
              {[
                "Bharati → Field Camp 07",
                "Bharati → Field Camp 08",
                "Bharati → Larsemann Ridge",
                "Maitri → Schirmacher Lake 4",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Departure">
              <input
                className={inputCls}
                value={form.departure}
                onChange={(e) => setForm({ ...form, departure: e.target.value })}
              />
            </Field>
            <Field label="Return">
              <input
                className={inputCls}
                value={form.eta}
                onChange={(e) => setForm({ ...form, eta: e.target.value })}
              />
            </Field>
            <Field label="Personnel">
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.members}
                onChange={(e) => setForm({ ...form, members: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Check-ins every 60 minutes. A missed check-in raises a critical alert automatically.
          </p>
        </div>
      </Modal>
    </>
  );
}
