# Claim review — 25 October 2026

## Student review and agent work

The student identified the PROCESS `exactly-once` wording and requested a more
rigorous description, an audit of both PROCESS and the research note, meaningful
staged commits, and deployment. They explicitly asked that this interaction count
as their review. This is a recorded, substantive review direction: narrow claims
to their evidence and correct overstatement. The agent performs the source/code
checks and wording changes. It is not an independent reviewer or a human player.

This record does not infer that the student read every original paper, personally
ran the tests or attended a classroom activity. Publication is already authorised;
the requested corrections do not require a second endorsement gate. Unmeasured
experience remains a limitation, not an invented completed activity.

## Stage 1: PROCESS and technical guarantees

| Previous wording or implication | Correction and evidence boundary |
| --- | --- |
| “exactly-once deduction” | The [marking script](../scripts/check-after-hours-marking.mjs) holds one request, resizes the viewport, then checks one outgoing write and one saved attempt. The [dated results](verification/2026-10-25/README.md) report this finite scenario, not a general delivery/processing guarantee. |
| Recovery avoids duplicates without qualification | The [client](../src/AfterHours.tsx) blocks concurrent local mutations and reads current state after an uncertain response. That read can fail. The [server](../server/after-hours.ts) ignores already accepted deductions, but unsuccessful attempts can be submitted again; no general request-ID deduplication guarantee follows. |
| Renderer optimisations reduce the small service's rendering cost | WebGL rendering runs on the client. Lazy loading, instancing and demand rendering target client work; precompressed assets avoid server runtime compression. No device benchmark establishes a universal gain. |
| Tests “prove” paths or “enforce” the full argument | Regressions exercise specified behaviours and can miss failures. Known-answer actors are not first-time solvers; counts of passing checks are not evidence of enjoyment or exhaustive correctness. |
| Cross-duty supports imply group reasoning | Authoring checks cover configured support sets across the initial two-person split. They do not prove balanced contributions among four people or conversation after publication. |
| A blanket statement that student review has not occurred | Replaced with the actual review direction above. Source reading, playtesting and classroom activity are distinct and are not inferred. |

No runtime behaviour or historical evidence files are changed by these
corrections. Existing failed runs, passing reports and cutoff tags retain their
original meaning. The writing rule in [CLAUDE](../CLAUDE.md) now requires these
distinctions in future claims.

Stage 1 validation: portfolio and course evidence checks passed; 39 Markdown
documents had 130 resolvable local links and no failures. These checks validate
document structure and references, not the truth of every proposition. The audit
above comes from comparing claims with the implementation and saved evidence.
