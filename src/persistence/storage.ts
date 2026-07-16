import { getCaseById } from '../content/cases'
import type { AttemptState, ResultSubmission, SubmissionReceipt } from '../types'

const ATTEMPT_KEY = 'macromolecule-evidence-lab-attempt-v1'
const PENDING_KEY = 'macromolecule-evidence-lab-pending-v1'
const RECEIPT_KEY = 'macromolecule-evidence-lab-receipt-v1'

export function saveAttempt(state: AttemptState): boolean {
  try {
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function loadAttempt(contentVersion: string): AttemptState | null {
  try {
    const raw = localStorage.getItem(ATTEMPT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AttemptState>
    if (!isAttemptState(parsed, contentVersion)) {
      localStorage.removeItem(ATTEMPT_KEY)
      return null
    }
    return parsed
  } catch {
    try { localStorage.removeItem(ATTEMPT_KEY) } catch { /* Storage can remain unavailable. */ }
    return null
  }
}

export function clearAttempt(): void {
  try { localStorage.removeItem(ATTEMPT_KEY) } catch { /* Storage can remain unavailable. */ }
}

export function queueSubmission(submission: ResultSubmission): boolean {
  try {
    const pending = readPending().filter((item) => item.submissionId !== submission.submissionId)
    localStorage.setItem(PENDING_KEY, JSON.stringify([...pending, submission]))
    return true
  } catch {
    return false
  }
}

export function readPending(): ResultSubmission[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isSubmission) : []
  } catch {
    return []
  }
}

export function replacePending(submissions: readonly ResultSubmission[]): void {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(submissions)) } catch { /* Caller reports the remaining count. */ }
}

export function removePending(submissionId: string): void {
  replacePending(readPending().filter((item) => item.submissionId !== submissionId))
}

export function storeReceipt(receipt: SubmissionReceipt): void {
  const anonymousReceipt = {
    submissionId: receipt.submissionId,
    receivedAt: new Date().toISOString(),
  }
  try { localStorage.setItem(RECEIPT_KEY, JSON.stringify(anonymousReceipt)) } catch { /* Receipt is optional. */ }
}

function isSubmission(value: unknown): value is ResultSubmission {
  if (!value || typeof value !== 'object') return false
  const submission = value as Partial<ResultSubmission>
  return submission.action === 'submitResult'
    && submission.schemaVersion === 1
    && typeof submission.submissionId === 'string'
    && typeof submission.result === 'object'
}

function isAttemptState(value: Partial<AttemptState>, contentVersion: string): value is AttemptState {
  const phases = ['intro', 'tutorial', 'diagnostic', 'repair', 'transfer', 'results']
  const syncStatuses = ['not-ready', 'local-only', 'queued', 'sending', 'received', 'failed']
  if (
    value.schemaVersion !== 1 ||
    value.contentVersion !== contentVersion ||
    typeof value.attemptId !== 'string' ||
    typeof value.studentName !== 'string' ||
    typeof value.seed !== 'number' ||
    !Number.isFinite(value.seed) ||
    typeof value.phase !== 'string' ||
    !phases.includes(value.phase) ||
    typeof value.startedAt !== 'string' ||
    typeof value.lastActiveAt !== 'string' ||
    !Number.isInteger(value.activeSeconds) ||
    (value.activeSeconds ?? -1) < 0 ||
    typeof value.syncStatus !== 'string' ||
    !syncStatuses.includes(value.syncStatus)
  ) return false

  if (
    !isCaseIdList(value.diagnosticCaseIds, 8) ||
    !isCaseIdList(value.transferCaseIds, 4) ||
    !isCaseIdList(value.repairCaseIds) ||
    !isIndex(value.diagnosticIndex, value.diagnosticCaseIds.length) ||
    !isIndex(value.transferIndex, value.transferCaseIds.length) ||
    !isIndex(value.repairIndex, value.repairCaseIds.length)
  ) return false

  if (!Array.isArray(value.responses) || value.responses.some((response) => (
    !response ||
    typeof response.caseId !== 'string' ||
    !getCaseById(response.caseId) ||
    (response.stage !== 'diagnostic' && response.stage !== 'transfer') ||
    typeof response.selectedMacro !== 'string' ||
    typeof response.selectedEvidence !== 'string' ||
    typeof response.macroCorrect !== 'boolean' ||
    typeof response.evidenceCorrect !== 'boolean' ||
    typeof response.answeredAt !== 'string'
  ))) return false

  return Array.isArray(value.repairs) && value.repairs.every((repair) => (
    repair &&
    typeof repair.misconceptionCode === 'string' &&
    typeof repair.caseId === 'string' &&
    Boolean(getCaseById(repair.caseId)) &&
    Number.isInteger(repair.attempts) &&
    repair.attempts > 0 &&
    typeof repair.completedAt === 'string'
  ))
}

function isCaseIdList(value: readonly string[] | undefined, expectedLength?: number): value is readonly string[] {
  return Array.isArray(value) &&
    (expectedLength === undefined || value.length === expectedLength) &&
    new Set(value).size === value.length &&
    value.every((id) => typeof id === 'string' && Boolean(getCaseById(id)))
}

function isIndex(value: number | undefined, maximum: number): value is number {
  return Number.isInteger(value) && (value ?? -1) >= 0 && (value ?? maximum + 1) <= maximum
}
