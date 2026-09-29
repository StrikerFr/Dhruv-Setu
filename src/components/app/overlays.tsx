import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Compass, X } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useDemo } from "@/demo/engine";
import { GUIDE_STEPS } from "@/demo/guide";
import { Btn, Modal } from "./ui";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

interface ShellUI {
  openGuide: () => void;
  openReset: () => void;
  openSim: () => void;
}
const Ctx = createContext<ShellUI | null>(null);
export function useShellUI() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShellUI outside provider");
  return c;
}

export function ShellUIProvider({ children }: { children: ReactNode }) {
  const [guide, setGuide] = useState(false);
  const [reset, setReset] = useState(false);
  const [sim, setSim] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inApp = pathname !== "/";
  const value = useMemo(
    () => ({
      openGuide: () => setGuide(true),
      openReset: () => setReset(true),
      openSim: () => setSim(true),
    }),
    [],
  );
  return (
    <Ctx.Provider value={value}>
      {children}
      <Toaster position="top-center" />
      {inApp && (
        <>
          <GuideSheet open={guide} onClose={() => setGuide(false)} />
          <ResetDialog open={reset} onClose={() => setReset(false)} />
          <SimDialog
            open={sim}
            onClose={() => setSim(false)}
            onReset={() => {
              setSim(false);
              setReset(true);
            }}
            onGuide={() => {
              setSim(false);
              setGuide(true);
            }}
          />
          <GuideBar />
          <FloatingGuide onOpen={() => setGuide(true)} hidden={pathname.startsWith("/edge")} />
        </>
      )}
    </Ctx.Provider>
  );
}

function FloatingGuide({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  const { state } = useDemo();
  if (hidden || state.guide.active) return null;
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-20 right-4 z-30 inline-flex h-11 items-center gap-2 rounded-[8px] border border-hairline bg-card px-4 text-sm font-medium text-navy shadow-[0_6px_20px_-12px_color-mix(in_oklab,var(--color-ink)_40%,transparent)] hover:bg-surface lg:bottom-6 lg:right-6"
    >
      <Compass aria-hidden className="size-4 text-teal" />
      Demo Guide
    </button>
  );
}

function GuideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions } = useDemo();
  const navigate = useNavigate();
  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="DhruvSetu demonstration"
      footer={
        <>
          <Btn onClick={onClose}>Close</Btn>
          <Btn
            variant="primary"
            onClick={() => {
              actions.guideStart();
              onClose();
              navigate({ to: GUIDE_STEPS[0].to });
            }}
          >
            Start Guided Demo <ArrowRight className="size-4" />
          </Btn>
        </>
      }
    >
      <p className="mb-5 text-[15px] text-muted-foreground">
        A five-minute path through one operational record: from readiness to offline receipt,
        priority synchronization, emergency response and audit.
      </p>
      <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {GUIDE_STEPS.map((s, i) => (
          <li key={s.title}>
            <Link
              to={s.to}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[7px] px-2 py-2 text-[14px] text-ink hover:bg-surface"
            >
              <span className="w-6 font-mono text-[12px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </Link>
          </li>
        ))}
      </ol>
    </Modal>
  );
}

