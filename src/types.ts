export const MACROMOLECULES = ['Carbohydrate', 'Lipid', 'Protein', 'Nucleic Acid'] as const
export type Macromolecule = (typeof MACROMOLECULES)[number]

export const EVIDENCE_CONCEPTS = ['elements', 'building-block', 'function', 'example'] as const
export type EvidenceConcept = (typeof EVIDENCE_CONCEPTS)[number]

export type CaseStage = 'tutorial' | 'diagnostic' | 'transfer'

export type RepairContent = Readonly<{
  title: string
  reference: string
  explanation: string
}>

export type DiagnosticCase = Readonly<{
  id: string
  legacySourceId?: string
  eligibleStages: readonly CaseStage[]
  macromolecule: Macromolecule
  concept: EvidenceConcept
  prompt: string
  macroChoices: readonly Macromolecule[]
  correctMacro: Macromolecule
  evidenceQuestion: string
  evidenceChoices: readonly string[]
  correctEvidence: string
  misconceptionCode: string
  repair: RepairContent
  sourceNote: string
}>

export type AttemptPhase = 'intro' | 'tutorial' | 'diagnostic' | 'repair' | 'transfer' | 'results'

export type ResponseRecord = Readonly<{
  caseId: string
  stage: 'diagnostic' | 'transfer'
  selectedMacro: Macromolecule
  selectedEvidence: string
  macroCorrect: boolean
  evidenceCorrect: boolean
  answeredAt: string
}>

export type RepairRecord = Readonly<{
  misconceptionCode: string
  caseId: string
  attempts: number
  completedAt: string
}>

export type SyncStatus = 'not-ready' | 'local-only' | 'queued' | 'sending' | 'received' | 'failed'

export type AttemptState = Readonly<{
  schemaVersion: 1
  contentVersion: string
  attemptId: string
  seed: number
  studentName: string
  phase: AttemptPhase
  startedAt: string
  activeSeconds: number
  lastActiveAt: string
  diagnosticCaseIds: readonly string[]
  transferCaseIds: readonly string[]
  diagnosticIndex: number
  transferIndex: number
  responses: readonly ResponseRecord[]
  repairCaseIds: readonly string[]
  repairIndex: number
  repairs: readonly RepairRecord[]
  syncStatus: SyncStatus
}>

export type MetricCounts = Readonly<{ correct: number; total: number }>

export type CompactDiagnosticResult = Readonly<{
  timestamp: string
  game: 'Macromolecule Evidence Lab'
  gameVersion: string
  contentVersion: string
  studentName: string
  startedAt: string
  completedAt: string
  activeSeconds: number
  diagnostic: MetricCounts
  transfer: MetricCounts
  byMacromolecule: Readonly<Record<Macromolecule, MetricCounts>>
  byConcept: Readonly<Record<EvidenceConcept, MetricCounts>>
  repairsCompleted: number
  unresolvedCount: number
  misconceptionCodes: readonly string[]
}>

export type ResultSubmission = Readonly<{
  action: 'submitResult'
  schemaVersion: 1
  submissionId: string
  result: CompactDiagnosticResult
}>

export type SubmissionReceipt = Readonly<{
  ok: boolean
  duplicate: boolean
  submissionId: string
  retryable?: boolean
  message?: string
}>
