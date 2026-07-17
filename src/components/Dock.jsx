import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import './Dock.css'

function DockItem({
  className = '',
  href,
  icon,
  label,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  reduceMotion,
}) {
  const itemRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const mouseDistance = useTransform(mouseX, (value) => {
    const rect = itemRef.current?.getBoundingClientRect()

    if (!rect) return Infinity

    return value - rect.x - rect.width / 2
  })
  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  )
  const animatedSize = useSpring(targetSize, spring)
  const size = reduceMotion ? baseItemSize : animatedSize

  return (
    <motion.a
      ref={itemRef}
      data-dock-label={label}
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ width: size, height: size }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`dock-item${className ? ` ${className}` : ''}`}
      aria-label={`Abrir ${label}`}
    >
      <span className="dock-icon">{icon}</span>

      <AnimatePresence>
        {isHovered && !reduceMotion && (
          <motion.span
            initial={{ opacity: 0, y: 4, x: '-50%' }}
            animate={{ opacity: 1, y: -6, x: '-50%' }}
            exit={{ opacity: 0, y: 4, x: '-50%' }}
            transition={{ duration: 0.18 }}
            className="dock-label"
            role="tooltip"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <span className="dock-mobile-label" aria-hidden="true">
        {label}
      </span>
    </motion.a>
  )
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 112,
  baseItemSize = 50,
}) {
  const mouseX = useMotionValue(Infinity)
  const isHovered = useMotionValue(0)
  const reduceMotion = useReducedMotion()
  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [dockHeight, magnification],
  )
  const heightTarget = useTransform(
    isHovered,
    [0, 1],
    [panelHeight + 22, maxHeight],
  )
  const animatedHeight = useSpring(heightTarget, spring)
  const height = reduceMotion ? panelHeight + 22 : animatedHeight

  return (
    <motion.div
      className="dock-outer"
      style={{
        height,
        '--dock-panel-height': `${panelHeight}px`,
        '--dock-base-size': `${baseItemSize}px`,
      }}
    >
      <motion.div
        onPointerMove={({ clientX, pointerType }) => {
          if (pointerType === 'touch' || reduceMotion) return

          isHovered.set(1)
          mouseX.set(clientX)
        }}
        onPointerLeave={() => {
          isHovered.set(0)
          mouseX.set(Infinity)
        }}
        className={`dock-panel${className ? ` ${className}` : ''}`}
        style={{ minHeight: panelHeight }}
        role="toolbar"
        aria-label="Redes sociales"
      >
        {items.map((item) => (
          <DockItem
            key={item.id ?? item.label}
            className={item.className}
            href={item.href}
            icon={item.icon}
            label={item.label}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            reduceMotion={reduceMotion}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
