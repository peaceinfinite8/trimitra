import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const JOURNEY_MILESTONES = [
  {
    year: '2017',
    title: 'Trimitra Didirikan',
    description:
      'Dimulai sebagai tim spesialis produksi display dengan fokus pada kualitas eksekusi lapangan.',
    highlight: 'Fondasi kualitas eksekusi',
  },
  {
    year: '2018',
    title: 'Ekspansi Event Organizer',
    description:
      'Melayani aktivasi brand skala regional, dari perencanaan konsep hingga manajemen operasional acara.',
    highlight: 'Scale-up layanan event',
  },
  {
    year: '2020',
    title: 'Masuk Billboard & Outdoor',
    description:
      'Menambah layanan media promosi outdoor berbasis lokasi strategis dan pendekatan kampanye terukur.',
    highlight: 'Ekspansi media promosi',
  },
  {
    year: '2022',
    title: 'Integrasi Creative + Production',
    description:
      'Menyatukan tim desain, fabrication, dan instalasi untuk mempercepat workflow dari ide ke eksekusi.',
    highlight: 'Pipeline terintegrasi',
  },
  {
    year: '2024',
    title: 'Skala Nasional',
    description:
      'Menangani proyek lintas kota dengan standar produksi konsisten untuk booth, event, dan media outdoor.',
    highlight: 'Operasi lintas kota',
  },
  {
    year: 'Sekarang',
    title: 'Partner Pertumbuhan Brand',
    description:
      'Berfokus pada dampak brand experience yang relevan, presisi produksi, dan kolaborasi jangka panjang.',
    highlight: 'Brand impact berkelanjutan',
  },
]

const RIBBON_WIDTH = 1000
const RIBBON_TOP_PADDING = 150
const RIBBON_BOTTOM_PADDING = 170
const RIBBON_STEP_GAP = 320
const RIBBON_BASE_AMPLITUDE = 170

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getStationProgress(count) {
  if (count <= 1) return [0.5]
  const start = 0.04
  const end = 0.965
  const span = end - start
  return Array.from({ length: count }, (_, index) => start + (span * index) / (count - 1))
}

function getRibbonPoint(progress, height, amplitude, swing) {
  const y = RIBBON_TOP_PADDING + progress * (height - RIBBON_TOP_PADDING - RIBBON_BOTTOM_PADDING)
  const baseX = RIBBON_WIDTH * 0.5
  const wavePrimary = Math.sin((progress * 2.18 + swing) * Math.PI) * amplitude
  const waveSecondary = Math.sin((progress * 5.36 + swing * 1.6) * Math.PI) * amplitude * 0.18
  return {
    x: baseX + wavePrimary + waveSecondary,
    y,
  }
}

