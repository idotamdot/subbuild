# CommonGround Atlas: Product and Delivery Plan

**Status:** Public prototype roadmap; planned work requires community review and contribution.  
**Product:** CommonGround Atlas — Global Community Readiness  
**Last updated:** 2026-10-08

This roadmap is the shared implementation guide for contributors to the public prototype. Start with the highest-priority items in order, open focused pull requests, and update the release-validation placeholder with checks actually run. Planned work is not a claim that a feature is implemented or approved.

## Product vision

Build a global coordination and planning application that helps communities prepare for catastrophes together, plan candidate safety-zone locations, coordinate support, and share reliable, current planning information across regions and languages. Neighbors, community groups, humanitarian organizations, researchers, emergency managers, and public authorities should be able to contribute within clear roles and decision rights.

The application should support a repeating **prepare → assess → exercise → coordinate → recover → improve** cycle. Global hazard planning should help users compare proposed safety-zone candidates with authoritative hazard and infrastructure information, document assumptions and uncertainty, and route candidates to responsible local experts and authorities. Volcanic eruptions are a first-class scenario, including ashfall, lava flows, pyroclastic density currents, lahars, volcanic gases, and cascading impacts to transport, power, water, communications, and health services. Other locally relevant hazards should use source-grounded, versioned hazard layers rather than one-size-fits-all global assumptions.

AI guidance should connect to official, reputable emergency-preparedness and hazard-information sources where public interfaces, usage terms, and formal permissions allow. Potential integration targets include U.S. Department of Homeland Security and FEMA preparedness resources, FEMA alerts/programs where access is authorized, NOAA and National Weather Service data, USGS volcano and earthquake information, the UN Office for the Coordination of Humanitarian Affairs, UNDRR, WMO, GDACS, and national or local civil-protection, geological, meteorological, and emergency-management agencies. These are **prospective source/integration targets, not current integrations, endorsements, partnerships, or approvals**. Source selection must be region- and hazard-aware; local authorities remain authoritative for decisions in their jurisdiction.

The subterranean design studio remains one supporting tool for visualizing possible safety-place concepts. It must not be conflated with map-based safety-zone planning: a candidate zone may be an existing facility, an outdoor assembly area, a distributed support network, or another locally appropriate option—not necessarily a new underground structure.

The **Sanctuary project** is a shared continuity effort for people and AI. It brings together human safety, accessible shelter and community-support needs with the resilient knowledge and AI services that may help communities prepare, coordinate, and recover. It may include a physical place and plans for power, cooling, water, communications, compute, data and model backups, maintenance, and service recovery. Plans must state what remains available when power, connectivity, models, or buildings fail. Human life, dignity, accessibility, and locally governed emergency response are primary; AI continuity is supporting infrastructure, never a competing priority or autonomous authority.

The **LLM Sanctuary** workspace supports the AI side of that broader people-and-AI continuity project: participating organizations can assemble, configure, evaluate, and govern bounded assistants that provide community planning and preparedness guidance grounded in approved emergency-management sources; choose how those assistants appear and communicate; and assess hosted or local model continuity. A paired physical sanctuary concept can plan human spaces and supporting compute infrastructure together while keeping their requirements and failure modes distinct. “Sanctuary” means a controlled, observable continuity environment for people and AI—not an autonomous emergency command center, forecast authority, or zone-designation service.

The product should feel open and useful, not like a gated compliance form. Let people explore public information without first creating an account or passing through encryption setup. Do not make privacy concerns dominate the experience. Explain plainly when information is shared and retain basic protections for accounts, invitations, and operational records. Never imply that a concept, estimate, AI response, map, or checklist establishes that a real place is safe, available, stocked, accessible, officially designated, or appropriate for evacuation.

## Current product boundaries

The interface now presents a CommonGround Atlas-branded readiness hub, a community discussion-plan download, links to selected international and U.S. public preparedness sources, and an LLM Sanctuary concept workspace. Scenario choices include public-health emergencies, conflict and displacement, meteor/space-weather topics, and fictional tabletop exercises. These are early planning aids and outbound source links—not agency integrations, live alerts, threat assessments, or operational coordination. A meteor shower is not presented as an impact warning; any meteor-impact or extraterrestrial-invasion scenario is explicitly speculative or fictional.

