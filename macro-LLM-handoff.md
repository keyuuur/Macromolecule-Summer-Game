# macro-LLM-handoff

Generated: June 6, 2026
Last updated: June 6, 2026

This is the initial LLM handoff file for the Macromolecule Summer Game project. Future versions of this file should communicate what changed since the previous handoff, while keeping enough project context for another LLM to work without rediscovering the basics.

## How Future LLMs Should Use This File

Use this file as the project memory bridge. Before making code, UI, content, deployment, or testing changes:

1. Read this file first.
2. Read the current `README.md`.
3. Inspect the current git status.
4. Inspect the files named in the architecture section.
5. Preserve the classroom constraints, Apps Script constraints, and score-saving behavior unless the user explicitly changes the project goal.

Future updates should add a new dated entry under `Change Log Since Previous Handoff`. Each entry should explain:

- What changed.
- Why it changed.
- Which files changed.
- What tests were run.
- What remains risky, unresolved, or pending.
- Whether Apps Script, GitHub, or the connected Sheet were updated.

## Current One-Sentence Summary

Pirate Pantry: Macromolecule Match is a Google Apps Script web app that helps summer school biology students review the four macromolecules by answering single-choice and multi-select questions, saving progress locally on the iPad and saving best scores to a Google Sheet.

## Project Purpose

The project is designed for classroom use, not as a general public game. The teacher needs a reliable, low-friction student activity that:

- Reviews carbohydrates, lipids, proteins, and nucleic acids.
- Gives students repeated practice with macromolecule facts and examples.
- Supports iPad use.
- Lets students recover from refreshes or accidental navigation.
- Saves best scores to a teacher-controlled Google Sheet.
- Keeps the UI simple enough for summer school students to use without long instructions.

The educational goal is recognition and classification. Students should connect macromolecules to:

- Elements.
- Building blocks.
- Main biological jobs.
- Food examples.
- DNA/RNA examples.
- Real-world application scenarios.

## Primary Users

- Teacher: Mr. Patel / Keyur, maintaining the Apps Script project and reviewing the score Sheet.
- Students: high school biology summer school students.
- Likely device: school iPads or iPad-sized browser windows.
- Important student needs: clear instructions, obvious buttons, large tap targets, direct feedback, and minimal ambiguity.
- Important teacher needs: reliable score save, easy setup, clear score rows, and no fragile local deployment pipeline.

## Current Repository

Local workspace:

```text
C:\Users\Keyur\Desktop\Claude Code YEET\Summer School\Macromolecule Summer Game
```

GitHub repository:

```text
https://github.com/keyuuur/Macromolecule-Summer-Game
```

Apps Script project ID from `.clasp.json`:

```text
1p-fGRFrPU7VSMnGRfD8OYX6G-fUY3IGCJ1-iPtA5CT5L86QLqp4wxmZ-
```

Connected Google Sheet created by setup:

```text
Macromolecule Summer Game
https://docs.google.com/spreadsheets/d/1PDPJNYHF7th9p8lxIiKTSSDlt5zVJfJzE1J3TTgEu0o/edit
```

Current known deployments from `clasp deployments`:

```text
AKfycbxrCEb2SEDgN37wk3rq9wZsV9CvXWC8DoyVc5VeexHN @HEAD
AKfycbzTDDwpkVVcw6l-KqHIn7tQ51jQQtcE2BbSYtWS1DZtUgqU-QXaM2qL1P73GupJ1zuYjg @1 - Codex E2E test 2026-06-06
```

Live E2E test deployment URL used previously:

```text
https://script.google.com/macros/s/AKfycbzTDDwpkVVcw6l-KqHIn7tQ51jQQtcE2BbSYtWS1DZtUgqU-QXaM2qL1P73GupJ1zuYjg/exec
```

## Current Git And Workspace Status

As of the June 6, 2026 current pass, the latest committed GitHub baseline is:

