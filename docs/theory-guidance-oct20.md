# A submit button that explained nothing — 20 October 2026

The student reported that Submit explanation could not be clicked and supplied a
screenshot: all four answer fields were filled, F1 was selected, and only Field
clues appeared in the citation list. The frontend disabled submission until both
folders were cited. Its generic instruction did not explain how to obtain a
missing Archive clue. Closing the dialog to look for one also discarded the
unsubmitted answers.

This is a real user-reported interaction problem. It does not establish a
completed playtest, play time, classroom participation or approval of the puzzle.

## Correction

[`352167b`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/commit/352167b)
keeps Submit actionable while idle. Missing citations now produce a specific
message, without sending or recording an attempt. Field and Archive groups show
whether a citation is selected and distinguish unshared evidence from evidence
that is available but not selected.

For a folder the player can access, Read a clue closes the dialog, restores the
complete folder view and focuses an unpublished document. The player can publish
it and return to the explanation with the four answers and existing citations
retained. For the partner's folder, the form offers the real invitation if the
second seat is empty, or explains that the partner must share. Their publication
appears in the still-open form. No private partner clue is disclosed.

The draft belongs to the current page and is not saved to the database; the form
explicitly explains that reloading clears it. Submitted attempts still use the
existing server validation and persistence. A partner resolving the case removes
an obsolete Return to explanation action.

## Verification and the missed test

The earlier browser playthroughs selected a Field and Archive clue before
submitting. They verified successful and incorrect explanations but missed this
incomplete route. The correction adds both a CLAUDE rule and
`pnpm check:theory` in CI, rather than accepting a visual patch alone.

The new browser suite passed seven flow checks: desktop and phone missing-citation
feedback; each viewport's draft-preserving trip from the shared-only filter to an
Archive document and back; invitation guidance; a partner's live publication in
the same open dialog; and remote resolution during evidence review. It also
checks that invalid local submissions produce zero theory requests and zero
saved attempts, whereas a supported submission produces one real server response
and persisted feedback. Both incomplete forms pass axe A/AA checks.

The production build, TypeScript, all 32 existing tests, full desktop/phone
playthroughs and the collaboration suite also passed locally.
[Sanitized local results](theory-guidance-local-oct20.json).
The inspected viewport captures show the missing Archive guidance, action and
clickable submit button: [desktop](screenshots/theory-guidance-1920.png),
[phone](screenshots/theory-guidance-390.png).

The correction passed [course CI and deployment](https://github.com/comp4020-agentic-coding-studio/comp4020-final-2513238602/actions/runs/39408035938),
including all six browser suites. All seven targeted checks and both axe scans
then passed again against the deployed Fly URL with isolated test identities.
[Sanitized hosted results](theory-guidance-hosted-oct20.json) retain the actual
verification time and URL; they contain no room invitations, member IDs or cookies.

Existing saved progress is separate from the unsubmitted form. A player on the
old frontend needs to reload for this fix; they should note any current unsent
choices first. This release does not silently fill answers or citations for them.
