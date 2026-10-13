# C9: demonstrate a shared decision

Use [the live app](https://comp4020-final-2513238602.fly.dev/) in two separate
profiles, ideally one at 1920×1080 and one at 390×844. Read the definition of good
at `/readme/` first. Do not show the answer file to first-time players.

1. Create a two-person investigation. Copy the invitation through the visible
   control; join from the other profile with a different nickname.
2. Compare the four different clues in each folder. Keep a field clue open while
   the partner publishes an archive clue. The clue appears without reloading,
   the latest-action strip names the publisher, and the selected document stays.
3. Move an event in the chronology and watch the other screen. Explain the policy
   in ADR 002: one stale order is rejected, the latest saved state is fetched,
   and the player chooses whether to repeat the move.
4. Let the pair make simultaneous moves. Timing may mean they do not collide;
   do not call that a failed test. The automated harness deliberately holds both
   requests to reproduce a conflict and proves one winner rather than relying on
   coincidental clicks in the demonstration.
5. Disconnect one profile, publish in the other, then reconnect. The missed clue
   returns. Discuss why restoring the latest state is more useful than replaying
   every missed animation.
6. Open the case record and connect an action to its author. If the pair solves,
   both screens reveal the conclusion, including when one had its theory dialog
   open. Return later using the same profiles to show persistence.

The argument to defend is specific: a lost move should be visible, while a new
clue should not take over someone's reading. Last-write-wins is simpler but hides
disagreement; locking the whole desk prevents concurrent participation. The
chosen version check can reject a move after an unrelated publication. Explain
that cost rather than claiming the design is universally best.

Preparation is not reflection. After reviewing the changes and playing, finish
the two prompts in `reflections/crit-9.md` using personal observations.