```text
04103e0 Redesign game UI with C2 guild dashboard
```

Current local changes:

- `Styles.html`
- `macro-LLM-handoff.md`

Known untracked local files that should usually remain uncommitted unless the user explicitly asks:

- `.playwright-cli/`
- `macromolecule_ui_handoff_package_20260606.zip`
- `output/`

Important: current pending work is visual/style refresh and handoff docs only; no logic files are expected to change in this pass. Do not run destructive git commands. Do not revert user or prior-agent changes unless the user explicitly asks.

## Runtime And Platform Constraints

This project is intentionally simple:

- Google Apps Script web app.
- Raw HTML, CSS, and vanilla JavaScript.
- No React.
- No Vite.
- No npm build process.
- No Vercel runtime.
- No backend server outside Apps Script.
- Data lives in the Google Sheet bound to the Apps Script project.

`appsscript.json` is configured as:

```json
{
  "timeZone": "America/Chicago",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

The app must remain compatible with Google Apps Script's HTML service and `google.script.run`.

## File Architecture

### `Code.gs`

Purpose:

- Defines the app title.
- Serves `Index.html` through `doGet`.
- Provides `include(filename)` for HTML partial inclusion.

Key behavior:

- Uses `HtmlService`.
- Sets title to `Pirate Pantry: Macromolecule Match`.
- Allows framing with `HtmlService.XFrameOptionsMode.ALLOWALL`.

### `Index.html`

Purpose:

- Base HTML shell.
- Includes styles and client script.
- Contains the initial loading view.

Important elements:

- `<main id="app" class="app-shell" aria-live="polite">`
- Loading view with the `PP` brand mark.
- Includes `Styles.html`.
- Includes `ClientScript.html`.

### `Styles.html`

Purpose:

- All visual styling for the Apps Script HTML app.
- Supports landing, review chart, question card, option buttons, feedback, modals, progress, and final screen.

Important existing concepts:

- Theme variables.
- App shell.
- Panels.
- Primary, secondary, danger, and small buttons.
- Progress cards and bars.
- Option grid.
- Feedback states.
- Review grid and modal.
- Responsive breakpoint currently oriented around tablet use.

### `ClientScript.html`

Purpose:

- Entire client-side game runtime.
- Fetches game data from Apps Script.
- Handles routing between screens.
- Handles game state, local storage, scoring, answer evaluation, progress, and score sync.

Key state:

```text
STORAGE_KEY = piratePantryStateV1
PENDING_SYNC_KEY = piratePantryPendingSyncV1
appData
state
currentCard
selectedOptions
syncTimer
syncInFlight
queuedSyncPayload
activeSyncPayload
```

Key screens:

- Landing/name entry.
- Saved game prompt.
- Start-over confirmation.
- Optional review chart.
- Game shell.
- Current card.
- Round complete.
- Final screen.
- Review modal.
- Error screen.

Key behavior:

- Calls `google.script.run.getGameData()` on load.
- Calls `google.script.run.saveBestScore(payload)` for score sync.
- Saves local progress using `localStorage`.
- Saves pending score payloads separately so final scores can retry after reload.
- Locks Play Again until final score sync is confirmed.
- Supports exact-count multi-select questions.
- Requeues incorrect cards later in the round.

### `Setup.gs`

Purpose:

- Defines Sheet names and headers.
- Sets up required Sheet tabs.
- Seeds config and question bank.
- Formats headers.

Sheet names:

```text
Config
QuestionBank
BestScores
```

`Config` headers:

```text
key, value, notes
```

`QuestionBank` headers:

```text
card_id
active
round_id
round_name
interaction_type
skill_type
target_macromolecule
prompt
options_json
correct_json
explanation
difficulty
tags
```

`BestScores` headers:

```text
student_key
student_name
best_correct
target_correct
grade_percent
grade_points_100
completed
current_round
rounds_completed
last_synced_at
completed_at
latest_summary_json
```

Main function:

```text
setupPiratePantry()
```

Setup result from previous successful setup:

- Spreadsheet name: `Macromolecule Summer Game`
- Config rows added: 8
- Question rows added: 49

### `SeedData.gs`

Purpose:

- Defines default config.
- Defines the 4 rounds.
- Defines the review chart.
- Defines seed question rows.

Default config:

```text
game_title = Pirate Pantry: Macromolecule Match
target_correct = 32
correct_per_round = 8
assignment_points = 100
allow_review_chart = TRUE
allow_replay = TRUE
theme_level = light-medium
question_bank_version = 1
```

Rounds:

1. Sort the Clue
2. Build the Macromolecule
3. Real-World Examples
4. Application Challenge

Seed questions:

- 49 total active starter questions.
- Round 1: 13 questions.
- Round 2: 12 questions.
- Round 3: 12 questions.
- Round 4: 12 questions.
- Mix of single-choice and multi-select cards.

Review chart covers:

- Carbohydrates
- Lipids
- Proteins
- Nucleic Acids

### `Data.gs`

Purpose:

- Server-side data loading.
- Server-side score saving.
- Config validation.
- Question bank validation.
- Server-side score recalculation and anti-trust behavior.

Main public functions:

```text
getGameData()
saveBestScore(payload)
```

Important server-side validations:

- Config values must be usable.
- `target_correct` must equal `correct_per_round * 4`.
- Each round must have at least `correct_per_round` active cards.
- Each active question must have a valid `card_id`.
- `round_id` must be one of 1, 2, 3, or 4.
- `interaction_type` must be valid.
- `options_json` and `correct_json` must parse as arrays.
- `single_choice` questions must have exactly one correct answer.
- Correct answers must appear in options.
- Blank options and blank correct answers are rejected.
- Duplicate options and duplicate correct answers are rejected.
- Student name must include first and last name, or first name plus last initial.

Important score-save behavior:

- The client sends `answeredCorrectIds`, but the server recalculates score from active QuestionBank IDs.
- Raw `totalCorrect` from the client is not trusted as the source of truth.
- Server caps score per round at `correct_per_round`.
- Server writes only when the new score is higher than the existing best score.
- Completed status is true only when best score reaches `target_correct`.
- Summary JSON includes sync reason, attempt ID, round counts, accepted/ignored card counts, and client-reported correct count.

## Game Mechanics Specification

The game has four rounds. Each round requires 8 correct answers. The game is complete at 32 correct answers.

Round behavior:

- Student starts at Round 1.
- A round has a queue of active cards for that round.
- If the student answers correctly, the card is counted and removed from future play.
- If the student answers incorrectly, the card is added back later.
- Once the student reaches 8 correct answers in the current round, the round is complete.
- After Rounds 1, 2, and 3, show the next-round screen.
- After Round 4, show the final screen.

Question types:

- `single_choice`: student selects one answer and evaluation happens immediately.
- `multi_select`: student must select exactly the number of correct answers before `Check Answer` becomes enabled.

Scoring:

- Correct answers increase `totalCorrect`.
- Incorrect answers do not reduce score.
- A card can only count once.
- The maximum final score is 32.
- Grade percent is calculated as best correct divided by target correct, capped at 100.
- Points are currently equivalent to percentage against 100 points.

Persistence:

- Local game state is saved in browser local storage.
- Pending score sync payload is saved separately.
- On reload, a saved-game prompt appears if progress exists.
- If a completed attempt has unsynced score data, the app attempts to save it again.

Replay:

- Replay is controlled by `allow_replay`.
- If replay is allowed, Play Again appears on the final screen.
- Play Again must stay disabled until final score sync is confirmed.

## UI Requirements

The UI should be designed as a game interface, not as a landing page. The first screen should let students start the activity quickly.

Required screens:

- Loading.
- Landing/name entry.
- Saved game prompt.
- Start-over confirmation.
- Optional review chart.
- Question screen.
- Multi-select question state.
- Feedback state.
- Round complete.
- Final save screen.
- Error state.
- Review modal.

Required controls:

- Start.
- Continue Saved Game.
- Start Over.
- Yes, Start Over.
- Cancel.
- Start Game.
- Skip Review.
- Review Chart.
- Check Answer.
- Continue.
- Start Round N.
- Try Saving Again.
- Play Again.
- Reset saved game.
- Close.

UI constraints:

- Primary target is iPad portrait and iPad landscape.
- Touch targets should be at least 44px tall.
- Main actions must be visible or automatically brought into view.
- Students should not have to hunt below the fold for `Check Answer` or `Continue`.
- The Google Apps Script banner consumes vertical space and must be considered part of the real environment.
- Text must not overflow buttons.
- The UI should avoid dense instructions.
- Use color plus labels for feedback; do not rely on color alone.
- Avoid decorative UI that weakens biology readability.

## Accessibility Requirements

Minimum expectations:

- Keyboard navigation works.
- Focus indicators are visible.
- Modal focus is trapped.
- Escape closes the review modal.
- Focus returns to the prior control after closing the review modal.
- Feedback should receive focus or otherwise be announced after answer evaluation.
- Multi-select options should be grouped and connected to the selection hint.
- Selected state must be programmatically and visually clear.

Known accessibility improvement still recommended:

- After multi-select feedback, focus can drop to the page body. Move focus to the feedback area or the `Continue` button.

## Biology Content Requirements

The app should preserve these core concepts:

Carbohydrates:

- Elements: C, H, O.
- Building blocks: simple sugars.
- Jobs: immediate energy; short-term energy in plants.
- Examples: bread, pasta, sugars.

Lipids:

- Elements: C, H, O.
- Building blocks: fatty acids.
- Jobs: long-term energy; insulation; protection.
- Examples: fats, oils, butter.

Proteins:

- Elements: C, H, O, N.
- Building blocks: amino acids.
- Jobs: build muscle; enzymes; antibodies.
- Examples: meat, nuts, beans.

Nucleic Acids:

- Elements: C, H, O, N, P.
- Building blocks: nucleotides.
- Jobs: genetic information; instructions for proteins.
- Examples: DNA, RNA.

## Current QA And Testing Notes

Current verification snapshot:

- Client JavaScript syntax check passed after extracting from `ClientScript.html`.
- `git diff --check` passed except normal CRLF warnings.
- `Options` and `ClientScript.html` were not changed in this pass.
- Prior server score logic and seed checks in this branch remain valid.

Screenshot QA artifacts:

```text
C:\Users\Keyur\AppData\Local\Temp\macromolecule-e2e-screenshots-1780768886014
```

Important screenshots:

- `01-landing.png`
- `02-name-validation.png`
- `03-review-chart.png`
- `04-first-question.png`
- `05-correct-feedback.png`
- `06-multiselect-question.png`
- `07-multiselect-selected.png`
- `08-multiselect-feedback.png`
- `09-final-saved.png`
- `10-final-save-confirmed.png`
- `11-resume-before-reload.png`
- `12-resume-prompt.png`
- `13-resume-continued.png`

Additional local UI handoff:

```text
ui_requirements_handoff.md
```

## Known Practical Issues

These issues were found in QA and should be considered before future UI work:

1. On iPad portrait, `Check Answer` or `Continue` can land below the fold on some multi-select screens.
2. Save status wording can confuse students because progress checkpoint saves and final score saves use similar language.
3. Wrong multi-select feedback can be clearer when the student selected the right number of answers but the wrong set.
4. Keyboard/screen-reader focus should move to feedback or next action after answer evaluation.
5. Apps Script's top banner consumes vertical space and can make the game feel more cramped.
6. Phone-sized emulation inside the Apps Script iframe may report an unexpectedly wide inner layout, so responsive design should not assume normal viewport behavior.
7. Fake/test rows may exist in `BestScores` from QA names beginning with `Codex` or `QA`.

## Recommended Near-Term Improvements

Recommended next UI/code changes:

1. Keep the current game mechanics and data model.
2. Improve action visibility so `Check Answer` and `Continue` are always obvious on iPad.
3. Reword score sync messages:
   - Progress state: `Progress checkpoint saved.`
   - Final state: `Final score saved to Mr. Patel's Sheet.`
   - Retry state: `Saved on this iPad. Try again to sync to Mr. Patel's Sheet.`
