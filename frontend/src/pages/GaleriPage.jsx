import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

const fallbackGallery = [
  {
    type: 'square',
    category: 'Booth Pameran',
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    alt: 'Booth pameran brand dengan struktur modern dan pencahayaan fokus.',
  },
  {
    type: 'tall',
    category: 'Booth Pameran',
    src: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=900&q=80',
    alt: 'Detail area booth exhibition dengan alur pengunjung yang terarah.',
  },
  {
    type: 'square',
    category: 'Billboard',
    src: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=900&q=80',
    alt: 'Media billboard outdoor di koridor jalan utama perkotaan.',
  },
  {
    type: 'square',
    category: 'Event',
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
    alt: 'Suasana event korporat dengan panggung dan audiens aktif.',
  },
  {
    type: 'square',
    category: 'Event',
    src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    alt: 'Momen event activation dengan tata cahaya dan crowd engagement.',
  },
  {
    type: 'tall',
    category: 'Booth Pameran',
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    alt: 'Elevasi vertikal booth pameran untuk meningkatkan visibilitas brand.',
  },
  {
    type: 'tall',
    category: 'Billboard',
    src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?auto=format&fit=crop&w=900&q=80',
    alt: 'Penempatan billboard di titik traffic padat dengan exposure tinggi.',
  },
  {
    type: 'wide',
    category: 'Booth Pameran',
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    alt: 'Tampilan lebar area booth exhibition untuk kebutuhan showcase brand.',
  },
]

function GaleriPage() {
  const prefersReducedMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeIndex, setActiveIndex] = useState(null)
  const [galleryItems, setGalleryItems] = useState(fallbackGallery)
  const [isLoadingWp, setIsLoadingWp] = useState(isWordPressConfiguredForPages())
  const prefetchedImagesRef = useRef(new Set())
  const gridSectionRef = useRef(null)

  const activeFilter =
    queryToFilter[searchParams.get('kategori') ?? 'semua'] ?? 'Semua'

  const rawPage = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1

  useEffect(() => {
    let cancelled = false

    async function loadGalleryFromWordPress() {
      if (!isWordPressConfiguredForPages()) return
      try {
        const pageMedia = await getWordPressGalleryFromPageBySlugs(['galeri', 'gallery'])
        if (!cancelled && pageMedia.length > 0) {
          setGalleryItems(pageMedia)
          setIsLoadingWp(false)
          return
        }

        const libraryMedia = await getWordPressGalleryMedia({ perPage: 100, allPages: true })
        if (!cancelled && libraryMedia.length > 0) {
          setGalleryItems(libraryMedia)
        }
      } catch {
        // Keep fallback gallery when WordPress media is unreachable.
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
  const heroImage = galleryItems[0]?.src || fallbackGallery[0].src
  const heroFeatureTitle = galleryItems[0]?.alt || fallbackGallery[0].alt
  const categoryCounts = useMemo(() => {
    return galleryFilters.reduce((counts, filter) => {
      counts[filter] = filter === 'Semua'
        ? galleryItems.length
        : galleryItems.filter((item) => item.category === filter).length
      return counts
    }, {})
  }, [galleryItems])

  useEffect(() => {
    document.body.classList.add('route-gallery')
    return () => {
      document.body.classList.remove('route-gallery')
    }
  }, [])

  useEffect(() => {
    if (currentPage <= totalPages) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('kategori', filterToQuery[activeFilter])
      next.set('page', String(totalPages))
      return next
    })
  }, [activeFilter, currentPage, setSearchParams, totalPages])

  useEffect(() => {
    if (activeIndex === null) return
    if (activeIndex > pagedGallery.length - 1) {
      setActiveIndex(0)
    }
  }, [activeIndex, pagedGallery.length])

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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('kategori', queryValue)
      next.set('page', '1')
      return next
    })
  }

  const handlePageChange = (page) => {
    const nextPage = Math.min(totalPages, Math.max(1, page))
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('kategori', filterToQuery[activeFilter])
      next.set('page', String(nextPage))
      return next
    })
  }

  const scrollToGrid = () => {
    gridSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="galeri-page-fix gallery-page-simple">
      <section className="gallery-hero gallery-hero-redesign">
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

      <section className="gallery-filter gallery-filter-sticky">
        <div className="container filter-pills gallery-filter-shell">
          <div className="gallery-filter-intro">
            <p className="gallery-filter-eyebrow">Kategori koleksi</p>
            <h2>Temukan karya paling relevan</h2>
          </div>
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
      </section>

      <section className="gallery-grid-section" ref={gridSectionRef}>
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
            <button
              type="button"
              className="gallery-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

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
                  <button
                    key={item}
                    type="button"
                    className={`gallery-page-btn ${item === currentPage ? 'is-active' : ''}`}
                    onClick={() => handlePageChange(item)}
                    aria-current={item === currentPage ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="gallery-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
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
