import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionReveal, StaggerGroup, StaggerItem } from '../components/animation/Reveal'
import LazyImage from '../components/ui/LazyImage'
import JourneyTimelineSection from '../components/ui/JourneyTimelineSection'
import { getWordPressPageBySlugs, isWordPressConfiguredForPages } from '../data/wordpressPages'
import { pickLinkField, pickTextField } from '../data/wpUiFields'

const ABOUT_VALUES = [
  {
    id: '01',
    title: 'Profesionalisme',
    description: 'Tim kami bekerja dengan ritme terukur, komunikasi jelas, dan eksekusi yang konsisten di setiap fase.',
  },
  {
    id: '02',
    title: 'Kreativitas',
    description: 'Setiap brief diterjemahkan menjadi ide visual yang relevan, segar, dan tetap realistis untuk produksi.',
  },
  {
    id: '03',
    title: 'Kualitas',
    description: 'Detail material, finishing, dan kontrol lapangan kami jaga ketat agar hasil akhir tampil premium.',
  },
]

const STORY_METRICS = [
  { value: 9, suffix: '+', label: 'Tahun Perjalanan' },
  { value: 350, suffix: '+', label: 'Proyek Selesai' },
  { value: 120, suffix: '+', label: 'Brand & Klien' },
]

const ABOUT_SERVICE_PILLARS = ['Booth Pameran', 'Event Organizer', 'Advertising']

const ABOUT_HERO_MILESTONES = [
  { year: '2017', title: 'Trimitra Berdiri' },
  { year: '2020', title: 'Ekspansi Layanan' },
  { year: '2024', title: '350+ Proyek Terselesaikan' },
]

function CountUpNumber({ value, suffix = '', duration = 2000 }) {
  const prefersReducedMotion = useReducedMotion()
  const rafRef = useRef(0)
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [duration, prefersReducedMotion, value])

  const shownValue = prefersReducedMotion ? value : displayValue
  return <span>{shownValue}{suffix}</span>
}

function AboutIdentityBand() {
  return (
    <SectionReveal className="section about-identity-band">
      <div className="container about-identity-shell">
        <p className="kicker">Apa Itu Trimitra?</p>
        <h2 className="about-identity-title">PT Trimitra Multi Kreasi</h2>
        <p className="about-identity-summary">
          Kami adalah perusahaan jasa booth pameran, event organizer, dan advertising yang membantu brand tampil lebih menonjol
          dengan desain, produksi, dan eksekusi lapangan yang terintegrasi sejak 2017.
        </p>

        <div className="about-identity-pillars" aria-label="Fokus layanan Trimitra">
          {ABOUT_SERVICE_PILLARS.map((pillar) => (
            <span key={pillar} className="about-identity-pill">{pillar}</span>
          ))}
        </div>
      </div>
    </SectionReveal>
  )
}

