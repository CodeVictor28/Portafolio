import { useEffect, useRef } from 'react'
import './SpecularButton.css'

const CANVAS_PADDING = 20
const pointerSubscribers = new Set()
let pointerListenerActive = false

const VERTEX_SHADER = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 point, vec2 bounds, float radius) {
  vec2 offset = abs(point) - bounds + radius;
  return length(max(offset, 0.0)) +
    min(max(offset.x, offset.y), 0.0) -
    radius;
}

float gaussianLine(float distance, float sigma) {
  float value = distance / (sigma + 0.000001);
  float curve = mix(1.0, 1.6, smoothstep(0.0, 1.5, value));
  return exp(-curve * value * value);
}

void main() {
  vec2 point = gl_FragCoord.xy - uCenter;
  float distance = sdRoundedRect(point, uHalfSize, uRadius);
  vec2 light = vec2(cos(uAngle), sin(uAngle));
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(distance))) * 0.45;
  vec2 normal = normalize(point / (uHalfSize * uHalfSize) + 0.000001);
  float angle = acos(clamp(abs(dot(normal, light)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(
    uShineSize - uShineFade,
    uShineSize + uShineFade + 0.0001,
    angle
  );
  float line = gaussianLine(distance, uThickness);
  float edge = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(distance));
  float highlight = line * rim * edge * uIntensity;
  vec3 color = uBaseColor * base + uLineColor * highlight;

  fragColor = vec4(color, clamp(base + highlight, 0.0, 1.0));
}
`

function handleGlobalPointerMove(event) {
  if (event.pointerType === 'touch') return

  const pointer = { x: event.clientX, y: event.clientY }
  pointerSubscribers.forEach((subscriber) => subscriber(pointer))
}

function subscribeToPointer(subscriber) {
  pointerSubscribers.add(subscriber)

  if (!pointerListenerActive) {
    window.addEventListener('pointermove', handleGlobalPointerMove, {
      passive: true,
    })
    pointerListenerActive = true
  }

  return () => {
    pointerSubscribers.delete(subscriber)

    if (pointerSubscribers.size === 0 && pointerListenerActive) {
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      pointerListenerActive = false
    }
  }
}

function supportsEnhancedWebGL() {
  const finePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)',
  ).matches
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const saveData = navigator.connection?.saveData === true
  const lowMemory =
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= 2

  return finePointer && !reducedMotion && !saveData && !lowMemory
}

function SpecularButton({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  className = '',
  type = 'button',
  as: Component = 'button',
  style,
  ...restProps
}) {
  const buttonRef = useRef(null)
  const effectRef = useRef(null)
  const propsRef = useRef({})
  const controllerRef = useRef(null)
  const hoveredRef = useRef(false)
  const focusedRef = useRef(false)

  propsRef.current = {
    autoAnimate,
    baseColor,
    disabled,
    followMouse,
    intensity,
    lineColor,
    proximity,
    radius,
    shineFade,
    shineSize,
    speed,
    thickness,
  }

  useEffect(() => {
    const button = buttonRef.current
    const effect = effectRef.current

    if (!button || !effect || !supportsEnhancedWebGL()) return undefined

    let destroyed = false
    let visible = true
    let engine = null
    let initialization = null
    let idleCallback = 0
    let idleTimeout = 0
    let pointerAngle = null
    let proximityAmount = 0

    function shouldRender() {
      const current = propsRef.current

      return (
        !destroyed &&
        visible &&
        !document.hidden &&
        !current.disabled &&
        (current.autoAnimate ||
          hoveredRef.current ||
          focusedRef.current ||
          proximityAmount > 0.001)
      )
    }

    function stopRendering() {
      if (!engine?.frameId) return

      cancelAnimationFrame(engine.frameId)
      engine.frameId = 0
    }

    function startRendering() {
      if (!engine || engine.frameId || !shouldRender()) return

      button.classList.add(
        'specular-button--webgl',
        'specular-button--webgl-active',
      )
      engine.lastTime = performance.now()

      function update(now) {
        if (!engine || !shouldRender()) {
          if (engine) engine.frameId = 0
          button.classList.remove('specular-button--webgl-active')
          return
        }

        const delta = Math.min((now - engine.lastTime) / 1000, 0.05)
        const current = propsRef.current

        engine.lastTime = now
        engine.idleAngle += current.speed * delta

        const followsPointer =
          current.followMouse &&
          pointerAngle !== null &&
          (!current.autoAnimate || proximityAmount > 0)
        const targetAngle = followsPointer
          ? pointerAngle
          : engine.idleAngle
        const difference =
          ((targetAngle - engine.angle + Math.PI * 3) %
            (Math.PI * 2)) -
          Math.PI
        const brightnessTarget = current.autoAnimate
          ? 1
          : proximityAmount

        engine.angle +=
          difference * (1 - Math.exp(-delta * 7))
        engine.brightness +=
          (brightnessTarget - engine.brightness) *
          (1 - Math.exp(-delta * 8))
        engine.lineColor.set(current.lineColor)
        engine.baseColor.set(current.baseColor)
        engine.program.uniforms.uAngle.value = engine.angle
        engine.program.uniforms.uRadius.value =
          Math.min(
            current.radius,
            Math.min(engine.width, engine.height) / 2,
          ) * engine.dpr
        engine.program.uniforms.uLineColor.value = [
          engine.lineColor.r,
          engine.lineColor.g,
          engine.lineColor.b,
        ]
        engine.program.uniforms.uBaseColor.value = [
          engine.baseColor.r,
          engine.baseColor.g,
          engine.baseColor.b,
        ]
        engine.program.uniforms.uIntensity.value =
          current.intensity * engine.brightness
        engine.program.uniforms.uShineSize.value =
          (current.shineSize * Math.PI) / 180
        engine.program.uniforms.uShineFade.value =
          (current.shineFade * Math.PI) / 180
        engine.program.uniforms.uThickness.value =
          current.thickness * engine.dpr
        engine.renderer.render({ scene: engine.mesh })
        engine.frameId = requestAnimationFrame(update)
      }

      engine.frameId = requestAnimationFrame(update)
    }

    async function initializeWebGL() {
      if (engine) return engine
      if (initialization) return initialization

      initialization = import('ogl')
        .then(({ Color, Mesh, Program, Renderer, Triangle }) => {
          if (destroyed) return null

          const canvas = document.createElement('canvas')
          const contextAttributes = {
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
            premultipliedAlpha: true,
          }

          if (!canvas.getContext('webgl2', contextAttributes)) return null

          const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
          const renderer = new Renderer({
            canvas,
            alpha: true,
            antialias: true,
            dpr,
            powerPreference: 'low-power',
            premultipliedAlpha: true,
            webgl: 2,
          })
          const gl = renderer.gl

          gl.clearColor(0, 0, 0, 0)
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

          const geometry = new Triangle(gl)
          if (geometry.attributes.uv) delete geometry.attributes.uv

          const program = new Program(gl, {
            vertex: VERTEX_SHADER,
            fragment: FRAGMENT_SHADER,
            uniforms: {
              uCenter: { value: [0, 0] },
              uHalfSize: { value: [1, 1] },
              uRadius: { value: 0 },
              uAngle: { value: 2.4 },
              uPx: { value: dpr },
              uLineColor: { value: [1, 1, 1] },
              uBaseColor: { value: [0.32, 0.32, 0.32] },
              uIntensity: { value: 1 },
              uShineSize: { value: 0.17 },
              uShineFade: { value: 0.7 },
              uThickness: { value: 1 },
              uBaseWidth: { value: dpr },
            },
          })
          const mesh = new Mesh(gl, { geometry, program })
          const nextEngine = {
            angle: 2.4,
            baseColor: new Color(),
            brightness: 0,
            canvas,
            dpr,
            frameId: 0,
            gl,
            height: 1,
            idleAngle: 2.4,
            lastTime: performance.now(),
            lineColor: new Color(),
            mesh,
            program,
            renderer,
            width: 1,
          }

          function resize() {
            const rect = button.getBoundingClientRect()

            nextEngine.width = rect.width
            nextEngine.height = rect.height
            renderer.setSize(
              rect.width + CANVAS_PADDING * 2,
              rect.height + CANVAS_PADDING * 2,
            )
            program.uniforms.uCenter.value = [
              (CANVAS_PADDING + rect.width / 2) * dpr,
              (CANVAS_PADDING + rect.height / 2) * dpr,
            ]
            program.uniforms.uHalfSize.value = [
              (rect.width / 2) * dpr,
              (rect.height / 2) * dpr,
            ]
          }

          nextEngine.resizeObserver = new ResizeObserver(resize)
          nextEngine.resizeObserver.observe(button)
          effect.appendChild(canvas)
          engine = nextEngine
          button.classList.add('specular-button--webgl')
          resize()

          return engine
        })
        .catch(() => null)
        .finally(() => {
          initialization = null
        })

      return initialization
    }

    function synchronize() {
      if (!shouldRender()) {
        stopRendering()
        button.classList.remove('specular-button--webgl-active')
        return
      }

      initializeWebGL().then((initializedEngine) => {
        if (initializedEngine && shouldRender()) startRendering()
      })
    }

    function updatePointer(pointer) {
      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = Math.max(
        rect.left - pointer.x,
        0,
        pointer.x - rect.right,
      )
      const distanceY = Math.max(
        rect.top - pointer.y,
        0,
        pointer.y - rect.bottom,
      )
      const distance = Math.hypot(distanceX, distanceY)

      if (distance === 0) {
        const normalizedX =
          (pointer.x - centerX) / (rect.width / 2)
        const normalizedY =
          (centerY - pointer.y) / (rect.height / 2)

        pointerAngle =
          Math.atan2(2 / rect.height, -2 / rect.width) +
          normalizedX * 0.3 +
          normalizedY * 0.15
      } else {
        pointerAngle = Math.atan2(
          centerY - pointer.y,
          pointer.x - centerX,
        )
      }

      const amount = Math.max(
        0,
        1 - distance / Math.max(propsRef.current.proximity, 1),
      )

      proximityAmount = amount * amount * (3 - 2 * amount)
      synchronize()
    }

    const unsubscribePointer = subscribeToPointer(updatePointer)
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        synchronize()
      },
      { rootMargin: '80px' },
    )
    const handleVisibilityChange = () => synchronize()

    controllerRef.current = { synchronize }
    intersectionObserver.observe(button)
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    if (propsRef.current.autoAnimate) {
      if ('requestIdleCallback' in window) {
        idleCallback = window.requestIdleCallback(synchronize, {
          timeout: 900,
        })
      } else {
        idleTimeout = window.setTimeout(synchronize, 300)
      }
    }

    return () => {
      destroyed = true
      controllerRef.current = null
      unsubscribePointer()
      intersectionObserver.disconnect()
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
      stopRendering()

      if (idleCallback) window.cancelIdleCallback(idleCallback)
      if (idleTimeout) window.clearTimeout(idleTimeout)

      if (engine) {
        engine.resizeObserver.disconnect()
        engine.canvas.remove()
        engine.gl.getExtension('WEBGL_lose_context')?.loseContext()
        engine = null
      }
    }
  }, [])

  const handleClick = (event) => {
    if (disabled) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }

  const handlePointerEnter = (event) => {
    onPointerEnter?.(event)
    if (event.pointerType === 'touch') return

    hoveredRef.current = true
    controllerRef.current?.synchronize()
  }

  const handlePointerLeave = (event) => {
    onPointerLeave?.(event)
    hoveredRef.current = false
    controllerRef.current?.synchronize()
  }

  const handleFocus = (event) => {
    onFocus?.(event)
    focusedRef.current = true
    controllerRef.current?.synchronize()
  }

  const handleBlur = (event) => {
    onBlur?.(event)
    focusedRef.current = false
    controllerRef.current?.synchronize()
  }

  const componentProps =
    Component === 'button'
      ? { type, disabled }
      : {
          'aria-disabled': disabled ? true : undefined,
          tabIndex: disabled ? -1 : undefined,
        }

  return (
    <Component
      {...restProps}
      {...componentProps}
      ref={buttonRef}
      onBlur={handleBlur}
      onClick={handleClick}
      onFocus={handleFocus}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`specular-button specular-button--${size}${autoAnimate ? ' specular-button--animated' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--sb-radius': `${radius}px`,
        '--sb-tint': tint,
        '--sb-tint-opacity': tintOpacity,
        '--sb-blur': `${blur}px`,
        '--sb-text-color': textColor,
        '--sb-line-color': lineColor,
        '--sb-base-color': baseColor,
        '--sb-intensity': Math.max(0, intensity),
        '--sb-speed': `${Math.max(0.45, 1.05 - speed)}s`,
        ...style,
      }}
    >
      <span ref={effectRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </Component>
  )
}

export default SpecularButton
