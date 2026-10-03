# Trio Built Gulf — Admin Panel (CMS + CRM)

The website is now a Next.js **server** application with a PostgreSQL database,
object storage for files, transactional email, and a login-protected admin panel
at `/admin`. Everything the public site shows (services, projects, contact
details, wording, SEO) is editable there, and every website enquiry lands in a
CRM pipeline.

> **Safety net:** the public pages fall back to the original built-in text if the
> database is ever unreachable, so a database problem cannot take the website down.

---

## 1. File / folder structure

```
prisma/
  schema.prisma            database schema (see §2)
  migrations/              SQL migrations (committed)
  seed.ts                  seeds contact settings, services, industries
prisma.config.ts           Prisma 7 config (reads DATABASE_URL)
scripts/
  dev-db.mjs               local Postgres (embedded, no Docker needed)
  create-admin.ts          create/reset an admin user from the command line
  import-site-images.ts    import the site's photos into the media library
src/
  proxy.ts                 gate: no session cookie → /admin/login
  app/
    (site)/                PUBLIC website pages (home, about, services, …)
    admin/
      login/, account/     sign-in, forced password change
      (panel)/             authenticated admin: dashboard, leads, quotations,
                           projects, services, industries, maintenance,
                           testimonials, media, documents, content, seo,
                           users, settings, activity, notifications, search
    api/
      enquiry/             public enquiry form endpoint (validated, rate-limited)
      health/              Railway health check
      cron/maintenance/    follow-up reminders + housekeeping (secret-protected)
      admin/…              attachment download, quotation PDF, media picker feed
      files/               signed-URL file server (local development only)
    media/[...key]/        serves PUBLIC media only
    documents/[slug]/      serves PUBLIC documents only
    sitemap.ts, robots.ts  generated from the database
  components/              public components + components/admin/* (admin UI kit)
  lib/                     shared, client-safe helpers and the original static content
  server/                  server-only code
    auth/                  passwords (scrypt), sessions, permissions, guards
    content/               CMS read layer (cached), defaults, SEO helper
    leads/, quotations/    CRM logic, PDF generation
    email/                 Resend client + branded templates
    storage/               object storage (S3 driver, local driver)
    media/, uploads.ts     image processing, upload validation
    settings.ts, audit.ts, ratelimit.ts, notifications.ts, db.ts
docs/ADMIN.md              this document
```

## 2. Database schema

PostgreSQL via Prisma. Relations use foreign keys with indexes on every lookup
column; files are **never** stored in the database (only metadata + storage key).

| Area | Tables |
| --- | --- |
| Access | `User` (role + extra permissions), `Session`, `RateLimit`, `AuditLog`, `Notification` |
| CRM | `Lead`, `LeadAttachment`, `LeadNote`, `LeadActivity`, `FollowUp` |
| Quotations | `Quotation`, `QuotationItem` |
| Content | `Service`, `ServiceFeature`, `ServiceImage`, `Industry`, `Project`, `ProjectImage`, `Testimonial` |
| Site | `ContentBlock`, `Page`, `SeoMetadata`, `Setting` |
| Files | `Media`, `Document` |

Enums: `Role` (SUPER_ADMIN, ADMIN, SALES, PROJECT_MANAGER, CONTENT_MANAGER, VIEWER),
`LeadStatus` (NEW → CONTACTED → SITE_VISIT → QUOTATION_SENT → NEGOTIATION → WON / LOST),
`LeadType`, `QuotationStatus`, `ProjectStatus`, `MediaCategory`, `DocumentType`.

Permissions are granular codes (`lead:edit`, `quote:send`, `service:manage`, …)
defined in `src/server/auth/permissions.ts`. Each role is a bundle of permissions,
and a user can be given **extra** individual permissions in *Users → edit*.

## 3. Environment variables

See `.env.example`. Required in production:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SITE_URL` | `https://triobuiltgulf.ae` (emails, canonical URLs) |
| `AUTH_SECRET` | 32+ random characters |
| `CRON_SECRET` | secret for the scheduled maintenance endpoint |
| `RESEND_API_KEY`, `EMAIL_FROM_SALES`, `EMAIL_FROM_INFO` | email (§8) |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | file storage (§9) |

Secrets live only in Railway variables / your local `.env` (git-ignored) and are
read on the server. Nothing secret is ever sent to the browser.

## 4. Local setup

```bash
npm install
npm run db:dev            # terminal 1 — starts a local Postgres (keep running)
npm run db:migrate        # terminal 2 — creates the tables
npm run db:seed           # contact settings, services, industries
npm run db:seed:media     # imports the site photos into the media library
npm run admin:create -- --email you@triobuiltgulf.ae --name "Your Name"
npm run dev               # http://localhost:3000   (admin: /admin)
```

Without `S3_*` set, uploads are kept in `.data/uploads`; without `RESEND_API_KEY`
emails are printed in the terminal instead of being sent.

## 5. Migration commands

| Command | When |
| --- | --- |
| `npm run db:migrate` | development: apply/create migrations after editing `schema.prisma` |
| `npm run db:deploy` | production: apply committed migrations (Railway runs this before each deploy) |
| `npm run db:studio` | browse the data in a local GUI |
| `npm run db:setup` | first-time production setup: migrate + seed + media import |

## 6. Admin login setup

```bash
npm run admin:create -- --email owner@triobuiltgulf.ae --name "Owner Name"
```

A strong temporary password is generated and **shown once**; the user must choose
their own at first sign-in. To create a user with a chosen password, set
`ADMIN_PASSWORD` for that one command. Add colleagues later in **Users → New user**
(choose a role; permissions can be refined per user). Reset a password from the
same screen — all of that user's sessions are signed out.

