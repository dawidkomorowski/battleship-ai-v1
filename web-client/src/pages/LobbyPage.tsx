import { Navigate, useNavigate } from 'react-router-dom'
import { identityStorage } from '../IdentityStorage'
import './LobbyPage.css'
import { leaveLobby } from '../LobbyService/api'
import { Lobby } from '../components/Lobby'

export function LobbyPage() {
  const navigate = useNavigate()
  const identity = identityStorage.getCurrent()

  if (!identity) return <Navigate to="/" replace />

  const handleLeave = async () => {
    await leaveLobby(identity.id, identity.authToken)
    navigate('/')
  }

  return (
    <main className="main-content main-content--lobby">
      <h1>Battleship Game</h1>
      <Lobby currentIdentity={identity} onLeave={handleLeave} onUnauthorized={() => navigate('/')} />
    </main>
  )
}
