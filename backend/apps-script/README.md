# Macromolecule Evidence Lab results gateway

This folder contains the private results backend for the modernized student app. It is a Google Apps Script V8 web app that writes compact formative results into a private Google Sheet.

It does **not** replace or deploy over the legacy Apps Script game. Use a new Apps Script project and a new deployment URL.

## Data boundary

- The public web app accepts validated result submissions and exposes a non-sensitive health response.
- It has no public results, search, student list, leaderboard, update, or delete endpoint.
- The destination Sheet ID lives in the Apps Script project's Script Properties under `RESULTS_SPREADSHEET_ID`; it is not sent to the browser.
- The Sheet must remain **Restricted** in Google Drive. A warning-only sheet protection reduces accidental edits but does not control Drive sharing.
- First name plus last initial is pseudonymous classroom data, not a unique or anonymous identifier. If the same normalized identity has multiple attempts, `Summary` marks it `REVIEW` because two students can share that identity.
- The endpoint is intentionally callable by students without accounts. Validation and idempotency prevent malformed or duplicate app retries, but they are not authentication or anti-spam controls. Do not use this service for a summative grade or sensitive student records.
- Because the production endpoint is a public write surface, anyone who discovers it can submit a structurally valid fabricated result. Use these rows only as low-stakes formative evidence, monitor unexpected volume, and follow district retention practices for old results.

## Wire contract

Send `POST` requests with `Content-Type: text/plain;charset=utf-8` to avoid a cross-origin JSON preflight:

```json
{
  "action": "submitResult",
  "schemaVersion": 1,
  "submissionId": "a-stable-uuid-or-attempt-id",
  "result": {
    "timestamp": "2026-07-15T20:00:00.000Z",
    "game": "Macromolecule Evidence Lab",
    "gameVersion": "evidence-lab-v1",
    "contentVersion": "unit2-slides-11-16-v1",
    "studentName": "Ada L",
    "startedAt": "2026-07-15T19:48:00.000Z",
    "completedAt": "2026-07-15T20:00:00.000Z",
    "activeSeconds": 720,
    "diagnostic": { "correct": 12, "total": 16 },
    "transfer": { "correct": 6, "total": 8 },
    "byMacromolecule": {
      "Carbohydrate": { "correct": 4, "total": 4 },
      "Lipid": { "correct": 2, "total": 4 },
      "Protein": { "correct": 4, "total": 4 },
      "Nucleic Acid": { "correct": 2, "total": 4 }
    },
    "byConcept": {
      "elements": { "correct": 2, "total": 2 },
      "building-block": { "correct": 1, "total": 2 },
      "function": { "correct": 1, "total": 2 },
      "example": { "correct": 2, "total": 2 }
    },
    "repairsCompleted": 2,
    "unresolvedCount": 0,
    "misconceptionCodes": ["lipid-elements", "protein-building-block"]
  }
}
```

The gateway accepts only the current `evidence-lab-v1` game and `unit2-slides-11-16-v1` content versions. It counts both the macromolecule classification and supporting-evidence answer for each case. It therefore requires 16 diagnostic checks (eight cases), eight transfer checks (four cases), four diagnostic checks per macromolecule, and two evidence checks per concept. Macromolecule correct counts reconcile to the combined `diagnostic.correct`; concept counts describe only the evidence half, and the remaining diagnostic checks must form a possible 0–8 classification count. Repair and unresolved counts must account for every distinct misconception code.

The receipt is:

```json
{
  "ok": true,
  "duplicate": false,
  "submissionId": "a-stable-uuid-or-attempt-id",
  "retryable": false
}
```

Replaying the same submission ID with the same validated data returns `ok: true` and `duplicate: true`. Reusing it with different data returns a non-retryable conflict. Apps Script Content Service does not provide useful custom HTTP status handling here, so the client must use `ok` and `retryable` from the JSON receipt rather than relying only on HTTP status.

`GET ?action=health` returns only service/schema/configuration status. Every other GET action is rejected and no Sheet data is returned.

