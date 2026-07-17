import { useCallback, useRef, useState } from 'react'
import { FlippingCard } from '../components/FlippingCard.jsx'
import './RedesSociales.css'

const redesSociales = [
  {
    id: 1,
    nombre: 'Facebook',
    clase: 'facebook',
    icono: '/social/facebook.svg',
    url: 'https://www.facebook.com/people/Victor-Ledesma-Vega/pfbid0rJNrUQnDszaoYZQ7d7wWmmRaMnvGgxCJmo2ruM6YMvguCSJ1EwQnSfDyBae5VRJRl/',
    etiqueta: 'Comunidad y novedades',
    descripcion:
      'Publicaciones, novedades y un espacio para mantenernos conectados.',
    detalle:
      'Sígueme en Facebook para descubrir actualizaciones, compartir intereses y mantener una conversación cercana.',
    color: '24 119 242',
  },
  {
    id: 2,
    nombre: 'X',
    clase: 'x',
    icono: '/social/x.svg',
    url: 'https://x.com/',
    etiqueta: 'Ideas en tiempo real',
    descripcion:
      'Pensamientos breves, tecnología y conversaciones sobre el mundo digital.',
    detalle:
      'Encuentra ideas rápidas, recursos de tecnología y comentarios sobre las tendencias que transforman la web.',
    color: '238 238 235',
  },
  {
    id: 3,
    nombre: 'Instagram',
    clase: 'instagram',
    icono: '/social/instagram.svg',
    url: 'https://www.instagram.com/victorlv_28/',
    etiqueta: 'Contenido visual',
    descripcion:
      'Una mirada más visual a proyectos, procesos creativos y momentos cotidianos.',
    detalle:
      'Explora contenido visual, avances de proyectos y parte del proceso creativo detrás de cada experiencia digital.',
    color: '225 48 108',
  },
  {
    id: 4,
    nombre: 'LinkedIn',
    clase: 'linkedin',
    icono: '/social/linkedin.svg',
    url: 'https://www.linkedin.com/in/v%C3%ADctor-ledesma-vega-46660826a',
    etiqueta: 'Perfil profesional',
    descripcion:
      'Experiencia, formación y conexiones dentro del mundo tecnológico.',
    detalle:
      'Conoce mi trayectoria, certificaciones y proyectos mientras construimos una conexión profesional.',
    color: '10 102 194',
  },
  {
    id: 5,
    nombre: 'Discord',
    clase: 'discord',
    icono: '/social/discord.svg',
    url: 'https://discord.gg/DXwngfxH8',
    etiqueta: 'Contacto directo',
    descripcion:
      'Un espacio para conversar sobre colaboraciones, ideas y desarrollo web.',
    detalle:
      'Únete a Discord para conversar directamente sobre desarrollo web, propuestas de colaboración o nuevas ideas.',
    color: '88 101 242',
  },
]

function CarouselArrow({ direction }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === 'left' ? 'm12.5 5-5 5 5 5' : 'm7.5 5 5 5-5 5'} />
    </svg>
  )
}

function SocialCardFront({ red, numero }) {
  return (
    <div className="social-card-face social-card-front">
      <div className="social-card-meta">
        <span>{numero}</span>
        <span aria-hidden="true">↗</span>
      </div>

      <div className="social-card-logo">
        <img
          src={red.icono}
          alt=""
          width="72"
          height="72"
          decoding="async"
          aria-hidden="true"
        />
      </div>

      <div className="social-card-copy">
        <span>{red.etiqueta}</span>
        <h2>{red.nombre}</h2>
        <p>{red.descripcion}</p>
      </div>

      <span className="social-card-flip-hint" aria-hidden="true">
        Ver detalles <span>↻</span>
      </span>
    </div>
  )
}

