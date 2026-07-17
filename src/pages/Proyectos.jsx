import { useCallback, useEffect, useMemo, useState } from 'react'
import { perfil } from '../data/portafolio.js'
import './Proyectos.css'

const USUARIO_GITHUB = perfil.githubUsuario
const API_PROYECTOS = `https://api.github.com/users/${encodeURIComponent(USUARIO_GITHUB)}/repos?type=owner&sort=updated&direction=desc&per_page=100`
const CLAVE_CACHE = `github-projects-v2-${USUARIO_GITHUB}`
const DURACION_CACHE = 15 * 60 * 1000
const MAX_REPOSITORIOS_CON_DESGLOSE = 24
const TAMANO_LOTE_LENGUAJES = 6

const COLORES_LENGUAJES = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#8b5cf6',
  Python: '#3572a5',
  Java: '#b07219',
  PHP: '#777bb4',
  Vue: '#41b883',
  Shell: '#89e051',
  Astro: '#ff5d01',
  Otros: '#8d8d89',
}

const TECNOLOGIAS_POR_REPOSITORIO = {
  portafolio: [
    'React',
    'JavaScript',
    'CSS',
    'Vite',
    'Motion',
    'GSAP',
    'OGL',
    'GitHub REST API',
  ],
}

function obtenerTecnologiasProyecto(proyecto) {
  const personalizadas =
    TECNOLOGIAS_POR_REPOSITORIO[proyecto.name.toLowerCase()] ?? []
  const temas = proyecto.topics ?? []
  const lenguajes = (proyecto.lenguajes ?? []).map(
    (lenguaje) => lenguaje.nombre,
  )

  return [...new Set([...personalizadas, ...temas, ...lenguajes])].slice(0, 8)
}

function crearDesgloseLenguajes(lenguajes, lenguajePrincipal) {
  const entradas = Object.entries(lenguajes ?? {})
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0)
    .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)

  if (entradas.length === 0) {
    return lenguajePrincipal
      ? [{ nombre: lenguajePrincipal, porcentaje: 100 }]
      : []
  }

  const total = entradas.reduce((acumulado, [, bytes]) => acumulado + bytes, 0)
  const principales = entradas.slice(0, 4)
  const bytesOtros = entradas
    .slice(4)
    .reduce((acumulado, [, bytes]) => acumulado + bytes, 0)

  if (bytesOtros > 0) principales.push(['Otros', bytesOtros])

  return principales.map(([nombre, bytes]) => ({
    nombre,
    porcentaje: Number(((bytes / total) * 100).toFixed(1)),
  }))
}

async function obtenerLenguajesProyecto(proyecto, signal) {
  const fallback = crearDesgloseLenguajes({}, proyecto.language)

  if (!proyecto.languages_url) return { ...proyecto, lenguajes: fallback }

  try {
    const respuesta = await fetch(proyecto.languages_url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal,
    })

    if (!respuesta.ok) return { ...proyecto, lenguajes: fallback }

    const lenguajes = await respuesta.json()

    return {
      ...proyecto,
      lenguajes: crearDesgloseLenguajes(lenguajes, proyecto.language),
    }
  } catch (errorSolicitud) {
    if (errorSolicitud.name === 'AbortError') throw errorSolicitud
    return { ...proyecto, lenguajes: fallback }
  }
}

async function enriquecerProyectos(proyectos, signal) {
  const enriquecidos = []
  const consultables = proyectos.slice(0, MAX_REPOSITORIOS_CON_DESGLOSE)

  for (let indice = 0; indice < consultables.length; indice += TAMANO_LOTE_LENGUAJES) {
    const lote = consultables.slice(indice, indice + TAMANO_LOTE_LENGUAJES)
    const resultados = await Promise.all(
      lote.map((proyecto) => obtenerLenguajesProyecto(proyecto, signal)),
    )
    enriquecidos.push(...resultados)
  }

  const restantes = proyectos
    .slice(MAX_REPOSITORIOS_CON_DESGLOSE)
    .map((proyecto) => ({
      ...proyecto,
      lenguajes: crearDesgloseLenguajes({}, proyecto.language),
    }))

  return [...enriquecidos, ...restantes]
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
          'X-GitHub-Api-Version': '2022-11-28',
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

      const proyectosPreparados = await enriquecerProyectos(
        prepararProyectos(datos),
        signal,
      )
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
        <div className="projects-hero-copy">
          <p className="projects-kicker">
            <span className="projects-live-dot" aria-hidden="true" />
            Datos en vivo desde GitHub
          </p>
          <h1 id="titulo-proyectos">
            Ideas convertidas en <em>código.</em>
          </h1>
        </div>

        <aside className="projects-api-card" aria-label="Conexión con GitHub">
          <div className="projects-api-label">
            <span aria-hidden="true" />
            GitHub REST API
          </div>
          <strong>@{USUARIO_GITHUB}</strong>
          <p>
            Los repositorios se actualizan automáticamente conforme publico
            nuevos proyectos.
          </p>
        </aside>
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

              <div
                className="project-technologies"
                aria-label={`Tecnologías usadas en ${proyecto.name}`}
              >
                <div className="project-technologies-heading">
                  <span>Tecnologías usadas</span>
                  <small>Stack</small>
                </div>
                <div className="project-technologies-grid">
                  {obtenerTecnologiasProyecto(proyecto).map(
                    (tecnologia, technologyIndex) => (
                      <span key={tecnologia}>
                        <i aria-hidden="true">
                          {String(technologyIndex + 1).padStart(2, '0')}
                        </i>
                        {tecnologia}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {proyecto.lenguajes?.length > 0 && (
                <div
                  className="project-languages"
                  aria-label={`Distribución del código de ${proyecto.name}`}
                >
                  <div className="project-languages-heading">
                    <span>Tecnologías detectadas</span>
                    <small>GitHub API</small>
                  </div>

                  <div className="project-language-list">
                    {proyecto.lenguajes.map((lenguaje, languageIndex) => (
                      <div className="project-language" key={lenguaje.nombre}>
                        <div className="project-language-copy">
                          <span>{lenguaje.nombre}</span>
                          <strong>{lenguaje.porcentaje.toFixed(1)}%</strong>
                        </div>
                        <div
                          className="project-language-track"
                          role="progressbar"
                          aria-label={`${lenguaje.nombre}: ${lenguaje.porcentaje.toFixed(1)}%`}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow={Math.round(lenguaje.porcentaje)}
                        >
                          <span
                            style={{
                              '--bar-color':
                                COLORES_LENGUAJES[lenguaje.nombre] ?? '#c9c9c5',
                              '--bar-percentage': `${lenguaje.porcentaje}%`,
                              '--bar-delay': `${languageIndex * 90}ms`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
