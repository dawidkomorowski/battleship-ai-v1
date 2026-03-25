export interface LobbyUser {
  id: string
  username: string
}

export async function leaveLobby(userID: string, authToken: string): Promise<void> {
  try {
    await fetch(`/api/lobby/users/${encodeURIComponent(userID)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    })
  } catch {
    // best-effort
  }
}

export async function joinLobby(userID: string, authToken: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/lobby/users/${encodeURIComponent(userID)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export type ListLobbyUsersResult =
  | { ok: true; users: LobbyUser[] }
  | { ok: false; unauthorized: boolean }

export async function listLobbyUsers(userID: string, authToken: string): Promise<ListLobbyUsersResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(
      `/api/lobby/users?userID=${encodeURIComponent(userID)}`,
      { headers: { Authorization: `Bearer ${authToken}` }, signal: controller.signal },
    )
    clearTimeout(timeoutId)
    if (res.status === 403) return { ok: false, unauthorized: true }
    if (!res.ok) return { ok: false, unauthorized: false }
    const data = await res.json()
    return { ok: true, users: data.users as LobbyUser[] }
  } catch {
    clearTimeout(timeoutId)
    return { ok: false, unauthorized: false }
  }
}
