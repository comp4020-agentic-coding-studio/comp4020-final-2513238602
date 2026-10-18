# C9 reflection — make shared decisions understandable

Retrospective completed on 18 October 2026 with coding-agent assistance from
recorded instructions and commits. This replaces the earlier draft for the final
portfolio. It was not completed by the C9 cutoff; the existing
tag remains unchanged. No personal playtest or classroom feedback is claimed.

## What was the breakthrough that moved the work forward?

The useful breakthrough in the recorded work was treating a simultaneous edit as
a decision between partners. Delivering updates quickly would not explain whose
chronology survived or why the other move failed.
[`cff71d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/cff71d1)
made the actor visible, preserved the selected clue and tested two competing
requests. Rejecting the stale move costs a retry, but lets both participants see
that one proposal did not replace the other's reasoning silently.

That standard also exposed misleading recovery feedback.
[`47e2c37`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/47e2c37)
stopped claiming the latest chronology had loaded before its refresh succeeded.
The agent's tests also needed correction: the next move could be calculated before
the sending screen updated. Waiting for both screens made the evidence match the
claim. Neither finding came from an independent human playtest.

## What did this work change about who I want to be as a software developer?

I asked for coherent steps to be completed and uploaded separately, with comments
that explain each step's significance. This makes acceptance a series of decisions
I can inspect: what was wrong, why this behaviour was chosen, and what checked it.
I want that discipline to carry more weight than the number of features delivered.

The important limit is that a passing test is itself an argument to examine.
Its observations must correspond to the user's visible state. For this project,
I can require that connection without inventing classmates' reactions or assuming
that successful automated collaboration proves an enjoyable mystery.
