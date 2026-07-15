import { useState, useRef, useCallback, useEffect } from 'react'
import { edgeClient } from '../lib/edge-client'

export type VerifyStatus = 'idle' | 'checking' | 'verified' | 'not-found' | 'error' | 'timeout'

const VERIFY_TIMEOUT_MS = 120_000
const POLL_INTERVAL_MS = 15_000

export function useVerifyPayment() {
  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [message, setMessage] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionIdRef = useRef('')

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startChecking = useCallback((sessionId: string, transactionId: string, expectedAmount: number) => {
    if (!transactionId || transactionId.length !== 64) {
      setStatus('error')
      setMessage('Please enter a valid transaction ID (64 hex characters)')
      return
    }

    cleanup()

    sessionIdRef.current = sessionId

    const verify = async () => {
      const result = await edgeClient.verifyTransaction(sessionId, transactionId, expectedAmount)
      if (result.verified) {
        setStatus('verified')
        setMessage(result.message || 'Payment confirmed!')
        cleanup()
      } else {
        setStatus('not-found')
        setMessage(result.message || 'Transaction not found.')
        cleanup()
      }
    }

    setStatus('checking')
    setMessage('')
    verify()
    intervalRef.current = setInterval(verify, POLL_INTERVAL_MS)
    timeoutRef.current = setTimeout(() => {
      cleanup()
      setStatus('timeout')
      setMessage('Verification is taking longer than expected. You can check your activation status later.')
    }, VERIFY_TIMEOUT_MS)
  }, [cleanup])

  const checkActivation = useCallback(async (sessionId: string) => {
    const result = await edgeClient.checkActivation(sessionId)
    if (result.activated) {
      setStatus('verified')
      setMessage('Payment confirmed!')
      return true
    }
    return false
  }, [])

  const reset = useCallback(() => {
    cleanup()
    setStatus('idle')
    setMessage('')
  }, [cleanup])

  return { status, message, startChecking, checkActivation, reset }
}
