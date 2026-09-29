/**
 * Service layer. Each service exposes read models over the demo state, shaped
 * like the responses a real API would return. Components never compute
 * operational figures directly from raw arrays.
 */
import type { DemoState, Gate, GateStatus, InventoryItem } from "./types";

export const expeditionService = {
  list: (s: DemoState) => s.expeditions,
  bySlug: (s: DemoState, slug: string) => s.expeditions.find((e) => e.slug === slug),
};

export const readinessService = {
  gateStatus(g: Gate): GateStatus {
    const done = g.requirements.filter((r) => r.done).length;
    if (done === g.requirements.length) return "READY";
    if (done === 0) return "NOT STARTED";
    if (g.blocker && g.id === "g4") return "BLOCKED";
    return "ATTENTION";
  },
  summary(s: DemoState) {
    const total = s.gates.reduce((a, g) => a + g.requirements.length, 0);
    const done = s.gates.reduce((a, g) => a + g.requirements.filter((r) => r.done).length, 0);
    return { total, done, pct: Math.round((done / total) * 100) };
  },
};

export const cargoService = {
  list: (s: DemoState) => s.cargo,
  byId: (s: DemoState, id: string) => s.cargo.find((c) => c.id === id),
  openExceptions: (s: DemoState) => s.cargo.filter((c) => c.exception && !c.exceptionResolved),
  atRisk: (s: DemoState) => s.cargo.filter((c) => c.atRisk && !c.exceptionResolved),
  metrics(s: DemoState) {
    return {
      total: s.cargo.length,
      inTransit: s.cargo.filter((c) => c.stage >= 4 && c.stage < 7 && c.status !== "MISSING")
        .length,
      atRisk: cargoService.atRisk(s).length,
      exceptions: cargoService.openExceptions(s).length,
      critical: s.cargo.filter((c) => c.criticality === "CRITICAL").length,
      awaitingReceipt: s.cargo.filter((c) => c.stage === 6).length,
      reconciliation:
        s.cargo.filter((c) => c.status === "MISSING" || c.sync === "CONFLICT").length + 2,
    };
  },
  manifestItems: (s: DemoState, m: string) => s.cargo.filter((c) => c.manifest === m),
};

export const inventoryService = {
  daysCover: (i: InventoryItem) =>
    i.dailyUse ? Math.round((i.available - i.reserved) / i.dailyUse) : 999,
  categories(s: DemoState) {
    const cats = ["Fuel", "Food", "Medical", "Spare Parts"] as const;
    const fixedDays: Record<string, number> = { Fuel: 18, Food: 23, Medical: 47, "Spare Parts": 9 };
    return cats.map((cat) => {
      const items = s.inventory.filter((i) => i.category === cat);
      const cap = items.reduce((a, i) => a + i.threshold / 0.4, 0);
      const avail = items.reduce((a, i) => a + i.available, 0);
      const pct = Math.min(100, Math.round((avail / cap) * 100));
      const base = { Fuel: 74, Food: 63, Medical: 91, "Spare Parts": 38 }[cat];
      // Anchored to the baseline scenario; spare parts reflect receipts and counts.
      const below = items.filter((i) => i.available < i.threshold).length;
      return {
        category: cat,
        pct: cat === "Spare Parts" ? Math.min(100, base + Math.max(0, pct - 38)) : base,
        days:
          fixedDays[cat] + (cat === "Spare Parts" ? Math.max(0, Math.round((pct - 38) / 3)) : 0),
        available: avail,
        reserved: items.reduce((a, i) => a + i.reserved, 0),
        inTransit: items.reduce((a, i) => a + i.inTransit, 0),
        below,
        items: items.length,
      };
    });
  },
};

export const personnelService = {
  counts(s: DemoState) {
    const unacc = s.personnel.filter((p) => !p.accounted).length;
    return {
      deployed: s.personnel.length,
      station: s.personnel.filter((p) => p.status === "STATION").length,
      field: s.personnel.filter(
        (p) => p.status === "FIELD" || (p.status === "UNACCOUNTED" && p.accounted),
      ).length,
      unaccounted: unacc,
    };
  },
  team: (s: DemoState, team: string) => s.personnel.filter((p) => p.team === team),
};

export const incidentService = {
  active: (s: DemoState) => s.incidents.filter((i) => i.status !== "RESOLVED"),
  primary: (s: DemoState) =>
    s.incidents.find((i) => i.severity === "P0" && i.status !== "RESOLVED") ?? s.incidents[0],
  metrics(s: DemoState) {
    return {
      active: incidentService.active(s).length,
      ackRequired: s.incidents.filter((i) => i.status === "ACK REQUIRED").length,
      responding: s.incidents.filter((i) => i.status === "RESPONDING").length,
      resolvedToday: s.incidents.filter((i) => i.status === "RESOLVED").length + 3,
      local: s.incidents.filter((i) => i.status === "LOCAL").length,
    };
  },
};

export const syncService = {
  pending: (s: DemoState) =>
    s.syncQueue.filter((o) => ["LOCAL", "QUEUED", "TRANSMITTING", "RETRY"].includes(o.status)),
  edgePending: (s: DemoState) =>
    s.syncQueue.filter(
      (o) => o.source === "Bharati Edge 01" && ["LOCAL", "TRANSMITTING"].includes(o.status),
    ),
  byPriority(s: DemoState) {
    const p = syncService.pending(s);
    return {
      P0: p.filter((o) => o.priority === "P0").length,
      P1: p.filter((o) => o.priority === "P1").length,
      P2: p.filter((o) => o.priority === "P2").length,
    };
  },
  edgeSummary: (s: DemoState) => ({
    up: s.edgeNodes.filter((n) => n.state === "CONNECTED").length,
    total: s.edgeNodes.length,
  }),
};

export const auditService = {
  list: (s: DemoState) => s.audit,
  forRecord: (s: DemoState, record: string) => s.audit.filter((a) => a.record === record),
};

export const notificationService = {
  open: (s: DemoState) => s.notifications.filter((n) => !n.resolved),
  unread: (s: DemoState) => s.notifications.filter((n) => !n.read && !n.resolved).length,
};

export const sortieService = {
  list: (s: DemoState) => s.sorties,
  byId: (s: DemoState, id: string) => s.sorties.find((x) => x.id === id),
};
