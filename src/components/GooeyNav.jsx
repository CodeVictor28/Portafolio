import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import './GooeyNav.css'

function GooeyNav({
  items,
  activeIndex = 0,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  onNavigate,
}) {
  const containerRef = useRef(null)
  const navRef = useRef(null)
  const filterRef = useRef(null)
  const textRef = useRef(null)
  const timersRef = useRef([])
  const [currentIndex, setCurrentIndex] = useState(activeIndex)

  function noise(amount = 1) {
    return amount / 2 - Math.random() * amount
  }

  function getXY(distance, pointIndex, totalPoints) {
    const angle =
      (((360 + noise(8)) / totalPoints) * pointIndex * Math.PI) / 180

    return [distance * Math.cos(angle), distance * Math.sin(angle)]
  }

  function createParticle(index, time, distances, radius) {
    const rotate = noise(radius / 10)

    return {
      start: getXY(distances[0], particleCount - index, particleCount),
      end: getXY(
        distances[1] + noise(7),
        particleCount - index,
        particleCount,
      ),
      time,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate:
        rotate > 0
          ? (rotate + radius / 20) * 10
          : (rotate - radius / 20) * 10,
    }
  }

  function updateEffectPosition(element) {
    if (!containerRef.current || !filterRef.current || !textRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const position = element.getBoundingClientRect()
    const styles = {
      left: `${position.x - containerRect.x}px`,
      top: `${position.y - containerRect.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
    }

    Object.assign(filterRef.current.style, styles)
    Object.assign(textRef.current.style, styles)
    textRef.current.textContent = element.textContent
  }

  function makeParticles(element) {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const hasFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches

    if (prefersReducedMotion || !hasFinePointer) {
      element.classList.add('active')
      return
    }

    const bubbleTime = animationTime * 2 + timeVariance
    element.style.setProperty('--time', `${bubbleTime}ms`)

    for (let index = 0; index < particleCount; index += 1) {
      const time = animationTime * 2 + noise(timeVariance * 2)
      const particleData = createParticle(
        index,
        time,
        particleDistances,
        particleR,
      )
      const createTimer = window.setTimeout(() => {
        const particle = document.createElement('span')
        const point = document.createElement('span')

        particle.className = 'gooey-particle'
        particle.style.setProperty('--start-x', `${particleData.start[0]}px`)
        particle.style.setProperty('--start-y', `${particleData.start[1]}px`)
        particle.style.setProperty('--end-x', `${particleData.end[0]}px`)
        particle.style.setProperty('--end-y', `${particleData.end[1]}px`)
        particle.style.setProperty('--time', `${particleData.time}ms`)
        particle.style.setProperty('--scale', `${particleData.scale}`)
        particle.style.setProperty(
          '--color',
          `var(--gooey-color-${particleData.color}, var(--accent))`,
        )
        particle.style.setProperty('--rotate', `${particleData.rotate}deg`)
        point.className = 'gooey-point'
        particle.appendChild(point)
        element.appendChild(particle)

        const removeTimer = window.setTimeout(() => {
          particle.remove()
        }, time)

        timersRef.current.push(removeTimer)
      }, 30)

      timersRef.current.push(createTimer)
    }

    element.classList.remove('active')
    requestAnimationFrame(() => element.classList.add('active'))
  }

  function activateItem(element, index, animate = true) {
    setCurrentIndex(index)
    updateEffectPosition(element)
    filterRef.current
      ?.querySelectorAll('.gooey-particle')
      .forEach((particle) => particle.remove())

    if (textRef.current) {
      textRef.current.classList.remove('active')
      void textRef.current.offsetWidth
      textRef.current.classList.add('active')
    }

    if (animate && filterRef.current) makeParticles(filterRef.current)
  }

  function handleClick(event, index) {
    const item = event.currentTarget.closest('li')

    if (item && currentIndex !== index) activateItem(item, index)
    onNavigate?.()
  }

  function handleKeyDown(event) {
    if (event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  useEffect(() => {
    setCurrentIndex(activeIndex)

    const frame = requestAnimationFrame(() => {
      const activeItem = navRef.current?.querySelectorAll('li')[activeIndex]

      if (activeItem) {
        updateEffectPosition(activeItem)
        textRef.current?.classList.add('active')
        filterRef.current?.classList.add('active')
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [activeIndex])

  useEffect(() => {
    const container = containerRef.current

    if (!container) return undefined

    const resizeObserver = new ResizeObserver(() => {
      const activeItem =
        navRef.current?.querySelectorAll('li')[currentIndex]

      if (activeItem) updateEffectPosition(activeItem)
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [currentIndex])

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    },
    [],
  )

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav aria-label="Navegación principal">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              className={currentIndex === index ? 'active' : ''}
              key={item.id ?? item.href}
            >
              <Link
                aria-current={currentIndex === index ? 'page' : undefined}
                onClick={(event) => handleClick(event, index)}
                onKeyDown={handleKeyDown}
                to={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} aria-hidden="true" />
      <span className="effect text" ref={textRef} aria-hidden="true" />
    </div>
  )
}

export default GooeyNav
