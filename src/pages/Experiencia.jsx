import { useEffect, useRef } from 'react'
import { experiencias } from '../data/portafolio.js'
import './Experiencia.css'

function Experiencia() {
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fadeElements = [
      ...document.querySelectorAll(
        '.experience-journal__heading, .experience-story, .experience-closing',
      ),
    ]
    let frameId = 0

    const setRestingState = () => {
      hero.style.setProperty('--experience-hero-opacity', '1')
      hero.style.setProperty('--experience-hero-shift', '0px')
      hero.style.setProperty('--experience-hero-blur', '0px')
      hero.style.setProperty('--experience-hero-scale', '1')

      fadeElements.forEach((element) => {
        element.style.setProperty('--experience-block-opacity', '1')
        element.style.setProperty('--experience-block-shift', '0px')
        element.style.setProperty('--experience-block-blur', '0px')
        element.style.setProperty('--experience-block-scale', '1')
      })
    }

    const updateFade = () => {
      frameId = 0

      if (reducedMotion.matches) {
        setRestingState()
        return
      }

      const heroTop = hero.getBoundingClientRect().top + window.scrollY
      const fadeStart = Math.max(heroTop - 104, 0)
      const fadeDistance = Math.max(hero.offsetHeight * 0.72, 1)
      const progress = Math.min(
        Math.max((window.scrollY - fadeStart) / fadeDistance, 0),
        1,
      )
      const easedProgress = progress * progress * (3 - 2 * progress)

      hero.style.setProperty(
        '--experience-hero-opacity',
        (1 - easedProgress).toFixed(3),
      )
      hero.style.setProperty(
        '--experience-hero-shift',
        `${(-34 * easedProgress).toFixed(2)}px`,
      )
      hero.style.setProperty(
        '--experience-hero-blur',
        `${(7 * easedProgress).toFixed(2)}px`,
      )
      hero.style.setProperty(
        '--experience-hero-scale',
        (1 - 0.18 * easedProgress).toFixed(4),
      )

      const viewportHeight = window.innerHeight
      const exitLine = Math.min(104, viewportHeight * 0.14)

      fadeElements.forEach((element) => {
        let elementTop = 0
        let offsetNode = element

        while (offsetNode) {
          elementTop += offsetNode.offsetTop
          offsetNode = offsetNode.offsetParent
        }

        const elementHeight = element.offsetHeight
        const elementBottom = elementTop + elementHeight - window.scrollY
        const fadeDistance = Math.max(
          Math.min(elementHeight * 0.55, viewportHeight * 0.42),
          90,
        )
        const fadeStart = exitLine + fadeDistance
        const blockProgress = Math.min(
          Math.max((fadeStart - elementBottom) / fadeDistance, 0),
          1,
        )
        const easedBlockProgress =
          blockProgress * blockProgress * (3 - 2 * blockProgress)

        element.style.setProperty(
          '--experience-block-opacity',
          (1 - easedBlockProgress).toFixed(3),
        )
        element.style.setProperty(
          '--experience-block-shift',
          `${(-24 * easedBlockProgress).toFixed(2)}px`,
        )
        element.style.setProperty(
          '--experience-block-blur',
          `${(6 * easedBlockProgress).toFixed(2)}px`,
        )
        element.style.setProperty(
          '--experience-block-scale',
          (1 - 0.14 * easedBlockProgress).toFixed(4),
        )
      })
    }

    const requestFadeUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateFade)
    }

    setRestingState()
    updateFade()
    window.addEventListener('scroll', requestFadeUpdate, { passive: true })
    window.addEventListener('resize', requestFadeUpdate)
    reducedMotion.addEventListener('change', requestFadeUpdate)

    return () => {
      window.removeEventListener('scroll', requestFadeUpdate)
      window.removeEventListener('resize', requestFadeUpdate)
      reducedMotion.removeEventListener('change', requestFadeUpdate)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <main className="experience-page">
      <div className="experience-backdrop" aria-hidden="true">
        <span className="experience-backdrop__grid" />
        <span className="experience-backdrop__glow" />
      </div>

      <section
        className="experience-hero"
        aria-labelledby="titulo-experiencia"
        ref={heroRef}
      >
        <div className="experience-hero__stage">
          <div className="experience-hero__copy">
            <p className="experience-kicker">
              <span>Archivo profesional</span>
              <span>{String(experiencias.length).padStart(2, '0')} etapas</span>
            </p>

            <h1 id="titulo-experiencia">
              Experiencia que conecta <em>lo digital</em> con lo práctico.
            </h1>

            <p className="experience-hero__lead">
              Mi trayectoria reúne desarrollo web y soporte informático: dos áreas
              donde la atención al detalle convierte necesidades concretas en
              soluciones funcionales.
            </p>
          </div>

          <aside className="experience-hero__index" aria-label="Resumen de experiencia">
            <div className="experience-hero__index-count">
              <span>Registro</span>
              <strong>{String(experiencias.length).padStart(2, '0')}</strong>
            </div>
            <div className="experience-hero__index-detail">
              <div>
                <span>2024</span>
                <i aria-hidden="true" />
                <span>2026</span>
              </div>
              <p>Desarrollo web · Soporte TI</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="experience-journal" aria-labelledby="titulo-trayectoria">
        <header className="experience-journal__heading">
          <div>
            <span>Trayectoria verificada</span>
            <h2 id="titulo-trayectoria">Experiencia laboral</h2>
          </div>
          <p>
            Un recorrido por las responsabilidades, herramientas y aprendizajes
            que han fortalecido mi perfil profesional.
          </p>
        </header>

        <div className="experience-rail">
          {experiencias.map((experiencia, index) => (
            <article
              className={`experience-story ${index % 2 === 1 ? 'is-reversed' : ''}`}
              key={experiencia.id}
            >
              <div className="experience-story__marker" aria-hidden="true">
                <span>{experiencia.numero}</span>
              </div>

              <figure className="experience-story__visual">
                <img
                  src={experiencia.imagen}
                  alt={experiencia.imagenAlt}
                  width="1440"
                  height="960"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span>{experiencia.anio}</span>
                  <span>{experiencia.empresa}</span>
                </figcaption>
              </figure>

              <div className="experience-story__content">
                <p className="experience-story__company">{experiencia.empresa}</p>
                <h3>{experiencia.puesto}</h3>

                <dl className="experience-story__meta">
                  <div>
                    <dt>Ubicación</dt>
                    <dd>{experiencia.ubicacion}</dd>
                  </div>
                  <div>
                    <dt>Periodo</dt>
                    <dd>{experiencia.periodo}</dd>
                  </div>
                </dl>

                <p className="experience-story__description">
                  {experiencia.descripcion}
                </p>

                <div className="experience-story__skills" aria-label="Competencias aplicadas">
                  {experiencia.tecnologias.map((tecnologia) => (
                    <span key={tecnologia}>{tecnologia}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="experience-closing" aria-label="Resumen profesional">
        <p>Dos contextos, una misma forma de trabajar:</p>
        <strong>analizar · implementar · resolver</strong>
      </section>
    </main>
  )
}

export default Experiencia
