# Macromolecule Summer Game

This folder is the local workspace for the Macromolecule Summer Game.

Connected services:

- GitHub: https://github.com/keyuuur/Macromolecule-Summer-Game
- Google Apps Script: configured in `.clasp.json`

Current setup notes:

- The folder has its own Git repository so this project stays separate from the larger parent folder.
- Credential files are ignored so they do not get committed to GitHub.
- Apps Script uses the Google Sheet connected to the script for `Config`, `QuestionBank`, and `BestScores`.
- Apps Script pull/push may still need access to be fixed if clasp is not logged into an account that can edit the script.

To fix Apps Script access, make sure the Apps Script project is shared with the Google account currently logged in to clasp, or log clasp into the Google account that owns the script.

## Teacher setup

After the Apps Script files are pushed or copied into the bound Apps Script project:

1. Open the connected Google Sheet.
2. Click **Extensions**.
3. Click **Apps Script**.
4. Select the `setupPiratePantry` function.
5. Click **Run**.
6. Approve permissions if Google asks.
7. Return to the Sheet and confirm these tabs exist:
   - `Config`
   - `QuestionBank`
   - `BestScores`

The setup function is safe to run again. It will not duplicate the starter question bank if the `QuestionBank` tab already has question rows.

## Student testing checklist

1. Deploy the Apps Script as a web app.
2. Open the web app link on an iPad or iPad-sized browser window.
3. Try starting with a blank name and confirm it is blocked.
4. Enter a teacher-recognizable name.
5. Confirm the review chart appears.
6. Answer one single-choice question correctly and confirm the correct count increases.
7. Answer one question incorrectly and confirm the explanation appears.
8. Reach the end of a round and confirm it advances after 8 correct answers.
9. Refresh the page during a game and confirm the saved-game prompt appears.
10. Confirm `BestScores` creates or updates the student row only when the score improves.
