# Community Blueprint Genie

> A community-planning application concept for preparing safer places and support plans for catastrophes.

Community Blueprint Genie is evolving from a subterranean shelter-design prototype into a broader tool for neighbors, community groups, local organizations, and qualified professionals to explore safety-place concepts and coordinate preparedness planning. The design studio is one part of that goal: the application should also help communities understand needs, compare options, plan accessibility and essential services, document open questions, and prepare for professional and local-authority review.

---

## Product direction

This is a prototype, not an emergency-management system or operational shelter directory. The long-term plan is documented in [plans.md](./plans.md), including the community-planning workflow, accessibility and operations needs, design-model work, estimates, professional review, AI collaboration, shared VR, and release gates.

### What the prototype offers

- A subterranean concept studio with schematic footprints, multiple levels, finish alternatives, stairs, elevator/lift options, selected building-system studies, and space-planning markers.
- Preliminary cost and labor allowances intended to support early discussion, not to quote or commit to work.
- A 2D plan editor, browser 3D preview, and WebXR view on compatible devices.
- A community-facing research workspace with Census TIGERweb county outlines and a human-maintained source register.
- An individual planning brief and file-based co-review workflow.
- A rules-based Blueprint Genie persona prototype; it does not connect to an LLM.

These capabilities do not yet make the application a community coordination, emergency-management, or shelter-operations platform. Needs assessment, shared community governance, emergency communications, staffed operations, supply tracking, verified shelter availability, shared VR sessions, and a connected AI collaborator are not implemented.

### Design, research, and safety boundaries

- The plan editor, 3D preview, and compatible-device VR are concept visualizations, not a measured or coordinated building-information model. Material and system selections are visual/planning alternatives, not verified product specifications.
- Cost, design-fee, labor, and timeline values are speculative allowances, not researched local rates, bids, or commitments. Specialist role suggestions are not vetted vendors, referrals, labor availability, or a contractor network.
- Census county boundaries do not establish parcel boundaries, municipal or ETJ jurisdiction, zoning, permit authority, licensing, site conditions, or code compliance. Research notes and search leads need verification against current authoritative sources and qualified review.
- Co-review uses readable JSON files. Planning answers are held in page memory and clear when the page is reloaded or closed. These files are not encrypted; review the contents before sharing.
- VR is currently a single-device experience. Invitations, guest participants, shared rooms, and spatial voice chat are not implemented. The Blueprint Genie persona is rules-based; no LLM is connected.

> [!WARNING]
> **Emergency and life-safety boundary**
> * **Not an emergency service**: The application is not monitored for urgent or life-safety events. In an emergency, follow current local official alerts and contact emergency services.
> * **Not an official shelter directory**: A concept or planning entry does not mean a place is open, staffed, supplied, accessible, available, or endorsed by local authorities.
> * **Planning aids only**: Models of lifts, stairs, ventilation, structure, energy, water, and other systems are conceptual studies—not structural calculations, engineering drawings, code checks, or egress approvals.
> * **Qualified review required**: Site, geotechnical, structural, civil, electrical, environmental, accessibility, code, and emergency-operations questions require the responsible qualified professionals and authorities.
> * **Worker safety is mandatory**: Acknowledging a checklist is not evidence of completed reviews or controls. No estimate, AI concept, participant, or export can override missing site data, required reviews, permits, or an enforceable worker-safety plan.

## Community planning goals

The product direction is to help communities:

1. Identify who may need support and which accessibility, medical, language, transportation, and caregiving needs should be considered.
2. Review hazards, existing resources, and dated authoritative information without claiming that a map determines site suitability or jurisdiction.
3. Explore a range of safety-place concepts and non-building alternatives.
4. Discuss proposals, document unresolved questions, assign follow-up, and prepare for qualified review.
5. Consider construction, operations, maintenance, staffing, supplies, funding assumptions, and lifecycle costs.

These are product goals, not a claim that the current prototype performs these functions end to end.

## Deferred work and placeholders

The detailed staged roadmap is in [plans.md](./plans.md). Unimplemented capabilities and their boundaries are also documented in [`docs/roadmap/`](./docs/roadmap/README.md). These files describe planning criteria only; they are not active integrations or commitments:

* [Shared VR and spatial collaboration](./docs/roadmap/multi-user-vr.md)
* [LLM Blueprint Genie integration](./docs/roadmap/ai-collaborator.md)
* [Design-editor and model-fidelity improvements](./docs/roadmap/design-editor.md)
* [Authoritative jurisdiction research](./docs/roadmap/jurisdiction-research.md)
* [Verified professional/vendor network](./docs/roadmap/professional-network.md)

Current application validation requirements and any known release blockers are tracked in the [release validation placeholder](./docs/roadmap/release-validation.md).

---

## Application architecture

- The application is built with Next.js, React, and TypeScript. New TypeScript should use explicit types and avoid `any`.
- Public concept planning runs in the browser. In-progress planning answers are held in page memory; reload or tab close clears them.
- Consultation requests use Next.js route handlers and Neon PostgreSQL. Submitted inquiry payloads are encrypted server-side before database persistence; this is separate from the readable, user-managed co-review JSON files.
- Staff workflows use Auth.js with an OIDC workforce identity provider. Exact site assessment data follows a separate staff workflow and isolated encryption key.
- The application uses a per-request nonce Content Security Policy configured through [`proxy.ts`](./proxy.ts).
- County-boundary lookups use the U.S. Census Bureau TIGERweb county layer through an allow-listed internal route. The boundary is for broad research context only.
- WebXR is optional and depends on the browser and compatible headset. A headset is not required for the planning concept.

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