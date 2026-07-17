import { useCallback, useEffect, useMemo, useState } from 'react'
import { perfil } from '../data/portafolio.js'
import './Proyectos.css'

const USUARIO_GITHUB = perfil.githubUsuario
const API_PROYECTOS = `https://api.github.com/users/${encodeURIComponent(USUARIO_GITHUB)}/repos?type=owner&sort=updated&direction=desc&per_page=100`
const CLAVE_CACHE = `github-projects-${USUARIO_GITHUB}`
const DURACION_CACHE = 15 * 60 * 1000

const COLORES_LENGUAJES = {
  JavaScript: '#eeeeeb',
  TypeScript: '#d5d5d1',
  HTML: '#bbbbb7',
  CSS: '#a2a29e',
  Python: '#898986',
  Java: '#70706e',
  PHP: '#585856',
}

function leerCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(CLAVE_CACHE))

    if (!cache?.fecha || !Array.isArray(cache.proyectos)) return null

    return {
      ...cache,
      vigente: Date.now() - cache.fecha < DURACION_CACHE,
    }
  } catch {
    return null
  }
}

function guardarCache(proyectos) {
  try {
    localStorage.setItem(
      CLAVE_CACHE,
      JSON.stringify({ fecha: Date.now(), proyectos }),
    )
  } catch {
    // La página continúa funcionando aunque el navegador bloquee localStorage.
  }
}

function prepararProyectos(respuesta) {
  const disponibles = respuesta.filter((repositorio) => !repositorio.archived)
  const originales = disponibles.filter((repositorio) => !repositorio.fork)

  return originales.length > 0 ? originales : disponibles
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}

