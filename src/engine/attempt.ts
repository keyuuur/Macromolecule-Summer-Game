import { getCaseById } from '../content/cases'
import type {
  AttemptState,
  CompactDiagnosticResult,
  DiagnosticCase,
  EvidenceConcept,
  Macromolecule,
  MetricCounts,
  ResponseRecord,
} from '../types'
import { EVIDENCE_CONCEPTS, MACROMOLECULES } from '../types'

export const GAME_VERSION = 'evidence-lab-v1'

export function normalizeStudentName(value: string): string | null {
  const cleaned = value.trim().replace(/\s+/g, ' ').replace(/\.$/, '')
  const match = cleaned.match(/^(\p{L}[\p{L}'-]*)\s+(\p{L})$/u)
  if (!match) return null
  return `${match[1]} ${match[2].toUpperCase()}`
}

export function createAttempt(
  studentName: string,
  contentVersion: string,
  seed: number,
  selection: Readonly<{ diagnosticCaseIds: readonly string[]; transferCaseIds: readonly string[] }>,
  now = new Date(),
): AttemptState {
  return {
    schemaVersion: 1,
    contentVersion,
    attemptId: createAttemptId(now, seed),
    seed,
    studentName,
    phase: 'tutorial',
    startedAt: now.toISOString(),
    activeSeconds: 0,
    lastActiveAt: now.toISOString(),
    diagnosticCaseIds: selection.diagnosticCaseIds,
    transferCaseIds: selection.transferCaseIds,
    diagnosticIndex: 0,
    transferIndex: 0,
    responses: [],
    repairCaseIds: [],
    repairIndex: 0,
    repairs: [],
    syncStatus: 'not-ready',
  }
}

export function beginDiagnostic(state: AttemptState, now = new Date()): AttemptState {
  return { ...touchAttempt(state, now), phase: 'diagnostic' }
}

export function recordResponse(
  state: AttemptState,
  selectedMacro: Macromolecule,
  selectedEvidence: string,
  now = new Date(),
): AttemptState {
  if (state.phase !== 'diagnostic' && state.phase !== 'transfer') return state
  const activeState = touchAttempt(state, now)
  const caseId = currentCaseId(activeState)
  const item = getCaseById(caseId)
  if (!item) throw new Error(`Unknown case ${caseId}`)

  const record: ResponseRecord = {
    caseId,
    stage: state.phase,
    selectedMacro,
    selectedEvidence,
    macroCorrect: selectedMacro === item.correctMacro,
    evidenceCorrect: selectedEvidence === item.correctEvidence,
    answeredAt: now.toISOString(),
  }
  const responses = [...activeState.responses, record]

  if (activeState.phase === 'transfer') {
    const nextIndex = activeState.transferIndex + 1
    return {
      ...activeState,
      responses,
      transferIndex: nextIndex,
      phase: nextIndex >= activeState.transferCaseIds.length ? 'results' : 'transfer',
      syncStatus: nextIndex >= activeState.transferCaseIds.length ? 'not-ready' : activeState.syncStatus,
    }
  }

  const nextIndex = activeState.diagnosticIndex + 1
  if (nextIndex < activeState.diagnosticCaseIds.length) {
    return { ...activeState, responses, diagnosticIndex: nextIndex }
  }

  const repairCaseIds = uniqueRepairCases(responses)
  return {
    ...activeState,
    responses,
    diagnosticIndex: nextIndex,
    repairCaseIds,
    repairIndex: 0,
    phase: repairCaseIds.length ? 'repair' : 'transfer',
  }
}

export function completeRepair(state: AttemptState, attempts: number, now = new Date()): AttemptState {
  if (state.phase !== 'repair') return state
  const activeState = touchAttempt(state, now)
  const caseId = activeState.repairCaseIds[activeState.repairIndex]
  const item = getCaseById(caseId)
  if (!item) throw new Error(`Unknown repair case ${caseId}`)
  const repairs = [
    ...activeState.repairs,
    {
      misconceptionCode: item.misconceptionCode,
      caseId,
      attempts,
      completedAt: now.toISOString(),
    },
  ]
  const nextIndex = activeState.repairIndex + 1
  return {
    ...activeState,
    repairs,
    repairIndex: nextIndex,
    phase: nextIndex >= activeState.repairCaseIds.length ? 'transfer' : 'repair',
  }
}

export function currentCaseId(state: AttemptState): string {
  if (state.phase === 'diagnostic') return state.diagnosticCaseIds[state.diagnosticIndex]
  if (state.phase === 'repair') return state.repairCaseIds[state.repairIndex]
  if (state.phase === 'transfer') return state.transferCaseIds[state.transferIndex]
  return ''
}

export function buildCompactResult(state: AttemptState, now = new Date()): CompactDiagnosticResult {
  const activeState = touchAttempt(state, now)
  const diagnosticResponses = activeState.responses.filter((response) => response.stage === 'diagnostic')
  const transferResponses = activeState.responses.filter((response) => response.stage === 'transfer')
  const diagnostic = countChecks(diagnosticResponses)
  const transfer = countChecks(transferResponses)
  const byMacromolecule = Object.fromEntries(
    MACROMOLECULES.map((macro) => [macro, countChecks(diagnosticResponses.filter((response) => caseMacro(response.caseId) === macro))]),
  ) as Record<Macromolecule, MetricCounts>
  const byConcept = Object.fromEntries(
    EVIDENCE_CONCEPTS.map((concept) => [concept, countEvidence(diagnosticResponses, concept)]),
  ) as Record<EvidenceConcept, MetricCounts>
  const misconceptionCodes = unique(
    diagnosticResponses
      .filter((response) => !response.macroCorrect || !response.evidenceCorrect)
      .map((response) => getCaseById(response.caseId)?.misconceptionCode ?? ''),
  ).filter(Boolean)

  return {
    timestamp: now.toISOString(),
    game: 'Macromolecule Evidence Lab',
    gameVersion: GAME_VERSION,
    contentVersion: activeState.contentVersion,
    studentName: activeState.studentName,
    startedAt: activeState.startedAt,
    completedAt: now.toISOString(),
    activeSeconds: activeState.activeSeconds,
    diagnostic,
    transfer,
    byMacromolecule,
    byConcept,
    repairsCompleted: activeState.repairs.length,
    unresolvedCount: Math.max(0, activeState.repairCaseIds.length - activeState.repairs.length),
    misconceptionCodes,
  }
}

export function setSyncStatus(state: AttemptState, syncStatus: AttemptState['syncStatus']): AttemptState {
  return { ...state, syncStatus }
}

export function touchAttempt(state: AttemptState, now = new Date(), accrue = true): AttemptState {
  const previous = Date.parse(state.lastActiveAt || state.startedAt)
  const elapsed = Number.isFinite(previous) ? Math.max(0, Math.round((now.getTime() - previous) / 1000)) : 0
  return {
    ...state,
    activeSeconds: (state.activeSeconds || 0) + (accrue ? Math.min(elapsed, 120) : 0),
    lastActiveAt: now.toISOString(),
  }
}

function createAttemptId(now: Date, seed: number): string {
  const randomPart = Math.abs(seed).toString(36).padStart(6, '0')
  return `mel-${now.getTime().toString(36)}-${randomPart}`
}

function uniqueRepairCases(responses: readonly ResponseRecord[]): string[] {
  const seen = new Set<string>()
  const caseIds: string[] = []
  for (const response of responses) {
    if (response.stage !== 'diagnostic' || (response.macroCorrect && response.evidenceCorrect)) continue
    const code = getCaseById(response.caseId)?.misconceptionCode
    if (code && !seen.has(code)) {
      seen.add(code)
      caseIds.push(response.caseId)
    }
  }
  return caseIds
}

function countChecks(responses: readonly ResponseRecord[]): MetricCounts {
  return {
    correct: responses.reduce((total, response) => total + Number(response.macroCorrect) + Number(response.evidenceCorrect), 0),
    total: responses.length * 2,
  }
}

function countEvidence(responses: readonly ResponseRecord[], concept: EvidenceConcept): MetricCounts {
  const matching = responses.filter((response) => getCaseById(response.caseId)?.concept === concept)
  return {
    correct: matching.filter((response) => response.evidenceCorrect).length,
    total: matching.length,
  }
}

function caseMacro(caseId: string): Macromolecule | undefined {
  return getCaseById(caseId)?.macromolecule
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)]
}

export function isCorrectRepair(item: DiagnosticCase, macro: Macromolecule, evidence: string): boolean {
  return macro === item.correctMacro && evidence === item.correctEvidence
}
