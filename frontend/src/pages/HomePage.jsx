import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionReveal } from '../components/animation/Reveal'
import LazyImage from '../components/ui/LazyImage'
import AccordionHero from '../components/ui/AccordionHero'
import ClientMarquee from '../components/ClientMarquee'
import ServiceShowcaseSection from '../components/ui/ServiceShowcaseSection'
import ValueNarrativeSection from '../components/ui/ValueNarrativeSection'
import { blogPosts } from '../data/blogPosts'
import { getBlogPostsFromWordPress, isWordPressConfigured } from '../data/wordpressBlog'
import {
  getWordPressGalleryMedia,
  getWordPressPageBySlugs,
  isWordPressConfiguredForPages,
} from '../data/wordpressPages'
import { pickLinkField, pickTextField } from '../data/wpUiFields'

const portfolioContainerVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.1,
    },
  },
}

const portfolioCardVariants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.68,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const LIVE_JOURNAL_REFRESH_INTERVAL_MS = 20000

function PortfolioShowcase({ kicker, title, images }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <SectionReveal className="section home-portfolio-section">
      <div className="container">
        <p className="kicker">{kicker}</p>
        <h2 className="home-portfolio-title text-shimmer">{title}</h2>
        <motion.div
          className="portfolio-grid"
          variants={portfolioContainerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? {} : 'show'}
        >
          <motion.article className="portfolio-main portfolio-card card" variants={portfolioCardVariants}>
            <LazyImage src={images[0]} alt="Proyek booth pameran Trimitra" />
          </motion.article>
          <motion.div className="portfolio-right" variants={portfolioContainerVariants}>
            <motion.article className="portfolio-card card" variants={portfolioCardVariants}>
              <LazyImage src={images[1]} alt="Proyek event activation Trimitra" />
            </motion.article>
            <motion.article className="portfolio-card card" variants={portfolioCardVariants}>
              <LazyImage src={images[2]} alt="Proyek media billboard outdoor Trimitra" />
            </motion.article>
          </motion.div>
        </motion.div>
      </div>
    </SectionReveal>
  )
}

function HomeIdentitySection({
  title = 'PT Trimitra Multi Kreasi',
  summary = 'Kami adalah perusahaan jasa booth pameran, event organizer, dan media outdoor untuk membantu brand tampil menonjol dengan eksekusi yang rapi dan terukur.',
}) {
  const pillars = [
    'Booth Pameran',
    'Event Organizer',
    'Media Outdoor',
    'Interior Komersial',
  ]

  return (
    <SectionReveal className="section home-identity-section">
      <div className="container home-identity-shell">
        <p className="kicker">Tentang Website Ini</p>
        <h2 className="home-identity-title">{title}</h2>
        <p className="home-identity-summary">{summary}</p>

        <div className="home-identity-pillars" aria-label="Fokus layanan utama">
          {pillars.map((pillar) => (
            <span key={pillar} className="home-identity-pill">{pillar}</span>
          ))}
        </div>

        <div className="home-identity-actions">
          <Link className="btn" to="/layanan" data-magnetic>Lihat Layanan</Link>
          <Link className="btn outline home-cta-secondary" to="/kontak-kami" data-magnetic>Konsultasi Gratis</Link>
        </div>
      </div>
    </SectionReveal>
  )
}

