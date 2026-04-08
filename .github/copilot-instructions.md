## Purpose
Provide quick, focused guidance so an AI coding agent can be immediately productive in this repository.

## Big picture
- Frontend: Vite + React (TypeScript). Source in `src/`, path alias `@` -> `src` (see `vite.config.ts`).
- Local API: small Express server in `server/index.cjs` providing `/api/*` endpoints for admissions and a basic admin auth.
- Optional remote backend: Supabase integration exists in `src/lib/supabase/client.ts` and `supabase/` (project id + functions). If `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` are missing, the client falls back to the local Express API.

## How to run (developer flows)
- Install: `npm install` from repo root.
- Frontend dev: `npm run dev` — runs Vite (configured in `vite.config.ts`, server.port 8080). Open `http://localhost:8080`.
- Local API: `npm run server` — runs `node server/index.cjs` (default API port 5000). Run this in a second terminal when testing admin flows.
- Build: `npm run build` and preview static output with `npm run preview`.
- Lint: `npm run lint`.

Example dev workflow (two terminals):
1. `npm run server` (starts Express API on http://localhost:5000)
2. `npm run dev` (starts Vite frontend on http://localhost:8080)

## Important environment variables
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` — used by `src/lib/supabase/client.ts` to init Supabase. If unset, the app logs a warning and uses local API.
- `ADMIN_TOKEN` — used by `server/index.cjs` to validate admin requests. Default value in code is `admintoken` (unsafe for production). Client admin pages expect a Bearer token in `Authorization` header.

## Project-specific conventions & patterns
- UI library / patterns: uses shadcn/ui and Radix components (see `src/components` and `package.json` deps). Prefer composing small components in `src/components/ui/`.
- Hooks & context: shared logic lives in `src/hooks/` and `src/contexts/` (e.g., `useAuth.ts`, `ThemeContext.tsx`). Use the `@` alias for imports: `import X from '@/hooks/useAuth'`.
- Admin data store: `server/` persists to JSON files `applications.json` and `users.json` for simplicity. Be cautious: file I/O is synchronous and used in examples—avoid heavy writes in production changes.
- Minimal auth: admin auth is token based (see `/api/admin/login` which returns `ADMIN_TOKEN`). Many admin endpoints check `Authorization: Bearer <token>`.

## Integration points to watch
- `src/lib/supabase/client.ts` — feature flag: if credentials look like placeholders, Supabase is not initialized.
- `supabase/functions/create-admin-user/` — serverless function for admin creation; review migrations in `supabase/migrations/` before touching DB-related code.
- `server/index.cjs` — central source of truth for local API routes. It logs every request to stdout; use that for quick debugging.

## Pull request guidance for AI changes
- Small UI change: update TSX in `src/components/*` or `src/pages/*`. Use `@` imports and run `npm run dev` to verify visually.
- API change: modify `server/index.cjs` and update local JSON schema accordingly. Run `npm run server` and check console logs + `applications.json`.
- Supabase changes: update `supabase/` artifacts and update `src/lib/supabase/client.ts` usage. If adding env vars, document them in README.

## Files to inspect when debugging or adding features
- `vite.config.ts` — alias and dev server port
- `package.json` — scripts (`dev`, `server`, `build`, `lint`)
- `server/index.cjs` — local API logic and auth
- `src/lib/supabase/client.ts` — Supabase initialization and fallback behavior
- `src/pages` and `src/components` — main UI and admin pages (look for `AdminLogin.tsx`, `AdminDashboard.tsx`)

## Safety & security notes
- `server/index.cjs` contains demo plaintext passwords and an in-code default `ADMIN_TOKEN`. Treat this repo as non-production by default; when asked to harden, highlight these spots and recommend bcrypt + environment-only tokens.

---
If anything above is unclear or you'd like more examples (import snippets, common edit patterns, or a short checklist for PRs), tell me which area to expand.
