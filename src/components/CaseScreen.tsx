import { useEffect, useRef, useState, type FormEvent } from 'react'
import { seededChoiceOrder } from '../engine/choiceOrder'
import type { DiagnosticCase, Macromolecule } from '../types'

type CaseScreenProps = Readonly<{
  item: DiagnosticCase
  seed: number
  stage: 'tutorial' | 'diagnostic' | 'transfer'
  onSubmit: (macro: Macromolecule, evidence: string) => void
}>

export function CaseScreen({ item, seed, stage, onSubmit }: CaseScreenProps) {
  const [selectedMacro, setSelectedMacro] = useState<Macromolecule | ''>('')
  const [selectedEvidence, setSelectedEvidence] = useState('')
  const [error, setError] = useState('')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const macroChoices = seededChoiceOrder(item.macroChoices, seed, `${item.id}:macro`)
  const evidenceChoices = seededChoiceOrder(item.evidenceChoices, seed, `${item.id}:evidence`)

  useEffect(() => {
    titleRef.current?.focus()
  }, [item.id])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedMacro || !selectedEvidence) {
      setError('Choose one answer in both evidence steps.')
      return
    }
    onSubmit(selectedMacro, selectedEvidence)
  }

  const stageInstruction = stage === 'tutorial'
    ? 'Try this together. You can correct it before the lab begins.'
    : stage === 'transfer'
      ? 'Use what you repaired. Reference cards are now closed.'
      : 'Make your first claim from the clues. Reference cards stay closed for now.'

  return (
    <main id="main-content" className="case-layout">
      <section className="case-brief" aria-labelledby="case-title">
        <p className="eyebrow">Evidence file</p>
        <h1 id="case-title" ref={titleRef} tabIndex={-1}>{stage === 'tutorial' ? 'Practice the evidence routine' : 'Investigate this sample'}</h1>
        <p>{stageInstruction}</p>
        <article className="clue-card" data-testid="case-clue">
          <span className="clue-label">Sample notes</span>
          <p>{item.prompt}</p>
        </article>
      </section>

      <form className="evidence-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend><span>1</span> Which macromolecule does this sample mostly represent?</legend>
          <div className="choice-grid" data-testid="macro-choices">
            {macroChoices.map((choice) => (
              <label className="choice-card" key={choice}>
                <input
                  type="radio"
                  name="macromolecule"
                  value={choice}
                  checked={selectedMacro === choice}
                  onChange={() => setSelectedMacro(choice)}
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>2</span> Which evidence best supports your claim?</legend>
          <p className="evidence-question" data-testid="evidence-question">{item.evidenceQuestion}</p>
          <div className="choice-list" data-testid="evidence-choices">
            {evidenceChoices.map((choice) => (
              <label className="choice-card" key={choice}>
                <input
                  type="radio"
                  name="evidence"
                  value={choice}
                  checked={selectedEvidence === choice}
                  onChange={() => setSelectedEvidence(choice)}
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button submit-evidence" type="submit">Record both answers <span aria-hidden="true">→</span></button>
      </form>
    </main>
  )
}
