# Lost & Found: working rules

- Follow PRODUCT.md and docs/case-design.md. Keep one case.
- Preserve shipped invariants and course Fly machine/volume limits.
- Use SQLite on DATA_DIR (production /data). No browser-only persistence.
- Say saved only after the transaction commits.
- Authenticate membership on every room read, mutation and event stream.
- Never send unpublished clues from the other role to a cooperative client.
- Keep solution data on the server, out of the frontend bundle.
- Authoring check: neither folder alone may disclose the full named person,
  destination and corrected movement time. Match codes across the two folders.
- Reject stale timeline writes explicitly; never silently overwrite.
- Reopen the event stream and retrieve current state after the browser returns
  online. Test a partner publishing while the other browser is offline.
- Validate request shape, length, origin and clue ownership server-side.
- Keep clues readable as text and actions usable by keyboard and touch.
- Render the full README in server HTML at /readme/.
- Log pseudonymous actions, not tokens or private clue contents.
- Never invent reflection, human research, measured play time or deployment.
- Document mistakes and fix the contract or test that allowed them.
- Pushing and publicly shipping this final repo are now explicitly authorised.
  Follow course ship checks and preserve existing history and cutoff tags.
  Never expose Fly credentials or change the course resource limits.

Course constraints live in fly.toml, Dockerfile and spec/README.md.
