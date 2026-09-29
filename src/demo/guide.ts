export interface GuideStep {
  title: string;
  text: string;
  to: string;
  target?: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Command Center",
    text: "Start here. Review what needs attention now. Every item links to its record.",
    to: "/dashboard",
    target: "attention",
  },
  {
    title: "Expedition Readiness",
    text: "Expand Cargo & Customs. The 82% is exactly 41 of 50 requirements (no hidden score).",
    to: "/expeditions/46th-isea/readiness",
    target: "gate-g4",
  },
  {
    title: "Cargo Custody",
    text: "Open C-128 to inspect its custody history. Click any stage to see operator, device and sync state.",
    to: "/cargo/C-128",
    target: "custody",
  },
  {
    title: "Enter Edge Mode",
    text: "This is the rugged tablet at Bharati's cargo bay. It keeps working without a network.",
    to: "/edge",
    target: "edge-connection",
  },
  {
    title: "Disconnect Network",
    text: "Press Disconnect to simulate losing the satellite link. Nothing stops working.",
    to: "/edge",
    target: "edge-connection",
  },
  {
    title: "Receive Cargo Offline",
    text: "Open Receive Cargo for manifest M-018. 18 items are expected.",
    to: "/edge",
    target: "edge-receive",
  },
  {
    title: "Mark Item Damaged",
    text: "Mark C-128 damaged and C-131 missing, then confirm. Each change is queued locally.",
    to: "/edge",
    target: "edge-receive",
  },
  {
    title: "Reconnect",
    text: "Reconnect and watch P0, then P1, then P2 synchronize in order.",
    to: "/edge",
    target: "edge-connection",
  },
  {
    title: "Resolve Cargo Exception",
    text: "Back in central: resolve the exception on C-128 with a recorded disposition.",
    to: "/cargo/C-128",
    target: "exception",
  },
  {
    title: "Start Sortie",
    text: "Create a new sortie for a field team. It becomes an active, monitored record.",
    to: "/sorties",
    target: "create-sortie",
  },
  {
    title: "Trigger Missed Check-in",
    text: "Open a sortie and simulate a missed check-in. A critical alert is raised.",
    to: "/sorties",
    target: "sorties-table",
  },
  {
    title: "P0 Emergency Offline",
    text: "On the Edge tablet: disconnect, report the incident, then reconnect. P0 synchronizes before everything else.",
    to: "/edge",
    target: "edge-incident",
  },
  {
    title: "Acknowledge Incident",
    text: "Open the incident, acknowledge it, assign a responder and resolve it.",
    to: "/incidents",
    target: "incidents-table",
  },
  {
    title: "Review Audit Trail",
    text: "Every action you just took is here: who, what, old state, new state, device and sync.",
    to: "/audit",
    target: "audit-table",
  },
  {
    title: "Conflict Center",
    text: "Edge and central disagreed about C-128. Review it: nothing is silently overwritten.",
    to: "/conflicts",
    target: "conflicts",
  },
];