function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [estado, setEstado] = useState('cargando')
  const [error, setError] = useState('')
  const [lenguajeActivo, setLenguajeActivo] = useState('Todos')

  const cargarProyectos = useCallback(async (forzar = false, signal) => {
    const cache = leerCache()

    if (!forzar && cache?.vigente) {
      setProyectos(cache.proyectos)
      setEstado(cache.proyectos.length > 0 ? 'listo' : 'vacio')
      return
    }

    if (cache?.proyectos?.length) setProyectos(cache.proyectos)

    setEstado(cache?.proyectos?.length ? 'actualizando' : 'cargando')
    setError('')

    try {
      const respuesta = await fetch(API_PROYECTOS, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
        signal,
      })

      if (!respuesta.ok) {
        if (respuesta.status === 403 || respuesta.status === 429) {
          throw new Error(
            'GitHub alcanzó temporalmente su límite de consultas. Intenta nuevamente en unos minutos.',
          )
        }

        throw new Error('No fue posible consultar los proyectos de GitHub.')
      }

      const datos = await respuesta.json()

      if (!Array.isArray(datos)) {
        throw new Error('GitHub devolvió una respuesta inesperada.')
      }

      const proyectosPreparados = prepararProyectos(datos)
      setProyectos(proyectosPreparados)
      guardarCache(proyectosPreparados)
      setEstado(proyectosPreparados.length > 0 ? 'listo' : 'vacio')
    } catch (errorSolicitud) {
      if (errorSolicitud.name === 'AbortError') return

      setError(errorSolicitud.message)
      setEstado(cache?.proyectos?.length ? 'listo' : 'error')
    }
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    cargarProyectos(false, controlador.signal)

    return () => controlador.abort()
  }, [cargarProyectos])

  const lenguajes = useMemo(
    () => [
      'Todos',
      ...new Set(
        proyectos
          .map((proyecto) => proyecto.language)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b)),
      ),
    ],
    [proyectos],
  )

  const proyectosVisibles = useMemo(
    () =>
      lenguajeActivo === 'Todos'
        ? proyectos
        : proyectos.filter(
            (proyecto) => proyecto.language === lenguajeActivo,
          ),
    [lenguajeActivo, proyectos],
  )

  return (
    <main className="projects-page">
      <section className="projects-hero" aria-labelledby="titulo-proyectos">
        <div>
          <p className="projects-kicker">
            <span className="projects-live-dot" aria-hidden="true" />
            Datos en vivo desde GitHub
          </p>
          <h1 id="titulo-proyectos">
            Ideas convertidas en <em>código.</em>
          </h1>
        </div>

        <div className="projects-api-card">
          <span>GitHub REST API</span>
          <strong>@{USUARIO_GITHUB}</strong>
          <p>
            Los repositorios se actualizan automáticamente conforme publico
            nuevos proyectos.
          </p>
        </div>
      </section>

      {proyectos.length > 0 && (
        <section className="projects-toolbar" aria-label="Filtros de proyectos">
          <div className="projects-filters">
            {lenguajes.map((lenguaje) => (
              <button
                className={lenguajeActivo === lenguaje ? 'is-active' : ''}
                key={lenguaje}
                onClick={() => setLenguajeActivo(lenguaje)}
                type="button"
              >
                {lenguaje}
              </button>
            ))}
          </div>

          <button
            className="projects-refresh"
            disabled={estado === 'actualizando'}
            onClick={() => cargarProyectos(true)}
            type="button"
          >
            <span
              className={estado === 'actualizando' ? 'is-spinning' : ''}
              aria-hidden="true"
            >
              ↻
            </span>
            {estado === 'actualizando' ? 'Actualizando' : 'Actualizar'}
          </button>
        </section>
      )}

      {error && proyectos.length > 0 && (
        <p className="projects-inline-warning" role="status">
          {error} Se muestran los últimos datos guardados.
        </p>
      )}

      {estado === 'cargando' && (
        <section className="projects-grid" aria-label="Cargando proyectos">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="project-card project-card--skeleton"
              key={index}
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <span />
            </div>
          ))}
          <span className="visually-hidden">Cargando proyectos de GitHub.</span>
        </section>
      )}

      {estado === 'error' && (
        <section className="projects-message" role="alert">
          <span aria-hidden="true">!</span>
          <h2>No pudimos conectar con GitHub</h2>
          <p>{error}</p>
          <button onClick={() => cargarProyectos(true)} type="button">
            Intentar nuevamente
          </button>
        </section>
      )}

      {estado === 'vacio' && (
        <section className="projects-message">
          <span aria-hidden="true">⌁</span>
          <h2>Aún no hay repositorios públicos</h2>
          <p>
            Cuando publiques un repositorio en GitHub aparecerá aquí
            automáticamente.
          </p>
          <a
            href={`https://github.com/${USUARIO_GITHUB}`}
            target="_blank"
            rel="noreferrer"
          >
            Visitar perfil de GitHub
          </a>
        </section>
      )}

      {proyectos.length > 0 && (
        <section className="projects-grid" aria-live="polite">
          {proyectosVisibles.map((proyecto, index) => (
            <article
              className="project-card"
              key={proyecto.id}
              style={{
                '--language-color':
                  COLORES_LENGUAJES[proyecto.language] ?? '#c9c9c5',
              }}
            >
              <div className="project-card-header">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{proyecto.visibility}</span>
              </div>

              <div className="project-card-copy">
                <h2>{proyecto.name}</h2>
                <p>
                  {proyecto.description ||
                    'Repositorio público preparado para documentar este proyecto.'}
                </p>
              </div>

              {proyecto.topics?.length > 0 && (
                <div className="project-topics" aria-label="Temas">
                  {proyecto.topics.slice(0, 3).map((tema) => (
                    <span key={tema}>{tema}</span>
                  ))}
                </div>
              )}

              <div className="project-meta">
                <span>
                  <i aria-hidden="true" />
                  {proyecto.language ?? 'Sin lenguaje'}
                </span>
                <span aria-label={`${proyecto.stargazers_count} estrellas`}>
                  ★ {proyecto.stargazers_count}
                </span>
                <span aria-label={`${proyecto.forks_count} bifurcaciones`}>
                  ⑂ {proyecto.forks_count}
                </span>
              </div>

              <p className="project-updated">
                Actualizado el {formatearFecha(proyecto.updated_at)}
              </p>

              <div className="project-links">
                {proyecto.homepage && (
                  <a
                    className="project-link project-link--primary"
                    href={proyecto.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver proyecto <span aria-hidden="true">↗</span>
                  </a>
                )}
                <a
                  className="project-link"
                  href={proyecto.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Código <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </section>
      )}

      {proyectos.length > 0 && proyectosVisibles.length === 0 && (
        <section className="projects-message">
          <span aria-hidden="true">⌕</span>
          <h2>No hay proyectos con este lenguaje</h2>
          <button onClick={() => setLenguajeActivo('Todos')} type="button">
            Ver todos
          </button>
        </section>
      )}
    </main>
  )
}

export default Proyectos
