# Delivery status — 13 October 2026

[Live app](https://comp4020-final-2513238602.fly.dev/) ·
[Public repository](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602)

Technical preparation is implemented and verified. The portfolio is **not yet a
completed personal submission**: human evaluation, personal reflection and the
student's critical reading judgement cannot be supplied by automated checks.

## Requirement and evidence

| Requirement | Current evidence | Remaining limit |
| --- | --- | --- |
| C9: real-time shared state | Separate browser contexts observe publication, chronology and resolution without reload; [hosted results](final-hosted-collaboration.json) | Tested connection, not every network |
| C9: one argued multiplayer choice | [ADR 002](decisions/002-shared-desk-conflicts.md) compares three alternatives and acknowledges false conflicts | Student needs to understand and defend the choice |
| C9: process and reflection | Rewritten PROCESS, incremental commits, `reflections/crit-9.md` evidence draft | Student's personal reflection still incomplete |
| C10: distinct people and server authority | Role-bound browser sessions, private clue filtering, tests for outsiders and concurrent joins; [ADR 003](decisions/003-identities-permissions-and-logs.md) | No account recovery; invitation's second seat can be claimed by its recipient |
| C10: server logs | Real-process tests match committed events to SQLite; live Fly logs observed with field and archive roles | Logs-only exercise with classmates has not happened |
| Final: persists | Two restart cycles recover both players' evidence, timeline, failed attempt and solved state; [original hosted record](persistence-oct13-results.json) from 5 October restored on 13 October | Original cookies required; this does not test recovery after losing identity |
| Final: both viewports | Full playthroughs at 1920×1080 and 390×844; 14 combined axe scans; keyboard and overflow checks | Automated accessibility is not a human usability study |
| Final: slow or interrupted connection | [Hosted recovery results](resilience-hosted-results.json): delay, lost acknowledgement, timeout and failed conflict refresh | Uncertain writes are reconciled, never automatically repeated |
| Final: definition, rules, tests agree | README 586 words, CLAUDE rules, HTTP/process/browser checks mapped in spec/README | “Enjoyable” and “both contribute” need observed use |
| Final: process and research | PROCESS 1,017 words; research discussion draft 706 words; [source audit](research-source-audit.md) | Word counts include headings/status text; authorship and judgement remain the student's |

## Meaningful release steps

1. [`cff71d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/cff71d1)
   makes partner actions visible, preserves reading and tests actual conflicts.
   [CI and deployment passed](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/38333942653).
2. [`dee5c79`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79)
   makes logs explain committed changes and rejected requests, with a permissions
   argument. [CI and deployment passed](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/38334262358).
3. [`47e2c37`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/47e2c37)
   handles uncertain saves, broadens restart evidence and runs browser acceptance
   before deploy. [CI and deployment passed](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/38334854444).

The following documentation release consolidates the current argument and evidence;
it does not rewrite these commits or any earlier cutoff state. Commit messages
explain why each step exists, rather than merely announcing progress.

## Work requiring the student

Use the [blind playtest protocol](playtest-protocol.md) with one first-time pair
and record genuine confusion and reasoning. A preparation allowance is 30–45
minutes for observation and notes; any resulting correction depends on what occurs.
Timing correction, 18 October: C10 reflection must be submitted **before its
cutoff**, based on actual development or pre-class rehearsal. The classroom
[logs-only exercise](crit-10-rehearsal.md) happens later and can supply subsequent
observations; it is not a reason to delay submission. The C10 reflection is now
written with disclosed agent assistance from project instructions and recorded
changes. C8/C9 personal work remains separate. C8's existing tag remains unchanged;
a later revised reflection cannot backdate its release or repair a past cutoff.

Review the README position and research sources, then revise the note in the
student's own argument. Allow roughly 2–4 hours for reading/revision and 1–2 hours
for reflections and final evidence review, plus any changes motivated by play.
These are planning allowances, not measured completion times. There is no known
remaining mandatory feature to add simply for final credit.

## Course boundaries

C9 Liuru cutoff: 14 October 2026, 13:30 Sydney, two hours before the session.
Final: 9 November 2026 at noon. The same final repository serves C8–C10 and A3.
Do not create another prototype or deploy to C7. Preserve fixed course resources
and existing tags. A passing `check:evidence` checks presence and commit links;
it does not certify authentic reflection, reading or completion of a class exercise.

Sources: [C9](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/09-all-at-once/),
[C10](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/10-fly-by-instruments/),
[final brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/),
[assessment mechanics](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/).