This plan builds on an existing Next.js application and prototype. The project already contains a subterranean concept studio, stair and elevator options, conceptual building systems, preliminary estimates, a single-device VR preview, an individual planning brief, a browser-based research workspace, and safety and professional-review disclaimers. The current product is not yet a global hazard-mapping, safety-zone coordination, emergency-management, or shelter-operations platform.

The following are **not yet complete, verified production capabilities**:

- The floor-plan editor, cross-section, desktop 3D, VR view, estimate, and exports do not yet share a fully validated geometry/model source.
- The 3D scene and editing interactions need regression coverage and end-to-end browser verification.
- Cost, labor, timeline, design-fee, equipment, material, and specialist figures are planning allowances, not local bids or quotes.
- County-boundary and source-register tools are research aids. They do not identify parcel boundaries, jurisdiction, zoning, permit requirements, or site conditions.
- The Blueprint Genie persona is not a connected LLM and cannot perform professional design review.
- VR is a single-device experience. Invites, shared rooms, remote voice, synchronized edits, and participant moderation are not implemented.
- The existing co-review files are file-based collaboration, not a live shared design session.
- Community needs assessment, group governance, emergency-management coordination, shelter operations, supplies, staffing, maintenance, public availability, and incident communications are not implemented.
- Global hazard-data ingestion, safety-zone candidate planning, cross-border coordination, volcanic-impact analysis, authoritative alert integration, and incident-data freshness controls are not implemented.
- There are no Homeland Security, FEMA, NOAA/NWS, USGS, UN, WMO, GDACS, national civil-protection, or other official emergency-agency integrations or partnerships in the current application.
- The Sanctuary project and LLM Sanctuary are product concepts only: there is no people-and-AI continuity planner, model workbench, model registry, agent orchestration, evaluation system, local inference hosting, or AI infrastructure planning.
- A passing software test or build is not engineering approval, code compliance, worker-safety approval, or authorization to build.
- The readiness and LLM Sanctuary workspaces are concept-level interface additions; production validation, user research, accessible field testing, and independent life-safety review remain outstanding.

## Product principles

1. **Globally coordinated, locally governed:** Share planning context across regions while leaving zone designation, evacuation decisions, and emergency command to the authorities with jurisdiction.
2. **Community outcomes first:** Start with who needs help, what hazards and service disruptions the community faces, which people are underserved, and how support will work before, during, and after an incident.
3. **Inclusive by default:** Plan for mobility, sensory, medical, language, age, transportation, caregiver, and service-animal needs. Do not equate a structure with equitable access.
4. **Explore first:** Open directly into useful planning and design workspaces. Use progressive disclosure for accounts, detailed coordination, and professional intake.
5. **One design, consistent views:** A selected change should remain coherent in the plan, section, 3D view, VR, estimate, and exported concept brief.
6. **Show the reasoning:** Distinguish community reports, verified source data, assumptions, unknowns, and professional decisions. Explain why each risk or recommendation appears.
7. **Freshness and provenance matter:** Every hazard layer and alert needs an accountable source, issue time, valid time, update time, coverage, uncertainty, and stale-data behavior.
8. **Safety is a hard boundary:** Missing engineering, site, permit, egress, accessibility, emergency-operations, or worker-safety review cannot be waived by an AI agent, participant, export, estimate, or checkbox.
9. **No false authority:** Never label a prototype output as an engineered blueprint, construction drawing, vendor quote, code-compliant design, official shelter designation, evacuation order, or operational safety plan.
10. **Keep it usable:** Keyboard, touch, screen-reader, reduced-motion, desktop, low-bandwidth, multilingual, and non-headset paths must support essential tasks.
11. **Avoid needless friction:** Do not require a passphrase to begin planning or invite a trusted collaborator. Present clear, timely information about what a share or submission contains.
12. **Strict typing:** New TypeScript must define its types explicitly and must not use `any`.
13. **Human-led emergencies:** AI can help organize and explain approved information, but cannot issue evacuation or shelter orders, dispatch responders, assess live threats, or replace emergency-management authority.
14. **Observable AI:** Every assistant has a declared role, capabilities, tools, knowledge sources, operating mode, owner, and tested limits.

