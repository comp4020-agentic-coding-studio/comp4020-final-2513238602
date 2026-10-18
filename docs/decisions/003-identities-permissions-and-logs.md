# ADR 003: a browser owns a seat; logs report committed actions

Accepted as C10 preparation. The intended use is a short mystery between two
classmates. Creating an account first would add a recovery and password burden
unrelated to the shared inference in the README. An unprotected invitation-only
page would be simpler, but anyone knowing the URL could impersonate either role.

## Identity and authority

An opaque, HttpOnly, SameSite cookie identifies one browser for 30 days. SQLite
stores its hash. A room member has a separate random ID and one assigned role.
Nicknames are display labels, not authentication; identical names do not merge
identities. Different profiles can therefore play side by side. No cross-device
recovery is promised. Clearing cookies loses that browser's existing seats.
Activity snapshots retain member ID and role, and the UI shows role beside the
nickname. Two people choosing the same label remain distinguishable in history.

| Actor | Read | Change |
| --- | --- | --- |
| Unjoined visitor | Home, project notes, invitation form | Claim one unoccupied archive seat via the invitation |
| Field member | Own clues and published archive clues | Publish own clues; arrange shared chronology; submit a supported explanation |
| Archive member | Own clues and published field clues | Same shared actions, publishing from the archive folder |
| Solo member | Both folders | Both folders and the same shared actions |
| Any member after resolution | Complete explanation and saved history | Read evidence only; solved state is frozen |

Every API snapshot, mutation and SSE connection enforces membership server-side.
Unpublished clues and the answer are withheld, not hidden with CSS. Both players
may rearrange the timeline or solve: their evidence is asymmetric, their authority
over the shared conclusion is equal. A room URL is an invitation capability for
the first second-seat claimant; it is not permission to read a claimed room.

## Reading the instrument panel

Committed activity is saved inside the same SQLite transaction as its state
change. Only after COMMIT does the server print a JSON event with `eventId`,
`room`, `member`, `role`, `action`, `detail`, `version` and `at`. Role and member ID
distinguish actors without copying user-supplied nicknames into infrastructure
logs. Chronology events include the saved order, publications identify the now
public clue, and attempts distinguish an unsuccessful hypothesis from resolution.
Repeated publication returns the current state without creating another event,
changing its version or notifying peers. It cannot manufacture a conflict with
a timeline move based on the already-published state.

Rejected requests have `outcome: rejected`, HTTP `status`, `requestId`, operation
and known room/member/role. They are diagnostic observations, not saved actions.
No token, cookie, request body, private clue text or IP address is logged. Reading
a private clue does not announce it to a partner. Durable activity is visible in
the room's case record after a restart; transient rejection logs depend on Fly's
log retention. A process crash just after commit may omit stdout, so stdout is
not an exactly-once audit ledger; SQLite remains the saved record.

## Costs and boundaries

There is no identity verification, invitation revocation, account recovery or
moderation system. Someone given the link may claim its empty seat first. The UI
states this before sharing. This is appropriate for a pair who already know one
another; it is not an access model for sensitive or public community data.

`spec/observability.test.ts` runs a real process and checks actor attribution,
commit outcomes, denial logs and absence of credentials in output. Existing HTTP
tests cover private clues, outsiders, stream membership and competing joins.
The C10 class exercise still requires two actual people and student narration;
an automated rehearsal cannot establish that it happened.
