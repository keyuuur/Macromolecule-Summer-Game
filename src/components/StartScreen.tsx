import { useState, type FormEvent } from 'react'
import { normalizeStudentName } from '../engine/attempt'

type StartScreenProps = Readonly<{
  onStart: (studentName: string) => void
  pendingCount: number
  onClearPending: () => void
  storageWarning?: string
}>

export function StartScreen({ onStart, pendingCount, onClearPending, storageWarning }: StartScreenProps) {
  const [firstName, setFirstName] = useState('')
  const [lastInitial, setLastInitial] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeStudentName(`${firstName} ${lastInitial}`)
    if (!normalized) {
      setError('Enter your first name and one last initial.')
      return
    }
    onStart(normalized)
  }

  return (
    <main id="main-content" className="welcome-layout">
      <section className="welcome-copy" aria-labelledby="welcome-title">
        <p className="eyebrow">Unit 2 • Matter &amp; Energy</p>
        <h1 id="welcome-title">Read the clues.<br />Build the evidence.</h1>
        <p className="lede">
          Investigate food clues, identify the macromolecule they mostly represent,
          and support your claim with biological evidence.
        </p>
        <ul className="lab-facts" aria-label="Lab details">
          <li><strong>10–15</strong><span>minutes</span></li>
          <li><strong>4</strong><span>molecule groups</span></li>
          <li><strong>Private</strong><span>formative practice</span></li>
        </ul>
      </section>

      <section className="start-card" aria-labelledby="check-in-title">
        <div className="card-number" aria-hidden="true">01</div>
        <p className="kicker">Researcher check-in</p>
        <h2 id="check-in-title">Set up your lab record</h2>
        <p>Use your first name and only the first letter of your last name.</p>
        {pendingCount > 0 ? (
          <div className="pending-results-notice" role="status">
            <strong>{pendingCount} unsent {pendingCount === 1 ? 'result is' : 'results are'} saved on this iPad.</strong>
            <p>Reconnect and keep this page open; the app will retry automatically, or ask your teacher before deleting it.</p>
            <button className="text-button" type="button" onClick={onClearPending}>Delete unsent results from this iPad</button>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="first-name">First name</label>
          <input
            id="first-name"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            maxLength={30}
            required
          />
          <label htmlFor="last-initial">Last initial</label>
          <input
            id="last-initial"
            name="lastInitial"
            autoComplete="off"
            value={lastInitial}
            onChange={(event) => setLastInitial(event.target.value.replace(/[^\p{L}]/gu, '').slice(0, 1))}
            maxLength={1}
            required
          />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {storageWarning ? <p className="form-warning" role="status">{storageWarning}</p> : null}
          <button className="primary-button" type="submit">Begin practice case <span aria-hidden="true">→</span></button>
        </form>
        <p className="privacy-note">Your name is removed after Mr. Patel’s Sheet confirms receipt. Unsent results expire from this iPad after seven days.</p>
      </section>
    </main>
  )
}
