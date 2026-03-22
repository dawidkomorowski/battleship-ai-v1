export interface CreateUserOk {
  id: string
  authToken: string
}

export type CreateUserError = 'username_taken' | 'unknown'

export type CreateUserResult =
  | { ok: true; data: CreateUserOk }
  | { ok: false; error: CreateUserError }

/**
 * Verifies that a stored identity is still valid against the identity-service.
 * Returns true if the identity is accepted, false if rejected (403) or unreachable.
 */
export async function verifyIdentity(id: string, authToken: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/identity/users/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    return res.ok
  } catch {
    return true // network failure — do not purge optimistically
  }
}

export async function createUser(username: string): Promise<CreateUserResult> {
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
