# Current Status

## Last Updated and Scope

- Date: 2026-07-20
- Scope: Macromolecule Evidence Lab repository migration, student app, content,
  local persistence/PWA behavior, private results gateway, and release gates
- State: implementation and release hardening complete; external deployment is
  approved but blocked on the school-account Sheet/browser and Vercel
  authentication gates; the physical classroom pilot remains open

## Branch and Preservation Posture

- Project root: `C:\Users\Keyur\Desktop\Claude Code YEET\Teacher Coding Projects\Summer School 26\Macromolecule Summer Game`
- Branch: `codex/macromolecule-evidence-lab`
- Baseline: `02b8d6a` from `origin/main`
- Legacy checkpoint: `5c68afd chore: preserve legacy app context and asset tooling`
- Preservation tag: `legacy-appscript-v1`
- Verified implementation checkpoint:
  `aebf7d9 feat: build macromolecule evidence lab`
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

The combined `npm run verify` command passed on 2026-07-20:

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

## Release Gates Still Open

- No Vercel preview or production deployment has been created.
- No new Apps Script project, test deployment, Script Property, or private Sheet
  has been created or changed.
- The connected Drive tool is signed into a personal account rather than the
  required school account, the spreadsheet authoring runtime is disabled in
  Codex settings, and no controllable authenticated browser/Vercel project is
  currently available. Do not create the live Sheet in the personal account.
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

1. Review the local implementation and this handoff; do not connect live data yet.
2. With explicit approval, create a Vercel preview with no results endpoint and
   browser-verify its public access boundary.
3. With separate approval, create a new Apps Script test project and disposable
   private Sheet; verify health, one controlled result, exact duplicate,
   conflicting duplicate, invalid payloads, both Sheet tabs, and cleanup.
4. Connect only Vercel Production to the approved `/exec` endpoint after those
   checks pass; keep previews and local builds disconnected.
5. Pilot on a real school iPad in both orientations over student Wi-Fi, including
   offline/reconnect and a representative 10–15 minute completion.
6. Keep the legacy deployment unchanged until the pilot passes and Keyur
   explicitly approves the classroom switch.

## Explicit Boundaries

- Do not deploy, publish, configure the live Sheet, push Apps Script, alter the
  legacy deployment, write test rows, or delete controlled data without explicit
  approval.
- Do not describe the app as classroom-released while the external and physical
  gates above remain open.
- Do not expose credentials, project IDs, Sheet links, student data, or a public
  results-read endpoint.
