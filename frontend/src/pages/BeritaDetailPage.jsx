import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";


import LazyImage from "../components/ui/LazyImage";
import { prefetchRoute } from "../app/routePrefetch";
import { blogPosts, getBlogPostBySlug } from "../data/blogPosts";
import {
  getBlogPostBySlugFromWordPress,
  getBlogPostsFromWordPress,
  isWordPressConfigured,
  prefetchBlogPostBySlugFromWordPress,
} from "../data/wordpressBlog";

const LIVE_DETAIL_REFRESH_INTERVAL_MS = 20000;

// ── Reading progress bar ──────────────────────────────────────────────────────
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="bdp-progress-rail" aria-hidden="true">
      <div className="bdp-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  return msg ? <div className="bdp-toast">{msg}</div> : null;
}

// ── Share buttons ─────────────────────────────────────────────────────────────
function ShareButtons({ title, vertical = false }) {
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => showToast("Link disalin!"));
  };

  const btns = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      style: { background: "#25D366", color: "#fff" },
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.85L.057 23.57a.5.5 0 0 0 .614.614l5.701-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.032-1.376l-.36-.214-3.733.96.99-3.635-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.466 0 9.9 4.433 9.9 9.9 0 5.467-4.434 9.9-9.9 9.9z" />
        </svg>
      ),
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      style: { background: "#000", color: "#fff" },
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: null,
      onClick: copyLink,
      style: { background: "linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)", color: "#fff" },
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "Salin Link",
      href: null,
      onClick: copyLink,
      style: { background: "#64748B", color: "#fff" },
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ),
    },
  ];

  return (
    <div className={vertical ? "bdp-share-vert" : "bdp-share-row"}>
      <Toast msg={toast} />
      {btns.map((btn) =>
        btn.href ? (
          <a
            key={btn.label}
            href={btn.href}
            target="_blank"
            rel="noreferrer"
            className="bdp-share-btn"
            style={{ ...btn.style, color: btn.textColor || "#fff" }}
            title={btn.label}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </a>
        ) : (
          <button
            key={btn.label}
            type="button"
            className="bdp-share-btn"
            style={{ ...btn.style, color: btn.textColor || "#fff" }}
            onClick={btn.onClick}
            title={btn.label}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        )
      )}
    </div>
  );
}

// ── Table of Contents ─────────────────────────────────────────────────────────
// Pre-process HTML: inject unique IDs into h2/h3, return both processed html and heading list
function processArticleHtml(html) {
  if (!html) return { processed: html, headings: [] };
  const headings = [];
  let counter = 0;
  const processed = html.replace(
    /<(h[23])(\s[^>]*)?>([\s\S]*?)<\/h[23]>/gi,
    (match, tag, attrs = "", content) => {
      const id = `toc-h-${++counter}`;
      const text = content.replace(/<[^>]+>/g, "").trim();
      headings.push({ id, level: tag.toUpperCase(), text });
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    }
  );
  return { processed, headings };
}