## Private Sheet layout

Setup creates two tabs:

- `Results` is append-only attempt history. It includes normalized identity, versions, timestamps, active time, diagnostic and transfer totals, per-macromolecule and per-concept counts, repairs, unresolved misconceptions, backend-computed percentages, and weakest categories.
- `Summary` has one row per case-insensitive normalized first-name/last-initial identity. It recomputes attempt count, latest attempt, best diagnostic result, latest transfer result, latest weak areas, source submission IDs, and the possible-collision review flag from `Results` after every accepted append.

Do not rename these tabs or their header columns. If existing headers differ, the gateway fails closed without changing data.

## One-time setup (no deployment)

1. Create a new Google Sheet for this project and leave its Drive sharing set to **Restricted**.
2. Create a new Apps Script project owned by the same teacher account. Do not reuse the legacy game's project or URL.
3. Add `Code.gs` and `appsscript.json` from this folder and confirm the runtime is V8. The included `.claspignore` prevents the README and local contract test from being pushed into Apps Script if CLASP is used.
4. If the script is bound to the results Sheet, run `setupMacromoleculeResultsGateway()` once. If it is standalone, run `configureResultsSpreadsheet("SHEET_ID")` from a temporary editor call, then remove the literal ID from the editor and save.
5. Approve the requested Sheet permissions.
6. Confirm the `Results` and `Summary` tabs exist, each has the documented header row, and each displays an edit warning.
7. In **Project Settings > Script Properties**, confirm `RESULTS_SPREADSHEET_ID` exists. Do not put it in frontend source or Git.

Both setup functions are safe to run again when the expected tabs and headers are intact. They configure storage only; they do not deploy the web app.

## Controlled test and deployment checklist

Use a disposable private Sheet for testing when possible.

1. In Apps Script, run `setupMacromoleculeResultsGateway()` or `configureResultsSpreadsheet(...)` and review the execution log for errors.
2. Deploy a **test deployment** as a web app, executing as the deploying teacher account. Use the anonymous access option required by school iPads only for that test project.
3. Open `DEPLOYMENT_URL?Action=health` with lowercase `action` instead: `DEPLOYMENT_URL?action=health`. Confirm `ok`, schema version `1`, and `configured: true`.
4. From the test client, send the example-shaped `text/plain;charset=utf-8` payload with a unique submission ID.
5. Confirm one `Results` row and one `Summary` row appear. Check diagnostic/transfer percentages, weakest labels, repairs, source ID, and identity normalization.
6. Send the identical payload again. Confirm the receipt says `duplicate: true` and neither tab gains another attempt.
7. Reuse that ID with one changed value. Confirm a non-retryable conflict and no Sheet mutation.
8. Send malformed totals, a missing last initial, a repeated misconception code, and an unsupported action. Confirm each is rejected without a new row.
9. Submit a second valid attempt for the same normalized identity. Confirm `Summary` updates to two attempts and marks `Possible Name Collision Review` as `REVIEW`.
10. Remove controlled test rows before classroom use, or switch the Script Property to a clean production Sheet and rerun setup.

After those checks, create a versioned production web-app deployment that executes as the teacher and permits the student app's anonymous requests. Copy only the `/exec` deployment URL into the **Vercel Production** environment variable. Keep local development and Vercel preview environments disconnected from the live Sheet.

Deploying, changing Drive sharing, connecting Vercel Production, sending a controlled live result, and deleting test data are explicit release actions. They are not performed by the files in this folder and should wait for teacher approval.

## Release verification

- Verify the production health response without exposing the Sheet ID.
- Submit one approved controlled result from the production Vercel URL.
- Confirm exactly one accurate row in both tabs and confirm the duplicate retry behavior.
- Remove the controlled result and rebuild or clear its summary row before students use the app.
- Recheck that the Sheet is Restricted and that no public read endpoint exists.
- Keep the legacy Apps Script deployment unchanged until the new app passes the classroom iPad pilot.
