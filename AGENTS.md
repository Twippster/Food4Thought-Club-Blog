# Food4Thought — Base44 Dev Environment

## What this is
A pnpm monorepo for "Food4Thought", a student-led editorial blog about reducing food waste.

## Services (docker-compose.base44.yml)
- **postgres** — PostgreSQL 16 (user `f4t`, db `f4t`)
- **setup** — one-shot `pnpm install --frozen-lockfile` into the bind-mounted `node_modules`
- **db-push** — one-shot `drizzle-kit push --force` to create tables (runs after setup + postgres)
- **api** — Express API server on internal port 5000 (esbuild bundle + start, seeds stories on boot)
- **web** — Vite dev server on host port 3000, proxies `/api` → `http://api:5000`

## Key env vars
- `PORT` — required by both Vite and the API server (web: 3000, api: 5000)
- `BASE_PATH` — required by Vite (set to `/`)
- `DATABASE_URL` — Postgres connection string (generated, not a secret)

## How to verify
1. `docker compose -f docker-compose.base44.yml up -d --build`
2. `docker compose -f docker-compose.base44.yml ps` — all services should be up/healthy
3. `curl -s http://localhost:3000` — should return the Vite HTML
4. `curl -s http://localhost:3000/api/healthz` — should return `{"status":"ok"}`
5. `curl -s http://localhost:3000/api/stories` — should return seeded story array

## Gotchas
- The repo's `preinstall` script rejects non-pnpm package managers — always use pnpm.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (1-day supply-chain defense). With `--frozen-lockfile` this is normally fine.
- The API server's `dev` script does `build && start` (no watch mode). After API code edits, restart the `api` service.
- The Vite config conditionally loads Replit plugins only when `REPL_ID` is set — not active in Docker.
- No external secrets are required; all credentials are local-infra (Postgres) generated in compose.
