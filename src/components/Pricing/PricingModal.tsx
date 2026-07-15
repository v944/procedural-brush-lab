import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../stores/useStore'
import { useVerifyPayment } from '../../hooks/useVerifyPayment'
import { edgeClient } from '../../lib/edge-client'
import { Button } from '../UI/Button'
import { Modal } from '../UI/Modal'
import { Copy, Check, Loader2, ExternalLink } from 'lucide-react'

const FALLBACK_ADDRESS = 'TPenBbjw2BE1zBMot2kKrNuGgYdbPvQwDr'

const PRICES = {
  pro: { usdt: 10, label: 'Pro' },
  lifetime: { usdt: 30, label: 'Lifetime' },
}

interface PricingModalProps {
  tier: 'pro' | 'lifetime'
  onClose: () => void
}

export function PricingModal({ tier, onClose }: PricingModalProps) {
  const sessionId = useStore((s) => s.sessionId)
  const setPlan = useStore((s) => s.setPlan)
  const [initialTier, setInitialTier] = useState(tier)
  const activeTier = initialTier
  const activePrice = PRICES[activeTier]
  const [usdtAddress, setUsdtAddress] = useState(FALLBACK_ADDRESS)
  const { status, message, startChecking, checkActivation, reset } = useVerifyPayment()
  const [txInput, setTxInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrsrc, setQrsrc] = useState('')

  useEffect(() => {
    edgeClient.getCryptoConfig().then((config) => {
      if (config?.usdtAddress) {
        setUsdtAddress(config.usdtAddress)
        setQrsrc(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=usdt:${config.usdtAddress}&bgcolor=0D0D14&color=F97316`)
      }
    })
  }, [])

  useEffect(() => {
    if (status === 'verified') {
      setPlan(activeTier)
    }
  }, [status, activeTier, setPlan])

  const handleCopy = () => {
    navigator.clipboard.writeText(usdtAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = () => {
    if (txInput.trim()) {
      startChecking(sessionId, txInput.trim(), activePrice.usdt)
    }
  }

  const handleCheckActivation = useCallback(async () => {
    const activated = await checkActivation(sessionId)
    if (activated) {
      setPlan(activeTier)
    } else {
      setTxInput('')
      reset()
    }
  }, [sessionId, activeTier, checkActivation, setPlan, reset])

  return (
    <Modal open={true} onClose={() => { reset(); onClose() }} title="Upgrade to Pro">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {(['pro', 'lifetime'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { reset(); setInitialTier(t) }}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTier === t
                  ? 'bg-orange-500 text-black'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {PRICES[t].label} — ${PRICES[t].usdt}
            </button>
          ))}
        </div>

        <div className="bg-bg-surface rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Amount</span>
            <span className="text-sm font-semibold text-orange-400">{activePrice.usdt} USDT (TRC-20)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Plan</span>
            <span className="text-sm font-medium text-gray-100">{activePrice.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Network</span>
            <span className="text-sm font-medium text-gray-100">TRC-20 (Tron)</span>
          </div>
        </div>

        <div className="bg-bg-surface rounded-xl p-4">
          <label className="text-xs text-gray-400 mb-1 block">Send to address</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-orange-400 font-mono truncate bg-white/5 px-2 py-1.5 rounded-lg">
              {usdtAddress}
            </code>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {qrsrc && (
          <div className="bg-bg-surface rounded-xl p-4 text-center">
            <img src={qrsrc} alt="QR Code" className="w-44 h-44 mx-auto rounded-lg" />
          </div>
        )}

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Transaction ID (TxID)</label>
          <input
            type="text"
            value={txInput}
            onChange={(e) => setTxInput(e.target.value)}
            placeholder="Paste your 64-char TxID here"
            className="w-full bg-bg-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 font-mono placeholder:text-gray-500 outline-none focus:border-orange-500/50"
            disabled={status === 'checking' || status === 'verified'}
          />
        </div>

        {status === 'idle' && (
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={!txInput.trim()}
            className="w-full"
          >
            Verify Payment
          </Button>
        )}

        {status === 'checking' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-orange-400 py-2">
              <Loader2 size={14} className="animate-spin" />
              Checking transaction...
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Checking TRC-20 blockchain for your transaction. This may take a moment.
            </p>
          </div>
        )}

        {(status === 'not-found' || status === 'error') && (
          <div className="space-y-3">
            <div className={`text-sm text-center py-2 ${status === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
              {message}
            </div>
            <Button variant="secondary" onClick={handleVerify} className="w-full">
              Try Again
            </Button>
          </div>
        )}

        {status === 'timeout' && (
          <div className="space-y-3">
            <div className="text-sm text-gray-400 text-center py-2">{message}</div>
            <Button variant="primary" onClick={handleCheckActivation} className="w-full flex items-center justify-center gap-2">
              <ExternalLink size={14} />
              Check Activation Status
            </Button>
            <p className="text-[10px] text-gray-400 text-center">
              Your transaction may still be pending on the network. Close and check back later.
            </p>
          </div>
        )}

        {status === 'verified' && (
          <div className="text-sm text-green-400 text-center py-2 font-medium">
            {message || `${activePrice.label} plan activated!`}
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-center">
          Send exactly <strong>{activePrice.usdt} USDT</strong> to the address above on TRC-20 network.
          Sending wrong amount or network may result in loss of funds.
        </p>
      </div>
    </Modal>
  )
}
