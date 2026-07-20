import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, buildAttemptCaseSelection } from '../content/cases'
import { createAttempt } from '../engine/attempt'
import { clearPending, loadAttempt, PENDING_RETENTION_MS, queueSubmission, readPending, saveAttempt } from './storage'

function queuedSubmission(completedAt = new Date().toISOString()) {
  return {
    action: 'submitResult' as const,
    schemaVersion: 1 as const,
    submissionId: 'mel-test-12345',
    result: { completedAt } as never,
  }
}

describe('local persistence', () => {
  it('restores matching content and rejects stale content', () => {
    const state = createAttempt('Maya J', CONTENT_VERSION, 7, buildAttemptCaseSelection(7))
    expect(saveAttempt(state)).toBe(true)
    expect(loadAttempt(CONTENT_VERSION)?.attemptId).toBe(state.attemptId)
    expect(loadAttempt('future-version')).toBeNull()
  })

  it('deduplicates queued submissions by submission ID', () => {
    const submission = queuedSubmission()
    expect(queueSubmission(submission)).toBe(true)
    expect(queueSubmission(submission)).toBe(true)
    expect(readPending()).toHaveLength(1)
  })

  it('expires detailed queued submissions after seven days and supports manual deletion', () => {
    const now = Date.now()
    expect(queueSubmission(queuedSubmission(new Date(now - PENDING_RETENTION_MS - 1).toISOString()))).toBe(true)
    expect(readPending(now)).toHaveLength(0)

    expect(queueSubmission(queuedSubmission(new Date(now).toISOString()))).toBe(true)
    expect(readPending(now)).toHaveLength(1)
    clearPending()
    expect(readPending(now)).toHaveLength(0)
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
