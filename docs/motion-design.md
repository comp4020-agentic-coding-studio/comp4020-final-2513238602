# Paper and shared-action feedback — 21 October 2026

The student asked for suitable ThreeUI effects and then authorised implementation
and deployment. The references are [ThreeUI Community](https://github.com/MengTo/threeui),
[Sketchbook](https://threeui.com/css/sketchbook),
[Koi Studies](https://threeui.com/css/koi-studies) and
[Engraved Certificate](https://threeui.com/ui-elements/engraved-certificate).
The reviewed wrappers display fixed demonstrations in iframes rather than accept
our case data. We implement original, small React/CSS/SVG effects in the existing
interface. No upstream code, fonts, photographs or preview videos are copied;
no new package or remote asset is required. This is visual inspiration, not a
claim that the ThreeUI package is installed.

## Paper interaction

The existing photograph tilts at most 1.6/2.2 degrees under a desktop fine pointer.
A separate moving layer preserves its printed rotation. Touch and reduced-motion
preferences keep it static; pointer exit, loss of focus and hiding the page reset it.

Changing clue identity reveals the existing article with a 240 ms paper transform.
The article stays opaque and retains its DOM identity. Publication, live updates
and rerendering the same clue do not replay the reveal. The explanation form is
not remounted for visual effects, and decorative layers do not intercept input.

Local production build, TypeScript and all 32 HTTP/unit checks passed against an
isolated service. The existing incomplete-citation browser check passed at 1920px
and 390px, including live partner publication, draft retention and two axe scans.
These are automated checks, not human playtesting or evidence of improved enjoyment.

## Confirmed collaboration

Newly published clue IDs briefly highlight on the desk and in the current
document's shared label. A new activity ID draws attention to the existing actor
message. Chronology changes use the same keyed rows and animate only after an
accepted server snapshot changes their order; no speculative success is shown.
Repeated snapshots and idempotent publications produce no new feedback. Focus,
the selected document and the explanation draft stay in place.

Review found that a second sort within 220 ms could jump to the previous motion's
endpoint. The replacement motion now includes the row's current visual offset
before cancelling the previous animation. Resize, hidden-page and reduced-motion
handling keep decoration separate from the confirmed state.

The dedicated motion browser check exercises held write requests, two real
identities, repeated live events, unchanged article/form DOM, retained answers,
reduced motion and touch layouts. The existing collaboration check also passed:
all 11 local publication/order/solution observations were below one second.

## Engraved closure and regression gate

The original SVG seal uses fine rosette lines and the existing archival red. It
lands once after an open-to-solved server transition; a previously solved room
loads a static seal. The case record repeats the static mark above its readable
conclusion. Closing/reopening the record, duplicate updates, reduced motion and
hidden pages never delay the explanation or manufacture a fresh success.

`pnpm check:motion` now runs in the deployment check job. The regression pauses
two actual writes before the server receives them, verifies both real identities,
and holds the first received sort animation at 25% and 0% to test an overlapping
second confirmation deterministically. Both row positions stay continuous within
5px; a zero-distance reversal cancels the old animation instead of drifting away.
It also verifies same-node article/form/rows, all draft selections, repeated SSE,
idempotent publication, one-time closure, quiet reloads and static touch/reduced
motion. [Local results](motion-local-oct21.json) contain no identities or secrets.
Desktop/mobile complete playthrough and incomplete-citation checks also passed,
including their accessibility scans. No new dependencies were added.

The first two coherent changes were pushed independently:
[paper interaction](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/3e00a1b)
and [confirmed collaboration](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/b3d6b7f).
The seal, completed regression gate and this evidence form the final step.

Screenshots show layout, not motion timing:
[desktop desk](screenshots/motion-desk-1920.png),
[mobile case closed](screenshots/motion-solved-390.png), and
[mobile entrance](screenshots/motion-home-390.png), and the
[mobile conclusion record](screenshots/motion-record-390.png).
