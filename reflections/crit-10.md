# C10 preparation — personal reflection not yet completed

Prepared before the C10 class exercise. This file records technical preparation;
it does not claim that classmates have used the app while the student narrated
from logs. The student must replace this preparation with an authentic response.

## What was the breakthrough that moved the work forward?

The implementation finding is that logs must distinguish an attempted action
from a committed fact. Earlier output named only a member and action, and was
printed before the transaction completed. The revised service records activity
atomically and prints room, member, role, detail and version only after commit.
Rejected requests appear as rejected, not as saved progress. A real-process test
compares logged event IDs with the persisted case record and verifies that session
credentials and nicknames do not appear in output.

During the actual exercise, record an action that could be understood from this
information and one ambiguity, if any. Explain whether the logs led to the same
account as the players' record. Do not invent a smooth demonstration in advance.

## What changed about the developer I want to become?

This requires the student's own judgement after the exercise. Useful questions
are whether they could explain the system without operating it, which permission
boundary they could justify, and what responsibility remains when the agent wrote
both code and tests. Relate the answer to an observed event rather than a general
claim about trusting or distrusting AI.

The URL-only procedure is in `docs/crit-10-rehearsal.md`; ADR 003 explains the
identity and permission choices. Neither document establishes that the human
exercise or this personal reflection is complete.
