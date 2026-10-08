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

### Design studio scope
The local-first studio explores schematic footprints, expandable levels, visual finish concepts, room programs, and space-planning markers. The 2D plan editor, interactive browser 3D preview, and compatible-device WebXR view are concept visualizations; they do not form a measured, coordinated building-information model.

Selected finishes and building systems affect the concept visuals; stairs, lifts, power, water, ventilation, and controls are study options. Cost, design-fee, labor, and timeline values are speculative model allowances, not researched local rates, bids, or commitments. Downloads are concept notes and schematic artwork—not engineered plans, blueprints, construction documents, specifications, a safety plan, or permit-ready work.

The compliance research workspace offers an allow-listed Census TIGERweb county outline and a human-maintained source register. County geography does not establish parcel boundaries, municipal or ETJ jurisdiction, zoning, permit authority, licensing, site conditions, or code compliance. Notes and search leads require verification against current authoritative sources and review by the appropriate authority and qualified professionals.

The selectable Blueprint Genie persona is a local rules-based prototype. No LLM is connected. The VR session is single-device: invitations, guest participants, shared rooms, and spatial voice chat are not implemented. Specialist role suggestions are not vetted vendors, referrals, labor availability, or a contractor network.

> [!WARNING]
> **Emergency & Planning Disclaimers**
> * **Do not report emergencies**: This system is not monitored for urgent or life-safety events.
> * **Planning aids only**: System models (lifts, stairs, ventilation, structural layouts, hybrid microgrids, solar/storage, water treatment) represent conceptual design studies—not structural calculations, engineering drawings, code compliance checks, or egress approvals.
> * **Professional verification**: Geotechnical, seismic, structural, electrical, and environmental specifications require qualified engineering certification prior to execution.
> * **Worker safety**: Acknowledging a checklist is not evidence of completed reviews or safety controls. No checkbox, estimate, AI concept, or exported file can override missing site data, professional review, permits, or an enforceable worker-safety plan.

## Deferred work and placeholders

Requested capabilities that are not implemented as production features are documented in [`docs/roadmap/`](./docs/roadmap/README.md). These files describe boundaries and planning criteria only; they are not active integrations or commitments:

* [Shared VR and spatial collaboration](./docs/roadmap/multi-user-vr.md)
* [LLM Blueprint Genie integration](./docs/roadmap/ai-collaborator.md)
* [Design-editor and model-fidelity improvements](./docs/roadmap/design-editor.md)
* [Authoritative jurisdiction research](./docs/roadmap/jurisdiction-research.md)
* [Verified professional/vendor network](./docs/roadmap/professional-network.md)

Current application validation requirements and any known release blockers are tracked in the [release validation placeholder](./docs/roadmap/release-validation.md).

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
```

Edit `.env.local` and supply valid, independently generated values for the features you intend to run. The sample values in `.env.example` are placeholders, not credentials. Keep `.env.local` private and out of version control.

### 2. Run locally

```powershell
pnpm dev
```

Open <http://localhost:3000>. Public concept exploration works in the browser. Server-backed inquiry and staff workflows require their documented database, OIDC, encryption, and scheduler configuration. Apply database migrations deliberately to the intended database before using database-backed functionality:

```powershell
pnpm migrate
```

The migration command changes the configured database; review the migration files and verify `DATABASE_URL` before running it.

### 3. Project checks

```powershell
pnpm test
pnpm lint
pnpm exec tsc --noEmit --incremental false
pnpm build
```

Run the applicable checks after changes. A successful build or test suite validates software behavior only; it does not validate a structure, establish code compliance, or provide a safety certification.