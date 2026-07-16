import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CaseScreen } from './components/CaseScreen'
import { LabHeader } from './components/LabHeader'
import { RepairScreen } from './components/RepairScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { ResumeScreen } from './components/ResumeScreen'
import { StartScreen } from './components/StartScreen'
import { TutorialFeedback } from './components/TutorialFeedback'
import { CONTENT_VERSION, TUTORIAL_CASE, buildAttemptCaseSelection, getCaseById } from './content/cases'
import {
  beginDiagnostic,
  buildCompactResult,
  completeRepair,
  createAttempt,
  currentCaseId,
  recordResponse,
  setSyncStatus,
  touchAttempt,
} from './engine/attempt'
import { clearAttempt, loadAttempt, readPending, saveAttempt, storeReceipt } from './persistence/storage'
import { createResultGateway, flushPending, submitOrQueue } from './results/resultGateway'
import type { AttemptState, Macromolecule, ResultSubmission, SyncStatus } from './types'

const PHASE_NAMES: Record<AttemptState['phase'], string> = {
  intro: 'check-in',
  tutorial: 'practice case',
  diagnostic: 'evidence cases',
  repair: 'repair lab',
  transfer: 'fresh cases',
  results: 'lab summary',
}

type TutorialResult = Readonly<{ correct: boolean }> | null

function restoredSyncMessage(state: AttemptState | null) {
  if (state?.syncStatus === 'failed') return 'This result was rejected and cannot be retried automatically. Ask Mr. Patel for help.'
  if (state?.syncStatus === 'local-only') return 'Saved on this iPad. This preview is not connected to Mr. Patel’s Sheet.'
  return 'Your result is saved on this iPad and waiting to send.'
}

