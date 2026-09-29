import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertOctagon,
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  QrCode,
  RefreshCw,
  Route as RouteIcon,
  ScanLine,
  User,
  Warehouse,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDemo } from "@/demo/engine";
import { cargoService, personnelService, syncService } from "@/demo/services";
import { SyncProgress } from "@/components/app/SyncProgress";
import { useShellUI } from "@/components/app/overlays";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/edge")({
  head: () => ({
    meta: [
      { title: "Bharati Edge 01 | DhruvSetu Field Tablet" },
      {
        name: "description",
        content:
          "Offline-first field tablet: scan and receive cargo, count inventory, muster personnel and report incidents without connectivity.",
      },
      { property: "og:title", content: "DhruvSetu Edge: offline field operations" },
      {
        property: "og:description",
        content:
          "Rugged field interface that keeps working when the network does not (simulation).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Edge,
});

type View =
  | "home"
  | "scan"
  | "receive"
  | "count"
  | "muster"
  | "sortie"
  | "incident"
  | "sync"
  | "alerts"
  | "me";

function Edge() {
  const { state, actions, hydrated } = useDemo();
  const [view, setView] = useState<View>("home");
  const pending = syncService.edgePending(state);
  const off = state.connection === "OFFLINE";
  const syncing = state.connection === "RECONNECTING";

  return (
    <div className="min-h-screen bg-abyss text-onnavy">
      <header className="sticky top-0 z-20 border-b border-onnavy/10 bg-abyss/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/dashboard"
            aria-label="Exit to central portal"
            className="grid size-12 place-items-center rounded-[8px] border border-onnavy/15 hover:bg-onnavy/5"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="mr-auto">
            <p className="font-mono text-[15px] font-semibold tracking-[0.14em]">BHARATI EDGE 01</p>
            <p className="font-mono text-[11px] tracking-[0.1em] text-onnavy-muted">
              CARGO BAY · SIMULATION · SYNTHETIC DATA
            </p>
          </div>
          <div
            data-guide="edge-connection"
            className="flex items-center gap-2 rounded-[10px] p-0.5"
          >
            <div
              className={cn(
                "flex h-12 items-center gap-2.5 rounded-[8px] border px-3.5 font-mono text-[12.5px] tracking-[0.1em]",
                off
                  ? "border-orange/60 text-orange"
                  : syncing
                    ? "border-cyan/60 text-cyan"
                    : "border-teal/60 text-teal",
              )}
            >
              {off ? (
                <WifiOff className="size-4" />
              ) : syncing ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Wifi className="size-4" />
              )}
              <span>{off ? "OFFLINE" : syncing ? "SYNCING" : "CONNECTED"}</span>
              <span className="text-onnavy-muted">· {pending.length} PENDING</span>
            </div>
            {state.connection === "CONNECTED" && (
              <button
                onClick={actions.disconnect}
                className="h-12 rounded-[8px] border border-onnavy/25 px-4 text-[14px] font-semibold hover:bg-onnavy/5"
              >
                Disconnect
              </button>
            )}
            {off && (
              <button
                onClick={() => {
                  void actions.reconnect();
                  setView("sync");
                }}
                className="h-12 rounded-[8px] bg-onnavy px-4 text-[14px] font-semibold text-abyss hover:bg-onnavy/90"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {off && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-orange/20 bg-orange/[0.08] px-4 text-center text-[13.5px] text-onnavy"
            >
              <span className="block py-2">
                Operating offline. {pending.length} operations queued (stored safely on this device
                and synchronized when connectivity returns).
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-6">
        {!hydrated ? (
          <p className="py-20 text-center font-mono text-[13px] text-onnavy-muted">
            Loading local store…
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {view === "home" && <Home go={setView} />}
              {view === "scan" && <Scan back={() => setView("home")} />}
              {view === "receive" && <Receive back={() => setView("home")} />}
              {view === "count" && <Count back={() => setView("home")} />}
              {view === "muster" && <Muster back={() => setView("home")} />}
              {view === "sortie" && <StartSortie back={() => setView("home")} />}
              {view === "incident" && (
                <ReportIncident back={() => setView("home")} goSync={() => setView("sync")} />
              )}
              {view === "sync" && <SyncView />}
              {view === "alerts" && <Alerts />}
              {view === "me" && <Me />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <nav
        aria-label="Edge navigation"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-onnavy/10 bg-abyss"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-5">
          {(
            [
              ["home", "WORK", Briefcase],
              ["scan", "SCAN", ScanLine],
              ["sync", "SYNC", RefreshCw],
              ["alerts", "ALERTS", Bell],
              ["me", "ME", User],
            ] as const
          ).map(([v, l, Icon]) => {
            const a =
              view === v || (v === "home" && !["scan", "sync", "alerts", "me"].includes(view));
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "relative flex h-[68px] flex-col items-center justify-center gap-1 font-mono text-[11px] tracking-[0.12em]",
                  a ? "text-cyan" : "text-onnavy-muted",
                )}
              >
                {a && (
                  <motion.span
                    layoutId="edge-tab"
                    className="absolute inset-x-6 top-0 h-0.5 bg-cyan"
                  />
                )}
                <Icon className="size-5" />
                {l}
                {v === "sync" && pending.length > 0 && (
                  <span className="absolute right-[28%] top-2.5 grid min-w-5 place-items-center rounded-full bg-orange px-1 text-[10px] text-abyss">
                    {pending.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------ pieces */

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-onnavy/12 bg-onnavy/[0.035] p-5 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
function Big({
  children,
  onClick,
  variant = "primary",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-2 rounded-[10px] px-6 text-[15px] font-semibold tracking-[0.02em] transition-colors disabled:opacity-40",
        variant === "primary" && "bg-onnavy text-abyss hover:bg-onnavy/90",
        variant === "ghost" && "border border-onnavy/25 text-onnavy hover:bg-onnavy/5",
        variant === "danger" && "bg-critical text-destructive-foreground hover:bg-critical/90",
        className,
      )}
    >
      {children}
    </button>
  );
}
function Title({ back, children, sub }: { back: () => void; children: ReactNode; sub?: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={back}
        aria-label="Back"
        className="grid size-12 place-items-center rounded-[8px] border border-onnavy/15 hover:bg-onnavy/5"
      >
        <ArrowLeft className="size-5" />
      </button>
      <div>
        <h1 className="font-mono text-[20px] font-semibold tracking-[0.1em]">{children}</h1>
        {sub && <p className="text-[13.5px] text-onnavy-muted">{sub}</p>}
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-onnavy/10 py-3 last:border-0">
      <span className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">{k}</span>
      <span className="text-right text-[15px] font-medium">{v}</span>
    </div>
  );
}
function LocalResult({ title, opId, extra }: { title: string; opId?: string; extra?: ReactNode }) {
  const { state } = useDemo();
  const off = state.connection !== "CONNECTED";
  return (
    <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <Card className={off ? "border-orange/40" : "border-teal/40"}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className={cn("size-8", off ? "text-orange" : "text-teal")} />
          <div>
            <p className="text-[19px] font-semibold">{title}</p>
            <p className="text-[14px] text-onnavy-muted">
              {off ? "Saved locally" : "Saved and synchronized"}
            </p>
          </div>
        </div>
        <div className="mt-5">
          {opId && <Row k="OPERATION ID" v={<span className="font-mono">{opId}</span>} />}
          <Row k="LOCAL RECORD" v="CREATED" />
          <Row
            k="SYNC STATE"
            v={
              <span className={off ? "text-orange" : "text-teal"}>
                {off ? "○ NOT YET SYNCHRONIZED" : "● SYNCHRONIZED"}
              </span>
            }
          />
          {extra}
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------- views */

function Home({ go }: { go: (v: View) => void }) {
  const tiles: [View, string, string, typeof QrCode, string?][] = [
    ["scan", "SCAN CARGO", "Confirm custody by QR", QrCode],
    ["receive", "RECEIVE CARGO", "Manifest M-018 · 18 expected", PackageCheck, "edge-receive"],
    ["count", "INVENTORY COUNT", "Record a physical count", Warehouse],
    ["muster", "PERSONNEL MUSTER", "Field Team 07", ClipboardCheck],
    ["sortie", "START SORTIE", "Depart with check-in plan", RouteIcon],
    ["incident", "REPORT INCIDENT", "P0 priority delivery", AlertOctagon, "edge-incident"],
  ];
  return (
    <>
      <p className="mb-4 font-mono text-[12px] tracking-[0.14em] text-onnavy-muted">
        WORK · OPERATOR D. RAO
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([v, l, s, Icon, guide]) => (
          <button
            key={v}
            data-guide={guide}
            onClick={() => go(v)}
            className={cn(
              "group flex min-h-[150px] flex-col justify-between rounded-[12px] border p-5 text-left transition-colors",
              v === "incident"
                ? "border-critical/50 bg-critical/[0.08] hover:bg-critical/[0.14]"
                : "border-onnavy/12 bg-onnavy/[0.035] hover:bg-onnavy/[0.07]",
            )}
          >
            <Icon
              className={cn("size-8", v === "incident" ? "text-critical" : "text-cyan")}
              strokeWidth={1.6}
            />
            <span>
              <span className="block font-mono text-[17px] font-semibold tracking-[0.1em]">
                {l}
              </span>
              <span className="text-[14px] text-onnavy-muted">{s}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function Scan({ back }: { back: () => void }) {
  const { state, actions } = useDemo();
  const [stage, setStage] = useState<"idle" | "scanning" | "loaded" | "done">("idle");
  const [opId, setOpId] = useState<string>();
  const c = cargoService.byId(state, "C-128")!;
  return (
    <>
      <Title back={back} sub="Point camera at cargo label">
        SCAN CARGO
      </Title>
      {stage !== "done" && (
        <Card className="mb-4">
          <div className="relative mx-auto grid aspect-[4/3] max-w-md place-items-center overflow-hidden rounded-[10px] border-2 border-dashed border-onnavy/25 bg-abyss">
            <QrCode className="size-20 text-onnavy/20" />
            {stage === "scanning" && (
              <motion.span
                className="absolute inset-x-6 h-0.5 bg-cyan"
                initial={{ top: "10%" }}
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
            )}
            {stage === "loaded" && (
              <span className="absolute inset-4 rounded-[8px] border-2 border-teal" />
            )}
            <span className="absolute bottom-3 font-mono text-[11px] tracking-[0.12em] text-onnavy-muted">
              BROWSER DEMO · CAMERA SIMULATED
            </span>
          </div>
          {stage === "idle" && (
            <Big
              className="mt-5 w-full"
              onClick={() => {
                setStage("scanning");
                setTimeout(() => setStage("loaded"), 900);
              }}
            >
              <ScanLine className="size-5" /> Simulate QR Scan
            </Big>
          )}
        </Card>
      )}
      {stage === "loaded" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <p className="font-mono text-[28px] font-semibold tracking-[0.06em]">{c.id}</p>
            <p className="mb-3 text-[15px] text-onnavy-muted">{c.item}</p>
            <Row k="CONTAINER" v={c.container} />
            <Row k="MANIFEST" v={c.manifest} />
            <Row k="HAZARD" v={c.hazard ?? "None"} />
            <Row k="LAST CUSTODY" v={c.custody} />
            <Big
              className="mt-5 w-full"
              onClick={() => {
                setOpId(actions.scanCargo("C-128"));
                setStage("done");
              }}
            >
              Confirm Scan
            </Big>
          </Card>
        </motion.div>
      )}
      {stage === "done" && (
        <>
          <LocalResult
            title="✓ Cargo scanned"
            opId={opId}
            extra={<Row k="CUSTODY" v="Bharati Cargo Bay" />}
          />
          <Big variant="ghost" className="mt-4 w-full" onClick={() => setStage("idle")}>
            Scan another
          </Big>
        </>
      )}
    </>
  );
}

type RState = "RECEIVED" | "DAMAGED" | "MISSING";
function Receive({ back }: { back: () => void }) {
  const { state, actions } = useDemo();
  const m = state.manifests.find((x) => x.id === "M-018")!;
  const items = cargoService.manifestItems(state, "M-018");
  const [marks, setMarks] = useState<Record<string, RState>>({});
  const [done, setDone] = useState(false);
  const damaged = Object.entries(marks)
    .filter(([, v]) => v === "DAMAGED")
    .map(([k]) => k);
  const missing = Object.entries(marks)
    .filter(([, v]) => v === "MISSING")
    .map(([k]) => k);
  const received = items.length - missing.length;

  if (done || m.status === "RECEIVED") {
    return (
      <>
        <Title back={back} sub="Manifest M-018">
          RECEIVE CARGO
        </Title>
        <LocalResult
          title="Partial receipt recorded"
          extra={
            <>
              <Row
                k="RECEIVED"
                v={`${items.filter((c) => c.status !== "MISSING").length} / ${items.length}`}
              />
              <Row k="CARGO EXCEPTION" v={<span className="text-critical">CREATED</span>} />
              <Row k="RECEIPT EVENT" v="CREATED" />
              <Row k="AUDIT EVENT" v="CREATED" />
              <Row k="SYNC OPERATIONS" v={`${syncService.edgePending(state).length} queued`} />
            </>
          }
        />
        {state.connection === "OFFLINE" && (
          <Big className="mt-4 w-full" onClick={() => void actions.reconnect()}>
            Reconnect & synchronize
          </Big>
        )}
      </>
    );
  }

  return (
    <>
      <Title back={back} sub={`${m.container} · ${m.vessel}`}>
        RECEIVE · {m.id}
      </Title>
      <Card className="mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            ["EXPECTED", items.length],
            ["RECEIVING", received],
            ["EXCEPTIONS", damaged.length + missing.length],
          ].map(([k, v]) => (
            <div key={k as string}>
              <p className="font-mono text-[11px] tracking-[0.12em] text-onnavy-muted">{k}</p>
              <p
                className={cn(
                  "mt-1 text-[34px] font-semibold tabular-nums",
                  k === "EXCEPTIONS" && (v as number) > 0 && "text-orange",
                )}
              >
                {v}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[13px] text-onnavy-muted">
          Tip: mark C-128 damaged and C-131 missing.
        </p>
      </Card>
      <ul className="space-y-2">
        {items.map((c) => {
          const v = marks[c.id] ?? "RECEIVED";
          return (
            <li
              key={c.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-[10px] border p-3",
                v === "RECEIVED"
                  ? "border-onnavy/10"
                  : v === "DAMAGED"
                    ? "border-critical/50 bg-critical/[0.06]"
                    : "border-orange/50 bg-orange/[0.06]",
              )}
            >
              <div className="min-w-[160px] flex-1">
                <p className="font-mono text-[15px] font-semibold">{c.id}</p>
                <p className="truncate text-[13px] text-onnavy-muted">{c.item}</p>
              </div>
              <div role="radiogroup" aria-label={`${c.id} receipt state`} className="flex gap-1.5">
                {(["RECEIVED", "DAMAGED", "MISSING"] as RState[]).map((s) => (
                  <button
                    key={s}
                    role="radio"
                    aria-checked={v === s}
                    onClick={() => setMarks((p) => ({ ...p, [c.id]: s }))}
                    className={cn(
                      "h-12 rounded-[8px] border px-3 font-mono text-[11.5px] tracking-[0.08em]",
                      v === s
                        ? s === "RECEIVED"
                          ? "border-teal bg-teal text-abyss"
                          : s === "DAMAGED"
                            ? "border-critical bg-critical text-destructive-foreground"
                            : "border-orange bg-orange text-abyss"
                        : "border-onnavy/20 text-onnavy-muted",
                    )}
                  >
                    {s === "RECEIVED" ? "✓ OK" : s === "DAMAGED" ? "! DAMAGED" : "? MISSING"}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-[76px] mt-5">
        <Big
          className="w-full"
          onClick={() => {
            actions.receiveManifest("M-018", damaged[0] ?? "", missing[0] ?? "");
            setDone(true);
          }}
        >
          Confirm receipt · {received} / {items.length}
        </Big>
      </div>
    </>
  );
}

function Count({ back }: { back: () => void }) {
  const { state, actions } = useDemo();
  const opts = state.inventory.slice(0, 13);
  const [id, setId] = useState(opts[9].id);
  const it = state.inventory.find((i) => i.id === id)!;
  const [qty, setQty] = useState<number | "">("");
  const [saved, setSaved] = useState(false);
  if (saved)
    return (
      <>
        <Title back={back}>INVENTORY COUNT</Title>
        <LocalResult title="Count recorded" extra={<Row k="ITEM" v={it.name} />} />
        <Big
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => {
            setSaved(false);
            setQty("");
          }}
        >
          Record another
        </Big>
      </>
    );
  return (
    <>
      <Title back={back} sub="Bharati Main Store">
        INVENTORY COUNT
      </Title>
      <Card className="space-y-5">
        <label className="block">
          <span className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">ITEM</span>
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-2 h-14 w-full rounded-[8px] border border-onnavy/20 bg-abyss px-3 text-[16px]"
          >
            {opts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[14px] text-onnavy-muted">
          System quantity: {it.available} {it.unit}
        </p>
        <label className="block">
          <span className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">
            COUNTED QUANTITY ({it.unit})
          </span>
          <input
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-2 h-14 w-full rounded-[8px] border border-onnavy/20 bg-abyss px-3 text-[22px] tabular-nums"
          />
        </label>
        <Big
          className="w-full"
          disabled={qty === ""}
          onClick={() => {
            actions.recordCount({
              itemId: id,
              qty: Number(qty),
              reason: "Edge physical count",
              evidence: "",
            });
            setSaved(true);
          }}
        >
          {state.connection === "CONNECTED" ? "Save and synchronize" : "Save locally"}
        </Big>
      </Card>
    </>
  );
}

function Muster({ back }: { back: () => void }) {
  const { state, actions } = useDemo();
  const team = personnelService.team(state, "Field Team 07");
  const ok = team.filter((p) => p.accounted).length;
  return (
    <>
      <Title back={back} sub="Rapid accountability">
        MUSTER · FIELD TEAM 07
      </Title>
      <Card className="mb-4 grid grid-cols-3 text-center">
        {[
          ["EXPECTED", team.length],
          ["ACCOUNTED", ok],
          ["MISSING", team.length - ok],
        ].map(([k, v]) => (
          <div key={k as string}>
            <p className="font-mono text-[11px] tracking-[0.12em] text-onnavy-muted">{k}</p>
            <p
              className={cn(
                "text-[34px] font-semibold",
                k === "MISSING" && (v as number) > 0 && "text-critical",
              )}
            >
              {String(v).padStart(2, "0")}
            </p>
          </div>
        ))}
      </Card>
      <ul className="space-y-2">
        {team.map((p) => (
          <li
            key={p.id}
            className={cn(
              "flex min-h-16 items-center gap-3 rounded-[10px] border px-4",
              p.accounted ? "border-onnavy/10" : "border-critical/50 bg-critical/[0.06]",
            )}
          >
            <span className={cn("text-[18px]", p.accounted ? "text-teal" : "text-critical")}>
              {p.accounted ? "✓" : "⚠"}
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-medium">{p.name}</span>
              <span className="text-[12.5px] text-onnavy-muted">
                Last confirmed {p.lastConfirmed}
              </span>
            </span>
            {!p.accounted && (
              <Big onClick={() => actions.musterMark(p.id)} className="min-h-12 px-4 text-[13px]">
                MARK ACCOUNTED
              </Big>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function StartSortie({ back }: { back: () => void }) {
  const { actions } = useDemo();
  const [id, setId] = useState<string>();
  if (id)
    return (
      <>
        <Title back={back}>START SORTIE</Title>
        <LocalResult title={`Sortie ${id} active`} extra={<Row k="NEXT CHECK-IN" v="+60 min" />} />
      </>
    );
  return (
    <>
      <Title back={back} sub="Field Team 08 · Bharati → Field Camp 07">
        START SORTIE
      </Title>
      <Card>
        <Row k="TEAM" v="Field Team 08" />
        <Row k="ROUTE" v="Bharati → Field Camp 07" />
        <Row k="PERSONNEL" v="5" />
        <Row k="CHECK-IN INTERVAL" v="60 min" />
        <Big
          className="mt-5 w-full"
          onClick={() =>
            setId(
              actions.createSortie({
                team: "Field Team 08",
                route: "Bharati → Field Camp 07",
                departure: "15:00",
                eta: "19:30",
                members: 5,
                lead: "Sana Pillai",
              }),
            )
          }
        >
          Depart now
        </Big>
      </Card>
    </>
  );
}

function ReportIncident({ back, goSync }: { back: () => void; goSync: () => void }) {
  const { state, actions } = useDemo();
  const [type, setType] = useState("Distress");
  const [loc, setLoc] = useState("Field Camp 08");
  const [n, setN] = useState(4);
  const [desc, setDesc] = useState("Field team missed scheduled check-in.");
  const [id, setId] = useState<string>();
  const inc = id ? state.incidents.find((i) => i.id === id) : null;

  if (inc) {
    const local = inc.status === "LOCAL";
    return (
      <>
        <Title back={back}>REPORT INCIDENT</Title>
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className={local ? "border-critical/60 bg-critical/[0.08]" : "border-teal/40"}>
            <p className="font-mono text-[12px] tracking-[0.14em] text-critical">P0 · {inc.id}</p>
            <p className="mt-2 text-[22px] font-semibold">
              {local ? "P0 INCIDENT CREATED LOCALLY" : "P0 INCIDENT DELIVERED"}
            </p>
            <div className="mt-4">
              <Row
                k="CENTRAL DELIVERY"
                v={
                  <span className={local ? "text-orange" : "text-teal"}>
                    {local
                      ? "○ PENDING"
                      : inc.status === "ACK REQUIRED"
                        ? "✓ DELIVERED · AWAITING ACK"
                        : `✓ ${inc.status}`}
                  </span>
                }
              />
              <Row
                k="SYNC PRIORITY"
                v={<span className="text-critical">P0 · FIRST IN QUEUE</span>}
              />
              <Row k="LOCATION" v={inc.location} />
            </div>
          </Card>
        </motion.div>
        {local && state.connection === "OFFLINE" && (
          <Big
            className="mt-4 w-full"
            onClick={() => {
              void actions.reconnect();
              goSync();
            }}
          >
            Reconnect (deliver P0 first)
          </Big>
        )}
        {!local && (
          <Link
            to="/incidents/$id"
            params={{ id: inc.id }}
            className="mt-4 flex min-h-14 items-center justify-center rounded-[10px] border border-onnavy/25 text-[15px] font-semibold"
          >
            Open Incident Command
          </Link>
        )}
      </>
    );
  }
  return (
    <>
      <Title
        back={back}
        sub={
          state.connection === "CONNECTED"
            ? "Delivered immediately"
            : "Will be stored locally and sent first on reconnect"
        }
      >
        REPORT INCIDENT
      </Title>
      <Card className="space-y-5">
        <div>
          <p className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">INCIDENT TYPE</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Distress", "Medical", "Fire", "Equipment"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={cn(
                  "h-14 rounded-[8px] border text-[15px] font-medium",
                  type === t
                    ? "border-critical bg-critical text-destructive-foreground"
                    : "border-onnavy/20",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">LOCATION</span>
          <select
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="mt-2 h-14 w-full rounded-[8px] border border-onnavy/20 bg-abyss px-3 text-[16px]"
          >
            {["Field Camp 08", "Field Camp 07", "Bharati Station", "Maitri Station"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <div>
          <p className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">PERSONNEL</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              aria-label="Fewer"
              onClick={() => setN((x) => Math.max(0, x - 1))}
              className="size-14 rounded-[8px] border border-onnavy/20 text-[22px]"
            >
              −
            </button>
            <span className="w-12 text-center text-[26px] font-semibold tabular-nums">{n}</span>
            <button
              aria-label="More"
              onClick={() => setN((x) => x + 1)}
              className="size-14 rounded-[8px] border border-onnavy/20 text-[22px]"
            >
              +
            </button>
          </div>
        </div>
        <label className="block">
          <span className="font-mono text-[12px] tracking-[0.1em] text-onnavy-muted">
            DESCRIPTION
          </span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-[8px] border border-onnavy/20 bg-abyss p-3 text-[16px]"
          />
        </label>
        <Big
          variant="danger"
          className="w-full"
          onClick={() =>
            setId(
              actions.createIncident({
                type: type === "Distress" ? "Field Distress" : type,
                location: loc,
                personnel: n,
                description: desc,
                device: "Bharati Edge 01",
              }),
            )
          }
        >
          <AlertOctagon className="size-5" /> Report Incident
        </Big>
      </Card>
    </>
  );
}

function SyncView() {
  const { state, actions } = useDemo();
  const q = state.syncQueue.filter((o) => o.source === "Bharati Edge 01").slice(0, 12);
  const order = { P0: 0, P1: 1, P2: 2 };
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-mono text-[20px] font-semibold tracking-[0.1em]">SYNC QUEUE</h1>
        {state.connection === "OFFLINE" && (
          <Big onClick={() => void actions.reconnect()}>Reconnect</Big>
        )}
        {state.connection === "CONNECTED" && (
          <Big variant="ghost" onClick={actions.disconnect}>
            Disconnect
          </Big>
        )}
      </div>
      <div className="mb-5">
        <SyncProgress dark />
      </div>
      {state.connection === "OFFLINE" && !state.syncPhase && (
        <Card className="mb-5 border-orange/30">
          <p className="font-semibold">Unable to synchronize</p>
          <p className="mt-1 text-[14px] text-onnavy-muted">
            Reason: connection unavailable. Operations remain safely stored locally.
          </p>
          <Big variant="ghost" className="mt-4" onClick={() => void actions.reconnect()}>
            Retry
          </Big>
        </Card>
      )}
      {q.length === 0 ? (
        <Card>
          <p className="text-onnavy-muted">
            No operations have been recorded on this device yet. Scan, receive or report to create
            one.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {[...q]
              .sort((a, b) => order[a.priority] - order[b.priority])
              .map((o) => (
                <motion.li
                  layout
                  key={o.id}
                  className="flex flex-wrap items-center gap-3 rounded-[10px] border border-onnavy/10 px-4 py-3"
                >
                  <span
                    className={cn(
                      "rounded-[4px] px-2 py-1 font-mono text-[11px]",
                      o.priority === "P0"
                        ? "bg-critical text-destructive-foreground"
                        : "bg-onnavy/10",
                    )}
                  >
                    {o.priority}
                  </span>
                  <span className="min-w-[160px] flex-1">
                    <span className="block text-[14.5px] font-medium">{o.label}</span>
                    <span className="font-mono text-[12px] text-onnavy-muted">
                      {o.id} · {o.created}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[12px] tracking-[0.08em]",
                      o.status === "LOCAL"
                        ? "text-orange"
                        : o.status === "TRANSMITTING"
                          ? "text-cyan"
                          : "text-teal",
                    )}
                  >
                    {o.status === "LOCAL"
                      ? "○ LOCAL"
                      : o.status === "TRANSMITTING"
                        ? "↻ SYNCING"
                        : o.status === "DELIVERED"
                          ? "✓ DELIVERED"
                          : "● SYNCED"}
                  </span>
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}

function Alerts() {
  const { state } = useDemo();
  return (
    <>
      <h1 className="mb-5 font-mono text-[20px] font-semibold tracking-[0.1em]">ALERTS</h1>
      <ul className="space-y-2">
        {state.notifications
          .filter((n) => !n.resolved)
          .slice(0, 10)
          .map((n) => (
            <li key={n.id}>
              <Link
                to={n.href}
                className="flex min-h-16 items-center gap-3 rounded-[10px] border border-onnavy/10 px-4 hover:bg-onnavy/5"
              >
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    n.level === "CRITICAL"
                      ? "text-critical"
                      : n.level === "ATTENTION"
                        ? "text-orange"
                        : "text-cyan",
                  )}
                >
                  {n.level}
                </span>
                <span className="flex-1 text-[15px]">{n.text}</span>
                <span className="font-mono text-[12px] text-onnavy-muted">{n.ts}</span>
              </Link>
            </li>
          ))}
      </ul>
    </>
  );
}

function Me() {
  const ui = useShellUI();
  return (
    <>
      <h1 className="mb-5 font-mono text-[20px] font-semibold tracking-[0.1em]">OPERATOR</h1>
      <Card>
        <Row k="OPERATOR" v="D. Rao · Cargo Handler" />
        <Row k="DEVICE" v="Bharati Edge 01 · rugged tablet" />
        <Row k="LOCAL STORE" v="Encrypted · browser storage" />
        <Row k="ENVIRONMENT" v={<span className="text-orange">SIMULATION · synthetic data</span>} />
      </Card>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Link
          to="/dashboard"
          className="flex min-h-14 items-center justify-center rounded-[10px] bg-onnavy text-[15px] font-semibold text-abyss"
        >
          Exit to central
        </Link>
        <Big variant="ghost" onClick={ui.openGuide}>
          Demo guide
        </Big>
        <Big variant="ghost" onClick={ui.openReset}>
          Reset demo
        </Big>
      </div>
    </>
  );
}
