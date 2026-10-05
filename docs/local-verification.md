# Local verification — 5 October 2026

Environment: Windows, Node 24, Microsoft Edge/Chromium. HTTP and browser tests
used a separate local SQLite database at port 8082. The user preview runs at
127.0.0.1:8080 with its own database. Nothing was deployed or pushed.

| Check | Observed result |
| --- | --- |
| Production client build | Passed |
| TypeScript | Passed |
| HTTP/integration suite | 14 tests passed across 3 files |
| Original course root and README invariants | Both passed, unchanged |
| Real process restart | Previously published evidence and identity restored |
| Browser single-player | Complete wrong-then-correct playthrough at 1920px and 390px |
| Browser multiplayer | Separate sessions, private folders, publication visible without reload |
| Latest local publication observation | 65ms including UI clicks; not a production latency claim |
| Offline recovery | Evidence published during disconnection appears after reconnection |
| Failed write | Error shown; no false successful-save state |
| Layout | No horizontal overflow across tested views and resizing |
| Accessibility scans | No axe WCAG A/AA violations on 12 sampled page/dialog states |
| Keyboard sample | Enter opens start dialog; Escape closes it |
| Browser JavaScript errors | None during acceptance run |
| Lighthouse homepage, mobile simulation | Performance 82; accessibility 100; best practices 100 |
| Evidence checker | Passed; 4 cited local commits resolve |

The Lighthouse run used the actual localhost:8080 preview. Scores are a single
local lab measurement, not field performance or a complete accessibility claim.
Remaining performance opportunities include the client bundle and image delivery.

## Evidence

- [Desktop entrance](screenshots/home-1920.png)
- [Desktop investigation](screenshots/desk-1920.png)
- [Mobile entrance](screenshots/home-390.png)
- [Mobile investigation](screenshots/desk-390.png)
- [Browser assertions and accessibility results](browser-results.json)
- Reproduce with the commands in [LOCAL_RUN.md](../LOCAL_RUN.md).

## Corrections found by verification

The first contrast scan rejected the pale decorative case number; its text was
darkened. The first offline browser scenario timed out waiting for a partner's
new evidence; the client now reopens its stream and requests a snapshot when the
browser returns online. A later Lighthouse diagnostic exposed a brand link whose
accessible name did not match all visible text; the link now uses its own text.

## Not yet established

No real two-person playtest, measured completion time, Safari/Firefox test, screen
reader audit, production load test, Docker build or Fly volume redeployment test
has been performed. Docker is not installed in this local environment. The
personal reflection remains a student review scaffold. Passing the evidence
checker verifies filenames and commit references, not reflective quality or
completion of course submission.
