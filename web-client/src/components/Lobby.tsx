import { useEffect, useState } from 'react'
import { listLobbyUsers, leaveLobby, type LobbyUser } from '../LobbyService/api'
import type { Identity } from '../IdentityStorage'
import './Lobby.css'

interface Props {
  currentIdentity: Identity
  onLeave: () => void
  onUnauthorized: () => void
}

export function Lobby({ currentIdentity, onLeave, onUnauthorized }: Props) {
  const [users, setUsers] = useState<LobbyUser[]>([])

  useEffect(() => {
    let cancelled = false

    const fetchUsers = async () => {
      const result = await listLobbyUsers(currentIdentity.id, currentIdentity.authToken)
      if (cancelled) return
      if (!result.ok) {
        if (result.reason === 'unauthorized' || result.reason === 'evicted') onUnauthorized()
        return
      }
      setUsers(result.users)
    }

    fetchUsers()
    const id = setInterval(fetchUsers, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [currentIdentity])

  const handleLeave = async () => {
    await leaveLobby(currentIdentity.id, currentIdentity.authToken)
    onLeave()
  }

  const sortedUsers = [
    ...users.filter((u) => u.id === currentIdentity.id),
    ...users.filter((u) => u.id !== currentIdentity.id),
  ]

  return (
    <div className="lobby">
      <div className="lobby__header">
        <h2 className="lobby__title">Lobby</h2>
        <button className="lobby__leave" onClick={handleLeave}>Leave Lobby</button>
      </div>
      <ul className="lobby__users">
        {sortedUsers.map((user) => {
          const isMe = user.id === currentIdentity.id
          return (
            <li
              key={user.id}
              className={`lobby__user${isMe ? ' lobby__user--me' : ''}`}
            >
              {user.username}
              {isMe && <span className="lobby__you"> (you)</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
