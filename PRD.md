# MundoJam PRD

## Context
App is a solid MVP (indigo/gray Tailwind, light-only) targeting Vercel deploy. Two tracks: (1) retheme to a warm neutral palette with dark/light toggle, (2) harden for production.

---

## Part 1: Color Scheme Redesign

**Palette:**
| Token | Light | Dark |
|-------|-------|------|
| bg-base | `#E9E6E7` | `#1c1917` |
| bg-surface | `#ffffff` | `#292524` |
| bg-muted | `#f0eeed` | `#3d3836` |
| text-primary | `#5E5653` | `#E9E6E7` |
| text-secondary | `#7B7F8A` | `#7B7F8A` |
| accent | `#6B7C98` | `#6B7C98` |
| accent-warm | `#AB978C` | `#AB978C` |
| border | `#d4d0d1` | `#3d3836` |

### Steps

1. **`app/globals.css`** — add CSS vars under `:root` (light) and `.dark` (dark), extend `@theme inline` block with `--color-*` tokens mapped to them. Set `color-scheme: light dark`.

2. **Install `next-themes`** — handles SSR flash prevention, localStorage, class toggling on `<html>`.

3. **`app/layout.tsx`** — wrap `<body>` children with `next-themes` `ThemeProvider attribute="class"`.

4. **`components/ThemeToggle.tsx`** (new client component) — button that calls `useTheme()` to toggle; renders sun/moon icon.

5. **`app/(main)/layout.tsx`** — add `<ThemeToggle />` to `<Nav>` (inline as a client island; Nav itself stays server async).

6. **Global find-replace across 9 files (28 occurrences):**
   - `indigo-600` → `accent`
   - `indigo-700` → `accent-hover`
   - `indigo-50` → `bg-muted`
   - `indigo-300` → `border-[var(--border-focus)]`
   - `indigo-500` → `accent`
   - `amber-500/600` → `accent-warm`
   - `bg-white` → `bg-surface`
   - `bg-gray-50` → `bg-muted`
   - `border-gray-200` → `border`
   - `text-gray-900` → `text-primary`
   - `text-gray-500/600` → `text-secondary`

   Keep `green-*` / `red-*` (semantic admin colors).

**Critical files:**
- `app/globals.css`
- `app/layout.tsx`
- `app/(main)/layout.tsx`
- All 9 files with indigo/amber (run `grep -r "indigo\|amber" app --include="*.tsx" -l`)

**Verify:** `npm run dev`, visually check nav, jam cards, forms, admin pages. Toggle dark mode.

---

## Part 2: Production Readiness

### 2a. Security Headers
**File:** `next.config.ts`

Add `headers()` export:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```
CSP: permissive initially (`default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *.mapbox.com`), tighten post-launch.

### 2b. Rate Limiting
**Approach:** In-memory LRU cache (`lru-cache` npm package) applied at the API route level (not middleware — Next.js Edge middleware can't use Node.js modules).

**Files:** `lib/rateLimit.ts` (new util) + applied in:
- `app/api/signup/route.ts`
- `app/api/auth/[...nextauth]/route.ts`

Logic: track `{ count, resetAt }` per IP using `lru-cache` (max 10k entries, 1min TTL). Limit 5 req/min on signup, 10/min on login. Return 429 + `Retry-After` on breach.

**Trade-off:** Each Vercel serverless instance tracks independently (counters don't share across instances). Fine for low traffic; upgrade to Upstash Redis later if needed (Upstash is a managed cloud Redis with a free tier that works on Vercel edge).

### 2c. Real Email (Resend) + Password Reset
**Note:** NextAuth CredentialsProvider has no built-in password reset — must be built manually and requires a real email service. Resend is needed here; `resend` is already in `serverExternalPackages`.

**Email notifications (jam approval, reminders, etc.) are deferred** — not in scope for this plan.

**Resend setup:**
- Create Resend account + verify sending domain (or use Resend's shared `onboarding@resend.dev` for testing)
- Remove `USE_REAL_EMAIL` flag; use Resend unconditionally
- Env vars: `RESEND_API_KEY`, `FROM_EMAIL`

**Password Reset flow:**
Schema: new model `PasswordResetToken { id, email, token, expiresAt }` → migration.

New files:
- `lib/email/sender.ts` — Resend client wrapper (replace console.log stub)
- `lib/email/sendPasswordReset.ts` — generate token (uuidv4, 1hr expiry), persist, send email with link
- `app/(auth)/forgot-password/page.tsx` + server action — accept email; always respond "if account exists, email sent"
- `app/(auth)/reset-password/page.tsx` + server action — validate token not expired, update hashed password, delete token, redirect to login

Modified files:
- `app/(auth)/login/page.tsx` — add "Forgot password?" link

**Email Verification — deferred.** Not blocking for v1; users can browse without it. Add later if spam/abuse becomes an issue.

### 2d. Real Map (Mapbox)
**Scope:** single-pin map on the jam detail page only. No map on the discover/homepage.

**Why:** map loads only trigger when a user clicks into a specific jam, not on every discover page visit. Keeps API usage low. Location-based discovery is handled by the existing city text filter.

**What's needed:**
- `NEXT_PUBLIC_MAPBOX_TOKEN` — public token (`pk.*`) from account.mapbox.com
- Replace `lib/geocoding.ts` stub with real Mapbox Geocoding API call (already structured, just flip `USE_REAL_MAP=true`)
- Remove `JamMap` and `pins` from `app/(main)/page.tsx`; collapse discover page to single-column layout
- New `JamDetailMap` component (single-pin, no `onSelect`): `react-map-gl` wrapper for Mapbox GL JS; must use `dynamic(() => import(...), { ssr: false })` in Next.js
- Add `<JamDetailMap lat={jam.lat} lng={jam.lng} />` below the address block in `app/(main)/jams/[occurrenceId]/page.tsx`

**Free tier:** 50,000 map loads/month. Set a billing alert at 80% in the Mapbox dashboard — no in-app cap needed at this stage.

### 2e. Vercel Deployment
1. Push to GitHub
2. Connect repo to Vercel
3. Add Postgres via Vercel Marketplace (Neon) → auto-sets `DATABASE_URL`
4. Set all env vars in Vercel dashboard
5. Add build command: `prisma migrate deploy && next build` (via `package.json` `build` script)
6. Deploy

---

## Verification

| Check | How |
|-------|-----|
| Colors render | `npm run dev` → visual inspect + dark toggle |
| Dark mode persists | Reload page after toggle |
| Security headers | `curl -I https://<deploy-url>` |
| Rate limit | Hit signup 6x fast → expect 429 |
| Password reset | Forgot pw → check inbox → click link → new pw works |
| Resend | Check Resend dashboard for sent emails |

