import './PreviousIdentities.css'
import type { Identity } from '../IdentityStorage'

interface Props {
  identities: Identity[]
}

export function PreviousIdentities({ identities }: Props) {
  if (identities.length === 0) return null

  return (
    <div className="previous-identities">
      <p className="previous-identities__label">Last time played as:</p>
      <ul>
        {identities.map((identity) => (
          <li key={identity.id}>{identity.username}</li>
        ))}
      </ul>
    </div>
  )
}
