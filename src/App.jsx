import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Inicio from './pages/Inicio.jsx'
import './App.css'

const SobreMi = lazy(() => import('./pages/SobreMi.jsx'))
const Proyectos = lazy(() => import('./pages/Proyectos.jsx'))
const Certificados = lazy(() => import('./pages/Certificados.jsx'))
const RedesSociales = lazy(() => import('./pages/RedesSociales.jsx'))
const Experiencia = lazy(() => import('./pages/Experiencia.jsx'))
const Contacto = lazy(() => import('./pages/Contacto.jsx'))
const NoEncontrada = lazy(() => import('./pages/NoEncontrada.jsx'))

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <p>Cargando contenido…</p>
    </div>
  )
}

function App() {
  const { pathname } = useLocation()
  const esInicio = pathname === '/'
  const esCertificados = pathname.startsWith('/certificados')
  const esRedesSociales = pathname.startsWith('/redes-sociales')
  const esExperiencia = pathname.startsWith('/experiencia')

  return (
    <div
      className={`app ${esInicio ? 'app--home' : ''} ${esCertificados ? 'app--certificates' : ''} ${esRedesSociales ? 'app--networks' : ''} ${esExperiencia ? 'app--experience' : ''}`}
    >
      <ScrollToTop />
      <Header />

      <main className="page-main">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route index element={<Inicio />} />
            <Route path="sobre-mi" element={<SobreMi />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="certificados" element={<Certificados />} />
            <Route path="redes-sociales" element={<RedesSociales />} />
            <Route path="experiencia" element={<Experiencia />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default App
