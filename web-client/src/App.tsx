import { useEffect, useRef, useState } from 'react'
import './App.css'

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

function App() {
  const identityStatus = useServiceStatus('/api/identity/status', 5000, 5000)

  const [showUsernameForm, setShowUsernameForm] = useState(false)
  const [username, setUsername] = useState('')
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isValid = username.trim().length > 0
  const showError = touched && !isValid

  const handlePlay = () => {
    setShowUsernameForm(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

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

        {!showUsernameForm && (
          <button className="btn-play" onClick={handlePlay}>Play</button>
        )}

        {showUsernameForm && (
          <div className="username-form">
            <div className="input-group">
              <input
                ref={inputRef}
                className={`username-input${showError ? ' username-input--error' : ''}`}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-label="Username"
                aria-describedby={showError ? 'username-error' : undefined}
              />
              {showError && (
                <p id="username-error" className="input-error">
                  Username must not be empty.
                </p>
              )}
            </div>
            <button className="btn-lobby" disabled={!isValid}>
              Enter Lobby
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