## Delivery phases

### Phase 0 — Reconcile and establish a verified baseline (contribution priority)

**Goal:** Know which prototype behavior is present and make the working tree buildable before extending it.

**Planned work**

- Inspect and reconcile the unfinished workspace-tab and stage-navigation changes in `components/planning-experience.tsx`.
- Verify the draft persistence and sharing flow is described accurately in the interface, README, and tests. If drafts are in memory, state that refresh or tab close clears them; do not claim they are saved.
- Verify planner and co-review brief generation agree on schema and redaction behavior.
- Confirm the exact current status of the floor-plan editor, WebGL view, system choices, GIS route, and safety-gated exports.
- Inventory existing user journeys and identify which are individual concept design versus community planning; do not present individual planner flows as a community capability.
- Run the current unit tests, strict TypeScript check, lint, production build, and targeted browser smoke tests. Record results and unresolved failures in `docs/roadmap/release-validation.md`.
- Confirm the currently mounted development or preview server and browser behavior rather than relying on an earlier run.

**Exit criteria**

- The baseline is reproducible and its blockers are documented.
- No type errors are waived with `any`.
- Current navigation, plan selection, project brief, research area, co-review file, and export work or are explicitly marked incomplete.

### Phase 1 — Open workspace navigation and planning flow (contribution priority)

**Goal:** Organize the experience into clear workspaces without making users scroll through one long page or losing their current choices.

**Planned work**

- Provide keyboard-accessible workspace tabs for Community Readiness, Hazards & Sources, Safety-Place Studio, Approaches, Compare, LLM Sanctuary, Guidance, and the explicitly labeled legacy individual shelter inquiry.
- Provide direct, keyboard-accessible tabs for the four planning stages: Your Goal, Project Context, Feasibility, and Review & Share.
- Keep entered values in memory while switching tabs and stages. Make the reset behavior clear; persistent drafts can be considered separately.
- Make workspace selection available from the hero, main navigation, solution cards, and prominent calls to action.
- Support browser history/deep links so a user can open or share a specific workspace without confusing the selected tab.
- Add focus management, clear selected states, responsive wrapping/scrolling, and visible headings for assistive technology.
- Put community purpose and available local-support information ahead of any individual sales or consultation workflow.

**Acceptance criteria**

- A visitor reaches every workspace in one deliberate navigation action from the top-level interface.
- A community organizer can begin with a needs-planning path without first selecting a building design.
- Arrow keys, Home, End, Tab, and screen readers can operate both tab sets.
- Changing workspaces does not unexpectedly discard the current in-memory design or brief.
- A reload or closed tab has honest, predictable behavior; no UI claims that unsaved answers persist.
- At small viewport widths, all tabs remain discoverable and operable.

### Phase 2 — Community needs and shared planning

**Goal:** Make community preparedness and coordination the primary user journey, with the design editor as one useful planning tool.

**Planned work**

- Let an organizer describe the community served, hazards under consideration, existing support resources, and the planning purpose.
- Provide a needs inventory for mobility, sensory, medical, age, language, caregiving, transportation, service-animal, and other locally identified requirements.
- Record community priorities, assumptions, unanswered questions, proposed actions, responsible follow-up roles, and source/date for relevant reports.
- Distinguish reported needs from verified facts and official decisions. Allow corrections and make disagreement or missing input visible.
- Provide a simple community review invitation and participation path that works without VR; define light-weight organizer, contributor, and viewer roles before adding complex administration.
- Support planning for multiple kinds of community safety places and non-building alternatives rather than steering every scenario toward a new subterranean structure.
- Provide a clear handoff checklist for local emergency-management officials, community organizations, property owners, and qualified professionals.

**Acceptance criteria**

- A community can start and make progress without opening the design editor or supplying exact property details.
- A planning summary separates known resources, reported needs, assumptions, open questions, and next steps.
- Every follow-up action has an owner or an explicit unassigned state; no unassigned item is presented as completed.
- Community input is not described as official approval, professional review, universal representation, or consensus without a documented process.
- The workflow presents relevant alternatives and clearly explains that the application is not monitored for emergencies.

### Phase 3 — Global hazard sources and safety-zone planning

