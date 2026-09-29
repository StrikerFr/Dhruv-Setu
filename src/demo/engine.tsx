import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createSeed, DEMO_VERSION, fmtClock } from "./seed";
import type { DemoState, Incident, Priority, SyncOp } from "./types";

const KEY = "dhruvsetu-demo-state";
const USER = "Operations Controller";

type Draft = DemoState;

function tick(s: Draft) {
  s.clock += 1;
  return fmtClock(s.clock);
}
function offline(s: Draft) {
  return s.connection !== "CONNECTED";
}
function audit(
  s: Draft,
  a: {
    action: string;
    record: string;
    oldState: string;
    newState: string;
    device?: string;
    user?: string;
    source?: string;
  },
) {
  const n = s.audit.length + 4300;
  s.audit.unshift({
    id: `AUD-${n}`,
    ts: fmtClock(s.clock),
    user: a.user ?? USER,
    action: a.action,
    record: a.record,
    oldState: a.oldState,
    newState: a.newState,
    device: a.device ?? "Central Portal",
    source: a.source ?? (a.device?.includes("Edge") ? "Edge" : "Central"),
    sync: offline(s) && a.device?.includes("Edge") ? "LOCAL" : "SYNCED",
  });
}
function activity(s: Draft, text: string, href: string) {
  s.activity.unshift({
    id: `A${s.activity.length + 100}-${s.clock}`,
    ts: fmtClock(s.clock),
    text,
    href,
  });
}
function notify(
  s: Draft,
  level: DemoState["notifications"][number]["level"],
  text: string,
  href: string,
) {
  s.notifications.unshift({
    id: `N${s.notifications.length + 100}-${s.clock}`,
    level,
    text,
    href,
    ts: fmtClock(s.clock),
    read: false,
  });
}
function op(
  s: Draft,
  o: Omit<SyncOp, "id" | "created" | "status" | "source"> & { source?: string },
) {
  s.opSeq += 1;
  const id = `OP-${String(s.opSeq).padStart(5, "0")}`;
  s.syncQueue.unshift({
    ...o,
    id,
    created: fmtClock(s.clock),
    source: o.source ?? "Bharati Edge 01",
    status: offline(s) ? "LOCAL" : "SYNCED",
  });
  return id;
}

export interface CreateIncidentInput {
  type: string;
  location: string;
  personnel: number;
  description: string;
  severity?: Incident["severity"];
  device?: string;
}

