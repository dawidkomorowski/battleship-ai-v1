import { useEffect, useRef, useState } from 'react'
import './App.css'
import { identityStorage, type Identity } from './IdentityStorage'

// ── Service status polling ───────────────────────────────────────────────

type ServiceStatus = 'ok' | 'error' | 'unknown'

function useServiceStatus(url: string, intervalMs: number, timeoutMs: number): ServiceStatus {
  const [status, setStatus] = useState<ServiceStatus>('unknown')
  const pendingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const poll = async () => {
      if (pendingRef.current || !mountedRef.current) return
      pendingRef.current = true

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (!mountedRef.current) return
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status === 'OK' ? 'ok' : 'error')
        } else {
          setStatus('error')
        }
      } catch {
        clearTimeout(timeoutId)
        if (mountedRef.current) setStatus('error')
      } finally {
        pendingRef.current = false
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [url, intervalMs, timeoutMs])

  return status
}

function StatusDot({ status }: { status: ServiceStatus }) {
  return <span className={`status-dot status-dot--${status}`} aria-label={status} />
}

// ── Identity API ───────────────────────────────────────────────────

interface CreateUserOk {
  id: string
  authToken: string
}

type CreateUserError = 'username_taken' | 'unknown'

async function createUser(username: string): Promise<{ ok: true; data: CreateUserOk } | { ok: false; error: CreateUserError }> {
  try {
    const res = await fetch('/api/identity/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })

    if (res.ok) {
      const data: CreateUserOk = await res.json()
      return { ok: true, data }
    }

    const body = await res.json().catch(() => null)
    if (res.status === 409 && body?.error === 'username_taken') {
      return { ok: false, error: 'username_taken' }
    }
    return { ok: false, error: 'unknown' }
  } catch {
    return { ok: false, error: 'unknown' }
  }
}

// ── App ───────────────────────────────────────────────────────────────

type View = 'home' | 'entering' | 'lobby'

function App() {
  const identityStatus = useServiceStatus('/api/identity/status', 5000, 5000)

  const [view, setView] = useState<View>('home')
  const [username, setUsername] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<CreateUserError | null>(null)
  const [previousIdentities, setPreviousIdentities] = useState<Identity[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const isValid = username.trim().length > 0
  const showInputError = touched && !isValid

  const handlePlay = () => {
    setPreviousIdentities(identityStorage.list())
    setView('entering')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleEnterLobby = async () => {
    setTouched(true)
    if (!isValid) return

    setSubmitting(true)
    setSubmitError(null)

    const result = await createUser(username.trim())

    setSubmitting(false)
    if (result.ok) {
      identityStorage.add({
        id: result.data.id,
        username: username.trim(),
        authToken: result.data.authToken,
      })
      setView('lobby')
    } else {
      setSubmitError(result.error)
    }
  }

  const submitErrorMessage =
    submitError === 'username_taken'
      ? 'This username is already taken. Please choose another.'
      : submitError === 'unknown'
      ? 'Something went wrong. Please try again.'
      : null

  return (
    <div className="app">
      <aside className="service-status">
        <h2>Service Status</h2>
        <ul>
          <li>
            <StatusDot status={identityStatus} />
            <span>identity-service</span>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Battleship Game</h1>

        {view === 'home' && (
          <button className="btn-play" onClick={handlePlay}>Play</button>
        )}

        {view === 'entering' && (
          <div className="username-form">
            <div className="input-group">
              <input
                ref={inputRef}
                className={`username-input${showInputError ? ' username-input--error' : ''}`}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setSubmitError(null) }}
                onBlur={() => setTouched(true)}
                aria-label="Username"
                aria-describedby={
                  showInputError ? 'username-error' :
                  submitError ? 'submit-error' : undefined
                }
                disabled={submitting}
              />
              {showInputError && (
                <p id="username-error" className="input-error">
                  Username must not be empty.
                </p>
              )}
            </div>
            {submitErrorMessage && (
              <p id="submit-error" className="submit-error">{submitErrorMessage}</p>
            )}
            <button
              className="btn-lobby"
              onClick={handleEnterLobby}
              disabled={submitting}
            >
              {submitting ? 'Entering…' : 'Enter Lobby'}
            </button>
            {previousIdentities.length > 0 && (
              <div className="previous-identities">
                <p className="previous-identities__label">Last time played as:</p>
                <ul>
                  {previousIdentities.map((identity) => (
                    <li key={identity.id}>{identity.username}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {view === 'lobby' && (
          <div className="lobby-placeholder">
            <h2>Lobby</h2>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
