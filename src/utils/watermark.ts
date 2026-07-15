export function applyWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  const fontSize = Math.max(14, Math.round(w / 20))
  const spacing = fontSize * 3.5

  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-Math.PI / 6)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'

  const cols = Math.ceil((w * 1.5) / spacing) + 2
  const rows = Math.ceil((h * 1.5) / spacing) + 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - cols / 2) * spacing
      const y = (r - rows / 2) * spacing
      ctx.fillText('BrushSpark', x, y)
    }
  }

  ctx.restore()
}