**Goal:** Provide a traceable, cross-region planning layer that brings authoritative hazard and preparedness information into community decision support without claiming to designate safe zones or replace agencies.

**Planned work**

- Create a typed source registry for agencies and data products. Record publisher, authority, hazard/event type, geography and resolution, language, endpoint/access method, licence/terms, issue/update/valid times, data owner, limitations, and verification date.
- Establish connector priorities by region and hazard. Evaluate publicly available preparedness guidance and data interfaces from DHS/FEMA, NOAA/NWS, USGS, UN OCHA, UNDRR, WMO, GDACS, and national/local civil-protection, meteorological, geological, and emergency-management agencies. Confirm each endpoint, permission, service level, attribution rule, and reuse term before enabling it.
- Treat named organizations as possible integration targets only. Do not use their marks or imply endorsement, sponsorship, partnership, or authorization without written approval.
- Implement adapters behind a normalized, versioned hazard-information contract that preserves source identity, native event terminology, geometry/time semantics, resolution, uncertainty, publication time, validity interval, retrieval time, and citation.
- Support volcanic hazards as a full scenario family: ash loading/exposure, lava-flow and pyroclastic-flow zones where officially published, lahars, gases, evacuation areas, cascading infrastructure/service effects, and source-defined uncertainty. Never extrapolate operational hazard footprints from a generic map or AI guess.
- Allow communities to describe candidate safety/support zones and compare them against appropriately licensed authoritative layers, infrastructure/service dependencies, access needs, and community requirements. The application may show overlaps and missing evidence; it must not score a candidate as safe or issue an evacuation recommendation.
- Show time-aware map layers with legend, region/coverage, scale/resolution, provenance, last-updated/valid-until indicators, stale/outage states, and clear separation of official data, community reports, and planning annotations.
- Integrate official alert feeds only through authorized interfaces. Preserve the issuer, exact alert text or faithful structured meaning, affected area, issued/updated/expiry times, and a link to the issuing authority. Do not synthesize an alert into a new official instruction.
- Build human-reviewed source updates, correction/withdrawal handling, connector health checks, usage/caching limits, and offline map/brief fallbacks.
- Ground AI guidance in an approved retrieval catalog of current, citable agency preparedness guidance and regional sources. Require answer citations and freshness disclosures; abstain when current authoritative information is missing or conflicting.
- Provide a partner-readiness track: document technical, legal, accessibility, information-sharing, incident escalation, and governance requirements before seeking official integration agreements.

**Acceptance criteria**

- Each displayed official data item has a source link, publisher, retrieval time, source issue/valid time when available, geographic coverage, and stated limitations.
- Every layer is licensed and accessed under verified terms; inaccessible or unauthorized feeds remain unavailable rather than being scraped or represented as integrated.
- Stale, expired, contradictory, unavailable, low-resolution, or out-of-coverage data is visibly distinguished and is not silently treated as current.
- Users can see official data separately from community-provided points, candidate safety zones, and AI-generated summaries.
- The UI describes candidate locations as unassessed planning options and cannot label them “safe”, “approved”, “official”, or “evacuation destination” based on map overlays or AI.
- Volcanic scenario views preserve the hazard type, official source, date, spatial limits, and uncertainty; no unsupported impact polygon is generated.
- AI guidance links to the exact supporting agency material and abstains instead of fabricating current instructions or agency statements.
- The product does not claim integration, endorsement, or partnership with Homeland Security, FEMA, UN entities, or other organizations unless documented authorization exists.

### Phase 4 — Canonical design model and editor interactions

**Goal:** Make the subterranean design state a typed, versioned source of truth rather than independent, loosely related visualizations.

**Planned work**

- Define a versioned TypeScript design schema for site assumptions, footprint, dimensions and units, floors, rooms, materials, access, equipment, building systems, and placed amenities.
- Validate bounds and unsupported combinations at the model boundary. Show actionable errors rather than silently substituting geometry or estimates.
- Define a deliberate migration strategy for saved or exported older model versions.
- Implement top-down editing for each supported footprint, with add, select, move, remove, snapping, keyboard alternatives, and undo/redo.
- Add collision and overlap warnings without misrepresenting them as engineering checks.
- Add expand/collapse and reorder controls for floors; show which elements are inherited and which are floor-specific.
- Clearly label approximate dimensions and all user-entered or unverified data.
- Add an explicit project context that distinguishes a community safety place, a temporary gathering point, a proposed facility upgrade, and a private residential shelter concept.

