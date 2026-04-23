# MundoJam — Build Plan

## What We're Building

A social platform for musicians to discover and host jam sessions worldwide. Users find jams on a map, RSVP, follow other musicians, browse a musician directory, and submit their own jams for admin approval.

---

## Prerequisites

The human has installed Docker Desktop. That is the only external requirement. Everything runs locally — no accounts, no external services.

---

## Stack

- **Framework:** Next.js 14+ App Router, TypeScript throughout
- **Database:** PostgreSQL with PostGIS extension, running in Docker
- **ORM:** Prisma
- **Auth:** NextAuth.js with Credentials provider (email + password stored in local DB)
- **Styling:** Tailwind CSS
- **Forms:** react-hook-form + zod
- **Date handling:** date-fns

---

## Local-Only Architecture

All external services are stubbed so the app runs entirely offline. Each stub checks an environment variable flag — swapping in a real service later is a config change only, no code changes needed.

| Concern | Local approach | Flag to enable real service later |
|---|---|---|
| Map | Placeholder component showing jam list | `USE_REAL_MAP=true` + `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Email | Console.log to terminal | `USE_REAL_EMAIL=true` + `RESEND_API_KEY` |
| File storage | Local filesystem at `/public/uploads/` | `USE_REAL_STORAGE=true` |
| Background jobs | Dev API routes, callable in browser | Replace with Trigger.dev cron jobs |
| Database | Docker container with named volume | Swap `DATABASE_URL` to Supabase |

The Docker container uses a named volume so data persists when the container is stopped and restarted. Daily workflow: `docker-compose start` then `npm run dev`. Stop with `docker-compose stop` — never `down -v` which wipes data.

---

## Data Model

### User
id, email, password (hashed), name, avatarUrl, bio, city, lat, lng, isDiscoverable (bool), role (USER | ADMIN), skillLevel (BEGINNER | INTERMEDIATE | ADVANCED | ALL_LEVELS)

Relations: instruments (join), genres (join), hostedJams, rsvps, comments, followers, following, adminActions

### Jam (the series)
id, title, description, coverImageUrl, hostId, address, city, lat, lng, recurrenceType (ONE_TIME | WEEKLY | MONTHLY), startDate, endDate (nullable), status (PENDING | APPROVED | REJECTED | CANCELLED), rejectionReason (nullable), resubmittedFromId (nullable)

Relations: genres (join), instrumentsNeeded (join), equipment (join with optional notes field per item), occurrences

### JamOccurrence (each individual date instance)
id, jamId, date, cancelled (bool)

Relations: rsvps, comments

### RSVP
userId, occurrenceId, status (GOING | INTERESTED)

### Comment
id, userId, occurrenceId, body, parentId (nullable — one level of replies only)

### Follow
followerId, followingId

### Report
id, reporterId, targetType (JAM | COMMENT | USER), targetId, reason, status (OPEN | RESOLVED)

### AdminAction (audit log)
id, adminId, actionType, targetType, targetId, note

NextAuth also requires Account, Session, and VerificationToken models — add these per the NextAuth Prisma adapter documentation.

---

## Predefined Constants

Store as typed const arrays in `constants/`. Used for multi-select fields throughout the app. Each list includes "Other" as the final option which unlocks a freeform text input.

- **Instruments:** Guitar, Bass, Drums, Keys / Piano, Vocals, Saxophone, Trumpet, Trombone, Violin, Cello, Harmonica, Flute, Clarinet, Ukulele, Banjo, Mandolin, Pedal Steel, Synthesizer, DJ / Turntables, Percussion, Harp, Other
- **Genres:** Blues, Jazz, Rock, Funk, Soul, R&B, Country, Folk, Bluegrass, Classical, Latin, Reggae, Hip-Hop, Electronic, Metal, Punk, Indie, Pop, Gospel, Experimental, Other
- **Equipment:** Drum kit, Bass amp, Guitar amp, Keyboard / Piano, PA system, Microphones, Monitor speakers, DI boxes, Mixing desk, Recording setup, Other

---

## Folder Structure

```
mundojam/
├── app/
│   ├── (auth)/login/ and signup/
│   ├── (main)/
│   │   ├── layout.tsx                  # Nav, session provider
│   │   ├── page.tsx                    # Discover — map + jam list
│   │   ├── following/page.tsx          # Friends activity feed
│   │   ├── musicians/page.tsx          # Musician directory
│   │   ├── musicians/[id]/page.tsx     # Musician profile
│   │   ├── jams/new/page.tsx           # Submit a jam
│   │   ├── jams/[occurrenceId]/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                  # Role guard
│   │   ├── page.tsx                    # Pending jam queue
│   │   ├── jams/[id]/page.tsx
│   │   ├── users/page.tsx
│   │   ├── reports/page.tsx
│   │   └── audit/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/ and signup/
│       ├── jams/ (create, approve, reject)
│       ├── occurrences/[id]/rsvp/ and comments/
│       ├── users/[id]/follow/ and report/
│       ├── upload/
│       └── dev/generate-occurrences/ and send-reminders/
├── components/
│   ├── map/JamMap.tsx
│   ├── jams/ (JamCard, JamFilters, JamForm, EquipmentBadges)
│   ├── comments/ (CommentThread, CommentForm)
│   ├── musicians/ (MusicianCard, MusicianFilters)
│   ├── ui/ (shared primitives)
│   └── admin/ (PendingJamCard, AuditLog)
├── lib/
│   ├── prisma.ts                       # Prisma singleton
│   ├── session.ts                      # getCurrentUser, requireUser, requireAdmin
│   ├── auth.ts                         # NextAuth config
│   ├── storage.ts                      # Upload stub + real implementation
│   ├── geocoding.ts                    # Geocoding stub + real implementation
│   ├── email/sender.ts and templates.ts
│   ├── jams/ (createJam, approveJam, rejectJam, getJams)
│   ├── occurrences/generateOccurrences.ts
│   ├── users/ (getUser, followUser, getFollowingFeed)
│   ├── comments/createComment.ts
│   └── jobs/sendReminders.ts
├── constants/ (instruments, genres, equipment)
├── types/index.ts
├── prisma/schema.prisma and seed.ts
├── public/uploads/                     # Gitignored
├── docker-compose.yml
├── middleware.ts
└── .env.local
```

---

## Key Logic Notes

**Occurrence generation:** Recurring jams generate individual JamOccurrence rows up to the end of next calendar month. Use `upsert` so the job is idempotent — running it multiple times never creates duplicates. ONE_TIME jams generate a single occurrence immediately on approval. The nightly job only processes WEEKLY and MONTHLY jams.

**Geospatial queries:** Use PostGIS `ST_DWithin` for radius-based jam discovery. Add spatial indexes on `jams(lat, lng)` and `users(lat, lng)` using `GIST`. Use `prisma.$queryRaw` for these queries since Prisma does not support PostGIS natively.

**Geocoding stub:** When no Mapbox token is present, return a hardcoded coordinate so city search and the jam form work correctly during development.

**Following feed:** Query occurrences where the host OR any GOING RSVP belongs to someone the current user follows.

**Resubmit flow:** When a jam is rejected, the email includes a link to `/jams/new?resubmitFrom=[jamId]`. The form reads this param and pre-fills all fields from the original rejected jam. Resubmitting creates a new Jam record in PENDING status.

**Admin seeding:** Seed one admin user on first run (`admin@mundojam.com` / `admin123`). The seed script uses upsert.

---

## Page Specs

**`/` Discover:** Map component (placeholder in dev) plus a scrollable list of upcoming approved occurrences. Filters: genre, instruments needed, equipment provided, recurrence type, date range, city search. Unauthenticated users can browse; RSVP requires auth.

**`/following`** (auth required)**:** Upcoming occurrences from people the current user follows — either as host or GOING RSVP. Sorted by date ascending. Empty state if no follows.

**`/musicians`** (auth required)**:** Directory of users with `isDiscoverable = true`. Filters: city (geocoded radius), instruments, genres, skill level.

**`/musicians/[id]`:** Public profile. Shows instruments, genres, skill level, city, bio. Upcoming jams they're hosting or attending (GOING). Follow / Unfollow button for authenticated users. Page exists even if `isDiscoverable = false` but does not appear in search results.

**`/jams/new`** (auth required)**:** Cover image upload, address with geocoding, genre tags, instruments needed, equipment provided (each item has an optional notes field), recurrence type, start date, optional end date for recurring jams. Submits as PENDING. Pre-fills from a rejected jam if `?resubmitFrom` param present.

**`/jams/[occurrenceId]`:** Server-rendered. Cover image, date, address, host snippet, genres, instruments, equipment with notes, RSVP buttons (Going / Interested), RSVP count, comment thread with one level of replies, report button.

**`/profile`** (auth required)**:** Edit name, avatar, bio, city, instruments, genres, skill level. Toggle `isDiscoverable`.

**`/admin`** (admin only)**:** Pending jam queue, oldest first. Inline approve or open reject modal per row.

**`/admin/jams/[id]`:** Full jam detail, map pin preview, approve and reject actions.

**`/admin/users`:** User list, ability to change role or suspend.

**`/admin/reports`:** Open reports with resolve action.

**`/admin/audit`:** AdminAction log, read only.

---

## Build Order

Complete each phase and manually test it before moving to the next. Commit after each phase.

1. **Project setup** — Next.js app, Docker compose file, `.env.local`, start DB, Prisma schema, run migrations, enable PostGIS, add spatial indexes, generate client, seed admin user
2. **Auth** — NextAuth config, API routes, signup route, session helpers, middleware, admin layout guard, login and signup pages
3. **Stubs and constants** — predefined constant files, email logger, local storage, geocoding stub, map placeholder, dev job routes
4. **Jam submission** — createJam business logic, upload API route, JamForm component, submit page
5. **Admin approval** — approveJam and rejectJam logic, approve/reject API routes, admin queue page, jam review page
6. **Occurrences and homepage** — generateOccurrences logic, trigger via dev route, getJams query, homepage with map placeholder and jam list
7. **Jam detail** — occurrence page, RSVP API, comment API, CommentThread component
8. **Filters** — JamFilters component wired to homepage via URL search params, city search using geocoding stub
9. **Profiles and directory** — edit profile page, musician directory, musician profile page, discoverability toggle
10. **Follow system and feed** — follow/unfollow API, following feed query, follow button on profiles, following page
11. **Reminders and resubmit** — sendReminders job, dev route, resubmit pre-fill flow
12. **Reports and admin polish** — report API, reports page, users page, audit log page

---

## Rules

- All database calls go in `lib/`. API routes only handle HTTP — parse request, call one lib function, return response.
- Never store file data in the database. Store only the URL string returned from `lib/storage.ts`.
- `isDiscoverable = false` must be enforced at the Prisma query level, never filtered client-side.
- Admin role must be verified server-side in every admin API route via `requireAdmin()`. The layout guard alone is not enough.
- Occurrence generation must use `upsert` to be idempotent.
- Stubs check environment variable flags, not `NODE_ENV`. This means real services can be enabled without code changes.
- All dates are stored as UTC. Format for display using date-fns on the client in the viewer's local timezone.
- `/public/uploads/` and `.env.local` are gitignored.
- Never run `docker-compose down -v` — this deletes the database volume and all data.

---

## Future Plans (Post-Local Build)

This section is for context only — do not implement any of this during the local build.

### Step 1 — Add real services (no code changes required)

Each stub was designed so that enabling the real service is purely a configuration change. In order:

1. **Mapbox** — create account at mapbox.com, add `NEXT_PUBLIC_MAPBOX_TOKEN` to env, set `USE_REAL_MAP=true`. The real map component is already written inside `JamMap.tsx`, just dormant.
2. **Resend** — create account at resend.com, add `RESEND_API_KEY` to env, set `USE_REAL_EMAIL=true`. Emails will start sending instead of logging to the terminal.
3. **Supabase Storage** — create a Supabase project, create two public buckets (`avatars` and `jam-covers`), add Supabase env vars, set `USE_REAL_STORAGE=true`. Implement the Supabase branch inside `lib/storage.ts`.
4. **Trigger.dev** — create account at trigger.dev, create job files that call the existing `generateOccurrences()` and `sendReminders()` functions which are already fully tested. The dev routes can stay in place and just become unused.

### Step 2 — Migrate the database to Supabase

1. Create a Supabase project and grab the connection strings
2. Run `prisma migrate deploy` against the Supabase database — all migrations that ran locally will be replayed in order
3. Enable the PostGIS extension in the Supabase dashboard (SQL editor: `CREATE EXTENSION IF NOT EXISTS postgis`)
4. Swap `DATABASE_URL` and `DIRECT_URL` in env to point at Supabase
5. Re-run the seed script to create the admin user in the cloud database

### Step 3 — Swap auth to Supabase Auth (optional)

NextAuth with Credentials works fine in production. Only migrate to Supabase Auth if social login (Google, Facebook, Apple) becomes a priority — musicians signing up with social accounts reduces friction significantly. The swap requires updating `lib/auth.ts` and `lib/session.ts`. The rest of the app is unaffected because all auth is accessed through those two files.

### Step 4 — Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add all environment variables in the Vercel dashboard
4. Deploy — Next.js on Vercel requires zero additional configuration

### Step 5 — Monetisation options (when ready)

No monetisation is planned for the initial launch. When the time comes the most natural options for this platform are:

- **Featured jam listings** — hosts pay a small fee to appear at the top of search results or highlighted on the map. Directly tied to value, low friction.
- **Verified host badge** — a paid monthly subscription for frequent hosts. Unlocks auto-approval (bypasses the admin queue after a trust threshold), a badge on their profile and jam listings, and richer jam page options.
- **Auto-approval threshold** — before any paid tier, consider auto-approving jams from hosts who have had five or more jams approved with no reports. This reduces admin workload and rewards good actors without any payment required.
- **Partner venues** — local music stores, studios, and venues pay to be listed as official MundoJam partner locations. Jams hosted at partner venues get a venue badge.

Avoid ads. They degrade the experience and earn almost nothing at early scale.

### Step 6 — PWA and mobile

Add a `manifest.json` and service worker to make the app installable on mobile as a PWA. This is the lowest-effort path to a mobile presence before committing to a native app. Key things to make work well on mobile: the map interaction, the jam submission form, and RSVP buttons.

A native iOS or Android app is a longer term consideration, only worth pursuing once there is an established user base and clear demand.

### Infrastructure scaling path

The local stack scales further than it might seem. The Supabase free tier handles thousands of users comfortably. When growth requires it, the additions are incremental — a read replica and PgBouncer connection pooling (both available in Supabase) handle significant scale without any application code changes. A caching layer (Redis via Upstash, which has a free tier) would be the next step after that for frequently read data like the homepage jam list.
