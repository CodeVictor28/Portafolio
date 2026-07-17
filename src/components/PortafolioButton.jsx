import { Link } from 'react-router'
import SpecularButton from './SpecularButton.jsx'

const apariencia = {
  size: 'lg',
  radius: 18,
  tint: '#ffffff',
  tintOpacity: 0,
  blur: 0,
  textColor: '#f5f5f5',
  lineColor: '#ffffff',
  baseColor: '#525252',
  intensity: 1,
  shineSize: 10,
  shineFade: 40,
  thickness: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: false,
}

function PortfolioButton({
  children,
  to,
  href,
  newTab = false,
  ...props
}) {
  const destinationProps = to
    ? {
        as: Link,
        to,
        target: newTab ? '_blank' : undefined,
        rel: newTab ? 'noreferrer' : undefined,
      }
    : href
      ? {
          as: 'a',
          href,
          target: newTab ? '_blank' : undefined,
          rel: newTab ? 'noreferrer' : undefined,
        }
      : {}

  return (
    <SpecularButton
      {...apariencia}
      {...destinationProps}
      {...props}
    >
      {children}
    </SpecularButton>
  )
}

export default PortfolioButton
