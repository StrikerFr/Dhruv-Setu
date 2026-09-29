import { createFileRoute, notFound } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/demo/engine";
import { KV, Mono, PageHeader, Panel, StatusBadge, SyncBadge, Tabs } from "@/components/app/ui";

export const Route = createFileRoute("/_ops/personnel/$id")({
  head: () => ({
    meta: [
      { title: "Personnel record | DhruvSetu" },
      {
        name: "description",
        content: "Profile, assignment, movement, clearance and training for one expedition member.",
      },
      { property: "og:title", content: "Personnel record | DhruvSetu" },
      { property: "og:description", content: "Operational personnel record (synthetic)." },
    ],
  }),
  component: PersonDetail,
  notFoundComponent: () => (
    <p className="text-muted-foreground">Person not found in this simulation.</p>
  ),
});

const MOVES = [
  ["Goa", "Cape Town", "03 Oct · 06:10", "Flight", "Travel Desk"],
  ["Cape Town", "MV Southern Tern", "08 Oct · 14:00", "Vessel boarding", "L. Pillai"],
  ["MV Southern Tern", "Bharati", "22 Oct · 11:30", "Helicopter", "V. Gill"],
  ["Bharati", "Field Camp 08", "Today · 08:30", "Snowmobile", "Bharati Edge 01"],
];

function PersonDetail() {
  const { id } = Route.useParams();
  const { state } = useDemo();
  const p = state.personnel.find((x) => x.id === id);
  const [tab, setTab] = useState("Profile");
  if (!p) throw notFound();
  const isSelf = p.id === "P-001";
  const moves = p.team ? MOVES : MOVES.slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={`${p.id} · ${p.station}`}
        title={p.name}
        subtitle={`${p.role} · ${p.assignment}`}
        badges={<StatusBadge status={p.accounted ? p.status : "UNACCOUNTED"} />}
      />
      <Tabs
        tabs={[
          "Profile",
          "Assignment",
          "Movement",
          "Clearance",
          "Training",
          "Documents",
          "Emergency",
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Profile" && (
        <Panel>
          <KV
            cols={3}
            items={[
              ["Role", p.role],
              ["Station", p.station],
              ["Assignment", p.assignment],
              ["Clearance", <StatusBadge key="c" status={p.clearance} />],
              ["Last confirmed", p.lastConfirmed],
              [
                "Scope",
                isSelf
                  ? "46th ISEA · Bharati · Expeditions, Cargo, Inventory, Personnel, Sorties, Incidents, Reports"
                  : "46th ISEA",
              ],
            ]}
          />
        </Panel>
      )}
      {tab === "Assignment" && (
        <Panel>
          <KV
            items={[
              ["Current", p.assignment],
              ["Team", p.team ?? "—"],
              ["Reports to", "Rohan Menon"],
              ["Since", "22 Oct 2026"],
            ]}
          />
        </Panel>
      )}
      {tab === "Movement" && (
        <Panel title="Journey">
          <ol className="space-y-0">
            {moves.map(([from, to, t, mode, op], i) => (
              <li
                key={i}
                className="grid gap-2 border-b border-hairline/60 py-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] md:items-center"
              >
                <span className="font-medium text-ink">
                  {from} <span className="text-muted-foreground">→</span> {to}
                </span>
                <Mono className="text-muted-foreground">{t}</Mono>
                <span className="text-[14px]">{mode}</span>
                <span className="text-[14px] text-muted-foreground">
                  {op} · {op.includes("Edge") ? "Edge" : "Central"}
                </span>
                <SyncBadge state="SYNCED" />
              </li>
            ))}
          </ol>
        </Panel>
      )}
      {tab === "Clearance" && (
        <Panel>
          <KV
            items={[
              ["Medical fitness", "Cleared (details restricted)"],
              ["Survival training", "Completed 18 Sep 2026"],
              ["Visa", "Issued"],
              ["Field clearance", p.clearance],
            ]}
          />
        </Panel>
      )}
      {tab === "Training" && (
        <Panel>
          <ul className="space-y-3 text-[15px]">
            <li>✓ Polar survival · 18 Sep 2026</li>
            <li>✓ Crevasse rescue · 20 Sep 2026</li>
            <li>✓ Fire warden · 21 Sep 2026</li>
          </ul>
        </Panel>
      )}
      {tab === "Documents" && (
        <Panel>
          <ul className="space-y-3 text-[15px]">
            <li>Passport copy · verified</li>
            <li>Expedition agreement · signed</li>
          </ul>
        </Panel>
      )}
      {tab === "Emergency" && (
        <Panel>
          <p className="flex items-center gap-2 rounded-[8px] bg-surface px-4 py-3 text-[14.5px] text-ink">
            <Lock className="size-4" /> Medical and emergency contact details are restricted. Your
            role (Operations Controller) can request break-glass access during an active P0
            incident.
          </p>
        </Panel>
      )}
    </>
  );
}
