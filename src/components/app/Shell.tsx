import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  Menu,
  MoreHorizontal,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDemo } from "@/demo/engine";
import { notificationService, syncService } from "@/demo/services";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV, MOBILE_TABS, NAV, type NavItem } from "./nav";
import { useShellUI } from "./overlays";
import { SyncProgress } from "./SyncProgress";
import { PageSkeleton } from "./ui";

function isActive(pathname: string, to: string) {
  if (to === "/incidents") return pathname === "/incidents";
  if (to === "/expeditions")
    return (
      pathname === "/expeditions" ||
      (pathname.startsWith("/expeditions/") && !pathname.endsWith("/readiness"))
    );
  return pathname === to || pathname.startsWith(to + "/");
}

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [open, close]);
  return ref;
}

/* ----------------------------------------------------------------- sidebar */

function SideLink({
  item,
  collapsed,
  pathname,
  badge,
  onNav,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  badge?: number;
  onNav?: () => void;
}) {
  const active = isActive(pathname, item.to);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNav}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-[6px] text-[13.5px] transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-ice font-medium text-navy"
          : "text-muted-foreground hover:bg-surface hover:text-ink",
      )}
    >
      {active && <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-teal" />}
      <Icon
        aria-hidden
        className={cn("size-[17px] shrink-0", active ? "text-teal" : "")}
        strokeWidth={1.75}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && badge ? (
        <span className="ml-auto rounded-[4px] bg-critical/10 px-1.5 font-mono text-[11px] text-critical">
          {badge}
        </span>
      ) : null}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-[5px] bg-ink px-2 py-1 text-[12px] text-primary-foreground group-hover:block group-focus-visible:block">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  mobile,
  onNav,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  onNav?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useDemo();
  const [closed, setClosed] = useState<Record<string, boolean>>({ Administration: true });
  const unread = notificationService.unread(state);
  const conflicts = state.conflicts.filter((c) => c.status === "REVIEW REQUIRED").length;
  const badgeFor = (to: string) =>
    to === "/notifications" ? unread : to === "/conflicts" ? conflicts : undefined;

  return (
    <nav
      aria-label="Primary"
      className={cn("flex h-full flex-col bg-card", !mobile && "border-r border-hairline")}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-hairline",
          collapsed ? "justify-center" : "justify-between px-4",
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNav}
          className="flex items-center gap-2.5"
          aria-label="DhruvSetu Command Center"
        >
          <Mark />
          {!collapsed && (
            <span className="text-[14px] font-semibold tracking-[0.14em] text-ink">DHRUVSETU</span>
          )}
        </Link>
        {mobile && (
          <button
            onClick={onNav}
            aria-label="Close navigation"
            className="grid size-10 place-items-center rounded-[6px] hover:bg-surface"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV.map((g) => {
          const isClosed =
            !collapsed && closed[g.label] && !g.items.some((i) => isActive(pathname, i.to));
          return (
            <div key={g.label} className="mb-3">
              {!collapsed ? (
                <button
                  onClick={() => setClosed((c) => ({ ...c, [g.label]: !isClosed }))}
                  aria-expanded={!isClosed}
                  className="flex h-7 w-full items-center justify-between px-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/80 hover:text-ink"
                >
                  {g.label}
                  <ChevronDown
                    aria-hidden
                    className={cn("size-3 transition-transform", isClosed && "-rotate-90")}
                  />
                </button>
              ) : (
                <div className="mx-auto my-2 h-px w-6 bg-hairline" />
              )}
              {!isClosed && (
                <div className="space-y-0.5">
                  {g.items.map((i) => (
                    <SideLink
                      key={i.to}
                      item={i}
                      collapsed={collapsed}
                      pathname={pathname}
                      badge={badgeFor(i.to)}
                      onNav={onNav}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-0.5 border-t border-hairline px-2.5 py-3">
        {BOTTOM_NAV.map((i) => (
          <SideLink key={i.to} item={i} collapsed={collapsed} pathname={pathname} onNav={onNav} />
        ))}
        <Link
          to="/personnel/$id"
          params={{ id: "P-001" }}
          onClick={onNav}
          className={cn(
            "mt-2 flex items-center gap-3 rounded-[6px] py-2 hover:bg-surface",
            collapsed ? "justify-center" : "px-2",
          )}
          aria-label="Profile: Aryan Garg"
        >
          <Avatar />
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-medium text-ink">Aryan Garg</span>
              <span className="block truncate text-[12px] text-muted-foreground">
                Operations Controller
              </span>
            </span>
          )}
        </Link>
        {onToggle && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mt-1 flex h-9 w-full items-center gap-3 rounded-[6px] text-[13px] text-muted-foreground hover:bg-surface",
              collapsed ? "justify-center" : "px-3",
            )}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </nav>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="27" rx="7" className="fill-navy" />
      <path
        d="M7 19 L14 8 L21 19"
        fill="none"
        strokeWidth="1.8"
        className="stroke-onnavy"
        strokeLinejoin="round"
      />
      <path d="M5 19 H23" strokeWidth="1.8" className="stroke-cyan" />
      <circle cx="14" cy="8" r="1.8" className="fill-cyan" />
    </svg>
  );
}

function Avatar() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-semibold text-primary-foreground">
      AG
    </span>
  );
}

/* ------------------------------------------------------------------ header */

function Dropdown({
  label,
  children,
  align = "left",
  buttonClass,
  ariaLabel,
}: {
  label: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  buttonClass?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={ariaLabel}
        className={buttonClass}
      >
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute top-full z-50 mt-2 min-w-[240px] rounded-[10px] border border-hairline bg-card p-1.5 shadow-[0_14px_40px_-18px_color-mix(in_oklab,var(--color-ink)_45%,transparent)]",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const pill =
  "inline-flex h-9 items-center gap-1.5 rounded-[7px] px-2.5 text-[13.5px] font-medium text-ink hover:bg-surface";

function Header({ onMenu }: { onMenu: () => void }) {
  const { state, actions } = useDemo();
  const ui = useShellUI();
  const navigate = useNavigate();
  const [station, setStation] = useState("BHARATI");
  const unread = notificationService.unread(state);
  const conn = state.connection;
  const open = notificationService.open(state).slice(0, 7);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-1 border-b border-hairline bg-card/95 px-3 backdrop-blur-sm md:gap-2 md:px-5">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="grid size-10 place-items-center rounded-[7px] hover:bg-surface lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <Link
        to="/dashboard"
        className="mr-2 flex items-center gap-2 lg:hidden"
        aria-label="DhruvSetu"
      >
        <Mark className="size-6" />
      </Link>

      <Dropdown
        buttonClass={cn(pill, "font-semibold")}
        label={
          <>
            46th ISEA <ChevronDown className="size-3.5 text-muted-foreground" />
          </>
        }
        ariaLabel="Select expedition"
      >
        {(close) =>
          state.expeditions.map((e) => (
            <Link
              key={e.id}
              to="/expeditions/$id"
              params={{ id: e.slug }}
              onClick={close}
              className="flex items-center justify-between rounded-[6px] px-3 py-2.5 text-[14px] hover:bg-surface"
            >
              <span>
                <span className="block font-medium text-ink">{e.name}</span>
                <span className="text-[12px] text-muted-foreground">{e.season}</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{e.status}</span>
            </Link>
          ))
        }
      </Dropdown>
      <Dropdown
        buttonClass={cn(pill, "hidden sm:inline-flex")}
        label={
          <>
            {station} <ChevronDown className="size-3.5 text-muted-foreground" />
          </>
        }
        ariaLabel="Select station"
      >
        {(close) =>
          ["BHARATI", "MAITRI"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStation(s);
                close();
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-[6px] px-3 py-2.5 text-left text-[14px] hover:bg-surface",
                s === station && "bg-ice",
              )}
            >
              {s}
              <span className="font-mono text-[11px] text-muted-foreground">
                {s === "BHARATI" ? "Primary" : "Secondary"}
              </span>
            </button>
          ))
        }
      </Dropdown>

      <Link
        to="/sync"
        className={cn(
          "ml-1 hidden h-8 items-center gap-2 rounded-[6px] border px-2.5 font-mono text-[11px] tracking-[0.1em] md:inline-flex",
          conn === "CONNECTED"
            ? "border-teal/30 text-teal"
            : conn === "OFFLINE"
              ? "border-orange/40 bg-orange/5 text-orange"
              : "border-cyan/40 text-cyan",
        )}
      >
        <span className="relative flex size-2">
          {conn === "CONNECTED" && (
            <span className="absolute inset-0 rounded-full bg-teal node-pulse" />
          )}
          <span
            className={cn(
              "relative size-2 rounded-full",
              conn === "CONNECTED"
                ? "bg-teal"
                : conn === "OFFLINE"
                  ? "border border-orange"
                  : "bg-cyan",
            )}
          />
        </span>
        {conn === "RECONNECTING" ? "SYNCING" : conn}
      </Link>
      <button
        onClick={ui.openSim}
        className="ml-1 inline-flex h-8 items-center gap-2 rounded-[6px] border border-dashed border-orange/50 px-2.5 text-left"
        aria-label="Simulation environment · synthetic operational data"
      >
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-orange">SIMULATION</span>
        <span className="hidden text-[11.5px] text-muted-foreground xl:inline">
          Synthetic operational data
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Dropdown
          align="right"
          ariaLabel={`Notifications, ${unread} unread`}
          buttonClass="relative grid size-10 place-items-center rounded-[7px] hover:bg-surface"
          label={
            <>
              <Bell className="size-[19px] text-navy" strokeWidth={1.75} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-critical px-1 font-mono text-[10px] text-destructive-foreground">
                  {unread}
                </span>
              )}
            </>
          }
        >
          {(close) => (
            <div className="w-[min(88vw,380px)]">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="eyebrow text-muted-foreground">Notifications</p>
                <button
                  onClick={actions.markAllRead}
                  className="text-[12.5px] text-teal hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <ul>
                {open.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        actions.markRead(n.id);
                        close();
                        navigate({ to: n.href });
                      }}
                      className="flex w-full items-start gap-3 rounded-[6px] px-3 py-2.5 text-left hover:bg-surface"
                    >
                      <LevelDot level={n.level} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-[13.5px] leading-snug",
                            n.read ? "text-muted-foreground" : "font-medium text-ink",
                          )}
                        >
                          {n.text}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {n.level} · {n.ts}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                to="/notifications"
                onClick={close}
                className="mt-1 block rounded-[6px] px-3 py-2 text-center text-[13px] font-medium text-navy hover:bg-surface"
              >
                View all notifications
              </Link>
            </div>
          )}
        </Dropdown>
        <Link
          to="/$module"
          params={{ module: "help" }}
          aria-label="Help"
          className="hidden size-10 place-items-center rounded-[7px] hover:bg-surface sm:grid"
        >
          <HelpCircle className="size-[19px] text-navy" strokeWidth={1.75} />
        </Link>
        <Dropdown
          align="right"
          ariaLabel="User menu"
          buttonClass="flex h-10 items-center gap-2.5 rounded-[7px] pl-1 pr-2 hover:bg-surface"
          label={
            <>
              <Avatar />
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-[13px] font-medium text-ink">Aryan</span>
                <span className="block text-[11.5px] text-muted-foreground">
                  Operations Controller
                </span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground md:block" />
            </>
          }
        >
          {(close) => (
            <div className="w-64">
              <div className="border-b border-hairline px-3 pb-3 pt-2">
                <p className="text-[14px] font-medium text-ink">Aryan Garg</p>
                <p className="text-[12.5px] text-muted-foreground">
                  Operations Controller · 46th ISEA · Bharati
                </p>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Medical records: restricted
                </p>
              </div>
              <Link
                to="/personnel/$id"
                params={{ id: "P-001" }}
                onClick={close}
                className="mt-1 block rounded-[6px] px-3 py-2 text-[13.5px] hover:bg-surface"
              >
                Profile & scope
              </Link>
              <button
                onClick={() => {
                  close();
                  ui.openReset();
                }}
                className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13.5px] hover:bg-surface"
              >
                <RotateCcw className="size-3.5" /> Reset demo
              </button>
              <Link
                to="/"
                onClick={close}
                className="block rounded-[6px] px-3 py-2 text-[13.5px] text-muted-foreground hover:bg-surface"
              >
                Exit to public site
              </Link>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

export function LevelDot({ level }: { level: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-critical",
    ATTENTION: "bg-orange",
    UPCOMING: "border border-navy",
    SYNC: "bg-teal",
  };
  return <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", map[level])} />;
}

/* ----------------------------------------------------------- state bands */

function StateBands() {
  const { state, actions } = useDemo();
  const pending = syncService.edgePending(state).length;
  return (
    <AnimatePresence initial={false}>
      {state.connection === "OFFLINE" && (
        <motion.div
          key="off"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="overflow-hidden border-b border-orange/25 bg-orange/[0.06]"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-8">
            <span className="font-mono text-[11px] tracking-[0.14em] text-orange">
              ○ OFFLINE · {pending} OPERATIONS QUEUED
            </span>
            <span className="text-[13px] text-ink">
              Operations will be stored locally and synchronized when connectivity returns.
            </span>
            <button
              onClick={() => void actions.reconnect()}
              className="ml-auto h-8 rounded-[6px] border border-hairline bg-card px-3 text-[13px] font-medium text-navy hover:bg-surface"
            >
              Reconnect
            </button>
          </div>
        </motion.div>
      )}
      {state.syncPhase && (
        <motion.div
          key="sync"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="overflow-hidden border-b border-hairline bg-surface"
        >
          <div className="px-4 py-3 md:px-8">
            <SyncProgress />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------- shell */

export function AppShell({ children }: { children: ReactNode }) {
  const { hydrated } = useDemo();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block",
          collapsed ? "w-[68px]" : "w-[256px]",
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
            >
              <Sidebar collapsed={false} mobile onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div
        className={cn(
          "transition-[padding] duration-200",
          collapsed ? "lg:pl-[68px]" : "lg:pl-[256px]",
        )}
      >
        <Header onMenu={() => setMobileOpen(true)} />
        <StateBands />
        <main
          id="main"
          className="mx-auto max-w-[1440px] px-4 pb-28 pt-8 md:px-8 lg:pb-16 lg:pt-10"
        >
          {hydrated ? (
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {children}
            </motion.div>
          ) : (
            <PageSkeleton />
          )}
        </main>
      </div>
      <MobileTabs onMore={() => setMobileOpen(true)} pathname={pathname} />
    </div>
  );
}

function MobileTabs({ onMore, pathname }: { onMore: () => void; pathname: string }) {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-hairline bg-card lg:hidden"
    >
      {MOBILE_TABS.map((t) => {
        const a = isActive(pathname, t.to);
        return (
          <Link
            key={t.to}
            to={t.to}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 text-[11px]",
              a ? "text-teal" : "text-muted-foreground",
            )}
          >
            <t.icon className="size-5" strokeWidth={1.75} />
            {t.label}
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
      >
        <MoreHorizontal className="size-5" />
        More
      </button>
    </nav>
  );
}
