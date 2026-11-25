# CMS Deployment Checklist & Migration Notes

## What changed

This repo went from a static Next.js marketing site to a full CMS: PostgreSQL (Prisma)
database, Auth.js v5 credential login with RBAC, and 20 admin modules (dashboard,
homepage builder, courses, instructors, blog, testimonials, FAQs, media library,
banners, landing pages, menus, footer, global settings, contact/newsletter leads,
SEO manager, users & roles, activity logs, version history, global search). The
public site (`app/(site)/*`) now reads its content from the database instead of
`lib/content.ts` / `lib/resources.ts` — those files remain as the seed source and
as a fallback for nav/footer if their CMS tables are ever empty.

## Environment variables

Copy `.env` and fill in for the target environment:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `AUTH_SECRET` | Yes | Random 32+ byte secret. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Yes | The deployed origin, e.g. `https://empowersacademy.com`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Only for seeding | Used once by `prisma/seed.ts` to create the first Super Admin. **Change this password immediately after first login.** |
| `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL` | Only for Media Library | Any S3-compatible provider (AWS S3, Cloudflare R2, Supabase Storage, MinIO). Media upload returns a clear 503 with a setup hint until these are set. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Optional | Can also be set later from Admin → Global Settings, which takes precedence at send-time. |
| `AI_PROVIDER` | Only for AI Features | `claude` (default), `openai`, or `gemini` — selects the provider adapter in `lib/ai/`. |
| `AI_MODEL` | Optional | Overrides the per-provider default model. |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` | Only for AI Features | Only the key matching `AI_PROVIDER` is required. AI endpoints return a clear 503 "not configured" until it's set — everything else in the app works without it. |

## First deploy

```bash
pnpm install
pnpm prisma migrate deploy   # applies prisma/migrations against DATABASE_URL
pnpm db:seed                 # one-time: roles, first Super Admin, migrates existing site copy into the CMS
pnpm build
pnpm start
```

`db:seed` is idempotent (every step upserts on a natural unique key) — safe to
re-run, but there's normally no reason to run it more than once per environment.

## Post-deploy checklist

- [ ] Log in at `/admin/login` with the seeded Super Admin, then immediately change
      that password from Admin → Users & Roles (or create a personal account and
      delete/disable the seed one).
- [ ] Admin → Global Settings: fill in Google Analytics / Meta Pixel / GTM IDs, SMTP
      credentials, and social links — these were left blank by the seed.
- [ ] Configure the `S3_*` env vars before relying on the Media Library; until then
      uploads fail with a clear error rather than silently no-op-ing.
- [ ] Confirm `NEXTAUTH_URL` matches the real deployed origin — Auth.js validates
      callback URLs against it.
- [ ] Rotate `AUTH_SECRET` if it was ever committed or shared; changing it
      invalidates all existing sessions.
- [ ] Vercel/host config: this app needs a persistent Node runtime for `app/api/**`
      (Prisma + bcrypt aren't Edge-compatible) — `middleware.ts` is deliberately
      split into an Edge-safe config (`lib/auth.config.ts`) so only that stays on
      Edge; everything else should run on the default Node runtime.

## Known simplifications (deliberate scope calls, not bugs)

- **Program detail pages** (`/programs/[slug]`) still read from `lib/content.ts`.
  The Course model doesn't yet capture the full rich content those pages show
  (key features, certifications, capstone, career roles, etc.) — extending
  `Course` with a `details Json` field mirroring `ProgramDetails` would close
  this gap. The homepage program cards and the admin Course CMS are fully
  DB-backed today.
- **Homepage/Landing Page section content** is edited as raw JSON in the admin
  Section Editor rather than a bespoke visual form per section type. This was a
  deliberate tradeoff to cover all 12+ section types with one editor instead of
  building 12 custom forms; it's fully functional (validated JSON, live on save)
  but not the friendliest UI for a non-technical editor.
- **Global search / list filters** use case-insensitive `contains` queries, not
  Postgres full-text search (`tsvector`). Fine at current content volume; worth
  revisiting if content grows into the thousands of rows.
- **Rate limiting** on login is a DB-backed per-email/IP counter, not a
  distributed limiter (Redis/Upstash). Fine for a single-instance deploy;
  reconsider if this scales to multiple server instances.
- **Dashboard analytics** (Course Views, Visitor Analytics) are self-hosted
  counters (`CourseView`/`PageView` tables), not a Google Analytics Data API
  integration — nothing calls `/api/public/track-view` yet to populate them from
  real traffic, so those charts will read empty until that tracking call is wired
  into the public pages.
- **Accessibility**: most admin form `<label>` elements aren't yet paired with
  their `<input>` via matching `htmlFor`/`id` (the Course form's Title/Description
  fields are, as the reference pattern). Mechanical, low-risk fix — same change
  repeated across the remaining admin forms.
- **MediaPicker** isn't wired into the Course/Instructor/Blog/Banner forms yet —
  those still take a plain image URL text field. The Media Library itself is
  fully built; swapping those inputs for a picker modal is straightforward.
- **AI Features** (Phase 8) reason entirely over existing CRM/LMS fields via an
  LLM — Student Risk and Placement Readiness are not trained models, since
  there's no attendance/skills-assessment table yet to train one on. Meeting
  Summary works on pasted call notes/transcripts only, not audio/video. There's
  no per-user rate limiting on AI calls beyond RBAC (`ai.create`) — every call
  is logged to `AiRequestLog` for auditing, but a runaway client could still
  rack up provider cost; add a request-count guard before opening this up
  broadly. Until `AI_PROVIDER`'s matching API key is set, every AI endpoint
  returns a 503 rather than failing silently.

## Verifying a deploy

```bash
pnpm test        # vitest — rbac, richtext block<->Tiptap round-trip, revision diffing
pnpm test:e2e     # playwright — auth redirect, login, course CRUD, homepage/resources/program rendering
```

The e2e suite hits a real browser against a running server and a real database —
point `E2E_BASE_URL` at a staging deploy to smoke-test it before promoting to
production.
