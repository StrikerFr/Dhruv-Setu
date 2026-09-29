## Landing page structure

- DhruvSetu landing page sections live in `src/components/site/*` and are composed in `src/routes/index.tsx`; shared UI (Section, SectionHeader, StatusBadge, OpsCard, Reveal) lives in `src/components/site/primitives.tsx` so operational styling stays consistent.
- Demo app state lives in `src/demo/` (seed, engine provider, services); components read via `useDemo()` + service selectors, never raw mock arrays (keeps the demo structured like a real backend).
- Platform routes sit under the pathless `_ops` layout (sidebar/header shell); `/edge` is a standalone field-tablet route; minor modules render from `_ops.$module.tsx` config, giving one consistent shell across few files.
- vite.config.ts pins nitro preset "vercel" when VERCEL env is set, so Vercel deploys build for Vercel's runtime instead of the Cloudflare default.
