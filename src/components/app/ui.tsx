import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { X, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SyncState } from "@/demo/types";

/* ------------------------------------------------------------------ badges */

export type Tone = "neutral" | "teal" | "navy" | "orange" | "red" | "ice" | "cyan";

const toneCls: Record<Tone, string> = {
  neutral: "bg-surface text-muted-foreground border-hairline",
  teal: "bg-teal/10 text-teal border-teal/30",
  cyan: "bg-cyan/10 text-cyan border-cyan/30",
  navy: "bg-navy text-primary-foreground border-navy",
  orange: "bg-orange/10 text-orange border-orange/35",
  red: "bg-critical/10 text-critical border-critical/35",
  ice: "bg-ice text-navy border-hairline",
};

export function Badge({
  tone = "neutral",
  glyph,
  children,
  className,
}: {
  tone?: Tone;
  glyph?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[5px] border px-2 font-mono text-[11px] font-medium uppercase tracking-[0.06em]",
        toneCls[tone],
        className,
      )}
    >
      {glyph != null && (
        <span aria-hidden className="text-[11px] leading-none">
          {glyph}
        </span>
      )}
      {children}
    </span>
  );
}

const statusMap: Record<string, [Tone, string]> = {
  READY: ["teal", "✓"],
  COMPLETE: ["teal", "✓"],
  RECEIVED: ["teal", "✓"],
  VALID: ["teal", "✓"],
  PASS: ["teal", "✓"],
  AVAILABLE: ["teal", "●"],
  CLEARED: ["teal", "✓"],
  ACTIVE: ["cyan", "●"],
  CONNECTED: ["teal", "●"],
  STATION: ["neutral", "●"],
  FIELD: ["cyan", "◆"],
  TRANSIT: ["neutral", "→"],
  "IN TRANSIT": ["neutral", "→"],
  SEALED: ["neutral", "■"],
  LOCKED: ["navy", "■"],
  DRAFT: ["neutral", "○"],
  PLANNED: ["neutral", "○"],
  PLANNING: ["neutral", "○"],
  CLOSED: ["neutral", "■"],
  ASSIGNED: ["cyan", "●"],
  ACKNOWLEDGED: ["cyan", "✓"],
  RESPONDING: ["cyan", "↻"],
  RESOLVED: ["teal", "✓"],
  RECORDED: ["neutral", "●"],
  OPEN: ["orange", "!"],
  ATTENTION: ["orange", "⚠"],
  "AT RISK": ["orange", "⚠"],
  "EVIDENCE DUE": ["orange", "⚠"],
  DELAYED: ["orange", "⚠"],
  MAINTENANCE: ["orange", "⚙"],
  INSPECTION: ["orange", "⚠"],
  PENDING: ["orange", "○"],
  STALE: ["orange", "⚠"],
  "AMENDMENT PENDING": ["orange", "⚠"],
  "REVIEW REQUIRED": ["orange", "!"],
  "CUSTOMS HOLD": ["orange", "⚠"],
  "NOT STARTED": ["neutral", "○"],
  BLOCKED: ["red", "⛔"],
  DAMAGED: ["red", "!"],
  MISSING: ["red", "?"],
  OVERDUE: ["red", "⚠"],
  UNACCOUNTED: ["red", "?"],
  "ACK REQUIRED": ["red", "!"],
  "OUT OF SERVICE": ["red", "×"],
  RESTRICTED: ["red", "■"],
  CRITICAL: ["red", "▲"],
  HIGH: ["orange", "▲"],
  STANDARD: ["neutral", "—"],
  P0: ["red", "▲"],
  P1: ["orange", "▲"],
  P2: ["neutral", "▲"],
  LOCAL: ["orange", "○"],
  OFFLINE: ["orange", "○"],
  RETIRED: ["neutral", "—"],
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const [tone, glyph] =
    statusMap[status] ??
    (/SEEDS/.test(status)
      ? (["orange", "!"] as [Tone, string])
      : (["neutral", "●"] as [Tone, string]));
  return (
    <Badge tone={tone} glyph={glyph} className={className}>
      {status === "ACK REQUIRED" ? "Ack required" : status}
    </Badge>
  );
}

const syncMap: Record<SyncState, [Tone, string, string]> = {
  SYNCED: ["teal", "●", "Synced"],
  LOCAL: ["orange", "○", "Local"],
  QUEUED: ["neutral", "◌", "Queued"],
  TRANSMITTING: ["cyan", "↻", "Syncing"],
  DELIVERED: ["cyan", "✓", "Delivered"],
  ACKNOWLEDGED: ["teal", "✓✓", "Acknowledged"],
  CONFLICT: ["red", "!", "Conflict"],
  RETRY: ["orange", "↻", "Retry"],
  FAILED: ["red", "×", "Failed"],
};

export function SyncBadge({ state }: { state: SyncState }) {
  const [tone, glyph, label] = syncMap[state];
  return (
    <Badge
      tone={tone}
      glyph={
        state === "TRANSMITTING" ? <span className="inline-block animate-spin">↻</span> : glyph
      }
    >
      {label}
    </Badge>
  );
}

/* ----------------------------------------------------------------- buttons */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "teal";
const btnCls: Record<BtnVariant, string> = {
  primary: "bg-navy text-primary-foreground hover:bg-ink border-navy",
  teal: "bg-teal text-primary-foreground hover:bg-teal/90 border-teal",
  secondary: "bg-card text-navy border-hairline hover:bg-surface",
  ghost: "bg-transparent text-navy border-transparent hover:bg-surface",
  danger: "bg-critical text-destructive-foreground border-critical hover:bg-critical/90",
};
export function btn(variant: BtnVariant = "secondary", size: "sm" | "md" | "lg" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
    size === "sm" && "h-8 px-3 text-[13px]",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-12 px-5 text-[15px]",
    btnCls[variant],
  );
}
export function Btn({
  variant = "secondary",
  size = "md",
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
}) {
  return <button type="button" className={cn(btn(variant, size), className)} {...p} />;
}

