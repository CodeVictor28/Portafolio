import { useCallback, useRef, useState } from 'react'
import ElectricBorder from '../components/ElectricBorder.jsx'
import './Certificados.css'

const certificados = [
  {
    id: 'aba-a1',
    numero: '01',
    institucion: 'ABA English',
    titulo: 'Beginner A1',
    categoria: 'Idioma inglés',
    fecha: '17 de julio de 2026',
    duracion: 'Nivel A1 · 1.172 palabras',
    descripcion:
      'Certificación del nivel inicial de inglés conforme al Marco Común Europeo de Referencia para las Lenguas.',
    imagen: '/certificados/aba-english-beginner-a1.png',
    documento: '/certificados/aba-english-beginner-a1.pdf',
    enlace: 'https://surl.li/uvmuvz',
    enlaceTexto: 'Conocer certificación',
    accent: '20 184 214',
    electricColor: '#14b8d6',
    formato: 'portrait',
  },
  {
    id: 'platzi-python',
    numero: '02',
    institucion: 'Platzi',
    titulo: 'Fundamentos de Python',
    categoria: 'Programación',
    fecha: '21 de mayo de 2026',
    duracion: '16 horas de teoría y práctica',
    descripcion:
      'Curso orientado a los fundamentos del lenguaje Python, su sintaxis y la resolución de problemas mediante programación.',
    imagen: '/certificados/platzi-fundamentos-python.png',
    documento: '/certificados/platzi-fundamentos-python.pdf',
    enlace: 'https://surl.li/jrddii',
    enlaceTexto: 'Abrir credencial',
    accent: '45 197 32',
    electricColor: '#2dc520',
    formato: 'landscape',
  },
  {
    id: 'udemy-web',
    numero: '03',
    institucion: 'Udemy',
    titulo: 'Desarrollador Web desde cero Paso a Paso',
    categoria: 'Desarrollo web',
    fecha: '19 de octubre de 2023',
    duracion: '104,5 horas de formación',
    descripcion:
      'Formación integral en desarrollo web impartida por Gilbert Rodríguez, desde los conceptos iniciales hasta la construcción de proyectos.',
    imagen: '/certificados/udemy-desarrollador-web.png',
    documento: '/certificados/udemy-desarrollador-web.pdf',
    enlace:
      'https://www.udemy.com/certificate/UC-df5323c2-79de-4225-8c6d-92e54fe9e3d6/',
    enlaceTexto: 'Validar credencial',
    accent: '168 85 247',
    electricColor: '#dc51ff',
    formato: 'landscape',
  },
]

function ExternalArrow() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M5 13 13 5M7 5h6v6" />
    </svg>
  )
}

function VerticalArrow({ direction }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={direction === 'up' ? 'm5 12 5-5 5 5' : 'm5 8 5 5 5-5'} />
    </svg>
  )
}

function CertificateCard({ certificado }) {
  return (
    <ElectricBorder
      className="certificate-electric-border"
      color={certificado.electricColor}
      speed={0.8}
      chaos={0.1}
      thickness={1.5}
      borderRadius={28}
      style={{ '--certificate-accent': certificado.accent }}
    >
      <article className="certificate-card">
        <a
          className={`certificate-preview certificate-preview--${certificado.formato}`}
          href={certificado.documento}
          target="_blank"
          rel="noreferrer"
          aria-label={`Ver certificado ${certificado.titulo} en PDF`}
        >
          <img
            src={certificado.imagen}
            alt={`Vista previa del certificado ${certificado.titulo} emitido por ${certificado.institucion}`}
          />
          <span className="certificate-preview-number" aria-hidden="true">
            {certificado.numero}
          </span>
          <span className="certificate-preview-action">
            Ver documento <ExternalArrow />
          </span>
        </a>

        <div className="certificate-card-body">
          <div className="certificate-card-heading">
            <span>{certificado.institucion}</span>
            <span>{certificado.categoria}</span>
          </div>

          <h2>{certificado.titulo}</h2>
          <p>{certificado.descripcion}</p>

          <dl className="certificate-details">
            <div>
              <dt>Emitido</dt>
              <dd>{certificado.fecha}</dd>
            </div>
            <div>
              <dt>Formación</dt>
              <dd>{certificado.duracion}</dd>
            </div>
          </dl>

          <div className="certificate-actions">
            <a
              className="certificate-action certificate-action--primary"
              href={certificado.enlace}
              target="_blank"
              rel="noopener noreferrer"
            >
              {certificado.enlaceTexto} <ExternalArrow />
            </a>
            <a
              className="certificate-action certificate-action--secondary"
              href={certificado.documento}
              target="_blank"
              rel="noreferrer"
            >
              Abrir PDF
            </a>
          </div>
        </div>
      </article>
    </ElectricBorder>
  )
}

