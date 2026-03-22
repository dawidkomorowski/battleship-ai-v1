const STORAGE_KEY = 'battleship_identities'

export interface Identity {
  id: string
  username: string
  authToken: string
}

/**
 * IdentityStorage abstracts local storage access for user identity data.
 * All identities are stored under a single application-scoped key.
 */
export class IdentityStorage {
  add(identity: Identity): void {
    const existing = this.list()
    // Replace if the same id already exists, otherwise append.
    const updated = [
      ...existing.filter((i) => i.id !== identity.id),
      identity,
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  list(): Identity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed as Identity[]
    } catch {
      return []
    }
  }
}

export const identityStorage = new IdentityStorage()
