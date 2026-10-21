# Process overview

This agent-assisted account describes preparation for the final portfolio. The
student challenged an assignment mismatch, authorised public deployment and
required meaningful incremental uploads. Coding agents implemented and verified
the work. Reflections disclose assistance and distinguish recorded instructions
from automated observations. No independent human playtest or completed C10
classroom exercise is claimed.

## Choosing the right problem

The first risk was building for the wrong assessment. RoomFlow belonged to C7;
C8 begins the final repository, continued through C10. Checking the briefs
established an open topic with fixed multi-user, real-time and persistence
requirements. Course HTTP invariants and Fly limits were retained.

[`1a0ca88`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a0ca88)
bounded Lost & Found to one original mystery, eight clues and four events. Good
cooperation means a partner's detail changes another clue's meaning. The Past
Within supplied that communication principle; Robin Sloan's home-cooked software
essay supported designing for classmates. Sources are in README.md. These
arguments do not establish enjoyment. Solo mode trades information asymmetry for
an experience someone arriving alone can complete.

## Stack and harness

React and plain CSS provide the working surface. One Node service and SQLite fit
the single machine and persistent volume, avoiding additional database, identity
or gameplay AI services. Synchronous transactions simplify atomic changes but
block the service while executing. This suits small rooms, not a claim of
production capacity. [ADR 001](docs/decisions/001-small-persistent-service.md)
records the alternatives.

[`84f4d51`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/84f4d51)
introduced membership checks, withheld private clues and versioned shared state.
PRODUCT.md bounds scope; docs/case-design.md fixes the answer; CLAUDE.md turns
decisions into instructions. Separate browser cookie jars ensure apparent
cooperation cannot depend on accidentally sharing an identity.

## Correcting the experience

The archive initially disclosed too much alone. Authoring review replaced its
destination with a code requiring the field map and its named person with a role
requiring the access record. Camera time requires a clock correction. The rule
that neither folder contains the complete explanation entered CLAUDE.md. This
checks content structure, not how new players reason.

[`63989e3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/63989e3)
records the interface and browser harness. Taste Skill informed the editorial
entrance; Impeccable and Vercel guidance informed review. Text carries every
inference. A scan caught the case number's contrast, corrected before screenshots.
Visual polish was inspected in the working investigation.

## Making cooperation observable

The C8 harness exposed a missed update after an offline interval.
[`bb98630`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/bb98630)
explicitly reconnects and retrieves state.
[`cff71d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/cff71d1)
then added attributed actions without switching the selected clue, and dismissed
an obsolete explanation dialog after remote resolution. Stale chronology writes
are rejected rather than silently overwriting another move.
[ADR 002](docs/decisions/002-shared-desk-conflicts.md) compares last-write-wins,
locking and merging. Rejecting a move after unrelated publication remains an
explicit cost of the conservative room version.

The browser test holds two requests and releases them together: one succeeds,
one receives a visible conflict, and both screens converge. It measures rendered
state, not just SSE receipt. The harness once calculated another move before the
sender rendered its previous change. Waiting for both screens corrected its
inference. Tests themselves need scrutiny.

## Identity and trustworthy instruments

[`dee5c79`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79)
corrected logs lacking actor context and printing before transaction completion.
Committed events identify room, member, role, saved detail and version; rejections
are separate. Tests compare emitted IDs with persisted activity.
[ADR 003](docs/decisions/003-identities-permissions-and-logs.md) explains
browser-owned seats, equal authority over shared reasoning and invitation limits.

The primary agent delegated permissions review and log-reader implementation in
parallel, retaining integration and verification responsibility.
Separate scopes allowed an independent audit alongside implementation; acceptance
still required checking their combined behaviour.
[`3359af4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/3359af4)
addresses two findings: roles distinguish identical nicknames in history, and
repeated publication no longer advances the version or manufactures a conflict.
HTTP cases and a two-browser rehearsal check those boundaries.

[`8df36bb`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/8df36bb)
adds the terminal reader. Actual Fly output exposed multiline JSON, requiring
bounded stream parsing instead of line parsing. Seven committed hosted actions
matched saved history; two rejected requests remained separate. Log propagation
also delayed the first snapshot. Empty output alone would have supported the
wrong conclusion.

## Recovery includes returning and starting

[`47e2c37`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/47e2c37)
corrected feedback claiming a conflict refresh succeeded before it returned.
Browser checks delay writes, lose acknowledgements after commit, exceed the
timeout and fail recovery. Restart tests recover both identities and saved
reasoning; hosted persistence uses the original verification identity without
reseeding it.

[`f0b3512`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/f0b3512)
addresses two final-review failures for returning users: history errors looked like empty history,
and older investigations disappeared beyond a fixed limit. Pagination now retains
existing links and exposes loading, retry and reconnection states. Review caught
an error in the proposed pagination: a partner's update could move an unseen room
past a cursor based on last update time. Ordering by immutable creation time and room code
prevents that omission, at the cost of not promoting recently changed cases.
HTTP and browser checks exercise older files, interruptions and returning users.

A lost creation acknowledgement could also encourage duplicate investigations.
Entry now confirms browser identity first; shared pending identity requests avoid
competing first-session cookies. Unconfirmed creation offers existing case files
and an explicitly labelled choice to create another investigation. Unconfirmed
joining retrieves the known room instead of posting again. Browser checks
lose replies after real commits and verify one room or the same saved member.
The primary agent integrated these parallel fixes and ran the combined checks:
32 tests and five browser suites passed, followed by container CI and hosted
replay. The original October 5 identity and earlier solved duo survived redeployment;
[verification](docs/final-verification.md) separates these checks from human use.

On October 20, the student's screenshot exposed a disabled explanation button
with only Field evidence selected.
[`352167b`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/352167b)
replaces that dead end with missing-evidence guidance and retains drafts during
review. Earlier tests populated both folders before submitting, missing this path.
The new browser regression covers incomplete citations and live partner publication;
this reported usability problem does not establish broader playtest findings.

## Release and remaining judgement

The [motion pass](docs/motion-design.md) also makes confirmed collaboration visible.

Each coherent correction is uploaded with its reason and validation. Public main
uses course CI and Fly deployment; secrets remain ignored.
[`f741735`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/f741735)
completed the assisted C10 reflection before its cutoff and corrected guidance
that had deferred it until class.
[`ca3d8b4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/ca3d8b4)
completed the C8/C9 retrospectives as explicitly dated October 18 additions,
revised the research sources and added a final-specific portfolio check. That
check requires all three reflections and verifies references; it cannot certify
authentic experience. Existing C8/C9 cutoff tags stay unchanged, including C8's
late release.

[Readiness](docs/final-readiness.md) records current evidence and limits. C10's
classroom narration has not happened. Human observation must still establish
whether both players contribute and the conclusion feels earned. The student
must review the assisted positions and research argument. Those judgements,
and any corrections they motivate, remain part of final preparation.
