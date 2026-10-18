# C10 reflection — making completion explainable

Written with coding-agent assistance from my project instructions and repository
evidence. This is a pre-crit reflection, not a report of a completed classroom
exercise or an independent human playtest.

## What was the breakthrough that moved the work forward?

The useful breakthrough was separating an attempted action from a saved fact.
An entry saying someone clicked does not establish that their shared chronology
changed. Earlier logs printed before the database transaction completed and lacked
enough context to explain the action. In
[`dee5c79`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/dee5c79),
the agent changed this: committed events identify the room, member, role and saved
detail; rejected requests are recorded separately. The test compares emitted event
IDs with persisted activity. This gives the C10 narration a checkable basis.

The same distinction exposed misleading recovery feedback in
[`47e2c37`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/47e2c37):
a conflict message claimed the latest order had loaded before the refresh actually
succeeded. The correction makes the explanation follow observed state.

## What changed about the developer I want to become?

I asked for complete work delivered in meaningful stages, with commit comments
that justify each upload. The standard I want to apply is that every accepted
change has an explainable purpose, consequence and check. A green result matters,
but I should also be able to explain why a participant has a particular permission
and distinguish a saved move from a rejected one.

This keeps responsibility with me while allowing the agent to implement and test.
The classroom exercise will test whether I can use that evidence without operating
the interface myself. Its outcome remains unknown; this reflection does not turn
automated success into an experience that has not happened.
