import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, buildAttemptCaseSelection, getCaseById } from '../content/cases'
import { beginDiagnostic, buildCompactResult, completeRepair, createAttempt, normalizeStudentName, recordResponse } from './attempt'

describe('attempt engine', () => {
  it('normalizes first name and last initial only', () => {
    expect(normalizeStudentName(' Maya   j. ')).toBe('Maya J')
    expect(normalizeStudentName('Maya')).toBeNull()
    expect(normalizeStudentName('Maya Johnson')).toBeNull()
  })

  it('routes a misconception through repair before transfer', () => {
    const selection = buildAttemptCaseSelection(42)
    let state = beginDiagnostic(createAttempt('Maya J', CONTENT_VERSION, 42, selection, new Date('2026-07-15T12:00:00Z')))
    for (let index = 0; index < selection.diagnosticCaseIds.length; index += 1) {
      const item = getCaseById(selection.diagnosticCaseIds[index])!
      state = recordResponse(
        state,
        index === 0 ? item.macroChoices.find((choice) => choice !== item.correctMacro)! : item.correctMacro,
        item.correctEvidence,
      )
    }
    expect(state.phase).toBe('repair')
    expect(state.repairCaseIds).toHaveLength(1)
    state = completeRepair(state, 2)
    expect(state.phase).toBe('transfer')
  })

  it('builds 16 diagnostic checks and compact metrics', () => {
    const selection = buildAttemptCaseSelection(9)
    const startedAt = new Date('2026-07-15T12:00:00Z')
    let elapsedSeconds = 0
    let state = beginDiagnostic(createAttempt('Maya J', CONTENT_VERSION, 9, selection, startedAt), startedAt)
    for (const caseId of selection.diagnosticCaseIds) {
      const item = getCaseById(caseId)!
      elapsedSeconds += 40
      state = recordResponse(state, item.correctMacro, item.correctEvidence, new Date(startedAt.getTime() + elapsedSeconds * 1000))
    }
    for (const caseId of selection.transferCaseIds) {
      const item = getCaseById(caseId)!
      elapsedSeconds += 70
      state = recordResponse(state, item.correctMacro, item.correctEvidence, new Date(startedAt.getTime() + elapsedSeconds * 1000))
    }
    const result = buildCompactResult(state, new Date('2026-07-15T12:10:00Z'))
    expect(result.diagnostic).toEqual({ correct: 16, total: 16 })
    expect(result.transfer).toEqual({ correct: 8, total: 8 })
    expect(result.activeSeconds).toBe(600)
    expect(state.phase).toBe('results')
    expect(state.syncStatus).toBe('not-ready')
  })
})
