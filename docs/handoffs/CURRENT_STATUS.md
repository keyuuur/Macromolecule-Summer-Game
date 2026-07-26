# Current Status

## Last Updated and Scope

- Date: 2026-07-26
- Scope: Macromolecule Evidence Lab repository migration, student app, content,
  local persistence/PWA behavior, private results gateway, and release gates
- State: implementation and release hardening complete; GitHub and the reviewed
  Apps Script source are synchronized. A public Vercel Production-target build
  exists but is intentionally disconnected from results. Live result collection
  remains blocked on school-Google authorization, controlled backend checks, and
  the physical classroom pilot.

## Branch and Preservation Posture

- Project root: `C:\Users\Keyur\Desktop\Claude Code YEET\Teacher Coding Projects\Teacher Context\Summer School 26\Macromolecule Summer Game`
- Branch: `main`
- Baseline: `02b8d6a` from `origin/main`
- Legacy checkpoint: `5c68afd chore: preserve legacy app context and asset tooling`
- Preservation tag: `legacy-appscript-v1`
- Verified implementation checkpoint:
  `aebf7d9 feat: build macromolecule evidence lab`
- Verified release-hardening checkpoint:
  `7125fd4 feat: harden live results release`
- Before this closeout handoff, `main` and `origin/main` pointed to `61cdc20`.
  The feature branch remains at `7125fd4`; it does not need to be advanced
  because the completed work is already on `main`.
- This closeout handoff is intended to be the newest `origin/main` checkpoint.
  A future session should confirm it with `git status --short --branch` and
  `git log -1 --oneline` rather than relying on an embedded hash.
- The old Apps Script student app and historical handoffs are preserved under
  `legacy/apps-script-v1/`; the historical deployment was not changed.
- Machine-local CLASP/auth files, dependencies, generated screenshots, browser
  reports, backups, archives, and temporary artifacts remain ignored and were
  not deleted.

## Completed Implementation

- Vite, React, and TypeScript student app with semantic DOM controls and no
  Phaser, Three.js, canvas, timer, points, leaderboard, or public student list.
- Fixed student flow: first name/last initial, tutorial, eight balanced
  diagnostic cases, distinct misconception repair, four fresh transfer cases,
  and a non-graded formative summary.
- Versioned case bank with two diagnostic variants and two transfer variants per
  macromolecule. Every transfer uses an evidence concept not used for that
  macromolecule during diagnosis.
- Release-blocking answer-hiding validation detects direct, plural, hyphenated,
  and embedded answer labels such as the `lipid` inside `phospholipid`, plus
  copied correct-evidence text.
- Deterministic case/choice ordering, refresh recovery, structurally validated
  local state, active-time tracking, content-version mismatch cleanup, and
  visible storage-failure messaging.
- Generated service worker/app-shell cache, offline reopen/resume, queued result
  storage, startup/reconnect/resume flushing, timeout handling, idempotent IDs,
  and post-receipt removal of identity/detailed responses from local storage.
- New Apps Script result gateway under `backend/apps-script/` with health-only
  GET, `text/plain` POST, strict version/metric/time validation, ScriptLock,
  same-payload duplicate acceptance, conflicting-ID rejection, append-only
  `Results`, and recomputed one-row-per-identity `Summary` with collision flags.
- Current product, learning-design, backend, setup, privacy, and release-gate
  documentation. Unit 2 alignment retains the course model while correcting the
  lipid-polymer and ATP classification caveats.
- Release hardening adds a least-privilege V8 Apps Script manifest and CLASP
  push allowlist, corrects the documented accepted version values, and tests
  unsupported actions, stale versions, and incomplete identities.
- Shared-iPad privacy now expires undelivered detailed submissions after seven
  days, shows their count at check-in, and provides a confirmed teacher-assisted
  deletion control. Delivery copy no longer implies that the anonymous endpoint
  authenticates the sender.

## Verified Evidence

The combined `npm run verify` command passed again on 2026-07-26:

- ESLint: passed with no warnings or errors.
- Vitest: 7 files and 27 tests passed.
- TypeScript/Vite production build: passed.
- PWA generation: service worker created with five precached shell entries.
- Playwright: 14 of 14 touch-enabled browser journeys passed on isolated port
  `49317`, at 768×1024 portrait and 1024×768 landscape.
- Browser journeys cover all-correct, first-try misconception and repair, fresh
  transfer, answer-hiding, stable refresh/resume ordering, offline reload and
  completion, local-only result status, keyboard navigation, automated serious
  accessibility findings, storage failure, and repeat-attempt reset.
