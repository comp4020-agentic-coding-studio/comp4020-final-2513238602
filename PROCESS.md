# Process overview

This agent-assisted account describes the project on 25 October. The student's
recorded direction was consequential: challenge a mistaken assignment context,
require meaningful staged uploads, then replace a shallow mystery with a
friends/family investigation after reporting tutor feedback. The agent implemented
and checked those changes. On 25 October the student specifically requested
narrower guarantees and an audit of unsupported claims. This revision implements
that review direction; it does not establish source reading or classroom activity.

## The brief became a working contract

RoomFlow belonged to C7, not this final repository. The open final brief fixed
multi-user identity, real-time updates and persistence. The initial gallery case
in [1a0ca88](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a0ca88)
turned those requirements into two perspectives on one disappearance. The Past
Within informed information asymmetry; Robin Sloan supported a deliberately small
audience. Keep Talking and Nobody Explodes later sharpened the comparison:
conversation can be necessary without importing its countdown pressure. These
references motivate the design; they do not prove this game is enjoyable.

The workflow makes observable parts of the argument testable: state a claim in
README, constrain implementation in CLAUDE, then test behaviour through real HTTP and
independent browsers. Agents propose and implement changes, while saved results
and screenshots provide acceptance evidence. The chosen rationale is to examine
behaviour beyond a feature list, while recognising that test boundaries can be wrong.

React supports the changing workspace; one Node service and SQLite fit the course
machine and persistent volume. Synchronous transactions simplify atomic changes
but briefly block the service. Browser cookies avoid account setup but cannot
recover a seat after cookies are cleared. [ADR 001](docs/decisions/001-small-persistent-service.md)
records the service trade-off. This is a small-room design, not a scaling claim.

## Failures changed what acceptance required

Early review found that the archive revealed too much alone. Codes replaced
standalone names and destinations, and the cross-folder rule entered CLAUDE.
[bb98630](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/bb98630)
repaired missed updates after an offline interval by reopening the stream and
retrieving current state. Version checks reject competing chronology writes;
[ADR 002](docs/decisions/002-shared-desk-conflicts.md) acknowledges that unrelated
publications can also invalidate a pending move.

[dee5c79](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79)
made actor attribution and commit timing explicit in logs. A requested action
cannot be narrated as saved before COMMIT. Lost acknowledgements are similarly
uncertain: the interface reads current state instead of automatically repeating
a write. This reduces duplication risk in the tested recovery flows; a failed
recovery read still leaves the outcome uncertain.

The student's screenshot exposed another blind spot: an unexplained disabled
submission with only Field evidence selected. [352167b](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/352167b)
added actionable citation guidance and retained drafts. Earlier tests had supplied
both folders first. Testing the incomplete path corrected the acceptance rule,
not merely the visual symptom.

## Depth required a different reasoning structure

Reported tutor feedback challenged the game's depth. The redesign prioritised
linked evidence over additional decoration. [67c3434](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/67c3434)
established After Hours' authored rules before the 3D interface: sixteen records,
seven supported deductions, three acts and a six-event reconstruction. Authoring
checks verify that every configured support set crosses the initial two-player
split. A correct guess with unrelated citations fails; alternative valid supports
remain possible.

[2cea1e4](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/2cea1e4)
made this structure playable in procedural rooms. Geometry is generated, but truth
is authored. Free movement, physics and generated mysteries were excluded because
they add implementation uncertainty without establishing complementary reasoning.
[ADR 004](docs/decisions/004-authored-mystery-procedural-rooms.md) records that cost.
The object list deliberately exposes the same facts and actions: visual exclusivity
would make motor precision or GPU support decide who can investigate.

[34845c7](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/34845c7)
added duty handovers, discussion and contribution records. Four same-name identities
tested ownership, private discovery transfer and offline return. Counts describe
saved actions, not whose reasoning mattered. A stronger player may still dominate
after publication; the rules alone cannot settle that design risk.

## Production exposed timing and evidence gaps

[9961819](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/9961819)
added interrupted-save and actual WebGL-loss checks. Lazy loading, instancing and
demand rendering target client download/drawing work; build-time gzip avoids
runtime compression work on the service. These mechanisms do not establish a
measured performance gain on real family devices.

The first hosted replay exposed a race hidden by fast local execution: intentional
canvas disposal triggered the failure listener and disabled restoring 3D.
[1a5bcef](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a5bcef)
removes listeners with their canvas. The regression waits through deferred disposal
before restoring the scene. The failed hosted record remains visible; absence of
a JavaScript exception had not established a complete playthrough.

A second failure was more instructive. Four scripted players completed 63 steps,
yet screenshot inspection found an old conflict warning above the confirmed
ending. [6fe6cc3](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/6fe6cc3)
clears obsolete warnings only after shared closure. A new assertion first failed
on the old deployment, then passed after correction; the behaviour became a
CLAUDE rule and CI regression. [54ee92a](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/54ee92a)
preserves before/after screenshots, both script-development mistakes and hosted
replays. Known-answer actors exercised scripted interaction paths; they did not
test blind puzzle solving or establish correctness beyond those paths.

## Closing the audit loop

The 25 October review identified untested transitions between marking viewports.
[a928205](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/a928205)
adds six scenarios: README entry, withheld 3D delivery, pending-save resizing,
retained focus/citations, constrained reconnection and a held deduction request.
The last scenario observed one outgoing request and one saved attempt through
resizing. It does not establish general exactly-once processing under retries,
duplicate delivery or crashes.
[Results](docs/verification/2026-10-25/README.md) include Chrome version, network
conditions and script hashes. Both local and hosted runs passed; that bounds the
claim to tested conditions rather than implying every device is covered.

Document review also found that README evidence links resolved to nonexistent
`/readme/docs/` paths. The source and rendered hrefs matched, so the old check
passed. A failing HTTP regression now follows local destinations; explicit public
repository URLs correct the links. This matters because markers enter through the
argument, not through a guided tour of the repository.

Meaningful stages are pushed independently and course CI gates deployment. Forty-one
HTTP/process tests and eleven browser suites check specified behaviours; passing
does not establish exhaustive correctness. The [readiness map](docs/final-readiness.md)
records evidence and limits.
C8/C9 reflections remain dated retrospectives and cutoff tags stay frozen.
The [human protocol](docs/playtest-protocol.md) describes further evaluation;
cooperation, pace and reading suitability remain unmeasured human outcomes.
The [claim audit](docs/claim-review-2026-10-25.md) records the student's review
direction and the agent's corrections without converting those limits into
imagined experiences or an additional publication-approval requirement.
