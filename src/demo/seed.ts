import type {
  Asset,
  AuditEvent,
  Cargo,
  Container,
  DemoState,
  Gate,
  Incident,
  InventoryItem,
  Manifest,
  Person,
  Sortie,
  SyncOp,
} from "./types";

export const DEMO_VERSION = 3;
export const START_CLOCK = 14 * 60 + 36;

export function fmtClock(m: number) {
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Aditi",
  "Rohan",
  "Meera",
  "Kabir",
  "Ishaan",
  "Tara",
  "Nikhil",
  "Sana",
  "Arjun",
  "Leela",
  "Dev",
  "Priya",
  "Vikram",
  "Anaya",
  "Rahul",
  "Zoya",
  "Karan",
  "Neha",
  "Siddharth",
  "Ira",
  "Manav",
  "Pooja",
  "Aarav",
  "Diya",
  "Yash",
  "Kavya",
  "Omkar",
  "Ritu",
  "Harsh",
  "Naina",
  "Varun",
  "Esha",
  "Tanmay",
  "Gauri",
  "Ayaan",
  "Ruhi",
  "Samar",
  "Mitali",
  "Parth",
  "Lavanya",
  "Kunal",
  "Shreya",
];
const LAST = [
  "Rao",
  "Menon",
  "Iyer",
  "Kulkarni",
  "Bose",
  "Nair",
  "Sethi",
  "Pillai",
  "Das",
  "Joshi",
  "Chandra",
  "Verma",
  "Gill",
  "Mehta",
  "Reddy",
  "Kapoor",
  "Sen",
  "Bhat",
  "Dutta",
  "Shetty",
];
const ROLES = [
  "Glaciologist",
  "Station Engineer",
  "Medical Officer",
  "Logistics Officer",
  "Communications Officer",
  "Geophysicist",
  "Electrician",
  "Mechanic",
  "Cook",
  "Field Guide",
  "Atmospheric Scientist",
  "Biologist",
  "Diesel Technician",
  "IT Officer",
];

const ITEMS: [string, Cargo["category"], string | null][] = [
  ["Ice-core drill head assembly", "Scientific", "Class 9"],
  ["Generator coolant pump", "Spare Parts", null],
  ["Freeze-dried rations (crate)", "Food", null],
  ["Trauma kit resupply", "Medical", null],
  ["Seismometer array", "Scientific", null],
  ["Lithium battery pack", "Scientific", "Class 9"],
  ["Snowmobile drive belt", "Spare Parts", null],
  ["AWS sensor mast", "Scientific", null],
  ["Diesel filter set", "Spare Parts", null],
  ["Satellite modem", "Station", null],
  ["Compressed gas cylinder", "Station", "Class 2"],
  ["Pharmacy restock", "Medical", null],
  ["Tinned provisions", "Food", null],
  ["Heater element kit", "Spare Parts", null],
  ["Radiosonde balloons", "Scientific", null],
  ["Aviation fuel drum", "Fuel", "Class 3"],
];

