# NutriTrack — MVP Build Plan

## Context

`planning/PLAN.md` is the product/architecture spec for **NutriTrack**, a Hebrew-first nutrition tracking app (mobile + web + backend). This document turns that spec into a sequenced, incremental build order, per the user's global instruction to always work in small validated steps and avoid overengineering.

Confirmed decisions: build the **web dashboard before mobile** (faster iteration loop; proves the API contract once before porting to React Native), backend framework **NestJS**, ORM **Prisma**.

## Repo Structure

Monorepo using **npm workspaces** (pnpm wasn't installed on the dev machine) — no Turborepo yet, that's a "revisit when it hurts" decision.

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
    BUILD_PLAN.md
  CLAUDE.md
  README.md
  package.json            # workspace root
  tsconfig.base.json
  .env.example
  .gitignore
  docker-compose.yml       # local Postgres only
```

No shared eslint/tsconfig package, no CI, no Docker for the apps themselves yet — keep it lean until real duplication/friction shows up.

## Build Order

Backend first (both clients depend on it), then web, then mobile as a port of the proven web flows. Within the backend: auth → profile/goals → food + daily tracking (core loop) → weight + reports (read-side) → AI parsing (highest risk, validated last against a working system).

Each phase below lists: what it covers, why it matters, the concrete to-do list, and the tests the code must pass before the phase is considered done.

---

### Phase 0 — Repo & Tooling Scaffold — ✅ Done

**Description:** Stand up the monorepo skeleton so every app boots, with no real features yet.

**Goals:**
- A working npm-workspaces monorepo that installs and boots all three apps plus local Postgres.

**To do:**
- Root `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`, node version pin.
- Skeleton `apps/backend` (NestJS), `apps/web` (Next.js), `apps/mobile` (Expo), `packages/shared-types` — each just enough to boot.
- `docker-compose.yml` for local Postgres.

**Tests to pass:**
- `npm install` succeeds at the repo root.
- Each app's dev command boots without errors.
- Postgres container is reachable via psql/pgAdmin.

---

### Phase 1 — Backend Core: Auth, Profile, Nutrition Goals — ✅ Done

**Description:** The minimum backend needed for a user to exist and set their goals — no food tracking yet.

**Goals:**
- Users can sign up, log in, and manage their profile and nutrition goals behind auth.

**To do:**
- Prisma schema + migration for `User`, `Profile`, `NutritionGoal` only.
- `POST /auth/signup`, `POST /auth/login` (JWT), `GET/PUT /profile`, `GET/PUT /nutrition-goals`, auth guard on protected routes, bcrypt password hashing.

**Tests to pass:**
- Unit tests for auth logic (password hashing, JWT issuing) pass.
- Integration tests (supertest) for signup → login → authenticated profile fetch pass.
- Unauthenticated requests to protected routes are rejected (401).

---

### Phase 2 — Backend: Food Data & Daily Tracking — ✅ Done

**Description:** The core daily-logging loop: search a real food database or enter a manual item, and see it recorded for a date.

**Goals:**
- A user can build up a day's food log from either Open Food Facts search results or manual entries.

**To do:**
- `FoodItem` table; `GET /food-items/search?q=` proxies Open Food Facts, caches results locally (cache-aside).
- `LogEntry` table + CRUD scoped by user/date, supporting either a DB-matched item (`food_item_id`) or a manual entry (`custom_name` + user-entered macros).

**Tests to pass:**
- Food search returns real Open Food Facts data.
- Macro scaling by `quantity_g` is correct for both DB-matched and manual entries, covered by unit tests.
- Log entries are scoped to the owning user (integration tests reject cross-user access).

---

### Phase 3 — Backend: Weight Tracking & Reports — ✅ Done

**Description:** Read-side aggregation on top of the core loop: daily weigh-ins and progress-vs-goal reporting.

**Goals:**
- A user can record their weight over time and see macro totals vs. their goal, and their weight trend, for any day/week/month.

**To do:**
- `WeightEntry` table + endpoints (upsert per date, range list, delete).
- Report endpoints: daily/weekly/monthly macro-vs-goal aggregation, weight-trend series.

**Tests to pass:**
- Seeded known data produces exact, asserted aggregation totals in unit tests, before any UI touches it.
- e2e tests cover weight-entry upsert/list/delete and both report endpoints against a live Postgres instance.
- `tsc --noEmit` and the unit + e2e suites are green.

---

### Phase 4 — Web Dashboard (first client) — Not started

**Description:** The first real UI, proving the full MVP flow end-to-end against the backend built in Phases 1–3.

**Goals:**
- A Hebrew, RTL web dashboard that lets a user sign up, set goals, log food both ways, and see history and reports.

**To do:**
- Next.js scaffold, Hebrew as primary locale, `dir="rtl"` from the start (not retrofitted).
- Screens: signup/login, profile + goals forms, daily log (DB-search or manual item), full history, reports/charts, weigh-in.
- Consumes `packages/shared-types` for shared request/response shapes.
- Use the `frontend-design` skill for aesthetic direction rather than defaulting to generic/templated UI.

**Tests to pass:**
- Manual click-through of the full MVP flow against the local backend: signup → set goals → log food both ways → see history → view a report.

---

### Phase 5 — AI Free-Text Meal Parsing — Not started

**Description:** The highest-risk feature, deliberately built last and validated against an already-working system rather than in isolation.

**Goals:**
- A user can type a free-text meal description and get it turned into log entries, each clearly labeled as DB-matched or AI-estimated.

**To do:**
- `POST /log-entries/ai-parse`: sends free text to the OpenAI API (structured outputs / function calling) to extract items + quantities, attempts an OFF match per item, falls back to the model's own estimate when unmatched, tagging `source` as `ai_estimated` vs `db`.
- Web UI: free-text box → editable parsed preview → confirm → persists as normal `LogEntry` rows.

**Tests to pass:**
- Manual testing with varied Hebrew/English input produces reasonable item extraction.
- "AI-estimated" vs "matched from database" labeling is correct and visible in the UI.
- Basic timeout/error handling on the external OpenAI call is exercised (e.g. simulated timeout doesn't crash the request).

---

### Phase 6 — Mobile App (Expo / React Native) — Not started

**Description:** Port the proven web flows to mobile rather than re-designing them from scratch.

**Goals:**
- The same MVP flows (auth, profile/goals, daily log, history, reports, weigh-in) working in Expo Go on device/simulator.

**To do:**
- Scaffold Expo app, reuse `packages/shared-types`, RTL via `I18nManager` + Hebrew strings.
- Port the same flows already proven on web via React Navigation or Expo Router.

**Tests to pass:**
- The same manual test script used for web (Phase 4) passes when run in Expo Go on device/simulator.

---

### Phase 7 — Polish & Hardening — Not started

**Description:** Cross-client cleanup and the first real deploy, once every MVP feature exists.

**Goals:**
- Both clients are presentable and robust; the backend + web are deployed somewhere real.

**To do:**
- Cross-check Hebrew/RTL rendering on both clients (numbers, dates, chart mirroring).
- Pagination for history views.
- Error/empty/loading states on both clients.
- Basic rate limiting + input validation, especially on auth and AI endpoints.
- Concise README per app + root README.
- Resolve hosting/deploy target (open question in PLAN.md) and deploy backend + web; decide mobile distribution (Expo Go vs. EAS build).

**Tests to pass:**
- Manual cross-client RTL/Hebrew check (numbers, dates, chart mirroring) passes.
- A real deploy of backend + web is reachable and passes the same manual MVP click-through used in Phase 4.

---

## Remaining Open Decisions (not blocking current work)

- **Testing depth:** unit tests for backend business logic (macro math, report aggregation, AI fallback) + integration tests for auth/CRUD via supertest; manual click-through for UI; no Playwright/Detox until post-MVP.
- **Secrets handling:** `.env` per app, `.env.example` committed, real `.env` gitignored — set in Phase 0.
- **Hosting provider:** deferred to Phase 7, per PLAN.md's own open question.

## Working Process

- Before starting each phase, resolve any open questions with the user first — do not begin implementation work on a phase while questions are outstanding.
- After each phase's validation step passes, stop and get the user's explicit approval before starting the next phase.
- When building frontend UI (Phases 4 and 6), use the `frontend-design` skill for aesthetic direction and visual design decisions rather than defaulting to generic/templated UI.
