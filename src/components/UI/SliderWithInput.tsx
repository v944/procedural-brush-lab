interface SliderWithInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format?: (v: number) => string
  suffix?: string
}

export function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  suffix,
}: SliderWithInputProps) {
  const displayValue = format ? format(value) : step >= 1 ? String(value) : value.toFixed(2)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-xs font-semibold text-gray-100 font-mono tabular-nums">
          {displayValue}{suffix}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-orange-500 h-1"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(v)
          }}
          className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-200 text-center font-mono focus:outline-none focus:border-orange-500/50"
        />
      </div>
    </div>
  )
}
