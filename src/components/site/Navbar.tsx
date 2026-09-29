import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Architecture", href: "#architecture" },
];

function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <circle cx="9" cy="9" r="8" fill="none" stroke="var(--color-teal)" strokeWidth="1" />
        <path d="M9 1 V17 M1 9 H17" stroke="var(--color-teal)" strokeWidth="0.6" opacity="0.5" />
        <circle cx="9" cy="4.2" r="1.8" fill="var(--color-cyan)" />
      </svg>
      <span
        className={cn(
          "text-[0.95rem] font-semibold tracking-[-0.02em]",
          onDark ? "text-onnavy" : "text-ink",
        )}
      >
        DhruvSetu
      </span>
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-[6px]"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-6 md:px-10"
      >
        <Wordmark />

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[0.82rem] text-muted-foreground transition-colors duration-200 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="group hidden items-center gap-2 rounded-sm border border-border px-4 py-2 text-[0.82rem] font-medium text-ink transition-colors duration-300 hover:border-cyan hover:bg-ice/60 sm:inline-flex"
          >
            Launch Platform
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-sm border border-border text-ink lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-16 z-40 bg-background px-6 pb-10 pt-8 lg:hidden"
          >
            <ul className="flex flex-col">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="border-b border-border"
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-5 text-2xl font-medium tracking-[-0.02em] text-ink"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-navy px-5 py-4 text-sm font-medium text-onnavy"
            >
              Launch Platform <span aria-hidden>→</span>
            </a>
            <p className="mono-xs mt-8 uppercase text-muted-foreground">
              Offline-first • Auditable • Built for the edge
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
