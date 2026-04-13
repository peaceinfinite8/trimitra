import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SectionReveal } from '../animation/Reveal'

const VALUES = [
  {
    id: '01',
    title: 'Material Berkualitas Tinggi',
    description: 'Kami menyaring bahan konstruksi terbaik untuk ketahanan jangka panjang dan estetika yang tetap relevan.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
    stat: '98% on-time handover',
    label: 'Quality Assurance',
    ctaLabel: 'Konsultasi Material',
    ctaTo: '/kontak-kami',
  },
  {
    id: '02',
    title: 'Presisi Arsitektural',
    description: 'Setiap sudut dirancang melalui koordinasi lintas disiplin agar komposisi ruang, struktur, dan estetika tetap harmonis.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    stat: '350+ proyek terukur',
    label: 'Design Precision',
    ctaLabel: 'Lihat Layanan Desain',
    ctaTo: '/layanan',
  },
  {
    id: '03',
    title: 'Manajemen Proyek Transparan',
    description: 'Laporan progres tersusun jelas, milestone terpantau, dan keputusan eksekusi berjalan berbasis data lapangan aktual.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
    stat: 'Realtime progress report',
    label: 'Execution Control',
    ctaLabel: 'Diskusikan Proyek',
    ctaTo: '/kontak-kami',
  },
  {
    id: '04',
    title: 'Garansi Pasca-Bangun',
    description: 'Pendampingan layanan tetap hadir setelah serah terima untuk memastikan performa ruang sesuai standar yang dijanjikan.',
    image: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1400&q=80',
    stat: 'Aftercare terstruktur',
    label: 'Post Build Service',
    ctaLabel: 'Pelajari Dukungan Kami',
    ctaTo: '/layanan',
  },
]

function ValueNarrativeSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null)
  const mobileTrackRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const isDesktopViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 981px)').matches

  useEffect(() => {
    if (!isDesktopViewport() || prefersReducedMotion) return
    const section = sectionRef.current
    if (!section) return

    let rafId = 0

    const computeIndex = () => {
      const rect = section.getBoundingClientRect()
      const sectionTop = window.scrollY + rect.top
      const sectionHeight = section.offsetHeight
      const maxScrollable = Math.max(1, sectionHeight - window.innerHeight)
      const progress = (window.scrollY - sectionTop) / maxScrollable
      const clamped = Math.min(1, Math.max(0, progress))
      const nextIndex = Math.round(clamped * (VALUES.length - 1))
      setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex))
    }

    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        computeIndex()
      })
    }

    computeIndex()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [prefersReducedMotion])

  const setByClick = (index) => {
    setActiveIndex(index)

    if (!isDesktopViewport() || prefersReducedMotion) return
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const sectionTop = window.scrollY + rect.top
    const sectionHeight = section.offsetHeight
    const maxScrollable = Math.max(1, sectionHeight - window.innerHeight)
    const target = sectionTop + (index / Math.max(1, VALUES.length - 1)) * maxScrollable
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  const onMobileScroll = () => {
    const node = mobileTrackRef.current
    if (!node) return
    const index = Math.round(node.scrollLeft / node.clientWidth)
    setActiveIndex((prev) => (prev === index ? prev : index))
  }

  const active = VALUES[activeIndex]

  return (
    <SectionReveal className="section values-narrative-section">
      <div className="container values-narrative-wrap" ref={sectionRef} style={{ '--value-count': VALUES.length }}>
        <div className="values-narrative-sticky">
          <div className="values-narrative-copy">
            <p className="kicker">Kualitas Kami</p>
            <h2 style={{ fontSize: 44, marginBottom: 14 }}>Filosofi Kerja yang Berorientasi pada Detail</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              Kerangka kerja kami menjaga kualitas tetap konsisten dari fase konsep hingga fase pasca-bangun.
            </p>

            <div className="values-switcher" role="tablist" aria-label="Nilai utama Trimitra">
              {VALUES.map((item, index) => {
                const isActive = activeIndex === index
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`value-switch-item ${isActive ? 'is-active' : ''}`}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setByClick(index)}
                  >
                    <span className="value-switch-number">{item.id}</span>
                    <span>
                      <strong>{item.title}</strong>
                      <span className="muted">{item.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="values-narrative-media">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.image}
                className="values-media-frame"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.05, x: 16 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03, x: -16 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={active.image} alt={active.title} loading="lazy" decoding="async" />
                <div className="values-media-overlay" />
                <div className="values-media-meta">
                  <p className="kicker">{active.label}</p>
                  <h3>{active.title}</h3>
                  <p>{active.stat}</p>
                  <Link className="btn" to={active.ctaTo}>{active.ctaLabel}</Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="values-mobile-slider"
          ref={mobileTrackRef}
          onScroll={onMobileScroll}
          role="region"
          aria-label="Nilai Trimitra mobile slider"
        >
          {VALUES.map((item) => (
            <article className="value-mobile-card" key={`mobile-${item.id}`}>
              <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
              <div className="value-mobile-overlay" />
              <div className="value-mobile-copy">
                <p className="kicker">{item.label}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link className="btn" to={item.ctaTo}>{item.ctaLabel}</Link>
              </div>
            </article>
          ))}
        </div>

        <div className="values-mobile-indicator" aria-hidden="true">
          {VALUES.map((item, index) => (
            <span key={`dot-${item.id}`} className={activeIndex === index ? 'is-active' : ''} />
          ))}
        </div>
      </div>
    </SectionReveal>
  )
}

export default ValueNarrativeSection