4. Reword wrong multi-select feedback:
   - `Some choices need switching. Green = correct picks, yellow = needed, red = not part of the answer.`
5. Move focus to feedback after answer evaluation.
6. Add stronger ARIA grouping for multi-select options and connect the option group to the selected-count hint.
7. Re-test on iPad portrait and landscape after any UI changes.
8. Clean fake QA student rows from `BestScores` if the teacher wants the Sheet tidy.

## Deployment Notes

Prior deployment/setup history:

- `clasp push --force` succeeded after clasp authentication was fixed.
- `setupPiratePantry()` could not be run through `clasp run` because the Apps Script executable/API setup was not available for that command.
- Setup was successfully run through the live web app iframe using `google.script.run.setupPiratePantry()`.
- A versioned E2E deployment was created at `@1`.

Important caution:

- Apps Script deployment state and GitHub commit state are not the same.
- Before telling the user a change is live, verify whether it was pushed to Apps Script and whether a deployment was created or updated.
- Before telling the user a change is in GitHub, verify commit and push status.

## Google Sheet Data Model

`Config` controls runtime settings. Important rows:

- `target_correct`
- `correct_per_round`
- `allow_review_chart`
- `allow_replay`
- `question_bank_version`

`QuestionBank` stores cards. Important fields:

- `card_id`: unique ID used for scoring and deduplication.
- `active`: only active rows are loaded.
- `round_id`: 1-4.
- `interaction_type`: `single_choice` or `multi_select`.
- `options_json`: JSON array of visible choices.
- `correct_json`: JSON array of correct choices.
- `explanation`: student-facing feedback text.