function Certificados() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState('next')
  const touchStartY = useRef(null)
  const certificado = certificados[activeIndex]

  const selectCertificate = useCallback(
    (nextIndex) => {
      if (nextIndex === activeIndex) return
      setDirection(nextIndex > activeIndex ? 'next' : 'previous')
      setActiveIndex(nextIndex)
    },
    [activeIndex],
  )

  const moveCertificate = useCallback((step) => {
    setDirection(step > 0 ? 'next' : 'previous')
    setActiveIndex(
      (current) => (current + step + certificados.length) % certificados.length,
    )
  }, [])

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault()
      moveCertificate(1)
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault()
      moveCertificate(-1)
    }
  }

  function handleTouchStart(event) {
    touchStartY.current = event.changedTouches[0]?.clientY ?? null
  }

  function handleTouchEnd(event) {
    if (touchStartY.current === null) return
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current
    const distance = touchStartY.current - endY
    touchStartY.current = null

    if (Math.abs(distance) > 52) moveCertificate(distance > 0 ? 1 : -1)
  }

  return (
    <main className="certificates-page">
      <div className="certificates-background" aria-hidden="true">
        <span className="certificate-seal certificate-seal--one" />
        <span className="certificate-seal certificate-seal--two" />
        <span className="certificate-guilloche" />
      </div>

      <div className="certificates-shell">
        <section className="certificates-hero" aria-labelledby="titulo-certificados">
          <div className="certificates-heading">
            <p className="certificates-kicker">
              <span aria-hidden="true">✦</span>
              Aprendizaje continuo
            </p>
            <h1 id="titulo-certificados">
              Credenciales que respaldan mi <em>evolución.</em>
            </h1>
          </div>

          <div className="certificates-intro">
            <p>
              Una selección de formaciones en desarrollo web, programación e
              inglés que complementan mi perfil profesional.
            </p>

            <div className="certificates-metrics" aria-label="Resumen de certificados">
              <span>
                <strong>03</strong>
                credenciales
              </span>
              <span>
                <strong>03</strong>
                instituciones
              </span>
            </div>
          </div>
        </section>

        <section className="certificate-showcase" aria-labelledby="coleccion-certificados">
          <header className="certificate-showcase-heading">
            <div>
              <span className="certificate-showcase-eyebrow">Archivo verificado</span>
              <h2 id="coleccion-certificados">Colección de certificados</h2>
            </div>
            <p>
              Usa los controles, las flechas del teclado o desliza verticalmente.
            </p>
          </header>

          <div
            className="certificate-carousel"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Carrusel vertical de certificados"
            tabIndex="0"
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              key={certificado.id}
              className={`certificate-stage certificate-stage--${direction}`}
            >
              <CertificateCard certificado={certificado} />
            </div>

            <nav className="certificate-carousel-nav" aria-label="Seleccionar certificado">
              <button
                className="certificate-carousel-arrow"
                type="button"
                onClick={() => moveCertificate(-1)}
                aria-label="Ver certificado anterior"
              >
                <VerticalArrow direction="up" />
              </button>

              <div className="certificate-carousel-pages">
                {certificados.map((item, index) => (
                  <button
                    key={item.id}
                    className={index === activeIndex ? 'is-active' : ''}
                    type="button"
                    onClick={() => selectCertificate(index)}
                    aria-label={`Ver ${item.titulo}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                  >
                    <span>{item.numero}</span>
                    <span>{item.institucion}</span>
                  </button>
                ))}
              </div>

              <button
                className="certificate-carousel-arrow"
                type="button"
                onClick={() => moveCertificate(1)}
                aria-label="Ver certificado siguiente"
              >
                <VerticalArrow direction="down" />
              </button>
            </nav>

            <p className="visually-hidden" aria-live="polite">
              Certificado {activeIndex + 1} de {certificados.length}: {certificado.titulo}
            </p>
          </div>
        </section>

        <aside className="certificates-note">
          <span className="certificates-note-icon" aria-hidden="true">✓</span>
          <div>
            <strong>Documentos disponibles</strong>
            <p>
              Cada credencial incluye su certificado original en PDF y el enlace
              externo asociado a la institución que lo emitió.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Certificados