function toSmoothPath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`
  }

  const penultimate = points[points.length - 2]
  const last = points[points.length - 1]
  path += ` Q ${penultimate.x} ${penultimate.y} ${last.x} ${last.y}`
  return path
}

function buildRibbonPath(height, amplitude, swing) {
  const segmentCount = 22
  const points = []

  for (let index = 0; index <= segmentCount; index += 1) {
    const progress = index / segmentCount
    points.push(getRibbonPoint(progress, height, amplitude, swing))
  }

  return toSmoothPath(points)
}

function getActiveIndexFromProgress(progress, steps) {
  if (!steps.length) return 0

  let active = 0
  for (let index = 1; index < steps.length; index += 1) {
    const boundary = (steps[index - 1] + steps[index]) * 0.5
    if (progress >= boundary) {
      active = index
    }
  }

  return active
}

function placeStationNode(
  node,
  point,
  index,
  stepProgress,
  amplitude,
  swing,
  stageWidth,
  timelineHeight,
  motionRefs,
  immediate = false,
) {
  if (!node) return

  const nodeMotions = motionRefs || []
  const currentMotion = nodeMotions[index] || {
    x: point.x,
    y: point.y,
  }

  const blend = immediate ? 1 : 0.2
  currentMotion.x += (point.x - currentMotion.x) * blend
  currentMotion.y += (point.y - currentMotion.y) * blend
  nodeMotions[index] = currentMotion

  node.style.setProperty('--station-x', `${(currentMotion.x / RIBBON_WIDTH) * 100}%`)
  node.style.setProperty('--station-y', `${currentMotion.y}px`)

  const sample = 0.008
  const prevPoint = getRibbonPoint(clamp(stepProgress - sample, 0, 1), timelineHeight, amplitude, swing)
  const nextPoint = getRibbonPoint(clamp(stepProgress + sample, 0, 1), timelineHeight, amplitude, swing)

  const prevX = (prevPoint.x / RIBBON_WIDTH) * stageWidth
  const nextX = (nextPoint.x / RIBBON_WIDTH) * stageWidth
  const hereX = (currentMotion.x / RIBBON_WIDTH) * stageWidth

  const tangentX = nextX - prevX
  const tangentY = nextPoint.y - prevPoint.y
  const tangentLength = Math.hypot(tangentX, tangentY) || 1

  const normalX = -tangentY / tangentLength
  const normalY = tangentX / tangentLength
  const desiredSide = index % 2 === 0 ? 'left' : 'right'

  const normalOffset = 74
  const candidateA = { x: normalX * normalOffset, y: normalY * normalOffset }
  const candidateB = { x: -normalX * normalOffset, y: -normalY * normalOffset }

  const pickA = desiredSide === 'left' ? hereX + candidateA.x < hereX + candidateB.x : hereX + candidateA.x > hereX + candidateB.x
  const picked = pickA ? candidateA : candidateB

  node.style.setProperty('--journey-panel-shift-x', `${picked.x.toFixed(2)}px`)
  node.style.setProperty('--journey-panel-shift-y', `${picked.y.toFixed(2)}px`)
}

function JourneyTimelineSection() {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [revealedStations, setRevealedStations] = useState(() =>
    JOURNEY_MILESTONES.map(() => prefersReducedMotion),
  )

  const viewportRef = useRef(null)
  const introRef = useRef(null)
  const activeFocusRef = useRef(null)
  const stageRef = useRef(null)
  const ribbonRef = useRef(null)
  const glowRef = useRef(null)
  const progressRef = useRef(null)
  const orbRef = useRef(null)
  const milestoneRefs = useRef([])
  const stationMotionRefs = useRef([])
  const activeIndexRef = useRef(0)
  const revealedStationsRef = useRef(revealedStations)
  const progressLengthRef = useRef(0)
  const activeFocusFollowRef = useRef(0)

  const timelineHeight = useMemo(
    () => RIBBON_TOP_PADDING + RIBBON_BOTTOM_PADDING + (JOURNEY_MILESTONES.length - 1) * RIBBON_STEP_GAP,
    [],
  )
  const stationProgress = useMemo(() => getStationProgress(JOURNEY_MILESTONES.length), [])

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useLayoutEffect(() => {
    revealedStationsRef.current = revealedStations
  }, [revealedStations])

  useLayoutEffect(() => {
    const next = JOURNEY_MILESTONES.map(() => prefersReducedMotion)
    revealedStationsRef.current = next
    setRevealedStations(next)
  }, [prefersReducedMotion, stationProgress, timelineHeight])

  useLayoutEffect(() => {
    const ribbon = ribbonRef.current
    const glow = glowRef.current
    const progressPath = progressRef.current
    const orb = orbRef.current

    if (!ribbon || !glow || !progressPath || !orb) return undefined

    const defaultPath = buildRibbonPath(timelineHeight, RIBBON_BASE_AMPLITUDE, 0)
    ribbon.setAttribute('d', defaultPath)
    glow.setAttribute('d', defaultPath)
    progressPath.setAttribute('d', defaultPath)

    const length = progressPath.getTotalLength()
    progressLengthRef.current = length
    progressPath.style.strokeDasharray = `${length}`
    progressPath.style.strokeDashoffset = `${length}`

    const initialPoint = getRibbonPoint(0, timelineHeight, RIBBON_BASE_AMPLITUDE, 0)
    orb.style.left = `${(initialPoint.x / RIBBON_WIDTH) * 100}%`
    orb.style.top = `${initialPoint.y}px`
    orb.style.transform = 'translate(-50%, -50%)'

    milestoneRefs.current.forEach((node, index) => {
      if (!node) return
      const stepProgress = stationProgress[index]
      const point = getRibbonPoint(stepProgress, timelineHeight, RIBBON_BASE_AMPLITUDE, 0)
      placeStationNode(
        node,
        point,
        index,
        stepProgress,
        RIBBON_BASE_AMPLITUDE,
        0,
        stageRef.current?.clientWidth || 1,
        timelineHeight,
        stationMotionRefs.current,
        true,
      )
    })

    if (activeFocusRef.current) {
      activeFocusFollowRef.current = 0
      activeFocusRef.current.style.setProperty('--journey-active-follow-y', '0px')
    }

    return undefined
  }, [prefersReducedMotion, stationProgress, timelineHeight])

  useLayoutEffect(() => {
    if (prefersReducedMotion) return undefined

    let disposed = false
    let cleanup = () => { }

    const init = async () => {
      const gsapModule = await import('gsap')
      const scrollTriggerModule = await import('gsap/ScrollTrigger')
      if (disposed) return

      const gsap = gsapModule.default || gsapModule.gsap
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default
      if (!gsap || !ScrollTrigger) return

      gsap.registerPlugin(ScrollTrigger)

      const viewport = viewportRef.current
      const stage = stageRef.current
      const intro = introRef.current
      const activeFocus = activeFocusRef.current
      const ribbon = ribbonRef.current
      const glow = glowRef.current
      const progress = progressRef.current
      const orb = orbRef.current
      const milestones = milestoneRefs.current.filter(Boolean)
      if (!viewport || !stage || !ribbon || !glow || !progress || !orb || milestones.length === 0) return

      const triggers = []
      const tweens = []
      const followMetrics = {
        isCompact: false,
        baseTop: 0,
        focusHeight: 0,
        minFollow: 0,
        maxFollow: 0,
      }

      const updateFollowMetrics = () => {
        followMetrics.isCompact = window.matchMedia('(max-width: 980px)').matches

        if (!activeFocus) return

        followMetrics.baseTop = activeFocus.offsetTop
        followMetrics.focusHeight = activeFocus.offsetHeight
        followMetrics.minFollow = -Math.min(Math.max(followMetrics.baseTop - 18, 0), 130)
        followMetrics.maxFollow = Math.max(
          0,
          timelineHeight - RIBBON_BOTTOM_PADDING - followMetrics.focusHeight - followMetrics.baseTop - 6,
        )
      }

      const resetActiveFollow = () => {
        if (!activeFocus) return
        if (activeFocusFollowRef.current !== 0) {
          activeFocusFollowRef.current = 0
          activeFocus.style.setProperty('--journey-active-follow-y', '0px')
        }
      }

      const positionStations = () => {
        const stageWidth = stage.clientWidth || 1
        stationProgress.forEach((stepProgress, index) => {
          const point = getRibbonPoint(stepProgress, timelineHeight, RIBBON_BASE_AMPLITUDE, 0)
          const milestone = milestones[index]
          if (!milestone) return
          placeStationNode(
            milestone,
            point,
            index,
            stepProgress,
            RIBBON_BASE_AMPLITUDE,
            0,
            stageWidth,
            timelineHeight,
            stationMotionRefs.current,
            true,
          )
        })
      }

      const updateActiveFocusFollow = (orbPoint) => {
        if (!activeFocus || !intro) return

        if (followMetrics.isCompact) {
          resetActiveFollow()
          return
        }

        const targetTop = orbPoint.y - followMetrics.focusHeight * 0.5
        const followY = clamp(targetTop - followMetrics.baseTop, followMetrics.minFollow, followMetrics.maxFollow)

        if (Math.abs(followY - activeFocusFollowRef.current) < 0.45) return

        activeFocusFollowRef.current = followY
        activeFocus.style.setProperty('--journey-active-follow-y', `${followY.toFixed(2)}px`)
      }

      const setTimelineState = (progressValue) => {
        const normalized = clamp(progressValue, 0, 1)
        const totalLength = progressLengthRef.current || progress.getTotalLength()
        progressLengthRef.current = totalLength
        progress.style.strokeDashoffset = `${(1 - normalized) * totalLength}`

        const orbPoint = getRibbonPoint(normalized, timelineHeight, RIBBON_BASE_AMPLITUDE, 0)
        orb.style.left = `${(orbPoint.x / RIBBON_WIDTH) * 100}%`
        orb.style.top = `${orbPoint.y}px`
        updateActiveFocusFollow(orbPoint)

        const nextActiveIndex = getActiveIndexFromProgress(normalized, stationProgress)

        if (!prefersReducedMotion) {
          const nextRevealed = [...revealedStationsRef.current]
          let hasRevealChange = false

          stationProgress.forEach((stepProgress, index) => {
            const revealThreshold = stepProgress - 0.012
            if (normalized >= revealThreshold && !nextRevealed[index]) {
              nextRevealed[index] = true
              hasRevealChange = true
            }
          })

          if (hasRevealChange) {
            revealedStationsRef.current = nextRevealed
            setRevealedStations(nextRevealed)
          }
        }

        if (nextActiveIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextActiveIndex
          setActiveIndex(nextActiveIndex)
        }
      }

      updateFollowMetrics()
      positionStations()
      setTimelineState(0)

      triggers.push(
        ScrollTrigger.create({
          trigger: stage,
          start: 'top 68%',
          end: 'bottom 44%',
          scrub: 0.65,
          onUpdate(self) {
            setTimelineState(self.progress)
          },
          onRefresh(self) {
            updateFollowMetrics()
            positionStations()
            setTimelineState(self.progress)
          },
        }),
      )

      cleanup = () => {
        tweens.forEach((tween) => tween.kill())
        triggers.forEach((trigger) => trigger.kill())
      }
    }

    init()

    return () => {
      disposed = true
      cleanup()
    }
  }, [prefersReducedMotion, stationProgress, timelineHeight])

  const activeMilestone = JOURNEY_MILESTONES[activeIndex] || JOURNEY_MILESTONES[0]

  return (
    <section className="section journey-timeline-section journey-ribbon-mode">
      <div className="journey-timeline-ambient" aria-hidden="true">
        <span className="journey-ambient-orb orb-a" data-journey-ambient data-depth="0.8" />
        <span className="journey-ambient-orb orb-b" data-journey-ambient data-depth="1.1" />
        <span className="journey-ambient-orb orb-c" data-journey-ambient data-depth="1.5" />
      </div>

      <div className="container journey-timeline-shell" ref={viewportRef}>
        <div className="journey-timeline-intro" ref={introRef}>
          <p className="kicker">Perjalanan Trimitra</p>
          <h2 className="journey-timeline-title">Timeline Perjalanan Trimitra</h2>
          <p className="muted journey-timeline-copy">
            Sejak 2017, kami bertumbuh dari studio produksi sederhana hingga menjadi partner eksekusi brand experience lintas kota.
            Setiap fase membentuk cara kami bekerja: cepat, presisi, dan berorientasi hasil.
          </p>

          <div className="journey-active-focus" ref={activeFocusRef}>
            <p className="journey-active-label">Chapter Aktif</p>
            <div className="journey-active-stage" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${activeMilestone.year}-${activeMilestone.title}`}
                  className="journey-active-swap"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="journey-active-year">{activeMilestone.year}</p>
                  <p className="journey-active-title">{activeMilestone.title}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div
          className="journey-ribbon-stage"
          ref={stageRef}
          style={{ '--journey-ribbon-height': `${timelineHeight}px` }}
        >
          <svg
            className="journey-ribbon-svg"
            viewBox={`0 0 ${RIBBON_WIDTH} ${timelineHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="journeyRibbonBase" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--svg-ribbon-base-start)" />
                <stop offset="55%" stopColor="var(--svg-ribbon-base-mid)" />
                <stop offset="100%" stopColor="var(--svg-ribbon-base-end)" />
              </linearGradient>
              <linearGradient id="journeyRibbonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--svg-ribbon-glow-start)" />
                <stop offset="40%" stopColor="var(--svg-ribbon-glow-mid)" />
                <stop offset="100%" stopColor="var(--svg-ribbon-glow-end)" />
              </linearGradient>
            </defs>
            <path className="journey-ribbon-backdrop" ref={ribbonRef} />
            <path className="journey-ribbon-glow" ref={glowRef} />
            <path className="journey-ribbon-progress" ref={progressRef} />
          </svg>

          <span className="journey-ribbon-orb" ref={orbRef} aria-hidden="true" />

          <ol className="journey-ribbon-stations">
            {JOURNEY_MILESTONES.map((milestone, index) => (
              <li
                key={`${milestone.year}-${milestone.title}`}
                ref={(node) => {
                  milestoneRefs.current[index] = node
                }}
                className={`journey-station ${index % 2 === 0 ? 'is-left' : 'is-right'} ${index === activeIndex ? 'is-active' : ''
                  } ${index < activeIndex ? 'is-passed' : ''} ${revealedStations[index] ? 'is-revealed' : ''}`}
                style={{
                  '--station-x': `${(getRibbonPoint(stationProgress[index], timelineHeight, RIBBON_BASE_AMPLITUDE, 0).x /
                      RIBBON_WIDTH) *
                    100
                    }%`,
                  '--station-y': `${getRibbonPoint(stationProgress[index], timelineHeight, RIBBON_BASE_AMPLITUDE, 0).y}px`,
                }}
              >
                <span className="journey-station-anchor" aria-hidden="true" />
                <article
                  className="journey-station-panel"
                  data-depth={index % 3 === 0 ? '1.25' : index % 3 === 1 ? '1' : '0.82'}
                >
                  <div className="journey-station-panel-inner">
                    <p className="journey-station-year">{milestone.year}</p>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                    <p className="journey-station-highlight">{milestone.highlight}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default JourneyTimelineSection
