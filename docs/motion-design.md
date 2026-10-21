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
