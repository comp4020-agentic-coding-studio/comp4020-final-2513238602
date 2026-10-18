# Delivery status — 18 October 2026

[Live app](https://comp4020-final-2513238602.fly.dev/) ·
[Public repository](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602)

The C10 implementation and assisted pre-crit reflection are complete. The release
record and technical checks are in [C10 verification](c10-verification.md).
The classroom exercise remains an in-person requirement; this is not a claim
that the student has already narrated a pair's actions or finished the final
portfolio's human evaluation.

## C10 requirements

| Requirement | Evidence | Boundary |
| --- | --- | --- |
| Distinct people changing shared state | Separate cookie jars, same-name actors identified by member and role; HTTP and two-browser tests | A nickname is a label, not an account |
| Server-enforced permissions with reasons | [ADR 003](decisions/003-identities-permissions-and-logs.md), private-clue filtering, membership on snapshots, mutations and streams; forged-cookie and cross-room tests | No account recovery; invitation can claim an empty second seat |
| Logs identify who did what | Committed events follow COMMIT; rejections are separate; terminal reader supports actual Fly multiline JSON | SQLite is durable history; stdout is not an exactly-once ledger |
| Process and weekly reflection | Rewritten PROCESS, substantive [crit-10 reflection](../reflections/crit-10.md), meaningful staged commits | Assistance is disclosed; classroom observations are not invented |
| URL-only class exercise | [Terminal commands and narration guide](crit-10-rehearsal.md) | Two classmates must actually participate at the session |

For Liuru, submit before **21 October 2026, 13:30 Sydney**, two hours before the
15:30–17:00 session. The reflection belongs in that pre-cutoff submission. A later
classroom account may record observations without moving the frozen cutoff tag.
C8 and C9 tags remain unchanged; later improvements do not backdate their state.

## What carries forward to final

| Requirement | Current evidence | Remaining judgement |
| --- | --- | --- |
| Multi-user and real-time | Separate-browser publication, chronology and resolution; stale competing moves are rejected explicitly | Test timings describe the measured run, not every network |
| Persists | Two real process restarts recover both identities and a solved case; original 5 October hosted record still restores | Original cookies are required; losing identity is not recovered |
| Both marking viewports | Full 1920×1080 and 390×844 playthroughs, keyboard and overflow checks, 14 combined axe scans | Automated accessibility is not a human usability study |
| Slow or interrupted connection | Delayed writes, lost acknowledgements, 12-second timeout and failed conflict refresh | Uncertain saves retrieve state rather than automatically repeating |
| Definition, rules and checks agree | README, CLAUDE, three ADRs and [test map](../spec/README.md) | Both players contributing and an earned conclusion require observed use |
| Process portfolio | Rewritten PROCESS, C10 reflection and substantive assisted C8/C9 retrospectives completed on 18 October | Student must review the positions; past cutoff states stay frozen |
| COMP8020 research | 735-word review draft (whitespace count including headings and links), updated through the dated May 2026 survey, and [source audit](research-source-audit.md) | Student must read, weigh the sources and defend or revise the argument |

The core required functionality is implemented. There is no mandatory additional
feature simply for final credit. Remaining work is evaluation and a defensible
portfolio, plus corrections justified by what that evaluation reveals:

1. Run the [blind playtest](playtest-protocol.md) with a first-time pair; preserve
   confusion and contrary observations. Allow 30–45 minutes for play and notes.
2. Complete the actual C10 logs-only classroom exercise. Record a subsequent
   account of what could and could not be inferred; do not rewrite the past.
3. Review the personal portfolio and research argument against the original
   sources. Allow roughly 2–4 hours for reading/revision and 1–2 hours for final
   evidence review. These are planning allowances, not measured durations.
4. Implement any resulting correction as a justified step, rerun affected checks,
   and verify the final public commit and deployed site before the deadline.

Final is due **9 November 2026 at noon**. The same final repository serves C8–C10
and A3. Passing `check:evidence` establishes file presence and resolving commit
links; it does not certify authentic human experience or the quality of an argument.
`pnpm check:portfolio` additionally requires all three reflections and checks the
final documents' links, citations and length guidance. Completing a retrospective
now improves the final portfolio without changing its earlier crit cutoff record.

Sources: [C10](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/10-fly-by-instruments/),
[final brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/),
[assessment mechanics](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/).
