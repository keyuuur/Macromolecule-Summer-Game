import { describe, expect, it } from 'vitest'
import { EVIDENCE_CONCEPTS, MACROMOLECULES, type DiagnosticCase } from '../types'
import {
  CASE_BANK,
  CONTENT_VERSION,
  TUTORIAL_CASE,
  buildAttemptCaseSelection,
  getCaseById,
  validateCaseBank,
} from './caseBank'

describe('case bank', () => {
  it('is versioned, valid, and includes one unscored tutorial', () => {
    expect(CONTENT_VERSION).toBe('unit2-slides-11-16-v1')
    expect(TUTORIAL_CASE.eligibleStages).toEqual(['tutorial'])
    expect(CASE_BANK.filter((item) => item.eligibleStages.includes('tutorial'))).toEqual([TUTORIAL_CASE])
    expect(validateCaseBank()).toEqual({ valid: true, errors: [] })
  })

  it('resolves every stable id and keeps correct answers in their choice sets', () => {
    for (const item of CASE_BANK) {
      expect(getCaseById(item.id)).toBe(item)
      expect(item.macroChoices).toContain(item.correctMacro)
      expect(item.evidenceChoices).toContain(item.correctEvidence)
    }
    expect(getCaseById('missing-case')).toBeUndefined()
  })

  it('generates exactly two diagnostic cases per macromolecule and concept', () => {
    const expectedMatrix = {
      Carbohydrate: ['elements', 'example'],
      Lipid: ['building-block', 'function'],
      Protein: ['function', 'example'],
      'Nucleic Acid': ['elements', 'building-block'],
    }

    for (let seed = 0; seed < 32; seed += 1) {
      const selection = buildAttemptCaseSelection(seed)
      const diagnosticCases = selection.diagnosticCaseIds.map((id) => getCaseById(id))

      expect(selection.diagnosticCaseIds).toHaveLength(8)
      expect(new Set(selection.diagnosticCaseIds)).toHaveLength(8)
      expect(diagnosticCases.every((item) => item?.eligibleStages.includes('diagnostic'))).toBe(true)

      for (const macromolecule of MACROMOLECULES) {
        const macroCases = diagnosticCases.filter((item) => item?.macromolecule === macromolecule)
        expect(macroCases).toHaveLength(2)
        expect(macroCases.map((item) => item!.concept).sort()).toEqual([...expectedMatrix[macromolecule]].sort())
      }
      for (const concept of EVIDENCE_CONCEPTS) {
        expect(diagnosticCases.filter((item) => item?.concept === concept)).toHaveLength(2)
      }
    }
  })

  it('selects one fresh transfer case per macromolecule', () => {
    for (let seed = 0; seed < 32; seed += 1) {
      const selection = buildAttemptCaseSelection(seed)
      const transferCases = selection.transferCaseIds.map((id) => getCaseById(id))
      const diagnosticCases = selection.diagnosticCaseIds.map((id) => getCaseById(id))

      expect(selection.transferCaseIds).toHaveLength(4)
      expect(new Set(selection.transferCaseIds)).toHaveLength(4)
      expect(transferCases.every((item) => item?.eligibleStages.includes('transfer'))).toBe(true)
      expect(selection.transferCaseIds.some((id) => selection.diagnosticCaseIds.includes(id))).toBe(false)

      for (const macromolecule of MACROMOLECULES) {
        const transferCase = transferCases.find((item) => item?.macromolecule === macromolecule)
        const diagnosticConcepts = diagnosticCases
          .filter((item) => item?.macromolecule === macromolecule)
          .map((item) => item!.concept)
        expect(transferCase).toBeDefined()
        expect(diagnosticConcepts).not.toContain(transferCase!.concept)
      }
    }
  })

  it('is deterministic for the same seed and varies the selected cases across seeds', () => {
    expect(buildAttemptCaseSelection(9)).toEqual(buildAttemptCaseSelection(9))
    expect(buildAttemptCaseSelection(Number.NaN)).toEqual(buildAttemptCaseSelection(0))
    expect(buildAttemptCaseSelection(0)).not.toEqual(buildAttemptCaseSelection(1))
  })

  it('enforces the answer-hiding invariant for diagnostic and transfer prompts', () => {
    const base = CASE_BANK.find((item) => item.id === 'diag-carb-elements-01')
    expect(base).toBeDefined()

    const leakedCase: DiagnosticCase = {
      ...base!,
      id: 'leaked-answer-case',
      prompt: 'This is a carbohydrate. Choose its category.',
    }
    const result = validateCaseBank([leakedCase])

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('leaked-answer-case: prompt text reveals the correct macromolecule')

    const embeddedLeak: DiagnosticCase = {
      ...base!,
      id: 'embedded-answer-case',
      macromolecule: 'Lipid',
      correctMacro: 'Lipid',
      prompt: 'A phospholipid is shown. Choose its category.',
    }
    expect(validateCaseBank([embeddedLeak]).errors).toContain(
      'embedded-answer-case: prompt text reveals the correct macromolecule',
    )
  })

  it('uses mostly-represent wording for food classification prompts', () => {
    const foodPrompts = CASE_BANK.filter(
      (item) =>
        (item.eligibleStages.includes('diagnostic') || item.eligibleStages.includes('transfer')) &&
        item.concept === 'example' &&
        /bread|butter|oil|pasta|potato|nuts|meat|beans|food/i.test(item.prompt),
    )

    expect(foodPrompts.length).toBeGreaterThan(0)
    for (const item of foodPrompts) {
      expect(item.prompt.toLowerCase()).toContain('mostly represent')
    }
  })
})
