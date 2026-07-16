import { SeededRandom } from './seededRandom'
import type { BrushTipState } from '../stores/brushTipStore'

export interface StrokePoint {
  x: number
  y: number
  pressure: number
}

interface StampPoint {
  x: number
  y: number
  pressure: number
  direction: number
  distance: number
}

interface StampParams {
  x: number
  y: number
  size: number
  angle: number
  roundness: number
  opacity: number
  flipX: boolean
  flipY: boolean
}

export class BrushStrokeRenderer {
  private tipCanvas: HTMLCanvasElement
  private tipCtx: CanvasRenderingContext2D
  private strokeCanvas: HTMLCanvasElement
  private strokeCtx: CanvasRenderingContext2D
  private rng: SeededRandom
  private textureCanvas: HTMLCanvasElement | null = null
  private stampCanvas: HTMLCanvasElement
  private stampCtx: CanvasRenderingContext2D

  constructor(strokeCanvas: HTMLCanvasElement) {
    this.strokeCanvas = strokeCanvas
    this.strokeCtx = strokeCanvas.getContext('2d')!

    this.tipCanvas = document.createElement('canvas')
    this.tipCanvas.width = 128
    this.tipCanvas.height = 128
    this.tipCtx = this.tipCanvas.getContext('2d')!

    this.stampCanvas = document.createElement('canvas')
    this.stampCanvas.width = 128
    this.stampCanvas.height = 128
    this.stampCtx = this.stampCanvas.getContext('2d')!

    this.rng = new SeededRandom(42)
  }

  setTexture(canvas: HTMLCanvasElement | null): void {
    this.textureCanvas = canvas
  }

