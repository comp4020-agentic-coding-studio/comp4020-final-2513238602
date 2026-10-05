# Process overview

This is an agent-assisted factual account of the local C8 build, dated 5 October
2026. It records actions that happened in this workspace. The student still needs
to review the account, conduct human playtesting and write the personal reflection.
No public deployment or independent user research is claimed.

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
who already knows its answer. This local iteration does not establish that the
app fits its production memory budget under load.

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

The user explicitly requested local completion because Fly credentials were not
configured. No push, repository visibility change or deployment was performed.
Docker and persistent-volume behaviour on Fly remain unverified. The next human
evaluation should observe two first-time players without explaining the controls:
do both contribute an inference, can they correct the clock, and does the final
explanation feel earned? Those observations should guide the next edit and the
student's personal reflection. A passing automated suite cannot supply them.

## Hosting follow-up, 5 October 2026

After the local iteration, the user requested completion of the course hosting
instructions and supplied the final-app token. Fly CLI was installed through
mise, credentials were kept out of Git and the Docker context, and the unchanged
course Fly configuration was used to deploy. Remote image builds succeeded.
The same machine and 1GB volume survived a restart and a second deployment;
the dedicated test investigation remained accessible with its published evidence.
The real HTTPS site passed the HTTP suite and browser acceptance scenarios.
See [hosting verification](docs/hosting-verification.md) for the precise boundary
between these checks and the earlier local-only evidence. The repository remains
private; the course ship flow and personal reflection are still separate work.