function TableOfContents({ headings }) {
  if (!headings || headings.length < 2) return null;

  return (
    <section className="bdp-widget bdp-toc-widget">
      <h2 className="bdp-widget-title">Daftar Isi</h2>
      <nav aria-label="Daftar isi artikel">
        <ol className="bdp-toc-list">
          {headings.map((h) => (
            <li key={h.id} className={h.level === "H3" ? "bdp-toc-h3" : "bdp-toc-h2"}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}

// ── Back to top ───────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      aria-label="Kembali ke atas"
      className="bd-back-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function BeritaDetailPage() {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(() => getBlogPostBySlug(slug));
  const [allPosts, setAllPosts] = useState(() => blogPosts);
  const [relatedPosts, setRelatedPosts] = useState(() => {
    const currentPost = getBlogPostBySlug(slug);
    if (!currentPost) return [];
    const sameCategoryPosts = blogPosts.filter(
      (item) => item.slug !== currentPost.slug && item.category === currentPost.category,
    );
    const fallbackPosts = blogPosts.filter(
      (item) => item.slug !== currentPost.slug && item.category !== currentPost.category,
    );
    return [...sameCategoryPosts, ...fallbackPosts].slice(0, 3);
  });

  useEffect(() => {
    let cancelled = false;
    let refreshInProgress = false;

    async function loadFromWordPress({ forceFresh = false, initialLoad = false } = {}) {
      if (!isWordPressConfigured()) {
        const localPost = getBlogPostBySlug(slug);
        if (cancelled) return;
        setPost(localPost);
        if (!localPost) {
          if (initialLoad) setIsLoading(false);
          return;
        }
        const sameCategoryPosts = blogPosts.filter(
          (item) => item.slug !== localPost.slug && item.category === localPost.category,
        );
        const fallbackPosts = blogPosts.filter(
          (item) => item.slug !== localPost.slug && item.category !== localPost.category,
        );
        setAllPosts(blogPosts);
        setRelatedPosts([...sameCategoryPosts, ...fallbackPosts].slice(0, 3));
        if (initialLoad) setIsLoading(false);
        return;
      }

      if (refreshInProgress) return;
      refreshInProgress = true;

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
        ]);

        if (cancelled) return;
        if (!wpPost) {
          setPost(getBlogPostBySlug(slug));
          if (initialLoad) setIsLoading(false);
          return;
        }

        setPost(wpPost);
        setAllPosts(wpPosts);
        const sameCategory = wpPosts.filter(
          (item) => item.slug !== wpPost.slug && item.category === wpPost.category,
        );
        const fallback = wpPosts.filter(
          (item) => item.slug !== wpPost.slug && item.category !== wpPost.category,
        );
        setRelatedPosts([...sameCategory, ...fallback].slice(0, 3));
        if (initialLoad) setIsLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.warn("[BeritaDetailPage] WordPress API failed, using local fallback:", error?.message);
          const localPost = getBlogPostBySlug(slug);
          setPost(localPost);
          setAllPosts(blogPosts);
          if (localPost) {
            const sameCategoryPosts = blogPosts.filter(
              (item) => item.slug !== localPost.slug && item.category === localPost.category,
            );
            const fallbackPosts = blogPosts.filter(
              (item) => item.slug !== localPost.slug && item.category !== localPost.category,
            );
            setRelatedPosts([...sameCategoryPosts, ...fallbackPosts].slice(0, 3));
          }
          if (initialLoad) setIsLoading(false);
        }
      } finally {
        refreshInProgress = false;
      }
    }

    loadFromWordPress({ initialLoad: true, forceFresh: true });

    const onFocus = () => loadFromWordPress({ forceFresh: true });
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadFromWordPress({ forceFresh: true });
    };
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") loadFromWordPress({ forceFresh: true });
    }, LIVE_DETAIL_REFRESH_INTERVAL_MS);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [slug]);

  const popularPosts = useMemo(() => {
    if (!post) return [];
    return allPosts.filter((item) => item.slug !== post.slug).slice(0, 4);
  }, [allPosts, post]);

  const topicTags = useMemo(() => {
    const unique = new Set();
    const ordered = [];
    for (const item of allPosts) {
      const value = (item.category || "").trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (unique.has(key)) continue;
      unique.add(key);
      ordered.push(value);
    }
    return ordered.slice(0, 8);
  }, [allPosts]);

  const prefetchRelatedDetail = (targetSlug) => {
    if (!targetSlug) return;
    prefetchRoute("/berita-detail");
    prefetchBlogPostBySlugFromWordPress(targetSlug);
  };

  // Pre-process article HTML: inject IDs into h2/h3 for TOC anchor links
  const { processed: processedArticleHtml, headings: tocHeadings } = useMemo(
    () => processArticleHtml(post?.contentHtml || ""),
    [post?.contentHtml]
  );

  // ── Skeleton loader ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="section blog-detail-page" data-gsap-enhance="off" aria-busy="true" aria-label="Memuat detail berita">
        <div className="container blog-detail-shell">
          <div className="blog-skeleton-block blog-skeleton-text short" style={{ width: 120, height: 13 }} />
          <header className="blog-detail-head">
            <div className="blog-skeleton-block blog-skeleton-kicker" />
            <div className="blog-skeleton-block blog-skeleton-title" style={{ marginTop: 12, height: 48, width: "80%" }} />
            <div className="blog-skeleton-block blog-skeleton-title" style={{ marginTop: 8, height: 48, width: "55%" }} />
            <div className="blog-detail-meta" style={{ gap: 10, marginTop: 14 }}>
              <div className="blog-skeleton-block" style={{ width: 90, height: 12, borderRadius: 999 }} />
              <div className="blog-skeleton-block" style={{ width: 60, height: 12, borderRadius: 999 }} />
            </div>
          </header>
          <div className="blog-detail-layout">
            <div className="blog-detail-article blog-detail-main">
              <div className="blog-detail-image-wrap">
                <div className="blog-skeleton-block blog-skeleton-image" style={{ width: "100%", aspectRatio: "16/9", borderRadius: 0 }} />
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
                {[1, 0.92, 0.78].map((w, i) => (
                  <div key={i} className="blog-skeleton-block blog-skeleton-text" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
              <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                {[1, 0.95, 0.88, 1, 0.72, 0.9, 0.6].map((w, i) => (
                  <div key={i} className="blog-skeleton-block blog-skeleton-text" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            </div>
            <aside className="blog-detail-sidebar" aria-hidden="true">
              <div className="blog-detail-side-card" style={{ display: "grid", gap: 12 }}>
                <div className="blog-skeleton-block" style={{ width: "55%", height: 22, borderRadius: 6 }} />
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 10 }}>
                    <div className="blog-skeleton-block" style={{ height: 64, borderRadius: 10 }} />
                    <div style={{ display: "grid", gap: 7 }}>
                      <div className="blog-skeleton-block blog-skeleton-text" style={{ width: "90%" }} />
                      <div className="blog-skeleton-block blog-skeleton-text" style={{ width: "60%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return <Navigate to="/berita" replace />;

  return (
    <section className="section blog-detail-page" data-gsap-enhance="off">
      <ReadingProgressBar />
      <div className="container blog-detail-shell">
        {/* Back link */}
        <Link className="blog-detail-back" to="/berita">← Kembali ke Berita</Link>

        {/* Article header */}
        <header className="blog-detail-head">
          {/* Category badge */}
          <span className="bdp-category-badge">{post.category}</span>
          <h1>{post.title}</h1>

          {/* Meta bar */}
          <div className="bdp-meta-bar">
            <span className="bdp-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {post.date}
            </span>
            <span className="bdp-meta-sep">·</span>
            <span className="bdp-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {post.readTime}
            </span>
          </div>

          {/* Share row — desktop inline */}
          <div className="bdp-share-label-row">
            <span className="bdp-share-label">Bagikan:</span>
            <ShareButtons title={post.title} />
          </div>
        </header>

        {/* Main layout */}
        <div className="blog-detail-layout">
          {/* Article */}
          <article className="blog-detail-article blog-detail-main">
            <LazyImage
              src={post.image}
              alt={post.title}
              wrapperClassName="blog-detail-image-wrap"
              className="blog-detail-image"
            />

            <p className="blog-detail-lead">{post.excerpt}</p>
            <hr className="bdp-content-sep" />

            {processedArticleHtml ? (
              <div
                className="blog-detail-content cms-page-content bdp-prose"
                dangerouslySetInnerHTML={{ __html: processedArticleHtml }}
              />
            ) : (
              post.content?.map((paragraph) => (
                <p key={paragraph} className="bdp-prose-para">{paragraph}</p>
              ))
            )}
          </article>

          {/* Sidebar */}
          <aside
            className="blog-detail-sidebar bdp-sidebar"
            aria-label="Navigasi artikel"
          >
            {/* Table of Contents — shown first */}
            {tocHeadings.length >= 2 && <TableOfContents headings={tocHeadings} />}

            {/* Share widget */}
            <section className="bdp-widget">
              <h2 className="bdp-widget-title">Bagikan Artikel</h2>
              <ShareButtons title={post.title} vertical />
            </section>

            {/* Related */}
            {relatedPosts.length > 0 && (
              <section className="bdp-widget">
                <h2 className="bdp-widget-title">Artikel Terkait</h2>
                <div className="blog-detail-side-list">
                  {relatedPosts.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/berita/${item.slug}`}
                      className="blog-detail-side-item"
                      onMouseEnter={() => prefetchRelatedDetail(item.slug)}
                      onFocus={() => prefetchRelatedDetail(item.slug)}
                    >
                      <LazyImage
                        src={item.image}
                        alt={item.title}
                        wrapperClassName="blog-detail-side-thumb"
                        className="blog-detail-side-thumb-img"
                      />
                      <div className="blog-detail-side-copy">
                        <h3>{item.title}</h3>
                        <p>{item.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Popular */}
            {popularPosts.length > 0 && (
              <section className="bdp-widget bdp-widget-soft">
                <h2 className="bdp-widget-title">Artikel Populer</h2>
                <ol className="blog-detail-popular-list">
                  {popularPosts.map((item, index) => (
                    <li key={item.slug}>
                      <Link to={`/berita/${item.slug}`}>
                        <span className="blog-detail-popular-rank">{String(index + 1).padStart(2, "0")}</span>
                        <span className="blog-detail-popular-text">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Topics */}
            {topicTags.length > 0 && (
              <section className="bdp-widget bdp-widget-mint">
                <h2 className="bdp-widget-title">Topik</h2>
                <div className="blog-detail-topic-tags">
                  {topicTags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/berita?type=${tag.toLowerCase()}&page=1#berita-list`}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
      <BackToTop />
    </section>
  );
}

export default BeritaDetailPage;