**Acceptance criteria**

- Every accepted user edit updates the canonical state and produces predictable visual updates.
- Invalid or out-of-range geometry cannot be silently exported or priced as if valid.
- Keyboard and touch users can complete essential edits without drag-and-drop.
- Floor count, scale, and supported geometry are represented consistently in the editor and generated concept materials.

### Phase 4 — Consistent visualization, finishes, stairs, lifts, and systems

**Goal:** Make material and system choices visibly meaningful across the concept views.

**Planned work**

- Drive 2D plan, section, desktop 3D, and headset viewing from the same canonical design model.
- Render each supported footprint and floor consistently, including stairs, elevator/lift concepts, openings, rooms, and placed amenities.
- Show selectable finish alternatives as visual treatments, not promises about rated properties, durability, structural capacity, waterproofing, or availability.
- Keep stair and elevator/lift options clearly labeled as study concepts. Do not infer egress approval or accessibility from selection.
- Depict power, backup energy, water, drainage, ventilation, filtration, controls, communications, and maintenance zones as concept markers.
- Support predictable fallback behavior when WebGL or WebXR is unavailable, including a readable diagram and textual scene summary.
- Add representative image/snapshot and geometry consistency tests for supported footprints, materials, floors, access options, and systems.
- Show how conceptual capacity, accessible circulation, sanitation, communications, backup services, and support spaces affect a community use case. Do not calculate occupancy approval or life-support adequacy.

**Acceptance criteria**

- A finish, footprint, stair/lift, floor, or system change updates all applicable views together.
- Desktop 3D and VR never show stale state after accepted changes.
- Unsupported browser capability results in a usable non-WebGL and non-headset alternative.
- Technical claims remain limited to verified source data and qualified review.

### Phase 5 — Transparent estimates and downloadable concept package

**Goal:** Give clients a useful, clearly bounded planning estimate and a portable brief for a professional conversation.

**Planned work**

- Organize line items for approximate material, machinery, labor specialties, logistics, site investigation, professional review, contingency, and an explicit design fee.
- Derive each estimate from declared model inputs and an explainable rate table; show units, region, rate date, source, assumptions, uncertainty, and excluded costs.
- Distinguish low/typical/high planning scenarios from quotes or commitments. Allow unknown inputs to widen or invalidate a range rather than inventing precise figures.
- Explain schedule dependencies, major risks, and the evidence needed to reduce uncertainty.
- Provide specialist and supplier categories with selection criteria and a clear distinction between an unvetted suggestion and a verified referral.
- Export a readable, versioned concept package: planning brief, schematic images, chosen alternatives, materials/system placeholders, cost/labor assumptions, timeline assumptions, risks, required professional reviews, and source register.
- Provide both JSON for reuse and a well-formatted print/PDF-ready concept sheet.
- Add community-scale budget planning categories, possible funding/grant research leads, lifecycle/maintenance assumptions, and clearly separated volunteer, paid-labor, and professional-service assumptions. Never imply grant eligibility or confirmed funding.
- Include a community discussion summary that records agreed priorities, unresolved questions, and dissenting needs without portraying silence as consent.

**Acceptance criteria**

- Every figure can be traced to an explicit model input or documented estimate assumption.
- A user can tell the difference between an allowance, a quote, and a completed professional assessment.
- Community budget and schedule ranges expose their assumptions and do not present donations, volunteer labor, or grant funding as guaranteed.
- Material lists contain no unsupported specification or structural rating claims.
- An export never calls itself a construction blueprint, engineered plan, permit, or approved safety plan.
- The generated brief lists unresolved risks and explicitly blocks a “ready to build” status when required reviews or controls are missing.

### Phase 6 — Safety, research, and professional handoff

**Goal:** Turn unknowns into well-reasoned next steps without implying that the website determines whether a real site is safe or buildable.

**Planned work**

