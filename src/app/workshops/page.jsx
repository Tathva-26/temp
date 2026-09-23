'use client'
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BackendStatus from '@/components/BackendStatus'
import { fetchEvents, formatPrice } from '@/lib/events'
import ClosedBanner from '@/components/ClosedBanner'
import gsap from 'gsap'

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== 'false'

// Tunable hover-response constants — focal card (Step 3 movement unchanged)
const MAX_TRANSLATE = 15
const MAX_TILT = 3
const HOVER_SCALE = 1.07
const LIFT_Z = 18
const REST_SHADOW = '0 4px 16px -3px rgba(0,0,0,0)'
const HOVER_SHADOW = '0 20px 34px -9px rgba(0,0,0,0)'
const ENTER_DURATION = 0.95
const MOVE_DURATION = 1.92
const LEAVE_DURATION = 0.6
const EASE = 'power2.out'

// Focal-card material/depth response (Step 5)
const REST_EDGE_BG = 'rgba(18, 18, 24, 0)'
const FOCUS_EDGE_BG = 'rgba(9, 9, 13, 0)'
const REST_EDGE_HIGHLIGHT_TOP = 'rgba(255,255,255,0)'
const FOCUS_EDGE_HIGHLIGHT_TOP = 'rgba(255,255,255,0)'
const REST_EDGE_HIGHLIGHT_LEFT = 'rgba(255,255,255,0)'
const FOCUS_EDGE_HIGHLIGHT_LEFT = 'rgba(255,255,255,0)'

// Surrounding-card "make room" response — Step 4
const GRID_GAP_PX = 32
const MAX_SURROUND_DISPLACEMENT = 100
const FALLOFF_STRENGTH = 0.4
const NEAR_LAG = 0.001
const FAR_LAG = 0.015
const RAMP_IN_MS = 20
const FIELD_RETURN_DURATION = 1.75

// Step 6 — annotation/callout (replaces the old rectangular info panel)
// Geometry
const CALLOUT_LABEL_WIDTH = 280 // text-wrap width, not a visual box
const CALLOUT_LABEL_HEIGHT_ESTIMATE = 220
const CALLOUT_GAP = 34 // distance from card edge to label's near edge
const CALLOUT_STUB = 16 // short initial leader segment away from the card
const CALLOUT_VIEWPORT_MARGIN = 20
const CALLOUT_LABEL_ANCHOR_OFFSET_Y = 12 // aligns the line's end with the title line
const CALLOUT_LABEL_LAG = 0.06 // smoothing factor while following a moving card
// Motion
const CALLOUT_CONTAINER_FADE_IN = 0.18
const CALLOUT_EXIT_DURATION = 0.4
const LINE_DRAW_DURATION = 0.45 // within the 350–550ms target
const LINE_DRAW_EASE = 'power2.out' // engineered/precise, no overshoot
// Decode sequencing (connector starts drawing at t=0)
const TITLE_START = 0.2
const TITLE_DECODE_DURATION = 0.4
const META_START = 0.4
const META_DECODE_DURATION = 0.4
const DESC_START = 0.55
const DESC_DECODE_DURATION = 0.55
const PRICE_START = 0.85
const PRICE_DECODE_DURATION = 0.3
// Decode character set for the "untangling" effect
const SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_-+=<>/\\|[]{}'

// Step 7 — subtle center-composition resting stagger
const MAX_STAGGER = 18
const STAGGER_ROW_TOLERANCE = 4
const STAGGER_MIN_ROW_SIZE = 3

// Step 8 — subtle focus field / surrounding quieting
const QUIET_OPACITY = 0.9
const QUIET_BRIGHTNESS = 0.94
const FOCAL_OPACITY = 1
const FOCAL_BRIGHTNESS = 1
const FOCUS_FIELD_DURATION = 0.6
const FOCUS_FIELD_LEAVE_DURATION = 0.75

// Step 9 — digital activation / pixelated entry response
const ACTIVATION_DURATION = 0.7
const ACTIVATION_FADE_DURATION = 0.1
const ACTIVATION_EASE = 'power2.in'
const ACTIVATION_RING_SPREAD = 145
const ACTIVATION_RING_BAND = 20
const ACTIVATION_GRID_BAND = 21
const ACTIVATION_GLOW_ALPHA = 0.14
const ACTIVATION_GRID_ALPHA = 0.6
const ACTIVATION_GRID_CELL = 10

// Step 10 — continuous digital pulse
const PULSE_CYCLE_MIN = 1.7
const PULSE_CYCLE_MAX = 2.3
const PULSE_RISE_FRACTION = 0.3
const PULSE_MAX_RADIUS = 150
const PULSE_PEAK_ALPHA = 0.2
const PULSE_FOLLOW_DURATION = 0.25
const PULSE_LEAVE_FADE = 0.5

// Step 11 — global dark focus overlay (page-wide dim pulse that originates
// from the hovered card). See the "── Step 11: global dark focus overlay ──"
// block below for how it integrates with the existing hover lifecycle.
const FOCUS_OVERLAY_Z = 15 // between resting card z-index (1) and focused card z-index (20)
const FOCUS_OVERLAY_COLOR = 'rgba(4, 5, 9, 0.56)'
const FOCUS_PULSE_DURATION = 1.7 // slow, cinematic expansion from the hovered card
const FOCUS_PULSE_EASE = 'power2.out'
const FOCUS_CLEAR_DURATION = 1.6 // clearing pulse that reverses the dark state
const FOCUS_CLEAR_EASE = 'power2.out'
const FOCUS_RECENTER_DURATION = 0.55 // gliding focus directly between cards while already dark
const FOCUS_MASK_EDGE = 2 // px soft edge between the hole/dark/reveal bands of the mask

// Idle suspended floating / wobble motion
const IDLE_FLOAT_Y_MIN = 1.2
const IDLE_FLOAT_Y_MAX = 1.8
const IDLE_FLOAT_X_MIN = 0.8
const IDLE_FLOAT_X_MAX = 1.4
const IDLE_FLOAT_ROT_MIN = 0.35
const IDLE_FLOAT_ROT_MAX = 0.55
const IDLE_FLOAT_TILT_MIN = 0.2
const IDLE_FLOAT_TILT_MAX = 0.4
const IDLE_YIELD_DURATION = 0.5
const IDLE_RESTORE_DURATION = 0.85

// Mock workshop images
// Uniform poster box for every card, so a grid row stays even no matter what
// shape the uploaded picture is. Portrait, matching a typical event poster.
const CARD_ASPECT_RATIO = '2 / 3'

// Placeholder art for workshops with no usable picture. These must exist in
// `public/` — the previous list pointed at /images/workshop{1,2,4,5,56}.jpg,
// none of which are in the repo, so every fallback card rendered blank.
const MOCK_WORKSHOP_IMAGES = [
  '/images/carousel/1.jpeg',
  '/images/carousel/2.jpeg',
  '/images/carousel/3.jpeg',
  '/images/carousel/4.jpeg',
  '/images/carousel/5.jpeg',
]