`BestScores` stores one best-score row per normalized student key. Important fields:

- `student_key`
- `student_name`
- `best_correct`
- `target_correct`
- `grade_percent`
- `completed`
- `rounds_completed`
- `latest_summary_json`

## Score Integrity Rules

Do not change these lightly:

- Server recalculates score from `answeredCorrectIds`.
- Server rejects setup problems before saving.
- Server caps accepted correct count per round.
- Server ignores invalid, duplicate, or inactive card IDs.
- Server writes only if the new score improves the previous best.
- Student name validation exists on both client and server.

These rules protect the Sheet from bad client state, accidental tampering, and local storage glitches.

## LLM Development Instructions

When another LLM works on this project:

- Prefer small, direct edits.
- Use Apps Script-compatible JavaScript only.
- Do not introduce frameworks or a build pipeline unless the user explicitly approves.
- Do not remove Sheet-backed configuration.
- Do not remove server-side validation.
- Do not trust client-reported totals.
- Preserve the student saved-game flow.
- Preserve replay lock until final save confirmation.
- Preserve the teacher setup workflow.
- Do not use destructive git commands.
- Check git status before and after edits.
- Run syntax checks and relevant browser/E2E tests after changes.
- If deploying, clearly separate:
  - local file changes,
  - Apps Script push/deploy status,
  - GitHub commit/push status,
  - Google Sheet effects.

