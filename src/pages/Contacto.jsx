import { useEffect, useRef, useState } from 'react'
import { perfil, redes } from '../data/portafolio.js'
import './Contacto.css'

const iconosRedes = {
  LinkedIn: '/social/linkedin.svg',
  Discord: '/social/discord.svg',
}

const detallesRedes = {
  LinkedIn: {
    etiqueta: 'Red profesional',
    descripcion: 'Trayectoria, experiencia y conexiones profesionales.',
  },
  Discord: {
    etiqueta: 'Conversación directa',
    descripcion: 'Propuestas, colaboraciones y conversaciones sobre tecnología.',
  },
}

const redesContacto = redes.filter((red) =>
  ['LinkedIn', 'Discord'].includes(red.nombre),
)

function CopyIcon({ copied }) {
  return copied ? (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4.5 10.5 3.3 3.3 7.7-8" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="6.5" y="6.5" width="9" height="9" rx="2" />
      <path d="M13.5 6.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

function ContactEye({ side }) {
  const glowId = `contact-eye-glow-${side}`
  const fillId = `contact-eye-fill-${side}`
  const flameId = `contact-eye-flame-${side}`
  const flameFilterId = `contact-eye-flame-filter-${side}`

  return (
    <svg
      className={`contact-eye contact-eye--${side}`}
      viewBox="0 0 260 220"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.94" />
          <stop offset="0.58" stopColor="#d9d9df" stopOpacity="0.84" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.58" />
        </linearGradient>
        <linearGradient id={flameId} x1="1" y1="0.5" x2="0" y2="0.5">
          <stop offset="0" stopColor="#f4e8ff" stopOpacity="0.96" />
          <stop offset="0.2" stopColor="#d8b4fe" stopOpacity="0.92" />
          <stop offset="0.52" stopColor="#9333ea" stopOpacity="0.72" />
          <stop offset="0.8" stopColor="#5b21b6" stopOpacity="0.36" />
          <stop offset="1" stopColor="#2e1065" stopOpacity="0" />
        </linearGradient>
        <filter
          id={flameFilterId}
          x="-55%"
          y="-55%"
          width="210%"
          height="210%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.055"
            numOctaves="2"
            seed={side === 'left' ? 7 : 13}
            result="flameNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flameNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="B"
            result="distortedFlame"
          />
          <feGaussianBlur in="distortedFlame" stdDeviation="2.4" result="flameBlur" />
          <feMerge>
            <feMergeNode in="flameBlur" />
            <feMergeNode in="distortedFlame" />
          </feMerge>
        </filter>
      </defs>

      <g className="contact-eye__body">
        <g
          className="contact-eye__energy"
          fill={`url(#${flameId})`}
          filter={`url(#${flameFilterId})`}
        >
          <path
            className="contact-eye__flame contact-eye__flame--one"
            d="M205 105 C169 91 146 72 127 48 C108 24 88 38 65 8 C80 44 58 62 88 78 C119 95 155 105 205 115Z"
          />
          <path
            className="contact-eye__flame contact-eye__flame--two"
            d="M205 114 C170 118 144 133 120 158 C95 185 72 171 43 211 C65 169 65 145 99 136 C132 126 166 114 205 108Z"
          />
          <path
            className="contact-eye__flame contact-eye__flame--three"
            d="M194 107 C156 102 133 91 111 71 C87 50 65 58 43 33 C58 68 68 85 96 94 C125 104 155 111 194 116Z"
          />
        </g>

        <g className="contact-eye__shape" filter={`url(#${glowId})`}>
          <path
            className="contact-eye__sclera"
            d="M32 102 C84 74 157 80 229 118 C177 145 96 146 32 102Z"
            fill={`url(#${fillId})`}
          />
          <ellipse className="contact-eye__pupil" cx="154" cy="111" rx="11" ry="24" />
          <circle className="contact-eye__spark" cx="150" cy="101" r="3.4" />
          <path
            className="contact-eye__lid"
            d="M29 99 C88 68 161 76 233 119"
          />
          <path
            className="contact-eye__brow"
            d="M43 78 C105 58 173 72 229 108"
          />
        </g>
      </g>
    </svg>
  )
}

function Contacto() {
  const [copyStatus, setCopyStatus] = useState('idle')
  const resetTimerRef = useRef(null)

  useEffect(
    () => () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
    },
    [],
  )

  async function copyEmail() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(perfil.correo)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = perfil.correo
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        textarea.remove()
      }

      setCopyStatus('copied')
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = window.setTimeout(() => setCopyStatus('idle'), 2400)
    } catch {
      setCopyStatus('error')
    }
  }

  const copied = copyStatus === 'copied'

  return (
    <main className="contact-page">
      <div className="contact-ocular-backdrop" aria-hidden="true">
        <ContactEye side="left" />
        <ContactEye side="right" />
      </div>

      <section className="contact-section" aria-labelledby="titulo-contacto">
        <div className="contact-copy">
          <p className="contact-eyebrow">
            <span aria-hidden="true" />
            Contacto directo
          </p>
          <h1 id="titulo-contacto">¿Tienes una idea? Conversemos.</h1>
          <p>
            Estoy disponible para colaborar en proyectos web y seguir creando
            experiencias digitales que aporten valor.
          </p>
        </div>

        <div className="contact-email-card">
          <span className="contact-email-label">Correo electrónico</span>
          <p>{perfil.correo}</p>
          <button
            className={copied ? 'is-copied' : ''}
            type="button"
            onClick={copyEmail}
            aria-label={copied ? 'Correo copiado' : 'Copiar correo electrónico'}
          >
            <CopyIcon copied={copied} />
            <span>{copied ? 'Correo copiado' : 'Copiar correo'}</span>
          </button>
          <small
            className={copyStatus === 'error' ? 'is-error' : ''}
            role="status"
            aria-live="polite"
          >
            {copyStatus === 'error'
              ? 'No se pudo copiar. Selecciona el correo manualmente.'
              : copied
                ? 'Listo para pegarlo en tu aplicación de correo.'
                : 'Copia la dirección y escríbeme desde tu correo preferido.'}
          </small>
        </div>
      </section>

      <section className="contact-network-section" aria-labelledby="titulo-otros-canales">
        <header>
          <span>Otros canales</span>
          <h2 id="titulo-otros-canales">También podemos conectar aquí.</h2>
        </header>

        <div className="contact-network-list">
          {redesContacto.map((red) => {
            const detalle = detallesRedes[red.nombre]

            return (
              <a
                className={`contact-network-card contact-network-card--${red.nombre.toLowerCase()}`}
                href={red.url}
                key={red.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="contact-network-card-top">
                  <span className="contact-network-logo">
                    <img
                      src={iconosRedes[red.nombre]}
                      alt=""
                      width="48"
                      height="48"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="contact-network-arrow" aria-hidden="true">↗</span>
                </div>
                <div>
                  <span>{detalle.etiqueta}</span>
                  <h3>{red.nombre}</h3>
                  <p>{detalle.descripcion}</p>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default Contacto
