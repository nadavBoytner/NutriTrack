# NutriTrack

A personal nutrition tracking app (Hebrew-first, RTL): log food and weight day by day, track progress against nutrition goals, and parse free-text meal descriptions with AI.

See `planning/PLAN.md` for the full product spec and `planning/BUILD_PLAN.md` for the phased build plan and current status.

## Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Web**: Next.js
- **Mobile**: Expo (React Native)
- Monorepo via npm workspaces (`apps/*`, `packages/*`)

## Setup

```bash
npm install
docker compose up -d          # local Postgres
cp apps/backend/.env.example apps/backend/.env
```

Then set `OPENAI_API_KEY` in `apps/backend/.env` (used by the free-text meal parsing feature).

## Running the backend

```bash
cd apps/backend
npx prisma migrate dev        # apply migrations
npm run start:dev             # http://localhost:3000
```

## Running the web app

```bash
cd apps/web
cp .env.example .env.local
npm run dev                   # http://localhost:3001
```

## Running the mobile app

```bash
cd apps/mobile
cp .env.example .env.local    # set EXPO_PUBLIC_API_URL to your machine's LAN IP for on-device testing
npx expo start                # scan the QR code with Expo Go
```

See `apps/mobile/README.md` for details.

## Tests

```bash
cd apps/backend
npm test                      # unit tests
npm run test:e2e              # e2e tests (needs Postgres running)
```

## Status

Phases 0–6 are done: backend, web dashboard, and mobile app (Expo Go), all sharing one dark glassmorphism design system. Phase 7 (polish, hardening, deploy) is in progress — see `planning/BUILD_PLAN.md` for what's left.
