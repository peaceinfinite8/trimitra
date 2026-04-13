import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import LazyImage from '../components/ui/LazyImage'
import { blogPosts } from '../data/blogPosts'
import {
  getBlogPostsFromWordPress,
  isWordPressConfigured,
  prefetchBlogPostBySlugFromWordPress,
} from '../data/wordpressBlog'
import { prefetchRoute } from '../app/routePrefetch'

const postCategories = ['Semua', 'Berita', 'Artikel']
const ITEMS_PER_PAGE = 9
const MAX_PAGINATION_NUMBERS = 10
const LIVE_REFRESH_INTERVAL_MS = 20000
const WP_NEWS_SNAPSHOT_KEY = 'berita:wp-posts:v1'

function readWordPressPostsSnapshot() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(WP_NEWS_SNAPSHOT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {
    // Ignore parsing/storage errors.
  }
  return null
}

function writeWordPressPostsSnapshot(posts) {
  if (typeof window === 'undefined') return
  if (!Array.isArray(posts) || posts.length === 0) return
  try {
    window.sessionStorage.setItem(WP_NEWS_SNAPSHOT_KEY, JSON.stringify(posts))
  } catch {
    // Ignore quota/storage errors.
  }
}

function normalizeCategoryForFilter(category) {
  const source = (category || '').toLowerCase()
  if (source.includes('artikel') || source.includes('article') || source.includes('blog')) {
    return 'Artikel'
  }
  return 'Berita'
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

function BeritaPage() {
  const prefersReducedMotion = useReducedMotion()
  const initialDataRef = useRef(null)
  if (!initialDataRef.current) {
    const snapshot = readWordPressPostsSnapshot()
    initialDataRef.current = {
      posts: snapshot || blogPosts,
      hasWordPressData: Boolean(snapshot && snapshot.length > 0),
    }
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [posts, setPosts] = useState(initialDataRef.current.posts)
  const [isLoadingWp, setIsLoadingWp] = useState(() => isWordPressConfigured())
  const prefetchedImagesRef = useRef(new Set())
  const prefetchedDetailRef = useRef(new Set())
  const refreshPromiseRef = useRef(null)
  const hasSyncedWordPressRef = useRef(initialDataRef.current.hasWordPressData)

  useEffect(() => {
    const rawPage = Number(searchParams.get('page') ?? '1')
    const parsedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
    setCurrentPage(parsedPage)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const applyFetchedPosts = (wpPosts) => {
      if (Array.isArray(wpPosts) && wpPosts.length > 0) {
        setPosts(wpPosts)
        hasSyncedWordPressRef.current = true
        writeWordPressPostsSnapshot(wpPosts)
        return
      }

      if (!hasSyncedWordPressRef.current) {
        setPosts(blogPosts)
      }
    }

    async function refreshFromWordPress({ forceFresh = false, initialLoad = false } = {}) {
      if (!isWordPressConfigured()) {
        if (!cancelled && initialLoad) {
          setIsLoadingWp(false)
        }
        return
      }

      let request = refreshPromiseRef.current
      if (!request) {
        request = getBlogPostsFromWordPress({
          skipCache: forceFresh,
          staleWhileRevalidate: !forceFresh,
          ttlMs: 60 * 1000,
        })
        refreshPromiseRef.current = request
      }

      try {
        const wpPosts = await request
        if (!cancelled) {
          applyFetchedPosts(wpPosts)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[BeritaPage] WordPress API error, keeping last known posts:', error?.message)
          if (!hasSyncedWordPressRef.current) {
            setPosts(blogPosts)
          }
        }
      } finally {
        if (refreshPromiseRef.current === request) {
          refreshPromiseRef.current = null
        }
        if (!cancelled && initialLoad) {
          setIsLoadingWp(false)
        }
      }
    }

    refreshFromWordPress({ initialLoad: true, forceFresh: true })

    const onFocus = () => refreshFromWordPress({ forceFresh: true })
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshFromWordPress({ forceFresh: true })
      }
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshFromWordPress({ forceFresh: true })
      }
    }, LIVE_REFRESH_INTERVAL_MS)

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const filteredPosts = useMemo(
    () =>
      activeCategory === 'Semua'
        ? posts
        : posts.filter((post) => normalizeCategoryForFilter(post.category) === activeCategory),
    [activeCategory, posts],
  )

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE))
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE
  const pagedPosts = useMemo(
    () => filteredPosts.slice(pageStart, pageStart + ITEMS_PER_PAGE),
    [filteredPosts, pageStart],
  )

  useEffect(() => {
    if (currentPage <= totalPages) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(totalPages))
      return next
    })
  }, [currentPage, setSearchParams, totalPages])

  const featuredPost = posts[0] || blogPosts[0]
  const heroLines = ['Berita &', 'Wawasan']

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', '1')
      return next
    })
  }

  const handlePageChange = (nextPage) => {
    const clampedPage = Math.min(totalPages, Math.max(1, nextPage))
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(clampedPage))
      return next
    })
  }

  const prefetchDetail = (slug, imageUrl) => {
    if (!slug) return

    prefetchRoute('/berita-detail')

    if (!prefetchedDetailRef.current.has(slug)) {
      prefetchBlogPostBySlugFromWordPress(slug)
      prefetchedDetailRef.current.add(slug)
    }

    if (typeof window !== 'undefined' && imageUrl && !prefetchedImagesRef.current.has(imageUrl)) {
      const image = new window.Image()
      image.decoding = 'async'
      image.src = imageUrl
      prefetchedImagesRef.current.add(imageUrl)
    }
  }

  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || currentPage >= totalPages) return

    const nextPageStart = currentPage * ITEMS_PER_PAGE
    const nextPagePosts = filteredPosts.slice(nextPageStart, nextPageStart + ITEMS_PER_PAGE)

    nextPagePosts.forEach((post) => {
      if (!post?.image || prefetchedImagesRef.current.has(post.image)) return
      const image = new window.Image()
      image.decoding = 'async'
      image.src = post.image
      prefetchedImagesRef.current.add(post.image)
    })
  }, [currentPage, filteredPosts, totalPages])

  return (
    <div className="berita-page-redesign">
      <section className="berita-hero-clean" data-nav-hero>
        <div className="container berita-hero-clean-shell">
          <motion.p
            className="berita-crumb"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.1 }}
          >
            BERANDA &nbsp;›&nbsp; BERITA
          </motion.p>
          <motion.span
            className="berita-hero-pill"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.2 }}
          >
            JURNAL & INSIGHT
          </motion.span>
          <motion.h1
            className="berita-hero-title"
            initial={false}
            animate={{ opacity: 1 }}
          >
            {heroLines.map((line, index) => (
              <span className="berita-hero-line-wrap" key={line}>
                <motion.span
                  className="berita-hero-line"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 34 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.3 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>
          <motion.div
            className="berita-hero-accent"
            initial={prefersReducedMotion ? false : { opacity: 0, width: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, width: 48 }}
            transition={{ duration: 0.38, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.p
            className="berita-hero-subtitle"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.5 }}
          >
            Insight terbaru dari aktivitas dan industri Trimitra
          </motion.p>
        </div>
      </section>

      <section className="section blog-news-page berita-content-clean">
        <div className="container blog-shell berita-shell-clean">
          <section className="berita-featured-clean">
            <p className="berita-featured-label">FEATURED</p>
            <div className="berita-featured-grid">
              <motion.div
                className="berita-featured-media"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -26 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={`/berita/${featuredPost.slug}`}
                  aria-label={`Buka detail berita ${featuredPost.title}`}
                  onMouseEnter={() => prefetchDetail(featuredPost.slug, featuredPost.image)}
                  onFocus={() => prefetchDetail(featuredPost.slug, featuredPost.image)}
                >
                  <LazyImage
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    wrapperClassName="berita-featured-image-wrap"
                    className="berita-featured-image"
                  />
                </Link>
              </motion.div>

              <motion.article
                className="berita-featured-copy"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 26 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="berita-featured-meta">
                  <span className="berita-featured-category">{featuredPost.category}</span>
                  <span className="berita-featured-date">{featuredPost.date}</span>
                </div>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt}</p>
                <Link
                  className="berita-featured-cta"
                  to={`/berita/${featuredPost.slug}`}
                  onMouseEnter={() => prefetchDetail(featuredPost.slug, featuredPost.image)}
                  onFocus={() => prefetchDetail(featuredPost.slug, featuredPost.image)}
                >
                  Baca Selengkapnya
                </Link>
              </motion.article>
            </div>
          </section>

          <section className="berita-latest-clean">
            <div className="blog-recent-head">
              <h2>Artikel Terbaru</h2>
            </div>

            <div className="blog-category-tabs berita-filter-stick" role="tablist" aria-label="Filter kategori berita">
              {postCategories.map((category) => {
                const isActive = activeCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={isActive ? 'active' : ''}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                )
              })}
            </div>

            {isLoadingWp && posts.length === 0 ? (
              <div className="blog-post-grid" aria-label="Memuat daftar berita">
                {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                  <article key={`blog-skeleton-${index}`} className="blog-card blog-skeleton-card" aria-hidden="true">
                    <div className="blog-card-media blog-skeleton-block blog-skeleton-image" />
                    <div className="blog-card-body">
                      <div className="blog-skeleton-block blog-skeleton-title" />
                      <div className="blog-skeleton-block blog-skeleton-kicker" />
                      <div className="blog-skeleton-block blog-skeleton-text" />
                      <div className="blog-skeleton-block blog-skeleton-text short" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${activeCategory}-${currentPage}`}
                  className="blog-post-grid"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {pagedPosts.map((item, index) => {
                    const zigzagDelay = index * 0.045 + (index % 2 === 0 ? 0.02 : 0.08)
                    return (
                      <motion.article
                        key={item.slug || item.title}
                        className="blog-card"
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: zigzagDelay, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          to={`/berita/${item.slug}`}
                          className="blog-card-media-link"
                          aria-label={`Buka detail berita ${item.title}`}
                          onMouseEnter={() => prefetchDetail(item.slug, item.image)}
                          onFocus={() => prefetchDetail(item.slug, item.image)}
                        >
                          <LazyImage
                            src={item.image}
                            alt={item.title}
                            wrapperClassName="blog-card-media"
                            className="blog-card-image"
                          />
                        </Link>
                        <div className="blog-card-body">
                          <div className="berita-card-row">
                            <p className="blog-card-category">{item.category}</p>
                            <p className="blog-card-date">{item.date}</p>
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.excerpt}</p>
                        </div>
                      </motion.article>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            )}

            {totalPages > 1 && (
              <div className="gallery-pagination blog-pagination" aria-label="Navigasi halaman berita">
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
        </div>
      </section>
    </div>
  )
}

export default BeritaPage
