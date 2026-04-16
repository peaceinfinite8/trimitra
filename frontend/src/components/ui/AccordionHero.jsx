import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SectionReveal } from '../animation/Reveal'

const HERO_CAMPAIGN_MODES = [
  {
    id: 'booth',
    label: 'Booth Mode',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2200&q=80',
    imageAlt: 'Booth pameran modern dengan keramaian pengunjung.',
    imagePosition: 'center center',
    headline: 'Booth Exhibition yang Menjadi Magnet Keramaian',
    pitch:
      'Kami desain alur booth yang membuat orang berhenti, masuk, dan berdialog dengan tim sales tanpa terasa dipaksa.',
    accent: '#f0cf8f',
    accentSoft: 'rgba(240, 207, 143, 0.24)',
    ctaPrimary: 'Rancang Booth Saya',
    ctaSecondary: 'Lihat Showcase Booth',
    pillars: ['Spatial Storytelling', 'Interactive Display', 'High-Intent Flow'],
    stats: [
      { value: '41%', label: 'Avg Dwell Lift' },
      { value: '3.2x', label: 'Touchpoint Depth' },
      { value: '72h', label: 'Final Build Lock' },
    ],
    bestFor: 'Cocok untuk brand yang ingin traffic tinggi dan percakapan sales berkualitas di area pameran.',
    deliverables: [
      'Konsep 3D booth + alur pergerakan pengunjung',
      'Produksi material booth dengan quality control terukur',
      'Setup on-site dan pendampingan teknis saat event berjalan',
    ],
    deck: {
      metric: '+41%',
      metricLabel: 'Potential Dwell Lift',
      summary: 'Layout memandu pengunjung dari glance ke trial lalu conversation.',
      scenes: [
        {
          title: 'Entry Magnet',
          value: '5s First Stop',
          note: 'Hook visual diletakkan di first-sight axis.',
        },
        {
          title: 'Demo Arc',
          value: '3 Zone Flow',
          note: 'Route produk mengikuti ritme kepadatan pengunjung.',
        },
        {
          title: 'Close Loop',
          value: 'Lead Capture',
          note: 'Area negosiasi ditutup dengan CTA yang jelas.',
        },
      ],
    },
  },
  {
    id: 'event',
    label: 'Event Mode',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=80',
    imageAlt: 'Panggung event dengan audiens antusias dan lighting dramatis.',
    imagePosition: 'center 42%',
    headline: 'Aktivasi Event yang Menggerakkan Audiens ke Aksi',
    pitch:
      'Dari pre-hype sampai on-ground execution, kami bentuk momentum event agar brand Anda terasa hidup sepanjang hari acara.',
    accent: '#d9c6ff',
    accentSoft: 'rgba(217, 198, 255, 0.24)',
    ctaPrimary: 'Bangun Aktivasi Event',
    ctaSecondary: 'Jelajahi Event Works',
    pillars: ['Audience Choreography', 'Stage Narrative', 'Real-Time Ops'],
    stats: [
      { value: '2.8x', label: 'Engagement Pulse' },
      { value: '94%', label: 'On-Run Stability' },
      { value: '0 Lag', label: 'Scene Transition' },
    ],
    bestFor: 'Ideal untuk peluncuran produk, brand activation, dan event yang butuh ritme audiens konsisten.',
    deliverables: [
      'Creative direction acara dari pre-event sampai aftermovie',
      'Skenario acara, rundown, dan cue panggung real-time',
      'Eksekusi teknis lapangan bersama event operations team',
    ],
    deck: {
      metric: '2.8x',
      metricLabel: 'Engagement Pulse',
      summary: 'Kami sinkronkan panggung, aktivitas, dan timing untuk membangun puncak antusiasme.',
      scenes: [
        {
          title: 'Pre-Hype',
          value: 'Audience Warm-up',
          note: 'Teaser ritual sebelum main stage dimulai.',
        },
        {
          title: 'Peak Moment',
          value: 'Hero Sequence',
          note: 'Momen utama dikunci dengan visual + host cues.',
        },
        {
          title: 'Afterglow',
          value: 'Post Event Pull',
          note: 'Konten recap untuk menjaga ingatan brand.',
        },
      ],
    },
  },
  {
    id: 'outdoor',
    label: 'Outdoor Mode',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?auto=format&fit=crop&w=2200&q=80',
    imageAlt: 'Koridor jalan kota sebagai konteks media outdoor brand.',
    imagePosition: 'center center',
    headline: 'Media Outdoor yang Sulit Diabaikan di Jalan Utama',
    pitch:
      'Kami olah komposisi visual luar ruang agar pesan brand tetap terbaca tajam dalam waktu pandang yang singkat.',
    accent: '#9be3d2',
    accentSoft: 'rgba(155, 227, 210, 0.24)',
    ctaPrimary: 'Aktifkan Outdoor Saya',
    ctaSecondary: 'Lihat Outdoor Portfolio',
    pillars: ['Impact Contrast', 'Short-Read Messaging', 'Location Intelligence'],
    stats: [
      { value: '1.9s', label: 'Read Window' },
      { value: 'Top 5', label: 'Priority Corridors' },
      { value: '24/7', label: 'Brand Presence' },
    ],
    bestFor: 'Tepat untuk brand yang ingin visibilitas kuat di koridor utama dengan pesan super ringkas.',
    deliverables: [
      'Analisis titik strategis sesuai arus kendaraan dan audiens',
      'Desain visual outdoor dengan hierarki pesan cepat tangkap',
      'Produksi, instalasi, dan monitoring performa penempatan media',
    ],
    deck: {
      metric: '1.9s',
      metricLabel: 'Read Window',
      summary: 'Message hierarchy disusun agar inti pesan tetap nempel meski glance sangat cepat.',
      scenes: [
        {
          title: 'Visual Hook',
          value: 'High Contrast',
          note: 'Elemen utama ditarik ke zona fokus pengemudi.',
        },
        {
          title: 'Message Snap',
          value: '3-Word Core',
          note: 'Salinan pendek untuk recall yang cepat.',
        },
        {
          title: 'Route Echo',
          value: 'Frequency Loop',
          note: 'Paparan berulang di koridor prioritas.',
        },
      ],
    },
  },
]

