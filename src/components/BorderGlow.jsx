import { useCallback, useEffect, useRef } from 'react'
import './BorderGlow.css'

const GRADIENT_POSITIONS = [
  '80% 55%',
  '69% 34%',
  '8% 6%',
  '41% 38%',
  '86% 85%',
  '82% 18%',
  '51% 4%',
]
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
]
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

function parseHSL(hslString) {
  const match = hslString.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)

  if (!match) return { h: 40, s: 80, l: 80 }

  return {
    h: Number.parseFloat(match[1]),
    s: Number.parseFloat(match[2]),
    l: Number.parseFloat(match[3]),
  }
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor)
  const baseColor = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']

  return Object.fromEntries(
    opacities.map((opacity, index) => [
      `--glow-color${keys[index]}`,
      `hsl(${baseColor} / ${Math.min(opacity * intensity, 100)}%)`,
    ]),
  )
}

function buildGradientVars(colors) {
  const safeColors = colors.length > 0 ? colors : ['#c084fc']
  const variables = {}

  GRADIENT_KEYS.forEach((key, index) => {
    const colorIndex = Math.min(COLOR_MAP[index], safeColors.length - 1)

    variables[key] =
      `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${safeColors[colorIndex]} 0px, transparent 50%)`
  })

  variables['--gradient-base'] =
    `linear-gradient(${safeColors[0]} 0 100%)`

  return variables
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3)
}

function easeInCubic(value) {
  return value * value * value
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}) {
  let frameId
  let cancelled = false
  const timeoutId = window.setTimeout(() => {
    const startTime = performance.now()

    function tick(now) {
      if (cancelled) return

      const progress = Math.min((now - startTime) / duration, 1)
      onUpdate(start + (end - start) * ease(progress))

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        onEnd?.()
      }
    }

    frameId = requestAnimationFrame(tick)
  }, delay)

  return () => {
    cancelled = true
    window.clearTimeout(timeoutId)
    if (frameId) cancelAnimationFrame(frameId)
  }
}

function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120f17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}) {
  const cardRef = useRef(null)

  const getCenterOfElement = useCallback((element) => {
    const { width, height } = element.getBoundingClientRect()
    return [width / 2, height / 2]
  }, [])

  const getEdgeProximity = useCallback(
    (element, x, y) => {
      const [centerX, centerY] = getCenterOfElement(element)
      const deltaX = x - centerX
      const deltaY = y - centerY
      const scaleX = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX)
      const scaleY = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY)

      return Math.min(
        Math.max(1 / Math.min(scaleX, scaleY), 0),
        1,
      )
    },
    [getCenterOfElement],
  )

  const getCursorAngle = useCallback(
    (element, x, y) => {
      const [centerX, centerY] = getCenterOfElement(element)
      const deltaX = x - centerX
      const deltaY = y - centerY

      if (deltaX === 0 && deltaY === 0) return 0

      let degrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
      if (degrees < 0) degrees += 360

      return degrees
    },
    [getCenterOfElement],
  )

  const handlePointerMove = useCallback(
    (event) => {
      if (event.pointerType === 'touch') return

      const card = cardRef.current
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const edge = getEdgeProximity(card, x, y)
      const angle = getCursorAngle(card, x, y)

      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3))
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`)
    },
    [getCursorAngle, getEdgeProximity],
  )

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current
    if (!card || card.classList.contains('sweep-active')) return

    card.style.setProperty('--edge-proximity', '0')
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!animated || !card) return undefined

    const angleStart = 110
    const angleEnd = 465
    const cancellations = []

    card.classList.add('sweep-active')
    card.style.setProperty('--cursor-angle', `${angleStart}deg`)

    cancellations.push(
      animateValue({
        duration: 500,
        onUpdate: (value) =>
          card.style.setProperty('--edge-proximity', value),
      }),
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: (value) =>
          card.style.setProperty(
            '--cursor-angle',
            `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
          ),
      }),
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: (value) =>
          card.style.setProperty(
            '--cursor-angle',
            `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
          ),
      }),
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (value) =>
          card.style.setProperty('--edge-proximity', value),
        onEnd: () => card.classList.remove('sweep-active'),
      }),
    )

    return () => {
      cancellations.forEach((cancel) => cancel())
      card.classList.remove('sweep-active')
    }
  }, [animated])

  return (
    <div
      ref={cardRef}
      className={`border-glow-card${className ? ` ${className}` : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}

export default BorderGlow