- Structure each risk entry as condition, evidence/source, uncertainty, consequence, mitigation question, and responsible qualified reviewer.
- Separate a preliminary screening prompt from a site-specific conclusion. Explain false-positive and false-negative limitations.
- Expand the research register with source title, issuing authority, date accessed, date/version, jurisdictional coverage, link, and human verification status.
- Keep geographic browsing at the level needed for research until the relevant authority and property facts have been confirmed by professionals.
- Build a community readiness and operations checklist for hazard scenarios, alerting/communications, arrival and check-in, accessibility accommodations, sanitation, potable water, power, supplies, staffing, training, operating hours, maintenance, and closure/reopening.
- Build a construction-safety review checklist around excavation, shoring, groundwater, confined-space hazards, hazardous energy, lifting, egress, ventilation, PPE, emergency response, and competent-person responsibilities.
- Make safety status fail closed for finalization: missing required evidence or assigned safety controls yields “review required,” never “safe.”
- Prepare a structured handoff to local emergency-management officials, community organizations, geotechnical, structural, civil, MEP, accessibility, code, excavation, and worker-safety professionals.
- Design a public-source directory and referral workflow for local agencies and assistance services; identify sources and last verification dates, and do not claim an agency has endorsed a proposed shelter.

**Acceptance criteria**

- Every automated risk or compliance statement explains its source, confidence/limitations, and next step.
- County maps, user checklists, or online citations cannot become an approval state.
- A planning entry does not imply an emergency shelter is open, staffed, supplied, accessible, or endorsed by local authorities.
- No concept can receive a construction-ready label without required evidence and qualified sign-off.
- Worker-safety controls and professional review cannot be bypassed by user preference or an AI response.

### Phase 7 — Blueprint Genie AI collaborator

**Goal:** Let clients collaborate with a configurable AI presence that can discuss the design and suggest reversible concept changes.

**Planned work**

- Decide the provider, operating cost, availability, user controls, model disclosure, data flow, and service-failure behavior before integration. Privacy is not the primary product differentiator, but disclose when prompts are sent to an external model and avoid sending unnecessary contact or precise property details.
- Define a strict request/response schema and server-side provider adapter. Keep credentials server-side.
- Offer curated persona appearance, voice, and motion presets that are respectful, accessible, and easy to change. Provide captions, text chat, mute, reduced motion, and an avatar-off option.
- Enable the agent to explain visible concepts and propose changes only through a limited, typed set of reversible design actions.
- Preview the proposed difference and require the client to accept it before changing the project.
- Show AI-generated content as such; provide verifiable source links for factual claims and explain when the model is uncertain.
- Refuse requests to hide risks, bypass required safety controls, claim code approval, generate unsupported structural specifications, or present concept estimates as firm bids.
- Keep deterministic safety and finalization gates outside the model and validate every proposed action against them.

**Acceptance criteria**

- Users know when the agent is active, can stop speech immediately, and can use equivalent text controls.
- Malformed, unsafe, out-of-scope, or failed model responses do not change the design.
- Every accepted agent proposal has a preview, explanation, and undo path.
- No model response can approve site safety, engineering, code compliance, egress, worker protection, or construction.

### Phase 8 — Shared VR design review

**Goal:** Let a client invite a trusted collaborator to walk around the same concept, talk about it, and review proposed edits together.

**Planned work**

- Define a time-limited invitation flow with host and guest roles, clear join/leave controls, and an easy host removal action.
- Show who is present and make microphone mute/leave controls continuously available. Explain when audio uses a network service; do not enable voice without a clear user action.
- Select and test a real-time session transport for design state and voice, including reconnect, duplicate edits, session expiry, and disconnect behavior.
- Synchronize only the agreed design model state needed for the review; do not make a live review room a route to staff data, inquiry records, or unrelated account content.
- Represent change suggestions as proposals both participants can inspect; explicitly apply accepted edits and make their author visible.
- Provide a full non-headset browser path and captions/text chat alternative.
- Consider optional AI participation as a distinct participant with a visible identity, separate controls, and the Phase 6 safety restrictions.
- Support facilitated community review sessions with a host, accessible participation, clear notes, and an explicit method to distinguish proposals, decisions, unresolved objections, and follow-up owners.

**Acceptance criteria**