const HERO_MARQUEE_TEXT =
  'BOOTH EXHIBITION ● EVENT ACTIVATION ● OUTDOOR MEDIA ● TRIMITRA SERVICE EXPLORER ● ' +
  'BOOTH EXHIBITION ● EVENT ACTIVATION ● OUTDOOR MEDIA ● TRIMITRA SERVICE EXPLORER ● ' +
  'BOOTH EXHIBITION ● EVENT ACTIVATION ● OUTDOOR MEDIA ● TRIMITRA SERVICE EXPLORER ● '

function AccordionHero({
  kicker = 'Trimitra Campaign Selector',
  modes = HERO_CAMPAIGN_MODES,
  primaryLink = '/kontak-kami',
  secondaryLink = '/galeri',
}) {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return

    modes.forEach((mode) => {
      const image = new window.Image()
      image.decoding = 'async'
      image.src = mode.image
    })
  }, [modes])

  const activeMode = modes[0] || HERO_CAMPAIGN_MODES[0]
  const headlineWords = activeMode.headline.split(' ')
  const gradientWordSet = new Set(['booth', 'event', 'outdoor', 'brand', 'exhibition', 'activation', 'media'])
  const headlineStartDelay = 0.26
  const wordDelay = 0.08
  const subtitleDelay = headlineStartDelay + headlineWords.length * wordDelay + 0.22
  const pillsStartDelay = subtitleDelay + 0.18
  const actionsDelay = pillsStartDelay + activeMode.pillars.length * 0.08 + 0.2

  const heroModeStyle = {
    '--hero-mode-accent': activeMode.accent,
    '--hero-mode-accent-soft': activeMode.accentSoft,
  }

  return (
    <>
      <SectionReveal className="hero-single" style={heroModeStyle} data-nav-hero>
        <div className="hero-single-mesh" data-gsap-parallax-layer="background" aria-hidden="true">
          <span className="hero-orb hero-orb-a" />
          <span className="hero-orb hero-orb-b" />
          <span className="hero-orb hero-orb-c" />
        </div>

        <div className="container hero-single-shell">
          <div className="hero-single-grid" data-gsap-parallax-layer="content">
            <motion.div
              className="hero-single-content"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.p
                className="kicker hero-single-kicker"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -24 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.46, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {kicker}
              </motion.p>
              <motion.h1 className="hero-single-title">
                <span className="hero-headline-stage">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeMode.headline}
                      className={`hero-mode-headline-line is-${activeMode.id}`}
                      initial={
                        prefersReducedMotion
                          ? false
                          : {
                            opacity: 0,
                            y: 20,
                            scale: 0.96,
                            rotateX: 20,
                            filter: 'blur(10px)',
                          }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        filter: 'blur(0px)',
                      }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                            opacity: 0,
                            y: -12,
                            scale: 1.03,
                            rotateX: -16,
                            filter: 'blur(10px)',
                          }
                      }
                      transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {headlineWords.map((word, index) => (
                        <motion.span
                          key={`${activeMode.id}-${word}-${index}`}
                          className={`hero-word ${gradientWordSet.has(word.toLowerCase().replace(/[^a-z]/g, '')) ? 'hero-word-gradient' : ''}`}
                          initial={
                            prefersReducedMotion
                              ? false
                              : { opacity: 0, y: 16, filter: 'blur(6px)', clipPath: 'inset(0 0 100% 0)' }
                          }
                          animate={
                            prefersReducedMotion
                              ? { opacity: 1 }
                              : {
                                opacity: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                clipPath: 'inset(0 0 0% 0)',
                                transition: { duration: 0.44, delay: headlineStartDelay + index * wordDelay, ease: [0.22, 1, 0.36, 1] },
                              }
                          }
                        >
                          {word}
                        </motion.span>
                      ))}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.h1>
              <motion.p
                className="hero-single-description"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.46, delay: subtitleDelay, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeMode.pitch}
              </motion.p>
              <motion.div className="hero-single-services">
                {activeMode.pillars.map((service, index) => (
                  <motion.span
                    key={service}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -14 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.42, delay: pillsStartDelay + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {service}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div
                className="hero-single-actions"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: actionsDelay, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link className="btn" to={primaryLink} data-magnetic>
                  {activeMode.ctaPrimary}
                </Link>
                <Link className="btn outline hero-glass-secondary" to={secondaryLink} data-magnetic>
                  {activeMode.ctaSecondary}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-visual-column"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-visual-card">
                <div className="hero-visual-image-stage">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.img
                      key={activeMode.id}
                      src={activeMode.image}
                      alt={activeMode.imageAlt}
                      className="hero-visual-image"
                      style={{ objectPosition: activeMode.imagePosition }}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                      transition={{ duration: prefersReducedMotion ? 0.2 : 0.56, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </AnimatePresence>
                </div>
                <div className="hero-floating-badge badge-projects">350+ Projects</div>
                <div className="hero-floating-badge badge-ontime">98% On-Time</div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      <div className="hero-marquee-band" aria-hidden="true">
        <div className="hero-marquee-band-scroller">
          <div className="hero-marquee-band-track">{HERO_MARQUEE_TEXT}</div>
          <div className="hero-marquee-band-track">{HERO_MARQUEE_TEXT}</div>
        </div>
      </div>
    </>
  )
}

export default AccordionHero
