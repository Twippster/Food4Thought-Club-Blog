# Food4Thought

Food4Thought is a student-led editorial blog about reducing food waste and making sure everyone is fed.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/food4thought/` — deployable Vite web app
- `artifacts/food4thought/src/App.tsx` — page content, local routes, newsletter interaction, and shared shell
- `artifacts/food4thought/src/index.css` — Food4Thought visual language and responsive styles
- `lib/api-spec/openapi.yaml` — shared API contract (unchanged; the first Food4Thought build is frontend-only)

## Architecture decisions

- The first release is frontend-only so the club can publish its point of view and content experience without requiring a CMS or database.
- Local route state powers the home, stories, article, about, and join views so the first-minute browsing experience works without external services.
- The visual identity uses a warm paper background, ink-teal typography, tomato accents, and broadsheet-inspired composition to make the publication feel student-made and memorable.

## Product

- Homepage with mission statement, featured stories, publication ticker, and editorial manifesto.
- Stories archive with category browsing for school lunch, leftovers, mutual aid, food rescue, and student action.
- Long-form article view with byline, pull quote, tags, sharing/copy-link affordance, and related story navigation.
- Join page with a working local newsletter signup success state.
- About / point-of-view page and responsive mobile navigation.

## User preferences

No persistent preferences recorded.

## Gotchas

- The web artifact workflow supplies `PORT` and `BASE_PATH`; use the managed `artifacts/food4thought: web` workflow for previews.
- The app intentionally has no backend dependency in its first release; newsletter signup feedback is local UI state.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
