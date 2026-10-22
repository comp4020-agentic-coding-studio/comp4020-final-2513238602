# Lost & Found: working rules

- Follow PRODUCT.md, docs/case-design.md and docs/after-hours-design.md.
- Preserve Blue Hour rooms. New After Hours rooms pin their case version and seed.
- After Hours deductions require their actual supporting published evidence;
  two arbitrary citations cannot establish a correct conclusion. Keep all rules
  and unrevealed facts server-side. A duty handover moves private discoveries.
- Seed scenery, not truth. Every required clue remains reachable in the object
  list with the same role and stage conditions as the 3D interaction.
- Reject unknown/prototype evidence IDs. Repeated identical discussion notes
  from the same member must be idempotent. Never print their text in logs.
- Keep the party log reader in step with new server-authored events and seat
  roles; its allowlist must still omit arbitrary strings and credentials.
- New gameplay checks must exercise a complete two-person case, four independent
  seats, lost acknowledgements and real WebGL context loss. Touch scrolling must
  work over the canvas; reduced motion and a settled scene must stop drawing.
- Compress assets during the build, not on the small Fly machine. Respect clients
  that reject gzip, retain original content types and vary responses by encoding.
- Preserve shipped invariants and course Fly machine/volume limits.
- Use SQLite on DATA_DIR (production /data). No browser-only persistence.
- Say saved only after the transaction commits.
- Bound HTTP waiting. If a save response is lost, do not assume the write failed
  or silently retry it: fetch current state and explain uncertainty. Claim a
  conflict refresh succeeded only after that refresh actually returns.
- Authenticate membership on every room read, mutation and event stream.
- Never send unpublished clues from the other role to a cooperative client.
- Nicknames are labels, never authority. Keep member ID and role on persisted
  activity responses; show the role with the nickname in shared-action history.
- Publishing an already shared clue is idempotent: no version/timestamp change,
  duplicate activity, or notification that could invalidate a partner's move.
- Keep solution data on the server, out of the frontend bundle.
- Authoring check: neither folder alone may disclose the full named person,
  destination and corrected movement time. Match codes across the two folders.
- Reject stale timeline writes explicitly; never silently overwrite.
- Preserve the selected document on partner updates. Show who changed the shared
  desk, and close an obsolete theory dialog when a partner solves the case.
- Race two distinct browser identities in acceptance checks; measure publication,
  chronology and resolution rendering, not only arrival of an SSE message.
- Reopen the event stream and retrieve current state after the browser returns
  online. Test a partner publishing while the other browser is offline.
- Keep every saved investigation reachable from the home page through bounded,
  session-scoped pagination ordered by immutable creation time and room code, so
  partner updates cannot move an unseen case past the cursor. A failed history
  load must show an error and retry;
  retry that page when the browser reconnects, preserving already loaded links.
- Confirm the browser identity before opening or joining a case. Share concurrent
  first identity requests so their cookies cannot race. A lost entry response is
  uncertain: recover a known seat with a read, or offer existing case files.
  Creating another investigation must be an explicit choice, never an automatic
  repeat or an ordinary form resubmission disguised as recovery.
- Validate request shape, length, origin and clue ownership server-side.
- Keep clues readable as text and actions usable by keyboard and touch.
- Motion follows accepted server state: animate new publications/activity and
  changed chronology once, never a pending write or repeated snapshot. Keep the
  selected article, explanation form and keyed timeline rows mounted. Carry an
  in-flight row offset into a second sort. An open-to-solved transition may stamp
  once; old-case loading stays quiet. Reduced motion and hidden pages stop effects.
- An incomplete explanation must say which citation folder is missing and how
  to supply it; do not leave an unexplained disabled submit button. Only offer
  to read clues the browser may access. Preserve the unsubmitted draft while
  closing the dialog to review evidence or invite a partner; do not call it saved.
- Test the incomplete citation path, not just a form prefilled with both folders:
  incomplete submission sends no write, returning retains the draft, and a
  partner's publication appears in the open form without resetting its choices.
- Render the full README in server HTML at /readme/.
- Log pseudonymous actions, not tokens or private clue contents.
- Emit saved-action logs only after COMMIT, with room, member, role and saved
  detail. Distinguish rejected requests from committed activity. Keep cookies,
  nicknames, request bodies and private reading activity out of stdout/stderr.
- Never invent reflection, human research, measured play time or deployment.
- A crit reflection must be ready before that crit's cutoff. Ground a pre-crit
  account in real development or rehearsal; never require future classroom
  observations as a prerequisite or invent them to fill the gap.
- Document mistakes and fix the contract or test that allowed them.
- Pushing and publicly shipping this final repo are now explicitly authorised.
  Follow course ship checks and preserve existing history and cutoff tags.
  Never expose Fly credentials or change the course resource limits.

Course constraints live in fly.toml, Dockerfile and spec/README.md.