## Existing Handoff And Support Files

Related file:

```text
ui_requirements_handoff.md
```

That file is focused specifically on UI requirements and UI-option generation. This file is broader and should be used for full project context, implementation state, architecture, testing, deployment, and change tracking.

The previous email package file is:

```text
macromolecule_ui_handoff_package_20260606.zip
```

## Change Log Since Previous Handoff

### June 6, 2026 - C2 Guild Dashboard RPG Visual Redesign

Purpose:

- Implemented the approved `pirate_pantry_c2_ui_handoff.md` visual direction for Pirate Pantry: Macromolecule Match.
- Scope was CSS and HTML/template redesign only, preserving the existing game mechanics, local save, score sync, and Apps Script integration.

What changed:

- Replaced the old light quiz styling with a dark navy app shell, parchment content panels, gold accents, and deep green primary actions.
- Added a compact top dashboard header for gameplay with brand/crest, Quest Progress, Total Progress, and Toolkit modules.
- Removed the bottom footer information strip from gameplay. Reset saved game and save status now live in the top Toolkit area.
- Restyled landing, saved-game prompt, start-over confirm, review chart intro, gameplay, single-choice questions, multi-select questions, feedback, round complete, final save pending, final save confirmed, and load error states.
- Added large touch-friendly answer tiles with badge-style icons and clear selected/correct/needed/incorrect states.
- Added color-coded macromolecule treatment:
  - green for carbohydrates,
  - gold for lipids,
  - purple for proteins,
  - blue for nucleic acids.
