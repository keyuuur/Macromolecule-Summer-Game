import { queueSubmission, readPending, removePending, replacePending } from '../persistence/storage'
import type { ResultSubmission, SubmissionReceipt } from '../types'

export interface ResultGateway {
  readonly mode: 'local' | 'remote'
  submit(submission: ResultSubmission): Promise<SubmissionReceipt>
}

export type FlushResult = Readonly<{
  attempted: number
  sent: number
  rejected: number
  remaining: number
  sentSubmissionIds: readonly string[]
  rejectedSubmissionIds: readonly string[]
}>

const REQUEST_TIMEOUT_MS = 10_000

export function createResultGateway(endpoint = import.meta.env.VITE_RESULTS_ENDPOINT as string | undefined): ResultGateway {
  const normalized = endpoint?.trim()
  return normalized ? createRemoteGateway(normalized) : createLocalGateway()
}

export async function submitOrQueue(gateway: ResultGateway, submission: ResultSubmission): Promise<SubmissionReceipt> {
  if (gateway.mode === 'local') return gateway.submit(submission)
  try {
    const receipt = await gateway.submit(submission)
    if (!receipt.ok && receipt.retryable !== false) queueSubmission(submission)
    return receipt
  } catch {
    const stored = queueSubmission(submission)
    return {
      ok: false,
      duplicate: false,
      submissionId: submission.submissionId,
      retryable: true,
      message: stored ? 'Saved on this iPad and queued for retry.' : 'Could not save on this iPad.',
    }
  }
}

export async function flushPending(gateway: ResultGateway): Promise<FlushResult> {
  const pending = readPending()
  if (gateway.mode === 'local') return {
    attempted: 0,
    sent: 0,
    rejected: 0,
    remaining: pending.length,
    sentSubmissionIds: [],
    rejectedSubmissionIds: [],
  }
  const remaining: ResultSubmission[] = []
  const sentSubmissionIds: string[] = []
  const rejectedSubmissionIds: string[] = []
  let sent = 0
  let rejected = 0
  for (const submission of pending) {
    try {
      const receipt = await gateway.submit(submission)
      if (receipt.ok) {
        sent += 1
        sentSubmissionIds.push(submission.submissionId)
      } else if (receipt.retryable === false) {
        rejected += 1
        rejectedSubmissionIds.push(submission.submissionId)
      }
      else remaining.push(submission)
    } catch {
      remaining.push(submission)
    }
  }
  const attemptedIds = new Set(pending.map((item) => item.submissionId))
  const queuedDuringFlush = readPending().filter((item) => !attemptedIds.has(item.submissionId))
  replacePending([...remaining, ...queuedDuringFlush])
  return {
    attempted: pending.length,
    sent,
    rejected,
    remaining: remaining.length + queuedDuringFlush.length,
    sentSubmissionIds,
    rejectedSubmissionIds,
  }
}

function createRemoteGateway(endpoint: string): ResultGateway {
  return {
    mode: 'remote',
    async submit(submission) {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(submission),
      })
      if (!response.ok) throw new Error(`Submission failed with HTTP ${response.status}`)
      const receipt = await response.json() as SubmissionReceipt
      if (typeof receipt.ok !== 'boolean' || (receipt.ok && receipt.submissionId !== submission.submissionId)) {
        throw new Error('Results service returned an invalid receipt')
      }
      if (receipt.ok) removePending(submission.submissionId)
      return receipt
    },
  }
}

function createLocalGateway(): ResultGateway {
  return {
    mode: 'local',
    async submit(submission) {
      const stored = queueSubmission(submission)
      return {
        ok: stored,
        duplicate: false,
        submissionId: submission.submissionId,
        retryable: false,
        message: stored ? 'Saved on this iPad. This build is not connected to Mr. Patel’s Sheet.' : 'Browser storage is unavailable.',
      }
    },
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}