- Only invited participants can join the intended room; invitation expiry and revocation work.
- Both users see the same design revision and can identify pending, accepted, rejected, and undone changes.
- Participants can mute, leave, and be removed immediately; connectivity loss has a clear recovery state.
- One participant cannot overwrite another's accepted changes without a visible conflict or explicit action.
- A session summary reflects actual recorded choices and open concerns; it does not claim community consensus unless the selected decision process supports that claim.
- The same review can be completed without VR.

### Phase 9 — Launch readiness and operations

**Goal:** Release only the capabilities that have been verified, understood, and responsibly supported.

**Planned work**

- Run unit, integration, type, lint, production build, and browser acceptance suites from a clean, documented environment.
- Test the core journeys on desktop, mobile, keyboard, screen reader, reduced motion, unsupported WebGL, unsupported WebXR, denied microphone, and failed network paths.
- Review data retention, external provider behavior, access control, rate limits, invitation abuse, and service costs proportionately to the capabilities enabled.
- Review all safety, engineering, estimate, vendor, accessibility, and compliance language with relevant qualified professionals.
- Update `README.md`, roadmap placeholders, operating instructions, and release status so they match the actual shipped behavior.
- Publish only after blockers are closed or clearly scoped out of the launch.

**Release criteria**

- Strict TypeScript and build are clean; tests cover critical safety and collaboration paths.
- There are no high-severity defects in authorization, invitation isolation, data handling, or safety gates.
- Browser smoke tests confirm the important end-to-end flows.
- Public copy accurately distinguishes live features from roadmap items.
- No product presentation or export suggests that software validation substitutes for professional review.

## Suggested implementation order

1. Phase 0: reconcile edits and establish a truthful test/build baseline.
2. Phase 1: complete workspace navigation, deep links, and accessibility.
3. Phase 2: deliver community needs, shared priorities, follow-up ownership, and non-VR participation.
4. Phase 3: define the canonical design model before adding more editor controls.
5. Phase 4: complete and validate consistent plan/section/3D/VR behavior.
6. Phase 5: make estimates and exports explainable and useful for community and professional conversations.
7. Phase 6: strengthen source-grounded safety review and professional handoff.
8. Phase 7: add the optional, bounded AI collaborator.
9. Phase 8: add invited, real-time multi-user VR collaboration.
10. Phase 9: complete independent release review and launch preparation.

The AI and shared-VR phases depend on the canonical model, permissions, consistent visualization, and tested safety gates. Do not build them as a shortcut around those foundations.

## Community planning workflow

The future end-to-end experience should support this sequence:

1. **Understand needs:** Define the community served, likely hazards, vulnerable or underserved groups, current resources, and the planning area.
2. **Review context:** Gather dated sources and questions for local emergency-management authorities, property owners, utilities, and relevant professionals.
3. **Explore options:** Compare building and non-building approaches, potential locations at an appropriately broad planning level, accessibility needs, and essential services.
4. **Visualize together:** Review a clearly labeled concept in 2D, 3D, and optionally shared VR. Capture proposed edits, decisions, and unresolved concerns.
5. **Estimate responsibly:** Prepare transparent planning ranges for design, investigation, construction, operations, maintenance, and funding needs.
6. **Obtain qualified review:** Route outstanding site, engineering, code, accessibility, operations, and worker-safety questions to the responsible professionals and authorities.
7. **Plan operations:** Only after proper local authority and professional input, plan staffing, supplies, training, communications, maintenance, and opening/closing procedures.
8. **Publish an honest brief:** Share the current concept, assumptions, review status, source dates, unresolved risks, and named next steps. Do not advertise it as a certified or available shelter prematurely.

The application is a planning and coordination aid, not an emergency dispatch service. Prominently direct people facing an immediate emergency to local official alerts and emergency services rather than waiting for an online response.

## Existing roadmap references

- [Deferred work index](./docs/roadmap/README.md)
- [Design editor and model fidelity](./docs/roadmap/design-editor.md)
- [AI Blueprint Genie collaborator](./docs/roadmap/ai-collaborator.md)
- [Shared VR and spatial collaboration](./docs/roadmap/multi-user-vr.md)
- [Jurisdiction research](./docs/roadmap/jurisdiction-research.md)
- [Professional/vendor network](./docs/roadmap/professional-network.md)
- [Release validation and known blockers](./docs/roadmap/release-validation.md)