/* ------------------------------------------------------------------ layout */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  badges,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  badges?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-3 text-teal">{eyebrow}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-[36px]">
            {title}
          </h1>
          {badges}
        </div>
        {subtitle && <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
  bodyClass,
  id,
  ...rest
}: {
  title?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
  id?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={cn("rounded-[10px] border border-hairline bg-card", className)}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-hairline/70 px-5 py-4 md:px-6">
          <div>
            {eyebrow && <p className="eyebrow mb-1.5 text-muted-foreground">{eyebrow}</p>}
            {title && (
              <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5 md:p-6", bodyClass)}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "red" | "orange" | "teal";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums",
          tone === "red"
            ? "text-critical"
            : tone === "orange"
              ? "text-orange"
              : tone === "teal"
                ? "text-teal"
                : "text-ink",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[13px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function MetricRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
export function MetricCell(p: React.ComponentProps<typeof Metric>) {
  return <Metric {...p} className={cn("bg-card px-5 py-5", p.className)} />;
}

/* ------------------------------------------------------------------- table */

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  primary?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  dense,
  highlight,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  onRowClick?: (r: T) => void;
  empty?: ReactNode;
  dense?: boolean;
  highlight?: (r: T) => boolean;
}) {
  if (!rows.length)
    return <>{empty ?? <EmptyState text="No records currently match these filters." />}</>;
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-hairline">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 pb-3 pt-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground first:pl-0 last:pr-0",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((r) => (
                <motion.tr
                  layout="position"
                  key={rowKey(r)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          (e.preventDefault(), onRowClick(r))
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(
                    "border-b border-hairline/60 last:border-0",
                    onRowClick && "cursor-pointer hover:bg-surface focus-visible:bg-ice",
                    highlight?.(r) && "bg-critical/[0.035]",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "whitespace-nowrap px-4 text-ink first:pl-0 last:pr-0",
                        dense ? "py-2.5" : "py-3.5",
                        c.className,
                      )}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)}>
            <button
              type="button"
              disabled={!onRowClick}
              onClick={() => onRowClick?.(r)}
              className={cn(
                "w-full rounded-[8px] border border-hairline bg-card p-4 text-left disabled:opacity-100",
                highlight?.(r) && "border-critical/40",
              )}
            >
              <div className="mb-2 font-medium text-ink">
                {columns.find((c) => c.primary)?.render(r) ?? columns[0].render(r)}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                {columns
                  .filter((c) => !c.primary && c !== columns[0])
                  .slice(0, 6)
                  .map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {c.header}
                      </dt>
                      <dd className="mt-0.5 truncate text-ink">{c.render(r)}</dd>
                    </div>
                  ))}
              </dl>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[8px] border border-dashed border-hairline px-6 py-12 text-center">
      <p className="max-w-sm text-[15px] text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

export function Toolbar({
  search,
  onSearch,
  placeholder,
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="relative flex-1 lg:max-w-sm">
        <span className="sr-only">{placeholder}</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-[7px] border border-hairline bg-card pl-9 pr-3 text-sm text-ink placeholder:text-muted-foreground focus:border-cyan focus:outline-none"
        />
      </label>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal aria-hidden className="size-4 text-muted-foreground" />
          {children}
        </div>
      )}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-[7px] border border-hairline bg-card pl-3 pr-8 text-[13px] text-ink focus:border-cyan focus:outline-none"
      >
        <option value="">{label}: All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {label}: {o}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground"
      >
        ▼
      </span>
    </label>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-hairline">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={cn(
            "relative h-11 whitespace-nowrap px-3.5 text-sm font-medium transition-colors",
            value === t ? "text-ink" : "text-muted-foreground hover:text-ink",
          )}
        >
          {t}
          {value === t && (
            <motion.span
              layoutId="tab-underline"
              className="absolute inset-x-2 -bottom-px h-0.5 bg-teal"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- overlays */

function useEsc(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEsc(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : "Details"}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-hairline bg-card"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
              <div>
                {eyebrow && <p className="eyebrow mb-1.5 text-teal">{eyebrow}</p>}
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-[7px] text-muted-foreground hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && (
              <div className="flex flex-wrap gap-2 border-t border-hairline px-6 py-4">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEsc(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/30 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "max-h-[90vh] w-full overflow-y-auto rounded-[12px] border border-hairline bg-card",
              wide ? "max-w-2xl" : "max-w-md",
            )}
            initial={{ y: 12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-[7px] text-muted-foreground hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
export const inputCls =
  "h-11 w-full rounded-[7px] border border-hairline bg-card px-3 text-[15px] text-ink focus:border-cyan focus:outline-none";

export function KV({ items, cols = 2 }: { items: [string, ReactNode][]; cols?: 2 | 3 | 4 }) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-5",
        cols === 2
          ? "grid-cols-2"
          : cols === 3
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-4",
      )}
    >
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="eyebrow text-muted-foreground">{k}</dt>
          <dd className="mt-1.5 text-[15px] text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RecordLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="font-mono text-[13px] font-medium text-navy underline-offset-4 hover:text-teal hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[13px] tabular-nums", className)}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[6px] bg-surface", className)} />;
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading operational record" className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}
