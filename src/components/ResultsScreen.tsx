import { CASE_BANK } from '../content/cases'
import type { CompactDiagnosticResult, SyncStatus } from '../types'

type ResultsScreenProps = Readonly<{
  result: CompactDiagnosticResult
  syncStatus: SyncStatus
  syncMessage: string
  onRetry: () => void
  onNewAttempt: () => void
}>

function percent(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) : 0
}

export function ResultsScreen({ result, syncStatus, syncMessage, onRetry, onNewAttempt }: ResultsScreenProps) {
  const weakConcepts = Object.entries(result.byConcept)
    .filter(([, metric]) => metric.correct < metric.total)
    .map(([concept]) => concept.replace('-', ' '))
  const repairedAreas = [...new Set(result.misconceptionCodes.map((code) =>
    CASE_BANK.find((item) => item.misconceptionCode === code)?.repair.title,
  ).filter((title): title is string => Boolean(title)))]

  return (
    <main id="main-content" className="results-layout">
      <section className="results-hero">
        <p className="eyebrow">Lab complete</p>
        <h1>Your evidence changed with practice.</h1>
        <p>This is a learning summary, not a grade. It separates your first evidence from your fresh transfer cases.</p>
      </section>

      <section className="metric-grid" aria-label="Evidence summary">
        <article className="metric-card">
          <span>First-try evidence</span>
          <strong>{percent(result.diagnostic.correct, result.diagnostic.total)}%</strong>
          <p>{result.diagnostic.correct} of {result.diagnostic.total} checks matched the evidence.</p>
        </article>
        <article className="metric-card accent">
          <span>Patterns repaired</span>
          <strong>{result.repairsCompleted}</strong>
          <p>{result.unresolvedCount === 0 ? 'Every queued repair was completed.' : `${result.unresolvedCount} repair remains.`}</p>
        </article>
        <article className="metric-card dark">
          <span>Fresh transfer</span>
          <strong>{percent(result.transfer.correct, result.transfer.total)}%</strong>
          <p>{result.transfer.correct} of {result.transfer.total} checks without reference cards.</p>
        </article>
      </section>

      <section className="results-detail">
        <div className="summary-notes">
          <h2>What you repaired</h2>
          <p>{repairedAreas.length ? repairedAreas.join(' • ') : 'No repair cards were needed on this attempt.'}</p>
          <h2>Evidence to keep practicing</h2>
          <p>{weakConcepts.length ? weakConcepts.join(' • ') : 'Your first evidence covered all four concept types.'}</p>
        </div>
        <div className={`sync-panel sync-${syncStatus}`} role="status">
          <span className="sync-dot" aria-hidden="true" />
          <div><strong>{syncStatus === 'received' ? 'Received by Mr. Patel’s Sheet' : 'Result storage'}</strong><p>{syncMessage}</p></div>
          {syncStatus === 'queued' ? (
            <button className="secondary-button" type="button" onClick={onRetry}>Retry now</button>
          ) : null}
        </div>
      </section>

      <button className="primary-button new-attempt" type="button" onClick={onNewAttempt}>
        {syncStatus === 'received' ? 'Finish and clear this iPad' : 'Start another attempt'} <span aria-hidden="true">→</span>
      </button>
    </main>
  )
}
