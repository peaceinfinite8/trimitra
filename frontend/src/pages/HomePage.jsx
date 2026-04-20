import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { animate } from 'animejs'
import { SectionReveal } from '../components/animation/Reveal'
import LazyImage from '../components/ui/LazyImage'
import AccordionHero from '../components/ui/AccordionHero'
import ClientMarquee from '../components/ClientMarquee'
import ServiceShowcaseSection from '../components/ui/ServiceShowcaseSection'
import ValueNarrativeSection from '../components/ui/ValueNarrativeSection'
import { blogPosts } from '../data/blogPosts'
import { getBlogPostsFromWordPress, isWordPressConfigured } from '../data/wordpressBlog'
import {
  getWordPressGalleryFromPageId,
  getWordPressGalleryFromPageBySlugs,
  getWordPressPageBySlugs,
  isWordPressConfiguredForPages,
} from '../data/wordpressPages'
import { pickArrayField, pickLinkField, pickTextField } from '../data/wpUiFields'

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
const PREFERRED_BILLBOARD_IMAGE = '/images/billboard-pasti-alam-sutera.jpg'
const WORDPRESS_GALLERY_PAGE_ID = 605

function formatPortfolioDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

function detectCategory(title) {
  const t = (title || '').toLowerCase().trim()
  if (t.startsWith('billboard')) return 'Billboard'
  if (t.startsWith('booth')) return 'Booth Pameran'
  if (t.startsWith('event')) return 'Event'
  return 'Lainnya'
}

function matchesKeyword(value, pattern) {
  return pattern.test(String(value || '').toLowerCase())
}

function PortfolioCardSkeleton() {
  return (
    <div className="portfolio-card card" style={{ background: 'rgba(255,255,255,0.8)' }}>
      <div style={{ width: '100%', height: '100%', background: 'rgba(200,200,200,0.2)' }} />
    </div>
  )
}

function PortfolioCard({ item, isLarge = false, href = '/galeri' }) {
  const prefersReducedMotion = useReducedMotion()
  const imageUrl = item.fullSrc ?? item.src ?? PREFERRED_BILLBOARD_IMAGE
  const titleText = item.alt ?? item.rendered ?? item.title ?? 'Galeri Trimitra'
  const cardHeight = isLarge ? '460px' : '220px'
  const categoryLabel = detectCategory(item.alt ?? item.rendered ?? item.title ?? 'Galeri')

  return (
    <motion.article
      className="portfolio-card card"
      style={{
        height: cardHeight,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
      variants={portfolioCardVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? {} : 'show'}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      onClick={() => window.location.href = href}
    >
      <img
        src={imageUrl}
        alt={titleText}
        className="w-full h-full object-cover object-center"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <span
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(0, 0, 0, 0.5)',
          color: '#fff',
          fontSize: '12px',
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {categoryLabel}
      </span>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '20px',
          color: '#fff',
        }}
        className="portfolio-overlay"
      >
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, lineHeight: 1.2 }}>
          {titleText}
        </h3>
        {isLarge && item.excerpt && (
          <p style={{ margin: '0 0 12px', fontSize: '13px', lineHeight: 1.4, opacity: 0.9 }}>
            {item.excerpt.slice(0, 100)}...
          </p>
        )}
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
          {formatPortfolioDate(item.date)}
        </p>
      </div>
      <style>{`
        .portfolio-card:hover .portfolio-overlay {
          opacity: 1;
        }
      `}</style>
    </motion.article>
  )
}