- Restyled the review chart as a C2 field guide with four color-coded molecule cards.
- Updated the final screen to show a Quest Complete celebration, score summary, save status card, and Play Again locked until save confirmation.
- Fixed the question molecule chip to read `target_macromolecule` from the Apps Script payload, falling back to `target` only for non-live harness compatibility.

Files changed:

- `Styles.html`
- `ClientScript.html`
- `macro-LLM-handoff.md`

Preservation checks:

- `STORAGE_KEY` and `PENDING_SYNC_KEY` remain unchanged.
- `google.script.run.getGameData()` and `google.script.run.saveBestScore(payload)` call structures remain unchanged.
- Protected logic functions were compared against the previous commit and remain unchanged:
  - `evaluateAnswer`
  - `markCorrect`
  - `markIncorrect`
  - `scheduleSync`
  - `queueScoreSync`
  - `syncBestScore`
  - localStorage helpers
  - `resetCurrentAttempt`
  - `focusFeedback`
  - `scrollElementIntoView`
  - beforeunload handling
- Multi-select `role="group"` and `aria-describedby="selectionHint"` remain present.
- Modal focus-trap behavior in `openReviewModal` / `trapFocus` remains unchanged.

Tests run:

- Node `vm.Script` syntax check on extracted JavaScript from `ClientScript.html`: passed.
- `git diff --check`: passed with only normal LF-to-CRLF warnings.
- Seed sanity check: passed, 49 total cards with round counts 13/12/12/12.
- Four local Playwright CLI E2E tests against a mocked Apps Script harness at a 1024x768 viewport:
  - landing, name validation, review chart: passed.
  - single-choice question and correct feedback/focus: passed.
  - multi-select wrong feedback with color/text labels: passed.
  - full completion, final save pending, final save confirmed, Play Again unlock: passed.
- Console check after browser run: 0 errors, 0 warnings.

Screenshots captured:

```text
output/playwright/c2-screenshots/01-test1-landing.png
output/playwright/c2-screenshots/02-test1-name-validation.png
output/playwright/c2-screenshots/03-test1-review-chart.png
output/playwright/c2-screenshots/04-test2-single-choice-question.png
output/playwright/c2-screenshots/05-test2-single-choice-correct-feedback.png
output/playwright/c2-screenshots/06-test3-multi-select-question.png
output/playwright/c2-screenshots/07-test3-multi-select-wrong-feedback.png
output/playwright/c2-screenshots/08-test4-final-save-pending.png
output/playwright/c2-screenshots/09-test4-final-save-confirmed.png
```

Practical notes:

