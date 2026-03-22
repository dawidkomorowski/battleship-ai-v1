import './PreviousIdentities.css'
import type { Identity } from '../IdentityStorage'

interface Props {
  identities: Identity[]
  onDelete: (identity: Identity) => void
}

export function PreviousIdentities({ identities, onDelete }: Props) {
  if (identities.length === 0) return null

  const handleDelete = (identity: Identity) => {
    if (window.confirm(`Remove "${identity.username}" from previous identities?`)) {
      onDelete(identity)
    }
  }

  return (
    <div className="previous-identities">
      <p className="previous-identities__label">Last time played as:</p>
      <ul>
        {identities.map((identity) => (
          <li key={identity.id}>
            <span>{identity.username}</span>
            <button
              className="previous-identities__remove"
              onClick={() => handleDelete(identity)}
              title="Remove this identity"
              aria-label={`Remove ${identity.username}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
