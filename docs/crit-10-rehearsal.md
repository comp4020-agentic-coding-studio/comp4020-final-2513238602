# C10: narrate from logs, with hands off the app

This is a rehearsal procedure, not a record of a completed class exercise.

## Before the cutoff

For the Liuru group, C10 is Wednesday 21 October 2026, 15:30–17:00 Sydney;
the submission cutoff is 13:30 that day. Complete `reflections/crit-10.md`
before the cutoff, using real development or pre-class rehearsal evidence.
The two prompts do not require the future classroom exercise to have happened.
Publish the current PROCESS, successful CI deployment and `crit-10` tag as well.
After class, observations may be added in a later commit without changing the
cutoff tag. Do not postpone the required reflection until after class.

## In the session

Give two classmates only [the live URL](https://comp4020-final-2513238602.fly.dev/).
They use separate Chrome profiles; one opens a two-person investigation and
shares its invitation using the on-page control. The second chooses a nickname
and joins. The student watches the terminal, not either player's screen:

```powershell
mise exec -- flyctl logs -a comp4020-final-2513238602
```

The terminal must run inside this checkout, where mise loads the ignored local
token. Never paste that token, session cookies or the configuration file into a
recording or reflection.

Interpret each event in order:

- `opened`, `role: field`: this member created a two-person room.
- `joined`, `role: archive`: a different member claimed the other folder.
- `published`: the named clue is now shared; `detail` identifies which one.
- `arranged`: `detail` lists the new chronology, not merely that a click happened.
- `hypothesis`: an explanation was saved but needs revision.
- `solved`: the room reached its shared conclusion.
- `outcome: rejected`, `status: 409`: a request lost a version race or the case
  was already closed. Do not describe it as a saved move. Its request ID allows
  correlation with an error response; it is not a member credential.

Use room + role + member to distinguish participants, even if their nicknames
match. Ignore test rooms and health checks. The room code is present in the
players' invitation; it identifies a room, not a session cookie.

Ask the pair to choose actions themselves. Describe who changed what from the
logs alone; do not coach them through your own UI. Afterwards compare the
persisted case record with the narration and record any disagreement. A saved
event missing from stdout after a process interruption can be recovered from the
case record; transient rejected requests are not persisted there.

Record actual observations in a subsequent account: how they started, an action you
could or could not interpret, a permission boundary exercised, and one change
motivated by what happened. No successful automated test substitutes for this
human exercise.

Source: [assessment submission rules](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/).
