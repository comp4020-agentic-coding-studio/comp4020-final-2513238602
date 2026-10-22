# After Hours verification — 22 October 2026

This record separates implemented behavior and automated playthroughs from human
judgement. The student requested the approved party-game upgrade and meaningful
incremental public pushes. No fresh-player enjoyment or duration result is claimed.

## Implementation and release trail

| Commit | Reason for the stage | GitHub run |
| --- | --- | --- |
| [67c3434](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/67c3434) | Establish authored deductions, private discovery and persistent four-seat rules | [39748431468](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39748431468) |
| [2cea1e4](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/2cea1e4) | Make the first cooperative 3D investigation playable | [39750777735](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39750777735) |
| [ad32d97](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/ad32d97) | Complete four rooms and the full two-person reasoning chain | [39752201364](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39752201364) |
| [34845c7](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/34845c7) | Keep four-person play moving through duties, discussion and departure | [39752992084](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39752992084) |
| [9961819](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/9961819) | Harden recovery, logging, evidence validation and compressed delivery | [39754496834](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39754496834) |
| [1a5bcef](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a5bcef) | Correct intentional canvas disposal being mistaken for GPU failure | [39755818019](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39755818019) |

All six listed runs completed both check and deploy successfully. The successful
hosted replay below followed the sixth deployment. Each commit message explains the player problem, change and
validation. Existing crit tags are untouched; these are final-project improvements.

## Local verification

Production build and TypeScript pass. Forty-one tests in ten files cover the
existing case, new membership boundaries, authoring support sets, act gates,
duplicate notes, competing moves, private handovers, real restarts, safe logs and
negotiated gzip. New browser coverage includes:

- Full two-person main case: actual 3D click selection, sixteen discoveries,
  seven supported deductions, six ordered events, shared conclusion and reopening.
- Four same-name identities: private discovery transfer, preserved deduction
  draft, shared hints, escaped note text, offline handover/return and a fifth-seat refusal.
- Recovery: real committed responses lost in transit; explicit entry recovery;
  pending inspection; settled reduced-motion rendering; normal touch scrolling;
  deliberate WebGL context loss followed by keyboard discovery and publication.

The seven legacy browser suites remain in CI. The main-case and party suites add
seven axe scans; 25 scans in total cover the selected classic/new views. Automated
scans and programmatic players do not establish human comprehension or enjoyment.

## The first hosted replay found a real defect

The [initial hosted report](after-hours-hosted-initial.json) is an **incomplete
run**, not a pass. It reached act two, then timed out trying to restore 3D. Its
empty `errors` array records absence of browser JavaScript exceptions only.
It does not mean every scenario completed.

The renderer disposes its old context after a delay. The old loss listener still
set the surrounding component to failed after the user intentionally selected
object-only mode. Fast local requests had hidden this timing window. The fix
removes the listener with its canvas and ignores detached canvases. The new
regression sends a delayed loss event to the removed canvas, waits through
scheduled disposal, and restores 3D. The genuine active-context failure test still
uses the object interface successfully. Browser reports now explicitly record
`passed` and `failure` so an incomplete run cannot look like a clean result.

## Successful hosted replay

All three suites completed against the course Fly URL on 22 October, following
the corrective deployment. These reports explicitly record `passed: true`, no
failure and no browser JavaScript errors:

| Report | Completed at (UTC) | Result |
| --- | --- | --- |
| [Two-person case](after-hours-hosted.json) | 09:35:01 | Actual 3D selection, sixteen discoveries, seven supported deductions, six events, shared ending, reopening and delayed canvas-disposal regression |
| [Four-person party](after-hours-party-hosted.json) | 09:35:14 | Four same-name identities, private handover, shared hints/notes, preserved draft, offline return and fifth-seat guidance |
| [Recovery and devices](after-hours-recovery-hosted.json) | 09:35:21 | Lost committed replies, pending inspection, touch scrolling, idle rendering and real WebGL context loss followed by keyboard progress |

The first two reports contain seven axe scans with no reported violations. The
party report's 76 ms publication-to-visible observation belongs to that one run;
it is not a latency guarantee. Playwright's independent browser contexts model
separate identities, not human participants. Phone checks emulate 390×844 touch
and do not measure a physical phone's GPU.

Hosted captures show the [gallery](screenshots/after-hours/gallery-desktop.png),
[store](screenshots/after-hours/store-desktop.png) and
[phone discussion](screenshots/after-hours/discussion-phone.png). The last image
intentionally contains literal HTML-like text to verify that notes are escaped.
The store image reveals late-case material. These are verification captures,
not fresh-player observations.

## Persistence across releases

The [new-case fixture](after-hours-persistence-hosted.json) was created at 09:32
UTC before the corrective deployment, and verified at 09:38 with both original
browser cookies. Case version, seed, duties, discoveries, deduction, chronology,
note and recorded contributions matched their saved state. The helper refuses to
silently replace its fixture; cookies remain in ignored local data.

The [classic fixture](classic-persistence-oct22.json), originally created on 5
October, still restored its original identity and F1 publication seventeen days
later. Neither check establishes recovery after deleting the identifying cookie.
Local real-process restart tests complement these hosted checks.

## Limits and human follow-up

Models, record content and scripted players are fictional. The 20–30 minute target
has not been measured with people. Party action counts do not establish balanced
conversation. Actual low-end phones, reading load, difficulty and satisfaction
need fresh groups under the [observation protocol](playtest-protocol.md).
Scenery is seeded; truth is authored. The mystery is not endlessly replayable.

The [readiness map](final-readiness.md) and [personal guide](final-personal-review.md)
identify what still requires the student's own experience and judgement.

## Subsequent simulated-player audit

At the student's request, the [22 October multi-player simulation report](simulations/2026-10-22/README.md)
records a full four-identity case, timestamped steps, discussion, offline handover,
UI-driven conflicting chronology writes, screenshots and sanitized server actions.
Visual review found a stale warning surviving a teammate's successful closure;
the report retains the failed regression and the correction. These scripted actors
know the answers and do not constitute human playtesting.