function PortfolioShowcase({ kicker, title, items = [], status = 'loading' }) {
  const prefersReducedMotion = useReducedMotion()
  const displayItems = items.slice(0, 3)

  if (status === 'loading') {
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
            <PortfolioCardSkeleton />
            <div className="portfolio-right" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
            </div>
          </motion.div>
        </div>
      </SectionReveal>
    )
  }

  if (status === 'error' || displayItems.length === 0) {
    return (
      <SectionReveal className="section home-portfolio-section">
        <div className="container">
          <p className="kicker">{kicker}</p>
          <h2 className="home-portfolio-title text-shimmer">{title}</h2>
          <div className="portfolio-empty-state card" style={{ padding: '28px', textAlign: 'center' }}>
            <p className="muted" style={{ margin: 0 }}>
              Data galeri belum bisa dimuat saat ini.
            </p>
            <Link className="btn" to="/galeri" style={{ marginTop: '16px' }} data-magnetic>
              Buka Galeri
            </Link>
          </div>
        </div>
      </SectionReveal>
    )
  }

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
          {displayItems[0] && (
            <PortfolioCard item={displayItems[0]} isLarge href="/galeri" />
          )}
          <motion.div className="portfolio-right" variants={portfolioContainerVariants}>
            {displayItems[1] && (
              <PortfolioCard item={displayItems[1]} href="/galeri" />
            )}
            {displayItems[2] && (
              <PortfolioCard item={displayItems[2]} href="/galeri" />
            )}
          </motion.div>
        </motion.div>
      </div>
    </SectionReveal>
  )
}

