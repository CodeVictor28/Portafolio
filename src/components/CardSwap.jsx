import {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import gsap from 'gsap'
import './CardSwap.css'

export const Card = forwardRef(
  (
    {
      as: Component = 'article',
      customClass = '',
      className = '',
      ...rest
    },
    ref,
  ) => (
    <Component
      ref={ref}
      {...rest}
      className={`card-swap-card ${customClass} ${className}`.trim()}
    />
  ),
)

Card.displayName = 'Card'

function makeSlot(index, distanceX, distanceY, total) {
  return {
    x: index * distanceX,
    y: -index * distanceY,
    z: -index * distanceX * 1.5,
    zIndex: total - index,
  }
}

function placeNow(element, slot, skew) {
  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  })
}

function getResponsiveScale(width) {
  if (width <= 430) return 0.28
  if (width <= 620) return 0.42
  if (width <= 900) return 0.7
  return 1
}

export default function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children,
  className = '',
}) {
  const childArray = useMemo(() => Children.toArray(children), [children])
  const refs = useMemo(
    () => childArray.map(() => createRef()),
    [childArray],
  )
  const orderRef = useRef(
    Array.from({ length: childArray.length }, (_, index) => index),
  )
  const timelineRef = useRef(null)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)
  const isVisibleRef = useRef(true)
  const isPausedRef = useRef(false)
  const swapRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const total = refs.length

    if (!container || total === 0) return undefined

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const animationConfig =
      easing === 'elastic'
        ? {
            ease: 'elastic.out(0.6,0.9)',
            dropDuration: 1.35,
            moveDuration: 1.35,
            returnDuration: 1.35,
            promoteOverlap: 0.82,
            returnDelay: 0.08,
          }
        : {
            ease: 'power1.inOut',
            dropDuration: 0.72,
            moveDuration: 0.72,
            returnDuration: 0.72,
            promoteOverlap: 0.45,
            returnDelay: 0.2,
          }

    function getDistances() {
      const scale = getResponsiveScale(window.innerWidth)

      return {
        x: cardDistance * scale,
        y: verticalDistance * scale,
      }
    }

    function positionCards() {
      const distances = getDistances()

      orderRef.current.forEach((cardIndex, slotIndex) => {
        const cardRef = refs[cardIndex]

        if (!cardRef.current) return

        placeNow(
          cardRef.current,
          makeSlot(slotIndex, distances.x, distances.y, total),
          reduceMotion ? 0 : skewAmount,
        )
      })
    }

    function clearCycle() {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    function swap() {
      if (
        reduceMotion ||
        orderRef.current.length < 2 ||
        !isVisibleRef.current ||
        isPausedRef.current ||
        document.hidden
      ) {
        return
      }

      const [front, ...rest] = orderRef.current
      const frontElement = refs[front].current

      if (!frontElement) return

      const distances = getDistances()
      const timeline = gsap.timeline()
      const dropDistance = Math.max(320, Number(height) * 1.05 || 420)

      timelineRef.current?.kill()
      timelineRef.current = timeline

      timeline.to(frontElement, {
        y: `+=${dropDistance}`,
        opacity: 0.35,
        duration: animationConfig.dropDuration,
        ease: animationConfig.ease,
      })

      timeline.addLabel(
        'promote',
        `-=${animationConfig.dropDuration * animationConfig.promoteOverlap}`,
      )

      rest.forEach((index, slotIndex) => {
        const element = refs[index].current
        const slot = makeSlot(
          slotIndex,
          distances.x,
          distances.y,
          total,
        )

        if (!element) return

        timeline.set(element, { zIndex: slot.zIndex }, 'promote')
        timeline.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: animationConfig.moveDuration,
            ease: animationConfig.ease,
          },
          `promote+=${slotIndex * 0.11}`,
        )
      })

      const backSlot = makeSlot(
        total - 1,
        distances.x,
        distances.y,
        total,
      )

      timeline.addLabel(
        'return',
        `promote+=${animationConfig.moveDuration * animationConfig.returnDelay}`,
      )
      timeline.call(
        () => {
          gsap.set(frontElement, { zIndex: backSlot.zIndex })
        },
        undefined,
        'return',
      )
      timeline.to(
        frontElement,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          opacity: 1,
          duration: animationConfig.returnDuration,
          ease: animationConfig.ease,
        },
        'return',
      )
      timeline.call(() => {
        orderRef.current = [...rest, front]
      })
    }

    function startCycle() {
      clearCycle()

      if (
        reduceMotion ||
        !isVisibleRef.current ||
        isPausedRef.current ||
        document.hidden
      ) {
        return
      }

      intervalRef.current = window.setInterval(swap, delay)
    }

    swapRef.current = swap
    positionCards()
    startCycle()

    const resizeObserver = new ResizeObserver(() => {
      timelineRef.current?.kill()
      positionCards()
    })
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting

        if (entry.isIntersecting) startCycle()
        else {
          clearCycle()
          timelineRef.current?.pause()
        }
      },
      { rootMargin: '100px' },
    )
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearCycle()
        timelineRef.current?.pause()
      } else {
        timelineRef.current?.play()
        startCycle()
      }
    }
    const pause = () => {
      isPausedRef.current = true
      clearCycle()
      timelineRef.current?.pause()
    }
    const resume = () => {
      isPausedRef.current = false
      timelineRef.current?.play()
      startCycle()
    }

    resizeObserver.observe(container)
    intersectionObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (pauseOnHover) {
      container.addEventListener('mouseenter', pause)
      container.addEventListener('mouseleave', resume)
      container.addEventListener('focusin', pause)
      container.addEventListener('focusout', resume)
    }

    return () => {
      clearCycle()
      timelineRef.current?.kill()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
      container.removeEventListener('mouseenter', pause)
      container.removeEventListener('mouseleave', resume)
      container.removeEventListener('focusin', pause)
      container.removeEventListener('focusout', resume)
      swapRef.current = null
    }
  }, [
    cardDistance,
    delay,
    easing,
    height,
    pauseOnHover,
    refs,
    skewAmount,
    verticalDistance,
  ])

  const renderedChildren = childArray.map((child, index) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: child.key ?? index,
          ref: refs[index],
          style: {
            width,
            height,
            ...(child.props.style ?? {}),
          },
          onClick: (event) => {
            child.props.onClick?.(event)
            onCardClick?.(index)
          },
        })
      : child,
  )

  return (
    <div
      ref={containerRef}
      className={`card-swap-container${className ? ` ${className}` : ''}`}
      style={{ width, height }}
    >
      {renderedChildren}
    </div>
  )
}