function HomeJournalSection({
  kicker,
  title,
  buttonLabel,
  featuredJournal,
  sideJournals,
}) {
  return (
    <SectionReveal className="section home-journal-section" id="home-journal">
      <div className="container">
        <div className="journal-row">
          <div>
            <p className="kicker">{kicker}</p>
            <h2 className="home-journal-title">{title}</h2>
          </div>
          <Link className="btn home-journal-more-btn" to="/berita" data-magnetic>{buttonLabel}</Link>
        </div>

        <div className="home-journal-feature-grid">
          {featuredJournal ? (
            <Link className="home-journal-feature-link" to={`/berita/${featuredJournal.slug}`}>
              <article className="home-journal-feature-card card">
                <div className="home-journal-feature-media">
                  <img
                    src={featuredJournal.image}
                    alt={featuredJournal.title}
                    className="home-journal-feature-image"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="home-journal-feature-content">
                  <span className="home-journal-badge">{featuredJournal.tag?.toUpperCase() || 'BLOG'}</span>
                  <h3 className="home-journal-card-title">{featuredJournal.title}</h3>
                  <p>{featuredJournal.excerpt}</p>
                </div>
              </article>
            </Link>
          ) : null}

          <div className="home-journal-side-stack">
            {sideJournals.map((item) => (
              <Link key={item.slug || item.title} className="journal-card-link" to={`/berita/${item.slug}`}>
                <article className="home-journal-side-card card">
                  <LazyImage src={item.image} alt={item.title} />
                  <div className="journal-overlay home-journal-side-overlay">
                    <span className="home-journal-badge">{item.tag?.toUpperCase() || 'NEWS'}</span>
                    <h3 className="home-journal-card-title">{item.title}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  )
}

function HomePartnershipSection() {
  return (
    <SectionReveal className="section home-partnership-section">
      <div className="container home-partnership-shell">
        <div className="home-partnership-head">
          <p className="kicker">Dipercaya Untuk</p>
          <h2 className="home-partnership-title">Partner yang Sejalan dengan Skala dan Ritme Kerja Kami</h2>
          <p className="muted home-partnership-copy">
            Kami mendukung berbagai kebutuhan brand experience, dari aktivasi korporat sampai media outdoor, dengan eksekusi yang rapi dan presisi.
          </p>
        </div>

        <div className="home-partnership-marquee">
          <ClientMarquee theme="light" />
        </div>
      </div>
    </SectionReveal>
  )
}

function HomePage() {
  const [wpHomePage, setWpHomePage] = useState(null)
  const [journalPosts, setJournalPosts] = useState(blogPosts.slice(0, 3))
  const [portfolioImages, setPortfolioImages] = useState([
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=900&q=80',
  ])
  const journalRefreshInProgressRef = useRef(false)

  useEffect(() => {
    document.body.classList.add('route-home')
    return () => {
      document.body.classList.remove('route-home')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadFromWordPress({ forceFresh = false } = {}) {
      if (!isWordPressConfigured()) return
      if (journalRefreshInProgressRef.current) return

      journalRefreshInProgressRef.current = true
      try {
        const wpPosts = await getBlogPostsFromWordPress({
          perPage: 3,
          allPages: false,
          skipCache: forceFresh,
          staleWhileRevalidate: !forceFresh,
          ttlMs: 60 * 1000,
        })
        if (!cancelled && wpPosts.length > 0) {
          setJournalPosts(wpPosts)
        }
      } catch {
        // Keep local fallback posts.
      } finally {
        journalRefreshInProgressRef.current = false
      }
    }

    loadFromWordPress({ forceFresh: true })

    const onFocus = () => loadFromWordPress({ forceFresh: true })
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFromWordPress({ forceFresh: true })
      }
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadFromWordPress({ forceFresh: true })
      }
    }, LIVE_JOURNAL_REFRESH_INTERVAL_MS)

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadHomePageFromWordPress() {
      if (!isWordPressConfiguredForPages()) return
      try {
        const page = await getWordPressPageBySlugs(['home', 'beranda'])
        if (!cancelled && page) {
          setWpHomePage(page)
        }
      } catch {
        // Keep fallback home layout.
      }
    }

    loadHomePageFromWordPress()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPortfolioFromWordPress() {
      if (!isWordPressConfiguredForPages()) return
      try {
        const media = await getWordPressGalleryMedia({ perPage: 9, allPages: false })
        const firstThree = media.slice(0, 3).map((item) => item.src)
        if (!cancelled && firstThree.length === 3) {
          setPortfolioImages(firstThree)
        }
      } catch {
        // Keep fallback portfolio images.
      }
    }

    loadPortfolioFromWordPress()
    return () => {
      cancelled = true
    }
  }, [])

  const journals = journalPosts.slice(0, 3).map((post) => ({
    tag: post.category,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    slug: post.slug,
  }))
  const featuredJournal = journals[0]
  const sideJournals = journals.slice(1)
  const homeHighlights = [
    { label: 'Project Delivery', value: '350+', note: 'Proyek lintas industri dengan eksekusi terukur.' },
    { label: 'On-Time Ratio', value: '98%', note: 'Timeline ketat untuk event, booth, dan instalasi.' },
    { label: 'Client Retention', value: '87%', note: 'Kolaborasi berulang karena kualitas hasil konsisten.' },
    { label: 'Active Cities', value: '24', note: 'Jangkauan layanan nasional dengan tim operasional adaptif.' },
  ]

  if (wpHomePage) {
    const uiFields = { ...(wpHomePage.meta || {}), ...(wpHomePage.acf || {}) }
    const homeKicker = pickTextField(uiFields, ['home_kicker', 'hero_kicker'], 'Home')
    const journalKicker = pickTextField(uiFields, ['journal_kicker'], 'Insight Terbaru')
    const journalTitle = pickTextField(uiFields, ['journal_title'], 'Berita & Artikel Trimitra')
    const journalButtonLabel = pickTextField(uiFields, ['journal_button_label'], 'Lihat Semua')
    const portfolioKicker = pickTextField(uiFields, ['portfolio_kicker'], 'Portofolio')
    const portfolioTitle = pickTextField(uiFields, ['portfolio_title'], 'Proyek Unggulan')
    const ctaTitle = pickTextField(uiFields, ['cta_title', 'home_cta_title'], 'Siap Wujudkan Aktivasi Brand yang Lebih Berdampak?')
    const ctaCopy = pickTextField(uiFields, ['cta_copy', 'home_cta_copy'], 'Konsultasikan kebutuhan booth, event, dan media outdoor Anda bersama tim Trimitra untuk eksekusi yang lebih presisi.')
    const ctaPrimaryLabel = pickTextField(uiFields, ['cta_primary_label'], 'Konsultasi Sekarang')
    const ctaPrimaryLink = pickLinkField(uiFields, ['cta_primary_link'], '/kontak-kami')
    const ctaSecondaryLabel = pickTextField(uiFields, ['cta_secondary_label'], 'Lihat Portofolio')
    const ctaSecondaryLink = pickLinkField(uiFields, ['cta_secondary_link'], '/layanan')

    return (
      <div className="home-page-lumen">
        <AccordionHero />

        <SectionReveal className="section home-lumen-intro">
          <div className="container home-lumen-intro-grid">
            <div className="home-lumen-intro-copy">
              <p className="kicker">{homeKicker}</p>
              <h2 className="home-lumen-title">Ruang Aktivasi Brand yang Lebih Hidup, Terukur, dan Premium</h2>
              <p className="muted home-lumen-copy">
                Kami menggabungkan desain, produksi, dan eksekusi lapangan dalam satu alur kerja agar brand tampil menonjol
                dengan pengalaman yang rapi, segar, dan relevan untuk audiens Anda.
              </p>
            </div>

            <div className="home-lumen-stat-grid">
              {homeHighlights.map((item) => (
                <article key={item.label} className="home-lumen-stat-card">
                  <p className="home-lumen-stat-label">{item.label}</p>
                  <p className="home-lumen-stat-value">{item.value}</p>
                  <p className="home-lumen-stat-note">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionReveal>

        <HomeIdentitySection
          title="PT Trimitra Multi Kreasi"
          summary="Website ini adalah profil layanan Trimitra untuk booth pameran, event organizer, dan media outdoor. Fokus kami adalah membantu brand terlihat kuat dengan desain, produksi, dan eksekusi yang terintegrasi."
        />

        <ServiceShowcaseSection />

        <PortfolioShowcase kicker={portfolioKicker} title={portfolioTitle} images={portfolioImages} />

        <ValueNarrativeSection />

        <HomePartnershipSection />

        <SectionReveal className="section cms-page-shell">
          <div className="container">
            <p className="kicker">{homeKicker}</p>
            <h1 className="section-title">{wpHomePage.title}</h1>
            {wpHomePage.excerpt && (
              <p className="muted" style={{ marginTop: 12, maxWidth: 860 }}>
                {wpHomePage.excerpt}
              </p>
            )}
            {wpHomePage.image && (
              <div className="blog-detail-image-wrap" style={{ marginTop: 18, marginBottom: 22 }}>
                <LazyImage
                  src={wpHomePage.image}
                  alt={wpHomePage.title}
                  className="blog-detail-image"
                />
              </div>
            )}
            <article className="blog-detail-content cms-page-content" dangerouslySetInnerHTML={{ __html: wpHomePage.contentHtml }} />
          </div>
        </SectionReveal>

        <HomeJournalSection
          kicker={journalKicker}
          title={journalTitle}
          buttonLabel={journalButtonLabel}
          featuredJournal={featuredJournal}
          sideJournals={sideJournals}
        />

        <SectionReveal className="dark-cta home-cta-section">
          <div className="container home-dark-cta-shell">
            <h2 className="home-dark-cta-title">{ctaTitle}</h2>
            <p className="muted home-dark-cta-copy">
              {ctaCopy}
            </p>
            <div className="home-dark-cta-actions">
              <Link className="btn" to={ctaPrimaryLink} data-magnetic>{ctaPrimaryLabel}</Link>
              <Link className="btn outline home-cta-secondary" to={ctaSecondaryLink} data-magnetic>
                {ctaSecondaryLabel}
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    )
  }

  return (
    <div className="home-page-lumen">
      <AccordionHero />

      <SectionReveal className="section home-lumen-intro">
        <div className="container home-lumen-intro-grid">
          <div className="home-lumen-intro-copy">
            <p className="kicker">Studio Trimitra</p>
            <h1 className="home-lumen-title">Siap Membuat Booth Anda Jadi Pusat Perhatian di Setiap Pameran?</h1>
            <p className="muted home-lumen-copy">
              Kami membantu brand tampil standout melalui desain, produksi, dan instalasi booth exhibition profesional.
            </p>
          </div>

          <div className="home-lumen-stat-grid">
            {homeHighlights.map((item) => (
              <article key={item.label} className="home-lumen-stat-card">
                <p className="home-lumen-stat-label">{item.label}</p>
                <p className="home-lumen-stat-value">{item.value}</p>
                <p className="home-lumen-stat-note">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <HomeIdentitySection />

      <ServiceShowcaseSection />

      <PortfolioShowcase kicker="Portofolio" title="Proyek Unggulan" images={portfolioImages} />

      <ValueNarrativeSection />

      <HomePartnershipSection />

      <HomeJournalSection
        kicker="Insight Terbaru"
        title="Berita & Artikel Trimitra"
        buttonLabel="Lihat Semua"
        featuredJournal={featuredJournal}
        sideJournals={sideJournals}
      />

      <SectionReveal className="dark-cta home-cta-section">
        <div className="container home-dark-cta-shell">
          <h2 className="home-dark-cta-title">Siap Wujudkan Aktivasi Brand yang Lebih Berdampak?</h2>
          <p className="muted home-dark-cta-copy">
            Konsultasikan kebutuhan booth, event, dan media outdoor Anda bersama tim Trimitra untuk eksekusi yang lebih presisi.
          </p>
          <div className="home-dark-cta-actions">
            <Link className="btn" to="/kontak-kami" data-magnetic>Konsultasi Sekarang</Link>
            <Link className="btn outline home-cta-secondary" to="/layanan" data-magnetic>
              Lihat Portofolio
            </Link>
          </div>
        </div>
      </SectionReveal>
    </div>
  )
}

export default HomePage
