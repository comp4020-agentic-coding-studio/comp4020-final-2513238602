# The spec

The [final project brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/)
and its spec are on the course website, along with the specs for crits 8, 9 and
10, which run in this repo. The brief poses the problem; the spec is the fixed
contract.

## What ships

`invariants.test.ts` checks the two things the course relies on:

- `/` answers with a 200, which is what the deploy and the crit capture read
- `/readme/` publishes `README.md`. Markdown renderers all differ slightly, so
  it checks the README's headings rather than every word: each one has to
  appear, in order, in the HTML the server sends, since no script runs. Render
  it however you like, as long as it's there in full; the marker reads it there.

Both run against the **running** app over HTTP, so they hold whatever it's built
with. In CI that app is the image your `Dockerfile` builds, started with a
throwaway `/data`, and a red run blocks the deploy. Locally, start the app
however you run it and `pnpm check` finds it at `APP_URL` (default
`http://localhost:8080`). Keep them; don't delete them.

## Your checks

Everything else in `spec/` is yours to write. Any `spec/*.test.ts` runs with
`pnpm check`, against the same running app. Some lines of a spec only a person
can judge; those are left to the crit and the marker.

At a crit, a green `check` job is half the shipped mark, but it's never the
judgement of the work: your tutor checks what you deployed against the published
spec.

## Lost & Found checks

- `investigation.test.ts`: real HTTP identity, private evidence, stream access,
  simultaneous joins and moves, validation, supported theories and resolution.
- `restart.test.ts`: two actual process restarts around a wrong attempt and a
  solved case; both identities retain evidence, order, feedback and history.
- `observability.test.ts`: captured real-process logs match committed activity,
  distinguish actors and rejected requests, and omit credentials and nicknames.
- `identity-boundaries.test.ts`: same-name members, idempotent concurrent
  publication, fabricated sessions and different roles across rooms.
- `log-reader.test.ts`: real server actions, Fly's multiline JSON envelopes,
  streaming chunk boundaries, bounded input, room filtering and safe output.
- `scripts/check-browser.mjs`: full flows at 1920×1080 and 390×844, 12 axe scans,
  keyboard dialogs, failed publication and offline recovery.
- `scripts/check-collaboration.mjs`: two independent browser contexts, eight
  publications, held simultaneous writes, chronology and resolution rendering,
  same-name actor attribution, selected-document preservation and two additional
  axe scans.
- `scripts/check-resilience.mjs`: delayed writes, missing acknowledgement after
  commit, unanswered request timeout and failed conflict recovery.

CI runs all of these before deploying. Browser timings measure request-to-visible
state on the tested connection. They do not establish worldwide latency, puzzle
quality or human accessibility. Test-generated rooms are disposable; do not use
the harness against a person's existing investigation.
