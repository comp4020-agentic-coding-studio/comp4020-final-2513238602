# C10 verification — 18 October 2026

This records agent-run checks for the pre-crit release. It does not record a
human playtest or the classroom logs-only exercise. The live app is
[Lost & Found](https://comp4020-final-2513238602.fly.dev/).

## Meaningful release steps

| Commit | Problem, result and evidence | CI |
| --- | --- | --- |
| [`f741735`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/f741735) | Complete the assisted pre-crit reflection; correct guidance that incorrectly postponed it until after class | [Run](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39102510405) |
| [`3359af4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/3359af4) | Distinguish same-name members in history and prevent a repeated publication from invalidating a partner's move; four new HTTP cases and updated two-browser checks | [Run](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39102819528) |
| [`8df36bb`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/8df36bb) | Read Fly's actual multiline JSON stream; show saved actions separately from rejected requests; nine reader tests and a classroom command guide | [Run](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39103054037) |

The following documentation commit rewrites PROCESS around this state and
publishes the sanitized results below. Each implementation step was separately
committed and pushed with a reason and validation. Earlier crit tags are retained.

## Local contract and browser checks

The production frontend built successfully. `pnpm check` passed TypeScript and
28 tests across six files. These cover the two original course HTTP invariants,
permissions, shared state, two real process restarts, committed logs, identity
boundaries and the terminal reader. `pnpm check:evidence` resolved the cited
commits and required filenames. See the [test map](../spec/README.md).

The three browser scripts passed against the isolated local server at port 8084:

- Full playthroughs at 1920×1080 and 390×844: 12 axe A/AA scans, keyboard dialog
  operation, no horizontal overflow, failed publication and offline recovery.
- Two independent contexts both named Alex: role attribution, eight publications,
  held competing writes, shared chronology, partner resolution and two additional
  axe scans. All 11 request-to-render samples were 5–21 ms locally.
- Delayed write, lost response after COMMIT, an unanswered write recovering after
  approximately 12 seconds, and a real stale-write rejection whose refresh fails.

The tests assert visible results, not only network messages. They do not measure
human enjoyment or establish that either player contributes an inference.

## Hosted cooperation and logs

The same two-browser collaboration script passed on deployed `3359af4`.
All 11 request-to-visible-render samples were **51–70 ms**; both browsers restored
the solved case. These timings describe this run and connection only.
[Raw measurement summary](c10-hosted-collaboration.json).

A separate isolated HTTPS rehearsal created two same-name browser identities,
published one clue per role, repeated a publication, arranged the chronology,
rejected a stale move and a private-clue publication, then saved an unsuccessful
explanation and a solution. Real `flyctl logs --json --no-tail` output passed
through the reader. Its seven committed actions matched the saved member, role,
action and detail; the two rejections reported HTTP 409 and 403. Both original
identities then recovered identical solved history.
[Sanitized result](c10-hosted-logs.json).

The first immediate Fly snapshot contained no new actions because collection had
not caught up. A later snapshot contained all nine records. The guide starts a
live tail before play and provides a raw-log fallback; no empty display is
treated as proof of inactivity. Fly emits consecutive pretty-printed JSON
objects, not one JSON record per line. Tests reproduce that observed envelope
shape and exercise truncation, oversized input and malformed nesting.

The report excludes cookies, room invitations, member IDs and raw infrastructure
logs. Those are unnecessary for the public result. The actual log reader includes
pseudonymous member IDs so the student can distinguish people during the session.
It does not emit nicknames, credentials, private clue text or arbitrary fields.

## Persistence and presentation

The original hosted investigation seeded on **5 October** was verified again on
**18 October**, 13 complete days later, using its original ignored test cookie.
Its identity and F1 publication remain intact; this check did not seed a fresh
room. [Result](persistence-oct18-results.json). Process tests additionally recover
both cooperative identities through two genuine server restarts.

The updated same-name activity display was inspected in both viewports:

- [Desktop cooperative view](screenshots/cooperative-1920.png)
- [Phone cooperative view](screenshots/cooperative-390.png)

README is 586 words, PROCESS 1,019, C10 reflection 275 and the research draft 706,
counting whitespace-separated words including headings and links. These counts
are size checks, not a judgement of the argument. Publishable worktree files and
reachable Git history passed the course secret scanner before each push; pattern
scanning cannot guarantee the absence of every possible secret.

## What still happens in class

Give two classmates only the URL. They use separate Chrome profiles and the
on-page invitation flow. The student leaves their own app UI untouched and
narrates room, role, member and actions from the terminal. Use the
[rehearsal guide](crit-10-rehearsal.md); record actual observations afterwards.
That human exercise cannot be substituted by this automated rehearsal.

The C10 reflection is already a substantive pre-crit account with disclosed
assistance. Final still needs the human evaluation and portfolio review described
in [readiness](final-readiness.md); it does not require unrelated feature growth.
