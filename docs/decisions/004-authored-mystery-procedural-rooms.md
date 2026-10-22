# ADR 004: authored deductions, procedural rooms

Date: 22 October 2026. Status: implemented after the student approved the party-game plan.

## Context

The student reported tutor advice to make the final a friends/family detective
game and judged the short eight-clue case too thin. The existing React/Node/SQLite
service already supplied reliable shared state. A new visual surface alone would
not change the quality of the reasoning. The same course machine and volume must
remain sufficient, and existing investigations must still open.

## Decision

Keep Blue Hour intact and add after-hours-v1. Author sixteen facts and seven
deductions across three acts. Store the correct answers and acceptable supporting
evidence sets only on the server. Test that every support set crosses the initial
two-player information split. Corrections to public descriptions must preserve
the established truth; a future incompatible case requires a new version.

Use Three.js 0.186.1 and React Three Fiber 9.8.2 for four original cutaway rooms.
The renderer's [React compatibility](https://r3f.docs.pmnd.rs/getting-started/installation)
fits React 19. Reusable geometry creates furnishings, while an investigation seed
controls decorative variation. Instance repeated tiles and boxes, reuse the room
templates and [render on demand](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
The server stores a seed and authored state, not meshes or streamed camera frames.
SSE distributes saved investigation changes; each camera stays local.

The object list and 3D selection lead to the same inspection action. Facts are
written text, including every dimension or timestamp used to reason. Browser
tests deliberately lose WebGL and continue by keyboard. Touch users can scroll
over the scene and rotate it with labelled buttons. Reduced motion removes the
inspection transition. Lazy loading and build-time gzip limit delivery cost.

Two seats initially cover two duties each. Third and fourth players take object
and route duties. Any member can explicitly transfer a duty to another member,
using the current version. The visible handover prevents a departure from making
the game impossible. This assumes a cooperative invited group, not competitive
anti-cheating. Previously learned information cannot be made unknown again.

## Alternatives and costs

Free walking, physics and avatar movement would consume implementation effort
without establishing why a partner's evidence matters. Room selection and bounded
orbit retain exploration while keeping phones and keyboard controls practical.

Fully generated mystery truth could produce contradictory facts or unreachable
solutions. Authoring one larger case gives deterministic verification, at the
cost of limited replay once the answer is known. Decorative seeds do not remove
that limitation. Additional cases should follow real playtesting, not precede it.

Requiring exactly four specialists would strand smaller groups and departing
players. Transferable duties keep all clues reachable, but a dominant player can
still monopolise conversation. Contribution counts cannot detect or prevent that;
first-time group observation must assess it.

The main 3D module is roughly 946 KB uncompressed and about 250 KB with gzip.
It is separate from the entry and classic case. This is still more download and
GPU work than a text-only game; real phones and slow connections need human use.

## Evidence

The server contract is exercised in spec/after-hours.test.ts. Three browser
suites cover a complete two-person investigation, four same-name identities with
a departure/return, and real response loss/WebGL failure. Asset tests verify
negotiated gzip and an uncompressed fallback. See the dated
[verification record](../after-hours-verification.md) for actual run evidence.
