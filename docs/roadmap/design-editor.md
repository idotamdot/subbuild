# Placeholder: design editor and model fidelity

**Status: prototype; not validated for design use.** The current studio provides conceptual controls, schematic floor/section views, space-planning markers, browser-based 3D preview, and a single-device headset view. These views are not an interoperable or dimensionally validated building model.

## Requested outcome

Give a user an intuitive way to shape below-grade concepts, compare appearances, place and edit room contents, expand levels, and inspect the same accepted design in plans, sections, downloads, and VR.

## Work to plan

- Define a versioned, strictly typed design-state schema with explicit units, migrations, bounds, and invalid-state handling.
- Establish a shared geometry source for 2D plans, section drawings, desktop 3D, headset VR, and concept exports.
- Support undo/redo, keyboard and touch editing, item selection/removal, collision/overlap notices, snapping, and predictable multi-level controls.
- Represent finish selections as visual alternatives only unless verified product properties and qualified structural analysis are separately available.
- Mark location, scale, orientation, and dimensions as approximate until independently verified.
- Add visual and numerical regression tests for each shape, material, stair/lift option, building-system marker, and floor count.
- Provide accessible screen alternatives to drag/drop and WebXR interactions.

## Acceptance criteria for future implementation

- Changing any selected option updates every affected view consistently, including estimate inputs and a clearly scoped export.
- The interface distinguishes dimensions, assumptions, unknowns, and user-entered data.
- Unsupported geometry is rejected visibly instead of silently falling back to an inaccurate shape or area.
- A screen reader and keyboard user can perform every essential edit without drag-and-drop or VR.
- Generated files remain labeled as illustrative concept artifacts, never blueprints or construction specifications.
- Tests prove representative 2D, 3D, VR, and export states agree for each supported shape and selected system.

## Open decisions

Choose the model format, units and precision, editor interaction model, and scope of exports before replacing the illustrative renderers.
