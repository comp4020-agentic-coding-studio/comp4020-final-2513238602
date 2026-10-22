# Process overview

This agent-assisted account describes the final project as it stands on 22
October. The student challenged an assignment mismatch, authorised public
shipping, required meaningful staged uploads and then requested a deeper
friends/family detective game after reporting tutor feedback. Implementations,
automated runs and those instructions are evidence; independent human enjoyment,
reading history and classroom participation are not inferred from them.

## Establishing the brief and foundation

RoomFlow belonged to C7. Checking the briefs established that C8 starts the final
repository, with an open topic but fixed multi-user, real-time and persistence
requirements. The original scope in
[`1a0ca88`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a0ca88)
was one short gallery mystery. The Past Within informed information asymmetry;
Robin Sloan supported designing for a small audience. Neither source established
that this particular game was enjoyable.

React and CSS provided the interface. One Node service and SQLite fitted the
course machine and persistent volume, without external identity or gameplay AI
services. Synchronous transactions simplify atomic changes but briefly block the
service; this is a small-room design, not a scalability claim.
[ADR 001](docs/decisions/001-small-persistent-service.md) records that trade-off.
Membership checks and server-held answers separated genuine browser identities
from nicknames and withheld the other folder's unpublished evidence.

## Corrections became contracts

An authoring review found that the archive disclosed too much alone. Replacing
names and destinations with codes required cross-reading. The corresponding
rule entered CLAUDE.md. Browser checks found missed changes after an offline
interval;
[`bb98630`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/bb98630)
reconnects and retrieves current state. Shared updates preserve the selected
record, and version checks reject stale chronology writes. [ADR
002](docs/decisions/002-shared-desk-conflicts.md) explains the cost: an unrelated
publication can also invalidate a pending move.

Logs originally lacked sufficient actor context and could precede commit.
[`dee5c79`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79)
made committed facts distinct from rejected requests. Earlier parallel reviewers
examined permissions and the terminal reader; the primary agent remained
responsible for integration. Same-name actors and repeated publications became
regressions. Actual Fly output exposed multiline JSON, leading to bounded stream
parsing rather than assumptions about line boundaries.

Recovery also required honest uncertainty. A lost response can follow a
successful write. The interface checks saved state without automatically
repeating creation or publication. History pagination uses immutable creation
time and room code so a partner's update cannot move an unseen investigation
past its cursor. Returning-user checks preserve earlier links during failures.

On 20 October, the student's screenshot showed an unexplained disabled submit
button with only Field evidence selected.
[`352167b`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/352167b)
replaced that dead end with actionable citation guidance and retained drafts.
Previous tests had supplied both folders first, missing the problem. The
[motion pass](docs/motion-design.md) later made confirmed changes visible while
protecting focus, reduced motion and overlapping sorts. These corrections improved
interaction, but did not establish sufficient gameplay depth.

## Changing what the game asks of people

The student's reported tutor feedback prompted an explicit scope change: a
friends/family investigation with procedural 3D evidence discovery. Adding more
decoration to four answer selectors would not address that criticism. After
Hours instead introduces sixteen authored records, seven supported deductions,
three acts and a final reconstruction. [The case design](docs/after-hours-design.md)
records the truth, dependencies and proposed human evaluation.

[`67c3434`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/67c3434)
established the rules before the visual interface. Each accepted support set
crosses the two initial perspectives. A guessed correct answer with unrelated
citations fails. Alternative valid support sets remain possible. Four persistent
seats divide duties; private discoveries follow explicit handovers. New rooms
pin a case version and seed, while legacy rooms retain their original rules.

## Building a world within the existing service

[`2cea1e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/2cea1e4)
added the first playable 3D flow. React Three Fiber fits the existing React 19
client. Room geometry is original code; instancing reuses floor tiles and storage
boxes. Scenery is generated, but case truth is authored. [ADR
004](docs/decisions/004-authored-mystery-procedural-rooms.md) explains why free
movement, physics and generated mysteries were excluded.

The text object list shares the server's discovery conditions with the scene.
This costs some visual exclusivity, but prevents motor precision or GPU support
from deciding who can investigate. Camera controls, role labels and object IDs
make the room inspectable. Three.js loads only when opening a scene.

[`ad32d97`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/ad32d97)
completed distinct rooms and the full two-browser case. Review caught a narrative
contradiction: the collected case was still available in the gallery. It became
a matching spare with a dispatch photograph; the register establishes the
collected case's contents. This correction belongs to the authored contract,
not an undocumented visual workaround.

## Cooperation and failure evidence

[`34845c7`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/34845c7)
exposed duty handovers, discussion notes and contribution records. Four independent
browsers with identical nicknames tested seat attribution, private discovery
transfer, retained drafts and an offline participant's return. Contribution counts
report recorded actions; they cannot measure whose conversation mattered most.

[`9961819`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/9961819)
strengthened validation and device recovery. Prototype-property names are rejected
as evidence IDs, duplicate notes are idempotent, and new party events enter the
log reader's allowlist without exposing discussion text. Browser tests lose real
responses after commit and deliberately lose the WebGL context. Keyboard
investigation still works. A touch device retains vertical scrolling over the
canvas; reduced-motion rendering settles instead of drawing continuously.

Build-time gzip reduces the separately loaded 3D payload without compression work
on the small running machine. HTTP tests verify content negotiation and identity
fallback. Forty-one tests and three new browser suites complement the seven
legacy browser suites. Failures found during implementation included insufficient
label contrast; the affected views were corrected and rescanned. Automated
players and software rendering are not substitutes for actual family devices.

The first hosted replay exposed a timing error absent from fast local runs:
intentional canvas disposal triggered the failure listener and disabled restoring
3D. [`1a5bcef`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a5bcef)
removes listeners with their canvas. The regression waits through deferred
disposal before restoring the view. The failed hosted report is retained; a
partial run with no JavaScript exception is not a passed playthrough.

## Release and remaining judgement

Each meaningful stage is committed with its player problem and validation,
pushed to public main and deployed through course CI. The [verification
record](docs/after-hours-verification.md) identifies actual runs and limits.
Existing crit tags remain frozen. C8/C9 reflections remain explicitly dated
October 18 retrospectives; later improvements cannot repair an earlier cutoff.

The reported tutor advice establishes a reason to change direction, not a
completed blind playtest. Fresh groups must still assess pace, clue clarity,
participation and satisfaction. The student must review the assisted portfolio,
confirm any classroom account and defend or revise the research argument.
[Readiness](docs/final-readiness.md) distinguishes completed technical work from
those outstanding personal judgements.
