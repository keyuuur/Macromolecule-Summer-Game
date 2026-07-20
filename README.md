# Macromolecule Evidence Lab

Macromolecule Evidence Lab is a short, formative biology activity for Keyur's
ninth-grade classes. Students classify carbohydrates, lipids, proteins, and
nucleic acids, explain one piece of supporting evidence for each case, repair
first-try misconceptions, and then apply the same ideas to fresh transfer cases.

The intended classroom run is 10–15 minutes on a school iPad. It is not a
graded assignment, leaderboard, or public student record.

## Student Flow

1. Enter a first name and one last initial.
2. Complete one unscored tutorial case.
3. Complete eight diagnostic cases: two per macromolecule and two checks per case.
4. Repair each distinct first-try misconception with focused guidance.
5. Complete four unaided transfer cases: one per macromolecule.
6. Review a non-graded learning summary and result-delivery status.

Correct answers and answer-bearing labels stay hidden until a response is
evaluated. A food is described as *mostly representing* a category because real
foods can contain more than one kind of macromolecule.

## Technology

- Vite, React, and TypeScript for the student app
- Accessible DOM controls rather than Phaser, Three.js, or a canvas
- Progressive Web App support for cached loading and interrupted-session recovery
- Vercel as the planned student-app host
- Google Apps Script and a private Google Sheet as the planned result receiver

The result endpoint is inactive when `VITE_RESULTS_ENDPOINT` is not configured.
Local and preview development must remain disconnected from the live Sheet.

If a result cannot be delivered, the full queued submission remains only on that
iPad for at most seven days. The check-in screen shows any unsent results and
provides a confirmed teacher-assisted delete control for shared devices.

## Local Development

```powershell
npm install
npm run dev
```

Verification commands:

```powershell
npm run lint
npm run test:run
npm run build
npm run playtest
npm run verify
```

## Project Map

- `src/` — student interface, content, attempt state, persistence, and result gateway
- `backend/apps-script/` — private result receiver and Sheet setup
- `docs/LEARNING_DESIGN.md` — authoritative learning flow and content boundaries
- `docs/handoffs/PROJECT_CONTEXT.md` — stable product and architecture decisions
- `docs/handoffs/CURRENT_STATUS.md` — current verified migration posture and gates
- `legacy/apps-script-v1/` — preserved Pirate Pantry Apps Script application and its historical handoffs

## Safety and Release Posture

Only first name plus one last initial is collected. Student names and detailed
responses must not appear in public views. There is no public read or leaderboard
endpoint.

The legacy Apps Script deployment has not been replaced. No Vercel production
deployment or live Google Sheet connection should occur until the automated,
browser, school-iPad, student-Wi-Fi, and controlled result-submission gates in
`docs/handoffs/CURRENT_STATUS.md` are satisfied and Keyur explicitly approves the
external change.
