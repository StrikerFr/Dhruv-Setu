import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Reveal --------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -8% 0px" });
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 18 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* ---------------------------------- Button --------------------------------- */

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "onDark" | "ghostOnDark";
  className?: string;
  arrow?: boolean;
  onClick?: () => void;
};

const buttonBase =
  "group inline-flex items-center gap-2.5 rounded-sm px-5 py-3 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-300";

const variants: Record<string, string> = {
  primary: "bg-navy text-onnavy hover:bg-ink",
  ghost: "border border-border text-ink hover:border-cyan hover:bg-ice/60",
  onDark: "bg-ice text-navy hover:bg-white",
  ghostOnDark: "border border-onnavy/25 text-onnavy hover:border-cyan hover:bg-onnavy/5",
};

export function ActionButton({
  children,
  href = "#",
  variant = "primary",
  className,
  arrow = true,
  onClick,
}: ButtonProps) {
  return (
    <a href={href} onClick={onClick} className={cn(buttonBase, variants[variant], className)}>
      {children}
      {arrow && (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      )}
    </a>
  );
}

/* -------------------------------- StatusBadge ------------------------------- */

export type StatusTone =
  "connected" | "syncing" | "offline" | "pending" | "warning" | "critical" | "neutral";

const toneStyles: Record<StatusTone, { dot: string; text: string; glyph: string }> = {
  connected: { dot: "bg-teal", text: "text-teal", glyph: "●" },
  syncing: { dot: "bg-cyan", text: "text-cyan", glyph: "◐" },
  offline: { dot: "bg-muted-foreground", text: "text-muted-foreground", glyph: "○" },
  pending: { dot: "bg-muted-foreground", text: "text-muted-foreground", glyph: "◔" },
  warning: { dot: "bg-orange", text: "text-orange", glyph: "▲" },
  critical: { dot: "bg-critical", text: "text-critical", glyph: "■" },
  neutral: { dot: "bg-hairline", text: "text-muted-foreground", glyph: "—" },
};

export function StatusBadge({
  tone,
  label,
  className,
  dense = false,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
  dense?: boolean;
}) {
  const s = toneStyles[tone];
  return (
    <span className={cn("inline-flex items-center gap-2 mono-xs uppercase", s.text, className)}>
      {dense ? (
        <span aria-hidden className="relative flex size-1.5">
          {tone === "connected" && (
            <span className={cn("absolute inset-0 rounded-full node-pulse", s.dot)} />
          )}
          <span className={cn("relative size-1.5 rounded-full", s.dot)} />
        </span>
      ) : (
        <span aria-hidden className="text-[0.7rem] leading-none">
          {s.glyph}
        </span>
      )}
      {label}
    </span>
  );
}

/* ------------------------------- SectionHeader ------------------------------ */

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  onDark = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal>
          <p className={cn("eyebrow", onDark ? "text-cyan" : "text-teal")}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className={cn("display-lg mt-5 text-balance", onDark ? "text-onnavy" : "text-ink")}>
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              "mt-5 max-w-2xl text-[0.98rem] leading-relaxed",
              align === "center" && "mx-auto",
              onDark ? "text-onnavy-muted" : "text-muted-foreground",
            )}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* --------------------------------- Section --------------------------------- */

export function Section({
  id,
  children,
  className,
  dark = false,
  bordered = true,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 px-6 py-24 md:px-10 md:py-32",
        bordered && !dark && "border-t border-border",
        dark && "bg-abyss",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1180px]">{children}</div>
    </section>
  );
}

/* ------------------------------ Operational card ---------------------------- */

export function OpsCard({
  children,
  className,
  onDark = false,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border transition-colors duration-300",
        onDark ? "border-onnavy/12 bg-onnavy/[0.03]" : "border-border bg-card",
        interactive && (onDark ? "hover:border-cyan/50" : "hover:border-cyan/60"),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FieldRow({
  label,
  value,
  onDark = false,
}: {
  label: string;
  value: ReactNode;
  onDark?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-dashed border-border/70 py-2 last:border-0">
      <span
        className={cn("mono-xs uppercase", onDark ? "text-onnavy-muted" : "text-muted-foreground")}
      >
        {label}
      </span>
      <span className={cn("mono-xs text-right", onDark ? "text-onnavy" : "text-ink")}>{value}</span>
    </div>
  );
}
