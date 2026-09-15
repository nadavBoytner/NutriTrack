# NutriTrack – Development Plan

## Vision
A personal nutrition tracking app. Users sign up, set up a profile and nutrition goals, and track what they eat day by day - using a built-in food database, manual entry, or a free-text description that is automatically parsed by AI. The app keeps a full history and shows progress reports.

## Architecture
- **Mobile client** (iOS + Android) - the main app where users log daily data.
- **Separate web interface** (browser dashboard) - for viewing history, reports, and editing profile/goals. Shares the same backend/API as the mobile app.
- **Central backend (API)** - serves both clients, connects to the database and to the external food database.

### Proposed stack
- **Mobile**: React Native + Expo - cross-platform, good camera access support (relevant for barcode scanning in phase 2), fast development.
- **Web**: Next.js (React) - allows sharing code/types (TypeScript) with the mobile app and easier maintenance.
- **Backend**: Node.js + TypeScript (NestJS or Express) - one language across all layers, a single API for both clients.
- **Database**: PostgreSQL - fits the relational data shape (users, goals, daily records) well.
- **Auth**: JWT + bcrypt for password hashing. Google login - phase 2.
- **Food database**: Open Food Facts API - free, no API key required, a huge global database that also includes barcodes (a good foundation for barcode scanning later too). Consider USDA FoodData Central later as a supplementary source for generic products.
- **AI assistant**: Anthropic Claude API - takes free-text input from the user (e.g. "I had chicken salad and a cup of rice"), breaks it down into a list of food items with estimated quantities, and tries to match each item against the food database (text search on Open Food Facts). When there's no good match, the system can fall back on the model's own estimate, and flag the entry as "AI-estimated" (vs. "matched from database") for transparency to the user.

## Features - First version (MVP)
1. **Sign up and login** - email + password only.
2. **User profile** - age, height, weight, nutrition goal (cutting / bulking / maintaining).
3. **Nutrition goals** - calories, carbs, fat, protein - entered manually by the user (no automatic calculation at this stage).
4. **Daily tracking** - a general list of food items eaten during the day (not split by meal), with the option to add:
   - An existing item from the database (search via Open Food Facts).
   - A manual item (the user enters the name + nutritional values themselves).
5. **AI assistant for free-text food logging** - the user writes what they ate in a plain sentence, and the system automatically adds the items and values to the daily log.
6. **Weight tracking** - optional daily weigh-in, saved to history.
7. **Reports** - daily / weekly / monthly: progress against goals (calories and macros) and a weight trend chart.
8. **History** - full record of all entries (food + weight) over time, viewable at any point.
9. **Hebrew UI** - including RTL support on both clients (mobile + web). This is a product requirement, independent of the documentation language.
10. **Business model** - completely free, no premium features at this stage.

## Phase 2 (future backlog)
- Google login (OAuth).
- Barcode scanning (ML Kit / vision-camera) against Open Food Facts.
- Splitting the daily log by meal (breakfast / lunch / dinner / snacks).
- Saving user-created "recipes" / composite meals for reuse.
- Gamification (streaks, achievements) and social features.
- Automatic calculation of nutrition targets (TDEE/BMR) as a default, with manual override.
- Business model (subscription/premium) - not yet decided.

## Data model (initial sketch)
- **User**: id, email, password_hash, created_at
- **Profile**: user_id, age, height_cm, weight_kg, goal_type (cutting/bulking/maintain)
- **NutritionGoal**: user_id, daily_calories, daily_carbs_g, daily_fat_g, daily_protein_g
- **FoodItem** (local cache from external source): id, external_id (Open Food Facts), name, calories_per_100g, carbs_per_100g, fat_per_100g, protein_per_100g, barcode (future)
- **LogEntry**: id, user_id, date, food_item_id (nullable if manual), custom_name (if manual), quantity_g, calories, carbs, fat, protein, source (db / manual / ai_estimated)
- **WeightEntry**: id, user_id, date, weight_kg

## Open questions
- Check how well Open Food Facts covers Israeli-specific products, and consider a fallback layer (manual entry / AI estimate) for missing items.
- Decide on a hosting/cloud provider for the backend and database (e.g. AWS / GCP / Render / Railway) later on, based on budget and convenience.
