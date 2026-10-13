# ADR 002: protect the reasoning, reject stale moves

Accepted for C9. The README defines good as an explanation reached together.
A partner's new evidence should change the available facts, without taking over
the document someone is reading or silently replacing their chronology.

## Options

Last-write-wins is simple but discards one person's reasoning without warning.
A whole-desk lock prevents that collision but makes a two-person activity take
turns, and a disconnected owner needs a lease/recovery design. Per-event merging
is attractive for large boards; four ordered events still need a policy when two
people assign contradictory relative positions. It adds complexity without
resolving the interpretation for the players.

## Decision

Use a server-checked room version for chronology writes. A SQLite transaction
commits one move; a concurrent stale move gets HTTP 409. The client retrieves the
current state and asks the person to repeat their intended move. No automatic
retry can silently reinterpret their intention. A rejected move creates no saved
activity. Publishing evidence is additive; it does not require a desk lock.

Committed publications, chronology, attempts and resolution reach both browsers
through an SSE invalidation followed by an authorised snapshot. The latest shared
action names its author, and the persistent record provides context. Updates keep
the selected clue. A partner solving the case closes an obsolete submission
dialog. Reconnection fetches current state rather than replaying every missed
animation. A joined seat is not described as proof that its browser is online.

## Costs and verification

The room version also changes for publications and attempts, so unrelated activity
can reject a timeline move. This conservative false conflict is acceptable for two
people and four events; a separate timeline version would be the next step if
observed play shows repeated interruptions. Snapshots incur one extra request per
event; network latency can therefore exceed the one-second target.

`spec/investigation.test.ts` races two distinct identities and checks that only
the winner survives. `scripts/check-collaboration.mjs` holds two real browser
requests, releases them together, checks the visible conflict, and measures
publication, timeline and resolution rendering. These measurements describe the
tested connection, not a guarantee for every network. Human assessment of whether
the interruption feels fair remains outstanding.
