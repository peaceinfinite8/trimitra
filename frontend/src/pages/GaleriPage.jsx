import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import LazyImage from '../components/ui/LazyImage'
import {
  getWordPressGalleryMedia,
  getWordPressGalleryFromPageBySlugs,
  isWordPressConfiguredForPages,
} from '../data/wordpressPages'

const galleryFilters = ['Semua', 'Booth Pameran', 'Event', 'Billboard']
const filterToQuery = {
  Semua: 'semua',
  'Booth Pameran': 'booth-pameran',
  Event: 'event',
  Billboard: 'billboard',
}

const queryToFilter = Object.fromEntries(
  Object.entries(filterToQuery).map(([filter, query]) => [query, filter]),
)

const ITEMS_PER_PAGE = 18
const MAX_PAGINATION_NUMBERS = 10

const curationContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const curationCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

function CategoryGridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" role="presentation" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function extractUploadYearMonth(src = '') {
  const match = String(src).match(/\/uploads\/(20\d{2})\/(\d{2})\//)
  if (!match) return 0
  return Number(`${match[1]}${match[2]}`)
}

function getDatasetRecencyScore(items = []) {
  return items.reduce((latest, item) => {
    return Math.max(latest, extractUploadYearMonth(item?.src || ''))
  }, 0)
}

function chooseGalleryDataset(pageMedia = [], libraryMedia = []) {
  if (pageMedia.length === 0) return libraryMedia
  if (libraryMedia.length === 0) return pageMedia

  const pageRecency = getDatasetRecencyScore(pageMedia)
  const libraryRecency = getDatasetRecencyScore(libraryMedia)

  // Prefer the newer source when page-level attachments are stale.
  if (libraryRecency > pageRecency) {
    return libraryMedia
  }

  return pageMedia
}

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= MAX_PAGINATION_NUMBERS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 'ellipsis-right', totalPages]
  }

  if (currentPage >= totalPages - 4) {
    return [
      1,
      'ellipsis-left',
      totalPages - 8,
      totalPages - 7,
      totalPages - 6,
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis-left',
    currentPage - 3,
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    currentPage + 3,
    currentPage + 4,
    'ellipsis-right',
    totalPages,
  ]
}

