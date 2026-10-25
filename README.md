# Lost & Found

A cooperative detective game for friends and family. Explore a small world,
compare what you find, and build an explanation that survives the evidence.
[Play After Hours](https://comp4020-final-2513238602.fly.dev/after-hours) with two
to four people, each in a separate browser or device. Talk at the same table or
over a call. There is no timer, ranking or account setup.

## What good means here

Good means someone else's discovery changes what you think happened. After Hours
starts with a missing lantern and an apparently obvious collection. Four
miniature rooms hold sixteen records, divided across scene investigation,
archives, object examination and route analysis. Two people cover two duties
each; third and fourth arrivals divide the work further.

Players inspect objects, publish findings, discuss specific evidence and support
seven deductions across three acts. A correct answer with unrelated citations
cannot establish a deduction. The final reconstruction brings six events into
order. Optional hints move from direction to evidence pairs to an explanation.
The intended main-case duration is twenty to thirty minutes, pending human
playtesting. The Blue Hour remains a shorter solo/two-person introduction with
its original saved investigations.

## Why this shape

[The Past Within](https://www.rustylake.com/adventure-games/the-past-within.html)
makes different perspectives part of solving a shared mystery.
[Keep Talking and Nobody Explodes](https://keeptalkinggame.com/) makes the
separation between observation and instructions require conversation. This
project uses complementary records and a forgiving pace, allowing a family or
group of friends to question a first impression without countdown pressure.

Robin Sloan's [home-cooked software](https://www.robinsloan.com/notes/home-cooked-app/)
supports making something worthwhile for a small, specific group. The website
holds the investigation; the people bring the conversation. There is no feed,
competitive leaderboard or generated stream of interchangeable cases.

The 3D rooms give objects a place, orientation and material character. Procedural
components make that world practical to build. They generate scenery, not truth:
the case is authored and its supporting evidence is checked. New furniture
arrangements would not, by themselves, make a new mystery.

## Promises that can be checked

Every discovery, publication, deduction, hint, note and duty assignment is stored
in SQLite on the course Fly volume. Shared changes arrive through server-sent
events without a reload. A returning browser recovers its investigation after
restarts and redeployments. Stale chronology changes and handovers are explicitly
rejected; unconfirmed writes are reconciled rather than automatically repeated.

Membership protects every room action and event stream. Private findings remain
with their assigned duty until shared. Teams can explicitly transfer a duty if
someone steps away. Seat labels distinguish identical nicknames. The final
contribution record counts saved actions, not conversational value.

Every meaningful fact and object action also exists in the text interface.
Keyboard and touch controls obey the same discovery rules as 3D. Losing WebGL
does not lose the investigation. The scene loads separately, renders on demand
and respects reduced motion. [Verification](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/blob/main/docs/after-hours-verification.md)
separates HTTP, browser and hosted evidence from human judgement.

## Promises that need people

Tests cannot establish that the mystery is enjoyable, the reading load suits a
family, or everybody gets to reason. Fresh players must test those claims.
[The observation protocol](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/blob/main/docs/playtest-protocol.md) records hesitation,
interventions and which discovery changes someone's mind. No human playtest
result is claimed yet.

## Before you begin

A cookie remembers your seat for thirty days; clearing cookies loses access.
Share an invitation only with your team. Names, published findings and discussion
notes appear within that investigation. All places and events are fictional.
This argument is agent-assisted and awaits the student's review and endorsement.

[PROCESS](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/blob/main/PROCESS.md)
explains development decisions and their evidence.
[The research note](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/blob/main/research-note.md)
examines agentic practice beyond this game.
