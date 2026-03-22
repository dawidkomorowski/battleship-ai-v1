import { useEffect, useState } from 'react'
import { listLobbyUsers, type LobbyUser } from '../LobbyService/api'
import type { Identity } from '../IdentityStorage'
import './Lobby.css'

interface Props {
  currentIdentity: Identity
}

export function Lobby({ currentIdentity }: Props) {
  const [users, setUsers] = useState<LobbyUser[]>([])

  useEffect(() => {
    let cancelled = false

    const fetchUsers = async () => {
      const result = await listLobbyUsers(currentIdentity.id, currentIdentity.authToken)
      if (!cancelled) setUsers(result)
    }

    fetchUsers()
    const id = setInterval(fetchUsers, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [currentIdentity])

  const sortedUsers = [
    ...users.filter((u) => u.id === currentIdentity.id),
    ...users.filter((u) => u.id !== currentIdentity.id),
  ]

  return (
    <div className="lobby">
      <h2 className="lobby__title">Lobby</h2>
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
