# Project Context

## Project Purpose and Audience

Macromolecule Evidence Lab is a short formative activity for Keyur's ninth-grade
biology classes. It helps students identify the four macromolecule classes,
support a classification with evidence, repair first-try misconceptions, and
apply corrected ideas to fresh cases. The primary device is a school iPad.

## Current Product and Learning Goals

- Complete one unscored tutorial, eight balanced diagnostic cases, targeted
  repair, and four fresh transfer cases in approximately 10–15 minutes.
- Preserve the first response as the diagnostic evidence; record repair and
  transfer separately.
- Align content to Unit 2, *Matter and Energy*, slides 11–16, including the four
  classes, elements, building blocks, functions, and examples.
- Use the accurate classroom caveat that foods *mostly represent* a category.
- Give the teacher private formative evidence without presenting a grade to the
  student.

## Approved Architecture and Stack Decisions

- The student app uses Vite, React, TypeScript, and accessible DOM interactions.
  React owns attempt state and evaluation.
- Progressive Web App support caches the application shell and content after a
  successful load. Active attempts and queued submissions recover locally.
- Vercel is the planned student-app host.
- Google Apps Script is limited to a cross-origin result service backed by a
  private Google Sheet. It does not render the new student interface.
- The client posts `text/plain;charset=utf-8` payloads shaped as
  `{ action: "submitResult", schemaVersion: 1, submissionId, result }`. The
  service returns an idempotent `SubmissionReceipt`; `GET ?action=health` is the
  only read-like endpoint.
- `Results` is append-only attempt history. `Summary` is one row per normalized
  first-name-plus-last-initial identity and flags possible name collisions.
- The preserved Apps Script application lives under `legacy/apps-script-v1/` and
  remains a historical reference, not the new runtime.

## Non-Negotiable Constraints and Safety Boundaries

- Collect only first name plus one last initial. Do not add a class period,
  account, authentication flow, or additional student details without approval.
- Do not expose student names, academic evidence, raw result rows, a leaderboard,
  or a public Sheet read endpoint.
- Do not connect local or preview builds to the live Sheet. Vercel Production is
  the only intended external client after explicit deployment approval.
- Keep the existing Apps Script deployment unchanged and out of classroom use
  until the replacement clears its release gates.
- Allow offline completion. Clearly distinguish local saving from confirmed Sheet
  receipt, retry queued submissions idempotently, and remove identity plus detailed
  responses locally after confirmed delivery.
- Never render answer-bearing metadata before evaluation during diagnosis or
  transfer. This is a release-blocking invariant.
- Do not claim a deployment, Sheet write, school-iPad check, or student-Wi-Fi
  check without direct evidence from that environment.

## Important Design and Content Decisions

- The fixed flow is identity, tutorial, eight diagnostic cases, distinct targeted
  repairs, four fresh transfer cases, and a non-graded summary.
- Each diagnostic and transfer case checks both classification and one supporting
  evidence concept. The diagnostic set contains two cases per macromolecule and
  two uses each of elements, building blocks, functions, and examples.
- Repair may reveal a focused reference and name its target; diagnosis and
  transfer may not expose the full review chart or any target label.
- Case order and the attempt seed are persisted; option order is recreated
  deterministically from that seed so refresh cannot reshuffle an active case.
- Portrait is the primary layout, but landscape is fully supported. Interactions
  use large tap targets, visible focus, concise feedback, and no hover dependency.
- This is distinct from **Cooking Macromolecules**: that project is a longer,
  landscape-first restaurant simulation with Phaser, progression, grades, and
  challenge play. Evidence Lab is a short DOM-based formative diagnostic. The
  projects do not share state, result schemas, or deployments.

## Rejected Approaches

- **Continue using Apps Script HTML as the student frontend:** rejected for this
  modernization; Apps Script remains useful only as the small private result
  receiver.
- **Phaser or Three.js:** rejected because the core student verbs are reading,
  classifying, explaining evidence, and correcting misconceptions. A scene engine
  would add complexity without improving this learning loop or accessibility.
- **Reuse Cooking Macromolecules as this activity:** rejected because its longer
  game loop, landscape requirement, scoring, and progression serve a different
  classroom purpose.
- **Show a full review chart before or during assessment:** rejected because it
  obscures first-try evidence and can disclose answers.
- **Grade, points, leaderboard, public student list, or timer pressure:** rejected
  because this activity is formative and should surface learning rather than rank
  students.
- **Trust client-computed summaries or conflicting duplicate submissions:**
  rejected. The result service validates relationships, recomputes summaries, and
  serializes idempotent writes.

## Durable Role-Agent Findings

- Classroom fit depends more on a clear 10–15 minute arc, fast recovery, and
  readable feedback than on animation or game-engine spectacle.
- First-try, repair, and transfer data answer different instructional questions
  and must remain separate.
- First name plus one last initial can collide. The private Summary tab must flag
  that limitation rather than implying a verified unique identity.
- The prior answer-revealing molecule label is a release blocker, not a cosmetic
  issue.

## Canonical References

- Learning flow and curriculum boundary: `docs/LEARNING_DESIGN.md`
- Current operational state: `docs/handoffs/CURRENT_STATUS.md`
- Unit source: `../Biology Context/[SHARED] Unit 2_ Matter and Energy Notes 2025.pptx`
- Preserved legacy implementation and historical notes: `legacy/apps-script-v1/`
- Client result contracts: `src/types.ts`

## Conditions for Reconsideration

Reopen a durable decision only if Keyur changes the classroom purpose, identity
requirements, grading policy, curriculum source, external data destination, or
deployment target; if real student testing shows the 10–15 minute flow is not
workable; or if accessibility evidence shows the current DOM approach cannot meet
a required interaction. Any change to storage, public visibility, authentication,
or deployment requires a new privacy and classroom-operations review.
