# Marking-environment evidence — 25 October 2026

Automated execution by the coding agent. No human participants. This extends the
[22 October full-case simulation](../../simulations/2026-10-22/README.md), rather
than reclassifying its known-answer actors as first-time players.

## What was missing and why this check exists

Earlier suites covered the two marking sizes separately, interrupted writes and
WebGL failure. They did not explicitly resize an active After Hours draft or keep
the 3D module unavailable while making progress. The top-band requirement asks
the app to hold up beyond its intended path. These observable contracts now live
in CLAUDE.md and `check:after-hours-marking`, which CI runs before deployment.

## Executed results

Both runs used Chrome **155.0.8059.86**, two independent browser contexts, and
the application at `54ee92a455bea5dca46ffabc96e2f9eb26666469`. Application code
was unchanged; the new test's SHA-256 is in each result. The local server used
an isolated database. The hosted run created a separate disposable investigation.

| Check | Local | Course Fly deployment |
| --- | --- | --- |
| Find entry from the README and join with distinct identities | Pass | Pass |
| Inspect/share while the 3D module is deliberately withheld | Pass | Pass |
| Resize during uncommitted inspection; retain selection and pending status | Pass | Pass |
| Resize a reasoning draft; partner publication retains choice, citations and focus | Pass | Pass |
| Offline partner catches up under explicit bandwidth/latency limits without reload | Pass | Pass |
| Hold a deduction for 1.8 seconds, resize, then confirm exactly one saved attempt | Pass | Pass |

[Local results](local.json), started 06:36 UTC; [hosted results](hosted.json),
06:37:04–06:37:11 UTC. These are scripted execution times, not human play times.
The normal publication-to-visible measurement was **34 ms locally / 65 ms hosted**.
The throttled reconnect-to-visible measurement was **202 ms / 205 ms**.
No page JavaScript exceptions were captured. Both first browser runs passed;
no new application defect was found in these scenarios.

The network profile adds **150 ms latency**, **512 KiB/s download** and **128 KiB/s
upload** to one browser after entry. A separate gate withholds the 3D module;
another withholds a deduction before forwarding it. These are different tests:
they do not claim to emulate a particular mobile carrier or measure cold-load
performance under that bandwidth limit. The timing assertions use a 1.5-second
normal-update bound; the recovery measurement is descriptive, not a worldwide SLA.

## Screenshots and reproduction

- [Progress while 3D is still loading](screenshots/scene-loading-text-progress.png)
- [Phone draft with newly arrived evidence and retained focus](screenshots/phone-live-draft.png)
- [Draft after reconnection](screenshots/reconnected-draft.png)
- [Pending deduction after resize](screenshots/pending-deduction-phone.png)
- [Confirmed deduction](screenshots/supported-deduction-phone.png)

All screenshots are from the hosted run and contain authored puzzle spoilers.
The [artifact manifest](artifact-manifest.json) identifies the public files by
SHA-256. No cookies, room codes, member IDs or raw browser traces are exported.
The screenshots were inspected separately from the automated assertions.

From the repository, set `APP_URL` to an isolated running app (or the course URL)
and run `mise exec -- pnpm check:after-hours-marking`. Each run writes a fresh
ignored `data/marking-*` folder and refuses to overwrite prior results. Local
Chrome is the default; CI uses Playwright Chromium through `BROWSER_CHANNEL`.

This evidence supports interaction resilience. It does not establish enjoyment,
equitable conversation, real-phone GPU performance, or student endorsement.
The [human observation protocol](../../playtest-protocol.md) remains outstanding.

## Portfolio navigation regression

The subsequent document audit found a separate defect outside the six gameplay
scenarios: both repository-relative evidence links in the deployed README
resolved under `/readme/docs/`, returning **404**. The earlier HTTP check compared
the rendered links with the Markdown source, so it accepted the same mistake
on both sides. [Hosted responses before correction](readme-links-before.json)
record the actual destinations and statuses at 06:41:41 UTC.

The extended HTTP check follows same-origin destinations. It
[failed before correction](readme-regression-before.txt) and
[passed afterwards](readme-regression-after.txt). The README now uses explicit
public repository URLs for the verification record and observation protocol,
and directly exposes PROCESS and the research note. All four corrected
destinations returned **200** when followed from the
[local revised README](readme-links-after-local.json). These local results do
not claim that an unpushed revision was already deployed. The stage's public
GitHub Actions check/deploy record establishes publication separately.

## Returning on another day

At 06:42 UTC on 25 October, the [main-case fixture](main-case-persistence.json)
created on 22 October restored both original identities, the seed and duties,
private/shared discoveries, deduction, chronology, note and contributions.
The [classic fixture](classic-persistence.json) created on 5 October retained its
original identity and F1 publication after twenty days. No fixture was reseeded.
These read-only checks use original cookies held in ignored local files; no
credentials were copied to this report. They complement process-restart tests
and do not promise recovery after a person deletes their identity cookie.

Stage one [a928205](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/a928205)
passed the full [CI check and deployment](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/40169797519),
including all 41 HTTP/process tests and eleven browser suites.