Roles at a glance: **Super Admin / Admin** everything · **Sales** leads, follow-ups,
notes, quotations · **Project Manager** projects + media · **Content Manager**
services, projects, media, documents, testimonials, website content, SEO ·
**Viewer** read-only.

## 7. Production deployment (Railway)

1. **Add Postgres** to the Railway project (*New → Database → PostgreSQL*).
2. **Add a bucket** (*New → Bucket*, or use Cloudflare R2) and copy its S3 credentials (§9).
3. On the web service, **set the variables** from §3. For the database use a
   reference: `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (private network).
4. `railway.json` is already configured: it builds with `npm run build`, runs
   `prisma migrate deploy` **before** every deploy, starts with `npm start` and
   health-checks `/api/health/`.
5. **First-time data** (run once from your computer, with the Railway CLI linked):
   ```bash
   railway run npm run db:setup
   railway run npm run admin:create -- --email owner@triobuiltgulf.ae --name "Owner Name"
   ```
6. **Schedule the maintenance job** (follow-up reminders, expiring quotations,
   housekeeping) every 15 minutes — a Railway *Cron* service, or any scheduler:
   ```bash
   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://triobuiltgulf.ae/api/cron/maintenance/
   ```
7. Open `https://triobuiltgulf.ae/admin/` and sign in.
8. The old GitHub Pages workflow was removed (the site is no longer a static export);
   disable Pages in the repository settings.

**Rollback:** Railway → service → *Deployments* → redeploy the previous successful
deployment. Migrations are additive; never edit a committed migration — add a new one.

## 8. Email setup (Resend)

1. Create a Resend account and **add the domain `triobuiltgulf.ae`**.
2. Add the DNS records Resend shows (SPF, DKIM, optionally DMARC) in Hostinger DNS.
   They do not affect the website records. Wait until the domain shows *Verified*.
3. Create an API key → `RESEND_API_KEY` in Railway.
4. Set `EMAIL_FROM_SALES` (e.g. `Trio Built Gulf <sales@triobuiltgulf.ae>`) and
   `EMAIL_FROM_INFO`. Make sure those mailboxes exist or forward somewhere.
5. In **Admin → Settings** set *Email new enquiries to* (one or more addresses).

Emails sent: new-enquiry notification (to your team), customer acknowledgement,
quotation (PDF attached), quotation accepted/rejected notice, follow-up reminder,
new-user notice. Templates: `src/server/email/templates.ts`.

## 9. File storage setup

Any S3-compatible bucket works. Set the six `S3_*` variables.

| Provider | `S3_ENDPOINT` | `S3_REGION` | `S3_FORCE_PATH_STYLE` |
| --- | --- | --- | --- |
| Railway Bucket | the endpoint shown on the bucket | `auto` | `true` |
| Cloudflare R2 | `https://<account>.r2.cloudflarestorage.com` | `auto` | `true` |
| AWS S3 | (empty) | e.g. `me-central-1` | `false` |

Keep the bucket **private**. Public photos are served through the site
(`/media/…`), so the bucket never needs public access. Private files (enquiry
attachments, certificates, licences) are only reachable through signed URLs
that expire in 5–10 minutes.

## 10. Security checklist

- [x] Passwords hashed with **scrypt** (N=2¹⁷), salted; policy enforced server-side; forced change on first login
- [x] Sessions: random 256-bit token, only its SHA-256 stored; `HttpOnly`, `SameSite=Lax`, `Secure` + `__Host-` prefix in production; 7-day sliding expiry; revoked on password change / role change / deactivation
- [x] **Login rate limiting** (per email and per IP) with generic error messages and constant-time comparison for unknown users
- [x] **Role-based authorisation** checked on every page *and* every Server Action / API route (never UI-only)
- [x] **Server-side validation** (zod) for every form; the browser is never trusted
- [x] **CSRF**: Server Actions use Next's origin check; cookie-authenticated route handlers verify `Origin`; public form endpoint is origin-checked and rate-limited, with a honeypot
- [x] **Uploads**: type detected from file bytes (not the browser's claim), extension cross-checked, size/count limits, filenames sanitised, images re-encoded (strips EXIF/GPS), SVG/HTML/scripts never accepted
- [x] Private files in a private bucket; **signed, expiring URLs**; keys never guessable; public routes serve only items explicitly marked public
- [x] **Audit log** of sign-ins (incl. failures), creates/updates/deletes, status changes, uploads/downloads, user changes — with IP and device
- [x] Secrets only in environment variables; none in client code
- [x] Security headers (`nosniff`, frame, referrer, HSTS, permissions policy); admin and APIs are `noindex`, `no-store`, and disallowed in `robots.txt`
- [x] SQL injection: all queries go through Prisma (parameterised)
- [x] HTML emails escape every dynamic value
- [ ] **Before launch:** set a strong `AUTH_SECRET`/`CRON_SECRET`, verify the Resend domain, confirm the bucket is private, change the first admin password, and test an enquiry end to end
- [ ] Optional: add two-factor authentication (not included), restrict `/admin` by IP at your CDN if required

## Day-to-day use

| I want to… | Go to |
| --- | --- |
| See new enquiries | **Leads** (table or *Pipeline* board) |
| Respond to an enquiry | open it → assign → follow-up → *Create quotation* → send → mark Won |
| Change phone / email / address / WhatsApp | **Settings** (updates the whole site) |
| Edit wording (home hero, About, Why Us, …) | **Website content** |
| Publish a project | **Projects → New project** (tick *Published*) |
| Add or edit a service page | **Services** |
| Upload the company profile PDF | **Documents** (type *Company Profile*, tick *Public*) |
| Control Google titles / descriptions | **SEO** |
| Add a team member | **Users** |
