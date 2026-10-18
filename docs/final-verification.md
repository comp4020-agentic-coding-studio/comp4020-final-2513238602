# Final preparation verification — 18 October 2026

Agent-run evidence for the current preparation pass. This records technical and
document checks, not student reading, endorsement, human playtesting or classroom
participation. [Readiness](final-readiness.md) separates those remaining judgements.

## Meaningful release steps

| Commit | Why this step exists | CI record |
| --- | --- | --- |
| [`ca3d8b4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/ca3d8b4) | Complete the assisted C8/C9 retrospectives with their actual writing date; revise the research argument against primary sources; add all-reflection, reference and full-README checks | [Check and deploy](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39104354081) |
| [`f0b3512`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/f0b3512) | Keep every saved investigation reachable, expose history failures and recover uncertain creation/join responses without automatic duplicate writes; add the corresponding HTTP/browser checks to CI | [Check and deploy](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39104715925) |

The documentation step containing this record rewrites PROCESS and the readiness
map, publishes sanitized evidence and supplies a concrete personal-review guide.
Each step is committed and pushed independently, with the problem, behaviour and
validation in its commit body. The earlier C8/C9 tags are unchanged. The existing
C10 tag remains the verified pre-crit snapshot at `5651633`; these newer main
commits continue final preparation.

## Combined local verification

The production frontend builds. TypeScript and **32 tests across eight files**
pass. The two shipped HTTP invariants remain intact; the additional README test
checks complete text and links in server HTML. Restart cases use actual child
processes and persistent temporary databases, recovering both cooperative
identities and all thirteen saved files. See the [test map](../spec/README.md).

All five browser suites passed against the isolated local server at port 8084:

- Complete playthroughs at 1920×1080 and 390×844, keyboard dialogs, all eight
  clues, wrong/correct explanation, failed save and offline recovery.
- Separate identities, same-name attribution, competing chronology writes,
  partner resolution and restoration. Eleven local render measurements: 7–22 ms.
- Delayed writes, lost replies after commit, timeout recovery at 12,045 ms and a
  failed refresh after a genuine stale-write rejection.
- Thirteen reachable files, visible initial/later history failures, retained
  links, retry/reconnection and keyboard pagination at phone width.
- Shared first identity confirmation, lost creation and join responses, read-only
  membership recovery, and explicit choice before creating another room.

The combined browser run includes **16 axe A/AA scans**, no horizontal overflow
at the tested states and no browser JavaScript errors.
[Sanitized local results](final-local-browser-results.json).
The returning-user screenshots were inspected:
[desktop](screenshots/final-returning-1920.png) and
[phone](screenshots/final-returning-390.png).

An independent review found a defect in the first pagination approach: ordering
by mutable update time let an unseen room move across the cursor after its partner
acted. The regression initially returned five of six rooms. Ordering by immutable
creation time and code makes it return all six. CLAUDE now preserves that rule;
the UI explains that files are newest-created first while dates show last change.

## Hosted verification after deployment

Both release steps above passed their CI checks and deployment. The deployed
recovery revision also passed the returning, entry and collaboration browser
suites over HTTPS. Eleven request-to-render samples were **46–237 ms**, including
publication, chronology and resolution; these are measurements of this run, not
a worldwide latency promise. Both tested views passed their additional axe checks.

The original investigation seeded on **5 October** restored its original identity
and F1 publication on **18 October**, 13 complete days later. Both original
identities from the earlier C10 rehearsal restored the solved case and identical
history after this redeployment. That comparison reuses the earlier real Fly log
snapshot; it does not claim a new human session or newly captured log stream.
Neither verification reseeded its record.

The root, full README and health routes returned HTTP 200. The homepage references
the same frontend asset as the locally verified production build.
[Sanitized hosted results](final-hosted-results.json) include timestamps, samples,
routes and the original persistence dates, without session credentials.

## Portfolio checks and boundaries

`check:evidence` resolves the process's commit references. `check:portfolio`
requires all three reflections, the research note and the core harness documents;
it checks local links and reports length guidance. Temporary negative fixtures
confirmed that a missing reflection and broken local link fail the check. These
fixtures were removed before committing. The course secret scanner found no
matches in publishable files or reachable history before each release step.

Current counts include whitespace-separated headings and links: README **585**,
research note **735**, C8 **292**, C9 **299**, C10 **275**. PROCESS remains within
900–1100 words. The [source audit](research-source-audit.md) explains its slightly
different displayed-link counting convention and the research claim boundaries.

No test result establishes an enjoyable or balanced mystery. No retrospective
written on October 18 is described as an earlier on-time submission. The
[personal-review guide](final-personal-review.md) distinguishes the official C10
exercise, student judgement and suggested human evaluation. Cookies, invitations,
member IDs and raw infrastructure logs are excluded from published evidence.
