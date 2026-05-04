import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import LazyImage from '../components/ui/LazyImage'
import MasonryGrid from '../components/ui/MasonryGrid'
import CategoryDropdown from '../components/ui/CategoryDropdown'
import {
  getWordPressGalleryFromPageId,
  getWordPressGalleryFromPageBySlugs,
  isWordPressConfiguredForPages,
} from '../data/wordpressPages'

const galleryFilters = ['Semua', 'Booth Pameran', 'Event', 'Billboard', 'Backdrop', 'Gate']
const filterToQuery = {
  Semua: 'semua',
  'Booth Pameran': 'booth-pameran',
  Event: 'event',
  Billboard: 'billboard',
  Backdrop: 'backdrop',
  Gate: 'gate',
}

const queryToFilter = Object.fromEntries(
  Object.entries(filterToQuery).map(([filter, query]) => [query, filter]),
)

const ITEMS_PER_PAGE = 18
const MAX_PAGINATION_NUMBERS = 10
const WORDPRESS_GALLERY_PAGE_ID = 605
const GALLERY_SNAPSHOT_KEY = 'galeri:wp-gallery:v2'

function readGallerySnapshot() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(GALLERY_SNAPSHOT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    return null
  }

  return null
}

function writeGallerySnapshot(items) {
  if (typeof window === 'undefined') return
  if (!Array.isArray(items) || items.length === 0) return

  try {
    window.sessionStorage.setItem(GALLERY_SNAPSHOT_KEY, JSON.stringify(items))
  } catch {
    // Ignore quota/session errors.
  }
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
  const initialGallerySnapshot = useRef(readGallerySnapshot())
  const [galleryItems, setGalleryItems] = useState(() => initialGallerySnapshot.current || [])
  const [isLoadingWp, setIsLoadingWp] = useState(
    () => isWordPressConfiguredForPages() && !(initialGallerySnapshot.current?.length > 0),
  )
  const prefetchedImagesRef = useRef(new Set())
  const galleryRefreshInProgressRef = useRef(false)
  // Only scroll to filter section when user explicitly clicks pagination — not on mount/load
  const hasInteractedRef = useRef(false)

  const activeFilter =
    queryToFilter[searchParams.get('kategori') ?? 'semua'] ?? 'Semua'

  const rawPage = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1

  // On mount: always start from top of page, never mid-page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    // Only scroll when user has explicitly clicked a pagination control.
    // On mount/hard refresh hasInteractedRef is false — no scroll triggered.
    if (!hasInteractedRef.current) return

    const filterSection = document.querySelector('#filter-section')
    if (!filterSection) return
    filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentPage])

  useEffect(() => {
    let cancelled = false

    async function loadGalleryFromWordPress({ forceFresh = false, initialLoad = false } = {}) {
      if (!isWordPressConfiguredForPages()) {
        if (!cancelled && initialLoad) setIsLoadingWp(false)
        return
      }

      if (galleryRefreshInProgressRef.current) return
      galleryRefreshInProgressRef.current = true

      try {
        let pageMedia = await getWordPressGalleryFromPageId(WORDPRESS_GALLERY_PAGE_ID, {
          skipCache: forceFresh,
        })
        if (!Array.isArray(pageMedia) || pageMedia.length === 0) {
          pageMedia = await getWordPressGalleryFromPageBySlugs(['galeri', 'gallery'], {
            skipCache: forceFresh,
          })
        }

        if (!cancelled) {
          setGalleryItems(pageMedia)
          if (Array.isArray(pageMedia) && pageMedia.length > 0) {
            writeGallerySnapshot(pageMedia)
          }
        }
      } catch {
        if (!cancelled) {
          setGalleryItems([])
        }
      } finally {
        galleryRefreshInProgressRef.current = false
        if (!cancelled) {
          setIsLoadingWp(false)
        }
      }
    }

    loadGalleryFromWordPress({ initialLoad: true, forceFresh: false })

    const onFocus = () => loadGalleryFromWordPress({ forceFresh: true })
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadGalleryFromWordPress({ forceFresh: true })
      }
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadGalleryFromWordPress({ forceFresh: true })
      }
    }, 20000)

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
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

  const handlePageClick = () => {
    hasInteractedRef.current = true
  }

  const scrollToGrid = () => {
    const el = document.getElementById('gallery-section')
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top, behavior: 'smooth' })
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
                  <p>Foto Sedang Loading.</p>
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
              Anda bisa menelusuri Booth, Event, Billboard, Backdrop, atau Gate tanpa kehilangan konteks visual.
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

      <section
        id="filter-section"
        className="gallery-filter gallery-filter-sticky"
        style={{ scrollMarginTop: '80px' }}
      >
        <div className="container gallery-filter-shell">
          <div className="gallery-filter-intro">
            <p className="gallery-filter-eyebrow">Kategori koleksi</p>
            <h2>Temukan karya paling relevan</h2>
          </div>
          <div className="gallery-filter-scroll-wrap" aria-label="Pilih kategori koleksi">
            <div className="gallery-filter-actions" role="group">
              {galleryFilters.map((filter) => {
                const count = categoryCounts[filter] ?? 0
                // Hide non-"Semua" pills with 0 items (no content in that category yet)
                if (filter !== 'Semua' && count === 0) return null
                return (
                  <button
                    key={filter}
                    className={filter === activeFilter ? 'pill active' : 'pill'}
                    onClick={() => handleFilterChange(filter)}
                    type="button"
                  >
                    {filter}
                    <span className="pill-count">{String(count).padStart(2, '0')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile dropdown — replaces pills on small screens */}
          <div className="gallery-filter-dropdown-wrap">
            <CategoryDropdown
              filters={galleryFilters}
              activeFilter={activeFilter}
              categoryCounts={categoryCounts}
              onSelect={handleFilterChange}
            />
          </div>
        </div>
      </section>

      <section className="gallery-grid-section" id="gallery-section" style={{ scrollMarginTop: '96px' }}>
        <div className="container gallery-grid-head">
          <p className="gallery-grid-head-kicker">Curated Works</p>
          <h2>Eksplorasi Visual Pilihan</h2>
          <p>
            Menampilkan <strong>{pagedGallery.length}</strong> karya di halaman ini dari total{' '}
            <strong>{visibleGallery.length}</strong> karya pada kategori <strong>{activeFilter}</strong>.
          </p>
        </div>

        {isLoadingWp && visibleGallery.length === 0 ? (
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
              className="container gallery-grid-premium"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.05 }}
              animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <MasonryGrid
                items={pagedGallery}
                className="gallery-grid"
                gap={16}
                renderItem={(item, globalIdx) => (
                  <motion.article
                    key={item.id || item.src}
                    className={`gallery-grid-item gallery-card group card ${item.type}`}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, y: 26, scale: 0.985 }
                    }
                    whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.42, delay: (globalIdx % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      type="button"
                      className="gallery-lightbox-trigger"
                      onClick={() => setActiveIndex(globalIdx)}
                      aria-label={`Buka gambar galeri ${pageStart + globalIdx + 1}`}
                    >
                      <LazyImage
                        src={item.src}
                        fallbackSrc={item.fullSrc || item.src}
                        alt={item.alt || `Gallery ${globalIdx + 1}`}
                        className="gallery-image"
                        loading={globalIdx < 6 ? 'eager' : 'lazy'}
                        fetchPriority={globalIdx < 3 ? 'high' : 'auto'}
                        width={item.width || undefined}
                        height={item.height || undefined}
                        data-masonry-key={item.id ?? item.src}
                      />
                      <span className="gallery-card-overlay" aria-hidden="true">
                        <span className="gallery-card-title">{item.alt || `Karya ${pageStart + globalIdx + 1}`}</span>
                        <span className="gallery-card-badge">{item.category || 'Galeri'}</span>
                      </span>
                    </button>
                  </motion.article>
                )}
              />
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
              <Link className="gallery-page-btn" to={getPageHref(currentPage - 1)} onClick={handlePageClick}>
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
                    <Link key={item} className="gallery-page-btn" to={getPageHref(item)} onClick={handlePageClick}>
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
              <Link className="gallery-page-btn" to={getPageHref(currentPage + 1)} onClick={handlePageClick}>
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
              src={pagedGallery[activeIndex].fullSrc || pagedGallery[activeIndex].src}
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