---

## Unresolved Questions
- Resend domain: need a custom domain for prod `from` address (DNS records in Resend dashboard). Use Resend's shared domain for now; revisit when domain is acquired.

---

## Part 3: Remove SkillLevel

Skill level is too blunt a concept — users can describe their level in the jam description instead.

### Schema (`prisma/schema.prisma`)
- Remove `enum SkillLevel { ... }`
- Remove `skillLevel SkillLevel @default(ALL_LEVELS)` from `User` model
- Run `prisma migrate dev --name remove_skill_level`

### Files to modify

| File | Change |
|------|--------|
| `prisma/seed-demo.ts` | Remove `skillLevel` from all user seeds |
| `lib/users/getMusicians.ts` | Remove `skillLevel` from `MusicianFiltersInput`, `VALID_SKILL`, query `where`, and `select` |
| `lib/users/updateProfile.ts` | Remove `skillLevel` from type definition |
| `lib/users/getUser.ts` | Remove `skillLevel` from both `select` blocks |
| `app/(main)/profile/actions.ts` | Remove `skillLevel` from zod schema, formData parse, validated destructure, and DB update |
| `app/(main)/musicians/page.tsx` | Remove `skillLevel` from search params pass-through |
| `app/(main)/musicians/[id]/page.tsx` | Remove `SKILL_LABELS` const and the skill level badge span |
| `components/profile/ProfileForm.tsx` | Remove `skillLevel` state, the radio button section, and its label |
| `components/musicians/MusicianCard.tsx` | Remove `SKILL_LABELS` const and the skill level badge span |
| `components/musicians/MusicianFilters.tsx` | Remove `skillLevel` state, the `<select>` element, and its inclusion in `hasFilters` |

### Verify
- Musicians page loads — no skill level filter, no skill badge on cards
- Profile edit page — no skill level section
- Musician detail page — no skill badge

---

## Part 4: Dashboard Enhancements

Add a profile sidebar and persistent Vanta Halo background to the logged-in dashboard.

### Layout

**Desktop (`lg:` ≥1024px) — authenticated users only**
```
[Profile sidebar] [Filters + Jams]
     14rem             flex-1
```
Container: `max-w-4xl mx-auto px-4 py-6` → `lg:flex lg:gap-6 lg:items-start`
Profile sidebar: `w-56 shrink-0 sticky top-6`

**Mobile (<1024px):** sidebar hidden (`hidden lg:block`), single-column as today.
**Unauthenticated:** unchanged (hero + single-column).

### New files

**`lib/users/getUserProfile.ts`**
```ts
prisma.user.findUnique({
  where: { id },
  select: { id, name, avatarUrl, city,
    instruments: { select: { instrument: true } } }
})
```

**`components/dashboard/ProfileSidebar.tsx`** (server component)
Sticky card:
- 64px rounded avatar or initial fallback (same pattern as `MusicianCard`)
- Name, city (if set), first 4 instrument tags
- "View profile" → `/musicians/{id}`, "Edit profile" → `/profile`
- Styling: `rounded-lg border bg-surface p-4`

**`components/dashboard/DashboardVanta.tsx`** (client component)
Fixed background halo, auth users only.

Technique: `position: fixed; inset: 0; z-index: -1; pointer-events: none` at `opacity: 0.35`. `backgroundColor` matches `--bg-base` exactly so only the colored glow shows; `bg-surface` cards remain fully opaque and readable.

```ts
{
  backgroundColor: theme === 'dark' ? 0x0f0f13 : 0xf6f3f1,
  baseColor: theme === 'dark' ? 0x7c3aed : 0xc2410c,
  size: isMobile ? 0.45 : 0.75,
  amplitudeFactor: 0.7,
  xOffset: 0,
  yOffset: 0,
}
```
Same init/destroy/re-init + theme/mobile pattern as `components/HeroSection.tsx`.

### Modified files

**`app/(main)/page.tsx`**
- Fetch `getUserProfile(user.id)` when authenticated
- Render `<DashboardVanta />` for auth users (fixed background)
- Auth layout: `max-w-4xl` flex row — `<ProfileSidebar>` + center column
- Unauth layout: unchanged

### Verify
1. Log in → profile sidebar visible on desktop, hidden on mobile
2. Vanta halo glows behind content while scrolling
3. Cards (`bg-surface`) fully readable over halo
4. Log out → hero Vanta shows, dashboard Vanta gone
5. Theme switch → halo color updates (dark=purple, light=orange)
