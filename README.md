# Enter Sanctum SubTerranean Private Construction

> A privacy-focused shelter-planning and inquiry application for a Central Texas carpenter.

The public planner runs entirely in the visitor's browser. Production inquiry intake, staff triage, claim governance, and disclosure-cleared case studies utilize Next.js route handlers and a Neon PostgreSQL database.

---

## Architecture & Privacy Model

### Client-Side Privacy & Storage
* **Local-First Planning**: Prior to explicit submission, planning drafts are encrypted with a passphrase and saved strictly within `localStorage`. Passphrases never touch the server. If site data is cleared or the passphrase is lost, the draft cannot be recovered.
* **Passphrase-Protected Collaboration**: Contact-free JSON and encrypted co-review files are generated directly within the browser. The co-review passphrase must be transferred out-of-band via a separate channel.
* **Zero Form Analytics**: No tracking or input analytics exist for planner fields. Infrastructure providers (hosting, identity, database) handle technical network metadata under their respective terms.
* **Local Hardware & Permissions**:
  * Voice controls rely on native browser Web Speech capabilities, not external AI voice services.
  * Voice input requires explicit runtime opt-in because the browser provider may process audio externally.
  * The `Permissions-Policy` explicitly permits microphone access only for the same-origin voice feature. Camera and geolocation access are disabled.
  * WebXR room preview functions exclusively on compatible browsers paired with a supported VR/AR headset.

### Submission & Server Security
* **Inquiry Intake**: Submissions transfer redacted planning briefs alongside visitor contact details over HTTPS. Payloads are encrypted application-side before persistence to Neon.
* **Ephemeral Confirmation**: Receipt keys and inquiry reference identifiers display on-screen once. The application dispatches no SMS or email notifications.
* **Separation of Sensitive Site Data**: Exact property and site records are barred from the general inquiry pipeline. They reside exclusively in the staff assessment workflow, unlocked only after an executed NDA and encrypted under an isolated encryption key.
* **Runtime CSP Nonces**: A strict, per-request nonce Content Security Policy is enforced by [`proxy.ts`](./proxy.ts). Dynamic server rendering injects nonces directly into authorized script tags.
* **Boundary & Compliance Scope**: The compliance interface pulls county vectors via the U.S. Census Bureau TIGERweb `State_County` layer over an allow-listed internal route. Only county FIPS selections are transmitted; addresses, coordinates, and parcel IDs are excluded.

> [!WARNING]
> **Emergency & Planning Disclaimers**
> * **Do not report emergencies**: This system is not monitored for urgent or life-safety events.
> * **Planning aids only**: System models (lifts, stairs, ventilation, structural layouts, hybrid microgrids, solar/storage, water treatment) represent conceptual design studies—not structural calculations, engineering drawings, code compliance checks, or egress approvals.
> * **Professional verification**: Geotechnical, seismic, structural, electrical, and environmental specifications require qualified engineering certification prior to execution.

---

## Prerequisites

* **Node.js**: `20.9.0` or later
* **Package Manager**: `pnpm` (v9+)
* **Database**: Neon Serverless PostgreSQL instance
* **Workforce Authentication**: OIDC Provider issuing verified email claims with an Auth.js callback endpoint
* **Scheduler**: Vercel Cron or an equivalent runner for daily claim expiration

---

## Getting Started

### 1. Repository Setup & Dependencies

```powershell
pnpm install
Copy-Item .env.example .env.local