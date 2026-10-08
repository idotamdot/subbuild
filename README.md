# Enter Sanctum SubTerranean Private Construction

A privacy-focused shelter-planning and inquiry application for a Central Texas carpenter. The public planner runs in the visitor's browser; production inquiry intake, staff triage, claim governance, and disclosure-cleared case studies use Next.js route handlers and a Neon PostgreSQL database.

## What is and is not private

- Before a visitor explicitly submits a consultation request, planning drafts are encrypted with a passphrase and saved only in that browser's `localStorage`. The passphrase is not sent to the server. Clearing site data or losing the passphrase makes that local draft unrecoverable.
- Contact-free JSON and encrypted co-review files are generated in the browser. The co-review passphrase must be sent to the other person through a separate channel.
- Submitting a consultation request sends the redacted planning brief and the contact fields the visitor entered to this application's server. The server encrypts the payload before storing it in Neon. An inquiry reference and one-time receipt key are shown on-screen only; the site does not send email or text messages.
- Staff authentication is required for consultant and content-administrator pages and APIs. There is no customer account or sign-in requirement for private planning. To preview the staff screens locally before configuring OIDC, set `DEV_AUTH_BYPASS=true` in `.env.local`; this grants a local administrator identity only when Next.js is running with `NODE_ENV=development`. The bypass is ignored in production builds and deployments.
- Exact property/site details belong only in the separate staff assessment workflow after an executed NDA. They are encrypted with a dedicated key and are not added to the general inquiry brief.
- This application has no analytics for planner inputs. Hosting providers, identity providers, and database providers still process the technical data described by their own terms.
- The public design studio's footprint, level, room, finish, stair, lift, power, water, air, computerized-controls, collaborator, and local prompt controls run in the browser; no LLM provider, invitation, shared multi-user room, or remote collaboration is connected. Stair concepts include switchback, straight-run, and spiral-feature studies; lift concepts include machine-room-less regenerative elevator, hydraulic passenger lift, and vertical platform lift. Building-system studies include grid resilience, solar/storage, hybrid microgrids, water treatment and reuse, monitored or redundant ventilation, filtration/heat recovery, and automation with manual-ready or integrated resilience controls. These are visual comparisons and unsourced planning allowances—not code-compliance, egress, accessibility, equipment, or safety determinations. The application does not calculate seismic demands, structural capacity, energy yield, potable-water quality, airflow, or system performance. Site-specific geotechnical/seismic review, material weight and capacity analysis, licensed structural design, water testing, mechanical engineering, controls cybersecurity, manual fallbacks, and life-safety review are essential. Regenerative drives, remote diagnostics, emergency communications, backup-power interfaces, and other technology selections are prompts for qualified specialist review, not verified products or promises of compatibility. On-site power is not guaranteed to be self-sufficient; treated water is not guaranteed potable; a lift is not assumed to replace required stairs. Its downloaded Markdown spec sheet and SVG section are conceptual discussion aids—not blueprints, engineering documents, bids, safety plans, or construction instructions. Cost, labor, and timeline figures are explicitly speculative assumptions, not researched local quotes. The room preview can enter immersive WebXR only in a compatible browser with a supported headset; pointing controls work in the headset and the screen walkthrough remains available otherwise.
- The local voice and speech controls are optional browser capabilities, not an AI voice service. Spoken output uses the device's browser speech synthesis. Voice input requires an explicit acknowledgement because the browser's speech-recognition provider may process audio outside the device; text planning prompts are never sent to an AI provider by this implementation.
- The Permissions-Policy permits microphone use only by this same-origin page for the user-initiated, acknowledged browser voice-input feature. Camera and geolocation access remain disabled.
- The compliance workspace retrieves a user-selected county outline from the U.S. Census Bureau TIGERweb current State_County layer through an allow-listed server route. It sends only a Central Texas county selection/FIPS to Census; it does not accept an address, parcel, or coordinates. County boundaries do not determine municipal limits, ETJs, parcel zoning, permits, or licensing. Human-in-the-loop source searches open only on click; source notes stay in page memory and can be exported by the user. No autonomous regulatory AI or jurisdictional compliance determination is connected.
- A per-request nonce-based Content Security Policy is applied by [proxy.ts](./proxy.ts); production script execution is restricted to same-origin nonce-authorized scripts. The root layout waits for each request so Next.js can inject the matching nonce during dynamic rendering.

Do not use this application to communicate emergencies. Do not enter highly sensitive property or security details in the public planner or inquiry form.

## Requirements

- Node.js 20.9 or later
- pnpm 9 or later
- A Neon PostgreSQL database for inquiry intake and staff content
- For staff sign-in: an OIDC provider with verified email claims and an Auth.js callback configured
- A Vercel project for the included daily claim-expiry cron, or an equivalent scheduler that calls the protected route

## Local development

```powershell
pnpm install
Copy-Item .env.example .env.local
```

Edit `.env.local` before using server features. Generate independent random secrets and encryption keys; for example, in PowerShell:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use a different generated value for every secret. `INQUIRY_ENCRYPTION_KEY` and `SITE_ASSESSMENT_ENCRYPTION_KEY` must each be a base64 encoding of exactly 32 random bytes. `AUTH_SECRET`, `REFERENCE_KEY_HMAC_SECRET`, `RATE_LIMIT_HMAC_KEY`, and `CRON_SECRET` must also be independently generated and kept private. Never commit `.env.local` or place real secrets in `.env.example`.

