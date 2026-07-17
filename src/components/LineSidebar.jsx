import { useCallback, useEffect, useRef, useState } from 'react'
import './LineSidebar.css'

const CURVAS_CAIDA = {
  linear: (proximidad) => proximidad,
  smooth: (proximidad) =>
    proximidad * proximidad * (3 - 2 * proximidad),
  sharp: (proximidad) => proximidad * proximidad * proximidad,
}

function LineSidebar({
  items,
  accentColor = '#a855f7',
  textColor = '#c4c4c4',
  markerColor = '#6c6c6c',
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = 'smooth',
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  defaultActive = null,
  onItemClick,
  className = '',
  ariaLabel = 'Lista interactiva',
}) {
  const listRef = useRef(null)
  const itemRefs = useRef([])
  const targetsRef = useRef([])
  const currentRef = useRef([])
  const rafRef = useRef(null)
  const lastRef = useRef(0)
  const activeRef = useRef(defaultActive)
  const smoothingRef = useRef(smoothing)
  const maxShiftRef = useRef(maxShift)
  const [activeIndex, setActiveIndex] = useState(defaultActive)

  activeRef.current = activeIndex
  smoothingRef.current = smoothing
  maxShiftRef.current = maxShift

  const runFrame = useCallback((now) => {
    const delta = Math.min((now - lastRef.current) / 1000, 0.05)
    const smoothingTime = Math.max(smoothingRef.current, 1) / 1000
    const movement = 1 - Math.exp(-delta / smoothingTime)
    let isMoving = false

    lastRef.current = now

    itemRefs.current.forEach((element, index) => {
      if (!element) return

      const target = Math.max(
        targetsRef.current[index] || 0,
        activeRef.current === index ? 1 : 0,
      )
      const current = currentRef.current[index] || 0
      const next = current + (target - current) * movement
      const isSettled = Math.abs(target - next) < 0.0015
      const value = isSettled ? target : next

      currentRef.current[index] = value
      element.style.setProperty('--effect', value.toFixed(4))
      element.style.setProperty(
        '--effect-percent',
        `${(value * 100).toFixed(2)}%`,
      )
      element.style.setProperty(
        '--effect-shift',
        `${(value * maxShiftRef.current).toFixed(2)}px`,
      )
      element.style.setProperty(
        '--effect-index-opacity',
        (0.55 + value * 0.45).toFixed(4),
      )
      element.style.setProperty(
        '--effect-marker-scale',
        (0.7 + value * 0.5).toFixed(4),
      )
      element.style.setProperty(
        '--effect-tick-scale',
        (0.7 + value * 0.6).toFixed(4),
      )
      element.style.setProperty(
        '--effect-text-glow',
        `${(value * 16).toFixed(2)}px`,
      )
      element.style.setProperty(
        '--effect-marker-glow',
        `${(value * 12).toFixed(2)}px`,
      )
      if (!isSettled) isMoving = true
    })

    rafRef.current = isMoving ? requestAnimationFrame(runFrame) : null
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return

    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(runFrame)
  }, [runFrame])

  const handlePointerMove = useCallback(
    (event) => {
      if (event.pointerType === 'touch') return

      const curve = CURVAS_CAIDA[falloff] ?? CURVAS_CAIDA.linear

      itemRefs.current.forEach((element, index) => {
        if (!element) return

        const rect = element.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const distance = Math.abs(event.clientY - center)
        const proximity = Math.max(0, 1 - distance / proximityRadius)

        targetsRef.current[index] = curve(proximity)
      })

      startLoop()
    },
    [falloff, proximityRadius, startLoop],
  )

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0)
    startLoop()
  }, [startLoop])

  const handleFocus = useCallback(
    (index) => {
      targetsRef.current = itemRefs.current.map((_, itemIndex) =>
        itemIndex === index ? 1 : 0,
      )
      startLoop()
    },
    [startLoop],
  )

  const activateItem = useCallback(
    (index, label) => {
      setActiveIndex(index)
      onItemClick?.(index, label)
    },
    [onItemClick],
  )

  function handleKeyDown(event, index, label) {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    activateItem(index, label)
  }

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length)
    targetsRef.current = items.map(() => 0)
    currentRef.current = items.map(() => 0)
    startLoop()
  }, [items, startLoop])

  useEffect(() => {
    startLoop()
  }, [activeIndex, startLoop])

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  return (
    <nav
      className={`line-sidebar${showMarker ? ' line-sidebar--markers' : ''}${scaleTick ? ' line-sidebar--scale-tick' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--marker-offset': `${-(markerLength + markerGap)}px`,
        '--tick-scale': tickScale,
        '--tick-width': `${markerLength * tickScale}px`,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`,
      }}
      aria-label={ariaLabel}
    >
      <ul
        ref={listRef}
        className="line-sidebar__list"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            ref={(element) => {
              itemRefs.current[index] = element
            }}
            className="line-sidebar__item"
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => activateItem(index, label)}
            onPointerDown={() => handleFocus(index)}
            onKeyDown={(event) => handleKeyDown(event, index, label)}
            onFocus={() => handleFocus(index)}
            onBlur={handlePointerLeave}
            role="button"
            tabIndex={0}
          >
            {showMarker && (
              <span className="line-sidebar__marker" aria-hidden="true" />
            )}
            <span className="line-sidebar__label">
              {showIndex && (
                <span className="line-sidebar__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
              )}
              <span className="line-sidebar__text">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default LineSidebar
