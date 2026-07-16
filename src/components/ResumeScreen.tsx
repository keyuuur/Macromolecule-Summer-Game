type ResumeScreenProps = Readonly<{
  phaseLabel: string
  onResume: () => void
  onRestart: () => void
}>

export function ResumeScreen({ phaseLabel, onResume, onRestart }: ResumeScreenProps) {
  return (
    <main id="main-content" className="centered-page">
      <section className="dialog-card" aria-labelledby="resume-title">
        <p className="kicker">Saved on this iPad</p>
        <h1 id="resume-title">Continue your evidence lab?</h1>
        <p>Your progress is waiting at the {phaseLabel.toLowerCase()}.</p>
        <div className="button-stack">
          <button className="primary-button" type="button" onClick={onResume}>Continue lab <span aria-hidden="true">→</span></button>
          <button className="text-button" type="button" onClick={onRestart}>Start over on this iPad</button>
        </div>
      </section>
    </main>
  )
}
