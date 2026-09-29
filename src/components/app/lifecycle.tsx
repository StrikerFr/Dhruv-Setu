import { cn } from "@/lib/utils";

const STAGES = [
  ["Mission Scope", "Complete", "30 Sep"],
  ["Personnel", "Complete", "05 Oct"],
  ["Permits", "Attention", "14 Oct"],
  ["Cargo", "Blocked", "18 Oct"],
  ["Transit", "Scheduled", "20 Oct"],
  ["Station Arrival", "Planned", "01 Nov"],
  ["Field Operations", "Planned", "Nov to Feb"],
  ["Closeout", "Not started", "Mar 2027"],
] as const;

export function LifecycleTimeline() {
  return (
    <ol className="grid grid-cols-1 md:grid-cols-8">
      {STAGES.map(([name, st, date], i) => {
        const tone =
          st === "Complete"
            ? "ok"
            : st === "Attention"
              ? "warn"
              : st === "Blocked"
                ? "bad"
                : "todo";
        return (
          <li key={name} className="relative flex gap-4 pb-6 md:block md:pb-0">
            {i < STAGES.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[11px] top-6 h-full w-px md:left-6 md:top-[11px] md:h-px md:w-full",
                  tone === "ok" ? "bg-teal" : "bg-hairline",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-[1] grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                tone === "ok" && "border-teal bg-teal text-primary-foreground",
                tone === "warn" && "border-orange bg-card text-orange",
                tone === "bad" && "border-critical bg-critical text-destructive-foreground",
                tone === "todo" && "border-hairline bg-card text-muted-foreground",
              )}
            >
              {tone === "ok" ? "✓" : tone === "warn" ? "!" : tone === "bad" ? "⛔" : i + 1}
            </span>
            <div className="md:mt-4 md:pr-3">
              <p className="text-[14.5px] font-medium text-ink">{name}</p>
              <p
                className={cn(
                  "text-[13px]",
                  tone === "warn"
                    ? "text-orange"
                    : tone === "bad"
                      ? "text-critical"
                      : "text-muted-foreground",
                )}
              >
                {st}
              </p>
              <p className="font-mono text-[11.5px] text-muted-foreground">{date}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
