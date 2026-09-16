# NutriTrack Web

Next.js (App Router) dashboard — Hebrew, RTL, server components + server actions against the backend API.

## Setup

```bash
cp .env.example .env.local   # BACKEND_URL, defaults to http://localhost:3000
npm run dev                  # http://localhost:3001
```

## Pages

`/` daily log · `/history` paginated day-by-day history · `/reports` macro/weight reports · `/profile` profile + goals · `/login`, `/signup`

## Design system

Dark glassmorphism (frosted `glass-panel` cards, glowing gradient blobs, gradient pill buttons) — tokens live in `src/app/globals.css`.
