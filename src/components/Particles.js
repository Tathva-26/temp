'use client'
import { useEffect, useRef } from 'react'

export default function Particles({ id = 'particles-js', options }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // particles.js attaches window.particlesJS as a global — load it once
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
    script.async = true
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS(id, options)
      }
    }
    document.body.appendChild(script)

    return () => {
      // cleanup: remove the canvas particles.js injects
      const el = document.getElementById(id)
      if (el) el.innerHTML = ''
      document.body.removeChild(script)
    }
  }, [id, options])

  return <div id={id} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
}
