# MundoJam

A platform for discovering and hosting music jam sessions.

## Prerequisites

- **Node.js** v24+ (project was built on v24.14.0)
- **Docker Desktop** (for the PostgreSQL database)

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env files
cp .env.example .env          # used by Prisma (prisma.config.ts loads .env)
cp .env.example .env.local    # used by Next.js at runtime

# Generate a secret and set NEXTAUTH_SECRET in both files
openssl rand -base64 32

# 3. Start the database
docker compose up -d

# 4. Apply database migrations
npx prisma migrate dev

# 5. Seed the database (creates a default admin account)
npx prisma db seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default admin credentials** (created by the seed): `admin@mundojam.com` / `admin123`

> **Note:** Two env files are needed because Prisma reads `.env` directly (via `dotenv` in `prisma.config.ts`) while Next.js reads `.env.local`. Keep `DATABASE_URL` and `NEXTAUTH_SECRET` in sync between them.

## Demo / rich seed data

To populate the database with a set of realistic demo users, jams, and RSVPs (useful for UI development and demos):

```bash
# Make sure the database is running and migrations are applied first, then:
npx ts-node -P prisma/tsconfig.json prisma/seed-demo.ts
```

This is additive — it layers demo content on top of the admin account created by `npx prisma db seed`. Run the base seed first if starting fresh.

To reset and reseed from scratch:

```bash
npx prisma migrate reset          # drops all data and re-applies migrations
npx prisma db seed                # recreates the admin account
npx ts-node -P prisma/tsconfig.json prisma/seed-demo.ts
```

## Daily workflow

```bash
docker compose start   # start the db
npm run dev            # start Next.js on :3000
docker compose stop    # stop the db when done
```

> **Warning:** Never run `docker compose down -v` — the `-v` flag destroys the database volume and you will lose all local data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Apply pending migrations (or create a new one) |
| `npx prisma db seed` | Re-run the base seed (admin account) |
| `npx ts-node -P prisma/tsconfig.json prisma/seed-demo.ts` | Seed demo users, jams, and RSVPs |
| `npx prisma migrate reset` | Drop all data and re-apply migrations |
| `npx prisma studio` | Open a visual database browser |

## Environment variables

See [.env.example](.env.example) for all variables with descriptions. The only values you must fill in are `DATABASE_URL` (the default matches docker-compose), `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.

## External services

All third-party integrations are **stubbed in development** — no accounts or API keys are needed unless you explicitly enable them via feature flags in `.env.local`.

| Service | Flag | Stub behavior |
|---------|------|---------------|
| Resend (email) | `USE_REAL_EMAIL=true` | Logs emails to the console |
| Mapbox (geocoding) | `USE_REAL_MAP=true` | Returns Austin, TX coordinates |
| File storage | `USE_REAL_STORAGE=true` | Saves files to `public/uploads/` |