function AboutStorySection() {
  return (
    <SectionReveal className="section about-story-section">
      <div className="container story-wrap">
        <div className="story-visual">
          <LazyImage
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
            alt="Sesi perencanaan proyek Trimitra dengan dokumen dan perangkat kerja"
            className="story-visual-image"
          />
          <div className="story-visual-overlay" aria-hidden="true" />
          <div className="story-visual-badge" aria-hidden="true">
            <span>Since</span>
            <strong>2017</strong>
          </div>
        </div>

        <div className="story-content">
          <p className="kicker">Perjalanan Kami</p>
          <h2 className="story-title">Kisah Kami</h2>
          <motion.p
            className="muted story-copy about-story-paragraph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            Didirikan di Jakarta pada 2017, PT Trimitra Multi Kreasi bertumbuh dengan pendekatan kolaboratif untuk menjembatani ide kreatif
            dengan presisi teknis di lapangan.
          </motion.p>
          <motion.p
            className="muted story-copy about-story-paragraph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.21 }}
          >
            Kami tidak hanya membangun struktur, tetapi merancang pengalaman brand yang relevan, terukur, dan siap tumbuh
            bersama bisnis klien.
          </motion.p>

          <StaggerGroup className="story-metrics" once amount={0.34}>
            {STORY_METRICS.map((metric) => (
              <StaggerItem key={metric.label}>
                <article className="story-metric-card">
                  <h3>
                    <CountUpNumber value={metric.value} suffix={metric.suffix} />
                  </h3>
                  <p>{metric.label}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </SectionReveal>
  )
}

function AboutValuesSection() {
  return (
    <SectionReveal className="section values-strip">
      <div className="container">
        <div className="values-simple-head">
          <p className="kicker">Prinsip Utama</p>
          <h2 className="values-simple-title">Nilai-Nilai Kami</h2>
          <p className="muted values-simple-copy">
            Tiga prinsip inti yang menjaga standar kerja Trimitra tetap presisi, kreatif, dan dapat diandalkan.
          </p>
        </div>

        <div className="values-simple-ribbon" aria-hidden="true">
          <svg className="values-simple-ribbon-svg" viewBox="0 0 1000 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="valuesRibbonBase" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--svg-ribbon-base-start)" />
                <stop offset="55%" stopColor="var(--svg-ribbon-base-mid)" />
                <stop offset="100%" stopColor="var(--svg-ribbon-base-end)" />
              </linearGradient>
              <linearGradient id="valuesRibbonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--svg-ribbon-glow-start)" />
                <stop offset="40%" stopColor="var(--svg-ribbon-glow-mid)" />
                <stop offset="100%" stopColor="var(--svg-ribbon-glow-end)" />
              </linearGradient>
            </defs>
            <path className="values-simple-ribbon-back" d="M 52 116 C 210 30, 334 164, 502 94 C 650 34, 782 150, 948 78" />
            <path className="values-simple-ribbon-front" d="M 52 116 C 210 30, 334 164, 502 94 C 650 34, 782 150, 948 78" />
          </svg>
          <span className="values-simple-point values-simple-point-1" />
          <span className="values-simple-point values-simple-point-2" />
          <span className="values-simple-point values-simple-point-3" />
        </div>

        <StaggerGroup className="values-simple-grid">
          {ABOUT_VALUES.map((item) => (
            <StaggerItem key={item.id}>
              <article className="values-simple-card">
                <p className="values-simple-id">{item.id}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </SectionReveal>
  )
}

function AboutActionSection({ title, copy, primaryLabel, primaryLink, secondaryLabel, secondaryLink }) {
  return (
    <SectionReveal className="dark-cta">
      <div className="container about-cta-shell">
        <div>
          <h2 className="about-cta-title">{title}</h2>
          <p className="muted about-cta-copy">{copy}</p>
        </div>
        <div className="about-cta-actions">
          <Link className="btn" to={primaryLink}>{primaryLabel}</Link>
          <Link className="btn outline home-cta-secondary" to={secondaryLink}>{secondaryLabel}</Link>
        </div>
      </div>
    </SectionReveal>
  )
}

function TentangKamiPage() {
  const [wpPage, setWpPage] = useState(null)

  useEffect(() => {
    document.body.classList.add('route-about')
    return () => {
      document.body.classList.remove('route-about')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPageFromWordPress() {
      if (!isWordPressConfiguredForPages()) return
      try {
        const page = await getWordPressPageBySlugs(['tentang-kami', 'about-us', 'about'])
        if (!cancelled && page) {
          setWpPage(page)
        }
      } catch {
        // Keep fallback layout.
      }
    }

    loadPageFromWordPress()
    return () => {
      cancelled = true
    }
  }, [])

  const uiFields = { ...(wpPage?.meta || {}), ...(wpPage?.acf || {}) }
  const pageKicker = pickTextField(uiFields, ['page_kicker', 'about_kicker'], 'Tentang Kami')
  const ctaTitle = pickTextField(uiFields, ['cta_title', 'about_cta_title'], 'Mulai Proyek Anda')
  const ctaCopy = pickTextField(uiFields, ['cta_copy', 'about_cta_copy'], 'Rasakan perpaduan antara arsitektur dan emosi.')
  const ctaPrimaryLabel = pickTextField(uiFields, ['cta_primary_label'], 'Pesan Konsultasi')
  const ctaPrimaryLink = pickLinkField(uiFields, ['cta_primary_link'], '/kontak-kami')
  const ctaSecondaryLabel = pickTextField(uiFields, ['cta_secondary_label'], 'Lihat Portofolio')
  const ctaSecondaryLink = pickLinkField(uiFields, ['cta_secondary_link'], '/galeri')

  const heroTagline = wpPage?.title || 'Membentuk Ruang. Mendefinisikan Waktu.'
  const heroSummary = pickTextField(
    uiFields,
    ['hero_copy', 'about_hero_copy'],
    'Kami merancang pengalaman brand dari konsep sampai eksekusi lapangan dengan ritme kerja yang presisi dan kolaboratif.',
  )

  return (
    <div className="about-page-lumen">
      <SectionReveal className="about-hero about-hero-split" data-nav-hero>
        <div className="container about-hero-split-grid">
          <div className="about-hero-split-copy">
            <p className="kicker">Tentang Kami</p>
            <h1 className="section-title">{heroTagline}</h1>
            <p className="muted about-hero-summary">{heroSummary}</p>
            <div className="about-hero-actions">
              <Link className="btn" to={ctaPrimaryLink}>{ctaPrimaryLabel}</Link>
              <Link className="btn outline home-cta-secondary" to="/layanan">Lihat Layanan</Link>
            </div>
          </div>

          <motion.div
            className="about-hero-side"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <article className="about-hero-photo-card glass-dark">
              <img
                className="about-hero-photo"
                src={wpPage?.image || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1500&q=80'}
                alt="Tim Trimitra berdiskusi di studio"
                loading="eager"
                decoding="async"
              />
            </article>
            <div className="about-hero-milestones">
              {ABOUT_HERO_MILESTONES.map((item) => (
                <article key={item.year} className="about-hero-milestone-card glass-dark">
                  <p>{item.year}</p>
                  <h3>{item.title}</h3>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      <AboutIdentityBand />

      {wpPage && (
        <SectionReveal className="section cms-page-shell">
          <div className="container">
            <p className="kicker">{pageKicker}</p>
            <h2 className="section-title">{wpPage.title}</h2>
            <article className="blog-detail-content cms-page-content" dangerouslySetInnerHTML={{ __html: wpPage.contentHtml }} />
          </div>
        </SectionReveal>
      )}

      <AboutStorySection />
      <AboutValuesSection />
      <JourneyTimelineSection />

      <AboutActionSection
        title={ctaTitle}
        copy={ctaCopy}
        primaryLabel={ctaPrimaryLabel}
        primaryLink={ctaPrimaryLink}
        secondaryLabel={ctaSecondaryLabel}
        secondaryLink={ctaSecondaryLink}
      />
    </div>
  )
}

export default TentangKamiPage