function GuideBar() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { active, step } = state.guide;
  const cur = GUIDE_STEPS[step];

  // Preload neighbouring steps so Next/Back feel instant
  useEffect(() => {
    if (!active) return;
    [step + 1, step - 1].forEach((i) => {
      const s = GUIDE_STEPS[i];
      if (s) router.preloadRoute({ to: s.to }).catch(() => {});
    });
  }, [active, step, router]);

  // Highlight target as soon as it appears
  useEffect(() => {
    if (!active || !cur?.target) return;
    const sel = `[data-guide="${cur.target}"]`;
    let done = false;
    const apply = () => {
      if (done) return true;
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return false;
      done = true;
      el.classList.add("guide-highlight");
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight - 200) {
        const far = Math.abs(r.top) > window.innerHeight * 2;
        el.scrollIntoView({ block: "center", behavior: far ? "auto" : "smooth" });
      }
      return true;
    };
    let raf = 0;
    const obs = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => apply() && obs.disconnect());
    });
    raf = requestAnimationFrame(() => {
      if (!apply()) obs.observe(document.body, { childList: true, subtree: true });
    });
    const stop = window.setTimeout(() => obs.disconnect(), 4000);
    return () => {
      done = true;
      obs.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(stop);
      document
        .querySelectorAll(".guide-highlight")
        .forEach((n) => n.classList.remove("guide-highlight"));
    };
  }, [active, step, pathname, cur?.target]);

  if (!active || !cur) return null;
  const go = (i: number) => {
    const target = GUIDE_STEPS[i];
    if (!target) return;
    actions.guideStep(i);
    if (target.to !== pathname) navigate({ to: target.to });
  };
  const onPage = pathname === cur.to;

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-x-3 bottom-20 z-[45] mx-auto max-w-xl rounded-[12px] border border-navy bg-navy p-4 text-onnavy shadow-lg lg:bottom-6"
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="min-w-0"
        >
          <p className="eyebrow text-cyan">
            Step {String(step + 1).padStart(2, "0")} / {GUIDE_STEPS.length} · {cur.title}
          </p>
          <p className="mt-2 text-[14.5px] leading-snug text-onnavy">{cur.text}</p>
        </motion.div>
        <button
          onClick={actions.guideExit}
          aria-label="Exit guided demo"
          className="grid size-9 shrink-0 place-items-center rounded-[6px] text-onnavy-muted hover:bg-onnavy/10"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex gap-1" aria-hidden>
          {GUIDE_STEPS.map((_, i) => (
            <span
              key={i}
              className={cn("h-1 w-3 rounded-full sm:w-4", i <= step ? "bg-cyan" : "bg-onnavy/20")}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {!onPage && (
            <button
              onClick={() => navigate({ to: cur.to })}
              className="h-9 rounded-[6px] px-3 text-[13px] text-onnavy-muted hover:bg-onnavy/10"
            >
              Go there
            </button>
          )}
          <button
            disabled={step === 0}
            onClick={() => go(step - 1)}
            aria-label="Previous step"
            className="grid size-9 place-items-center rounded-[6px] border border-onnavy/20 disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </button>
          {step < GUIDE_STEPS.length - 1 ? (
            <button
              onClick={() => go(step + 1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-onnavy px-3.5 text-[13px] font-semibold text-navy"
            >
              Next <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={actions.guideExit}
              className="h-9 rounded-[6px] bg-onnavy px-3.5 text-[13px] font-semibold text-navy"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ResetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions } = useDemo();
  const navigate = useNavigate();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset demo"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            variant="primary"
            onClick={() => {
              actions.reset();
              onClose();
              navigate({ to: "/dashboard" });
            }}
          >
            Reset
          </Btn>
        </>
      }
    >
      <p className="text-[15px] text-ink">
        Reset the demonstration environment to its initial state?
      </p>
      <p className="mt-2 text-[14px] text-muted-foreground">
        All actions, queued operations and audit entries created during this session will be
        cleared.
      </p>
    </Modal>
  );
}

function SimDialog({
  open,
  onClose,
  onReset,
  onGuide,
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  onGuide: () => void;
}) {
  const { actions } = useDemo();
  const navigate = useNavigate();
  return (
    <Modal open={open} onClose={onClose} title="Demo environment">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-[4px] border border-orange/40 bg-orange/10 px-2 py-1 font-mono text-[11px] tracking-[0.12em] text-orange">
          SIMULATION
        </span>
        <span className="text-[13px] text-muted-foreground">Synthetic operational data</span>
      </div>
      <p className="text-[15px] leading-relaxed text-ink">
        All records shown in this environment are synthetic and intended for demonstration purposes.
        Names, cargo, incidents and readings are fictional.
      </p>
      <div className="mt-6 grid gap-2">
        <Btn
          variant="primary"
          onClick={() => {
            actions.reset();
            actions.showWelcome();
            onClose();
            navigate({ to: "/dashboard" });
          }}
        >
          Restart Demo
        </Btn>
        <Btn onClick={onReset}>Reset Scenario</Btn>
        <Btn onClick={onGuide}>
          <BookOpen className="size-4" /> Open Demo Guide
        </Btn>
      </div>
    </Modal>
  );
}
