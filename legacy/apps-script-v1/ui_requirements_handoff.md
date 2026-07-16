# Pirate Pantry Macromolecule Match UI Requirements Handoff

Generated: June 6, 2026

Use this document as a UI generation brief for creating improved interface options for the Macromolecule Summer Game. The goal is not to redesign the game mechanics. The goal is to create polished, student-friendly UI options that Codex can later implement inside the existing Google Apps Script web app.

## Product Summary

Pirate Pantry Macromolecule Match is a browser-based review game for summer school biology students. Students identify the four biological macromolecules by matching clues about foods, elements, building blocks, functions, and examples.

The app runs as a Google Apps Script web app connected to a Google Sheet. The Sheet stores configuration, the question bank, and student best scores. Students use the game mostly on iPads or iPad-sized screens.

## Primary Users

- High school biology students in summer school.
- Students may be using school iPads.
- Students may have limited patience for long instructions.
- Students need clear progress, obvious actions, and readable answer feedback.
- The teacher needs scores to save reliably to the connected Google Sheet.

## Current Game Mechanics

- The game has 4 rounds.
- Each round requires 8 correct answers.
- The full target score is 32 correct answers.
- A question can be single choice or multi-select.
- Incorrect cards return later in the same round.
- Correct cards are counted once by card ID.
- Scores save to the connected Google Sheet as best scores.
- Local progress saves on the iPad so students can refresh and continue.
- Play Again should remain locked until the final score is confirmed saved.

## Biology Content Scope

The UI should support questions about:

- Carbohydrates
- Lipids
- Proteins
- Nucleic acids

The review chart should be able to show, for each macromolecule:

- Elements
- Building blocks or monomers
- Main jobs or biological functions
- Food or biological examples

The UI should not make the biology feel like trivia detached from the review chart. The chart should feel like an allowed student aid, not a hidden reference.

## Required App Flow

### 1. Loading State

Required elements:

- Clear loading message.
- Branded game identity.
- Error state if the game cannot load from Apps Script or the Sheet.

Design notes:

- Loading should feel fast and calm.
- Avoid long explanatory text.

### 2. Landing And Name Entry

Required elements:

- Game title.
- Short game premise.
- Student name input.
- Start button.
- Name validation error area.

Required behavior:

- Blank names are blocked.
- First-name-only entries are blocked.
- Student must enter first and last name, or first name plus last initial.
- Error copy should be direct: "Enter first and last name, or first name plus last initial."

Design notes:

- The first visible screen should be the usable game start, not a marketing landing page.
- The name input and Start button must be obvious on iPad.

### 3. Saved Game Prompt

Required elements:

- Saved game message with the saved student name.
- Continue Saved Game button.
- Start Over button.

Required behavior:

- Continue restores progress from local storage.
- Start Over asks for confirmation before clearing local saved progress.
- Start Over must not imply that the teacher's Sheet score will be deleted.

### 4. Optional Review Chart

Required elements:

- Quick Review heading.
- One review item per macromolecule.
- Start Game button.
- Skip Review button.

Required behavior:

- If the Sheet config `allow_review_chart` is true, show the review chart before the game.
- If `allow_review_chart` is false, skip the review chart.
- Review Chart can also be opened during gameplay and on the final screen when allowed.

Design notes:

- The chart must be scannable, not dense.
- The chart should fit iPad portrait without feeling cramped.
- Students should be able to compare the four macromolecules quickly.

### 5. Game Screen

Required elements:

- Current round name and intro.
- Review Chart button when allowed.
- Overall progress toward 32.
- Current round progress toward 8.
- Question prompt.
- Answer option buttons.
- Feedback area.
- Continue button after feedback.
- Save/sync status message.
- Reset saved game control.

Required behavior:

- Overall and round progress must update after correct answers.
- Incorrect answers do not increase the score.
- Incorrect cards return later.
- Correct answers show feedback and then proceed.
- Reset saved game asks for confirmation.

Design notes:

- The primary action must stay visible or be brought into view after a selection.
- The Apps Script web app wrapper can consume vertical space, so avoid layouts that require students to hunt below the fold for Check Answer or Continue.
- Keep the screen focused on one question at a time.

### 6. Single-Choice Questions

Required elements:

- Option buttons.
- Immediate feedback after choosing an option.
- Continue button after feedback.

Required behavior:

- A single tap selects and evaluates the answer.
- Correct selected answer should be visually marked.
- Incorrect selected answer should be visually marked.
- The needed correct answer should also be identifiable after an incorrect answer.

### 7. Multi-Select Questions

Required elements:

- Selection hint, such as "Choose 3 answers. Selected: 2 of 3."
- Option buttons with selected state.
- Check Answer button.
- Feedback labels for each relevant option.
- Continue button after feedback.

Required behavior:

- Check Answer is disabled until the student selects exactly the required number of answers.
- Students can toggle selected options before checking.
- After checking, the option set is locked.
- Correct selected options are labeled "Correct pick."
- Correct options that were missed are labeled "Needed."
- Incorrect selected options are labeled "Not part of answer."

Design notes:

- Multi-select must be very explicit. Students should not wonder whether they are supposed to select one answer or multiple answers.
- Avoid feedback wording that says "You needed exactly N answers" when the student did choose exactly N but chose the wrong set.
- Better failure copy: "Some choices need switching. Green = correct picks, yellow = needed, red = not part of the answer."

### 8. Round Complete Screen

Required elements:

