import { useEffect, useRef } from 'react'
import { checkToken } from '@/api/auth'

const INTERVAL = 3_000

export function useHeartbeat() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function hasToken() {
      return !!localStorage.getItem('token')
    }

    function toLogin() {
      stop()
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    function beat() {
      if (!hasToken()) {
        toLogin()
        return
      }
      checkToken().catch(() => {})
    }

    function start() {
      stop()
      if (!hasToken()) {
        toLogin()
        return
      }
      timerRef.current = setInterval(beat, INTERVAL)
    }

    function stop() {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stop()
      }
      else {
        beat()
        start()
      }
    }

    start()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
}
