import './ShinyText.css'

function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  direction = 'left',
  delay = 0,
}) {
  return (
    <span
      className={`shiny-text${disabled ? ' shiny-text--disabled' : ''}${direction === 'right' ? ' shiny-text--right' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--shine-color': color,
        '--shine-highlight': shineColor,
        '--shine-angle': `${spread}deg`,
        '--shine-duration': `${Math.max(4, speed * 2.5)}s`,
        '--shine-delay': `${Math.max(0, delay)}s`,
      }}
    >
      {text}
    </span>
  )
}

export default ShinyText
