export type Connection = "CONNECTED" | "OFFLINE" | "RECONNECTING";
export type SyncState =
  | "SYNCED"
  | "LOCAL"
  | "QUEUED"
  | "TRANSMITTING"
  | "DELIVERED"
  | "ACKNOWLEDGED"
  | "CONFLICT"
  | "RETRY"
  | "FAILED";
export type Priority = "P0" | "P1" | "P2";
export type Criticality = "CRITICAL" | "HIGH" | "STANDARD";
export type CargoStatus =
  "READY" | "IN TRANSIT" | "AT RISK" | "BLOCKED" | "RECEIVED" | "DAMAGED" | "MISSING";
export type CargoException = "DAMAGED" | "MISSING" | "DELAYED" | "CUSTOMS HOLD" | null;

export const CUSTODY_STAGES = [
  "Demand Raised",
  "Accepted",
  "Packed",
  "Sealed",
  "Dispatched",
  "Cape Town",
  "Polar Leg",
  "Bharati",
] as const;

export interface CustodyEvent {
  stage: number;
  ts: string;
  location: string;
  operator: string;
  device: string;
  source: string;
  sync: SyncState;
}

export interface Cargo {
  id: string;
  item: string;
  category: "Scientific" | "Spare Parts" | "Food" | "Medical" | "Fuel" | "Station";
  container: string;
  manifest: string;
  destination: string;
  criticality: Criticality;
  custody: string;
  stage: number;
  lastConfirmed: string;
  eta: string;
  status: CargoStatus;
  exception: CargoException;
  exceptionResolved?: boolean;
  atRisk: boolean;
  hazard: string | null;
  weight: number;
  owner: string;
  sync: SyncState;
  events: CustodyEvent[];
}

export interface Container {
  id: string;
  type: string;
  weight: number;
  seal: string;
  status: "SEALED" | "IN TRANSIT" | "RECEIVED" | "OPEN" | "INSPECTION";
  location: string;
  manifest: string;
}

export interface Manifest {
  id: string;
  container: string;
  status: "LOCKED" | "DRAFT" | "AMENDMENT PENDING" | "RECEIVED";
  route: string;
  vessel: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  assignment: string;
  team: string | null;
  station: string;
  clearance: "CLEARED" | "PENDING" | "RESTRICTED";
  status: "STATION" | "FIELD" | "TRANSIT" | "UNACCOUNTED";
  lastConfirmed: string;
  accounted: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  station: string;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "OUT OF SERVICE" | "RETIRED";
  maintenance: string;
  assignment: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Fuel" | "Food" | "Medical" | "Spare Parts";
  location: string;
  unit: string;
  available: number;
  reserved: number;
  inTransit: number;
  threshold: number;
  dailyUse: number;
  critical: boolean;
}

export interface InventoryTxn {
  id: string;
  ts: string;
  item: string;
  type: "COUNT" | "RECEIPT" | "ISSUE" | "ADJUSTMENT";
  delta: number;
  reason: string;
  user: string;
  sync: SyncState;
}

export interface Sortie {
  id: string;
  team: string;
  route: string;
  departure: string;
  eta: string;
  status: "PLANNED" | "ACTIVE" | "OVERDUE" | "COMPLETE" | "DELAYED";
  nextCheckIn: string;
  members: number;
  lead: string;
}

export interface TimelineEntry {
  ts: string;
  label: string;
  by?: string;
}

export type IncidentStatus = "LOCAL" | "ACK REQUIRED" | "ACKNOWLEDGED" | "RESPONDING" | "RESOLVED";

export interface Incident {
  id: string;
  type: string;
  severity: "P0" | "P1" | "P2";
  location: string;
  reported: string;
  status: IncidentStatus;
  sync: SyncState;
  personnel: number;
  description: string;
  responder: string | null;
  timeline: TimelineEntry[];
  actions: string[];
}

export interface SyncOp {
  id: string;
  label: string;
  record: string;
  priority: Priority;
  created: string;
  source: string;
  status: SyncState;
  kind?: "incident" | "cargoException" | "cargoScan" | "receipt" | "count" | "generic";
}

export interface Conflict {
  id: string;
  record: string;
  field: string;
  server: string;
  edge: string;
  base: number;
  current: number;
  status: "REVIEW REQUIRED" | "RESOLVED";
  resolution?: string;
}

export interface AuditEvent {
  id: string;
  ts: string;
  user: string;
  action: string;
  record: string;
  oldState: string;
  newState: string;
  device: string;
  source: string;
  sync: SyncState;
}

export type NotifLevel = "CRITICAL" | "ATTENTION" | "UPCOMING" | "SYNC";
export interface Notification {
  id: string;
  level: NotifLevel;
  text: string;
  href: string;
  ts: string;
  read: boolean;
  resolved?: boolean;
}

export interface Activity {
  id: string;
  ts: string;
  text: string;
  href: string;
}

export type GateStatus = "READY" | "ATTENTION" | "BLOCKED" | "NOT STARTED";
export interface Requirement {
  id: string;
  label: string;
  done: boolean;
}
export interface Gate {
  id: string;
  n: string;
  name: string;
  owner: string;
  due: string;
  evidence: [number, number];
  blocker: string | null;
  requirements: Requirement[];
}

export interface Expedition {
  id: string;
  slug: string;
  name: string;
  season: string;
  stations: string;
  status: "ACTIVE" | "PLANNING" | "CLOSED";
  blockers: string;
  cutoff: string;
  owner: string;
  leader: string;
  objective: string;
  start: string;
  end: string;
}

export interface ComplianceRow {
  [k: string]: string;
}

export interface EdgeNode {
  id: string;
  name: string;
  station: string;
  state: "CONNECTED" | "STALE" | "OFFLINE";
  lastSync: string;
}

export interface SyncSummary {
  synced: number;
  byPriority: Record<Priority, number>;
  exceptions: number;
  audits: number;
  conflicts: number;
}

export interface DemoState {
  version: number;
  clock: number; // minutes since midnight IST
  opSeq: number;
  connection: Connection;
  syncPhase: string | null;
  syncProgress: Priority[];
  lastSummary: SyncSummary | null;
  lastSync: string;
  welcomed: boolean;
  guide: { active: boolean; step: number };
  expeditions: Expedition[];
  gates: Gate[];
  cargo: Cargo[];
  containers: Container[];
  manifests: Manifest[];
  personnel: Person[];
  assets: Asset[];
  inventory: InventoryItem[];
  txns: InventoryTxn[];
  sorties: Sortie[];
  incidents: Incident[];
  syncQueue: SyncOp[];
  conflicts: Conflict[];
  audit: AuditEvent[];
  notifications: Notification[];
  activity: Activity[];
  edgeNodes: EdgeNode[];
  permits: ComplianceRow[];
  environment: ComplianceRow[];
  biosecurity: ComplianceRow[];
  waste: ComplianceRow[];
}
