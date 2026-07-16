# Learning Design

## Purpose

Macromolecule Evidence Lab is a 10–15 minute formative companion to Unit 2 for
ninth-grade biology. It captures what students can identify on the first try,
helps them repair specific misconceptions, and checks whether they can transfer
the corrected idea to a fresh case.

It is deliberately different from **Cooking Macromolecules**. Cooking
Macromolecules is a longer, landscape-first restaurant-management game with a
Phaser scene, order progression, grades, and optional challenge play. Evidence
Lab is a portrait-first, accessible DOM activity with no game economy, timer,
grade, leaderboard, class period, or public student display. The two projects
may share curriculum language, but they must not share runtime state, student
records, result schemas, deployments, or classroom promises.

## Unit 2 Alignment

The canonical content boundary is Unit 2, *Matter and Energy*, slides 11–16:

- Slide 11 introduces monomers and the four classes: carbohydrates, lipids,
  proteins, and nucleic acids. Accuracy note: lipids are not true repeating-unit
  polymers; this activity follows the course chart by calling fatty acids their
  building components rather than treating them as repeating monomers.
- Slide 13: carbohydrates contain C/H/O, use simple sugars as building blocks,
  provide immediate or short-term energy, and include breads, potatoes,
  vegetables, and sugars.
- Slide 14: lipids contain C/H/O, use fatty acids as building blocks, provide
  insulation/protection and long-term energy storage, contribute to cell
  membranes, and include fats, oils, waxes, and butter.
- Slide 15: proteins contain C/H/O/N, use amino acids as building blocks, and
  support muscles, hormones, enzymes, antibodies, and foods such as nuts, meat,
  and beans.
- Slide 16: nucleic acids contain C/H/O/N/P, use nucleotides as building blocks,
  hold genetic information, provide protein-building instructions, and include
  DNA and RNA. The source slide also lists ATP; this activity does not classify
  ATP as a nucleic acid because ATP is a nucleotide.

Use classroom-level phrasing from these slides. Do not expand the activity into
detailed biochemistry. Foods must be described as *mostly representing* a
category because real foods can contain multiple macromolecules.

## Fixed Student Flow

| Stage | Required experience | Learning evidence |
| --- | --- | --- |
| Identity | First name and one last initial | Identity only; no class period |
| Tutorial | One guided, unscored case | Excluded from every assessment denominator |
| Diagnostic | Eight cases, two per macromolecule | Two first-try checks per case: classification and one evidence concept |
| Repair | One task per distinct first-try misconception | Focused reference, then correction repeated until successful |
| Transfer | Four fresh cases, one per macromolecule | Two unaided checks per case; no reference card |
| Summary | Non-graded learning summary | First-try evidence, repaired concepts, transfer performance, and sync state |

The diagnostic set uses this fixed balanced coverage matrix:

| Macromolecule | Diagnostic evidence concepts |
| --- | --- |
| Carbohydrate | Elements; example |
| Lipid | Building block; function |
| Protein | Function; example |
| Nucleic acid | Elements; building block |

This produces two diagnostic cases per macromolecule and two uses of each
evidence concept across the eight cases. Every case separately asks students to:

1. classify the macromolecule; and
2. answer one supporting question about elements, building blocks, function, or
   examples.

First-try records never change after feedback or repair. Repair completion shows
that coaching worked; it does not convert an initial miss into an initial hit.
Transfer cases must be new prompts rather than restated diagnostic cases.

## Misconception and Repair Rules

- Generate the repair queue from distinct misconception codes on first-try
  diagnostic responses. If both checks reveal the same coded misconception,
  create one repair task, not two.
- A repair card may intentionally name the target macromolecule and show only the
  focused facts needed for that misconception.
- Require a corrected response after the reference card. Repeat the task until
  the student succeeds; do not add timer pressure or subtract points.
- Record repair attempts and completion separately from first-try diagnostic and
  transfer evidence.
- Keep feedback concise, specific, and phrased around the clue the student should
  use next time.

## Answer-Hiding Invariant

Before a diagnostic or transfer response is evaluated, the visible and
accessibility trees must not reveal the correct macromolecule or evidence answer.
This prohibits:

- target-macromolecule labels, answer-coded badges, filenames, alt text, ARIA
  labels, test IDs, or source metadata;
- category-specific color or icon treatments that identify the answer;
- preselected answers or option ordering that consistently signals correctness;
- a full review chart or reference panel during diagnosis or transfer; and
- feedback from a previous case that remains visible beside a new active case.

Stable seeded shuffling must persist the case and option order for the active
attempt so a refresh cannot reveal or reshuffle answers. Automated tests should
inspect both visible text and accessible names for leakage.

## Classroom Fit and Reporting

- Design portrait-first for iPad use, while keeping every control usable at
  768×1024 and 1024×768.
- Use large touch targets, short instructions, visible keyboard focus, readable
  contrast, forgiving recovery, and no hover-only action.
- Do not add scores, percentages framed as grades, points, timer pressure,
  leaderboards, or public student lists.
- Report first-try diagnostic evidence, completed repairs, unresolved repairs,
  and transfer evidence as learning information for Mr. Patel.
- Clearly distinguish `saved on this iPad` from `received by Mr. Patel's Sheet`.
- After confirmed delivery, remove student identity and detailed response data
  from local storage, retaining only a non-identifying receipt.

## Completion Criteria

A representative student should finish in approximately 10–15 minutes without
needing teacher explanation of the controls. Release remains blocked until the
complete flow passes automated checks, portrait and landscape browser playtests,
a real school-iPad check, student-Wi-Fi testing, and a controlled private-Sheet
submission that is subsequently removed.
