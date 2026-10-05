# Hosting verification — 5 October 2026, Australia/Sydney

The user subsequently authorised course hosting configuration and provided the
final-app credential. This record supersedes the hosting limitations of the
earlier local-only verification; it does not claim a human playtest or submission.

Live app: https://comp4020-final-2513238602.fly.dev/

## Configuration observed

- Course organisation: comp4020-agentic-coding-studio.
- Fly CLI installed through mise, pinned at 0.4.111.
- Token validated for the correct final app and stored only in ignored local
  mise.local.toml. No Fly token was added to Git or the Docker build context.
- Repository remains private; existing course GitHub FLY_API_TOKEN secret was
  confirmed by name only. CI and fly.toml were not modified.
- One machine, ID 80169db64de3d8, region syd, one shared CPU, 256MB RAM.
- One encrypted data volume, ID vol_vjyog8p6ne5177xv, 1GB, mounted at /data.
- Shared IPv4; no dedicated IPv4, second machine or second volume.
- Auto-stop and auto-start remain enabled.

## Tests performed

1. Course config validation and the 14-test local suite passed before deployment.
2. Fly remotely built the Dockerfile and launched the application successfully.
3. The 14-test suite passed with APP_URL set to the real HTTPS app. This includes
   the two supplied HTTP invariants. The process-restart test still starts its own
   local subprocess; separate actual Fly restart testing is recorded below.
4. Browser acceptance passed against the real HTTPS site: solo playthrough at
   1920px and 390px, two isolated participants, wrong/correct hypotheses, failed
   save feedback, and reconnecting after a partner published while offline.
   The observed publication took 102ms including UI clicks, a single observation.
   See [browser results](hosting-browser-results.json).
5. A dedicated investigation and publication were saved on Fly, the existing
   machine was restarted, and the same browser identity and evidence were restored.
6. A second remote deployment updated the README. The same investigation and
   publication survived that redeployment too. The volume and machine IDs did not
   change. Verification session material stays in an ignored evidence file.
7. After the final deployment, /, /readme/ and /health returned HTTP 200. The served
   README included the updated live-site wording. Startup logs showed /data being
   mounted and the Node service listening on port 8080.

Final image: deployment-01M455MSXQ2YB9TR8NAKXTRA6A, approximately 74MB.
Final image digest: sha256:ae980ec4dafd1fe7746cf3fdab6790a4e93ca34c76c2f39dbdea82bdd31a842e.

## Remaining boundaries

This proves deployment and sampled persistence, not production load capacity,
complete accessibility, enjoyable gameplay or completion of the assessment.
Human playtesting and the student's personal reflection remain outstanding.
The course ship/publication flow was not invoked and no commits were pushed.
