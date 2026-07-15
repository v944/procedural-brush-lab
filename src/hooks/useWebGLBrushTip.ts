import { useRef, useEffect } from 'react'
import { VERTEX_SHADER } from '../shaders/noise'
import { BRUSH_TIP_FRAG } from '../shaders/brushTip'
import { useBrushTipStore, type BrushTipShape } from '../stores/brushTipStore'

const SHAPE_INDEX: Record<BrushTipShape, number> = {
  round: 0,
  square: 1,
  softRound: 2,
  softSquare: 3,
  procedural: 4,
}

const NOISE_TYPE_INDEX: Record<string, number> = {
  simplex: 0,
  value: 1,
  worley: 2,
}

let _readTipFn: ((width: number, height: number) => Promise<string>) | null = null

export function setReadTipFn(fn: typeof _readTipFn) {
  _readTipFn = fn
}

export function readTip(width: number, height: number): Promise<string> {
  if (_readTipFn) return _readTipFn(width, height)
  return Promise.resolve('')
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createTipProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, BRUSH_TIP_FRAG)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

export interface BrushTipUniforms {
  shape: number
  hardness: number
  roundness: number
  angle: number
  noiseType: number
  noiseAmount: number
  noiseScale: number
  noiseSeed: number
  threshold: number
  smoothing: number
}

function readPixelsToDataURL(gl: WebGL2RenderingContext, width: number, height: number): string {
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  const flipped = document.createElement('canvas')
  flipped.width = width
  flipped.height = height
  const fctx = flipped.getContext('2d')!
  fctx.save()
  fctx.scale(1, -1)
  fctx.drawImage(canvas, 0, 0, width, -height)
  fctx.restore()
  return flipped.toDataURL('image/png')
}

function setAllTipUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  uniforms: BrushTipUniforms,
  w: number,
  h: number,
) {
  gl.useProgram(program)
  const set = (name: string, value: number | number[]) => {
    const loc = gl.getUniformLocation(program, name)
    if (loc === null) return
    if (typeof value === 'number') gl.uniform1f(loc, value)
    else if (value.length === 2) gl.uniform2f(loc, value[0], value[1])
  }
  set('u_resolution', [w, h])
  set('u_shape', uniforms.shape)
  set('u_hardness', uniforms.hardness)
  set('u_roundness', uniforms.roundness)
  set('u_angle', uniforms.angle)
  set('u_noiseType', uniforms.noiseType)
  set('u_noiseAmount', uniforms.noiseAmount)
  set('u_noiseScale', uniforms.noiseScale)
  set('u_noiseSeed', uniforms.noiseSeed)
  set('u_threshold', uniforms.threshold)
  set('u_smoothing', uniforms.smoothing)
}

export function useWebGLBrushTip(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null)
  const uniformsRef = useRef<BrushTipUniforms | null>(null)

  const renderTip = () => {
    const gl = glRef.current
    const program = programRef.current
    const vao = vaoRef.current
    const canvas = canvasRef.current
    if (!gl || !program || !vao || !canvas || !uniformsRef.current) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }

    setAllTipUniforms(gl, program, uniformsRef.current, w, h)
    gl.clearColor(0.102, 0.102, 0.141, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const syncUniforms = () => {
    const state = useBrushTipStore.getState()
    uniformsRef.current = {
      shape: SHAPE_INDEX[state.shape],
      hardness: state.hardness,
      roundness: state.roundness,
      angle: (state.angle * Math.PI) / 180,
      noiseType: NOISE_TYPE_INDEX[state.procedural.noiseType] ?? 0,
      noiseAmount: state.procedural.noiseAmount,
      noiseScale: state.procedural.noiseScale,
      noiseSeed: state.procedural.seed,
      threshold: state.procedural.threshold,
      smoothing: state.procedural.smoothing,
    }
    renderTip()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    })
    if (!gl) return
    glRef.current = gl

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    vaoRef.current = vao
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)

    const program = createTipProgram(gl)
    if (!program) return
    programRef.current = program

    _readTipFn = async (width: number, height: number): Promise<string> => {
      const g = glRef.current
      const p = programRef.current
      const v = vaoRef.current
      const u = uniformsRef.current
      if (!g || !p || !v || !u) return ''

      const fb = g.createFramebuffer()
      const tex = g.createTexture()
      g.bindTexture(g.TEXTURE_2D, tex)
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, width, height, 0, g.RGBA, g.UNSIGNED_BYTE, null)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
      g.bindFramebuffer(g.FRAMEBUFFER, fb)
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0)

      g.viewport(0, 0, width, height)
      setAllTipUniforms(g, p, u, width, height)
      g.bindVertexArray(v)
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)

      const url = readPixelsToDataURL(g, width, height)

      g.bindFramebuffer(g.FRAMEBUFFER, null)
      g.deleteFramebuffer(fb)
      g.deleteTexture(tex)

      const canvas = canvasRef.current
      if (canvas) {
        const dpr = window.devicePixelRatio || 1
        g.viewport(0, 0, canvas.clientWidth * dpr, canvas.clientHeight * dpr)
      }

      return url
    }

    syncUniforms()

    const unsub = useBrushTipStore.subscribe(() => {
      syncUniforms()
    })

    return () => {
      _readTipFn = null
      unsub()
      if (programRef.current) gl.deleteProgram(programRef.current)
      if (vao) gl.deleteVertexArray(vao)
    }
  }, [canvasRef])

  return { renderTip, syncUniforms }
}
