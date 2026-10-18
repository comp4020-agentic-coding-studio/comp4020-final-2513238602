# Process overview

This agent-assisted account describes the C10 pre-crit submission. The student
challenged an assignment mismatch, requested an original direction, authorised
public deployment, and required meaningful incremental uploads. Implementation
and automated verification were performed by coding agents. Each release had to
explain its problem, decision and evidence. The C10 reflection is written with
disclosed assistance, grounded in those instructions and recorded changes. No
independent human playtest or completed classroom exercise is claimed.

## Choosing the right problem

The first risk was building for the wrong assessment. The remembered RoomFlow
repository belonged to C7; C8 begins the final repository, continued through C10.
Checking the briefs established that the topic is open while multi-user operation,
real-time updates and persistence are fixed. Course HTTP invariants and Fly limits
were retained.

[`1a0ca88`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a0ca88)
bounded Lost & Found to one original mystery, eight clues and four events. Good
cooperation means a partner's detail changes another clue's meaning. The Past
Within supplied that communication principle; Robin Sloan's home-cooked software
essay supported designing for classmates. Their links are in README.md. These
arguments do not establish enjoyment. Solo mode trades information asymmetry for
an experience someone arriving alone can complete.

## Stack and harness

React and plain CSS provide the working surface. One Node service and SQLite fit
the single machine and persistent volume, avoiding an unrelated database, identity
service or gameplay AI dependency. Synchronous transactions simplify atomic changes
but block the service while executing. This suits two-person rooms, not a claim of
production capacity. [ADR 001](docs/decisions/001-small-persistent-service.md)
records the alternatives.

[`84f4d51`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/84f4d51)
introduced membership checks, withheld private clues and versioned shared state.
PRODUCT.md bounds scope; docs/case-design.md fixes the answer; CLAUDE.md turns
decisions into instructions. Tests protect observable promises. Separate browser
cookie jars ensure apparent cooperation cannot depend on accidentally sharing an
identity.

## Correcting the experience

The archive initially disclosed too much alone. An authoring review replaced its
destination with a code requiring the field map, its named person with a role
requiring the access record, and made the camera time require a clock correction.
The rule that neither folder contains the complete explanation entered CLAUDE.md.
This checks the content claim, not how new players actually reason.

[`63989e3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/63989e3)
records the interface and browser harness. Taste Skill informed the editorial
entrance; Impeccable and Vercel guidance informed review. Provenance is in
docs/assets.md. Text carries every inference. A scan caught the case number's
contrast, corrected before recorded screenshots. Visual polish was inspected in
the working investigation, not accepted from a mockup.

## Making cooperation observable

The C8 harness exposed a missed update after an offline interval.
[`bb98630`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/bb98630)
explicitly reconnects and retrieves state. For C9,
[`cff71d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/cff71d1)
adds an attributed latest action without switching the selected clue. A remote
resolution closes an obsolete explanation dialog. Stale chronology writes are
rejected rather than silently overwriting another move.
[ADR 002](docs/decisions/002-shared-desk-conflicts.md) compares last-write-wins,
locking and merging. A conservative room version can reject a move after unrelated
publication; that cost is explicit.

The browser test holds two requests and releases them together. One succeeds, one
receives a visible conflict, and both screens converge. It measures rendered
publication, chronology and resolution, not just SSE receipt. Its first hosted
run measured eleven updates at 48–71 milliseconds, evidence for that connection
only. The harness itself once computed another move before the sender rendered
its previous change. Waiting for both screens corrected the test's inference.

## C10: identity and trustworthy instruments

[`dee5c79`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79)
corrected logs that lacked actor context and printed before transaction completion.
Committed events now identify room, member, role, saved detail and version;
rejections are separate. Tests compare emitted IDs with persisted activity and
check that credentials and nicknames are absent.
[ADR 003](docs/decisions/003-identities-permissions-and-logs.md) explains
browser-owned seats, equal authority over shared reasoning and invitation limits.

For this round, the primary agent delegated a permissions audit and an isolated
log-reader implementation in parallel, retaining responsibility for integration
and verification. The audit found two concrete gaps.
[`3359af4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/3359af4)
preserves member and role in activity and displays roles beside nicknames, so two
players called Alex remain distinguishable. It also makes repeated publication
leave version, timestamp and activity unchanged. Previously, that harmless repeat
could manufacture a conflict for a partner's valid move. New HTTP cases exercise
same-name actors, concurrent repeats, forged identities and per-room roles; the
two-browser rehearsal checks the visible attribution. A proposed instrument needs
checking against actual server output as well as synthetic examples.

[`8df36bb`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/8df36bb)
adds the terminal reader. Real Fly output exposed a faulty assumption: its JSON
objects span lines. Bounded stream parsing replaces line parsing, with regressions
for malformed input. Seven committed hosted actions matched the saved record;
two rejected requests were reported separately. The first immediate snapshot
preceded log propagation; a later snapshot
confirmed the actions. Empty output alone would have supported the wrong conclusion.

## Honest recovery

[`47e2c37`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/47e2c37)
corrected feedback claiming the latest order had loaded before recovery succeeded.
The client now distinguishes rejection from uncertain confirmation and retrieves
saved state before suggesting a retry. Browser checks delay writes, lose a
response after commit, exceed the timeout and fail a conflict refresh. This keeps
feedback tied to observation rather than an optimistic animation. Restart tests
recover both identities, evidence, chronology, an unsuccessful explanation and
the solved state. Deployment persistence is checked using the original hosted
verification identity, without reseeding it.

## Release and remaining judgement

The student's requirement for substantive upload comments determines the release
units: a coherent correction, its reason and its validation, followed by a push.
Public main uses course CI and Fly deployment. Secrets stay ignored; existing
C8 and C9 cutoff tags remain unchanged. The late C8 release cannot be repaired by
later work.

[`f741735`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/f741735)
completed the assisted pre-crit reflection and corrected guidance that had deferred
it until after class. Reflection is required before cutoff; classroom observations
can follow separately. The prepared logs-only exercise still requires classmates
and student narration without operating the interface. It has not happened.

[Readiness](docs/final-readiness.md) indexes verification and remaining limits.
Human evaluation must establish whether both players contribute, the clock
correction is discoverable and the conclusion feels earned. The student must also
review the research argument and remaining personal portfolio. Automated checks
and word counts cannot establish those judgements or certify final completion.
