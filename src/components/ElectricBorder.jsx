import { useCallback, useEffect, useRef } from 'react'
import './ElectricBorder.css'

// Inspired by @BalintFerenczy: https://codepen.io/BalintFerenczy/pen/KwdoyEN
function ElectricBorder({
  children,
  color = '#5227ff',
  speed = 1,
  chaos = 0.12,
  thickness = 2,
  borderRadius = 24,
  className = '',
  style,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  const random = useCallback(
    (value) => (Math.sin(value * 12.9898) * 43758.5453) % 1,
    [],
  )

  const noise2D = useCallback(
    (x, y) => {
      const i = Math.floor(x)
      const j = Math.floor(y)
      const fx = x - i
      const fy = y - j
      const a = random(i + j * 57)
      const b = random(i + 1 + j * 57)
      const c = random(i + (j + 1) * 57)
      const d = random(i + 1 + (j + 1) * 57)
      const ux = fx * fx * (3 - 2 * fx)
      const uy = fy * fy * (3 - 2 * fy)

      return (
        a * (1 - ux) * (1 - uy) +
        b * ux * (1 - uy) +
        c * (1 - ux) * uy +
        d * ux * uy
      )
    },
    [random],
  )

  const octavedNoise = useCallback(
    (x, time, seed) => {
      let value = 0
      let amplitude = chaos
      let frequency = 10

      for (let octave = 0; octave < 8; octave += 1) {
        value +=
          amplitude *
          noise2D(frequency * x + seed * 100, time * frequency * 0.3)
        frequency *= 1.6
        amplitude *= 0.7
      }

      return value
    },
    [chaos, noise2D],
  )

  const getCornerPoint = useCallback(
    (centerX, centerY, radius, startAngle, arcLength, progress) => {
      const angle = startAngle + progress * arcLength
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    },
    [],
  )

  const getRoundedRectPoint = useCallback(
    (progress, left, top, width, height, radius) => {
      const straightWidth = width - 2 * radius
      const straightHeight = height - 2 * radius
      const cornerArc = (Math.PI * radius) / 2
      const totalPerimeter =
        2 * straightWidth + 2 * straightHeight + 4 * cornerArc
      const distance = progress * totalPerimeter
      let accumulated = 0

      if (distance <= accumulated + straightWidth) {
        const edgeProgress = (distance - accumulated) / straightWidth
        return {
          x: left + radius + edgeProgress * straightWidth,
          y: top,
        }
      }
      accumulated += straightWidth

      if (distance <= accumulated + cornerArc) {
        const edgeProgress = (distance - accumulated) / cornerArc
        return getCornerPoint(
          left + width - radius,
          top + radius,
          radius,
          -Math.PI / 2,
          Math.PI / 2,
          edgeProgress,
        )
      }
      accumulated += cornerArc

      if (distance <= accumulated + straightHeight) {
        const edgeProgress = (distance - accumulated) / straightHeight
        return {
          x: left + width,
          y: top + radius + edgeProgress * straightHeight,
        }
      }
      accumulated += straightHeight

      if (distance <= accumulated + cornerArc) {
        const edgeProgress = (distance - accumulated) / cornerArc
        return getCornerPoint(
          left + width - radius,
          top + height - radius,
          radius,
          0,
          Math.PI / 2,
          edgeProgress,
        )
      }
      accumulated += cornerArc

      if (distance <= accumulated + straightWidth) {
        const edgeProgress = (distance - accumulated) / straightWidth
        return {
          x: left + width - radius - edgeProgress * straightWidth,
          y: top + height,
        }
      }
      accumulated += straightWidth

      if (distance <= accumulated + cornerArc) {
        const edgeProgress = (distance - accumulated) / cornerArc
        return getCornerPoint(
          left + radius,
          top + height - radius,
          radius,
          Math.PI / 2,
          Math.PI / 2,
          edgeProgress,
        )
      }
      accumulated += cornerArc

      if (distance <= accumulated + straightHeight) {
        const edgeProgress = (distance - accumulated) / straightHeight
        return {
          x: left,
          y: top + height - radius - edgeProgress * straightHeight,
        }
      }
      accumulated += straightHeight

      return getCornerPoint(
        left + radius,
        top + radius,
        radius,
        Math.PI,
        Math.PI / 2,
        (distance - accumulated) / cornerArc,
      )
    },
    [getCornerPoint],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !container || !context) return undefined

    const borderOffset = 38
    const displacement = 48
    const frameInterval = 1000 / 30
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let width = 0
    let height = 0
    let isVisible = true
    let isDocumentVisible = !document.hidden
    let disposed = false

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      width = Math.max(1, rect.width + borderOffset * 2)
      height = Math.max(1, rect.height + borderOffset * 2)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const draw = (currentTime) => {
      animationRef.current = null
      if (disposed || !isVisible || !isDocumentVisible) return

      if (
        lastFrameTimeRef.current &&
        currentTime - lastFrameTimeRef.current < frameInterval
      ) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      const deltaTime = lastFrameTimeRef.current
        ? Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.05)
        : 0
      timeRef.current += deltaTime * speed
      lastFrameTimeRef.current = currentTime

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.scale(dpr, dpr)
      context.strokeStyle = color
      context.lineWidth = thickness
      context.lineCap = 'round'
      context.lineJoin = 'round'

      const left = borderOffset
      const top = borderOffset
      const borderWidth = width - borderOffset * 2
      const borderHeight = height - borderOffset * 2
      const radius = Math.min(
        borderRadius,
        Math.min(borderWidth, borderHeight) / 2,
      )
      const approximatePerimeter =
        2 * (borderWidth + borderHeight) + 2 * Math.PI * radius
      const sampleCount = Math.max(90, Math.floor(approximatePerimeter / 3))

      context.beginPath()
      for (let index = 0; index <= sampleCount; index += 1) {
        const progress = index / sampleCount
        const point = getRoundedRectPoint(
          progress,
          left,
          top,
          borderWidth,
          borderHeight,
          radius,
        )
        const displacedX =
          point.x + octavedNoise(progress * 8, timeRef.current, 0) * displacement
        const displacedY =
          point.y + octavedNoise(progress * 8, timeRef.current, 1) * displacement

        if (index === 0) context.moveTo(displacedX, displacedY)
        else context.lineTo(displacedX, displacedY)
      }
      context.closePath()
      context.stroke()

      if (!reduceMotion) animationRef.current = requestAnimationFrame(draw)
    }

    const requestDraw = () => {
      if (
        disposed ||
        animationRef.current !== null ||
        !isVisible ||
        !isDocumentVisible
      ) {
        return
      }
      lastFrameTimeRef.current = 0
      animationRef.current = requestAnimationFrame(draw)
    }

    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
      requestDraw()
    })
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (!isVisible && animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
        requestDraw()
      },
      { rootMargin: '120px' },
    )
    intersectionObserver.observe(container)

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden
      if (!isDocumentVisible && animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      requestDraw()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    requestDraw()

    return () => {
      disposed = true
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [
    borderRadius,
    color,
    getRoundedRectPoint,
    octavedNoise,
    speed,
    thickness,
  ])

  return (
    <div
      ref={containerRef}
      className={`electric-border${className ? ` ${className}` : ''}`}
      style={{
        '--electric-border-color': color,
        '--electric-border-thickness': `${thickness}px`,
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
    >
      <div className="eb-canvas-container" aria-hidden="true">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>
      <div className="eb-layers" aria-hidden="true">
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-background-glow" />
      </div>
      <div className="eb-content">{children}</div>
    </div>
  )
}

export default ElectricBorder
