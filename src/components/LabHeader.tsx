import type { AttemptPhase } from '../types'

type LabHeaderProps = Readonly<{
  phase?: AttemptPhase
  current?: number
  total?: number
}>

const PHASE_LABELS: Partial<Record<AttemptPhase, string>> = {
  tutorial: 'Practice case',
  diagnostic: 'Evidence cases',
  repair: 'Repair lab',
  transfer: 'Fresh cases',
  results: 'Lab summary',
}

export function LabHeader({ phase, current, total }: LabHeaderProps) {
  const progress = current && total ? Math.round((current / total) * 100) : 0

  return (
    <header className="lab-header">
      <a className="brand" href="#main-content" aria-label="Skip to the current activity">
        <span className="brand-mark" aria-hidden="true">M</span>
        <span>
          <strong>Macromolecule</strong>
          <small>Evidence Lab</small>
        </span>
      </a>
      {phase && PHASE_LABELS[phase] ? (
        <div className="phase-progress" aria-label={`${PHASE_LABELS[phase]} progress`}>
          <div className="phase-row">
            <span>{PHASE_LABELS[phase]}</span>
            {current && total ? <span>{current} of {total}</span> : null}
          </div>
          {current && total ? (
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}
