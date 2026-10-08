# Placeholder: multi-user VR and spatial collaboration

**Status: not implemented.** The current headset experience is a single-device concept viewer. It does not create invitations, shared rooms, remote participants, or spatial voice conversations.

## Requested outcome

Allow a client to invite another person to join a concept review, walk around together, discuss a proposed change, and see accepted visual edits reflected for both participants.

## Work to plan

- Choose an authenticated or privacy-preserving guest-invitation model, with short-lived, revocable, single-purpose room links.
- Define participant roles, host controls, explicit join/leave and microphone consent, and safe behavior when consent or connectivity is withdrawn.
- Select and threat-model a real-time transport for shared session state and voice; set retention to none by default and do not record calls.
- Synchronize only the minimum concept state needed. Do not transmit parcel/address details or private inquiry drafts.
- Design headset compatibility, spatial-audio disclosure, moderation and removal controls, reconnect behavior, accessibility, and a non-VR alternative.
- Test authorization, invitation expiry/revocation, room isolation, concurrent edits, network loss, permission denial, and headset exit.

## Acceptance criteria for future implementation

- An invite is explicit, revocable, time-limited, and cannot grant access to staff data or another room.
- Each participant sees who is present and can leave or mute immediately; the host can remove a participant.
- Voice is opt-in for every participant, recording is off, and the experience identifies any external media provider.
- Only intended design changes are synchronized; rejected edits do not silently alter another participant's design.
- Screen-based participation is available without a headset.
- No collaboration state is presented as an engineering review, safety approval, or construction-ready plan.

## Open decisions

Choose the room transport, guest identity assurance, privacy review, accessibility criteria, and data-retention policy before implementation.
