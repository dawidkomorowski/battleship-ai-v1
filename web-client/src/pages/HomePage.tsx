import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { identityStorage, type Identity } from '../IdentityStorage'
import { createUser, verifyIdentity, type CreateUserError } from '../IdentityService/api'
import { joinLobby } from '../LobbyService/api'
import { PreviousIdentities } from '../components/PreviousIdentities'

type HomeView = 'home' | 'entering'

export function HomePage() {
  const navigate = useNavigate()
  const [view, setView] = useState<HomeView>('home')
  const [username, setUsername] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<CreateUserError | null>(null)
  const [previousIdentities, setPreviousIdentities] = useState<Identity[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const isValid = username.trim().length > 0
  const showInputError = touched && !isValid

  const handlePlay = async () => {
    const stored = identityStorage.list()
    await Promise.all(
      stored.map(async (identity) => {
        const valid = await verifyIdentity(identity.id, identity.authToken)
        if (!valid) identityStorage.delete(identity.id)
      })
    )
    setPreviousIdentities(identityStorage.list())
    setView('entering')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const enterLobbyAs = async (identity: Identity) => {
    identityStorage.setCurrent(identity)
    await joinLobby(identity.id, identity.authToken)
    navigate('/lobby')
  }

  const handleEnterLobby = async () => {
    setTouched(true)
    if (!isValid) return

    setSubmitting(true)
    setSubmitError(null)

    const result = await createUser(username.trim())

    setSubmitting(false)
    if (result.ok) {
      const identity: Identity = {
        id: result.data.id,
        username: username.trim(),
        authToken: result.data.authToken,
      }
      identityStorage.add(identity)
      await enterLobbyAs(identity)
    } else {
      setSubmitError(result.error)
    }
  }

  const handlePlayAs = async (identity: Identity) => {
    setSubmitting(true)
    await enterLobbyAs(identity)
    setSubmitting(false)
  }

  const submitErrorMessage =
    submitError === 'username_taken'
      ? 'This username is already taken. Please choose another.'
      : submitError === 'unknown'
      ? 'Something went wrong. Please try again.'
      : null

  return (
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
              onChange={(e) => {
                setUsername(e.target.value)
                setTouched(false)
                setSubmitError(null)
              }}
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
          <PreviousIdentities
            identities={previousIdentities}
            onDelete={(identity) => {
              identityStorage.delete(identity.id)
              setPreviousIdentities(identityStorage.list())
            }}
            onPlayAs={handlePlayAs}
          />
        </div>
      )}
    </main>
  )
}
