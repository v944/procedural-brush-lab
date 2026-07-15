import { useCallback } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }, [onChange])

  const displayValue = step >= 1 ? value.toFixed(0) : value.toFixed(2)

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-xs font-semibold text-gray-100 font-mono">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  )
}