- Round complete heading.
- Finished round name.
- Start Next Round button.

Required behavior:

- Appears after 8 correct answers in the current round.
- Advances to the next round.
- If the fourth round is complete, show the final screen instead.

### 9. Final Screen

Required elements:

- Completion message.
- Final attempt score.
- Rounds completed.
- Score save status.
- Try Saving Again button when needed.
- Play Again button when allowed.
- Review Chart button when allowed.

Required behavior:

- Final score syncs to the connected Google Sheet.
- Play Again is disabled until final score sync is confirmed.
- Try Saving Again appears if a pending save exists.
- If replay is disabled by config, Play Again should not appear.

Design notes:

- Distinguish progress checkpoint saving from final score saving.
- Suggested final copy: "Final score saved to Mr. Patel's Sheet."
- Suggested progress copy: "Progress checkpoint saved."

## Button And Control Requirements

Primary actions:

- Start
- Continue Saved Game
- Start Game
- Check Answer
- Continue
- Start Round N
- Play Again

Secondary actions:

- Skip Review
- Review Chart
- Close
- Try Saving Again
- Cancel

Destructive or reset actions:

- Start Over
- Yes, Start Over
- Reset saved game

Interaction requirements:

- Buttons must be at least 44px tall for touch.
- Buttons must visibly respond to hover, focus, selected, disabled, and active states.
- Disabled buttons must still explain why they are disabled when context matters.
- The most likely next action should be visually dominant.
- Do not place several equally loud buttons together.
- Do not hide classroom-critical actions below the fold.

## Visual Design Requirements

The design should:

- Feel like a playable classroom review game.
- Use a restrained pirate pantry theme.
- Keep biology readability above decorative theme.
- Use clear contrast.
- Avoid tiny text.
- Avoid decorative backgrounds that reduce legibility.
- Avoid UI cards nested inside other UI cards.
- Avoid long visible instructions.
- Avoid layouts that look like a marketing hero instead of a game.
- Keep the main game interaction visible in the first viewport.
- Use stable dimensions so progress bars, buttons, labels, and feedback do not shift awkwardly.

Recommended visual direction:

- Friendly classroom game tone.
- Warm paper or pantry-inspired surfaces are acceptable if contrast stays strong.
- Icons can help for review, progress, save status, and close actions.
- Avoid one-note color palettes.
- Use color plus text labels for answer feedback. Do not rely on color alone.

## Responsive Requirements

Primary target:

- iPad portrait and iPad landscape.

Secondary target:

- Desktop browser.
- Phone-sized browser if a student opens the link on another device.

Known issue from QA:

- Inside the Apps Script iframe, a phone-size emulation may report a wider internal layout than expected. Do not rely only on normal viewport width assumptions.

Responsive expectations:

- On iPad portrait, answer options should avoid making the action button hard to find.
- On narrow or constrained views, answer options can stack to one column.
- The review chart should switch from multi-column to single-column or two-column as needed.
- No answer text should overflow its button.
- The Apps Script banner at the top should be expected and accounted for.

## Accessibility Requirements

The design should support:

- Keyboard navigation.
- Visible focus indicators.
- Screen reader-friendly headings.
- Review modal focus trap.
- Escape key closes the review modal.
- Focus returns to the triggering button after modal close.
- Feedback should receive focus or be announced after an answer is checked.
- Multi-select groups should be semantically grouped and connected to the selection hint.
- Selected state must not rely on color only.

## Practical Student Issues Found In QA

Address these in future UI options:

- The Check Answer or Continue button can land below the fold on iPad portrait during some multi-select questions.
- Save wording can be confusing because partial progress and final score saving use similar messages.
- Wrong multi-select feedback can be clearer when the student selected the right number of answers but the wrong set.
- Keyboard and screen reader focus should move to feedback or the next action after an answer.
- The Apps Script banner takes vertical space and should be treated as a fixed environmental constraint.

## Screenshot Manifest

The attached screenshots from the live Apps Script QA pass show:

- `01-landing.png`: current landing and student name entry.
- `02-name-validation.png`: first-name-only validation state.
- `03-review-chart.png`: review chart before gameplay.
- `04-first-question.png`: first question screen.
- `05-correct-feedback.png`: correct single-choice feedback.
- `06-multiselect-question.png`: multi-select question before selection.
- `07-multiselect-selected.png`: multi-select selected count and enabled Check Answer state.
- `08-multiselect-feedback.png`: multi-select feedback labels.
- `09-final-saved.png`: final screen during or near save completion.
- `10-final-save-confirmed.png`: final screen after save confirmation.
- `11-resume-before-reload.png`: game state before refresh.
- `12-resume-prompt.png`: saved game prompt after refresh.
- `13-resume-continued.png`: resumed game state.

## UI Option Generation Instructions

When generating UI options, produce complete screen concepts for:

- Landing and name entry.
- Review chart.
- Standard question.
- Multi-select question.
- Feedback state.
- Round complete.
- Final save-confirmed screen.
- Saved game prompt.

Each option should specify:

- Layout structure.
- Button hierarchy.
- Color system.
- Typography scale.
- Progress display.
- Feedback states.
- Responsive behavior.
- Accessibility notes.

Do not remove:

- Student name validation.
- Review chart toggle behavior.
- 4-round structure.
- 8-correct-per-round progress.
- Multi-select exact-count gating.
- Local saved-game recovery.
- Google Sheet score sync status.
- Play Again lock until final score save is confirmed.

