# Design direction

Reading this as an editorial case-file entrance for classmates, with a tactile
archive language; the investigation itself is an accessible working surface.
Taste Skill entrance dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 3, VISUAL_DENSITY 4.
This is original editorial CSS, not an official design system.

## System
Paper white #f5f3ed, ink #242721, muted ink #68695f, archival red #a53224.
Blue is reserved for the artwork and photographs, not a second UI accent.
Libre Caslon Display headlines reference exhibition catalogues. DM Sans serves
controls and body; IBM Plex Mono identifies evidence and times. Fonts self-hosted.
Thin rules separate real content. Square paper edges; 3px controls. No nested cards.
Light appearance intentionally imitates printed evidence, matching the approved brief.
Header 76px desktop, 64px mobile. Content maximum 1440px. Investigation layout:
folder sidebar, central readable document, chronology panel. Mobile stacks them
with navigation anchors. Primary actions and touch sorting targets are at least
44px; compact desktop sorting buttons have accessible labels. Layers: header 10, dialog native.
Motion only uses short opacity/transform feedback with reduced-motion support.
Sorting always has labeled up/down buttons. Status uses text, not color alone.

## Guidance
- Taste Skill: https://github.com/Leonxlnx/taste-skill (entrance only).
- Impeccable: https://github.com/pbakaus/impeccable (critique/audit/polish workflow).
- Vercel: https://github.com/vercel-labs/web-interface-guidelines (interaction audit).
- ThreeUI Community: https://github.com/MengTo/threeui (Sketchbook paper depth,
  Koi Studies layered sheets, and Engraved Certificate linework). These are visual
  references for original React/CSS/SVG work, not embedded demos or copied assets.
These are design inputs, not substitutes for inspecting the rendered application.

## Motion contract

The photograph leans only under a fine hover pointer; touch keeps the paper still.
Selecting another clue briefly reveals its sheet without remounting the document
or hiding readable text. Shared updates must not replay that selection animation.
All motion is optional: reduced-motion preferences and hidden tabs stop it.
Newly confirmed shared clues receive one brief paper-colour emphasis; the latest
shared action fades in without taking focus. Chronology rows move only when the
accepted server order changes. Repeated snapshots, old cases and private reading
must not replay shared feedback. Preserve row identity and up/down controls.
An original SVG engraved seal lands once when an open case becomes solved. Old
case records display the static seal. The conclusion is immediately available;
no answer, action or focus change waits for the 350 ms decorative stamp.
Decorative layers never capture input. Keep the existing fonts and case image.
The classic case remains readable without WebGL or a new animation runtime.

## After Hours: a miniature investigation

Original Three.js geometry extends the paper/ink archive into four cutaway rooms.
Warm wood, chalk walls and muted green storage equipment separate the spaces;
blue identifies the misleading packing case. Scene object IDs match the text list.
Repeated floor tiles and storage boxes use instancing and seeded decoration.
No external model, texture, iframe or audio is required. Room assets are code.

Demand rendering leaves a still room idle. A selected case turns only while its
inspection changes; reduced motion snaps directly to the inspected state. The
camera has bounded orbit controls plus labelled rotation/reset buttons. Hidden
workspace tabs unmount the scene. The text list remains usable while 3D loads or
after WebGL failure. Dimensions used in deductions are written facts, not an
invitation to estimate pixels or model scale.

Desktop: scene and object controls beside a stable evidence sheet. Phone: the
selected object takes the reader to its evidence sheet; teammate updates do not
move selection or focus. A player initially selects an object belonging to their
own duty. Seven questions use a focused reasoning panel with retained tab drafts.
The chronological record and conclusion preserve the team's actual actions.
