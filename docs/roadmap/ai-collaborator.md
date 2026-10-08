# Placeholder: AI blueprint collaborator

**Status: not implemented.** The selectable persona, voice style, local command rules, and speech synthesis do not connect to an LLM. They do not constitute AI design review.

## Requested outcome

Offer a configurable collaborator appearance, voice, and motion style that can discuss a concept and propose reversible visual changes in response to user instructions.

## Work to plan

- Select a provider and document data processing, geographic availability, retention, training use, cost, and failure behavior before sending any prompt externally.
- Build a server-side provider adapter; keep credentials out of the browser and define strict request and response schemas.
- Limit tools to approved, reversible concept controls. Require user confirmation before changing the plan.
- Show when content is model-generated, cite verifiable sources for factual claims, and distinguish estimates from quotes.
- Establish refusal behavior for requests to bypass safety, conceal hazards, assert unsupported code compliance, or produce construction/engineering instructions.
- Preserve professional and worker-safety gates outside the model so prompts, acknowledgements, output, and exports cannot override them.
- Provide a local-only experience if the user declines external processing or the provider is unavailable.

## Acceptance criteria for future implementation

- No request is transmitted until the user sees and accepts a specific disclosure.
- No address, parcel, exact site, contact detail, or sensitive security information is included in model context.
- Model output cannot approve structures, determine jurisdiction, calculate engineering performance, certify egress, select vetted vendors, or authorize work.
- Structured changes are validated, previewed, and accepted before application.
- Unsafe or unsupported requests are refused with clear reasoning and referral to qualified review.
- Tests cover malformed provider output, timeouts, prompt injection, refusal paths, and disabled/offline mode.

## Open decisions

Choose the provider, privacy terms, budget controls, retention policy, source-grounding rules, and professional review process before connecting an LLM.