function SocialCardBack({ red, active }) {
  return (
    <div className="social-card-face social-card-back">
      <div className="social-card-back-logo">
        <img src={red.icono} alt="" width="54" height="54" aria-hidden="true" />
      </div>
      <span>{red.etiqueta}</span>
      <h2>Conectemos en {red.nombre}</h2>
      <p>{red.detalle}</p>
      <a
        href={red.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={active ? 0 : -1}
        onClick={(event) => event.stopPropagation()}
      >
        Visitar {red.nombre} <span aria-hidden="true">↗</span>
      </a>
      <small>Activa nuevamente la tarjeta para regresar</small>
    </div>
  )
}

function getRelativePosition(index, activeIndex) {
  let position = index - activeIndex
  const half = Math.floor(redesSociales.length / 2)

  if (position > half) position -= redesSociales.length
  if (position < -half) position += redesSociales.length
  return position
}

function RedesSociales() {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef(null)

  const moveCarousel = useCallback((step) => {
    setActiveIndex(
      (current) =>
        (current + step + redesSociales.length) % redesSociales.length,
    )
  }, [])

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveCarousel(1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveCarousel(-1)
    }
  }

  function handleTouchStart(event) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = touchStartX.current - endX
    touchStartX.current = null

    if (Math.abs(distance) > 52) moveCarousel(distance > 0 ? 1 : -1)
  }

  return (
    <main className="networks-page">
      <div className="networks-page-backdrop" aria-hidden="true">
        <span className="network-ambient network-ambient--facebook" />
        <span className="network-ambient network-ambient--instagram" />
        <span className="network-ambient network-ambient--discord" />
      </div>

      <section className="networks-intro" aria-labelledby="titulo-redes">
        <div className="networks-intro-copy">
          <p className="networks-kicker">
            <span aria-hidden="true" />
            Conectemos
          </p>
          <h1 id="titulo-redes">
            Encuéntrame en el lado <em>social</em> de la web.
          </h1>
          <p className="networks-lead">
            Elige la plataforma que prefieras para conocer más sobre mí,
            seguir mis novedades o conversar directamente.
          </p>

          <div className="networks-summary" aria-label="Resumen de redes sociales">
            <span><strong>05</strong> plataformas</span>
            <span><strong>01</strong> punto de conexión</span>
          </div>
        </div>

        <div className="network-constellation" aria-hidden="true">
          <span className="network-orbit network-orbit--outer" />
          <span className="network-orbit network-orbit--inner" />

          <span className="network-signal network-signal--one" />
          <span className="network-signal network-signal--two" />
          <span className="network-signal network-signal--three" />
          <span className="network-signal network-signal--four" />
          <span className="network-signal network-signal--five" />

          <div className="network-hub">
            <span>VL</span>
            <small><i /> conectado</small>
          </div>

          {redesSociales.map((red) => (
            <div
              className={`network-node network-node--${red.clase}`}
              style={{ '--network-color': red.color }}
              key={`hero-${red.id}`}
            >
              <img src={red.icono} alt="" width="34" height="34" />
              <span>{red.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="networks-carousel-section" aria-labelledby="titulo-carrusel-redes">
        <header className="networks-carousel-heading">
          <div>
            <span>Mis canales</span>
            <h2 id="titulo-carrusel-redes">Selecciona una red social</h2>
          </div>
          <p>Selecciona una tarjeta lateral y activa la central para ver sus detalles.</p>
        </header>

        <div
          className="social-carousel"
          role="region"
          aria-roledescription="carrusel"
          aria-label="Carrusel de redes sociales"
          tabIndex="0"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="social-carousel-stage">
            {redesSociales.map((red, index) => {
              const position = getRelativePosition(index, activeIndex)
              const active = position === 0
              const positionClass =
                position === 0
                  ? 'is-active'
                  : `is-${position < 0 ? 'left' : 'right'}-${Math.abs(position)}`

              return (
                <div
                  className={`social-carousel-slide ${positionClass}`}
                  style={{ '--network-color': red.color }}
                  key={red.id}
                  role={active ? 'group' : 'button'}
                  aria-roledescription={active ? 'diapositiva' : undefined}
                  aria-label={active ? `${red.nombre}, tarjeta activa` : `Mostrar ${red.nombre}`}
                  tabIndex={active ? -1 : 0}
                  onClick={() => {
                    if (!active) setActiveIndex(index)
                  }}
                  onKeyDown={(event) => {
                    if (active || (event.key !== 'Enter' && event.key !== ' ')) return
                    event.preventDefault()
                    setActiveIndex(index)
                  }}
                >
                  <FlippingCard
                    width="100%"
                    height="100%"
                    disabled={!active}
                    label={`Voltear tarjeta de ${red.nombre}`}
                    frontContent={
                      <SocialCardFront
                        red={red}
                        numero={String(index + 1).padStart(2, '0')}
                      />
                    }
                    backContent={<SocialCardBack red={red} active={active} />}
                  />
                </div>
              )
            })}
          </div>

          <div className="social-carousel-controls">
            <button
              type="button"
              onClick={() => moveCarousel(-1)}
              aria-label="Mostrar red social anterior"
            >
              <CarouselArrow direction="left" />
            </button>

            <div className="social-carousel-indicators" aria-label="Seleccionar red social">
              {redesSociales.map((red, index) => (
                <button
                  type="button"
                  className={index === activeIndex ? 'is-active' : ''}
                  key={red.id}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Mostrar ${red.nombre}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => moveCarousel(1)}
              aria-label="Mostrar red social siguiente"
            >
              <CarouselArrow direction="right" />
            </button>
          </div>

          <p className="visually-hidden" aria-live="polite">
            {redesSociales[activeIndex].nombre}, tarjeta {activeIndex + 1} de{' '}
            {redesSociales.length}
          </p>
        </div>
      </section>
    </main>
  )
}

export default RedesSociales
