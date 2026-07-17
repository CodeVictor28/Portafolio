import { perfil } from '../data/portafolio.js'

function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} {perfil.nombre}. Portafolio personal.</p>
    </footer>
  )
}

export default Footer
