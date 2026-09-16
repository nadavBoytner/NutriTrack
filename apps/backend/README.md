# NutriTrack Backend

NestJS + Prisma + PostgreSQL API serving the web and mobile clients.

## Setup

```bash
cp .env.example .env      # set DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
npx prisma migrate dev
npm run start:dev         # http://localhost:3000
```

## Modules

- `auth` — signup/login (JWT + bcrypt), throttled at 5 req/min
- `profile`, `nutrition-goals` — user profile and daily macro targets
- `food-items` — Open Food Facts search, cached locally
- `log-entries` — daily food log CRUD, free-text AI meal parsing (throttled at 10 req/min), paginated history
- `weight-entries` — daily weigh-ins
- `reports` — macro-vs-goal and weight-trend aggregation

## Tests

```bash
npm test          # unit tests
npm run test:e2e  # e2e tests (needs Postgres running)
```
