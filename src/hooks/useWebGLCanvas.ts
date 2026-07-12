import { useRef, useEffect } from 'react'
import { VERTEX_SHADER, NOISE_FRAG, GRUNGE_FRAG, BRISTLES_FRAG, SCALES_FRAG, CRACKS_FRAG } from '../shaders/noise'
import type { TextureType, TextureParams } from '../types'

const FRAG_SHADERS: Record<TextureType, string> = {
  noise: NOISE_FRAG,
  grunge: GRUNGE_FRAG,
  bristles: BRISTLES_FRAG,
  scales: SCALES_FRAG,
  cracks: CRACKS_FRAG,
}

let _readTextureFn: ((width: number, height: number) => Promise<string>) | null = null
let _readTexture2DFn: ((width: number, height: number) => Promise<string>) | null = null

export function setReadTextureFn(fn: typeof _readTextureFn) {
  _readTextureFn = fn
}

export function setReadTexture2DFn(fn: typeof _readTexture2DFn) {
  _readTexture2DFn = fn
}

export function readTexture(width: number, height: number): Promise<string> {
  if (_readTextureFn) return _readTextureFn(width, height)
  if (_readTexture2DFn) return _readTexture2DFn(width, height)
  return Promise.resolve('')
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, fsSource: string): WebGLProgram | null {
  const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

function setAllUniforms(gl: WebGL2RenderingContext, program: WebGLProgram, params: TextureParams, tileMode: boolean, w: number, h: number) {
  gl.useProgram(program)

  const setUniform = (name: string, value: number | number[]) => {
    const loc = gl.getUniformLocation(program, name)
    if (loc === null) return
    if (typeof value === 'number') {
      gl.uniform1f(loc, value)
    } else if (value.length === 2) {
      gl.uniform2f(loc, value[0], value[1])
    }
  }

  const p = params as unknown as Record<string, number>

  setUniform('u_seed', p.seed)
  setUniform('u_scale', p.scale)
  setUniform('u_density', p.density)
  setUniform('u_tileMode', tileMode ? 1 : 0)
  setUniform('u_resolution', [w, h])

  if ('octaves' in p) setUniform('u_octaves', p.octaves)
  if ('lacunarity' in p) setUniform('u_lacunarity', p.lacunarity)
  if ('gain' in p) setUniform('u_gain', p.gain)
  if ('roughness' in p) setUniform('u_roughness', p.roughness)
  if ('count' in p) setUniform('u_count', p.count)
  if ('length' in p) setUniform('u_length', p.length)
  if ('angle' in p) setUniform('u_angle', p.angle)
  if ('angleVariance' in p) setUniform('u_angleVariance', p.angleVariance)
  if ('thickness' in p) setUniform('u_thickness', p.thickness)
  if ('edge' in p) setUniform('u_edge', p.edge)
  if ('width' in p) setUniform('u_width', p.width)
  if ('branching' in p) setUniform('u_branching', p.branching)
}

function renderFullQuad(gl: WebGL2RenderingContext, vao: WebGLVertexArrayObject) {
  gl.bindVertexArray(vao)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
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

  // Flip Y
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

export function useWebGLCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  textureType: TextureType,
  params: TextureParams,
  tileMode: boolean,
) {
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null)
  const prevTypeRef = useRef<TextureType | null>(null)
  const lastParamsRef = useRef<TextureParams | null>(null)
  const lastTileModeRef = useRef(false)

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

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    gl.viewport(0, 0, canvas.width, canvas.height)

    _readTextureFn = async (width: number, height: number): Promise<string> => {
      const g = glRef.current
      const p = programRef.current
      const v = vaoRef.current
      const curParams = lastParamsRef.current
      const curTileMode = lastTileModeRef.current
      if (!g || !p || !v || !curParams) return ''

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
      setAllUniforms(g, p, curParams, curTileMode, width, height)
      renderFullQuad(g, v)

      const url = readPixelsToDataURL(g, width, height)

      g.bindFramebuffer(g.FRAMEBUFFER, null)
      g.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      g.deleteFramebuffer(fb)
      g.deleteTexture(tex)

      return url
    }

    return () => {
      _readTextureFn = null
      if (programRef.current) gl.deleteProgram(programRef.current)
      if (vao) gl.deleteVertexArray(vao)
    }
  }, [canvasRef])

  // Recompile shader only when textureType changes
  useEffect(() => {
    const gl = glRef.current
    if (!gl) return

    if (prevTypeRef.current === textureType) return
    prevTypeRef.current = textureType

    if (programRef.current) {
      gl.deleteProgram(programRef.current)
    }

    const program = createProgram(gl, FRAG_SHADERS[textureType])
    if (!program) return
    programRef.current = program
  }, [textureType])

  // Update uniforms and re-render when params or tileMode change
  useEffect(() => {
    const gl = glRef.current
    const program = programRef.current
    const vao = vaoRef.current
    const canvas = canvasRef.current
    if (!gl || !program || !vao || !canvas) return

    lastParamsRef.current = params
    lastTileModeRef.current = tileMode

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)

    gl.clearColor(0.165, 0.165, 0.227, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    setAllUniforms(gl, program, params, tileMode, w, h)
    renderFullQuad(gl, vao)
  }, [textureType, params, tileMode, canvasRef])
}
