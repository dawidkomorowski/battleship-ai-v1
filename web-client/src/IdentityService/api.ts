export interface CreateUserOk {
  id: string
  authToken: string
}

export type CreateUserError = 'username_taken' | 'unknown'

export type CreateUserResult =
  | { ok: true; data: CreateUserOk }
  | { ok: false; error: CreateUserError }

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