  async updateTip(tipDataUrl: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.tipCtx.clearRect(0, 0, this.tipCanvas.width, this.tipCanvas.height)
        this.tipCtx.drawImage(img, 0, 0, 128, 128)
        resolve()
      }
      img.src = tipDataUrl
    })
  }

  setTipFromImageData(imageData: ImageData): void {
    this.tipCtx.putImageData(imageData, 0, 0)
  }

  setTipFromCanvas(canvas: HTMLCanvasElement): void {
    this.tipCtx.clearRect(0, 0, this.tipCanvas.width, this.tipCanvas.height)
    this.tipCtx.drawImage(canvas, 0, 0, 128, 128)
  }

  renderStroke(
    points: StrokePoint[],
    settings: BrushTipState
  ): void {
    const ctx = this.strokeCtx
    const rect = this.strokeCanvas.getBoundingClientRect()
    const w = this.strokeCanvas.width
    const h = this.strokeCanvas.height

    ctx.clearRect(0, 0, w, h)

    if (points.length < 2) return

    const stamps = this.interpolatePoints(points, settings, rect, w, h)
    this.rng = new SeededRandom(settings.procedural.seed)

    stamps.forEach((stamp, i) => {
      const sizeVar = this.computeSizeJitter(i, stamp.pressure, stamp.distance, settings)
      const angleVar = this.computeAngleJitter(i, stamp.pressure, stamp.direction, settings)
      const roundnessVar = this.computeRoundnessJitter(i, settings)
      const scatterX = this.computeScatter(i, settings)
      const scatterY = settings.scattering.bothAxes ? this.computeScatter(i, settings) : 0
      const opacity = this.computeOpacity(i, stamp.pressure, settings)

      const count = this.getStampCount(settings)
      for (let c = 0; c < count; c++) {
        this.drawStamp({
          x: stamp.x + scatterX,
          y: stamp.y + scatterY,
          size: settings.diameter * sizeVar,
          angle: (settings.angle + angleVar) * Math.PI / 180,
          roundness: settings.roundness * roundnessVar / 100,
          opacity,
          flipX: settings.shapeDynamics.flipXJitter && this.rng.next() > 0.5,
          flipY: settings.shapeDynamics.flipYJitter && this.rng.next() > 0.5,
        })
      }
    })
  }

  private getStampCount(settings: BrushTipState): number {
    if (!settings.scattering.enabled) return 1
    const base = settings.scattering.count
    const jitter = settings.scattering.countJitter / 100
    const variation = Math.round(this.rng.next() * jitter * base)
    return Math.max(1, base + variation)
  }

  private interpolatePoints(
    points: StrokePoint[],
    settings: BrushTipState,
    rect: DOMRect,
    canvasW: number,
    canvasH: number
  ): StampPoint[] {
    const result: StampPoint[] = []
    if (points.length < 2) return result

    const scaleX = canvasW / rect.width
    const scaleY = canvasH / rect.height

    const spacingPx = Math.max(1, (settings.diameter * settings.spacing) / 100)

    let prev = {
      x: (points[0].x - rect.left) * scaleX,
      y: (points[0].y - rect.top) * scaleY,
      pressure: points[0].pressure,
    }
    result.push({ ...prev, direction: 0, distance: 0 })

    for (let i = 1; i < points.length; i++) {
      const curr = {
        x: (points[i].x - rect.left) * scaleX,
        y: (points[i].y - rect.top) * scaleY,
        pressure: points[i].pressure,
      }
      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const dir = Math.atan2(dy, dx)

      if (dist >= spacingPx) {
        const steps = Math.floor(dist / spacingPx)
        for (let s = 1; s <= steps; s++) {
          const t = s / steps
          const pressure = prev.pressure + (curr.pressure - prev.pressure) * t
          const lastDist = result.length > 0 ? result[result.length - 1].distance : 0
          result.push({
            x: prev.x + dx * t,
            y: prev.y + dy * t,
            pressure,
            direction: dir,
            distance: lastDist + spacingPx,
          })
        }
      }
      prev = curr
    }

    return result
  }

  private drawStamp(params: StampParams): void {
    const stampSize = Math.ceil(params.size)
    if (stampSize < 1) return

    if (this.textureCanvas) {
      this.stampCanvas.width = stampSize
      this.stampCanvas.height = stampSize
      const sc = this.stampCtx
      sc.globalCompositeOperation = 'source-over'
      sc.clearRect(0, 0, stampSize, stampSize)

      sc.drawImage(this.textureCanvas, 0, 0, stampSize, stampSize)

      sc.globalCompositeOperation = 'destination-in'
      sc.drawImage(this.tipCanvas, 0, 0, stampSize, stampSize)
      sc.globalCompositeOperation = 'source-over'

      this.strokeCtx.save()
      this.strokeCtx.translate(params.x, params.y)
      this.strokeCtx.rotate(params.angle)
      if (params.flipX) this.strokeCtx.scale(-1, 1)
      if (params.flipY) this.strokeCtx.scale(1, -1)
      this.strokeCtx.globalAlpha = params.opacity
      this.strokeCtx.drawImage(this.stampCanvas, -stampSize / 2, -stampSize / 2)
      this.strokeCtx.restore()
    } else {
      const ctx = this.strokeCtx
      ctx.save()
      ctx.translate(params.x, params.y)
      ctx.rotate(params.angle)
      if (params.flipX) ctx.scale(-1, 1)
      if (params.flipY) ctx.scale(1, -1)
      ctx.globalAlpha = params.opacity
      ctx.drawImage(
        this.tipCanvas,
        -params.size / 2,
        -params.size / 2,
        params.size,
        params.size
      )
      ctx.restore()
    }
  }



  private computeSizeJitter(i: number, pressure: number, distance: number, settings: BrushTipState): number {
    if (!settings.shapeDynamics.enabled) return 1.0
    const jitter = settings.shapeDynamics.sizeJitter / 100
    const control = settings.shapeDynamics.sizeJitterControl
    let controlFactor = 1.0
    if (control === 'pressure') controlFactor = pressure
    else if (control === 'fade') controlFactor = Math.max(0, 1.0 - distance / 2000)
    else if (control === 'direction') controlFactor = Math.abs(Math.sin(i * 0.1))
    const randomFactor = this.rng.next()
    const minD = settings.shapeDynamics.minDiameter / 100
    return minD + (1.0 - minD) * (1.0 - jitter * controlFactor * randomFactor)
  }

  private computeAngleJitter(i: number, pressure: number, direction: number, settings: BrushTipState): number {
    if (!settings.shapeDynamics.enabled) return 0
    const jitter = settings.shapeDynamics.angleJitter / 100
    const control = settings.shapeDynamics.angleJitterControl
    let controlFactor = 1.0
    if (control === 'pressure') controlFactor = pressure
    else if (control === 'fade') controlFactor = Math.max(0, 1.0 - i / 100)
    else if (control === 'direction') controlFactor = Math.abs(Math.sin(direction))
    const randomFactor = (this.rng.next() - 0.5) * 2
    return jitter * controlFactor * randomFactor * 180
  }

  private computeRoundnessJitter(_i: number, settings: BrushTipState): number {
    if (!settings.shapeDynamics.enabled) return 100
    const jitter = settings.shapeDynamics.roundnessJitter / 100
    const minR = settings.shapeDynamics.minRoundness / 100
    const randomFactor = this.rng.next()
    return (minR + (1.0 - minR) * (1.0 - jitter * randomFactor)) * 100
  }

  private computeScatter(_i: number, settings: BrushTipState): number {
    if (!settings.scattering.enabled) return 0
    const scatter = settings.scattering.scatter / 100
    return (this.rng.next() - 0.5) * 2 * scatter * settings.diameter
  }

  private computeOpacity(_i: number, pressure: number, settings: BrushTipState): number {
    if (!settings.transfer.enabled) return pressure
    const jitter = settings.transfer.opacityJitter / 100
    const minOp = settings.transfer.minOpacity / 100
    const randomFactor = this.rng.next()
    return minOp + (pressure - minOp) * (1.0 - jitter * randomFactor)
  }

  clear(): void {
    const ctx = this.strokeCtx
    ctx.clearRect(0, 0, this.strokeCanvas.width, this.strokeCanvas.height)
  }
}