function HomeIdentitySection({
  kicker = 'Tentang Website Ini',
  title = 'PT Trimitra Multi Kreasi',
  summary = 'Kami adalah perusahaan jasa booth exhibition, event organizer, dan advertising untuk membantu brand tampil menonjol dengan eksekusi yang rapi dan terukur.',
  pillars = [
    'Booth Exhibition',
    'Event Organizer',
    'Advertising',
  ],
  primaryLabel = 'Lihat Layanan',
  primaryLink = '/layanan',
  secondaryLabel = 'Konsultasi Gratis',
  secondaryLink = '/kontak-kami',
}) {
  return (
    <SectionReveal className="section home-identity-section">
      <div className="container home-identity-shell">
        <p className="kicker">{kicker}</p>
        <h2 className="home-identity-title">{title}</h2>
        <p className="home-identity-summary">{summary}</p>

        <div className="home-identity-pillars" aria-label="Fokus layanan utama">
          {pillars.map((pillar) => (
            <span key={pillar} className="home-identity-pill">{pillar}</span>
          ))}
        </div>

        <div className="home-identity-actions">
          <Link className="btn" to={primaryLink} data-magnetic>{primaryLabel}</Link>
          <Link className="btn outline home-cta-secondary" to={secondaryLink} data-magnetic>{secondaryLabel}</Link>
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

function HomePartnershipSection({
  kicker = 'Partnership',
  title = 'Dipercaya oleh Berbagai Brand untuk Berbagai Skala Kebutuhan',
  copy = 'Kami telah bekerja sama dengan berbagai perusahaan dalam menghadirkan event, booth, dan media advertising dengan eksekusi yang rapi dan berdampak.',
}) {
  return (
    <SectionReveal className="section home-partnership-section">
      <div className="container home-partnership-shell">
        <div className="home-partnership-head">
          <p className="kicker">{kicker}</p>
          <h2 className="home-partnership-title">{title}</h2>
          <p className="muted home-partnership-copy">{copy}</p>
        </div>

        <div className="home-partnership-marquee">
          <ClientMarquee theme="light" />
        </div>
      </div>
    </SectionReveal>
  )
}

const DEFAULT_HOME_HIGHLIGHTS = [
  { label: 'Project Delivery', value: '350+', note: 'Proyek lintas industri dengan eksekusi terukur.' },
  { label: 'On-Time Ratio', value: '98%', note: 'Timeline ketat untuk event, booth, dan instalasi.' },
  { label: 'Client Retention', value: '87%', note: 'Kolaborasi berulang karena kualitas hasil konsisten.' },
  { label: 'Active Cities', value: '24', note: 'Jangkauan layanan nasional dengan tim operasional adaptif.' },
]

const DEFAULT_HOME_PILLARS = [
  'Booth Exhibition',
  'Event Organizer',
  'Advertising',
]

function normalizeHighlightItem(item, fallbackItem) {
  if (item && typeof item === 'object') {
    return {
      label: pickTextField(item, ['label', 'title', 'name'], fallbackItem.label),
      value: pickTextField(item, ['value', 'stat', 'number'], fallbackItem.value),
      note: pickTextField(item, ['note', 'description', 'copy', 'subtitle'], fallbackItem.note),
    }
  }

  if (typeof item === 'string') {
    return {
      ...fallbackItem,
      label: item.trim() || fallbackItem.label,
    }
  }

  return fallbackItem
}

function normalizeStringList(items, fallbackItems) {
  const sourceItems = Array.isArray(items) && items.length > 0 ? items : fallbackItems
  return sourceItems
    .map((item, index) => {
      if (typeof item === 'string') {
        const trimmed = item.trim()
        return trimmed || fallbackItems[index] || fallbackItems[0] || ''
      }

      if (item && typeof item === 'object') {
        return pickTextField(item, ['label', 'title', 'name', 'value'], fallbackItems[index] || fallbackItems[0] || '')
      }

      return fallbackItems[index] || fallbackItems[0] || ''
    })
    .filter(Boolean)
}

function parseHighlightField(value, fallbackItem) {
  if (value && typeof value === 'object') {
    return {
      label: pickTextField(value, ['label', 'title', 'name'], fallbackItem.label),
      value: pickTextField(value, ['value', 'stat', 'number'], fallbackItem.value),
      note: pickTextField(value, ['note', 'description', 'copy', 'subtitle'], fallbackItem.note),
    }
  }

  if (typeof value === 'string') {
    const parts = value.split('|').map((part) => part.trim())

    return {
      label: parts[0] || fallbackItem.label,
      value: parts[1] || fallbackItem.value,
      note: parts[2] || fallbackItem.note,
    }
  }

  return fallbackItem
}

function HomeLumenStatCard({ item, index, scrollYProgress, prefersReducedMotion }) {
  const exitRange = [0.62, 1]

  const exitX = useTransform(
    scrollYProgress,
    exitRange,
    index === 1 || index === 3
      ? [0, index === 1 ? 240 : 280]
      : [0, index === 0 ? -240 : -280],
  )

  const exitY = useTransform(
    scrollYProgress,
    exitRange,
    index === 2 || index === 3
      ? [0, 150]
      : [0, index === 0 ? -36 : 0],
  )

  const exitRotate = useTransform(
    scrollYProgress,
    exitRange,
    index === 0
      ? [0, -9]
      : index === 1
        ? [0, 9]
        : index === 2
          ? [0, -13]
          : [0, 13],
  )

  return (
    <motion.article
      className="home-lumen-stat-card home-lumen-stat-card--wow"
      data-home-intro-card
      style={
        prefersReducedMotion
          ? undefined
          : {
            x: exitX,
            y: exitY,
            rotate: exitRotate,
          }
      }
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
            y: -5,
            scale: 1.015,
            boxShadow: '0 18px 30px rgba(64, 121, 163, 0.28)',
          }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
    >
      <p className="home-lumen-stat-label">{item.label}</p>
      <p className="home-lumen-stat-value">{item.value}</p>
      <p className="home-lumen-stat-note">{item.note}</p>
    </motion.article>
  )
}

function HomeLumenIntroSection({ title, copy, highlights, headingTag = 'h2' }) {
  const prefersReducedMotion = useReducedMotion()
  const HeadingTag = headingTag
  const introGridRef = useRef(null)
  const introAnimatedRef = useRef(false)
  const { scrollYProgress } = useScroll({
    target: introGridRef,
    offset: ['start 70%', 'end 10%'],
  })

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const introNode = introGridRef.current
    if (!introNode) return undefined

    const runIntroAnimation = () => {
      if (introAnimatedRef.current) return
      introAnimatedRef.current = true

      const copyCard = introNode.querySelector('[data-home-intro-copy]')
      const titleNode = introNode.querySelector('[data-home-intro-title]')
      const textNode = introNode.querySelector('[data-home-intro-text]')
      const statCards = introNode.querySelectorAll('[data-home-intro-card]')

      if (copyCard) {
        animate(copyCard, {
          opacity: [0, 1],
          translateY: [32, 0],
          scale: [0.96, 1],
          rotateX: [12, 0],
          filter: ['blur(12px)', 'blur(0px)'],
          duration: 950,
          ease: 'outExpo',
        })
      }

      if (titleNode) {
        animate(titleNode, {
          opacity: [0, 1],
          translateY: [30, -5, 0],
          scale: [0.93, 1.03, 1],
          rotateX: [18, -4, 0],
          filter: ['blur(12px)', 'blur(0px)'],
          duration: 1050,
          delay: 80,
          ease: 'outExpo',
        })
      }

      if (textNode) {
        animate(textNode, {
          opacity: [0, 1],
          translateY: [18, 0],
          clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
          filter: ['blur(8px)', 'blur(0px)'],
          duration: 760,
          delay: 180,
          ease: 'outCubic',
        })
      }

      if (statCards.length > 0) {
        statCards.forEach((card, index) => {
          animate(card, {
            opacity: [0, 1],
            translateY: [34, -6, 0],
            translateX: [index % 2 === 0 ? -20 : 20, 0],
            scale: [0.88, 1.03, 1],
            rotateX: [index % 2 === 0 ? 16 : -16, index % 2 === 0 ? -3 : 3, 0],
            rotateY: [index % 2 === 0 ? -12 : 12, 0],
            filter: ['blur(12px)', 'blur(0px)'],
            duration: 900,
            delay: 240 + index * 130,
            ease: 'outExpo',
          })
        })
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runIntroAnimation()
          }
        })
      },
      { threshold: 0.3 },
    )

    observer.observe(introNode)

    return () => {
      observer.disconnect()
    }
  }, [prefersReducedMotion])

  return (
    <SectionReveal className="section home-lumen-intro">
      <motion.div
        ref={introGridRef}
        className="container home-lumen-intro-grid home-lumen-intro-grid--wow"
      >
        <motion.div className="home-lumen-intro-copy home-lumen-intro-copy--wow" data-home-intro-copy>
          <span className="home-lumen-intro-radiance" aria-hidden="true" />
          <HeadingTag className="home-lumen-title">
            <span data-home-intro-title>{title}</span>
          </HeadingTag>
          <p className="muted home-lumen-copy" data-home-intro-text>{copy}</p>
          <span className="home-lumen-intro-beam" aria-hidden="true" />
        </motion.div>

        <motion.div className="home-lumen-stat-grid home-lumen-stat-grid--wow">
          {highlights.map((item, index) => (
            <HomeLumenStatCard
              key={item.label}
              item={item}
              index={index}
              scrollYProgress={scrollYProgress}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>
      </motion.div>
    </SectionReveal>
  )
}

function HomePage() {
  const [wpHomePage, setWpHomePage] = useState(null)
  const [journalPosts, setJournalPosts] = useState(blogPosts.slice(0, 3))
  const [portfolioItems, setPortfolioItems] = useState([])
  const [portfolioStatus, setPortfolioStatus] = useState('loading')
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
        const page = await getWordPressPageBySlugs(['home-react'])
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
      try {
        let galleryItems = await getWordPressGalleryFromPageId(WORDPRESS_GALLERY_PAGE_ID, {
          skipCache: false,
        })

        if (!Array.isArray(galleryItems) || galleryItems.length === 0) {
          galleryItems = await getWordPressGalleryFromPageBySlugs(['galeri', 'gallery'], {
            skipCache: false,
          })
        }

        if (!Array.isArray(galleryItems)) return

        if (galleryItems.length > 0) {
          console.log('GALLERY API ITEM:', galleryItems[0])
        }

        if (!cancelled) {
          const normalizedItems = (galleryItems || []).slice(0, 3).map((item) => {
            const titleValue = item.alt || item.rendered || item.title || 'Galeri'
            return {
              id: item.id,
              alt: titleValue,
              rendered: titleValue,
              title: titleValue,
              excerpt: item.excerpt || '',
              date: item.date || '',
              src: item.src || '',
              fullSrc: item.fullSrc || item.src || '',
              category: detectCategory(titleValue),
              type: item.type || '',
              link: '/galeri',
            }
          })

          const pickCategoryItem = (categoryName, fallbackIndex) => {
            const matched = normalizedItems.find((item) => detectCategory(item.alt || item.rendered) === categoryName)
            return matched || normalizedItems[fallbackIndex] || null
          }

          const selectedItems = [
            pickCategoryItem('Booth Pameran', 0),
            pickCategoryItem('Event', 1),
            pickCategoryItem('Billboard', 2),
          ].filter(Boolean)

          if (selectedItems.length > 0) {
            setPortfolioItems(selectedItems)
            setPortfolioStatus('ready')
          } else {
            setPortfolioItems([])
            setPortfolioStatus('error')
          }
        }
      } catch {
        if (!cancelled) {
          setPortfolioItems([])
          setPortfolioStatus('error')
        }
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
  const pageFields = wpHomePage ? { ...(wpHomePage.meta || {}), ...(wpHomePage.acf || {}) } : {}
  const introTitle = 'Konsultasi Gratis'
  const introCopy = 'Dirancang untuk Menarik Perhatian. Dibuat untuk Berdampak.'
  const heroKicker = pickTextField(pageFields, ['hero_kicker', 'home_hero_kicker'], 'PT Trimitra Multi Kreasi')
  const heroPrimaryLink = pickLinkField(pageFields, ['hero_primary_link', 'home_hero_primary_link'], '/kontak-kami')
  const heroSecondaryLink = pickLinkField(pageFields, ['hero_secondary_link', 'home_hero_secondary_link'], '/galeri')
  const identityKicker = pickTextField(pageFields, ['identity_kicker', 'home_identity_kicker'], 'Tentang Website Ini')
  const identityTitle = pickTextField(pageFields, ['identity_title', 'home_identity_title'], 'PT Trimitra Multi Kreasi')
  const identitySummary = 'Website ini adalah profil layanan Trimitra untuk Booth Pameran, Event Organizer, dan Media Outdoor. Fokus kami adalah membantu Brand terlihat kuat dengan desain, produksi, dan eksekusi yang terintegrasi.'
  const identityPillars = normalizeStringList(
    pickArrayField(pageFields, ['identity_pillars', 'home_identity_pillars'], DEFAULT_HOME_PILLARS),
    DEFAULT_HOME_PILLARS,
  ).filter((pillar) => pillar.trim().toLowerCase() !== 'interior komersial')
  const identityPrimaryLabel = pickTextField(pageFields, ['identity_primary_label', 'home_identity_primary_label'], 'Lihat Layanan')
  const identityPrimaryLink = pickLinkField(pageFields, ['identity_primary_link', 'home_identity_primary_link'], '/layanan')
  const identitySecondaryLabel = pickTextField(
    pageFields,
    ['identity_secondary_label', 'home_identity_secondary_label'],
    'Konsultasi Gratis',
  )
  const identitySecondaryLink = pickLinkField(
    pageFields,
    ['identity_secondary_link', 'home_identity_secondary_link'],
    '/kontak-kami',
  )
  const partnershipKicker = pickTextField(pageFields, ['partnership_kicker', 'home_partnership_kicker'], 'Partnership')
  const partnershipTitle = pickTextField(
    pageFields,
    ['partnership_title', 'home_partnership_title'],
    'Dipercaya oleh Berbagai Brand untuk Berbagai Skala Kebutuhan',
  )
  const partnershipCopy = pickTextField(
    pageFields,
    ['partnership_copy', 'home_partnership_copy'],
    'Kami telah bekerja sama dengan berbagai perusahaan dalam menghadirkan event, booth, dan media advertising dengan eksekusi yang rapi dan berdampak.',
  )
  const homeHighlights = [
    parseHighlightField(pageFields.highlight_1, DEFAULT_HOME_HIGHLIGHTS[0]),
    parseHighlightField(pageFields.highlight_2, DEFAULT_HOME_HIGHLIGHTS[1]),
    parseHighlightField(pageFields.highlight_3, DEFAULT_HOME_HIGHLIGHTS[2]),
    parseHighlightField(pageFields.highlight_4, DEFAULT_HOME_HIGHLIGHTS[3]),
  ]

  if (wpHomePage) {
    const journalKicker = pickTextField(pageFields, ['journal_kicker'], 'Insight Terbaru')
    const journalTitle = pickTextField(pageFields, ['journal_title'], 'Berita & Artikel Trimitra')
    const journalButtonLabel = pickTextField(pageFields, ['journal_button_label'], 'Lihat Semua')
    const portfolioKicker = pickTextField(pageFields, ['portfolio_kicker'], 'Portofolio')
    const portfolioTitle = pickTextField(pageFields, ['portfolio_title'], 'Proyek Unggulan')
    const ctaTitle = pickTextField(pageFields, ['cta_title', 'home_cta_title'], 'Siap Wujudkan Aktivasi Brand yang Lebih Berdampak?')
    const ctaCopy = pickTextField(pageFields, ['cta_copy', 'home_cta_copy'], 'Konsultasikan kebutuhan booth exhibition, event, dan advertising Anda bersama tim Trimitra untuk eksekusi yang lebih presisi.').replace(/\bmedia outdoor\b/gi, 'advertising')
    const ctaPrimaryLabel = pickTextField(pageFields, ['cta_primary_label'], 'Konsultasi Sekarang')
    const ctaPrimaryLink = pickLinkField(pageFields, ['cta_primary_link'], '/kontak-kami')
    const ctaSecondaryLabel = pickTextField(pageFields, ['cta_secondary_label'], 'Lihat Portofolio')
    const ctaSecondaryLink = pickLinkField(pageFields, ['cta_secondary_link'], '/layanan')

    return (
      <div className="home-page-lumen">
        <AccordionHero kicker={heroKicker} primaryLink={heroPrimaryLink} secondaryLink={heroSecondaryLink} />

        <HomeLumenIntroSection
          title={introTitle}
          copy={introCopy}
          highlights={homeHighlights}
          headingTag="h2"
        />

        <HomeIdentitySection
          kicker={identityKicker}
          title={identityTitle}
          summary={identitySummary}
          pillars={identityPillars}
          primaryLabel={identityPrimaryLabel}
          primaryLink={identityPrimaryLink}
          secondaryLabel={identitySecondaryLabel}
          secondaryLink={identitySecondaryLink}
        />

        <ServiceShowcaseSection />

        <PortfolioShowcase kicker={portfolioKicker} title={portfolioTitle} items={portfolioItems} status={portfolioStatus} />

        <ValueNarrativeSection />

        <HomePartnershipSection
          kicker={partnershipKicker}
          title={partnershipTitle}
          copy={partnershipCopy}
        />

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
      <AccordionHero kicker={heroKicker} primaryLink={heroPrimaryLink} secondaryLink={heroSecondaryLink} />

      <HomeLumenIntroSection
        title={introTitle}
        copy={introCopy}
        highlights={homeHighlights}
        headingTag="h1"
      />

      <HomeIdentitySection
        kicker={identityKicker}
        title={identityTitle}
        summary={identitySummary}
        pillars={identityPillars}
        primaryLabel={identityPrimaryLabel}
        primaryLink={identityPrimaryLink}
        secondaryLabel={identitySecondaryLabel}
        secondaryLink={identitySecondaryLink}
      />

      <ServiceShowcaseSection />

      <PortfolioShowcase kicker="Portofolio" title="Proyek Unggulan" items={portfolioItems} status={portfolioStatus} />

      <ValueNarrativeSection />

      <HomePartnershipSection
        kicker={partnershipKicker}
        title={partnershipTitle}
        copy={partnershipCopy}
      />

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
            Konsultasikan kebutuhan booth exhibition, event, dan advertising Anda bersama tim Trimitra untuk eksekusi yang lebih presisi.
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
