# Process overview

This agent-assisted account describes the project at C9, including technical
preparation for C10. It separates the student's instructions from implementation
and verification performed by the coding agent. The student challenged an
assignment mismatch, requested an original direction, authorised implementation
and public deployment, and then required meaningful incremental uploads. Each
step had to explain its purpose and evidence. No independent human playtest or
completed classroom exercise is claimed. Personal reflections and the research
position still need the student's own judgement.

## Choosing the right problem

The initial risk was building for the wrong assessment. The remembered RoomFlow
repository belonged to C7; C8 begins the final-project repository, continued
through C9 and C10. Checking the official briefs established that the topic is
open, while multi-user operation, real-time updates and persistent state are
fixed. The original course HTTP invariants and Fly resource limits were retained.

[`1a0ca88`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a0ca88)
bounded Lost & Found to one original mystery, eight clues and four events. Its
definition of good is a partner's detail changing the meaning of another clue.
The Past Within supplied a communication principle; Robin Sloan's home-cooked
software essay supported designing for a few classmates rather than a generic
social platform. Their links are in README.md. These are design arguments, not
evidence that this implementation is enjoyable. Solo mode trades away information
asymmetry so someone arriving alone can still complete the experience.

## Stack and harness

React and plain CSS provide the working surface. One Node service and SQLite
fit the course's single machine and persistent volume. This avoids an unrelated
hosted database, managed identity service or gameplay AI dependency. SQLite's
synchronous transactions simplify atomic state changes at this scale; they also
block the service while executing. The choice is for two-person rooms, not a
claim of production capacity. [ADR 001](docs/decisions/001-small-persistent-service.md)
records the architecture and alternatives.

[`84f4d51`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/84f4d51)
introduced membership checks, withheld private clues and versioned shared state.
PRODUCT.md bounds scope; docs/case-design.md fixes the ground truth; CLAUDE.md
turns the argument into instructions. Tests protect observable promises instead
of merely checking that components render. Browser sessions are separate cookie
jars, so apparent cooperation cannot depend on accidentally sharing an identity.

## Correcting the experience

The archive folder initially disclosed too much by itself. An authoring review
changed the receipt to a location code requiring the field map, the instruction
to a role requiring the access record, and the camera time to require a clock
correction. The rule that neither folder contains the complete explanation went
into CLAUDE.md. This content correction is evidence of checking the product
claim; it is not a substitute for watching new players reason together.

[`63989e3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/63989e3)
records the interface and browser harness. Taste Skill informed the editorial
entrance; Impeccable and Vercel guidance informed review. Asset provenance is in
docs/assets.md. The paper treatment supports readable records, while text carries
every inference. An accessibility scan caught the case number's contrast, which
was corrected before the recorded screenshots. Visual polish was checked against
the working investigation, not accepted from a static mockup.

## Making cooperation observable

The C8 browser harness exposed a missed update after an offline interval.
[`bb98630`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/bb98630)
explicitly reconnects and retrieves current state. Returning to a visible tab also
refreshes. The regression scenario and rule remain in the harness.

For C9,
[`cff71d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/cff71d1)
adds an attributed latest action without switching the reader's selected clue.
A remote resolution closes an obsolete explanation dialog. The important choice
is conflict behaviour: stale chronology writes are rejected rather than silently
overwriting another move. [ADR 002](docs/decisions/002-shared-desk-conflicts.md)
compares last-write-wins, desk locking and merging. A conservative room version
can reject a move after unrelated evidence publication; that cost is explicit.

The new browser test holds two real requests and releases them together. One
succeeds, one receives a visible conflict, and both screens converge. It measures
publication, chronology and resolution rendering, not merely receipt of an SSE
packet. The first hosted run measured eleven updates at 48–71 milliseconds.
Those observations describe that connection and run, not every user's network.

## Logs and honest recovery

[`dee5c79`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79)
prepares the C10 instrument panel. Logs previously lacked useful actor context
and printed before transaction completion. They now describe committed actions
with role, member, saved detail and version; rejected requests are separate.
Tests compare emitted event IDs with persisted activity and check that credentials
and nicknames are absent. [ADR 003](docs/decisions/003-identities-permissions-and-logs.md)
explains browser-owned seats, equal authority over shared reasoning, and the
limits of invitation links and lost cookies.

[`47e2c37`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/47e2c37)
corrects another false promise: a conflict message claimed the latest state had
loaded before its recovery request succeeded. The client now distinguishes failed
confirmation from rejected writes and verifies the saved state before suggesting
a retry. Browser tests delay requests, lose a response after commit, exceed the
request timeout and fail the recovery fetch. They run in CI before deployment.

The expanded browser harness itself needed correction. It could compute another
move before the sending screen rendered its previous change, even though the
receiving screen was current. Detailed logs exposed the extra move. Waiting for
both screens and checking the response fixed the test's inference. A test is
evidence only when its observation matches the claim it is supposed to establish.

## Release and remaining judgement

Work was uploaded after each coherent, verified step, with commit bodies recording
the problem, choice and validation. Public main pushes use the course CI and Fly
deployment. Secrets remain ignored; previous cutoff tags are preserved. The C8
public release was after the Liuru cutoff; later work does not repair that timing.

Fifteen service/process tests cover permissions, competing writes, log attribution
and real restarts. Browser checks cover both marking viewports, offline recovery,
uncertain writes and full resolution. The old hosted verification investigation
remains retrievable after multiple deployments and days. Current release evidence
and limits are indexed in [readiness](docs/final-readiness.md).

The remaining evaluation needs people: whether each player contributes, whether
the clock correction is discoverable, and whether the explanation feels earned.
C10 also requires actual classmates and narration from logs alone. A repeatable
protocol is prepared, but observations are not invented. The student must use
those experiences and their own reading to finish the personal portfolio; passing
the evidence filename check cannot establish that contribution.
