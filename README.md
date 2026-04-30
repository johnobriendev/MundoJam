# MundoJam

A platform for discovering and hosting music jam sessions.

## Prerequisites

- **Node.js** v24+ (project was built on v24.14.0)
- **Docker Desktop** (for the PostgreSQL database)

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file and fill in NEXTAUTH_SECRET
cp .env.example .env.local
openssl rand -base64 32   # paste the output as NEXTAUTH_SECRET in .env.local

# 3. Start the database
docker-compose up -d

# 4. Apply database migrations
npx prisma migrate dev

# 5. Seed the database (creates a default admin account)
npx prisma db seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default admin credentials** (created by the seed): `admin@mundojam.com` / `admin123`

## Daily workflow

```bash
docker-compose start   # start the db
npm run dev            # start Next.js on :3000
docker-compose stop    # stop the db when done
```

> **Warning:** Never run `docker-compose down -v` — the `-v` flag destroys the database volume and you will lose all local data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Apply pending migrations (or create a new one) |
| `npx prisma db seed` | Re-run the database seed |
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
