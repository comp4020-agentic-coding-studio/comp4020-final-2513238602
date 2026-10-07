# Process overview

This agent-assisted account describes the deployed C8 project and its preparation
for public release. It distinguishes the student's direction from implementation
and verification performed by the coding agent. The student challenged an apparent
assignment mismatch, requested an original direction, approved implementation,
and subsequently authorised deployment and public release. No independent human
playtest is claimed. The recorded evidence supports technical behaviour; the
student's judgement of the experience remains a separate contribution.

## Establishing the right assignment

The starting problem was a mismatch between a proposed direction and a remembered
course repository. Course briefs and repositories were checked before coding.
RoomFlow belonged to C7. C8 begins work in the final-project repository, which also
holds C9 and C10. The open topic allows an original app, while the published
invariants and deployment limits constrain how it must operate. This distinction
prevented a visually attractive implementation from becoming work for the wrong
assessment. The original course HTTP tests and fly.toml were retained.

The selected direction was a small cooperative mystery called Lost & Found.
The first local planning commit,
[`1a0ca88`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/1a0ca88),
established one original case, a bounded set of eight clues and a definition of
good. The central claim is that a detail from a partner changes how another clue
is understood. Five minutes is a design target, not an observed result. Solo mode
lets a visitor experience the whole case without finding a partner first.

## Harness and implementation choices

PRODUCT.md defines scope; docs/case-design.md records the ground truth and clue
dependencies; CLAUDE.md turns those intentions into instructions for subsequent
agent work. The implementation uses React and plain CSS for the client, with one
Node service and SQLite. This keeps the database within the course's single
machine and persistent-volume model. It avoids an unrelated hosted database or
an AI API dependency. The concrete architecture is recorded in the
[decision note](docs/decisions/001-small-persistent-service.md).

[`84f4d51`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/84f4d51)
introduced the service and persistence model. An opaque browser cookie identifies
a session; every room endpoint checks membership. Clients receive only their own
clues and clues their partner has published. The event stream announces a changed
version, then the client retrieves an authorised snapshot. It does not broadcast
private evidence to every participant. A timeline write includes the version it
was based on, allowing a stale write to fail visibly rather than overwrite a
partner's newer move. Transactions commit before the app reports a successful save.

These choices also have limits. Clearing the cookie loses access; there is no
cross-device account recovery. One case is replayable but cannot surprise someone
who already knows its answer. Running successfully on the allocated machine
does not establish capacity under sustained production load.

## Visual direction and a content correction

Taste Skill informed the editorial entrance; Impeccable's audit/polish approach and
Vercel's interface guidelines informed review. Their sources and the generated
fictional gallery image are documented in [assets.md](docs/assets.md). The visual
system uses paper, dark ink, one archival red, serif headings and document labels.
The investigation uses readable evidence sheets and labeled sort buttons. The
image supplies atmosphere; every relevant observation is also text.

During authoring review, the archive folder was found to disclose too much of the
answer by itself. That contradicted the promised cooperative experience even
though the interface and persistence could work perfectly. The receiving slip
was changed to a location code that needs the field map; the instruction names a
role that needs the field access key; the camera requires a separate clock
correction. The authoring boundary was added to CLAUDE.md. This is a content
inspection, not evidence that real players found the puzzle balanced.

The interface, corrected case and browser acceptance script are recorded in
[`63989e3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/63989e3).
The first accessibility scan also caught insufficient contrast on the decorative
case number. Its ink was darkened before the completed screenshots were captured.

## A failure that changed the workflow

The browser script exercised more than the happy path. It completed a solo case
at desktop and phone sizes, tried an incorrect explanation, restored saved work,
opened two isolated browser sessions and interrupted one session's connection.
The interrupted session sometimes failed to receive evidence published while it
was offline. Relying only on EventSource's implicit recovery was insufficient in
this experiment: a nominally open stream could miss the update.

[`bb98630`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/bb98630)
explicitly closes the stream on offline, opens a new one on online, and retrieves
the current snapshot. Returning to a visible tab also refreshes state. The same
browser scenario then passed. CLAUDE.md now requires this failure case to be
retained. This is a concrete example of using an observed failure to improve the
harness instead of accepting a convincing screenshot as proof of reliability.

## What the evidence establishes

The local HTTP suite passed 14 tests, including the supplied invariants, private
clue access, competing joins, conflicting writes, correct and incorrect theories,
live events, and reopening a real SQLite database in a new process. Browser
acceptance passed full playthroughs at 1920px and 390px, keyboard dialog actions,
no horizontal overflow, failed-save feedback and recovery of missed evidence.
These runs are summarised in [local verification](docs/local-verification.md).

## Deployment and release evidence

The first iteration stayed local because credentials were unavailable. Once the
user supplied the final-specific token, the course's remote build deployed the
same application. This transition is recorded in
[`acc6483`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/acc6483).
Credentials stayed in an ignored local configuration file, outside both Git and
the Docker upload. The course machine and volume limits were preserved. The image
built remotely, avoiding a local Docker installation and exercising the actual
Linux build path that CI later uses.

Deployment was verified by action rather than an online homepage alone. A test
investigation was saved, the Fly machine restarted, and its identity and evidence
were retrieved. A second deployment preserved the same records and volume. The
real HTTPS app also passed the HTTP and browser suites. [Hosting verification](docs/hosting-verification.md)
records the machine, image and limitations. Local and hosted results are separate
records, so later evidence does not rewrite what was known earlier.

Public release uses the course secret scan and existing CI checks before the
deployed commit is marked for C8. It preserves the incremental development history
rather than replacing it with a finished-code dump. The next evaluation still
needs two first-time players: do both contribute an inference, can they correct
the clock, and does the explanation feel earned? These are questions for observed
use and the student's reflection. Automated success cannot answer them, and the
presence of real-time foundations does not complete later crits or the final note.
