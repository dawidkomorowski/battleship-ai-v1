import { useEffect, useRef, useState } from 'react'
import './ServiceStatus.css'

type ServiceStatus = 'ok' | 'error' | 'unknown'

function useServiceStatus(url: string, intervalMs: number, timeoutMs: number): ServiceStatus {
  const [status, setStatus] = useState<ServiceStatus>('unknown')
  const pendingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const poll = async () => {
      if (pendingRef.current || !mountedRef.current) return
      pendingRef.current = true

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (!mountedRef.current) return
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status === 'OK' ? 'ok' : 'error')
        } else {
          setStatus('error')
        }
      } catch {
        clearTimeout(timeoutId)
        if (mountedRef.current) setStatus('error')
      } finally {
        pendingRef.current = false
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [url, intervalMs, timeoutMs])

  return status
}

function StatusDot({ status }: { status: ServiceStatus }) {
  return <span className={`status-dot status-dot--${status}`} aria-label={status} />
}

export function ServiceStatus() {
  const identityStatus = useServiceStatus('/api/identity/status', 5000, 5000)
  const lobbyStatus = useServiceStatus('/api/lobby/status', 5000, 5000)

  return (
    <aside className="service-status">
      <h2>Service Status</h2>
      <ul>
        <li>
          <StatusDot status={identityStatus} />
          <span>identity-service</span>
        </li>
        <li>
          <StatusDot status={lobbyStatus} />
          <span>lobby-service</span>
        </li>
      </ul>
    </aside>
  )
}
