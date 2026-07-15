interface CryptoConfigResponse {
  usdtAddress: string
  usdtContract: string
  network: string
  prices: Record<string, { usdt: number; label: string }>
}

interface CheckResponse {
  activated: boolean
  plan?: string
  tier?: string
  txId?: string
  activatedAt?: string
}

interface VerifyResponse {
  verified: boolean
  plan?: string
  message?: string
}

class EdgeClient {
  async getCryptoConfig(): Promise<CryptoConfigResponse | null> {
    try {
      const res = await fetch('/api/crypto/config')
      const json = await res.json() as { success: boolean; data?: CryptoConfigResponse }
      return json.success && json.data ? json.data : null
    } catch {
      return null
    }
  }

  async checkActivation(sessionId: string): Promise<CheckResponse> {
    try {
      const res = await fetch(`/api/crypto/check?sessionId=${encodeURIComponent(sessionId)}`)
      const json = await res.json() as { success: boolean; data?: CheckResponse }
      if (json.success && json.data) return json.data
    } catch {}
    return { activated: false }
  }

  async verifyTransaction(
    sessionId: string,
    txId: string,
    expectedAmount: number,
  ): Promise<VerifyResponse> {
    try {
      const res = await fetch('/api/crypto/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, txId, expectedAmount }),
      })
      const json = await res.json() as { success: boolean; data?: VerifyResponse }
      if (json.success && json.data) return json.data
    } catch {}
    return { verified: false, message: 'Could not reach verification service.' }
  }
}

export const edgeClient = new EdgeClient()
