import { useEffect, useRef, useState, type FormEvent } from 'react'
import { seededChoiceOrder } from '../engine/choiceOrder'
import type { DiagnosticCase, Macromolecule } from '../types'

type RepairScreenProps = Readonly<{
  item: DiagnosticCase
  seed: number
  onRepaired: (attempts: number) => void
}>

export function RepairScreen({ item, seed, onRepaired }: RepairScreenProps) {
  const [selectedMacro, setSelectedMacro] = useState<Macromolecule | ''>('')
  const [selectedEvidence, setSelectedEvidence] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('Use the focused reference, then correct both parts.')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const macroChoices = seededChoiceOrder(item.macroChoices, seed, `${item.id}:repair:macro`)
  const evidenceChoices = seededChoiceOrder(item.evidenceChoices, seed, `${item.id}:repair:evidence`)

  useEffect(() => {
    titleRef.current?.focus()
  }, [item.id])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedMacro || !selectedEvidence) {
      setMessage('Choose one answer in both steps before checking the repair.')
      return
    }
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    if (selectedMacro === item.correctMacro && selectedEvidence === item.correctEvidence) {
      onRepaired(nextAttempts)
      return
    }
    setMessage(item.repair.explanation)
  }

  return (
    <main id="main-content" className="repair-layout">
      <aside className="reference-card" aria-labelledby="repair-title">
        <p className="eyebrow">Focused reference</p>
        <h1 id="repair-title" ref={titleRef} tabIndex={-1}>{item.repair.title}</h1>
        <p className="reference-copy">{item.repair.reference}</p>
        <p className="repair-purpose">This card targets one pattern from your first attempt. It is not the full review chart.</p>
      </aside>

      <form className="repair-form" onSubmit={handleSubmit}>
        <p className="kicker">Correct the evidence record</p>
        <article className="clue-card"><span className="clue-label">Sample notes</span><p>{item.prompt}</p></article>
        <fieldset>
          <legend>Macromolecule claim</legend>
          <div className="choice-grid compact">
            {macroChoices.map((choice) => (
              <label className="choice-card" key={choice}>
                <input type="radio" name="repair-macro" checked={selectedMacro === choice} onChange={() => setSelectedMacro(choice)} />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{item.evidenceQuestion}</legend>
          <div className="choice-list compact">
            {evidenceChoices.map((choice) => (
              <label className="choice-card" key={choice}>
                <input type="radio" name="repair-evidence" checked={selectedEvidence === choice} onChange={() => setSelectedEvidence(choice)} />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="feedback-line" role="status">{message}</p>
        <button className="primary-button" type="submit">Check repair <span aria-hidden="true">→</span></button>
      </form>
    </main>
  )
}