- The C2 redesign reads well in the 1024x768 local browser viewport.
- The gameplay header is compact enough to keep the question card visible without reintroducing a bottom footer.
- The multi-select feedback screen is clear but can become tall after labels appear; the sticky Continue button remains reachable, but this is the screen to watch most closely during iPad portrait polish.
- The local E2E harness mocked Apps Script save callbacks, so no real Sheet rows were written during these tests.

Deployment / external state:

- No Apps Script push was performed during this redesign pass.
- No Apps Script deployment was created.
- No Google Sheet changes were made.
- GitHub push should include only the source/docs files listed above, not generated screenshots, Playwright harness files, old zip packages, credentials, or temp artifacts.

### June 6, 2026 - LLM Handoff Refresh Prior To Push

Purpose:

- Refresh this handoff for the immediate "update handoff then push to GitHub" request.
- Keep the next LLM informed of current style-only workspace state.

What changed:

- Updated `macro-LLM-handoff.md` to reflect the current working branch:
  - Baseline commit now recognized as `04103e0`.
  - Current local changes limited to `Styles.html` plus this file.
  - `ClientScript.html` remains unchanged in this latest pass.

Files changed:

- `macro-LLM-handoff.md`

Scope notes:

- This section did not change game logic, score rules, or backend flow.
- Push scope remains source/docs only: style + handoff docs.

### June 6, 2026 - Pre-UI Audit Fixes

Purpose:

- Implemented the highest-priority fixes from the read-only pre-UI audit before visual UI polish begins.

What changed:

- Reset/start-over now cancels queued local sync work, marks the old attempt as canceled, clears matching pending sync payloads, and prevents old async callbacks from resurrecting local progress.
- Multi-select feedback now uses clearer wrong-answer wording instead of telling students they needed exactly N answers after they already selected exactly N.
- Feedback receives focus after answer evaluation, and the next action is scrolled into view.
- Multi-select options are grouped with `role="group"` and connected to the selected-count hint.
- `Check Answer` auto-scrolls into view once the student selects the exact required number of answers.
- Question action controls are sticky within long question cards to reduce iPad below-the-fold risk.
- Final save wording now distinguishes progress checkpoints from final score saves.
- The final screen tells students to keep the tab open while the score is saving.
- A `beforeunload` warning is registered while a completed final score is still pending or actively syncing.
- Corrupt localStorage values are removed instead of being repeatedly ignored.

Files changed:

- `ClientScript.html`
- `Styles.html`
- `macro-LLM-handoff.md`

Tests run:

- Apps Script/client syntax checks with Node `vm.Script`.
- `git diff --check` passed with only normal LF-to-CRLF warnings.
- Mocked reset/sync cancellation test passed.
- Seed question sanity check passed: 49 cards, round counts 13/12/12/12, no duplicate IDs, correct answers present in options.

Not done:

- No Apps Script push or deployment.
- No Google Sheet changes.
- No live browser E2E on the Apps Script deployment for these local fixes yet.

Email delivery:

- Updated handoff file sent to the authenticated Gmail account after this pass with subject `Macromolecule Game`.

### June 6, 2026 - Initial Baseline

This is the first `macro-LLM-handoff` file, so there is no prior handoff to compare against.

Captured baseline:

- Project purpose.
- Apps Script/Sheet architecture.
- Current file responsibilities.
- Game mechanics.
- UI requirements.
- Biology content scope.
- Score integrity rules.
- QA results.
- Known practical issues.
- Deployment and workspace state.
- Future handoff update protocol.

Files created in this change:

- `macro-LLM-handoff`

Files referenced but not changed by this handoff:

- `README.md`
- `ui_requirements_handoff.md`
- `Code.gs`
- `Index.html`
- `Styles.html`
- `ClientScript.html`
- `Setup.gs`
- `SeedData.gs`
- `Data.gs`
- `appsscript.json`

Tests run for this handoff:

- No app behavior tests were run because this task only created documentation and sent email.
- Local context was verified using file reads, git status, recent git log, and `clasp deployments`.

Email status:

- This file should be emailed to the authenticated Gmail account after creation.
