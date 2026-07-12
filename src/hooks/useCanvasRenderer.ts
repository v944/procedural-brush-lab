import { useEffect, useState } from 'react'
import { useStore } from '../stores/useStore'

export function useCanvasRenderer() {
  const [isWebGL2, setIsWebGL2] = useState(true)
  const setFallback = useStore((s) => s.setFallback)

  useEffect(() => {
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl2')
    if (!gl) {
      setIsWebGL2(false)
      setFallback(true)
    }
  }, [setFallback])

  return isWebGL2
}