function makeActions(update: (fn: (s: Draft) => void) => void, getState: () => DemoState) {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let lastReturn: string | null = null;

  const actions = {
    reset() {
      update((s) => {
        const fresh = createSeed();
        Object.keys(s).forEach((k) => delete (s as unknown as Record<string, unknown>)[k]);
        Object.assign(s, fresh, { welcomed: true });
      });
    },
    setWelcomed() {
      update((s) => void (s.welcomed = true));
    },
    showWelcome() {
      update((s) => void (s.welcomed = false));
    },
    disconnect() {
      update((s) => {
        if (s.connection !== "CONNECTED") return;
        tick(s);
        s.connection = "OFFLINE";
        s.lastSummary = null;
        const n = s.edgeNodes.find((e) => e.id === "bharati-01");
        if (n) n.state = "OFFLINE";
        audit(s, {
          action: "Network link lost (simulated)",
          record: "Bharati Edge 01",
          oldState: "Connected",
          newState: "Offline",
          device: "Bharati Edge 01",
        });
        activity(s, "Bharati Edge 01 switched to offline operation", "/sync");
      });
    },
    async reconnect() {
      if (getState().connection !== "OFFLINE") return;
      update((s) => {
        s.connection = "RECONNECTING";
        s.syncPhase = "CONNECTING";
        s.syncProgress = [];
        s.lastSummary = {
          synced: 0,
          byPriority: { P0: 0, P1: 0, P2: 0 },
          exceptions: 0,
          audits: 0,
          conflicts: 0,
        };
      });
      await wait(800);
      update((s) => void (s.syncPhase = "AUTHENTICATING"));
      await wait(800);
      for (const p of ["P0", "P1", "P2"] as Priority[]) {
        update((s) => {
          s.syncPhase = `SYNCING ${p}`;
          s.syncQueue.forEach((o) => {
            if (o.priority === p && o.status === "LOCAL") o.status = "TRANSMITTING";
          });
        });
        await wait(p === "P0" ? 1000 : 900);
        update((s) => {
          const batch = s.syncQueue.filter((o) => o.priority === p && o.status === "TRANSMITTING");
          const sum = s.lastSummary!;
          for (const o of batch) {
            o.status = o.kind === "incident" ? "DELIVERED" : "SYNCED";
            sum.synced += 1;
            sum.byPriority[p] += 1;
            if (o.kind === "incident") {
              const inc = s.incidents.find((i) => i.id === o.record);
              if (inc) {
                inc.status = "ACK REQUIRED";
                inc.sync = "DELIVERED";
                inc.timeline.push({
                  ts: fmtClock(s.clock),
                  label: "Delivered to central",
                  by: "Sync engine · P0",
                });
                audit(s, {
                  action: "Delivered incident",
                  record: inc.id,
                  oldState: "Local",
                  newState: "Delivered",
                  user: "Sync engine",
                  device: "Bharati Edge 01",
                });
                notify(
                  s,
                  "CRITICAL",
                  `${inc.id} ${inc.type} delivered: acknowledgement required`,
                  `/incidents/${inc.id}`,
                );
              }
            }
            if (o.kind === "cargoException") {
              sum.exceptions += 1;
              const c = s.cargo.find((x) => x.id === o.record);
              if (c && !s.conflicts.some((cf) => cf.id === "CF-024")) {
                c.sync = "CONFLICT";
                s.conflicts.unshift({
                  id: "CF-024",
                  record: c.id,
                  field: "Custody state",
                  server: "Received",
                  edge: "Marked Damaged",
                  base: 12,
                  current: 14,
                  status: "REVIEW REQUIRED",
                });
                sum.conflicts += 1;
                notify(s, "ATTENTION", `Conflict CF-024 on ${c.id} requires review`, "/conflicts");
              }
            }
          }
          s.cargo.forEach((c) => {
            if (c.sync === "LOCAL") c.sync = "SYNCED";
            c.events.forEach((e) => e.sync === "LOCAL" && (e.sync = "SYNCED"));
          });
          s.audit.forEach((a) => a.sync === "LOCAL" && (a.sync = "SYNCED"));
          s.txns.forEach((t) => t.sync === "LOCAL" && (t.sync = "SYNCED"));
          s.syncProgress.push(p);
        });
      }
      await wait(500);
      update((s) => {
        tick(s);
        s.syncPhase = "COMPLETE";
        s.connection = "CONNECTED";
        s.lastSync = fmtClock(s.clock);
        const n = s.edgeNodes.find((e) => e.id === "bharati-01");
        if (n) {
          n.state = "CONNECTED";
          n.lastSync = s.lastSync;
        }
        const sum = s.lastSummary!;
        audit(s, {
          action: `Synchronized ${sum.synced} operations`,
          record: "Bharati Edge 01",
          oldState: "Offline",
          newState: "Synchronized",
          user: "Sync engine",
          device: "Bharati Edge 01",
        });
        sum.audits = 1;
        if (sum.synced) {
          notify(s, "SYNC", `${sum.synced} operations synchronized`, "/sync");
          activity(s, `${sum.synced} operations synchronized from Bharati Edge 01`, "/sync");
        }
      });
      await wait(2200);
      update((s) => {
        if (s.syncPhase === "COMPLETE") s.syncPhase = null;
      });
    },
    scanCargo(id: string) {
      update((s) => {
        const t = tick(s);
        const c = s.cargo.find((x) => x.id === id);
        if (!c) return;
        const old = c.custody;
        c.custody = "Bharati";
        c.stage = 7;
        c.lastConfirmed = `${t} IST`;
        c.sync = offline(s) ? "LOCAL" : "SYNCED";
        c.events = c.events.filter((e) => e.stage < 7);
        c.events.push({
          stage: 7,
          ts: `Today · ${t} IST`,
          location: "Bharati Cargo Bay",
          operator: "D. Rao",
          device: "Bharati Edge 01",
          source: "Edge",
          sync: c.sync,
        });
        lastReturn = op(s, {
          label: "Custody scan",
          record: id,
          priority: "P1",
          kind: "cargoScan",
        });
        audit(s, {
          action: "Recorded custody scan",
          record: id,
          oldState: old,
          newState: "Bharati",
          device: "Bharati Edge 01",
          user: "Field Operator",
        });
        activity(s, `Cargo ${id} scanned at Bharati cargo bay`, `/cargo/${id}`);
      });
      return lastReturn!;
    },
    receiveManifest(manifestId: string, damagedId: string, missingId: string) {
      update((s) => {
        const t = tick(s);
        const m = s.manifests.find((x) => x.id === manifestId);
        if (!m) return;
        const loc = offline(s) ? "LOCAL" : "SYNCED";
        const items = s.cargo.filter((c) => c.manifest === manifestId);
        for (const c of items) {
          c.stage = 7;
          c.lastConfirmed = `${t} IST`;
          c.sync = loc;
          c.atRisk = false;
          if (!c.events.some((e) => e.stage === 7))
            c.events.push({
              stage: 7,
              ts: `Today · ${t} IST`,
              location: "Bharati Cargo Bay",
              operator: "D. Rao",
              device: "Bharati Edge 01",
              source: "Edge",
              sync: loc,
            });
          if (c.id === damagedId) {
            c.status = "DAMAGED";
            c.exception = "DAMAGED";
            c.exceptionResolved = false;
            c.custody = "Bharati";
          } else if (c.id === missingId) {
            c.status = "MISSING";
            c.exception = "MISSING";
            c.exceptionResolved = false;
            c.custody = "Unconfirmed";
            c.events = c.events.filter((e) => e.stage < 7);
            c.stage = 6;
          } else {
            c.status = "RECEIVED";
            c.custody = "Bharati";
            if (c.exception !== "CUSTOMS HOLD") c.exception = null;
            if (c.category === "Spare Parts") {
              const inv = s.inventory.find(
                (i) =>
                  i.category === "Spare Parts" &&
                  c.item.toLowerCase().startsWith(i.name.split(" ")[0].toLowerCase()),
              );
              const target = inv ?? s.inventory.find((i) => i.category === "Spare Parts")!;
              target.available += 2;
              target.inTransit = Math.max(0, target.inTransit - 2);
              s.txns.unshift({
                id: `TX-${s.txns.length + 400}`,
                ts: t,
                item: target.name,
                type: "RECEIPT",
                delta: 2,
                reason: `Receipt ${manifestId} · ${c.id}`,
                user: "Field Operator",
                sync: loc,
              });
            }
          }
          c.eta = "—";
        }
        m.status = "RECEIVED";
        const cont = s.containers.find((x) => x.id === m.container);
        if (cont) {
          cont.status = "RECEIVED";
          cont.location = "Bharati";
        }
        op(s, {
          label: `Partial receipt ${manifestId} (${items.length - 1}/${items.length})`,
          record: manifestId,
          priority: "P1",
          kind: "receipt",
        });
        if (damagedId || missingId)
          op(s, {
            label: `Cargo exception · ${[damagedId && `${damagedId} damaged`, missingId && `${missingId} missing`].filter(Boolean).join(", ")}`,
            record: damagedId || missingId,
            priority: "P1",
            kind: "cargoException",
          });
        audit(s, {
          action: "Recorded partial receipt",
          record: manifestId,
          oldState: "In transit",
          newState: `Received ${items.length - 1}/${items.length}`,
          device: "Bharati Edge 01",
          user: "Field Operator",
        });
        if (damagedId)
          audit(s, {
            action: "Raised cargo exception",
            record: damagedId,
            oldState: "In transit",
            newState: "Damaged",
            device: "Bharati Edge 01",
            user: "Field Operator",
          });
        if (missingId)
          audit(s, {
            action: "Raised cargo exception",
            record: missingId,
            oldState: "In transit",
            newState: "Missing",
            device: "Bharati Edge 01",
            user: "Field Operator",
          });
        activity(
          s,
          `Manifest ${manifestId} received ( exceptions)`,
          damagedId ? `/cargo/${damagedId}` : "/manifests",
        );
        if (damagedId)
          notify(
            s,
            "ATTENTION",
            `Cargo ${damagedId} damaged on receipt at Bharati`,
            `/cargo/${damagedId}`,
          );
      });
    },
    resolveCargoException(id: string, disposition: string) {
      update((s) => {
        tick(s);
        const c = s.cargo.find((x) => x.id === id);
        if (!c) return;
        c.exceptionResolved = true;
        c.atRisk = false;
        if (c.status === "AT RISK" || c.status === "BLOCKED") c.status = "IN TRANSIT";
        audit(s, {
          action: `Resolved exception: ${disposition}`,
          record: id,
          oldState: c.exception ?? "Open",
          newState: "Resolved",
        });
        activity(s, `Cargo ${id} exception resolved`, `/cargo/${id}`);
        s.notifications.forEach((n) => n.href === `/cargo/${id}` && (n.resolved = true));
      });
    },
    resolveBlocker(gateId: string) {
      update((s) => {
        tick(s);
        const g = s.gates.find((x) => x.id === gateId);
        if (!g || !g.blocker) return;
        const req =
          [...g.requirements].reverse().find((r) => !r.done && /C-128|P-031/.test(r.label)) ??
          g.requirements.find((r) => !r.done);
        if (req) req.done = true;
        audit(s, {
          action: "Resolved readiness blocker",
          record: `Gate ${g.n}`,
          oldState: g.blocker,
          newState: "Evidence attached",
        });
        activity(s, `Readiness blocker cleared: ${g.blocker}`, "/expeditions/46th-isea/readiness");
        g.blocker = null;
        g.evidence = [g.evidence[1], g.evidence[1]];
      });
    },
    toggleRequirement(gateId: string, reqId: string) {
      update((s) => {
        tick(s);
        const r = s.gates.find((g) => g.id === gateId)?.requirements.find((x) => x.id === reqId);
        if (!r) return;
        r.done = !r.done;
        audit(s, {
          action: "Updated requirement",
          record: r.label,
          oldState: r.done ? "Open" : "Complete",
          newState: r.done ? "Complete" : "Open",
        });
      });
    },
    createSortie(input: {
      team: string;
      route: string;
      departure: string;
      eta: string;
      members: number;
      lead: string;
    }) {
      update((s) => {
        tick(s);
        const num = Math.max(...s.sorties.map((x) => parseInt(x.id.slice(2)))) + 1;
        const id = `S-0${num}`;
        const [h, m] = input.departure.split(":").map(Number);
        const next = `${String(((h || 0) + 1) % 24).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
        s.sorties.unshift({ id, ...input, status: "ACTIVE", nextCheckIn: next });
        lastReturn = id;
        op(s, {
          label: `Sortie ${id} started`,
          record: id,
          priority: "P1",
          kind: "generic",
          source: offline(s) ? "Bharati Edge 01" : "Central Portal",
        });
        audit(s, { action: "Started sortie", record: id, oldState: "—", newState: "Active" });
        activity(s, `Sortie ${id} departed: ${input.route}`, `/sorties/${id}`);
      });
      return lastReturn!;
    },
    sortieUpdate(id: string, kind: "checkin" | "delay" | "end" | "missed") {
      update((s) => {
        const t = tick(s);
        const so = s.sorties.find((x) => x.id === id);
        if (!so) return;
        const old = so.status;
        if (kind === "checkin") {
          so.status = "ACTIVE";
          const [h, m] = t.split(":").map(Number);
          so.nextCheckIn = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }
        if (kind === "delay") so.status = "DELAYED";
        if (kind === "end") {
          so.status = "COMPLETE";
          so.nextCheckIn = "—";
        }
        if (kind === "missed") {
          so.status = "OVERDUE";
          so.nextCheckIn = `${t} (missed)`;
          notify(s, "CRITICAL", `${so.team} missed check-in on ${so.id}`, `/sorties/${id}`);
        }
        const label = {
          checkin: "Checked in",
          delay: "Reported delay",
          end: "Ended sortie",
          missed: "Missed check-in detected",
        }[kind];
        audit(s, {
          action: label,
          record: id,
          oldState: old,
          newState: so.status,
          user: kind === "missed" ? "Check-in monitor" : USER,
        });
        activity(s, `${so.id} · ${label.toLowerCase()}`, `/sorties/${id}`);
      });
    },
    createIncident(input: CreateIncidentInput) {
      update((s) => {
        const t = tick(s);
        const num = Math.max(...s.incidents.map((i) => parseInt(i.id.slice(4)))) + 1;
        const id = `INC-0${num}`;
        const isOff = offline(s);
        const device = input.device ?? "Central Portal";
        s.incidents.unshift({
          id,
          type: input.type,
          severity: input.severity ?? "P0",
          location: input.location,
          reported: t,
          status: isOff ? "LOCAL" : "ACK REQUIRED",
          sync: isOff ? "LOCAL" : "DELIVERED",
          personnel: input.personnel,
          description: input.description,
          responder: null,
          timeline: isOff
            ? [
                { ts: t, label: "Reported", by: device },
                { ts: t, label: "Saved locally · queued P0", by: device },
              ]
            : [
                { ts: t, label: "Reported", by: device },
                { ts: t, label: "Delivered to central", by: "Sync engine · P0" },
              ],
          actions: [],
        });
        lastReturn = id;
        op(s, {
          label: `Incident ${id} · ${input.type}`,
          record: id,
          priority: "P0",
          kind: "incident",
          source: device,
        });
        audit(s, {
          action: "Reported incident",
          record: id,
          oldState: "—",
          newState: isOff ? "Local" : "Delivered",
          device,
        });
        activity(s, `Incident ${id} reported at ${input.location}`, `/incidents/${id}`);
        if (!isOff)
          notify(s, "CRITICAL", `${id} ${input.type} at ${input.location}`, `/incidents/${id}`);
      });
      return lastReturn!;
    },
    incidentUpdate(id: string, kind: "ack" | "assign" | "action" | "resolve", text?: string) {
      update((s) => {
        const t = tick(s);
        const inc = s.incidents.find((i) => i.id === id);
        if (!inc) return;
        const old = inc.status;
        if (kind === "ack") {
          inc.status = "ACKNOWLEDGED";
          inc.sync = "ACKNOWLEDGED";
          inc.timeline.push({ ts: t, label: "Acknowledged", by: USER });
          s.notifications.forEach((n) => n.href === `/incidents/${id}` && (n.resolved = true));
        }
        if (kind === "assign") {
          inc.status = "RESPONDING";
          inc.responder = text ?? "SAR Team Alpha";
          inc.timeline.push({ ts: t, label: `Responder assigned · ${inc.responder}`, by: USER });
        }
        if (kind === "action") {
          inc.actions.push(text ?? "Action logged");
          inc.timeline.push({ ts: t, label: `Action · ${text}`, by: USER });
        }
        if (kind === "resolve") {
          inc.status = "RESOLVED";
          inc.timeline.push({ ts: t, label: "Resolved", by: USER });
          s.notifications.forEach((n) => n.href === `/incidents/${id}` && (n.resolved = true));
          if (/Field Camp 08/.test(inc.location)) {
            s.sorties.forEach(
              (so) =>
                so.status === "OVERDUE" &&
                so.route.includes("Field Camp 08") &&
                ((so.status = "ACTIVE"), (so.nextCheckIn = "Hourly")),
            );
            s.personnel.forEach((p) => {
              if (p.team === "Field Team 07" && !p.accounted) {
                p.accounted = true;
                p.status = "FIELD";
                p.lastConfirmed = `${t} IST`;
              }
            });
          }
        }
        const label = {
          ack: "Acknowledged incident",
          assign: "Assigned responder",
          action: "Added incident action",
          resolve: "Resolved incident",
        }[kind];
        audit(s, { action: label, record: id, oldState: old, newState: inc.status });
        activity(s, `Incident ${id} ${label.split(" ")[0].toLowerCase()}`, `/incidents/${id}`);
      });
    },
    musterMark(personId: string) {
      update((s) => {
        const t = tick(s);
        const p = s.personnel.find((x) => x.id === personId);
        if (!p) return;
        p.accounted = true;
        p.status = "FIELD";
        p.lastConfirmed = `${t} IST`;
        op(s, {
          label: `Muster · ${p.name} accounted`,
          record: p.id,
          priority: "P1",
          kind: "generic",
          source: offline(s) ? "Bharati Edge 01" : "Central Portal",
        });
        audit(s, {
          action: "Marked accounted",
          record: p.name,
          oldState: "Unaccounted",
          newState: "Accounted",
        });
        activity(s, `${p.name} accounted for (Field Team 07)`, "/muster");
        s.notifications.forEach((n) => n.text.includes("Field Team 07") && (n.resolved = true));
      });
    },
    escalateMuster(team: string) {
      update((s) => {
        tick(s);
        notify(s, "CRITICAL", `${team} muster escalated to Station Leader`, "/muster");
        audit(s, {
          action: "Escalated muster",
          record: team,
          oldState: "Muster open",
          newState: "Escalated",
        });
        activity(s, `${team} muster escalated`, "/muster");
      });
    },
    recordCount(input: { itemId: string; qty: number; reason: string; evidence: string }) {
      update((s) => {
        const t = tick(s);
        const it = s.inventory.find((i) => i.id === input.itemId);
        if (!it) return;
        const delta = input.qty - it.available;
        const old = it.available;
        it.available = input.qty;
        s.txns.unshift({
          id: `TX-${s.txns.length + 400}`,
          ts: t,
          item: it.name,
          type: "COUNT",
          delta,
          reason: input.reason || "Physical count",
          user: USER,
          sync: offline(s) ? "LOCAL" : "SYNCED",
        });
        op(s, {
          label: `Inventory count · ${it.name}`,
          record: it.id,
          priority: "P2",
          kind: "count",
          source: offline(s) ? "Bharati Edge 01" : "Central Portal",
        });
        audit(s, {
          action: "Recorded inventory count",
          record: it.id,
          oldState: `${old} ${it.unit}`,
          newState: `${input.qty} ${it.unit}`,
          device: offline(s) ? "Bharati Edge 01" : "Central Portal",
        });
        activity(s, `Inventory count recorded: ${it.name}`, "/inventory");
      });
    },
    resolveConflict(id: string, mode: "accept" | "reject" | "exception") {
      update((s) => {
        tick(s);
        const cf = s.conflicts.find((c) => c.id === id);
        if (!cf) return;
        cf.status = "RESOLVED";
        cf.resolution = {
          accept: "Edge event accepted · version 15",
          reject: "Edge event rejected · retained server state",
          exception: "Exception created · both events preserved",
        }[mode];
        const c = s.cargo.find((x) => x.id === cf.record);
        if (c) {
          c.sync = "SYNCED";
          if (mode === "accept" || mode === "exception") {
            c.status = "DAMAGED";
            c.exception = "DAMAGED";
          }
        }
        audit(s, {
          action: `Resolved conflict ${id}`,
          record: cf.record,
          oldState: "Review required",
          newState: cf.resolution,
        });
        activity(s, `Conflict  resolved: `, "/conflicts");
      });
    },
    markRead(id: string) {
      update((s) => {
        const n = s.notifications.find((x) => x.id === id);
        if (n) n.read = true;
      });
    },
    markAllRead() {
      update((s) => s.notifications.forEach((n) => (n.read = true)));
    },
    guideStart() {
      update((s) => void ((s.welcomed = true), (s.guide = { active: true, step: 0 })));
    },
    guideStep(step: number) {
      update((s) => void (s.guide.step = step));
    },
    guideExit() {
      update((s) => void (s.guide.active = false));
    },
  };
  return actions;
}

export type DemoActions = ReturnType<typeof makeActions>;

interface Ctx {
  state: DemoState;
  actions: DemoActions;
  hydrated: boolean;
}
const DemoCtx = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createSeed());
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  const update = useCallback((fn: (s: Draft) => void) => {
    setState((prev) => {
      const next = structuredClone(prev);
      fn(next);
      ref.current = next;
      return next;
    });
  }, []);

  const actions = useMemo(() => makeActions(update, () => ref.current), [update]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed.version === DEMO_VERSION) {
          if (parsed.connection === "RECONNECTING") {
            parsed.connection = "OFFLINE";
            parsed.syncPhase = null;
            parsed.syncQueue.forEach((o) => o.status === "TRANSMITTING" && (o.status = "LOCAL"));
          }
          setState(parsed);
        }
      }
    } catch {
      /* ignore corrupt demo state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {
        /* storage full, demo continues in memory */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, actions, hydrated }), [state, actions, hydrated]);
  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const c = useContext(DemoCtx);
  if (!c) throw new Error("useDemo must be used inside DemoProvider");
  return c;
}