- The additional shared-iPad journeys verify that an unsent result is visible at
  check-in and that the confirmed delete control removes its queued payload.
- Backend contract tests cover accepted/rejected payload relationships, exact
  version allowlists, active-vs-elapsed time, duplicate/conflicting IDs, and
  Summary latest/best/source/collision recomputation.
- Result-gateway tests cover `text/plain` transport, local-only isolation,
  timeout queuing, deduplication, retryable retention, accepted flush, and
  non-retryable removal.
- A separate browser accessibility-tree and visual inspection confirmed the
  check-in and tutorial controls have clear names and the intended visual
  hierarchy.

## External Synchronization Verified on 2026-07-26

- A new Spreadsheet-bound Apps Script project was created with the school CLASP
  account for `Macromolecule Ticket Out Results`; the reviewed `Code.gs` and
  minimal V8 manifest were pushed again from `backend/apps-script/` on
  2026-07-26. CLASP tracked exactly those two deployable files.
- CLASP reported zero deployments for the new script on 2026-07-26. The setup
  function and interactive authorization are still not confirmed, and there is
  no public Apps Script web-app URL.
- Vercel reports one READY deployment targeting Production at
  `https://macromolecule-evidence-lab.vercel.app`. The public page returned HTTP
  200 on 2026-07-26. Inspection of its shipped JavaScript found no
  `script.google.com` host or configured results endpoint, so this build cannot
  submit to the Sheet.
- The Vercel project exists, but its metadata does not establish that the current
  deployment came from GitHub `main`; it appears to be the earlier static
  artifact upload. Do not treat it as the final classroom deployment.
- The legacy Apps Script project and deployment were not opened, pushed, or
  changed.

## Release Gates Still Open

- A public Vercel Production-target deployment exists, but it is endpoint-free
  and therefore cannot collect results. Its connection to GitHub `main`,
  Production-only environment configuration, and release provenance are not yet
  verified.
- The new Sheet and bound script exist, but interactive Google authorization has
  not completed. The setup function has not run, so `Results`, `Summary`, their
  protections, and `RESULTS_SPREADSHEET_ID` are not yet verified.
- The connected Drive tool remains signed into a personal account rather than
  the school account, the spreadsheet authoring runtime remains disabled, and
  Codex has no controllable authenticated browser. Do not recreate or edit the
  school Sheet through the personal Drive connector.
- The Vercel connector can now inspect the project and deployment. It does not
  expose the environment-variable controls needed to configure
  `VITE_RESULTS_ENDPOINT`; that Production-only step still requires authenticated
  Vercel project settings or an authenticated CLI session after the backend is
  ready.
- The backend has not yet been exercised inside the Apps Script runtime against
  an isolated test Sheet; lock/write behavior and exact `Results`/`Summary` rows
  still require that controlled test.
- Remote failed-sync/reconnect behavior is contract-tested locally but still
  needs one controlled end-to-end deployment test before classroom use.
- No real school iPad/Safari, student Wi-Fi, portrait/landscape clipping, offline
  reconnect, or representative 10–15 minute student timing pilot has occurred.
- The legacy URL must remain the non-classroom fallback until Keyur approves the
  new external setup and the physical pilot passes.

## Exact Next Recommended Actions

1. In the already-open school Apps Script editor, rename the project to
   `Macromolecule Ticket Out Results Gateway`, run
   `setupMacromoleculeResultsGateway`, and complete Google consent as
   `patelk07@psdr3.org`.
2. Verify the school Sheet is Restricted and owner-only, with exact empty
   `Results` and `Summary` schemas, frozen row 1, warning protections, and the
   Script Property configured.
3. Create the new anonymous web-app deployment only if the district account
   offers the required access option; then verify health, one controlled result,
   exact duplicate, conflicting duplicate, invalid payloads, and cleanup.
4. In authenticated Vercel project settings, connect the GitHub `main` project
   and set `VITE_RESULTS_ENDPOINT` for Production only. Redeploy from the
   verified `main` commit after the backend checks pass; keep previews and local
   builds disconnected.
5. Pilot on a real school iPad in both orientations over student Wi-Fi, including
   offline/reconnect and a representative 10–15 minute completion.
6. Keep the legacy deployment unchanged until the pilot passes and Keyur
   explicitly approves the classroom switch.

## Explicit Boundaries

- Do not create an anonymous web deployment if district policy blocks that
  access level. Do not alter the legacy deployment or write real student data
  before controlled verification completes.
- Do not describe the app as classroom-released while the external and physical
  gates above remain open.
- Do not expose credentials, project IDs, Sheet links, student data, or a public
  results-read endpoint.
