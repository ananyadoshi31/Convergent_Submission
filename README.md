# Startup Simulation

A single-player, turn-based startup simulation inspired by MIT CleanStart. Each turn is one business quarter. The player sets decisions, advances the turn, and sees outcomes computed server-side.

## Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public** key.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run database migrations

In the Supabase dashboard, open **SQL Editor** and run the contents of:

1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_add_cumulative_profit.sql`

Or use the Supabase CLI: `supabase db push`

### 5. Enable Email auth

In Supabase: **Authentication → Providers → Email** — enable Email and (optionally) disable “Confirm email” for local testing.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and play.

## Features

- **Auth:** Email/password login, session persistence (survives reload)
- **Quarterly decisions:** Unit price, new engineers, new sales staff, salary % of industry average
- **Advance turn:** Server runs simulation model, persists state, client shows results
- **Dashboard:** Cash, revenue, net income, headcount, current quarter, last 4 quarters chart
- **Office view:** Desks with engineers (dark) and sales (light), empty capacity visible
- **Win:** Reach Year 10 with positive cash
- **Lose:** Cash reaches zero

## API

- `GET /api/game` — Current game state, history, pending decisions
- `POST /api/game` — Create new game
- `POST /api/advance` — Advance quarter (body: `price`, `new_engineers`, `new_sales`, `salary_pct`)
- `PUT /api/decisions` — Update pending decisions

## Tradeoffs / Scope

- **Single game per user:** No “multiple saves” — one active game per account
- **No email verification:** Required for quick local testing; can enable in Supabase
- **Fixed office capacity:** 12 desks per department (can be made configurable)
- **Simplified model:** Follows provided formulas; economic accuracy is secondary to clarity