export function App() {
  const restored = useMemo(() => loadAttempt(CONTENT_VERSION), [])
  const [attempt, setAttempt] = useState<AttemptState | null>(restored)
  const [resumePending, setResumePending] = useState(Boolean(restored))
  const [tutorialResult, setTutorialResult] = useState<TutorialResult>(null)
  const [storageWarning, setStorageWarning] = useState('')
  const [syncMessage, setSyncMessage] = useState(() => restoredSyncMessage(restored))
  const gateway = useMemo(() => createResultGateway(), [])
  const submittedAttempt = useRef('')

  const persist = useCallback((next: AttemptState) => {
    setAttempt(next)
    if (!saveAttempt(next)) {
      setStorageWarning('This browser could not save progress. Keep this page open until you finish.')
    }
  }, [])

  const result = useMemo(() => {
    if (!attempt || attempt.phase !== 'results') return null
    const completedAt = attempt.responses.at(-1)?.answeredAt
    return buildCompactResult(attempt, completedAt ? new Date(completedAt) : new Date())
  }, [attempt])

  const sendCurrentResult = useCallback(async (state: AttemptState, manual = false) => {
    const completedAt = state.responses.at(-1)?.answeredAt
    const compactResult = buildCompactResult(state, completedAt ? new Date(completedAt) : new Date())
    const submission: ResultSubmission = {
      action: 'submitResult',
      schemaVersion: 1,
      submissionId: state.attemptId,
      result: compactResult,
    }

    if (gateway.mode === 'remote') {
      persist(setSyncStatus(state, 'sending'))
      setSyncMessage(manual ? 'Retrying the secure result delivery…' : 'Sending the result securely…')
    }

    const receipt = await submitOrQueue(gateway, submission)
    if (gateway.mode === 'local') {
      persist(setSyncStatus(state, 'local-only'))
      setSyncMessage(receipt.message ?? 'Saved on this iPad. This preview is not connected to Mr. Patel’s Sheet.')
      return
    }

    if (receipt.ok) {
      setAttempt(setSyncStatus(state, 'received'))
      setSyncMessage(receipt.duplicate ? 'The Sheet already had this exact result.' : 'The Sheet confirmed this result was received.')
      storeReceipt(receipt)
      clearAttempt()
      return
    }

    const status: SyncStatus = receipt.retryable === false ? 'failed' : 'queued'
    persist(setSyncStatus(state, status))
    setSyncMessage(receipt.message ?? (status === 'queued' ? 'Saved on this iPad and queued for retry.' : 'The result service rejected this result.'))
  }, [gateway, persist])

  useEffect(() => {
    if (
      !attempt ||
      attempt.phase !== 'results' ||
      attempt.syncStatus !== 'not-ready' ||
      submittedAttempt.current === attempt.attemptId
    ) return
    submittedAttempt.current = attempt.attemptId
    void sendCurrentResult(attempt)
  }, [attempt, sendCurrentResult])

  useEffect(() => {
    async function flushAndRefresh() {
      if (gateway.mode !== 'remote' || readPending().length === 0) return
      const flush = await flushPending(gateway)
      if (attempt?.phase === 'results' && flush.sentSubmissionIds.includes(attempt.attemptId)) {
        setAttempt(setSyncStatus(attempt, 'received'))
        setSyncMessage('The saved result was received after reconnecting.')
        storeReceipt({ ok: true, duplicate: false, submissionId: attempt.attemptId })
        clearAttempt()
      } else if (attempt?.phase === 'results' && flush.rejectedSubmissionIds.includes(attempt.attemptId)) {
        persist(setSyncStatus(attempt, 'failed'))
        setSyncMessage('The saved result was rejected and cannot be retried automatically. Ask Mr. Patel for help.')
      }
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        if (attempt && attempt.phase !== 'results') persist(touchAttempt(attempt, new Date(), false))
        void flushAndRefresh()
      } else if (attempt && attempt.phase !== 'results') {
        persist(touchAttempt(attempt))
      }
    }

    void flushAndRefresh()
    window.addEventListener('online', flushAndRefresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('online', flushAndRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [attempt, gateway, persist])

  function startAttempt(studentName: string) {
    const seedArray = new Uint32Array(1)
    crypto.getRandomValues(seedArray)
    const seed = seedArray[0]
    persist(createAttempt(studentName, CONTENT_VERSION, seed, buildAttemptCaseSelection(seed)))
    setResumePending(false)
  }

  function restart() {
    clearAttempt()
    setAttempt(null)
    setResumePending(false)
    setTutorialResult(null)
    submittedAttempt.current = ''
  }

  function updateTutorial(macro: Macromolecule, evidence: string) {
    setTutorialResult({
      correct: macro === TUTORIAL_CASE.correctMacro && evidence === TUTORIAL_CASE.correctEvidence,
    })
    if (attempt) persist(touchAttempt(attempt))
  }

  if (resumePending && attempt) {
    return <PageFrame warning={storageWarning}><ResumeScreen phaseLabel={PHASE_NAMES[attempt.phase]} onResume={() => setResumePending(false)} onRestart={restart} /></PageFrame>
  }

  if (!attempt) {
    return <PageFrame warning={storageWarning}><StartScreen onStart={startAttempt} storageWarning={storageWarning} /></PageFrame>
  }

  if (attempt.phase === 'tutorial') {
    return (
      <PageFrame phase="tutorial" warning={storageWarning}>
        {tutorialResult ? (
          <TutorialFeedback
            correct={tutorialResult.correct}
            explanation={TUTORIAL_CASE.repair.explanation}
            onRetry={() => setTutorialResult(null)}
            onContinue={() => {
              setTutorialResult(null)
              persist(beginDiagnostic(attempt))
            }}
          />
        ) : (
          <CaseScreen key={TUTORIAL_CASE.id} item={TUTORIAL_CASE} seed={attempt.seed} stage="tutorial" onSubmit={updateTutorial} />
        )}
      </PageFrame>
    )
  }

  if (attempt.phase === 'diagnostic' || attempt.phase === 'transfer') {
    const item = getCaseById(currentCaseId(attempt))
    if (!item) return <FatalScreen onRestart={restart} />
    const current = attempt.phase === 'diagnostic' ? attempt.diagnosticIndex + 1 : attempt.transferIndex + 1
    const total = attempt.phase === 'diagnostic' ? attempt.diagnosticCaseIds.length : attempt.transferCaseIds.length
    return (
      <PageFrame phase={attempt.phase} current={current} total={total} warning={storageWarning}>
        <CaseScreen
          key={`${attempt.phase}-${item.id}`}
          item={item}
          seed={attempt.seed}
          stage={attempt.phase}
          onSubmit={(macro, evidence) => persist(recordResponse(attempt, macro, evidence))}
        />
      </PageFrame>
    )
  }

  if (attempt.phase === 'repair') {
    const item = getCaseById(currentCaseId(attempt))
    if (!item) return <FatalScreen onRestart={restart} />
    return (
      <PageFrame phase="repair" current={attempt.repairIndex + 1} total={attempt.repairCaseIds.length} warning={storageWarning}>
        <RepairScreen key={item.id} item={item} seed={attempt.seed} onRepaired={(attempts) => persist(completeRepair(attempt, attempts))} />
      </PageFrame>
    )
  }

  if (attempt.phase === 'results' && result) {
    return (
      <PageFrame phase="results" warning={storageWarning}>
        <ResultsScreen
          result={result}
          syncStatus={attempt.syncStatus}
          syncMessage={syncMessage}
          onRetry={() => void sendCurrentResult(attempt, true)}
          onNewAttempt={restart}
        />
      </PageFrame>
    )
  }

  return <FatalScreen onRestart={restart} />
}

type PageFrameProps = Readonly<{
  children: ReactNode
  phase?: AttemptState['phase']
  current?: number
  total?: number
  warning?: string
}>

function PageFrame({ children, phase, current, total, warning }: PageFrameProps) {
  return (
    <div className="app-shell">
      <LabHeader phase={phase} current={current} total={total} />
      {warning ? <p className="storage-banner" role="alert">{warning}</p> : null}
      {children}
    </div>
  )
}

function FatalScreen({ onRestart }: Readonly<{ onRestart: () => void }>) {
  return (
    <PageFrame>
      <main id="main-content" className="centered-page">
        <section className="dialog-card" role="alert">
          <p className="kicker">Recovery needed</p>
          <h1>This saved case no longer matches the lab content.</h1>
          <p>Start a fresh attempt so every clue and answer stays aligned.</p>
          <button className="primary-button" type="button" onClick={onRestart}>Start fresh</button>
        </section>
      </main>
    </PageFrame>
  )
}
