import { useState } from 'react'
import './FlippingCard.css'

function FlippingCard({
  frontContent,
  backContent,
  width = 360,
  height = 450,
  className = '',
  label = 'Voltear tarjeta',
  disabled = false,
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardWidth = typeof width === 'number' ? `${width}px` : width
  const cardHeight = typeof height === 'number' ? `${height}px` : height

  function toggleCard(event) {
    if (disabled) return
    if (event.target.closest('a, button')) return
    setIsFlipped((current) => !current)
  }

  function handleKeyDown(event) {
    if (disabled) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    setIsFlipped((current) => !current)
  }

  return (
    <div
      className={`flipping-card${isFlipped ? ' is-flipped' : ''}${disabled ? ' is-disabled' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--flipping-card-width': cardWidth,
        '--flipping-card-height': cardHeight,
      }}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? -1 : 0}
      aria-label={disabled ? undefined : label}
      aria-pressed={disabled ? undefined : isFlipped}
      onClick={toggleCard}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className="flipping-card__inner">
        <div className="flipping-card__face flipping-card__face--front">
          {frontContent}
        </div>
        <div className="flipping-card__face flipping-card__face--back">
          {backContent}
        </div>
      </div>
    </div>
  )
}

export { FlippingCard }