Set `DATABASE_URL` to the Neon connection string, then apply database migrations before starting the application:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
pnpm migrate
pnpm dev
```

The migration runner applies ordered SQL files from `database/migrations/` and records completed files in `schema_migrations`. Migrations are not run automatically during `next build` or deployment. Run them deliberately against the intended database before deploying code that depends on a schema change. Do not run them against production until the database, backup, and change window have been confirmed.

Open <http://localhost:3000>.

## Required environment variables

See [.env.example](./.env.example) for placeholder values. Configure these in `.env.local` for local server features and in **Vercel → Project → Settings → Environment Variables** for each relevant deployment environment.

| Variable | Required for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Inquiry intake, staff queue, claims, case studies | Neon PostgreSQL connection string. Use the provider's pooled connection string for the serverless runtime. |
| `INQUIRY_ENCRYPTION_KEY` | Inquiry intake and staff decryption | Base64-encoded 32 random bytes. Changing it makes existing inquiry payloads unreadable. |
| `SITE_ASSESSMENT_ENCRYPTION_KEY` | NDA-gated site assessments | A separate base64-encoded 32 random bytes. Changing it makes existing assessment payloads unreadable. |
| `REFERENCE_KEY_HMAC_SECRET` | Intake and one-time receipt check-in | Independent random secret; required by both routes. |
| `RATE_LIMIT_HMAC_KEY` | Inquiry rate limiting | Independent random secret used to digest network identifiers. |
| `AUTH_SECRET` | Workforce authentication | Auth.js signing/encryption secret. |
| `AUTH_OIDC_ISSUER` | Workforce authentication | Exact issuer URL from the OIDC identity provider. |
| `AUTH_OIDC_CLIENT_ID` | Workforce authentication | OIDC client ID. |
| `AUTH_OIDC_CLIENT_SECRET` | Workforce authentication | OIDC client secret. |
| `ADMIN_EMAILS` | Administrator access | Comma-separated, verified email addresses. Admins can assign inquiries and govern content. |
| `CONSULTANT_EMAILS` | Consultant access | Comma-separated, verified email addresses. Consultants see only inquiries assigned to their email. |
| `CRON_SECRET` | Scheduled claim expiry | Independent random secret. Vercel provides this to the configured cron request as a bearer token. |
| `AUTH_OIDC_PROVIDER_NAME` | Sign-in page label | Optional display name; defaults to “Organization sign-in”. |

Staff sign-in is intentionally unavailable until the OIDC variables, `AUTH_SECRET`, and at least one staff email allowlist are configured. In the OIDC provider, register the callback URL as `https://YOUR_DOMAIN/api/auth/callback/workforce-oidc` (for local development, `http://localhost:3000/api/auth/callback/workforce-oidc`). Use the exact issuer supplied by that provider and require verified email addresses.

## Database migrations

Migrations are in `database/migrations/` and run with:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
pnpm migrate
```

The runner skips filenames already recorded in `schema_migrations`. Keep migrations additive and safe to retry if an interrupted migration leaves partial DDL changes. Review each SQL file before applying it. The database schema contains encrypted inquiry and site-assessment payloads, PII-free routing/status fields, inquiry rate limits, technical claim evidence, case studies, and sanitized image assets.

## Deployment to Vercel and Neon

1. Create the Neon database and a Vercel project. Store the pooled Neon connection string and all production secrets in the Vercel **Production** environment; add separate values for Preview only if Preview should process real data. Do not use production encryption keys in local or preview environments.
2. Apply the migrations to the intended Neon database from a trusted operator environment using `pnpm migrate`. Confirm the migration output before deploying.
3. Configure the OIDC application callback for the deployed domain at `https://YOUR_DOMAIN/api/auth/callback/workforce-oidc`; set the issuer, client credentials, `AUTH_SECRET`, and exact administrator/consultant email allowlists.
4. Set `CRON_SECRET` and deploy. `vercel.json` schedules `/api/cron/review-stale-claims` daily. The endpoint rejects requests without the matching bearer secret, unpublishes claims whose expiry has passed, and changes them to `under_review`.
5. Verify the deployment with a staff sign-in, a test inquiry, staff assignment and queue visibility, receipt check-in, claim publication/expiry behavior, and image upload/publishing checks. Use non-sensitive test data first.
6. Configure retention, backups, access reviews, and incident response for the business before accepting real inquiries. The application does not currently delete inquiry records automatically.

Do not describe the application as deployed or production-verified until these steps have been completed against the actual Vercel, Neon, and OIDC configuration. No real provider credentials or production identifiers are included in this repository.

## Staff workflows

- `/staff` is the authenticated consultant queue. Consultants can view only inquiries assigned to their verified staff email; administrators can view and assign inquiries to allowlisted staff.
- `/staff/content` is administrator-only content governance. Public claims require a reviewer, a review date, and a future expiry date. Expired claims are excluded from public retrieval immediately and the daily cron moves them to `under_review`.
- Public case studies appear only after disclosure clearance and sanitized-image checks. Uploaded JPEG, PNG, or WebP images are re-encoded to WebP by Sharp before storage.
- The assigned consultant or administrator can create/view a separate site assessment only after confirming an executed NDA and recording its reference. The NDA itself must be executed and retained through the business's approved offline process; checking the box is an attestation, not an agreement-signing service.

## Validation

```powershell
pnpm test
pnpm lint
pnpm build
```

The technical diagrams, comparison content, and feasibility screen are planning aids only—not engineered recommendations, construction drawings, code interpretations, permitting advice, property determinations, or safety guarantees. Project-specific design and technical claims must be reviewed by appropriately qualified professionals.
