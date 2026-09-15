# NutriTrack — MVP Build Plan

## Context

The repo is a confirmed blank slate: one commit ("started position"), containing only `CLAUDE.md` and `planning/PLAN.md`. No code, no `package.json`, no source directories exist yet. `planning/PLAN.md` is the product/architecture spec for **NutriTrack**, a Hebrew-first nutrition tracking app (mobile + web + backend), and defines the MVP scope in full. This plan turns that spec into a sequenced, incremental build order, per the user's global instruction to always work in small validated steps and avoid overengineering.

Confirmed decisions: build the **web dashboard before mobile** (faster iteration loop; proves the API contract once before porting to React Native), backend framework **NestJS**, ORM **Prisma**.

## Repo Structure

Monorepo using **pnpm workspaces** (or npm workspaces if pnpm isn't installed) — no Turborepo yet, that's a "revisit when it hurts" decision.

```
foodTrack/
  apps/
    backend/            # NestJS API
    web/                # Next.js dashboard
    mobile/             # Expo React Native app (built last)
  packages/
    shared-types/        # DTOs/enums shared across backend + both clients
  planning/
    PLAN.md
  CLAUDE.md
  package.json            # workspace root
  pnpm-workspace.yaml
  tsconfig.base.json
  .env.example
  .gitignore
  docker-compose.yml       # local Postgres only
```

No shared eslint/tsconfig package, no CI, no Docker for the apps themselves yet — keep it lean until real duplication/friction shows up.

## Build Order

Backend first (both clients depend on it), then web, then mobile as a port of the proven web flows. Within the backend: auth → profile/goals → food + daily tracking (core loop) → weight + reports (read-side) → AI parsing (highest risk, validated last against a working system).

### Phase 0 — Repo & Tooling Scaffold
- Root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.env.example`, node version pin.
- Skeleton `apps/backend` (NestJS), `apps/web` (Next.js), `apps/mobile` (Expo), `packages/shared-types` — each just enough to boot.
- `docker-compose.yml` for local Postgres.
- **Validate:** `pnpm install` succeeds at root; each app's dev command boots; Postgres container is reachable via psql/pgAdmin.

### Phase 1 — Backend Core: Auth, Profile, Nutrition Goals
- Prisma schema + migration for `User`, `Profile`, `NutritionGoal` only.
- `POST /auth/signup`, `POST /auth/login` (JWT), `GET/PUT /profile`, `GET/PUT /nutrition-goals`, auth guard on protected routes, bcrypt password hashing.
- **Validate:** unit tests for auth logic; integration tests (supertest) for signup → login → authenticated profile fetch; confirm unauthenticated requests are rejected.

### Phase 2 — Backend: Food Data & Daily Tracking
- `FoodItem` table; `GET /food-items/search?q=` proxies Open Food Facts, caches results locally (cache-aside).
- `LogEntry` table + CRUD scoped by user/date, supporting either a DB-matched item (`food_item_id`) or a manual entry (`custom_name` + user-entered macros).
- **Validate:** search returns real OFF data; macro scaling by `quantity_g` is correct for both entry types, covered by unit tests.

### Phase 3 — Backend: Weight Tracking & Reports
- `WeightEntry` table + endpoints.
- Report endpoints: daily/weekly/monthly macro-vs-goal aggregation, weight-trend series.
- **Validate:** seed known data, assert aggregation totals with unit tests before any UI touches it.

### Phase 4 — Web Dashboard (first client)
- Next.js scaffold, Hebrew as primary locale, `dir="rtl"` from the start (not retrofitted).
- Screens: signup/login, profile + goals forms, daily log (DB-search or manual item), full history, reports/charts, weigh-in.
- Consumes `packages/shared-types` for shared request/response shapes.
- **Validate:** manual click-through of the full MVP flow against the local backend (signup → set goals → log food both ways → see history → view a report).

### Phase 5 — AI Free-Text Meal Parsing
- `POST /log-entries/ai-parse`: sends free text to the OpenAI API (structured outputs / function calling) to extract items + quantities, attempts an OFF match per item, falls back to the model's own estimate when unmatched, tagging `source` as `ai_estimated` vs `db`.
- Web UI: free-text box → editable parsed preview → confirm → persists as normal `LogEntry` rows.
- **Validate:** manual testing with varied Hebrew/English input; confirm "AI-estimated" vs "matched from database" labeling is correct and visible; basic timeout/error handling on the external call.
- Built after Phase 4 so it's validated against an already-working system, not in isolation.

### Phase 6 — Mobile App (Expo / React Native)
- Scaffold Expo app, reuse `packages/shared-types`, RTL via `I18nManager` + Hebrew strings.
- Port the same flows already proven on web (auth, profile/goals, daily log, history, reports, weigh-in) via React Navigation or Expo Router.
- **Validate:** run in Expo Go on device/simulator, repeat the same manual test script used for web.

### Phase 7 — Polish & Hardening
- Cross-check Hebrew/RTL rendering on both clients (numbers, dates, chart mirroring).
- Pagination for history views.
- Error/empty/loading states on both clients.
- Basic rate limiting + input validation, especially on auth and AI endpoints.
- Concise README per app + root README.
- Resolve hosting/deploy target (open question in PLAN.md) and deploy backend + web; decide mobile distribution (Expo Go vs. EAS build).

## Remaining Open Decisions (not blocking Phase 0)

- **Testing depth:** unit tests for backend business logic (macro math, report aggregation, AI fallback) + integration tests for auth/CRUD via supertest; manual click-through for UI; no Playwright/Detox until post-MVP.
- **Secrets handling:** `.env` per app, `.env.example` committed, real `.env` gitignored — set this convention in Phase 0.
- **Hosting provider:** deferred to Phase 7, per PLAN.md's own open question.

## Working Process

- Before starting each phase, resolve any open questions with the user first — do not begin implementation work on a phase while questions are outstanding.
- After each phase's validation step passes, stop and get the user's explicit approval before starting the next phase.
- When building frontend UI (Phases 4 and 6), use the `frontend-design` skill for aesthetic direction and visual design decisions rather than defaulting to generic/templated UI.

## Verification

Each phase is validated before moving to the next (per the user's incremental-steps mandate):
- Phases 0–3 (backend): automated unit/integration tests (Jest + supertest) plus manual curl/Thunder Client checks.
- Phase 4 (web): manual end-to-end click-through of the full MVP flow against the local backend + local Postgres.
- Phase 5 (AI parsing): manual testing with varied real sentences, checking source-labeling correctness.
- Phase 6 (mobile): manual run in Expo Go/simulator repeating the web test script.
- Phase 7: cross-client RTL/Hebrew check, then a real deploy of backend + web as the final validation.
