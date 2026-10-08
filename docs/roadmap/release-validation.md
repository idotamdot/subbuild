# Release validation and known blockers

**Status: release readiness not established.** This file records validation performed on 2026-10-08 while the studio work was being resumed. Rerun all checks after any further code changes.

## Current verification snapshot

- `pnpm test`: **17 tests passed** across 4 files after correcting county validation order.
- `pnpm lint`: **exited successfully**. Pre-existing warnings remain in `app/layout.tsx`, `components/content-governance.tsx`, `app/staff/(protected)/page.tsx`, and `components/planning-experience.tsx`.
- `pnpm exec tsc --noEmit --incremental false`: **one outstanding prop error** was reported: `systems` was required by `FloorPlanEditor` but missing at its call site. That prop has since been added, but the type-check has not yet been rerun.
- Production build and browser smoke test: not run against the latest edits.

These are point-in-time results, not claims about the current state after subsequent changes. Do not describe the worktree as type-safe, test-clean, or deployable until the release checks below have been rerun successfully.

## Release gate

1. Resolve all strict TypeScript errors without adding `any`.
2. Run focused tests and the complete `pnpm test` suite.
3. Run `pnpm lint`; resolve task-related warnings and record intentional remaining warnings.
4. Run `pnpm exec tsc --noEmit --incremental false` and `pnpm build`.
5. Smoke-test the public planner, inquiry privacy flow, research workspace, downloads, keyboard interaction, responsive layout, and fallback paths.
6. Test WebXR only with a compatible browser/headset; retain a usable non-headset experience.
7. Review security headers/CSP, accessibility, external data disclosure, professional claims, and life-safety language before release.

## Release boundary

A passing software build is not an engineering, accessibility, regulatory, emergency-preparedness, or worker-safety approval. No prototype export is a blueprint or construction document. Keep these independent professional-review boundaries in place.
