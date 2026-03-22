export interface LobbyUser {
  id: string
  username: string
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

export async function listLobbyUsers(userID: string, authToken: string): Promise<LobbyUser[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(
      `/api/lobby/users?userID=${encodeURIComponent(userID)}`,
      { headers: { Authorization: `Bearer ${authToken}` }, signal: controller.signal },
    )
    clearTimeout(timeoutId)
    if (!res.ok) return []
    const data = await res.json()
    return data.users as LobbyUser[]
  } catch {
    clearTimeout(timeoutId)
    return []
  }
}
