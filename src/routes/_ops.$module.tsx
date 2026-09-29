import { createFileRoute, notFound } from "@tanstack/react-router";
import { useDemo } from "@/demo/engine";
import type { ComplianceRow, DemoState } from "@/demo/types";
import { RecordTable } from "@/components/app/RecordTable";
import { PageHeader } from "@/components/app/ui";

type Mod = {
  title: string;
  eyebrow: string;
  subtitle: string;
  rows: (s: DemoState) => ComplianceRow[];
};

const MODULES: Record<string, Mod> = {
  demands: {
    title: "Demands",
    eyebrow: "Logistics",
    subtitle: "Requests from station and science teams, before they become cargo.",
    rows: (s) =>
      s.cargo.slice(0, 30).map((c, i) => ({
        Demand: `D-${300 + i}`,
        Item: c.item,
        Requester: c.owner,
        Cargo: c.id,
        Status: c.stage > 1 ? "READY" : "PENDING",
      })),
  },
  checkpoints: {
    title: "Checkpoints",
    eyebrow: "Logistics",
    subtitle: "Custody handover points along the route.",
    rows: () =>
      [
        "Goa Depot",
        "Mumbai Port",
        "Cape Town Hub",
        "MV Southern Tern",
        "Bharati Cargo Bay",
        "Maitri Store",
      ].map((c, i) => ({
        Checkpoint: `CP-0${i + 1}`,
        Location: c,
        Device: i > 1 ? "Edge scanner" : "Central Portal",
        Status: i === 3 ? "ACTIVE" : "CONNECTED",
      })),
  },
  exceptions: {
    title: "Exceptions",
    eyebrow: "Logistics",
    subtitle: "Every open and resolved cargo exception.",
    rows: (s) =>
      s.cargo
        .filter((c) => c.exception)
        .map((c) => ({
          Cargo: c.id,
          Item: c.item,
          Exception: c.exception!,
          Custody: c.custody,
          Status: c.exceptionResolved ? "RESOLVED" : "OPEN",
        })),
  },
  backhaul: {
    title: "Backhaul",
    eyebrow: "Logistics",
    subtitle: "Waste, samples and equipment returning to India.",
    rows: (s) =>
      s.waste.map((w) => ({
        Record: w.Record,
        Contents: w.Stream,
        Quantity: w.Quantity,
        Vessel: "MV Polar Arc",
        Status: Number(w.Stage) >= 5 ? "COMPLETE" : "PLANNED",
      })),
  },
  "critical-inventory": {
    title: "Critical Inventory",
    eyebrow: "Resources",
    subtitle: "Lines below reorder threshold or safety-critical.",
    rows: (s) =>
      s.inventory
        .filter((i) => i.critical)
        .map((i) => ({
          Item: i.name,
          Available: `${i.available} ${i.unit}`,
          Threshold: String(i.threshold),
          Status: i.available < i.threshold ? "AT RISK" : "READY",
        })),
  },
  maintenance: {
    title: "Maintenance",
    eyebrow: "Resources",
    subtitle: "Scheduled and in-progress asset maintenance.",
    rows: (s) =>
      s.assets.map((a) => ({
        Asset: a.id,
        Type: a.type,
        Schedule: a.maintenance,
        Status: a.status,
      })),
  },
  assignments: {
    title: "Assignments",
    eyebrow: "People",
    subtitle: "Who is assigned where.",
    rows: (s) =>
      s.personnel.map((p) => ({
        Person: p.name,
        Role: p.role,
        Assignment: p.assignment,
        Station: p.station,
      })),
  },
  movement: {
    title: "Movement",
    eyebrow: "People",
    subtitle: "Personnel journey: Goa → Cape Town → vessel → Bharati → field camp.",
    rows: (s) =>
      s.personnel.slice(0, 20).map((p, i) => ({
        Person: p.name,
        From: p.team ? "Bharati" : "MV Southern Tern",
        To: p.team ? "Field Camp 08" : p.station,
        Time: p.team ? "Today 08:30" : "22 Oct 11:30",
        Mode: p.team ? "Snowmobile" : "Helicopter",
        Source: i % 2 ? "Edge" : "Central",
        Status: "SYNCED",
      })),
  },
  drills: {
    title: "Drills",
    eyebrow: "Safety & Response",
    subtitle: "Emergency drills and outcomes.",
    rows: () =>
      [
        ["DR-11", "Fire evacuation", "Bharati", "COMPLETE"],
        ["DR-12", "Crevasse rescue", "Field Camp 07", "COMPLETE"],
        ["DR-13", "Mass casualty", "Maitri", "PLANNED"],
      ].map(([a, b, c, d]) => ({ Drill: a, Scenario: b, Location: c, Status: d })),
  },
  "post-activity-reports": {
    title: "Post-Activity Reports",
    eyebrow: "Compliance",
    subtitle: "Reports due after field activities.",
    rows: (s) =>
      s.sorties
        .filter((x) => x.status === "COMPLETE")
        .map((x) => ({
          Report: `PAR-${x.id.slice(2)}`,
          Sortie: x.id,
          Team: x.team,
          Status: Number(x.id.slice(2)) > 19 ? "PENDING" : "COMPLETE",
        })),
  },
  "edge-nodes": {
    title: "Edge Nodes",
    eyebrow: "Platform",
    subtitle: "Offline-capable nodes at stations and hubs.",
    rows: (s) =>
      s.edgeNodes.map((n) => ({
        Node: n.name,
        Station: n.station,
        "Last sync": n.lastSync,
        Status: n.state,
      })),
  },
  devices: {
    title: "Devices",
    eyebrow: "Platform",
    subtitle: "Registered field devices.",
    rows: () =>
      [
        "Bharati Edge 01",
        "Bharati Tablet 04",
        "Maitri Edge 02",
        "Cape Town Scanner 03",
        "Field Handset 07",
      ].map((d, i) => ({
        Device: d,
        Type: i % 2 ? "Tablet" : "Edge node",
        Assigned: ["Cargo bay", "Field Team 07", "Maitri store", "Cape Town hub", "Field Team 07"][
          i
        ],
        Status: i === 2 ? "STALE" : "CONNECTED",
      })),
  },
  integrations: {
    title: "Integrations",
    eyebrow: "Platform",
    subtitle: "External systems (simulated).",
    rows: () =>
      [
        ["Iridium messaging", "ACTIVE"],
        ["Customs EDI", "ACTIVE"],
        ["Weather feed", "ACTIVE"],
        ["Vessel AIS", "PENDING"],
      ].map(([a, b]) => ({ Integration: a, Mode: "Simulated", Status: b })),
  },
  users: {
    title: "Users",
    eyebrow: "Administration",
    subtitle: "Platform accounts.",
    rows: (s) =>
      s.personnel.slice(0, 12).map((p) => ({
        User: p.name,
        Role: p.id === "P-001" ? "Operations Controller" : p.role,
        Scope: "46th ISEA",
        Status: "ACTIVE",
      })),
  },
  roles: {
    title: "Roles",
    eyebrow: "Administration",
    subtitle: "Role-based permissions. Medical data is restricted by default.",
    rows: () =>
      [
        [
          "Operations Controller",
          "Expeditions, Cargo, Inventory, Personnel, Sorties, Incidents, Reports",
        ],
        ["Logistics Officer", "Cargo, Manifests, Inventory"],
        ["Medical Officer", "Medical records, Incidents"],
        ["Field Operator", "Edge actions"],
      ].map(([a, b]) => ({ Role: a, Permissions: b, Status: "ACTIVE" })),
  },
  rules: {
    title: "Rules",
    eyebrow: "Administration",
    subtitle: "Operational rules evaluated by the platform.",
    rows: () =>
      [
        ["Missed check-in → P0 alert", "Sorties"],
        ["Manifest locks at dispatch", "Cargo"],
        ["Days of cover < 14 → attention", "Inventory"],
        ["P0 syncs before P1/P2", "Sync"],
      ].map(([a, b]) => ({ Rule: a, Module: b, Status: "ACTIVE" })),
  },
  forms: {
    title: "Forms",
    eyebrow: "Administration",
    subtitle: "Structured forms used on central and edge.",
    rows: () =>
      [
        "Cargo receipt",
        "Incident report",
        "Inventory count",
        "Muster",
        "Biosecurity inspection",
      ].map((f, i) => ({ Form: f, Version: `v${i + 2}`, Offline: "Yes", Status: "ACTIVE" })),
  },
  reports: {
    title: "Reports",
    eyebrow: "Administration",
    subtitle: "Operational reports.",
    rows: () =>
      [
        "Daily situation report",
        "Cargo reconciliation",
        "Personnel accountability",
        "Sync health",
      ].map((r) => ({ Report: r, Frequency: "Daily", Owner: "Operations", Status: "READY" })),
  },
  "system-status": {
    title: "System Status",
    eyebrow: "Platform",
    subtitle: "Health of platform services (simulation).",
    rows: () =>
      ["Central API", "Sync engine", "Audit store", "Notification service"].map((x) => ({
        Service: x,
        Region: "Simulated",
        Status: "CONNECTED",
      })),
  },
  help: {
    title: "Help",
    eyebrow: "Support",
    subtitle: "Use the Demo Guide for a five-minute walkthrough. All data here is synthetic.",
    rows: () =>
      [
        ["Start the guided demo", "Demo Guide button, bottom right"],
        ["Simulate offline", "Edge tablet → Disconnect"],
        ["Replay", "User menu → Reset demo"],
      ].map(([a, b]) => ({ Topic: a, Where: b })),
  },
};

export const Route = createFileRoute("/_ops/$module")({
  head: ({ params }) => {
    const m = MODULES[params.module];
    const t = `${m?.title ?? "Module"} | DhruvSetu`;
    return {
      meta: [
        { title: t },
        { name: "description", content: m?.subtitle ?? "DhruvSetu module" },
        { property: "og:title", content: t },
        { property: "og:description", content: m?.subtitle ?? "DhruvSetu module" },
      ],
    };
  },
  component: ModulePage,
  notFoundComponent: () => <p className="text-muted-foreground">This module does not exist.</p>,
});

function ModulePage() {
  const { module } = Route.useParams();
  const { state } = useDemo();
  const m = MODULES[module];
  if (!m) throw notFound();
  return (
    <>
      <PageHeader eyebrow={m.eyebrow} title={m.title} subtitle={m.subtitle} />
      <RecordTable rows={m.rows(state)} />
    </>
  );
}