export function createSeed(): DemoState {
  const r = rng(46);
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)];

  // Containers & manifests
  const containers: Container[] = [];
  const manifests: Manifest[] = [];
  const cStatuses: Container["status"][] = [
    "IN TRANSIT",
    "RECEIVED",
    "SEALED",
    "IN TRANSIT",
    "INSPECTION",
  ];
  for (let i = 10; i < 28; i++) {
    const id = `CNT-0${i}`;
    const m = `M-0${i}`;
    const status: Container["status"] = i === 18 ? "IN TRANSIT" : cStatuses[i % cStatuses.length];
    const location =
      status === "RECEIVED"
        ? i % 2
          ? "Bharati"
          : "Maitri"
        : status === "SEALED"
          ? "Goa"
          : i % 3 === 0
            ? "Polar Leg"
            : "Cape Town";
    containers.push({
      id,
      type: i % 4 === 0 ? "20ft Reefer" : i % 3 === 0 ? "Half-height" : "20ft Dry",
      weight: 0,
      seal: `SL-${4400 + i * 7}`,
      status,
      location,
      manifest: m,
    });
    manifests.push({
      id: m,
      container: id,
      status:
        status === "RECEIVED"
          ? "RECEIVED"
          : status === "SEALED"
            ? "DRAFT"
            : i === 21
              ? "AMENDMENT PENDING"
              : "LOCKED",
      route: "Goa → Cape Town → Bharati",
      vessel: i % 2 ? "MV Southern Tern" : "MV Polar Arc",
    });
  }

  // Cargo 124
  const cargo: Cargo[] = [];
  for (let n = 0; n < 124; n++) {
    const num = 100 + n;
    const id = `C-${num}`;
    let ci: number;
    if (num >= 128 && num <= 145) ci = 18;
    else ci = 10 + (n % 18 === 8 ? 9 : n % 18);
    const cont = containers.find((c) => c.id === `CNT-0${ci}`)!;
    const [item, category, hazard] = ITEMS[n % ITEMS.length];
    let stage =
      cont.status === "RECEIVED"
        ? 7
        : cont.status === "SEALED"
          ? 3
          : cont.location === "Polar Leg"
            ? 6
            : 5;
    if (ci === 18) stage = 6;
    const status: Cargo["status"] = stage === 7 ? "RECEIVED" : stage <= 3 ? "READY" : "IN TRANSIT";
    const crit: Cargo["criticality"] =
      n % 10 === 0 || [128, 133, 137].includes(num)
        ? "CRITICAL"
        : n % 3 === 0
          ? "HIGH"
          : "STANDARD";
    const w = 40 + Math.floor(r() * 260);
    cont.weight += w;
    const dest = stage === 7 ? cont.location : ci % 5 === 0 ? "Maitri" : "Bharati";
    const events = Array.from({ length: stage + 1 }, (_, s) => ({
      stage: s,
      ts: `${String(2 + s * 3).padStart(2, "0")} Oct · ${String(8 + s).padStart(2, "0")}:${s % 2 ? "15" : "40"} IST`,
      location: [
        "Goa Depot",
        "Goa Depot",
        "Goa Depot",
        "Goa Depot",
        "Mumbai Port",
        "Cape Town Hub",
        "MV Southern Tern",
        dest,
      ][s],
      operator: [
        "R. Menon",
        "A. Iyer",
        "K. Bose",
        "K. Bose",
        "S. Nair",
        "L. Pillai",
        "V. Gill",
        "D. Rao",
      ][s],
      device: s >= 5 ? (s === 7 ? "Bharati Edge 01" : "Cape Town Scanner 03") : "Central Portal",
      source: s >= 5 ? "Edge" : "Central",
      sync: "SYNCED" as const,
    }));
    cargo.push({
      id,
      item,
      category,
      container: cont.id,
      manifest: cont.manifest,
      destination: dest,
      criticality: crit,
      custody:
        stage === 7
          ? dest
          : stage === 6
            ? "Polar Leg"
            : stage === 5
              ? "Cape Town"
              : stage === 4
                ? "Mumbai"
                : "Goa",
      stage,
      lastConfirmed: `${String(8 + (n % 7)).padStart(2, "0")}:${String((n * 7) % 60).padStart(2, "0")} IST`,
      eta: stage === 7 ? "—" : `${16 + (n % 8)} Oct`,
      status,
      exception: null,
      atRisk: false,
      hazard,
      weight: w,
      owner:
        category === "Scientific"
          ? "Scientific Operations"
          : category === "Medical"
            ? "Medical Services"
            : "Station Logistics",
      sync: "SYNCED",
      events,
    });
  }
  const c128 = cargo.find((c) => c.id === "C-128")!;
  Object.assign(c128, {
    item: "Ice-core drill head assembly",
    category: "Scientific",
    hazard: "Class 9",
    weight: 248,
    custody: "Cape Town",
    lastConfirmed: "14:32 IST",
    eta: "18 Oct",
    status: "AT RISK",
    exception: "DAMAGED",
    atRisk: true,
    owner: "Scientific Operations",
    criticality: "CRITICAL",
  } satisfies Partial<Cargo>);
  const flag = (id: string, p: Partial<Cargo>) =>
    Object.assign(
      cargo.find((c) => c.id === id)!,
      p,
    );
  flag("C-133", {
    atRisk: true,
    status: "AT RISK",
    item: "Generator coolant pump",
    category: "Spare Parts",
  });
  flag("C-137", {
    atRisk: true,
    status: "AT RISK",
    item: "Diesel filter set",
    category: "Spare Parts",
  });
  flag("C-112", { atRisk: true, status: "BLOCKED", exception: "CUSTOMS HOLD" });
  flag("C-131", { item: "Heater element kit", category: "Spare Parts" });

  // Personnel 42
  const personnel: Person[] = [];
  for (let i = 0; i < 42; i++) {
    const inTeam07 = i >= 34;
    const field = inTeam07 && i < 38;
    const name = i === 0 ? "Aryan Garg" : `${FIRST[i]} ${LAST[i % LAST.length]}`;
    personnel.push({
      id: `P-${String(i + 1).padStart(3, "0")}`,
      name,
      role:
        i === 0 ? "Operations Controller" : i === 1 ? "Expedition Leader" : ROLES[i % ROLES.length],
      assignment: inTeam07
        ? "Field Team 07"
        : i % 5 === 0
          ? "Science Wing"
          : i % 3 === 0
            ? "Station Services"
            : "Operations",
      team: inTeam07 ? "Field Team 07" : null,
      station: i % 9 === 4 ? "Maitri" : "Bharati",
      clearance: i % 13 === 7 ? "PENDING" : "CLEARED",
      status: i === 41 ? "UNACCOUNTED" : field || i === 40 ? "FIELD" : "STATION",
      lastConfirmed:
        i === 41
          ? "11:30 IST"
          : `${String(12 + (i % 3)).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")} IST`,
      accounted: i !== 41,
    });
  }
  // Field team 07 = P-035..P-042 (8)
  // Assets
  const aTypes: [string, string][] = [
    ["Snowmobile", "SNO"],
    ["PistenBully", "PB"],
    ["Generator", "GEN"],
    ["Iridium handset", "IRD"],
    ["Field tent", "TNT"],
    ["Sledge", "SLD"],
    ["Drill rig", "DRL"],
    ["Quad bike", "QB"],
  ];
  const aStat: Asset["status"][] = [
    "AVAILABLE",
    "ASSIGNED",
    "AVAILABLE",
    "MAINTENANCE",
    "ASSIGNED",
    "OUT OF SERVICE",
    "AVAILABLE",
    "RETIRED",
  ];
  const assets: Asset[] = Array.from({ length: 28 }, (_, i) => {
    const [t, p] = aTypes[i % aTypes.length];
    const st = aStat[(i * 3) % aStat.length];
    return {
      id: `${p}-${String(i + 1).padStart(2, "0")}`,
      name: `${t} ${String(i + 1).padStart(2, "0")}`,
      type: t,
      station: i % 4 === 3 ? "Maitri" : "Bharati",
      status: st,
      maintenance:
        st === "MAINTENANCE" ? "In workshop · due 21 Oct" : `Next service ${10 + (i % 18)} Nov`,
      assignment: st === "ASSIGNED" ? (i % 2 ? "Field Team 07" : "Station Services") : "—",
    };
  });

  // Inventory 52
  const invDefs: [InventoryItem["category"], string, string, number, number, number][] = [
    ["Fuel", "Arctic diesel (SAB)", "kL", 740, 1000, 22],
    ["Fuel", "Aviation fuel JET A-1", "drums", 64, 100, 3],
    ["Fuel", "Petrol (snowmobile)", "L", 3800, 5000, 180],
    ["Food", "Freeze-dried rations", "crates", 126, 200, 5],
    ["Food", "Tinned provisions", "cases", 310, 480, 12],
    ["Food", "Fresh water (RO)", "kL", 42, 60, 2],
    ["Medical", "Trauma kits", "kits", 22, 24, 0.3],
    ["Medical", "Oxygen cylinders", "cyl", 18, 20, 0.4],
    ["Medical", "Pharmacy (general)", "units", 910, 1000, 18],
    ["Spare Parts", "Generator coolant pumps", "pcs", 2, 6, 0.25],
    ["Spare Parts", "Diesel filter sets", "sets", 8, 24, 1],
    ["Spare Parts", "Heater element kits", "kits", 4, 12, 0.5],
    ["Spare Parts", "Snowmobile drive belts", "pcs", 5, 14, 0.6],
  ];
  const inventory: InventoryItem[] = [];
  for (let i = 0; i < 52; i++) {
    const d = invDefs[i % invDefs.length];
    const variant = Math.floor(i / invDefs.length);
    const loc = [
      "Bharati Main Store",
      "Bharati Fuel Farm",
      "Bharati Cold Store",
      "Bharati Workshop",
    ][variant % 4];
    const avail = Math.round(d[3] * (1 - variant * 0.12));
    inventory.push({
      id: `INV-${String(i + 1).padStart(3, "0")}`,
      name: variant ? `${d[1]} · Lot ${variant + 1}` : d[1],
      category: d[0],
      location: loc,
      unit: d[2],
      available: avail,
      reserved: Math.round(avail * 0.08),
      inTransit: d[0] === "Spare Parts" && variant === 0 ? 3 : Math.round(avail * 0.05),
      threshold: Math.round(d[4] * 0.4),
      dailyUse: d[5],
      critical: d[0] === "Spare Parts" || d[0] === "Medical",
    });
  }

  const sorties: Sortie[] = [
    {
      id: "S-024",
      team: "Field Team 07",
      route: "Bharati → Field Camp 08",
      departure: "08:30",
      eta: "18:00",
      status: "OVERDUE",
      nextCheckIn: "14:30",
      members: 8,
      lead: "Varun Gill",
    },
    {
      id: "S-023",
      team: "Field Team 05",
      route: "Bharati → Larsemann Ridge",
      departure: "07:45",
      eta: "16:30",
      status: "ACTIVE",
      nextCheckIn: "15:00",
      members: 4,
      lead: "Tara Nair",
    },
    {
      id: "S-022",
      team: "Field Team 03",
      route: "Maitri → Schirmacher Lake 4",
      departure: "09:10",
      eta: "15:40",
      status: "ACTIVE",
      nextCheckIn: "15:10",
      members: 3,
      lead: "Dev Das",
    },
    {
      id: "S-025",
      team: "Field Team 08",
      route: "Bharati → Field Camp 07",
      departure: "16:00",
      eta: "20:30",
      status: "PLANNED",
      nextCheckIn: "17:00",
      members: 5,
      lead: "Sana Pillai",
    },
    {
      id: "S-021",
      team: "Survey Team 02",
      route: "Bharati → Grovnes Peninsula",
      departure: "06:30",
      eta: "12:30",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 4,
      lead: "Arjun Joshi",
    },
    {
      id: "S-020",
      team: "Field Team 05",
      route: "Bharati → Stornes",
      departure: "Yesterday 07:00",
      eta: "Yesterday 17:00",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 4,
      lead: "Tara Nair",
    },
    {
      id: "S-019",
      team: "Glacier Team 01",
      route: "Maitri → Ice Shelf Edge",
      departure: "Yesterday 08:15",
      eta: "Yesterday 19:00",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 6,
      lead: "Kavya Bhat",
    },
    {
      id: "S-018",
      team: "Field Team 03",
      route: "Maitri → Priyadarshini Lake",
      departure: "12 Oct 09:00",
      eta: "12 Oct 14:00",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 3,
      lead: "Dev Das",
    },
    {
      id: "S-017",
      team: "Field Team 07",
      route: "Bharati → Field Camp 08",
      departure: "11 Oct 08:30",
      eta: "11 Oct 18:30",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 8,
      lead: "Varun Gill",
    },
    {
      id: "S-016",
      team: "Survey Team 02",
      route: "Bharati → Fisher Island",
      departure: "10 Oct 07:30",
      eta: "10 Oct 13:00",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 4,
      lead: "Arjun Joshi",
    },
    {
      id: "S-015",
      team: "Field Team 08",
      route: "Bharati → Field Camp 07",
      departure: "09 Oct 10:00",
      eta: "09 Oct 18:00",
      status: "COMPLETE",
      nextCheckIn: "—",
      members: 5,
      lead: "Sana Pillai",
    },
  ];

  const incidents: Incident[] = [
    {
      id: "INC-024",
      type: "Field Distress",
      severity: "P0",
      location: "Field Camp 08",
      reported: "14:32",
      status: "ACK REQUIRED",
      sync: "DELIVERED",
      personnel: 8,
      description:
        "Field Team 07 missed scheduled 14:30 check-in. One member not confirmed at last radio contact.",
      responder: null,
      timeline: [
        { ts: "14:32", label: "Reported", by: "Bharati Edge 01" },
        { ts: "14:32", label: "Saved locally", by: "Bharati Edge 01" },
        { ts: "14:33", label: "Delivered to central", by: "Sync engine" },
      ],
      actions: [],
    },
    {
      id: "INC-023",
      type: "Equipment Failure",
      severity: "P1",
      location: "Bharati Powerhouse",
      reported: "11:05",
      status: "RESPONDING",
      sync: "SYNCED",
      personnel: 0,
      description: "Generator 2 coolant pump pressure below range. Load moved to Generator 1.",
      responder: "Rahul Verma",
      timeline: [
        { ts: "11:05", label: "Reported" },
        { ts: "11:06", label: "Acknowledged" },
        { ts: "11:12", label: "Responder assigned" },
      ],
      actions: ["Load transferred to GEN-03"],
    },
    {
      id: "INC-022",
      type: "Medical",
      severity: "P2",
      location: "Bharati Station",
      reported: "09:40",
      status: "ACKNOWLEDGED",
      sync: "SYNCED",
      personnel: 1,
      description: "Minor frostbite reported after outdoor maintenance. Treated on station.",
      responder: "Medical Officer",
      timeline: [
        { ts: "09:40", label: "Reported" },
        { ts: "09:44", label: "Acknowledged" },
      ],
      actions: [],
    },
    {
      id: "INC-021",
      type: "Fuel Spill",
      severity: "P1",
      location: "Bharati Fuel Farm",
      reported: "08:10",
      status: "RESOLVED",
      sync: "SYNCED",
      personnel: 0,
      description: "Approx. 4 L diesel spill during transfer. Contained with absorbent pads.",
      responder: "Station Engineer",
      timeline: [
        { ts: "08:10", label: "Reported" },
        { ts: "08:12", label: "Acknowledged" },
        { ts: "08:55", label: "Resolved" },
      ],
      actions: ["Environment event logged"],
    },
    {
      id: "INC-020",
      type: "Communications",
      severity: "P2",
      location: "Maitri",
      reported: "07:22",
      status: "RESOLVED",
      sync: "SYNCED",
      personnel: 0,
      description: "VSAT link degraded for 40 minutes.",
      responder: "IT Officer",
      timeline: [
        { ts: "07:22", label: "Reported" },
        { ts: "08:04", label: "Resolved" },
      ],
      actions: [],
    },
    {
      id: "INC-019",
      type: "Weather Hold",
      severity: "P2",
      location: "Field Camp 07",
      reported: "06:15",
      status: "RESOLVED",
      sync: "SYNCED",
      personnel: 5,
      description: "Sortie held for katabatic wind > 45 kn.",
      responder: "Field Guide",
      timeline: [
        { ts: "06:15", label: "Reported" },
        { ts: "07:30", label: "Resolved" },
      ],
      actions: [],
    },
  ];

  const syncQueue: SyncOp[] = [];
  for (let i = 0; i < 3; i++)
    syncQueue.push({
      id: `OP-0070${i}`,
      label: ["Inventory count", "Cargo receipt", "Muster record"][i],
      record: ["INV-014", "C-171", "FT-03"][i],
      priority: "P1",
      created: `11:${10 + i * 4}`,
      source: "Maitri Edge 02",
      status: "QUEUED",
    });
  for (let i = 0; i < 18; i++)
    syncQueue.push({
      id: `OP-006${String(i + 10)}`,
      label: ["Photo evidence", "Waste log", "Env reading", "Asset hours"][i % 4],
      record: ["C-171", "W-042", "ENV-18", "GEN-11"][i % 4],
      priority: "P2",
      created: `${10 + Math.floor(i / 6)}:${String((i * 9) % 60).padStart(2, "0")}`,
      source: "Maitri Edge 02",
      status: "QUEUED",
    });

  const audit: AuditEvent[] = [];
  const actions = [
    ["Recorded custody scan", "Dispatched", "Cape Town"],
    ["Locked manifest", "Draft", "Locked"],
    ["Recorded inventory count", "—", "Counted"],
    ["Updated sortie", "Planned", "Active"],
    ["Recorded movement", "Station", "Field"],
    ["Uploaded evidence", "2/3", "3/3"],
    ["Approved permit condition", "Pending", "Approved"],
    ["Logged waste transfer", "Stored", "Backhaul planned"],
  ];
  const users = [
    "Operations Controller",
    "Logistics Officer",
    "Station Engineer",
    "Medical Officer",
    "Field Guide",
    "Environment Officer",
  ];
  for (let i = 0; i < 110; i++) {
    const a = actions[i % actions.length];
    const m = START_CLOCK - 6 - i * 4;
    audit.push({
      id: `AUD-${String(4200 - i)}`,
      ts:
        i < 30
          ? fmtClock(m)
          : `${String(13 - Math.floor(i / 30)).padStart(2, "0")} Oct · ${fmtClock(m + 1440 * 2)}`,
      user: users[i % users.length],
      action: a[0],
      record:
        i % 3 === 0
          ? `C-${100 + ((i * 7) % 124)}`
          : i % 3 === 1
            ? `M-0${10 + (i % 18)}`
            : `INV-${String((i % 52) + 1).padStart(3, "0")}`,
      oldState: a[1],
      newState: a[2],
      device: i % 2 ? "Bharati Edge 01" : "Central Portal",
      source: i % 2 ? "Edge" : "Central",
      sync: "SYNCED",
    });
  }
  audit.unshift(
    {
      id: "AUD-4201",
      ts: "14:33",
      user: "Sync engine",
      action: "Delivered incident",
      record: "INC-024",
      oldState: "Local",
      newState: "Delivered",
      device: "Bharati Edge 01",
      source: "Edge",
      sync: "DELIVERED",
    },
    {
      id: "AUD-4202",
      ts: "14:32",
      user: "Logistics Officer",
      action: "Raised cargo exception",
      record: "C-128",
      oldState: "In transit",
      newState: "Damaged",
      device: "Cape Town Scanner 03",
      source: "Edge",
      sync: "SYNCED",
    },
  );

  const gates: Gate[] = [
    mkGate(
      "g1",
      "01",
      "Mission Scope",
      "Expedition Leader",
      "30 Sep 2026",
      [4, 4],
      null,
      [
        "Science plan approved",
        "Station tasks allocated",
        "Field programme defined",
        "Budget sanctioned",
        "Risk register baselined",
        "Ministry sign-off",
      ],
      6,
    ),
    mkGate(
      "g2",
      "02",
      "Personnel",
      "HR & Medical",
      "05 Oct 2026",
      [9, 9],
      null,
      [
        "Medical fitness (42/42)",
        "Winter-over roster",
        "Survival training",
        "Visas issued",
        "Insurance cover",
        "Emergency contacts",
        "Role assignments",
        "Field team rosters",
        "Travel documents",
      ],
      9,
    ),
    mkGate(
      "g3",
      "03",
      "Permit & Environment",
      "Environment Officer",
      "14 Oct 2026",
      [2, 3],
      "Permit P-031 evidence (waste plan) due",
      [
        "EIA filed",
        "Permit P-029 issued",
        "Permit P-030 issued",
        "Permit P-031 evidence",
        "Biosecurity briefing",
        "Waste management plan",
        "Fuel spill plan",
        "Protected area review",
      ],
      7,
    ),
    mkGate(
      "g4",
      "04",
      "Cargo & Customs",
      "Logistics Officer",
      "18 Oct 2026",
      [2, 3],
      "C-128 hazardous declaration missing",
      [
        "Demand consolidation",
        "Packing lists",
        "Hazardous declarations",
        "Customs clearance Goa",
        "Cape Town transit permit",
        "Manifests locked",
        "Seal register",
        "Insurance certificates",
        "Reefer checks",
        "Backhaul plan",
        "C-112 customs hold",
        "C-128 DG declaration",
      ],
      9,
    ),
    mkGate(
      "g5",
      "05",
      "Travel / Vessel / Flight",
      "Operations",
      "20 Oct 2026",
      [5, 5],
      null,
      [
        "Vessel charter",
        "Flight bookings",
        "Cape Town accommodation",
        "Helicopter slots",
        "Ice pilot confirmed",
        "Port clearances",
        "Crew list",
        "Transit schedule",
        "DROMLAN slots",
        "Contingency plan",
      ],
      10,
    ),
    mkGate(
      "g6",
      "06",
      "Closeout",
      "Expedition Leader",
      "15 Mar 2027",
      [0, 4],
      null,
      [
        "Backhaul executed",
        "Waste closed",
        "Post-activity report",
        "Asset reconciliation",
        "Final audit",
      ],
      0,
    ),
  ];
  // totals: 6+9+6+8+10+2 = 41 done of 50

  return {
    version: DEMO_VERSION,
    clock: START_CLOCK,
    opSeq: 820,
    connection: "CONNECTED",
    syncPhase: null,
    syncProgress: [],
    lastSummary: null,
    lastSync: "14:32",
    welcomed: false,
    guide: { active: false, step: 0 },
    expeditions: [
      {
        id: "e46",
        slug: "46th-isea",
        name: "46th ISEA",
        season: "2026-2027",
        stations: "Bharati / Maitri",
        status: "ACTIVE",
        blockers: "Cargo",
        cutoff: "18 Oct",
        owner: "Operations",
        leader: "Rohan Menon",
        objective:
          "Sustain year-round operations at Bharati and Maitri; deliver glaciology and atmospheric programmes including the Larsemann ice-core campaign.",
        start: "01 Nov 2026",
        end: "31 Mar 2027",
      },
      {
        id: "e47",
        slug: "47th-isea",
        name: "47th ISEA",
        season: "2027-2028",
        stations: "Bharati / Maitri",
        status: "PLANNING",
        blockers: "Mission scope",
        cutoff: "15 Sep 2027",
        owner: "Planning Cell",
        leader: "TBD",
        objective: "Planning phase.",
        start: "Nov 2027",
        end: "Mar 2028",
      },
      {
        id: "e45",
        slug: "45th-isea",
        name: "45th ISEA",
        season: "2025-2026",
        stations: "Bharati / Maitri",
        status: "CLOSED",
        blockers: "None",
        cutoff: "None",
        owner: "Operations",
        leader: "Kavya Bhat",
        objective: "Closed out.",
        start: "Nov 2025",
        end: "Mar 2026",
      },
    ],
    gates,
    cargo,
    containers,
    manifests,
    personnel,
    assets,
    inventory,
    txns: [
      {
        id: "TX-311",
        ts: "14:20",
        item: "Arctic diesel (SAB)",
        type: "COUNT",
        delta: 0,
        reason: "Scheduled tank dip",
        user: "Station Engineer",
        sync: "SYNCED",
      },
      {
        id: "TX-310",
        ts: "12:05",
        item: "Freeze-dried rations",
        type: "ISSUE",
        delta: -6,
        reason: "Field Team 07 sortie",
        user: "Logistics Officer",
        sync: "SYNCED",
      },
      {
        id: "TX-309",
        ts: "10:40",
        item: "Generator coolant pumps",
        type: "ISSUE",
        delta: -1,
        reason: "INC-023 repair",
        user: "Station Engineer",
        sync: "SYNCED",
      },
      {
        id: "TX-308",
        ts: "09:15",
        item: "Oxygen cylinders",
        type: "COUNT",
        delta: -1,
        reason: "Weekly count",
        user: "Medical Officer",
        sync: "SYNCED",
      },
      {
        id: "TX-307",
        ts: "Yesterday",
        item: "Petrol (snowmobile)",
        type: "ISSUE",
        delta: -220,
        reason: "Sortie S-020",
        user: "Logistics Officer",
        sync: "SYNCED",
      },
    ],
    sorties,
    incidents,
    syncQueue,
    conflicts: [
      {
        id: "CF-021",
        record: "INV-001",
        field: "Quantity",
        server: "740 kL",
        edge: "736 kL",
        base: 8,
        current: 9,
        status: "REVIEW REQUIRED",
      },
      {
        id: "CF-019",
        record: "P-017",
        field: "Location",
        server: "Bharati",
        edge: "Field Camp 07",
        base: 3,
        current: 4,
        status: "RESOLVED",
        resolution: "Edge event accepted",
      },
    ],
    audit,
    notifications: [
      {
        id: "N1",
        level: "CRITICAL",
        text: "Field Team 07 missed check-in",
        href: "/incidents/INC-024",
        ts: "14:32",
        read: false,
      },
      {
        id: "N2",
        level: "ATTENTION",
        text: "Cargo C-128 exception created",
        href: "/cargo/C-128",
        ts: "14:32",
        read: false,
      },
      {
        id: "N3",
        level: "ATTENTION",
        text: "Maitri edge node stale",
        href: "/sync",
        ts: "11:34",
        read: false,
      },
      {
        id: "N4",
        level: "UPCOMING",
        text: "Permit P-031 evidence due",
        href: "/permits",
        ts: "09:00",
        read: false,
      },
      {
        id: "N5",
        level: "ATTENTION",
        text: "Spare parts below threshold",
        href: "/inventory",
        ts: "08:30",
        read: true,
      },
    ],
    activity: [
      {
        id: "A5",
        ts: "14:33",
        text: "Incident INC-024 delivered to central",
        href: "/incidents/INC-024",
      },
      {
        id: "A4",
        ts: "14:32",
        text: "Cargo C-128 exception raised at Cape Town",
        href: "/cargo/C-128",
      },
      { id: "A3", ts: "14:31", text: "Manifest M-018 locked", href: "/manifests" },
      { id: "A2", ts: "14:28", text: "Personnel movement recorded", href: "/personnel" },
      { id: "A1", ts: "14:20", text: "Inventory count completed", href: "/inventory" },
    ],
    edgeNodes: [
      {
        id: "bharati-01",
        name: "Bharati Edge 01",
        station: "Bharati",
        state: "CONNECTED",
        lastSync: "14:32",
      },
      {
        id: "maitri-02",
        name: "Maitri Edge 02",
        station: "Maitri",
        state: "STALE",
        lastSync: "11:34",
      },
      {
        id: "capetown-03",
        name: "Cape Town Scanner 03",
        station: "Cape Town",
        state: "CONNECTED",
        lastSync: "14:32",
      },
    ],
    permits: Array.from({ length: 12 }, (_, i) => ({
      Permit: `P-0${20 + i}`,
      Authority: ["CEP / ATCM", "NCPOR", "MoES", "SA Port Authority"][i % 4],
      Expiry: `${10 + i} Mar 2027`,
      Condition: [
        "Waste management plan",
        "No-fly buffer 2 km",
        "Specimen export limit",
        "Fuel storage bunded",
        "Drone ops notification",
        "Protected area entry",
      ][i % 6],
      Evidence: i === 11 ? "2 / 3" : i % 5 === 3 ? "1 / 2" : "Complete",
      Status: i === 11 ? "EVIDENCE DUE" : i % 5 === 3 ? "ATTENTION" : "VALID",
    })).map((p, i) => (i === 11 ? { ...p, Permit: "P-031" } : p)),
    environment: Array.from({ length: 10 }, (_, i) => ({
      Event: [
        "Fuel spill (contained)",
        "Wildlife sighting log",
        "Snow chemistry sample",
        "Noise survey",
        "Waste incineration",
        "Protected area visit",
      ][i % 6],
      Location: [
        "Bharati Fuel Farm",
        "Larsemann Hills",
        "Field Camp 08",
        "Bharati",
        "Maitri",
        "Schirmacher Oasis",
      ][i % 6],
      Category: ["Incident", "Monitoring", "Sampling", "Monitoring", "Waste", "Access"][i % 6],
      Date: `${14 - i} Oct 2026`,
      Status: i === 0 ? "CLOSED" : i % 4 === 1 ? "OPEN" : "RECORDED",
    })),
    biosecurity: Array.from({ length: 10 }, (_, i) => ({
      Inspection: `BIO-${300 + i}`,
      Item: [
        "Field clothing",
        "Fresh produce",
        "Cargo C-140",
        "Boot wash station",
        "Helicopter skids",
        "Soil sampling kit",
      ][i % 6],
      Result: i % 5 === 2 ? "SEEDS FOUND · CLEANED" : "PASS",
      Evidence: `${1 + (i % 3)} photos`,
      Officer: ["N. Sethi", "G. Kapoor", "M. Sen"][i % 3],
    })),
    waste: Array.from({ length: 9 }, (_, i) => ({
      Record: `W-0${40 + i}`,
      Stream: ["Food waste", "Plastics", "Hazardous (oil)", "Metal", "Paper", "E-waste"][i % 6],
      Quantity: `${40 + i * 17} kg`,
      Location: i % 2 ? "Bharati Waste Yard" : "Maitri Waste Yard",
      Stage: String(i % 7),
    })),
  };
}

function mkGate(
  id: string,
  n: string,
  name: string,
  owner: string,
  due: string,
  evidence: [number, number],
  blocker: string | null,
  reqs: string[],
  done: number,
): Gate {
  return {
    id,
    n,
    name,
    owner,
    due,
    evidence,
    blocker,
    requirements: reqs.map((label, i) => ({ id: `${id}-${i}`, label, done: i < done })),
  };
}

export type {
  Asset,
  Person,
  InventoryItem,
  Sortie,
  Incident,
  SyncOp,
  AuditEvent,
  Container,
  Manifest,
  Gate,
  Cargo,
};
