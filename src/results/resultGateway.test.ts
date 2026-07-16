import { afterEach, describe, expect, it, vi } from 'vitest'
import { queueSubmission, readPending } from '../persistence/storage'
import type { ResultSubmission, SubmissionReceipt } from '../types'
import { createResultGateway, flushPending, submitOrQueue } from './resultGateway'

const submission = {
  action: 'submitResult',
  schemaVersion: 1,
  submissionId: 'mel-test-12345',
  result: { studentName: 'Maya J' },
} as ResultSubmission

function response(receipt: SubmissionReceipt) {
  return { ok: true, json: async () => receipt } as Response
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('result gateway', () => {
  it('keeps local and preview builds disconnected while preserving the result', async () => {
    const receipt = await createResultGateway('').submit(submission)
    expect(receipt.ok).toBe(true)
    expect(receipt.message).toContain('not connected')
    expect(readPending()).toEqual([submission])
  })

  it('posts as text/plain and accepts an exact remote receipt', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      ok: true,
      duplicate: false,
      submissionId: submission.submissionId,
    }))
    vi.stubGlobal('fetch', fetchMock)

    const receipt = await createResultGateway('https://example.test/exec').submit(submission)
    expect(receipt.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/exec',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(submission),
      }),
    )
  })

  it('queues a network failure and deduplicates the retry payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const gateway = createResultGateway('https://example.test/exec')
    await submitOrQueue(gateway, submission)
    await submitOrQueue(gateway, submission)
    expect(readPending()).toEqual([submission])
  })

  it('flushes accepted work, drops non-retryable rejections, and retains retryable work', async () => {
    const retry = { ...submission, submissionId: 'mel-test-retry' }
    const rejected = { ...submission, submissionId: 'mel-test-reject' }
    queueSubmission(submission)
    queueSubmission(retry)
    queueSubmission(rejected)

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response({ ok: true, duplicate: false, submissionId: submission.submissionId }))
      .mockResolvedValueOnce(response({ ok: false, duplicate: false, submissionId: retry.submissionId, retryable: true }))
      .mockResolvedValueOnce(response({ ok: false, duplicate: false, submissionId: rejected.submissionId, retryable: false })))

    const flushed = await flushPending(createResultGateway('https://example.test/exec'))
    expect(flushed).toEqual({
      attempted: 3,
      sent: 1,
      rejected: 1,
      remaining: 1,
      sentSubmissionIds: [submission.submissionId],
      rejectedSubmissionIds: [rejected.submissionId],
    })
    expect(readPending().map((item) => item.submissionId)).toEqual([retry.submissionId])
  })

  it('aborts a timed-out request and keeps its submission for reconnect', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')))
    })))

    const pendingReceipt = submitOrQueue(createResultGateway('https://example.test/exec'), submission)
    await vi.advanceTimersByTimeAsync(10_001)
    const receipt = await pendingReceipt
    vi.useRealTimers()

    expect(receipt.ok).toBe(false)
    expect(receipt.retryable).toBe(true)
    expect(readPending()).toEqual([submission])
  })
})
