import { aptitudes, competencias } from '../data/portafolio.js'
import BorderGlow from '../components/BorderGlow.jsx'
import CardSwap, { Card } from '../components/CardSwap.jsx'
import LineSidebar from '../components/LineSidebar.jsx'
import './SobreMi.css'

const trayectoriaEducativa = [
  {
    id: 'superior',
    numero: '01',
    categoria: 'Educación Superior',
    titulo: 'Ingeniero en Sistemas Inteligentes',
    institucion: 'Universidad Tecnológica ECOTEC',
    ubicacion: 'Samborondón',
    fecha: 'Guayaquil, 25 de septiembre de 2025',
  },
  {
    id: 'profesion',
    numero: '02',
    categoria: 'Profesión',
    titulo: 'Conductor Profesional (Tipo C)',
    institucion:
      'Conduespol / SPOL — Escuela Superior Politécnica del Litoral',
    ubicacion: 'Guayaquil',
  },
  {
    id: 'secundaria',
    numero: '03',
    categoria: 'Educación Secundaria / Bachillerato',
    titulo: 'Bachillerato en Ciencias',
    institucion: 'Unidad Educativa Dr. Alfredo Raúl Vera Vera',
    ubicacion: 'Guayaquil',
    fecha: 'Guayaquil, 26 de febrero de 2020',
  },
  {
    id: 'primaria',
    numero: '04',
    categoria: 'Educación Primaria',
    titulo: 'Formación primaria',
    institucion: 'Academia Buque Mayor',
    ubicacion: 'Guayaquil',
  },
  {
    id: 'inicial',
    numero: '05',
    categoria: 'Educación Inicial',
    titulo: 'Formación inicial',
    institucion: 'Jardín Naval',
    ubicacion: 'Guayaquil',
  },
]

function EducationIcon({ type }) {
  const commonProps = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    'aria-hidden': true,
  }

  if (type === 'superior') {
    return (
      <svg {...commonProps}>
        <path d="m6 18 18-9 18 9-18 9L6 18Z" />
        <path d="M13 22v9c5.8 5.4 16.2 5.4 22 0v-9" />
        <path d="M42 18v12" />
        <circle cx="42" cy="33" r="2" />
      </svg>
    )
  }

  if (type === 'profesion') {
    return (
      <svg {...commonProps}>
        <circle cx="24" cy="24" r="16" />
        <circle cx="24" cy="24" r="4" />
        <path d="M9 22h11M28 22h11M24 28v12" />
        <path d="M15 15c5.2 3.4 12.8 3.4 18 0" />
      </svg>
    )
  }

  if (type === 'secundaria') {
    return (
      <svg {...commonProps}>
        <path d="M7 11h12a5 5 0 0 1 5 5v23a7 7 0 0 0-7-7H7V11Z" />
        <path d="M41 11H29a5 5 0 0 0-5 5v23a7 7 0 0 1 7-7h10V11Z" />
        <path d="M12 18h7M29 18h7M12 23h7M29 23h7" />
      </svg>
    )
  }

  if (type === 'primaria') {
    return (
      <svg {...commonProps}>
        <path d="m10 35 4-11L31 7l10 10-17 17-11 4-3-3Z" />
        <path d="m27 11 10 10M14 24l10 10M10 35l4 4" />
        <path d="M8 42h32" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M8 28h14v14H8zM26 28h14v14H26zM17 12h14v14H17z" />
      <path d="m24 2 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L24 2Z" />
    </svg>
  )
}

