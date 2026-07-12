import { useState, useCallback, useRef } from 'react'
import { useStore } from '../../stores/useStore'
import { Button } from '../UI/Button'
import { Modal } from '../UI/Modal'
import { Plus, Trash2, Download, Upload } from 'lucide-react'
import { exportPresetJSON } from '../../utils/export'

export function PresetPanel() {
  const presets = useStore((s) => s.presets)
  const savePreset = useStore((s) => s.savePreset)
  const loadPreset = useStore((s) => s.loadPreset)
  const deletePreset = useStore((s) => s.deletePreset)
  const importPresets = useStore((s) => s.importPresets)

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [presetName, setPresetName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(() => {
    if (!presetName.trim()) return
    savePreset(presetName.trim())
    setPresetName('')
    setShowSaveModal(false)
  }, [presetName, savePreset])

  const handleExportPreset = useCallback((name: string) => {
    const preset = presets.find((p) => p.name === name)
    if (preset) {
      exportPresetJSON(preset.type, preset.params, preset.name)
    }
  }, [presets])

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.version && data.type && data.params) {
          importPresets([data])
        }
      } catch {
        alert('Invalid preset file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [importPresets])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowSaveModal(true)}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Save Preset
        </Button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="h-11 w-11 flex items-center justify-center rounded-lg bg-surface border border-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary cursor-pointer"
        >
          <Upload size={14} />
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {presets.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {presets.map((preset) => (
            <div
              key={preset.name}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-elevated group cursor-pointer"
              onClick={() => loadPreset(preset)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary truncate">{preset.name}</div>
                <div className="text-xs text-text-muted">{preset.type}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportPreset(preset.name) }}
                  className="p-1.5 rounded text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePreset(preset.name) }}
                  className="p-1.5 rounded text-text-muted hover:text-error cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)} title="Save Preset">
        <div className="space-y-4">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full h-10 px-3 text-sm bg-surface-elevated border border-border rounded-lg text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowSaveModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!presetName.trim()} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