export default function WorkshopsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')

  // Step 6 — annotation callout render state
  const [calloutWorkshop, setCalloutWorkshop] = useState(null)
  const [calloutSide, setCalloutSide] = useState('right')

  // Click Zoom Transition state & locks
  const [activeTransition, setActiveTransition] = useState(null)
  const isNavigatingRef = useRef(false)
  const pageRef = useRef(null)
  const transitionOverlayRef = useRef(null)
  const transitionImgRef = useRef(null)
  const transitionTlRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const gridRef = useRef(null)
  const slotRefs = useRef({})
  const floatRefs = useRef({})
  const cardRefs = useRef({})
  const frontFaceRefs = useRef({})
  const isFinePointer = useRef(true)
  const prefersReducedMotion = useRef(false)
  const focusedIdRef = useRef(null)

  // Idle floating bookkeeping
  const idleWeightsRef = useRef({})
  const idleParamsRef = useRef({})
  const idleTickRef = useRef(null)

  const fieldActiveRef = useRef(false)
  const rampStartRef = useRef(0)
  const rectCacheRef = useRef({})
  const tickerRunningRef = useRef(false)
  const tickRef = useRef(null)

  // Page-load entrance animation
  const entranceCompleteRef = useRef(false)
  const entranceTlRef = useRef(null)

  // Step 6 — annotation callout refs
  const calloutOverlayRef = useRef(null)
  const calloutPathRef = useRef(null)
  const calloutLabelRef = useRef(null)
  const calloutTitleRef = useRef(null)
  const calloutMetaRef = useRef(null)
  const calloutDescRef = useRef(null)
  const calloutPriceRef = useRef(null)
  const calloutSideRef = useRef('right')
  const calloutVisibleRef = useRef(false)
  const calloutAnimatingRef = useRef(false)
  const calloutTimelineRef = useRef(null)
  const calloutDecodeRef = useRef({})

  // Step 9 bookkeeping
  const activationOverlayRefs = useRef({})
  const activationTimelineRefs = useRef({})

  // Step 10 bookkeeping
  const pulseOverlayRefs = useRef({})
  const pulseTimelineRefs = useRef({})
  const pulseFollowRefs = useRef({})

  // Step 11 — global dark focus overlay bookkeeping
  const focusOverlayRef = useRef(null)
  const focusTweenRef = useRef(null)
  const focusEngagedRef = useRef(false)
  const focusOriginRef = useRef({ x: 0, y: 0 })
  const focusMaxRadiusRef = useRef(0)

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    isFinePointer.current = hoverQuery.matches
    prefersReducedMotion.current = motionQuery.matches

    const handleHoverChange = (e) => {
      isFinePointer.current = e.matches
    }
    const handleMotionChange = (e) => {
      prefersReducedMotion.current = e.matches
      if (e.matches) {
        Object.values(floatRefs.current).forEach((el) => {
          if (el) gsap.set(el, { x: 0, y: 0, rotationZ: 0, rotationX: 0 })
        })
      }
    }

    hoverQuery.addEventListener('change', handleHoverChange)
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      hoverQuery.removeEventListener('change', handleHoverChange)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Idle floating params
  const getIdleParams = (id) => {
    let hash = 0
    const str = String(id ?? '')
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0
    }
    const s1 = (hash % 1000) / 1000
    const s2 = (Math.floor(hash / 1000) % 1000) / 1000
    const s3 = (Math.floor(hash / 1000000) % 1000) / 1000
    const s4 = ((hash ^ 0x5a5a5a5a) % 1000) / 1000

    return {
      freqY: (2 * Math.PI) / (4.2 + s1 * 1.8),
      freqX: (2 * Math.PI) / (4.8 + s2 * 1.6),
      freqRot: (2 * Math.PI) / (4.0 + s3 * 2.0),
      freqTilt: (2 * Math.PI) / (3.6 + s4 * 1.6),
      phaseY: s1 * Math.PI * 2,
      phaseX: s2 * Math.PI * 2,
      phaseRot: s3 * Math.PI * 2,
      phaseTilt: s4 * Math.PI * 2,
      ampY: IDLE_FLOAT_Y_MIN + s1 * (IDLE_FLOAT_Y_MAX - IDLE_FLOAT_Y_MIN),
      ampX: IDLE_FLOAT_X_MIN + s2 * (IDLE_FLOAT_X_MAX - IDLE_FLOAT_X_MIN),
      ampRot:
        IDLE_FLOAT_ROT_MIN + s3 * (IDLE_FLOAT_ROT_MAX - IDLE_FLOAT_ROT_MIN),
      ampTilt:
        IDLE_FLOAT_TILT_MIN + s4 * (IDLE_FLOAT_TILT_MAX - IDLE_FLOAT_TILT_MIN),
    }
  }

  // Continuous idle floating loop
  useEffect(() => {
    const idleTick = () => {
      // B3 fix: idle floating is a hover-paired resting effect for
      // fine-pointer (mouse) devices only. Previously this only checked
      // reduced-motion, so on touch devices — where handleCardEnter/Leave
      // never run and idleWeightsRef never gets populated — every card's
      // weight defaulted to 1 and floated continuously and indefinitely.
      if (!isFinePointer.current || prefersReducedMotion.current) return

      const t = performance.now() * 0.001
      const floatMap = floatRefs.current
      const weightsMap = idleWeightsRef.current
      const paramsMap = idleParamsRef.current

      for (const id in floatMap) {
        const el = floatMap[id]
        if (!el) continue

        const wObj = weightsMap[id]
        const weight = wObj !== undefined ? wObj.weight : 1

        if (weight <= 0.001) {
          if (el._hasIdleTransform) {
            gsap.set(el, { x: 0, y: 0, rotationZ: 0, rotationX: 0 })
            el._hasIdleTransform = false
          }
          continue
        }

        let p = paramsMap[id]
        if (!p) {
          p = getIdleParams(id)
          paramsMap[id] = p
        }

        const y = Math.sin(t * p.freqY + p.phaseY) * p.ampY * weight
        const x = Math.sin(t * p.freqX + p.phaseX) * p.ampX * weight
        const rotZ = Math.sin(t * p.freqRot + p.phaseRot) * p.ampRot * weight
        const rotX = Math.cos(t * p.freqTilt + p.phaseTilt) * p.ampTilt * weight

        gsap.set(el, {
          x,
          y,
          rotationZ: rotZ,
          rotationX: rotX,
        })
        el._hasIdleTransform = true
      }
    }

    idleTickRef.current = idleTick
    gsap.ticker.add(idleTick)

    return () => {
      gsap.ticker.remove(idleTick)
    }
  }, [])

  const getPointerResponse = (e, slotEl) => {
    const rect = slotEl.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const nx = Math.min(Math.max(px - 0.5, -0.5), 0.5)
    const ny = Math.min(Math.max(py - 0.5, -0.5), 0.5)

    return {
      x: nx * 2 * MAX_TRANSLATE,
      y: ny * 2 * MAX_TRANSLATE,
      rotationY: nx * 2 * MAX_TILT,
      rotationX: -ny * 2 * MAX_TILT,
    }
  }

  const measureSlots = () => {
    const cache = {}
    Object.keys(slotRefs.current).forEach((id) => {
      const el = slotRefs.current[id]
      if (!el) return
      const rect = el.getBoundingClientRect()
      cache[id] = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    })
    rectCacheRef.current = cache
  }

  const applyRestingStagger = () => {
    if (!isFinePointer.current) {
      Object.values(slotRefs.current).forEach((slotEl) => {
        if (slotEl) slotEl.style.transform = ''
      })
      return
    }

    const cache = rectCacheRef.current
    const ids = Object.keys(cache)
    if (ids.length === 0) return

    const rows = {}
    ids.forEach((id) => {
      const top = cache[id].top
      const rowKey =
        Math.round(top / STAGGER_ROW_TOLERANCE) * STAGGER_ROW_TOLERANCE
      if (!rows[rowKey]) rows[rowKey] = []
      rows[rowKey].push(id)
    })

    Object.values(rows).forEach((rowIds) => {
      if (rowIds.length < STAGGER_MIN_ROW_SIZE) {
        rowIds.forEach((id) => {
          const slotEl = slotRefs.current[id]
          if (slotEl) slotEl.style.transform = ''
        })
        return
      }

      const xs = rowIds.map((id) => cache[id].cx)
      const rowMinX = Math.min(...xs)
      const rowMaxX = Math.max(...xs)
      const rowCenterX = (rowMinX + rowMaxX) / 2
      const halfWidth = (rowMaxX - rowMinX) / 2 || 1

      rowIds.forEach((id) => {
        const slotEl = slotRefs.current[id]
        if (!slotEl) return
        const normalizedDist = Math.min(
          Math.abs(cache[id].cx - rowCenterX) / halfWidth,
          1,
        )
        const factor = Math.cos((normalizedDist * Math.PI) / 2)
        const stagger = -MAX_STAGGER * factor
        slotEl.style.transform = stagger !== 0 ? `translateY(${stagger}px)` : ''
      })
    })
  }

  const remeasureAndStagger = () => {
    Object.values(slotRefs.current).forEach((slotEl) => {
      if (slotEl) slotEl.style.transform = ''
    })
    measureSlots()
    applyRestingStagger()
  }

  const applyFocusField = (focalId) => {
    Object.keys(cardRefs.current).forEach((otherId) => {
      const cardEl = cardRefs.current[otherId]
      if (!cardEl) return

      const isFocal = String(otherId) === String(focalId)
      gsap.killTweensOf(cardEl, 'opacity,filter')
      gsap.to(cardEl, {
        opacity: isFocal ? FOCAL_OPACITY : QUIET_OPACITY,
        filter: `brightness(${isFocal ? FOCAL_BRIGHTNESS : QUIET_BRIGHTNESS})`,
        duration: FOCUS_FIELD_DURATION,
        ease: EASE,
        overwrite: 'auto',
      })
    })
  }

  const releaseFocusField = () => {
    Object.values(cardRefs.current).forEach((cardEl) => {
      if (!cardEl) return
      gsap.killTweensOf(cardEl, 'opacity,filter')
      gsap.to(cardEl, {
        opacity: FOCAL_OPACITY,
        filter: `brightness(${FOCAL_BRIGHTNESS})`,
        duration: FOCUS_FIELD_LEAVE_DURATION,
        ease: EASE,
        overwrite: 'auto',
      })
    })
  }

  // ── Step 11: global dark focus overlay ──
  // A single viewport-spanning layer (the `.workshop-focus-overlay` element
  // rendered near the top of the page, positioned absolutely within
  // `pageRef`) whose visible region is controlled entirely through a CSS
  // mask driven by custom properties: --focus-x/--focus-y (the pulse
  // origin, in px relative to the overlay's own box) and
  // --focus-reveal/--focus-hole (radii, in px). This follows the same
  // "GSAP-tweened CSS custom property drives a mask-image" technique the
  // Step 9 activation overlay already uses.
  //
  // The mask paints a dark ring between --focus-hole and --focus-reveal.
  // Growing --focus-reveal from 0 makes the dark region expand outward
  // from the origin (the entrance/"focus" pulse). Growing --focus-hole
  // from 0 (once --focus-reveal already covers the page) eats back into
  // that ring from the same origin (the exit/"clearing" pulse). Treating
  // enter and exit as two ends of the same pair of properties — rather
  // than as separate overlays — is what lets the effect restart cleanly
  // no matter which card triggers it next.

  const computeFocusGeometry = (cardEl) => {
    const overlayEl = focusOverlayRef.current
    if (!overlayEl || !cardEl) return null

    const overlayRect = overlayEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()
    if (overlayRect.width === 0 || overlayRect.height === 0) return null

    const originX = cardRect.left + cardRect.width / 2 - overlayRect.left
    const originY = cardRect.top + cardRect.height / 2 - overlayRect.top
    const dx = Math.max(originX, overlayRect.width - originX)
    const dy = Math.max(originY, overlayRect.height - originY)

    return { x: originX, y: originY, maxRadius: Math.sqrt(dx * dx + dy * dy) }
  }

  const hardResetFocusOverlay = () => {
    if (focusTweenRef.current) {
      focusTweenRef.current.kill()
      focusTweenRef.current = null
    }
    focusEngagedRef.current = false
    const overlayEl = focusOverlayRef.current
    if (overlayEl) {
      gsap.set(overlayEl, {
        opacity: 0,
        '--focus-reveal': 0,
        '--focus-hole': 0,
      })
    }
  }

  const startFocusDarkPulse = (id) => {
    const overlayEl = focusOverlayRef.current
    const cardEl = cardRefs.current[id]
    if (!overlayEl || !cardEl) return

    const geometry = computeFocusGeometry(cardEl)
    if (!geometry) return

    const wasEngaged = focusEngagedRef.current
    focusEngagedRef.current = true
    focusOriginRef.current = { x: geometry.x, y: geometry.y }
    focusMaxRadiusRef.current = geometry.maxRadius

    if (focusTweenRef.current) {
      focusTweenRef.current.kill()
      focusTweenRef.current = null
    }

    // Recenter on the newly focused card immediately, regardless of what
    // state the overlay is currently in.
    gsap.set(overlayEl, {
      '--focus-x': geometry.x,
      '--focus-y': geometry.y,
      opacity: 1,
    })

    if (wasEngaged) {
      // Already dark, or mid-transition (e.g. moving directly from one
      // card to another, or re-entering while a clearing pulse was still
      // running) — glide into full coverage of the new card instead of
      // restarting the slow entrance from scratch. This is what keeps
      // rapid card-to-card movement flicker-free.
      focusTweenRef.current = gsap.to(overlayEl, {
        '--focus-hole': 0,
        '--focus-reveal': geometry.maxRadius,
        duration: FOCUS_RECENTER_DURATION,
        ease: FOCUS_PULSE_EASE,
        overwrite: 'auto',
        onComplete: () => {
          focusTweenRef.current = null
        },
      })
      return
    }

    // Fresh entrance from a fully cleared page.
    gsap.set(overlayEl, { '--focus-reveal': 0, '--focus-hole': 0 })
    focusTweenRef.current = gsap.to(overlayEl, {
      '--focus-reveal': geometry.maxRadius,
      duration: FOCUS_PULSE_DURATION,
      ease: FOCUS_PULSE_EASE,
      overwrite: 'auto',
      onComplete: () => {
        focusTweenRef.current = null
      },
    })
  }

  const startFocusClearPulse = () => {
    const overlayEl = focusOverlayRef.current
    if (!overlayEl || !focusEngagedRef.current) return

    focusEngagedRef.current = false

    const maxRadius = Math.max(focusMaxRadiusRef.current, 1)
    const currentReveal = gsap.getProperty(overlayEl, '--focus-reveal') || 0

    if (focusTweenRef.current) {
      focusTweenRef.current.kill()
      focusTweenRef.current = null
    }

    // Clear from the last focused card's remembered origin — never from
    // the pointer's current position, which may already be outside any
    // card by the time this runs.
    gsap.set(overlayEl, {
      '--focus-x': focusOriginRef.current.x,
      '--focus-y': focusOriginRef.current.y,
    })

    // If the entrance pulse was interrupted before finishing, clear
    // proportionally faster so the motion still reads as a continuous
    // reversal instead of snapping to full darkness first.
    const revealRatio = Math.min(currentReveal / maxRadius, 1) || 0
    const duration = Math.max(FOCUS_CLEAR_DURATION * revealRatio, 0.35)

    focusTweenRef.current = gsap.to(overlayEl, {
      '--focus-hole': Math.max(currentReveal, maxRadius * 0.05),
      duration,
      ease: FOCUS_CLEAR_EASE,
      overwrite: 'auto',
      onComplete: () => {
        focusTweenRef.current = null
        gsap.set(overlayEl, {
          opacity: 0,
          '--focus-reveal': 0,
          '--focus-hole': 0,
        })
      },
    })
  }

  const runCardActivation = (id, e) => {
    const overlayEl = activationOverlayRefs.current[id]
    const frontFaceEl = frontFaceRefs.current[id]
    if (!overlayEl || !frontFaceEl) return

    const feRect = frontFaceEl.getBoundingClientRect()
    if (feRect.width === 0 || feRect.height === 0) return

    const originX = Math.min(
      Math.max(((e.clientX - feRect.left) / feRect.width) * 100, 0),
      100,
    )
    const originY = Math.min(
      Math.max(((e.clientY - feRect.top) / feRect.height) * 100, 0),
      100,
    )

    if (activationTimelineRefs.current[id]) {
      activationTimelineRefs.current[id].kill()
    }

    const tl = gsap.timeline({
      onComplete: () => {
        delete activationTimelineRefs.current[id]
      },
    })
    activationTimelineRefs.current[id] = tl

    tl.set(overlayEl, {
      '--activation-x': `${originX}%`,
      '--activation-y': `${originY}%`,
      '--activation-progress': 0,
      opacity: 1,
    })
    tl.to(
      overlayEl,
      {
        '--activation-progress': 1,
        duration: ACTIVATION_DURATION,
        ease: ACTIVATION_EASE,
      },
      0,
    )
    tl.to(
      overlayEl,
      {
        opacity: 0,
        duration: ACTIVATION_FADE_DURATION,
        ease: 'power1.out',
      },
      ACTIVATION_DURATION - ACTIVATION_FADE_DURATION,
    )
  }

  const resetCardActivation = (id) => {
    const tl = activationTimelineRefs.current[id]
    if (tl) {
      tl.kill()
      delete activationTimelineRefs.current[id]
    }
    const overlayEl = activationOverlayRefs.current[id]
    if (overlayEl) {
      gsap.set(overlayEl, { opacity: 0, '--activation-progress': 0 })
    }
  }

  const resetAllCardActivations = () => {
    Object.keys(activationTimelineRefs.current).forEach((id) => {
      activationTimelineRefs.current[id].kill()
    })
    activationTimelineRefs.current = {}
    Object.values(activationOverlayRefs.current).forEach((overlayEl) => {
      if (overlayEl) {
        gsap.killTweensOf(overlayEl)
        gsap.set(overlayEl, { opacity: 0, '--activation-progress': 0 })
      }
    })
  }

  const getOriginPercent = (e, el) => {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return { x: 50, y: 50 }
    }
    return {
      x: Math.min(
        Math.max(((e.clientX - rect.left) / rect.width) * 100, 0),
        100,
      ),
      y: Math.min(
        Math.max(((e.clientY - rect.top) / rect.height) * 100, 0),
        100,
      ),
    }
  }

  const startCardPulse = (id, originXPercent, originYPercent) => {
    const overlayEl = pulseOverlayRefs.current[id]
    if (!overlayEl) return

    const alreadyPulsing = Boolean(pulseTimelineRefs.current[id])

    if (!alreadyPulsing) {
      gsap.set(overlayEl, {
        '--pulse-x': originXPercent,
        '--pulse-y': originYPercent,
        '--pulse-alpha': 0,
        '--pulse-radius': 0,
        opacity: 1,
      })
    }

    if (!pulseFollowRefs.current[id]) {
      pulseFollowRefs.current[id] = {
        x: gsap.quickTo(overlayEl, '--pulse-x', {
          duration: PULSE_FOLLOW_DURATION,
          ease: 'power2.out',
        }),
        y: gsap.quickTo(overlayEl, '--pulse-y', {
          duration: PULSE_FOLLOW_DURATION,
          ease: 'power2.out',
        }),
      }
    }

    if (alreadyPulsing) return

    const cycle =
      PULSE_CYCLE_MIN + Math.random() * (PULSE_CYCLE_MAX - PULSE_CYCLE_MIN)
    const riseDur = cycle * PULSE_RISE_FRACTION
    const fallDur = cycle - riseDur

    const tl = gsap.timeline({ repeat: -1 })

    tl.to(
      overlayEl,
      {
        '--pulse-alpha': PULSE_PEAK_ALPHA,
        duration: riseDur,
        ease: 'sine.out',
      },
      0,
    )

    tl.to(
      overlayEl,
      {
        '--pulse-radius': PULSE_MAX_RADIUS,
        duration: cycle,
        ease: 'sine.out',
      },
      0,
    )

    tl.to(
      overlayEl,
      {
        '--pulse-alpha': 0,
        duration: fallDur,
        ease: 'sine.in',
      },
      riseDur,
    )

    tl.set(overlayEl, { '--pulse-radius': 0 }, cycle)

    pulseTimelineRefs.current[id] = tl
  }

  const updateCardPulseOrigin = (id, xPercent, yPercent) => {
    const follow = pulseFollowRefs.current[id]
    if (!follow) return

    follow.x(xPercent)
    follow.y(yPercent)
  }

  const stopCardPulse = (id, { fade = true } = {}) => {
    const tl = pulseTimelineRefs.current[id]

    if (tl) {
      tl.kill()
      delete pulseTimelineRefs.current[id]
    }

    delete pulseFollowRefs.current[id]

    const overlayEl = pulseOverlayRefs.current[id]
    if (!overlayEl) return

    gsap.killTweensOf(overlayEl)

    if (fade) {
      gsap.to(overlayEl, {
        '--pulse-alpha': 0,
        duration: PULSE_LEAVE_FADE,
        ease: 'sine.out',
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(overlayEl, {
            '--pulse-radius': 0,
            opacity: 0,
          })
        },
      })
    } else {
      gsap.set(overlayEl, {
        '--pulse-alpha': 0,
        '--pulse-radius': 0,
        opacity: 0,
      })
    }
  }

  const stopAllCardPulses = () => {
    Object.keys(pulseOverlayRefs.current).forEach((id) => {
      stopCardPulse(id, { fade: false })
    })
  }

  const computeCalloutSide = (slotEl) => {
    const rect = slotEl.getBoundingClientRect()
    const needed = CALLOUT_LABEL_WIDTH + CALLOUT_GAP + CALLOUT_STUB + 24
    const spaceRight = window.innerWidth - rect.right
    const spaceLeft = rect.left
    if (spaceRight >= needed) return 'right'
    if (spaceLeft >= needed) return 'left'
    return spaceRight >= spaceLeft ? 'right' : 'left'
  }

  const computeCalloutRaw = (id, side) => {
    const cardEl = cardRefs.current[id]
    if (!cardEl) return null

    const rect = cardEl.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    const cardLeft = rect.left
    const cardTop = rect.top
    const cardRight = rect.right
    const cardCenterY = cardTop + rect.height / 2

    const anchor =
      side === 'right'
        ? { x: cardRight, y: cardCenterY }
        : { x: cardLeft, y: cardCenterY }

    const labelX =
      side === 'right'
        ? cardRight + CALLOUT_GAP
        : cardLeft - CALLOUT_GAP - CALLOUT_LABEL_WIDTH

    let labelY = cardCenterY - CALLOUT_LABEL_HEIGHT_ESTIMATE / 2
    labelY = Math.min(
      Math.max(labelY, CALLOUT_VIEWPORT_MARGIN),
      window.innerHeight -
        CALLOUT_LABEL_HEIGHT_ESTIMATE -
        CALLOUT_VIEWPORT_MARGIN,
    )

    return { anchor, labelTarget: { x: labelX, y: labelY } }
  }

  const buildCalloutPath = (anchor, labelAnchor, side) => {
    const stubX =
      side === 'right' ? anchor.x + CALLOUT_STUB : anchor.x - CALLOUT_STUB
    return `M ${anchor.x} ${anchor.y} L ${stubX} ${anchor.y} L ${stubX} ${labelAnchor.y} L ${labelAnchor.x} ${labelAnchor.y}`
  }

  const getCalloutLabelAnchor = (labelX, labelY, side) =>
    side === 'right'
      ? { x: labelX, y: labelY + CALLOUT_LABEL_ANCHOR_OFFSET_Y }
      : {
          x: labelX + CALLOUT_LABEL_WIDTH,
          y: labelY + CALLOUT_LABEL_ANCHOR_OFFSET_Y,
        }

  const randomScrambleChar = () =>
    SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]

  const buildResolveThresholds = (length) => {
    const thresholds = new Array(length)
    for (let i = 0; i < length; i++) {
      const base = length > 1 ? i / (length - 1) : 0
      thresholds[i] = Math.min(base * 0.75 + Math.random() * 0.25, 1)
    }
    return thresholds
  }

  const renderDecodeText = (el, text, thresholds, progress) => {
    if (!el) return
    if (progress >= 1) {
      el.textContent = text
      return
    }
    let out = ''
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch === ' ') {
        out += ch
      } else if (progress >= thresholds[i]) {
        out += ch
      } else {
        out += randomScrambleChar()
      }
    }
    el.textContent = out
  }

  const triggerDecodeAudioHook = () => {}

  const hardResetCallout = () => {
    if (calloutTimelineRef.current) {
      calloutTimelineRef.current.kill()
      calloutTimelineRef.current = null
    }
    calloutAnimatingRef.current = false
    calloutVisibleRef.current = false

    const labelEl = calloutLabelRef.current
    const pathEl = calloutPathRef.current
    if (labelEl) {
      gsap.killTweensOf(labelEl)
      gsap.set(labelEl, { opacity: 0 })
    }
    if (pathEl) {
      gsap.killTweensOf(pathEl)
      gsap.set(pathEl, { opacity: 0 })
    }
  }

  const fadeOutCallout = () => {
    if (!calloutVisibleRef.current) return

    if (calloutTimelineRef.current) {
      calloutTimelineRef.current.kill()
      calloutTimelineRef.current = null
    }
    calloutAnimatingRef.current = false
    calloutVisibleRef.current = false

    const labelEl = calloutLabelRef.current
    const pathEl = calloutPathRef.current

    if (labelEl) {
      gsap.killTweensOf(labelEl)
      gsap.to(labelEl, {
        opacity: 0,
        duration: CALLOUT_EXIT_DURATION,
        ease: EASE,
        overwrite: 'auto',
        onComplete: () => setCalloutWorkshop(null),
      })
    } else {
      setCalloutWorkshop(null)
    }

    if (pathEl) {
      gsap.killTweensOf(pathEl)
      gsap.to(pathEl, {
        opacity: 0,
        duration: CALLOUT_EXIT_DURATION,
        ease: EASE,
        overwrite: 'auto',
      })
    }
  }

  const startCallout = (id, slotEl, workshop) => {
    hardResetCallout()

    const labelEl = calloutLabelRef.current
    const pathEl = calloutPathRef.current
    if (!labelEl || !pathEl) return

    const side = computeCalloutSide(slotEl)
    calloutSideRef.current = side
    setCalloutSide(side)
    setCalloutWorkshop(workshop)

    const titleText = String(workshop.heading ?? 'Untitled').toUpperCase()
    const venueName = workshop.venueName
    const metaText = `${formatDate(workshop.datetime)}${workshop.time ? ` · ${workshop.time}` : ''}${venueName ? ` · ${venueName}` : ''}`
    const descText = String(workshop.description ?? 'No description available')
    const priceText = formatPrice(workshop.price)

    calloutDecodeRef.current = {
      title: {
        text: titleText,
        thresholds: buildResolveThresholds(titleText.length),
      },
      meta: {
        text: metaText,
        thresholds: buildResolveThresholds(metaText.length),
      },
      desc: {
        text: descText,
        thresholds: buildResolveThresholds(descText.length),
      },
      price: {
        text: priceText,
        thresholds: buildResolveThresholds(priceText.length),
      },
    }

    if (calloutTitleRef.current) calloutTitleRef.current.textContent = ''
    if (calloutMetaRef.current) calloutMetaRef.current.textContent = ''
    if (calloutDescRef.current) calloutDescRef.current.textContent = ''
    if (calloutPriceRef.current) calloutPriceRef.current.textContent = ''

    const geometry = computeCalloutRaw(id, side)
    if (!geometry) return

    gsap.set(labelEl, {
      x: geometry.labelTarget.x,
      y: geometry.labelTarget.y,
      opacity: 0,
    })

    const labelAnchor = getCalloutLabelAnchor(
      geometry.labelTarget.x,
      geometry.labelTarget.y,
      side,
    )
    const pathD = buildCalloutPath(geometry.anchor, labelAnchor, side)
    pathEl.setAttribute('d', pathD)
    const length = pathEl.getTotalLength()
    gsap.set(pathEl, {
      opacity: 1,
      strokeDasharray: length,
      strokeDashoffset: length,
    })

    calloutVisibleRef.current = true
    calloutAnimatingRef.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        calloutAnimatingRef.current = false
      },
    })
    calloutTimelineRef.current = tl

    tl.to(
      labelEl,
      { opacity: 1, duration: CALLOUT_CONTAINER_FADE_IN, ease: 'power1.out' },
      0,
    )
    tl.to(
      pathEl,
      {
        strokeDashoffset: 0,
        duration: LINE_DRAW_DURATION,
        ease: LINE_DRAW_EASE,
      },
      0,
    )

    const titleProxy = { p: 0 }
    tl.to(
      titleProxy,
      {
        p: 1,
        duration: TITLE_DECODE_DURATION,
        ease: 'none',
        onStart: triggerDecodeAudioHook,
        onUpdate: () =>
          renderDecodeText(
            calloutTitleRef.current,
            calloutDecodeRef.current.title.text,
            calloutDecodeRef.current.title.thresholds,
            titleProxy.p,
          ),
      },
      TITLE_START,
    )

    const metaProxy = { p: 0 }
    tl.to(
      metaProxy,
      {
        p: 1,
        duration: META_DECODE_DURATION,
        ease: 'none',
        onUpdate: () =>
          renderDecodeText(
            calloutMetaRef.current,
            calloutDecodeRef.current.meta.text,
            calloutDecodeRef.current.meta.thresholds,
            metaProxy.p,
          ),
      },
      META_START,
    )

    const descProxy = { p: 0 }
    tl.to(
      descProxy,
      {
        p: 1,
        duration: DESC_DECODE_DURATION,
        ease: 'none',
        onUpdate: () =>
          renderDecodeText(
            calloutDescRef.current,
            calloutDecodeRef.current.desc.text,
            calloutDecodeRef.current.desc.thresholds,
            descProxy.p,
          ),
      },
      DESC_START,
    )

    const priceProxy = { p: 0 }
    tl.to(
      priceProxy,
      {
        p: 1,
        duration: PRICE_DECODE_DURATION,
        ease: 'none',
        onUpdate: () =>
          renderDecodeText(
            calloutPriceRef.current,
            calloutDecodeRef.current.price.text,
            calloutDecodeRef.current.price.thresholds,
            priceProxy.p,
          ),
      },
      PRICE_START,
    )
  }

  // Continuous propagation ticker
  if (tickRef.current === null) {
    tickRef.current = () => {
      const focalId = focusedIdRef.current
      if (focalId === null) return

      const focalCard = cardRefs.current[focalId]
      const focalRect = rectCacheRef.current[focalId]
      if (!focalCard || !focalRect) return

      const liveX = gsap.getProperty(focalCard, 'x') || 0
      const liveY = gsap.getProperty(focalCard, 'y') || 0
      const focalCx = focalRect.cx + liveX
      const focalCy = focalRect.cy + liveY
      const cellSpacing = focalRect.width + GRID_GAP_PX

      const now = performance.now()
      const rampT = Math.min(1, (now - rampStartRef.current) / RAMP_IN_MS)
      const ramp = rampT * rampT * (3 - 2 * rampT)

      const deltaRatio = gsap.ticker.deltaRatio(60)

      Object.keys(cardRefs.current).forEach((otherId) => {
        if (String(otherId) === String(focalId)) return

        const cardEl = cardRefs.current[otherId]
        const rc = rectCacheRef.current[otherId]
        if (!cardEl || !rc) return

        const dx = rc.cx - focalCx
        const dy = rc.cy - focalCy
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const dirX = dx / dist
        const dirY = dy / dist

        const steps = dist / cellSpacing
        const influence = 1 / (1 + steps * steps * FALLOFF_STRENGTH)

        const targetX = dirX * influence * MAX_SURROUND_DISPLACEMENT * ramp
        const targetY = dirY * influence * MAX_SURROUND_DISPLACEMENT * ramp

        const lagFactor = FAR_LAG + influence * (NEAR_LAG - FAR_LAG)
        const frameFactor = 1 - Math.pow(1 - lagFactor, deltaRatio)

        const curX = gsap.getProperty(cardEl, 'x') || 0
        const curY = gsap.getProperty(cardEl, 'y') || 0

        gsap.set(cardEl, {
          x: curX + (targetX - curX) * frameFactor,
          y: curY + (targetY - curY) * frameFactor,
        })
      })

      if (calloutVisibleRef.current) {
        const side = calloutSideRef.current
        const raw = computeCalloutRaw(focalId, side)
        const labelEl = calloutLabelRef.current
        const pathEl = calloutPathRef.current

        if (raw && labelEl && pathEl) {
          const curLX = gsap.getProperty(labelEl, 'x') || 0
          const curLY = gsap.getProperty(labelEl, 'y') || 0
          const labelFrameFactor =
            1 - Math.pow(1 - CALLOUT_LABEL_LAG, deltaRatio)
          const newLX = curLX + (raw.labelTarget.x - curLX) * labelFrameFactor
          const newLY = curLY + (raw.labelTarget.y - curLY) * labelFrameFactor
          gsap.set(labelEl, { x: newLX, y: newLY })

          const labelAnchor = getCalloutLabelAnchor(newLX, newLY, side)
          pathEl.setAttribute(
            'd',
            buildCalloutPath(raw.anchor, labelAnchor, side),
          )

          if (!calloutAnimatingRef.current) {
            const len = pathEl.getTotalLength()
            pathEl.setAttribute('stroke-dasharray', String(len))
            pathEl.setAttribute('stroke-dashoffset', '0')
          }
        }
      }
    }
  }

  const startTicker = () => {
    if (tickerRunningRef.current) return
    tickerRunningRef.current = true
    gsap.ticker.add(tickRef.current)
  }

  const stopTicker = () => {
    if (!tickerRunningRef.current) return
    tickerRunningRef.current = false
    gsap.ticker.remove(tickRef.current)
  }

  const handleCardEnter = (id, e, workshop) => {
    if (isNavigatingRef.current) return
    if (!isFinePointer.current || prefersReducedMotion.current) return

    const slotEl = slotRefs.current[id]
    const cardEl = cardRefs.current[id]
    if (!slotEl || !cardEl) return

    const idleWeightObj =
      idleWeightsRef.current[id] || (idleWeightsRef.current[id] = { weight: 1 })
    gsap.killTweensOf(idleWeightObj)
    gsap.to(idleWeightObj, {
      weight: 0,
      duration: IDLE_YIELD_DURATION,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    slotEl.style.zIndex = '20'

    const wasFieldActive = fieldActiveRef.current

    if (!wasFieldActive) {
      fieldActiveRef.current = true
      rampStartRef.current = performance.now()
      measureSlots()
      startTicker()
    }

    focusedIdRef.current = id

    const { x, y, rotationX, rotationY } = getPointerResponse(e, slotEl)

    gsap.killTweensOf(
      cardEl,
      'x,y,rotationX,rotationY,scale,z,boxShadow,backgroundColor',
    )
    gsap.to(cardEl, {
      x,
      y,
      rotationX,
      rotationY,
      scale: HOVER_SCALE,
      z: LIFT_Z,
      boxShadow: HOVER_SHADOW,
      backgroundColor: FOCUS_EDGE_BG,
      duration: ENTER_DURATION,
      ease: EASE,
      overwrite: 'auto',
    })

    const frontFaceEl = frontFaceRefs.current[id]
    if (frontFaceEl) {
      gsap.killTweensOf(frontFaceEl)
      gsap.to(frontFaceEl, {
        borderTopColor: FOCUS_EDGE_HIGHLIGHT_TOP,
        borderLeftColor: FOCUS_EDGE_HIGHLIGHT_LEFT,
        duration: ENTER_DURATION,
        ease: EASE,
        overwrite: 'auto',
      })
    }

    applyFocusField(id)
    startFocusDarkPulse(id)
    runCardActivation(id, e)

    const pulseFrontFaceEl = frontFaceRefs.current[id]
    if (pulseFrontFaceEl) {
      const pulseOrigin = getOriginPercent(e, pulseFrontFaceEl)
      startCardPulse(id, pulseOrigin.x, pulseOrigin.y)
    }

    startCallout(id, slotEl, workshop)
  }

  const handleCardMove = (id, e) => {
    if (isNavigatingRef.current) return
    if (!isFinePointer.current || prefersReducedMotion.current) return

    const slotEl = slotRefs.current[id]
    const cardEl = cardRefs.current[id]
    if (!slotEl || !cardEl) return

    const { x, y, rotationX, rotationY } = getPointerResponse(e, slotEl)

    gsap.to(cardEl, {
      x,
      y,
      rotationX,
      rotationY,
      duration: MOVE_DURATION,
      ease: EASE,
      overwrite: 'auto',
    })

    const pulseFrontFaceEl = frontFaceRefs.current[id]
    if (pulseFrontFaceEl) {
      const pulseOrigin = getOriginPercent(e, pulseFrontFaceEl)
      updateCardPulseOrigin(id, pulseOrigin.x, pulseOrigin.y)
    }
  }

  const handleCardLeave = (id) => {
    if (isNavigatingRef.current) return
    if (!isFinePointer.current) return

    const slotEl = slotRefs.current[id]
    const cardEl = cardRefs.current[id]
    if (!slotEl || !cardEl) return

    const idleWeightObj =
      idleWeightsRef.current[id] || (idleWeightsRef.current[id] = { weight: 0 })
    gsap.killTweensOf(idleWeightObj)
    gsap.to(idleWeightObj, {
      weight: 1,
      duration: IDLE_RESTORE_DURATION,
      delay: 0.1,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })

    gsap.killTweensOf(
      cardEl,
      'x,y,rotationX,rotationY,scale,z,boxShadow,backgroundColor',
    )
    gsap.to(cardEl, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      z: 0,
      boxShadow: REST_SHADOW,
      backgroundColor: REST_EDGE_BG,
      duration: LEAVE_DURATION,
      ease: EASE,
      overwrite: 'auto',
    })

    const frontFaceEl = frontFaceRefs.current[id]
    if (frontFaceEl) {
      gsap.killTweensOf(frontFaceEl)
      gsap.to(frontFaceEl, {
        borderTopColor: REST_EDGE_HIGHLIGHT_TOP,
        borderLeftColor: REST_EDGE_HIGHLIGHT_LEFT,
        duration: LEAVE_DURATION,
        ease: EASE,
        overwrite: 'auto',
      })
    }

    slotEl.style.zIndex = '1'
    resetCardActivation(id)
    stopCardPulse(id)

    if (String(focusedIdRef.current) === String(id)) {
      fadeOutCallout()
      focusedIdRef.current = null

      // Defer the clearing pulse by a frame: if the pointer is moving
      // directly into another card, that card's mouseenter has already run
      // synchronously by the time this fires, so focusedIdRef will be
      // non-null again and we skip clearing — this is what avoids a
      // clear-then-regrow flicker when sliding between adjacent cards.
      requestAnimationFrame(() => {
        if (focusedIdRef.current === null) {
          startFocusClearPulse()
        }
      })
    }
  }

  const handleGridLeave = () => {
    if (isNavigatingRef.current) return
    if (!isFinePointer.current) return
    if (!fieldActiveRef.current) return

    fieldActiveRef.current = false
    focusedIdRef.current = null
    stopTicker()

    Object.keys(cardRefs.current).forEach((id) => {
      const cardEl = cardRefs.current[id]
      const slotEl = slotRefs.current[id]
      if (!cardEl) return

      gsap.killTweensOf(cardEl, 'x,y,rotationX,rotationY,scale,z,boxShadow')
      gsap.to(cardEl, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        z: 0,
        boxShadow: REST_SHADOW,
        duration: FIELD_RETURN_DURATION,
        ease: EASE,
        overwrite: 'auto',
      })

      if (slotEl) slotEl.style.zIndex = '1'
    })

    Object.keys(floatRefs.current).forEach((cardId) => {
      const wObj =
        idleWeightsRef.current[cardId] ||
        (idleWeightsRef.current[cardId] = { weight: 0 })
      gsap.killTweensOf(wObj)
      gsap.to(wObj, {
        weight: 1,
        duration: IDLE_RESTORE_DURATION,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    })

    releaseFocusField()
    fadeOutCallout()
    resetAllCardActivations()
    stopAllCardPulses()
    startFocusClearPulse()
  }

  // ── Click → Zoom → Navigate handler ──
  const handleCardClick = (e, id, href, displayImage) => {
    // Step 13: Lock double clicks
    if (isNavigatingRef.current) {
      e.preventDefault()
      return
    }

    // Step 17: Reduced motion check
    if (prefersReducedMotion.current) {
      isNavigatingRef.current = true
      return
    }

    e.preventDefault()
    isNavigatingRef.current = true

    // B4 fix: make the "navigation in progress" state visible and actually
    // block interaction with other cards during the transition, instead of
    // silently swallowing their hover/click events with no feedback.
    if (gridRef.current) {
      gridRef.current.style.pointerEvents = 'none'
      gridRef.current.style.cursor = 'wait'
    }

    // Step 10 & 11: Remove callouts, activation wave, continuous pulse, dark focus overlay
    hardResetCallout()
    resetCardActivation(id)
    stopCardPulse(id, { fade: false })
    stopTicker()
    hardResetFocusOverlay()
    focusedIdRef.current = null

    // Step 1: Capture clicked card's rendered position
    const cardEl = cardRefs.current[id]
    const frontFaceEl = frontFaceRefs.current[id]
    const targetEl = frontFaceEl || cardEl

    if (!targetEl) {
      router.push(href)
      // B1/B4 fix: no custom transition will run for this click (no
      // target element found), so release the lock and busy cursor right
      // away instead of leaving them engaged with nothing left to clear
      // them.
      isNavigatingRef.current = false
      if (gridRef.current) {
        gridRef.current.style.pointerEvents = ''
        gridRef.current.style.cursor = ''
      }
      return
    }

    // Step 2: Lock selected card hover transforms
    if (cardEl) {
      gsap.killTweensOf(cardEl)
    }

    const rect = targetEl.getBoundingClientRect()

    // Step 3: Trigger temporary transition visual layer
    setActiveTransition({
      id,
      href,
      displayImage,
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
    })
  }

  // ── Zoom Animation Effect ──
  useEffect(() => {
    if (!activeTransition) return

    const { id, href } = activeTransition
    const overlayEl = transitionOverlayRef.current
    const imgEl = transitionImgRef.current
    const clickedCard = cardRefs.current[id]

    if (!overlayEl) return

    // Hide original selected card behind temporary transition layer
    if (clickedCard) {
      gsap.set(clickedCard, { opacity: 0 })
    }

    const tl = gsap.timeline()
    transitionTlRef.current = tl

    // 1. Surrounding UI and page text fade to 0 opacity while receding back in 3D space
    if (pageRef.current) {
      tl.to(
        pageRef.current,
        {
          opacity: 0,
          scale: 0.94,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        0,
      )
    }

    // 2. Smoothly expand image overlay to fill viewport edge-to-edge
    tl.to(
      overlayEl,
      {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: '0px',
        boxShadow: '0 0 0px rgba(0,0,0,0)',
        duration: 0.8,
        ease: 'power3.inOut',
      },
      0,
    )
    tl.to(
      imgEl,
      {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      },
      0.18,
    )

    // 3. Subtle camera-push scale on inner image to reinforce moving into the space
    if (imgEl) {
      tl.to(
        imgEl,
        {
          scale: 1.08,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        0,
      )
    }

    // 4. Trigger Next.js navigation cleanly at 85% of timeline completion
    tl.to(
      imgEl,
      {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.inOut',
      },
      0.8,
    )

    tl.add(() => {
      router.push(href)
      // B1/B4 fix: release the navigation lock and restore normal pointer
      // interaction once the push has actually been issued, so an
      // interrupted/failed navigation can't leave hover and click
      // handling permanently disabled.
      isNavigatingRef.current = false
      if (gridRef.current) {
        gridRef.current.style.pointerEvents = ''
        gridRef.current.style.cursor = ''
      }
    }, 1.05)

    return () => {
      if (transitionTlRef.current) {
        transitionTlRef.current.kill()
        transitionTlRef.current = null
      }
      // B1/B4 fix: also release the lock/pointer-block if this effect is
      // cleaned up before reaching the push above (e.g. an early unmount).
      isNavigatingRef.current = false
      if (gridRef.current) {
        gridRef.current.style.pointerEvents = ''
        gridRef.current.style.cursor = ''
      }
    }
  }, [activeTransition, router])

  useEffect(() => {
    fieldActiveRef.current = false
    focusedIdRef.current = null
    stopTicker()

    if (pageRef.current) {
      gsap.set(pageRef.current, { opacity: 1, scale: 1 })
    }

    Object.values(cardRefs.current).forEach((cardEl) => {
      if (cardEl) {
        gsap.killTweensOf(cardEl)
        gsap.set(cardEl, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          z: 0,
          scale: 1,
          boxShadow: REST_SHADOW,
          backgroundColor: REST_EDGE_BG,
          opacity: FOCAL_OPACITY,
          filter: `brightness(${FOCAL_BRIGHTNESS})`,
        })
      }
    })
    Object.values(frontFaceRefs.current).forEach((frontFaceEl) => {
      if (frontFaceEl) {
        gsap.killTweensOf(frontFaceEl)
        gsap.set(frontFaceEl, {
          borderTopColor: REST_EDGE_HIGHLIGHT_TOP,
          borderLeftColor: REST_EDGE_HIGHLIGHT_LEFT,
        })
      }
    })
    Object.values(slotRefs.current).forEach((slotEl) => {
      if (slotEl) {
        slotEl.style.zIndex = '1'
      }
    })
    Object.values(floatRefs.current).forEach((floatEl) => {
      if (floatEl) {
        gsap.set(floatEl, { x: 0, y: 0, rotationZ: 0, rotationX: 0 })
      }
    })
    Object.keys(idleWeightsRef.current).forEach((cardId) => {
      const wObj = idleWeightsRef.current[cardId]
      if (wObj) {
        gsap.killTweensOf(wObj)
        wObj.weight = 1
      }
    })

    hardResetCallout()
    setCalloutWorkshop(null)
    resetAllCardActivations()
    stopAllCardPulses()
    hardResetFocusOverlay()
    remeasureAndStagger()

    if (!entranceCompleteRef.current && workshops.length > 0) {
      entranceCompleteRef.current = true

      if (prefersReducedMotion.current) {
        return
      }

      const sortedIds = Object.keys(cardRefs.current).sort((a, b) => {
        const elA = slotRefs.current[a]
        const elB = slotRefs.current[b]
        if (!elA || !elB) return 0
        const rA = elA.getBoundingClientRect()
        const rB = elB.getBoundingClientRect()
        if (Math.abs(rA.top - rB.top) < 20) return rA.left - rB.left
        return rA.top - rB.top
      })

      if (sortedIds.length === 0) return

      sortedIds.forEach((id, i) => {
        const cardEl = cardRefs.current[id]
        if (!cardEl) return
        const offset = 42 + ((i * 7 + 3) % 29)
        gsap.set(cardEl, { opacity: 0, y: offset })
      })

      const tl = gsap.timeline()
      entranceTlRef.current = tl

      sortedIds.forEach((id, i) => {
        const cardEl = cardRefs.current[id]
        if (!cardEl) return
        tl.to(
          cardEl,
          {
            opacity: FOCAL_OPACITY,
            y: 0,
            duration: 0.95,
            ease: 'power3.out',
            overwrite: 'auto',
          },
          i * 0.11,
        )
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, workshops])

  useLayoutEffect(() => {
    if (entranceCompleteRef.current) return
    if (workshops.length === 0) return
    Object.values(cardRefs.current).forEach((cardEl) => {
      if (cardEl) cardEl.style.opacity = '0'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshops])

  useEffect(() => {
    const handleResize = () => {
      if (!isFinePointer.current) return
      remeasureAndStagger()

      // Step 11: keep the dark focus overlay correctly centered/sized if
      // the viewport changes while it's engaged, rather than leaving a
      // stale radius computed for the old layout.
      if (focusEngagedRef.current && focusedIdRef.current !== null) {
        const cardEl = cardRefs.current[focusedIdRef.current]
        const overlayEl = focusOverlayRef.current
        if (cardEl && overlayEl) {
          const geometry = computeFocusGeometry(cardEl)
          if (geometry) {
            focusOriginRef.current = { x: geometry.x, y: geometry.y }
            focusMaxRadiusRef.current = geometry.maxRadius
            gsap.set(overlayEl, {
              '--focus-x': geometry.x,
              '--focus-y': geometry.y,
              '--focus-reveal': geometry.maxRadius,
            })
          }
        }
      }
    }
    const handleScroll = () => {
      if (fieldActiveRef.current) {
        measureSlots()
      }
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      stopTicker()
      resetAllCardActivations()
      stopAllCardPulses()
      hardResetCallout()
      hardResetFocusOverlay()
      if (idleTickRef.current) {
        gsap.ticker.remove(idleTickRef.current)
      }
      if (entranceTlRef.current) {
        entranceTlRef.current.kill()
        entranceTlRef.current = null
      }
      if (transitionTlRef.current) {
        transitionTlRef.current.kill()
        transitionTlRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!backendEnabled) {
    return (
      <BackendStatus
        title='Workshops coming soon'
        message='Workshop details will be available soon.'
      />
    )
  }

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Kolkata',
        })
      : 'TBA'

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true)
        // Published only; prices are paise — format with formatPrice. See lib/events.
        setWorkshops(await fetchEvents('workshops'))
        setError(null)
      } catch (err) {
        console.error('Error fetching workshops:', err)
        setError(err.message || 'Failed to load workshops')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkshops()
  }, [])

  // B2 fix: search/filter/sort was previously recomputed on every render —
  // including renders triggered purely by hover state (setCalloutWorkshop /
  // setCalloutSide firing on every mouseenter/mousemove), which forced this
  // full filter+sort pass over the whole workshop list on every hover.
  // Memoizing on [workshops, searchQuery] means it now only recomputes when
  // the data or the search text actually changes.
  const sortedWorkshops = useMemo(() => {
    const searched = workshops.filter((workshop) =>
      (workshop.heading ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    )
    // Sort: real images first, dummy ones (ending with "-DUMMY.jpg") last
    return [
      ...searched.filter((w) => !w.picture?.trim().endsWith('-DUMMY.jpg')),
      ...searched.filter((w) => w.picture?.trim().endsWith('-DUMMY.jpg')),
    ]
  }, [workshops, searchQuery])

  if (loading) {
    return (
      <div className='bg-transparent min-h-screen py-16 px-4 sm:px-8 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent'></div>
          <p className='mt-4 text-gray-300'>Loading workshops...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-transparent min-h-screen py-16 px-4 sm:px-8 flex items-center justify-center'>
        <div className='text-center text-red-500'>
          <p className='text-xl font-semibold'>Error loading workshops</p>
          <p className='mt-2'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={pageRef}
      className='bg-transparent min-h-screen pt-24 sm:pt-28 pb-4 sm:pb-10 px-4 sm:px-8 lg:px-12 text-white'
      style={{ position: 'relative' }}
    >
      {/* Step 11: global dark focus overlay. Sits above resting cards
          (z-index 1) and below the focused card (z-index 20) — see
          FOCUS_OVERLAY_Z. Purely visual: pointer-events are disabled so it
          never blocks clicks, links, or hover detection underneath it. */}
      <div
        ref={focusOverlayRef}
        aria-hidden='true'
        className='workshop-focus-overlay'
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: FOCUS_OVERLAY_Z,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      <div className='mx-auto max-w-7xl mb-12'>
        <Link
          href='/'
          className='text-sm font-medium text-gray-500 hover:text-white transition-colors'
        >
          ← Home
        </Link>

        <div className='mb-12 border-b border-white/20 pb-4'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <h1 className='pp-fragment text-4xl sm:text-5xl md:text-6xl text-center md:text-left tracking-wide text-white uppercase md:mt-3'>
              WORKSHOPS
            </h1>

            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search For Workshops'
              className='w-full md:max-w-lg p-4 bg-black/30 border border-white/30 rounded-full shadow-inner focus:ring-white focus:border-white'
            />
          </div>
        </div>
      </div>

      {/* ── Card field ── */}
      <div className='mx-auto max-w-7xl'>
        {sortedWorkshops.length === 0 ? (
          <p className='text-center text-gray-300 text-lg'>
            No workshops found matching your search.
          </p>
        ) : (
          <div
            ref={gridRef}
            className='grid justify-center'
            onMouseLeave={handleGridLeave}
            style={{
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '1rem 0 4rem',
            }}
          >
            {sortedWorkshops.map((workshop, index) => {
              const {
                id,
                heading,
                description,
                price,
                datetime,
                time,
                venueName,
                picture,
              } = workshop

              const displayImage =
                !picture ||
                picture.trim().endsWith('-DUMMY.jpg') ||
                picture.trim() === '/images/workshops.jpg'
                  ? MOCK_WORKSHOP_IMAGES[index % MOCK_WORKSHOP_IMAGES.length]
                  : picture

              const workshopHref = `/workshops/${id}`

              return (
                <div
                  key={id}
                  ref={(el) => {
                    if (el) slotRefs.current[id] = el
                    else delete slotRefs.current[id]
                  }}
                  onMouseEnter={(e) => handleCardEnter(id, e, workshop)}
                  onMouseMove={(e) => handleCardMove(id, e)}
                  onMouseLeave={() => handleCardLeave(id)}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(0, 0, 0, 0.001)',
                    perspective: '1000px',
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) floatRefs.current[id] = el
                      else delete floatRefs.current[id]
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      willChange: 'transform',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      ref={(el) => {
                        if (el) cardRefs.current[id] = el
                        else delete cardRefs.current[id]
                      }}
                      style={{
                        background: REST_EDGE_BG,
                        borderRadius: '6px',
                        boxShadow: REST_SHADOW,
                        opacity: FOCAL_OPACITY,
                        filter: `brightness(${FOCAL_BRIGHTNESS})`,
                        willChange: 'transform, box-shadow, opacity, filter',
                        transformOrigin: 'center center',
                      }}
                    >
                      <div
                        ref={(el) => {
                          if (el) frontFaceRefs.current[id] = el
                          else delete frontFaceRefs.current[id]
                        }}
                        style={{
                          position: 'relative',
                          background: 'transparent',
                          borderRadius: '6px 5px 4px 5px',
                          overflow: 'hidden',
                          marginBottom: '5px',
                          marginRight: '3px',
                          borderTop: '1px solid rgba(255,255,255,0)',
                          borderLeft: '1px solid rgba(255,255,255,0)',
                        }}
                      >
                        <Link
                          href={workshopHref}
                          className='block'
                          onClick={(e) =>
                            handleCardClick(e, id, workshopHref, displayImage)
                          }
                        >
                          {/* Every card is the same 2:3 poster slot with the
                              picture contained inside it. Nothing is drawn
                              behind the image — a poster that isn't exactly
                              2:3 just leaves transparent space. */}
                          <div
                            style={{
                              position: 'relative',
                              aspectRatio: CARD_ASPECT_RATIO,
                              overflow: 'hidden',
                            }}
                          >
                            {/* Unpublished: still animates like any card. */}
                            {workshop.isClosed ? <ClosedBanner /> : null}
                            <img
                              src={displayImage}
                              alt={heading ?? 'Workshop'}
                              loading='lazy'
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          </div>

                          <div
                            className='workshop-static-info'
                            style={{ padding: '10px 12px' }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: '#fff',
                              }}
                            >
                              {heading ?? 'Untitled'}
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.6)',
                                marginTop: '4px',
                              }}
                            >
                              {formatDate(datetime)}
                              {time ? ` · ${time}` : ''}
                              {venueName ? ` · ${venueName}` : ''}
                            </div>
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.75)',
                                marginTop: '6px',
                              }}
                            >
                              {description ?? 'No description available'}
                            </div>
                            <div
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: '#fff',
                                marginTop: '6px',
                              }}
                            >
                              {formatPrice(price)}
                            </div>
                          </div>
                        </Link>

                        {/* Step 10: continuous digital pulse */}
                        <div
                          ref={(el) => {
                            if (el) pulseOverlayRefs.current[id] = el
                            else delete pulseOverlayRefs.current[id]
                          }}
                          className='workshop-pulse-overlay'
                          aria-hidden='true'
                        />

                        {/* Step 9: digital activation overlay */}
                        <div
                          ref={(el) => {
                            if (el) activationOverlayRefs.current[id] = el
                            else delete activationOverlayRefs.current[id]
                          }}
                          className='workshop-activation-overlay'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Temporary Transition Portal Element ── */}
      {mounted &&
        activeTransition &&
        createPortal(
          <div
            ref={transitionOverlayRef}
            style={{
              position: 'fixed',
              left: `${activeTransition.rect.left}px`,
              top: `${activeTransition.rect.top}px`,
              width: `${activeTransition.rect.width}px`,
              height: `${activeTransition.rect.height}px`,
              zIndex: 99999,
              overflow: 'hidden',
              borderRadius: '6px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              pointerEvents: 'none',
              willChange: 'left, top, width, height, border-radius',
            }}
          >
            <img
              ref={transitionImgRef}
              src={activeTransition.displayImage}
              alt='Transitioning Workshop'
              style={{
                width: '100%',
                height: '100%',
                // Matches the card's fit, so the zoom doesn't re-crop the
                // image the moment the transition starts.
                objectFit: 'contain',
                display: 'block',
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            />
          </div>,
          document.body,
        )}

      {/* ── Step 6: technical annotation/callout overlay ── */}
      {mounted &&
        createPortal(
          <div
            ref={calloutOverlayRef}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9999,
              overflow: 'hidden',
            }}
            aria-hidden='true'
          >
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <path
                ref={calloutPathRef}
                fill='none'
                stroke='rgba(255,255,255,0.5)'
                strokeWidth='1'
                strokeLinecap='butt'
                strokeLinejoin='miter'
                style={{ opacity: 0 }}
              />
            </svg>

            <div
              ref={calloutLabelRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${CALLOUT_LABEL_WIDTH}px`,
                opacity: 0,
                textAlign: calloutSide === 'left' ? 'right' : 'left',
                willChange: 'transform, opacity',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-24px -32px',
                  background:
                    'radial-gradient(ellipse at center, rgba(6, 7, 12, 0.32) 0%, rgba(6, 7, 12, 0.16) 48%, rgba(6, 7, 12, 0) 78%)',
                  pointerEvents: 'none',
                  zIndex: -1,
                  borderRadius: '9999px',
                }}
                aria-hidden='true'
              />

              {calloutWorkshop && (
                <>
                  <div
                    ref={calloutTitleRef}
                    style={{
                      fontSize: '1.18rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      lineHeight: 1.25,
                      textShadow:
                        '0 1px 3px rgba(0,0,0,0.98), 0 2px 10px rgba(0,0,0,0.9)',
                    }}
                  />
                  <div
                    ref={calloutMetaRef}
                    style={{
                      marginTop: '8px',
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                      fontSize: '0.72rem',
                      letterSpacing: '0.04em',
                      color: 'rgba(255,255,255,0.72)',
                      lineHeight: 1.45,
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                    }}
                  />
                  <div
                    style={{
                      marginTop: '12px',
                      marginBottom: '12px',
                      width: '32px',
                      height: '1px',
                      background: 'rgba(255,255,255,0.32)',
                      marginLeft: calloutSide === 'left' ? 'auto' : 0,
                    }}
                  />
                  <div
                    ref={calloutDescRef}
                    style={{
                      fontSize: '1.04rem',
                      fontWeight: 450,
                      letterSpacing: '0.012em',
                      color: 'rgba(255,255,255,0.95)',
                      lineHeight: 1.54,
                      textShadow:
                        '0 1px 3px rgba(0,0,0,0.98), 0 2px 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.7)',
                    }}
                  />
                  <div
                    ref={calloutPriceRef}
                    style={{
                      marginTop: '16px',
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                      fontSize: '0.96rem',
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      color: '#ffffff',
                      textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                    }}
                  />
                </>
              )}
            </div>
          </div>,
          document.body,
        )}

      <style jsx>{`
        @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
          .workshop-static-info {
            display: none;
          }
        }

        .workshop-focus-overlay {
          background: ${FOCUS_OVERLAY_COLOR};
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-image: radial-gradient(
            circle at calc(var(--focus-x, 0) * 1px)
              calc(var(--focus-y, 0) * 1px),
            transparent 0px,
            transparent calc(var(--focus-hole, 0) * 1px),
            black calc(var(--focus-hole, 0) * 1px + ${FOCUS_MASK_EDGE}px),
            black calc(var(--focus-reveal, 0) * 1px),
            transparent
              calc(var(--focus-reveal, 0) * 1px + ${FOCUS_MASK_EDGE}px),
            transparent 100%
          );
          mask-image: radial-gradient(
            circle at calc(var(--focus-x, 0) * 1px)
              calc(var(--focus-y, 0) * 1px),
            transparent 0px,
            transparent calc(var(--focus-hole, 0) * 1px),
            black calc(var(--focus-hole, 0) * 1px + ${FOCUS_MASK_EDGE}px),
            black calc(var(--focus-reveal, 0) * 1px),
            transparent
              calc(var(--focus-reveal, 0) * 1px + ${FOCUS_MASK_EDGE}px),
            transparent 100%
          );
        }

        .workshop-pulse-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 0;
          z-index: 1;
          border-radius: inherit;
          background: radial-gradient(
            circle at calc(var(--pulse-x, 50) * 1%)
              calc(var(--pulse-y, 50) * 1%),
            rgba(255, 255, 255, var(--pulse-alpha, 0)) 0%,
            rgba(255, 255, 255, 0) calc(var(--pulse-radius, 0) * 1%)
          );
        }

        .workshop-activation-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 0;
          z-index: 2;
          border-radius: inherit;
        }

        .workshop-activation-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at var(--activation-x, 50%) var(--activation-y, 50%),
            transparent
              calc(
                var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}% -
                  ${ACTIVATION_RING_BAND}%
              ),
            rgba(255, 255, 255, ${ACTIVATION_GLOW_ALPHA})
              calc(var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}%),
            transparent
              calc(
                var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}% +
                  ${ACTIVATION_RING_BAND}%
              )
          );
          mix-blend-mode: screen;
        }

        .workshop-activation-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.9) 0px,
              rgba(255, 255, 255, 0.9) 1px,
              transparent 1px,
              transparent ${ACTIVATION_GRID_CELL}px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.9) 0px,
              rgba(255, 255, 255, 0.9) 1px,
              transparent 1px,
              transparent ${ACTIVATION_GRID_CELL}px
            );
          opacity: ${ACTIVATION_GRID_ALPHA};
          mix-blend-mode: overlay;
          -webkit-mask-image: radial-gradient(
            circle at var(--activation-x, 50%) var(--activation-y, 50%),
            transparent
              calc(
                var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}% -
                  ${ACTIVATION_GRID_BAND}%
              ),
            black
              calc(var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}%),
            transparent
              calc(
                var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}% +
                  ${ACTIVATION_GRID_BAND}%
              )
          );
          mask-image: radial-gradient(
            circle at var(--activation-x, 50%) var(--activation-y, 50%),
            transparent
              calc(
                var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}% -
                  ${ACTIVATION_GRID_BAND}%
              ),
            black
              calc(var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}%),
            transparent
              calc(
                var(--activation-progress, 0) * ${ACTIVATION_RING_SPREAD}% +
                  ${ACTIVATION_GRID_BAND}%
              )
          );
        }
      `}</style>
    </div>
  )
}
