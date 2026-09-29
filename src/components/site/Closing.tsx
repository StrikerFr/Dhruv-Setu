import { ActionButton, Reveal, Section, SectionHeader, StatusBadge } from "./primitives";

/* -------------------------------- Security ---------------------------------- */

const security = [
  {
    title: "Role-based access",
    copy: "Station, field, logistics and command roles see the records their role owns.",
  },
  {
    title: "Scoped permissions",
    copy: "Permissions are scoped to an expedition, a station and an operational module.",
  },
  {
    title: "Audit trails",
    copy: "Every state change records who, where, when and from which device.",
  },
  {
    title: "Encrypted edge data",
    copy: "Local operational data on edge devices is stored encrypted at rest.",
  },
  {
    title: "Device authorization",
    copy: "Edge devices are enrolled and authorized before they can submit records.",
  },
  {
    title: "Conflict handling",
    copy: "Concurrent edits surface as an explicit conflict for an operator to resolve.",
  },
  {
    title: "Sensitive data separation",
    copy: "Personal and medical details are separated from operational accountability records.",
  },
];

export function SecuritySection() {
  return (
    <Section id="security">
      <SectionHeader
        eyebrow="Trust model"
        title="Built around trust."
        lede="Operational records are only useful if they can be defended afterwards. These are the controls implemented in the platform; no certification claims are made."
      />

      <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {security.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 0.04}>
            <div className="h-full bg-card p-6 transition-colors duration-300 hover:bg-ice/40">
              <p className="mono-xs text-teal">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-3 text-[1rem] tracking-[-0.015em] text-ink">{s.title}</p>
              <p className="mt-2 text-[0.87rem] leading-relaxed text-muted-foreground">{s.copy}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------ Architecture -------------------------------- */

export function ArchitectureSection() {
  return (
    <Section id="architecture" dark>
      <SectionHeader
        onDark
        eyebrow="Architecture"
        title="A conceptual view of the system."
        lede="The operations portal is the system of record. Services, synchronization and integrations carry operational data to and from the polar edge."
      />

      <div className="mt-16">
        <svg
          viewBox="0 0 800 420"
          className="w-full"
          role="img"
          aria-label="Architecture: central operations portal connects to operational services, which connect to data, sync and integrations, and then to the polar edge."
        >
          <defs>
            <style>{`
              .arch-box { fill: color-mix(in oklab, var(--color-onnavy) 4%, transparent); stroke: color-mix(in oklab, var(--color-onnavy) 18%, transparent); }
              .arch-label { fill: var(--color-onnavy); font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
              .arch-sub { fill: var(--color-onnavy-muted); font-family: var(--font-mono); font-size: 11px; }
              .arch-line { stroke: color-mix(in oklab, var(--color-onnavy) 22%, transparent); stroke-width: 1; }
            `}</style>
          </defs>

          <rect className="arch-box" x="250" y="10" width="300" height="60" rx="2" />
          <text className="arch-label" x="400" y="38" textAnchor="middle">
            Central Operations Portal
          </text>
          <text className="arch-sub" x="400" y="56" textAnchor="middle">
            System of record · exceptions · audit
          </text>

          <line className="arch-line" x1="400" y1="70" x2="400" y2="120" />
          <line
            className="arch-line flow-dash"
            x1="400"
            y1="70"
            x2="400"
            y2="120"
            stroke="var(--color-cyan)"
          />

          <rect className="arch-box" x="250" y="120" width="300" height="60" rx="2" />
          <text className="arch-label" x="400" y="148" textAnchor="middle">
            Operational Services
          </text>
          <text className="arch-sub" x="400" y="166" textAnchor="middle">
            Expedition · cargo · personnel · incidents
          </text>

          <line className="arch-line" x1="400" y1="180" x2="400" y2="210" />
          <line className="arch-line" x1="150" y1="210" x2="650" y2="210" />
          <line className="arch-line" x1="150" y1="210" x2="150" y2="250" />
          <line className="arch-line" x1="400" y1="210" x2="400" y2="250" />
          <line className="arch-line" x1="650" y1="210" x2="650" y2="250" />

          <rect className="arch-box" x="60" y="250" width="180" height="56" rx="2" />
          <text className="arch-label" x="150" y="283" textAnchor="middle">
            Data
          </text>

          <rect className="arch-box" x="310" y="250" width="180" height="56" rx="2" />
          <text className="arch-label" x="400" y="283" textAnchor="middle">
            Sync
          </text>

          <rect className="arch-box" x="560" y="250" width="180" height="56" rx="2" />
          <text className="arch-label" x="650" y="283" textAnchor="middle">
            Integrations
          </text>

          <line className="arch-line" x1="400" y1="306" x2="400" y2="346" />
          <line
            className="arch-line flow-dash"
            x1="400"
            y1="306"
            x2="400"
            y2="346"
            stroke="var(--color-cyan)"
          />

          <rect
            className="arch-box"
            x="250"
            y="346"
            width="300"
            height="60"
            rx="2"
            stroke="var(--color-teal)"
          />
          <text className="arch-label" x="400" y="374" textAnchor="middle">
            Polar Edge
          </text>
          <text className="arch-sub" x="400" y="392" textAnchor="middle">
            Stations · vessels · field devices
          </text>
        </svg>
      </div>

      <Reveal>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <StatusBadge tone="syncing" label="Priority synchronization" dense />
          <StatusBadge tone="connected" label="Bidirectional custody events" dense />
          <span className="mono-xs uppercase text-onnavy-muted">
            Conceptual view · implementation detail omitted
          </span>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------------------------- Operational reality ---------------------------- */

const realities = [
  { title: "Offline operation", meta: "Local write · queued delivery" },
  { title: "Low-bandwidth environments", meta: "Compact payloads · resumable sync" },
  { title: "Traceable custody", meta: "Event chain per cargo line" },
  { title: "Human accountability", meta: "Check-in · muster · acknowledgement" },
  { title: "Emergency priority", meta: "P0 before P1 before P2" },
  { title: "Conflict resolution", meta: "Explicit operator decision" },
  { title: "Auditability", meta: "Immutable event history" },
];

export function RealitySection() {
  return (
    <Section>
      <SectionHeader eyebrow="Operational reality" title="Designed around operational reality." />

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {realities.map((r, i) => (
          <Reveal as="li" key={r.title} delay={i * 0.04}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 py-5">
              <span className="flex items-baseline gap-5">
                <span className="mono-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1.05rem] tracking-[-0.02em] text-ink">{r.title}</span>
              </span>
              <span className="mono-xs uppercase text-muted-foreground">{r.meta}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* --------------------------------- Final CTA -------------------------------- */

export function FinalCTA() {
  return (
    <Section dark bordered={false}>
      <div className="max-w-3xl">
        <Reveal>
          <h2 className="display-lg text-onnavy">Ready the expedition.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 text-[1rem] leading-relaxed text-onnavy-muted">
            One operational record from planning to closeout.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-9 flex flex-wrap gap-3">
            <ActionButton href="/dashboard" variant="onDark">
              Launch DhruvSetu
            </ActionButton>
            <ActionButton href="#architecture" variant="ghostOnDark" arrow={false}>
              View Architecture
            </ActionButton>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mono-xs mt-8 uppercase text-onnavy-muted">
            Demonstration environment • Synthetic operational data
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------- Footer ---------------------------------- */

const footerNav = [
  {
    heading: "Platform",
    items: [
      { label: "Platform", href: "#platform" },
      { label: "Capabilities", href: "#capabilities" },
      { label: "Security", href: "#security" },
      { label: "Architecture", href: "#architecture" },
      { label: "Demo", href: "#command-center" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "Documentation", href: "#how-it-works" },
      { label: "System Status", href: "#command-center" },
      { label: "Contact", href: "#top" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 md:px-10">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.6fr))]">
        <div>
          <p className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">DhruvSetu</p>
          <p className="mt-2 max-w-xs text-[0.88rem] text-muted-foreground">
            One operational record for polar expeditions.
          </p>
        </div>

        {footerNav.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <p className="mono-xs uppercase text-muted-foreground">{group.heading}</p>
            <ul className="mt-4 space-y-2.5">
              {group.items.map((it) => (
                <li key={it.label}>
                  <a
                    href={it.href}
                    className="text-[0.88rem] text-ink transition-colors duration-200 hover:text-teal"
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-14 w-full max-w-[1180px] border-t border-border pt-6">
        <p className="mono-xs uppercase text-muted-foreground">
          Demonstration environment. All operational records shown are synthetic.
        </p>
      </div>
    </footer>
  );
}
