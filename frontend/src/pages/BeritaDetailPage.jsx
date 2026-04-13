import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SectionReveal } from '../components/animation/Reveal'
import LazyImage from '../components/ui/LazyImage'
import { prefetchRoute } from '../app/routePrefetch'
import { blogPosts, getBlogPostBySlug } from '../data/blogPosts'
import {
  getBlogPostBySlugFromWordPress,
  getBlogPostsFromWordPress,
  isWordPressConfigured,
  prefetchBlogPostBySlugFromWordPress,
} from '../data/wordpressBlog'

const LIVE_DETAIL_REFRESH_INTERVAL_MS = 20000

function BeritaDetailPage() {
  const { slug } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState(() => getBlogPostBySlug(slug))
  const [relatedPosts, setRelatedPosts] = useState(() => {
    const currentPost = getBlogPostBySlug(slug)
    if (!currentPost) return []
    const sameCategoryPosts = blogPosts.filter(
      (item) => item.slug !== currentPost.slug && item.category === currentPost.category,
    )
    const fallbackPosts = blogPosts.filter(
      (item) => item.slug !== currentPost.slug && item.category !== currentPost.category,
    )
    return [...sameCategoryPosts, ...fallbackPosts].slice(0, 3)
  })

  useEffect(() => {
    let cancelled = false
    let refreshInProgress = false

    async function loadFromWordPress({ forceFresh = false, initialLoad = false } = {}) {
      if (!isWordPressConfigured()) {
        const localPost = getBlogPostBySlug(slug)
        if (cancelled) return
        setPost(localPost)
        if (!localPost) {
          if (initialLoad) setIsLoading(false)
          return
        }

        const sameCategoryPosts = blogPosts.filter(
          (item) => item.slug !== localPost.slug && item.category === localPost.category,
        )
        const fallbackPosts = blogPosts.filter(
          (item) => item.slug !== localPost.slug && item.category !== localPost.category,
        )
        setRelatedPosts([...sameCategoryPosts, ...fallbackPosts].slice(0, 3))
        if (initialLoad) setIsLoading(false)
        return
      }

      if (refreshInProgress) return
      refreshInProgress = true

      try {
        const [wpPost, wpPosts] = await Promise.all([
          getBlogPostBySlugFromWordPress(slug, {
            skipCache: forceFresh,
            staleWhileRevalidate: !forceFresh,
            ttlMs: 60 * 1000,
          }),
          getBlogPostsFromWordPress({
            perPage: 20,
            allPages: false,
            skipCache: forceFresh,
            staleWhileRevalidate: !forceFresh,
            ttlMs: 60 * 1000,
          }),
        ])

        if (cancelled) return
        if (!wpPost) {
          setPost(getBlogPostBySlug(slug))
          if (initialLoad) setIsLoading(false)
          return
        }

        setPost(wpPost)
        const sameCategory = wpPosts.filter(
          (item) => item.slug !== wpPost.slug && item.category === wpPost.category,
        )
        const fallback = wpPosts.filter(
          (item) => item.slug !== wpPost.slug && item.category !== wpPost.category,
        )
        setRelatedPosts([...sameCategory, ...fallback].slice(0, 3))
        if (initialLoad) setIsLoading(false)
      } catch (error) {
        if (!cancelled) {
          console.warn('[BeritaDetailPage] WordPress API failed, using local fallback:', error?.message)
          const localPost = getBlogPostBySlug(slug)
          setPost(localPost)
          
          if (localPost) {
            const sameCategoryPosts = blogPosts.filter(
              (item) => item.slug !== localPost.slug && item.category === localPost.category,
            )
            const fallbackPosts = blogPosts.filter(
              (item) => item.slug !== localPost.slug && item.category !== localPost.category,
            )
            setRelatedPosts([...sameCategoryPosts, ...fallbackPosts].slice(0, 3))
          }
          if (initialLoad) setIsLoading(false)
        }
      } finally {
        refreshInProgress = false
      }
    }

    loadFromWordPress({ initialLoad: true, forceFresh: true })

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
    }, LIVE_DETAIL_REFRESH_INTERVAL_MS)

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [slug])

  const prefetchRelatedDetail = (targetSlug) => {
    if (!targetSlug) return
    prefetchRoute('/berita-detail')
    prefetchBlogPostBySlugFromWordPress(targetSlug)
  }

  if (isLoading) {
    return (
      <SectionReveal className="section blog-detail-page">
        <div className="route-loader" aria-label="Memuat detail berita" />
      </SectionReveal>
    )
  }
  if (!post) return <Navigate to="/berita" replace />

  return (
    <SectionReveal className="section blog-detail-page">
      <div className="container blog-detail-shell">
        <Link className="blog-detail-back" to="/berita">← Kembali ke Berita</Link>

        <header className="blog-detail-head">
          <p className="kicker">{post.category}</p>
          <h1>{post.title}</h1>
          <div className="blog-detail-meta">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <article className="blog-detail-article">
          <LazyImage
            src={post.image}
            alt={post.title}
            wrapperClassName="blog-detail-image-wrap"
            className="blog-detail-image"
          />

          <p className="blog-detail-lead">{post.excerpt}</p>

          {post.contentHtml ? (
            <div className="blog-detail-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          ) : (
            post.content?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          )}
        </article>

        {relatedPosts.length > 0 && (
          <section className="blog-detail-related" aria-label="Related posts">
            <div className="blog-detail-related-head">
              <h2>Related posts</h2>
            </div>

            <div className="blog-post-grid">
              {relatedPosts.map((item) => (
                <article key={item.slug} className="blog-card">
                  <Link
                    to={`/berita/${item.slug}`}
                    className="blog-card-media-link"
                    aria-label={`Buka detail berita ${item.title}`}
                    onMouseEnter={() => prefetchRelatedDetail(item.slug)}
                    onFocus={() => prefetchRelatedDetail(item.slug)}
                  >
                    <LazyImage
                      src={item.image}
                      alt={item.title}
                      wrapperClassName="blog-card-media"
                      className="blog-card-image"
                    />
                  </Link>
                  <div className="blog-card-body">
                    <h3>{item.title}</h3>
                    <p className="blog-card-category">{item.category}</p>
                    <p>{item.excerpt}</p>
                    <div className="blog-card-meta">
                      <span className="blog-card-date">{item.date}</span>
                      <Link
                        className="blog-read-more-btn"
                        to={`/berita/${item.slug}`}
                        onMouseEnter={() => prefetchRelatedDetail(item.slug)}
                        onFocus={() => prefetchRelatedDetail(item.slug)}
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </SectionReveal>
  )
}

export default BeritaDetailPage
