function mulberry32(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

function hash2D(ix: number, iy: number, seed: number) {
  const rng = mulberry32(ix * 374761393 + iy * 668265263 + seed * 1274126177)
  return rng()
}

function valueNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const a = hash2D(ix, iy, seed)
  const b = hash2D(ix + 1, iy, seed)
  const c = hash2D(ix, iy + 1, seed)
  const d = hash2D(ix + 1, iy + 1, seed)

  const sx = smoothstep(fx)
  const sy = smoothstep(fy)

  return lerp(lerp(a, b, sx), lerp(c, d, sx), sy)
}

const PERM: number[] = []
for (let i = 0; i < 256; i++) PERM.push(i)
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [PERM[i], PERM[j]] = [PERM[j], PERM[i]]
}

function grad2D(hash: number, x: number, y: number) {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

function perlinNoise(x: number, y: number) {
  const ix = Math.floor(x) & 255
  const iy = Math.floor(y) & 255
  const fx = x - Math.floor(x)
  const fy = y - Math.floor(y)

  const u = smoothstep(fx)
  const v = smoothstep(fy)

  const aa = PERM[PERM[ix] + iy]
  const ab = PERM[PERM[ix + 1] + iy]
  const ba = PERM[PERM[ix] + iy + 1]
  const bb = PERM[PERM[ix + 1] + iy + 1]

  return lerp(
    lerp(grad2D(aa, fx, fy), grad2D(ab, fx - 1, fy), u),
    lerp(grad2D(ba, fx, fy - 1), grad2D(bb, fx - 1, fy - 1), u),
    v
  )
}

export function fBm(x: number, y: number, seed: number, octaves: number, lacunarity: number, gain: number) {
  let total = 0
  let amplitude = 1
  let frequency = 1
  let maxAmplitude = 0

  for (let i = 0; i < octaves; i++) {
    total += perlinNoise(x * frequency + seed * 0.01, y * frequency + seed * 0.01) * amplitude
    maxAmplitude += amplitude
    amplitude *= gain
    frequency *= lacunarity
  }

  return total / maxAmplitude
}

export function seamlessUV(x: number, y: number) {
  return { x: x - Math.floor(x), y: y - Math.floor(y) }
}

export function renderNoise(ctx: CanvasRenderingContext2D, w: number, h: number, params: { scale: number; density: number; octaves: number; lacunarity: number; gain: number; seed: number }, tileMode: boolean) {
  const imageData = ctx.createImageData(w, h)
  const data = imageData.data

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const ux = tileMode ? (px / w) * 2 : px / w
      const uy = tileMode ? (py / h) * 2 : py / h
      const p = seamlessUV(ux * params.scale, uy * params.scale)
      const noise = fBm(p.x, p.y, params.seed, params.octaves, params.lacunarity, params.gain)
      const alpha = Math.max(0, Math.min(1, (noise * 0.5 + 0.5 - params.density + 0.1) / 0.2))
      const idx = (py * w + px) * 4
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = Math.round(alpha * 255)
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function renderGrunge(ctx: CanvasRenderingContext2D, w: number, h: number, params: { scale: number; density: number; roughness: number; seed: number }, tileMode: boolean) {
  const imageData = ctx.createImageData(w, h)
  const data = imageData.data

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const ux = tileMode ? (px / w) * 2 : px / w
      const uy = tileMode ? (py / h) * 2 : py / h
      const posX = ux * params.scale
      const posY = uy * params.scale
      const warpX = perlinNoise(posX * 2 + params.seed * 0.01, posY * 2 + params.seed * 0.01) * params.roughness
      const warpY = perlinNoise(posX * 2 + params.seed * 0.01 + 100, posY * 2 + params.seed * 0.01 + 100) * params.roughness
      const nx = posX + warpX
      const ny = posY + warpY
      const noise = valueNoise(nx, ny, params.seed)
      const alpha = Math.max(0, Math.min(1, (noise - params.density + 0.1) / 0.2))
      const idx = (py * w + px) * 4
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = Math.round(alpha * 255)
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function renderBristles(ctx: CanvasRenderingContext2D, w: number, h: number, params: { count: number; length: number; angle: number; angleVariance: number; thickness: number; seed: number }, tileMode: boolean) {
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, w, h)

  const extent = tileMode ? 2 : 1
  const mult = tileMode ? 4 : 1
  const n = Math.min(params.count * mult, 500)

  for (let i = 0; i < n; i++) {
    const rng = mulberry32(i * 374761393 + params.seed * 668265263)
    const rx = rng()
    const ry = rng()
    const ra = rng()

    const startX = rx * w * extent
    const startY = ry * h * extent
    const angleRad = (params.angle + (ra - 0.5) * params.angleVariance * 2) * Math.PI / 180
    const len = params.length * extent
    const endX = startX + Math.cos(angleRad) * len
    const endY = startY + Math.sin(angleRad) * len

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = params.thickness * extent
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

export function renderScales(ctx: CanvasRenderingContext2D, w: number, h: number, params: { scale: number; density: number; edge: number; seed: number }, tileMode: boolean) {
  const imageData = ctx.createImageData(w, h)
  const data = imageData.data

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const ux = tileMode ? (px / w) * 2 : px / w
      const uy = tileMode ? (py / h) * 2 : py / h
      const posX = ux * params.scale
      const posY = uy * params.scale
      const ix = Math.floor(posX)
      const iy = Math.floor(posY)
      const fx = posX - ix
      const fy = posY - iy

      let minDist = Infinity
      let minDist2 = Infinity

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const rng = mulberry32((ix + dx) * 374761393 + (iy + dy) * 668265263 + params.seed * 1274126177)
          const px2 = dx + rng() - fx
          const py2 = dy + rng() - fy
          const d = Math.sqrt(px2 * px2 + py2 * py2)

          if (d < minDist) {
            minDist2 = minDist
            minDist = d
          } else if (d < minDist2) {
            minDist2 = d
          }
        }
      }

      const cellAlpha = params.density > minDist ? 0 : 1
      const edgeWidth = params.edge * 0.1
      const edgeAlpha = Math.abs(minDist - minDist2) < edgeWidth ? 0 : 1
      const alpha = Math.max(cellAlpha, edgeAlpha)

      const idx = (py * w + px) * 4
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = Math.round((1 - alpha) * 255)
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function renderCracks(ctx: CanvasRenderingContext2D, w: number, h: number, params: { scale: number; density: number; width: number; branching: number; seed: number }, tileMode: boolean) {
  const imageData = ctx.createImageData(w, h)
  const data = imageData.data

  const offsets = tileMode
    ? [[0, 0], [1, 0], [0, 1], [1, 1]]
    : [[0, 0]]

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const ux = tileMode ? (px / w) * 2 : px / w
      const uy = tileMode ? (py / h) * 2 : py / h

      let minDist = Infinity

      for (const [ox, oy] of offsets) {
        const pux = ux + ox
        const puy = uy + oy
        const posX = pux * params.scale
        const posY = puy * params.scale
        const gx = Math.floor(posX)
        const gy = Math.floor(posY)
        const lx = posX - gx - 0.5
        const ly = posY - gy - 0.5

        const noise = perlinNoise(gx + params.seed * 0.01, gy + params.seed * 0.01)
        const angle = noise * Math.PI * params.branching
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const rx = lx * c - ly * s
        const dist = Math.abs(rx)
        if (dist < minDist) minDist = dist
      }

      const crack = 1 - Math.max(0, Math.min(1, (minDist - 0) / (params.width / 512)))
      const alpha = Math.max(0, Math.min(1, crack))

      const idx = (py * w + px) * 4
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = Math.round(alpha * 255)
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

let _readTexture2DFn: ((width: number, height: number) => Promise<string>) | null = null

export function setReadTexture2DFn(fn: typeof _readTexture2DFn) {
  _readTexture2DFn = fn
}

export function readTexture2D(width: number, height: number): Promise<string> {
  if (!_readTexture2DFn) return Promise.resolve('')
  return _readTexture2DFn(width, height)
}