function SobreMi() {
  return (
    <div className="about-page">
      <div className="elder-wand-backdrop" aria-hidden="true">
        <div className="elder-wand-aura elder-wand-aura--violet" />
        <div className="elder-wand-aura elder-wand-aura--blue" />
        <div className="elder-wand-spell elder-wand-spell--one" />
        <div className="elder-wand-spell elder-wand-spell--two" />

        <div className="elder-wand">
          <span className="elder-wand__tip" />
          <span className="elder-wand__shaft" />
          <span className="elder-wand__knot elder-wand__knot--one" />
          <span className="elder-wand__knot elder-wand__knot--two" />
          <span className="elder-wand__knot elder-wand__knot--three" />
          <span className="elder-wand__knot elder-wand__knot--four" />
          <span className="elder-wand__knot elder-wand__knot--five" />
          <span className="elder-wand__knot elder-wand__knot--six" />
          <span className="elder-wand__handle" />
        </div>

        <span className="elder-wand-spark elder-wand-spark--one" />
        <span className="elder-wand-spark elder-wand-spark--two" />
        <span className="elder-wand-spark elder-wand-spark--three" />
        <span className="elder-wand-spark elder-wand-spark--four" />
      </div>

      <section
        className="about-section standalone-page"
        aria-labelledby="titulo-sobre-mi"
      >
        <div className="section-intro about-intro">
          <p className="section-label">Sobre mí</p>
          <h2 id="titulo-sobre-mi">
            Combino código y diseño para crear productos útiles, responsivos
            y dinámicos.
          </h2>

          <div className="about-intro__tags" aria-label="Áreas de enfoque">
            <span>Frontend</span>
            <span>Sistemas inteligentes</span>
            <span>Diseño responsivo</span>
          </div>
        </div>

        <div className="about-content">
          <BorderGlow
            className="about-presentation-glow"
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120f17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            fillOpacity={0.34}
          >
            <div className="about-presentation-copy">
              <p>
                Soy graduado en Ingeniería en Sistemas Inteligentes, con
                habilidades destacadas en diseño y desarrollo de sistemas. Mi
                enfoque proactivo y colaborativo se complementa con experiencia
                en mantenimiento de hardware y programación.
              </p>
              <p>
                Actualmente busco integrarme en una organización dinámica para
                aplicar mis conocimientos, especialmente en el desarrollo de
                páginas web. Mi compromiso con el aprendizaje continuo y mi
                capacidad de adaptación a las últimas tendencias tecnológicas me
                convierten en un candidato versátil, preparado para afrontar
                desafíos de manera integral.
              </p>
            </div>
          </BorderGlow>
        </div>

        <section
          className="education-section"
          aria-labelledby="titulo-trayectoria-educativa"
        >
          <header className="education-heading">
            <p className="education-kicker">Formación y trayectoria</p>
            <h2 id="titulo-trayectoria-educativa">Educación</h2>
            <p>
              Un recorrido por las etapas académicas y profesionales que han
              construido mi formación.
            </p>
          </header>

          <div className="education-swap-stage">
            <CardSwap
              width="min(500px, calc(100vw - 64px))"
              height={430}
              cardDistance={58}
              verticalDistance={54}
              delay={5000}
              pauseOnHover={false}
              skewAmount={4}
              easing="elastic"
            >
              {trayectoriaEducativa.map((etapa) => (
                <Card
                  customClass={`education-card education-card--${etapa.id}`}
                  key={etapa.id}
                >
                  <div className="education-card__top">
                    <span>{etapa.numero}</span>
                    <span>{etapa.ubicacion}</span>
                  </div>

                  <div className="education-card__icon">
                    <EducationIcon type={etapa.id} />
                  </div>

                  <p className="education-card__category">
                    {etapa.categoria}
                  </p>
                  <h3>{etapa.titulo}</h3>

                  <div className="education-card__details">
                    <p>
                      <span>Institución</span>
                      <strong>{etapa.institucion}</strong>
                    </p>

                    {etapa.fecha && (
                      <p>
                        <span>Fecha de obtención</span>
                        <strong>{etapa.fecha}</strong>
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </CardSwap>

            <p className="education-swap-hint">
              La trayectoria avanza automáticamente cada cinco segundos.
            </p>
          </div>
        </section>

        <section
          className="capabilities-section"
          aria-labelledby="titulo-perfil-profesional"
        >
          <header className="capabilities-heading">
            <div>
              <p className="capabilities-kicker">Lo que aporto</p>
              <h2 id="titulo-perfil-profesional">Perfil profesional</h2>
            </div>
            <p>
              Aptitudes humanas y competencias técnicas que aplico para
              desarrollar soluciones claras, funcionales y colaborativas.
            </p>
          </header>

          <div className="capabilities-panel">
            <section
              className="capability-column capability-column--aptitudes"
              data-count={String(aptitudes.length).padStart(2, '0')}
              aria-labelledby="titulo-aptitudes"
            >
              <header className="capability-column__header">
                <div>
                  <span>Perfil humano</span>
                  <h3 id="titulo-aptitudes">Aptitudes</h3>
                </div>
                <strong>{String(aptitudes.length).padStart(2, '0')}</strong>
              </header>
              <LineSidebar
                items={aptitudes}
                accentColor="#a855f7"
                textColor="#d0d0d0"
                markerColor="#5f5f63"
                proximityRadius={105}
                maxShift={28}
                markerLength={48}
                tickScale={0.45}
                itemGap={20}
                fontSize={1}
                smoothing={110}
                defaultActive={0}
                ariaLabel="Aptitudes profesionales"
              />
            </section>

            <section
              className="capability-column capability-column--competencias"
              data-count={String(competencias.length).padStart(2, '0')}
              aria-labelledby="titulo-competencias"
            >
              <header className="capability-column__header">
                <div>
                  <span>Perfil técnico</span>
                  <h3 id="titulo-competencias">Competencias</h3>
                </div>
                <strong>{String(competencias.length).padStart(2, '0')}</strong>
              </header>
              <LineSidebar
                items={competencias}
                accentColor="#38bdf8"
                textColor="#d0d0d0"
                markerColor="#5f5f63"
                proximityRadius={105}
                maxShift={28}
                markerLength={48}
                tickScale={0.45}
                itemGap={20}
                fontSize={1}
                smoothing={110}
                defaultActive={0}
                ariaLabel="Competencias técnicas"
              />
            </section>
          </div>
        </section>
      </section>
    </div>
  )
}

export default SobreMi
