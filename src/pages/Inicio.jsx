import { lazy, Suspense, useState } from 'react'
import PortfolioButton from '../components/PortafolioButton.jsx'
import ShinyText from '../components/ShinyText.jsx'
import { perfil, redes } from '../data/portafolio.js'

const Dock = lazy(() => import('../components/Dock.jsx'))

const RUTA_FOTO_PERFIL = '/perfil.jpg'
const ICONOS_REDES = {
  GitHub: '/social/github.svg',
  LinkedIn: '/social/linkedin.svg',
  Discord: '/social/discord.svg',
}
const ANIMACION_BOTONES = {
  baseColor: '#171717',
  lineColor: '#f2f2ef',
  intensity: 1,
  shineSize: 10,
  shineFade: 40,
  thickness: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: true,
}

function Inicio() {
  const [fotoDisponible, setFotoDisponible] = useState(true)

  return (
    <div className="home-page">
      <div className="moonlit-backdrop" aria-hidden="true">
        <div className="moonlit-stars moonlit-stars--near"></div>
        <div className="moonlit-stars moonlit-stars--far"></div>

        <span className="shooting-star shooting-star--one"></span>
        <span className="shooting-star shooting-star--two"></span>
        <span className="shooting-star shooting-star--three"></span>
      </div>

      <section className="hero-section" aria-labelledby="titulo-inicio">
        <div className="photo-column">
          <div className="moon-orbit" aria-hidden="true">
            <div className="moon">
              <span className="moon__crater moon__crater--one"></span>
              <span className="moon__crater moon__crater--two"></span>
              <span className="moon__crater moon__crater--three"></span>
              <span className="moon__crater moon__crater--four"></span>
            </div>
          </div>

          <div className="photo-frame">
            {fotoDisponible ? (
              <img
                className="profile-photo"
                src={RUTA_FOTO_PERFIL}
                alt={`Retrato de ${perfil.nombre}`}
                width="659"
                height="879"
                decoding="async"
                fetchPriority="high"
                onError={() => setFotoDisponible(false)}
              />
            ) : (
              <div
                className="photo-placeholder"
                role="img"
                aria-label="Espacio reservado para tu fotografía"
              >
                <span>V</span>
                <p>Tu foto aquí</p>
              </div>
            )}
  
            <div className="location-badge">
              <img
                className="location-flag"
                src="/social/ecuador.svg"
                alt=""
                width="24"
                height="16"
                decoding="async"
                aria-hidden="true"
              />
              {perfil.ubicacion}
            </div>
          </div>
        </div>
  
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="availability-dot"></span>
            Disponible para nuevos proyectos
          </p>
  
          <h1 id="titulo-inicio">
            <ShinyText
              text={
                <>
                  Hola, soy {perfil.nombre}. Creo experiencias <em>digitales.</em>
                </>
              }
              speed={2}
              delay={0}
              color="#f4f4f2"
              shineColor="#b76cff"
              spread={110}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
            />
          </h1>
  
          <p className="hero-description">
            {perfil.rol}. {perfil.descripcion}
          </p>
  
          <div className="hero-actions">
            <PortfolioButton {...ANIMACION_BOTONES} to="/experiencia">
              Ver experiencia <span aria-hidden="true">→</span>
            </PortfolioButton>
            <PortfolioButton {...ANIMACION_BOTONES} to="/contacto">
              Contáctame →
            </PortfolioButton>
            <PortfolioButton
              {...ANIMACION_BOTONES}
              to="/proyectos"
            >
              Proyectos Personales →
            </PortfolioButton>
          </div>
  
          <div className="social-dock">
            <Suspense
              fallback={<div className="dock-loading" aria-hidden="true" />}
            >
              <Dock
                items={redes.map((red) => ({
                  id: red.id,
                  label: red.nombre,
                  href: red.url,
                  className: `dock-item--${red.nombre.toLowerCase()}`,
                  icon: (
                    <img
                      className="dock-social-logo"
                      src={ICONOS_REDES[red.nombre]}
                      alt=""
                      width="32"
                      height="32"
                      decoding="async"
                      aria-hidden="true"
                    />
                  ),
                }))}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
              />
            </Suspense>
          </div>
        </div>
  
      </section>
    </div>
  )
}

export default Inicio