function GaleriPage() {
  const prefersReducedMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeIndex, setActiveIndex] = useState(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [isLoadingWp, setIsLoadingWp] = useState(isWordPressConfiguredForPages())
  const prefetchedImagesRef = useRef(new Set())

  const activeFilter =
    queryToFilter[searchParams.get('kategori') ?? 'semua'] ?? 'Semua'

  const rawPage = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1

  useEffect(() => {
    let cancelled = false

    async function loadGalleryFromWordPress() {
      if (!isWordPressConfiguredForPages()) {
        if (!cancelled) setIsLoadingWp(false)
        return
      }
      try {
        const [pageMedia, libraryMedia] = await Promise.all([
          getWordPressGalleryFromPageBySlugs(['galeri', 'gallery']),
          getWordPressGalleryMedia({ perPage: 100, allPages: true }),
        ])

        if (!cancelled) {
          setGalleryItems(chooseGalleryDataset(pageMedia, libraryMedia))
        }
      } catch {
        if (!cancelled) {
          setGalleryItems([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWp(false)
        }
      }
    }

    loadGalleryFromWordPress()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleGallery = useMemo(() => {
    if (activeFilter === 'Semua') return galleryItems
    return galleryItems.filter((item) => item.category === activeFilter)
  }, [activeFilter, galleryItems])

  const totalPages = Math.max(1, Math.ceil(visibleGallery.length / ITEMS_PER_PAGE))
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE
  const pagedGallery = useMemo(
    () => visibleGallery.slice(pageStart, pageStart + ITEMS_PER_PAGE),
    [visibleGallery, pageStart],
  )
  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  )
  const activeFilterTransitionKey = `${activeFilter}-${currentPage}`
  const heroImage = galleryItems[0]?.src || ''
  const heroFeatureTitle = galleryItems[0]?.alt || 'Tambahkan foto di halaman GALERI WordPress untuk ditampilkan di sini.'
  const categoryCounts = useMemo(() => {
    return galleryFilters.reduce((counts, filter) => {
      counts[filter] = filter === 'Semua'
        ? galleryItems.length
        : galleryItems.filter((item) => item.category === filter).length
      return counts
    }, {})
  }, [galleryItems])
    const gallerySnapshots = useMemo(
      () => galleryFilters
        .filter((filter) => filter !== 'Semua')
        .map((filter) => {
          const preview = galleryItems.find((item) => item.category === filter)
          return {
            filter,
            count: categoryCounts[filter] ?? 0,
            preview,
          }
        }),
      [categoryCounts, galleryItems],
    )
    const curatedCategoryCards = useMemo(
      () => gallerySnapshots.map((snapshot) => ({
        ...snapshot,
        totalLabel: `${String(snapshot.count).padStart(2, '0')} visual tersedia`,
      })),
      [gallerySnapshots],
    )

  useEffect(() => {
    if (activeIndex === null) return undefined
    if (pagedGallery.length === 0) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveIndex(null)
        return
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => {
          if (prev === null) return 0
          return (prev + 1) % pagedGallery.length
        })
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => {
          if (prev === null) return 0
          return (prev - 1 + pagedGallery.length) % pagedGallery.length
        })
      }
    }

    document.body.classList.add('lightbox-open')
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.classList.remove('lightbox-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex, pagedGallery.length])

  useEffect(() => {
    if (typeof window === 'undefined' || currentPage >= totalPages) return

    const nextPageStart = currentPage * ITEMS_PER_PAGE
    const nextPageItems = visibleGallery.slice(nextPageStart, nextPageStart + ITEMS_PER_PAGE)

    nextPageItems.forEach((item) => {
      if (!item?.src || prefetchedImagesRef.current.has(item.src)) return
      const image = new window.Image()
      image.decoding = 'async'
      image.src = item.src
      prefetchedImagesRef.current.add(item.src)
    })
  }, [currentPage, totalPages, visibleGallery])

  useEffect(() => {
    setActiveIndex(null)
  }, [currentPage, activeFilter])

  const handleFilterChange = (filter) => {
    const queryValue = filterToQuery[filter]
    const next = new URLSearchParams(searchParams)
    next.set('kategori', queryValue)
    next.set('page', '1')
    setSearchParams(next)
  }

  const getPageHref = (page) => {
    const nextPage = Math.min(totalPages, Math.max(1, page))
    const next = new URLSearchParams(searchParams)
    next.set('kategori', filterToQuery[activeFilter])
    next.set('page', String(nextPage))
    return `?${next.toString()}`
  }

  const scrollToGrid = () => {
    document.getElementById('galeri-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="galeri-page-fix gallery-page-simple">
      <section className="gallery-hero gallery-hero-redesign" data-nav-hero>
        <div className="container">
          <div className="gallery-hero-grid">
            <div className="gallery-hero-copy">
              <p className="kicker">Beranda &nbsp;›&nbsp; Galeri</p>
              <h1 className="section-title">Galeri Karya Kami</h1>
              <p className="gallery-hero-tagline">
                Portofolio visual Trimitra yang dirancang ringkas, jelas, dan nyaman dilihat.
              </p>
              <p className="gallery-hero-summary">
                Setiap karya di sini disusun untuk memperlihatkan hasil akhir secara bersih, agar
                Anda bisa cepat menilai kualitas, skala, dan karakter eksekusi kami.
              </p>

              <div className="gallery-hero-points" aria-label="Nilai utama galeri Trimitra">
                <span>Kurasi rapi per kategori</span>
                <span>Visual resolusi tinggi</span>
                <span>Flow eksplorasi cepat</span>
              </div>

              <div className="gallery-hero-meta-rail" aria-label="Ringkasan koleksi galeri">
                <article className="gallery-hero-meta-item">
                  <span>Total Visual</span>
                  <strong>{String(galleryItems.length).padStart(2, '0')}</strong>
                </article>
                <article className="gallery-hero-meta-item">
                  <span>Kategori Aktif</span>
                  <strong>{activeFilter}</strong>
                </article>
                <article className="gallery-hero-meta-item">
                  <span>Halaman</span>
                  <strong>{currentPage}/{totalPages}</strong>
                </article>
              </div>

              <div className="gallery-hero-actions">
                <button type="button" className="btn btn-primary" onClick={scrollToGrid}>
                  Lihat koleksi
                </button>
                <a href="/kontak-kami" className="btn btn-secondary">
                  Konsultasi proyek
                </a>
              </div>
            </div>

            <motion.article
              className="gallery-hero-feature card"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {heroImage ? (
                <button
                  type="button"
                  className="gallery-lightbox-trigger gallery-hero-feature-trigger"
                  onClick={() => setActiveIndex(0)}
                  aria-label="Buka karya unggulan galeri"
                >
                  <LazyImage
                    src={heroImage}
                    alt="Galeri karya Trimitra"
                    className="gallery-image gallery-hero-feature-image"
                  />
                  <span className="gallery-card-overlay gallery-hero-feature-overlay" aria-hidden="true">
                    <span className="gallery-card-badge">Highlight Galeri</span>
                    <span className="gallery-card-title">{heroFeatureTitle}</span>
                    <span className="gallery-hero-feature-meta">Visual pembuka koleksi</span>
                  </span>
                </button>
              ) : (
                <div className="gallery-hero-feature-empty" role="status" aria-live="polite">
                  <p>Belum ada foto dari GALERI WordPress.</p>
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </section>

      <section className="gallery-narrative-strip">
        <div className="container gallery-narrative-grid">
          <motion.article
            className="gallery-narrative-card"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="gallery-narrative-eyebrow">Kurikulum visual</p>
            <h2>Terstruktur, tidak berisik</h2>
            <p>
              Koleksi ditampilkan dengan ritme yang bersih supaya visual utama tetap jadi pusat
              perhatian.
            </p>
          </motion.article>

          <motion.article
            className="gallery-narrative-card"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="gallery-narrative-eyebrow">Kurasi kategori</p>
            <h2>Filter cepat, hasil jelas</h2>
            <p>
              Anda bisa menelusuri Booth, Event, atau Billboard tanpa kehilangan konteks visual.
            </p>
          </motion.article>

          <motion.article
            className="gallery-narrative-card"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="gallery-narrative-eyebrow">Respons interaktif</p>
            <h2>Scroll, hover, dan buka detail</h2>
            <p>
              Motion dibuat halus supaya pengalaman menjelajah terasa modern, bukan sekadar statis.
            </p>
          </motion.article>
        </div>
      </section>

      <section className="gallery-curation-band" aria-label="Eksplorasi kategori unggulan">
        <div className="container">
          <div className="gallery-curation-head">
            <p className="gallery-curation-kicker">Pilihan Cepat</p>
            <h2>Mulai dari kategori yang paling Anda butuhkan</h2>
            <motion.div
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              whileInView={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              style={{ originX: 0 }}
              className="gallery-curation-underline"
            />
            <p>
              Gunakan panel ini untuk langsung melompat ke kumpulan karya yang relevan,
              lalu lanjutkan ke grid utama untuk melihat detailnya.
            </p>
          </div>

          <motion.div
            className="gallery-curation-grid"
            variants={curationContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {curatedCategoryCards.map((snapshot, index) => {
              const isAllCard = snapshot.filter === 'Semua'
              const isActive = snapshot.filter === activeFilter

              return (
                <motion.button
                  key={snapshot.filter}
                  type="button"
                  className={`group gallery-curation-card ${isAllCard ? 'gallery-curation-card--all' : 'gallery-curation-card--image'} ${isActive ? 'is-active' : ''}`}
                  variants={curationCardVariants}
                  whileHover={prefersReducedMotion ? undefined : {
                    scale: 1.02,
                    boxShadow: '0 0 0 1px rgba(125,211,252,0.35), 0 0 24px rgba(125,211,252,0.15)',
                  }}
                  whileFocus={prefersReducedMotion ? undefined : {
                    scale: 1.02,
                    boxShadow: '0 0 0 1px rgba(125,211,252,0.35), 0 0 24px rgba(125,211,252,0.15)',
                  }}
                  onClick={() => {
                    handleFilterChange(snapshot.filter)
                    scrollToGrid()
                  }}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="gallery-curation-media" aria-hidden="true">
                    {snapshot.preview?.src ? (
                      <LazyImage
                        src={snapshot.preview.src}
                        alt={snapshot.preview.alt || snapshot.filter}
                        className="gallery-image gallery-curation-image"
                        wrapperClassName="gallery-curation-image-wrap"
                      />
                    ) : null}
                  </span>
                  <span className="gallery-curation-topline" aria-hidden="true" />
                  <span className="gallery-curation-badge">{snapshot.filter}</span>
                  <span className="gallery-curation-overlay" aria-hidden="true" />
                  <span className="gallery-curation-body">
                    <span className="gallery-curation-separator" aria-hidden="true" />
                    <span className="gallery-curation-meta">{snapshot.totalLabel}</span>
                    <span className="gallery-curation-title">{snapshot.filter}</span>
                    <span className="gallery-curation-action">Lihat Semua →</span>
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section
        className="gallery-filter gallery-filter-sticky"
      >
        <div className="container filter-pills gallery-filter-shell">
          <div className="gallery-filter-intro">
            <p className="gallery-filter-eyebrow">Kategori koleksi</p>
            <h2>Temukan karya paling relevan</h2>
          </div>
          <div className="gallery-filter-actions" role="group" aria-label="Pilih kategori koleksi">
            {galleryFilters.map((filter) => (
              <button
                key={filter}
                className={filter === activeFilter ? 'pill active' : 'pill'}
                onClick={() => handleFilterChange(filter)}
                type="button"
              >
                <span>{filter}</span>
                <strong>{String(categoryCounts[filter] ?? 0).padStart(2, '0')}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-grid-section" id="galeri-grid">
        <div className="container gallery-grid-head">
          <p className="gallery-grid-head-kicker">Curated Works</p>
          <h2>Eksplorasi Visual Pilihan</h2>
          <p>
            Menampilkan <strong>{pagedGallery.length}</strong> karya di halaman ini dari total{' '}
            <strong>{visibleGallery.length}</strong> karya pada kategori <strong>{activeFilter}</strong>.
          </p>
        </div>

        {isLoadingWp ? (
          <div className="container gallery-grid" aria-label="Memuat galeri">
            {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
              <article
                key={`gallery-skeleton-${index}`}
                className="gallery-grid-item square gallery-card card gallery-skeleton-card"
                aria-hidden="true"
              >
                <div className="gallery-skeleton-block" />
              </article>
            ))}
          </div>
        ) : visibleGallery.length === 0 ? (
          <div className="container gallery-empty-state" role="status" aria-live="polite">
            <h3>Foto galeri belum tersedia</h3>
            <p>Silakan tambahkan gambar pada halaman GALERI di WordPress agar tampil di halaman ini.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeFilterTransitionKey}
              className="container gallery-grid gallery-grid-premium"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.05 }}
              animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {pagedGallery.map((item, idx) => (
                <motion.article
                  key={item.id || item.src}
                  className={`gallery-grid-item gallery-card group card ${item.type}`}
                  initial={
                    prefersReducedMotion
                      ? false
                      : {
                        opacity: 0,
                        y: 26,
                        scale: 0.985,
                      }
                  }
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.42, delay: (idx % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className="gallery-lightbox-trigger"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Buka gambar galeri ${pageStart + idx + 1}`}
                  >
                    <LazyImage
                      src={item.src}
                      alt={item.alt || `Gallery ${idx + 1}`}
                      className="gallery-image"
                    />
                    <span className="gallery-card-overlay" aria-hidden="true">
                      <span className="gallery-card-title">{item.alt || `Karya ${pageStart + idx + 1}`}</span>
                      <span className="gallery-card-badge">{item.category || 'Galeri'}</span>
                    </span>
                  </button>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {totalPages > 1 && (
          <div className="container gallery-pagination" aria-label="Navigasi halaman galeri">
            {currentPage === 1 ? (
              <button type="button" className="gallery-page-btn" disabled>
                Prev
              </button>
            ) : (
              <Link className="gallery-page-btn" to={getPageHref(currentPage - 1)}>
                Prev
              </Link>
            )}

            <div className="gallery-page-number-wrap">
              {pageItems.map((item, index) => {
                if (typeof item === 'string') {
                  return (
                    <span key={`${item}-${index}`} className="gallery-page-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  )
                }

                return (
                  item === currentPage ? (
                    <button
                      key={item}
                      type="button"
                      className="gallery-page-btn is-active"
                      aria-current="page"
                      disabled
                    >
                      {item}
                    </button>
                  ) : (
                    <Link key={item} className="gallery-page-btn" to={getPageHref(item)}>
                      {item}
                    </Link>
                  )
                )
              })}
            </div>

            {currentPage === totalPages ? (
              <button type="button" className="gallery-page-btn" disabled>
                Next
              </button>
            ) : (
              <Link className="gallery-page-btn" to={getPageHref(currentPage + 1)}>
                Next
              </Link>
            )}
          </div>
        )}

        <div className="container gallery-layout-cta">
          <div className="gallery-layout-cta-shell">
            <p className="gallery-layout-cta-kicker">Punya brief proyek spesifik?</p>
            <h3>Diskusikan konsep visual Anda bersama tim Trimitra</h3>
            <div className="gallery-layout-cta-actions">
              <a href="/kontak-kami" className="btn btn-primary">
                Mulai Konsultasi
              </a>
              <button type="button" className="btn btn-secondary" onClick={scrollToGrid}>
                Kembali ke koleksi
              </button>
            </div>
          </div>
        </div>
      </section>

      {activeIndex !== null && pagedGallery[activeIndex] && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox galeri"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            aria-label="Tutup lightbox"
            onClick={() => setActiveIndex(null)}
          >
            ×
          </button>

          <button
            type="button"
            className="gallery-lightbox-nav prev"
            aria-label="Gambar sebelumnya"
            onClick={(event) => {
              event.stopPropagation()
              setActiveIndex((prev) => (prev - 1 + pagedGallery.length) % pagedGallery.length)
            }}
          >
            ‹
          </button>

          <figure className="gallery-lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <img
              src={pagedGallery[activeIndex].src}
              alt={`Gallery ${activeIndex + 1}`}
              className="gallery-lightbox-image"
            />
            <figcaption>
              {pagedGallery[activeIndex].category} · {pageStart + activeIndex + 1}/{visibleGallery.length}
            </figcaption>
          </figure>

          <button
            type="button"
            className="gallery-lightbox-nav next"
            aria-label="Gambar berikutnya"
            onClick={(event) => {
              event.stopPropagation()
              setActiveIndex((prev) => (prev + 1) % pagedGallery.length)
            }}
          >
            ›
          </button>
        </div>
      )}

    </div>
  )
}

export default GaleriPage
