import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import GooeyNav from './GooeyNav.jsx'

const enlaces = [
  { id: 1, label: 'Inicio', href: '/', exacto: true },
  { id: 2, label: 'Sobre mí', href: '/sobre-mi' },
  { id: 3, label: 'Certificados', href: '/certificados' },
  { id: 4, label: 'Redes Sociales', href: '/redes-sociales' },
]

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const esInicio = pathname === '/'
  const indiceActivo = Math.max(
    0,
    enlaces.findIndex((enlace) =>
      enlace.exacto
        ? pathname === enlace.href
        : pathname.startsWith(enlace.href),
    ),
  )

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  return (
    <header className={`site-header ${esInicio ? 'site-header--home' : ''}`}>
      <div className="header-inner">
        <Link className="brand" to="/" onClick={cerrarMenu} aria-label="Ir al inicio">
          Victor Ledesma Vega<span>.</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-controls="menu-principal"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <span></span>
          <span></span>
          <span></span>
          <span className="visually-hidden">Abrir o cerrar menú</span>
        </button>

        <div
          className={`main-nav ${menuAbierto ? 'is-open' : ''}`}
          id="menu-principal"
        >
          <GooeyNav
            items={enlaces}
            activeIndex={indiceActivo}
            particleCount={6}
            particleDistances={[28, 6]}
            particleR={42}
            animationTime={420}
            timeVariance={140}
            colors={[1, 2, 2, 3, 3, 4]}
            onNavigate={cerrarMenu}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
