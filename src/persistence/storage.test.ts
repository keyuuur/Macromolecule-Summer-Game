import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, buildAttemptCaseSelection } from '../content/cases'
import { createAttempt } from '../engine/attempt'
import { loadAttempt, queueSubmission, readPending, saveAttempt } from './storage'

describe('local persistence', () => {
  it('restores matching content and rejects stale content', () => {
    const state = createAttempt('Maya J', CONTENT_VERSION, 7, buildAttemptCaseSelection(7))
    expect(saveAttempt(state)).toBe(true)
    expect(loadAttempt(CONTENT_VERSION)?.attemptId).toBe(state.attemptId)
    expect(loadAttempt('future-version')).toBeNull()
  })

  it('deduplicates queued submissions by submission ID', () => {
    const submission = {
      action: 'submitResult' as const,
      schemaVersion: 1 as const,
      submissionId: 'mel-test-12345',
      result: {} as never,
    }
    expect(queueSubmission(submission)).toBe(true)
    expect(queueSubmission(submission)).toBe(true)
    expect(readPending()).toHaveLength(1)
  })

  it('removes a same-version attempt with corrupted structure or unknown cases', () => {
    localStorage.setItem('macromolecule-evidence-lab-attempt-v1', JSON.stringify({
      schemaVersion: 1,
      contentVersion: CONTENT_VERSION,
      attemptId: 'mel-corrupt',
      diagnosticCaseIds: ['missing-case'],
    }))
    expect(loadAttempt(CONTENT_VERSION)).toBeNull()
    expect(localStorage.getItem('macromolecule-evidence-lab-attempt-v1')).toBeNull()
  })
})
