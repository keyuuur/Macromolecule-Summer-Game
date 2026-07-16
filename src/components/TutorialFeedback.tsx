type TutorialFeedbackProps = Readonly<{
  correct: boolean
  explanation: string
  onRetry: () => void
  onContinue: () => void
}>

export function TutorialFeedback({ correct, explanation, onRetry, onContinue }: TutorialFeedbackProps) {
  return (
    <main id="main-content" className="centered-page">
      <section className={`dialog-card feedback-card ${correct ? 'success' : 'try-again'}`} aria-live="polite">
        <p className="kicker">Practice feedback</p>
        <h1>{correct ? 'Your claim matches the evidence.' : 'Recheck both parts of the claim.'}</h1>
        <p>{explanation}</p>
        {correct ? (
          <button className="primary-button" type="button" onClick={onContinue}>Begin evidence cases <span aria-hidden="true">→</span></button>
        ) : (
          <button className="primary-button" type="button" onClick={onRetry}>Revise the practice case <span aria-hidden="true">↻</span></button>
        )}
      </section>
    </main>
  )
}
