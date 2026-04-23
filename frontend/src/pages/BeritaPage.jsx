import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LazyImage from "../components/ui/LazyImage";
import { blogPosts } from "../data/blogPosts";
import {
  getBlogPostsFromWordPress,
  isWordPressConfigured,
  prefetchBlogPostBySlugFromWordPress,
} from "../data/wordpressBlog";
import { prefetchRoute } from "../app/routePrefetch";

const LIVE_REFRESH_INTERVAL_MS = 20000;
const WP_NEWS_SNAPSHOT_KEY = "berita:wp-posts:v1";
const ITEMS_PER_PAGE = 12;
const MAX_PAGINATION_NUMBERS = 10;

function readWordPressPostsSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WP_NEWS_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore parsing/storage errors.
  }
  return null;
}

function writeWordPressPostsSnapshot(posts) {
  if (typeof window === "undefined") return;
  if (!Array.isArray(posts) || posts.length === 0) return;
  try {
    window.sessionStorage.setItem(WP_NEWS_SNAPSHOT_KEY, JSON.stringify(posts));
  } catch {
    // Ignore quota/storage errors.
  }
}

function normalizeCategoryForFilter(category) {
  const source = (category || "").toLowerCase();
  if (
    source.includes("artikel") ||
    source.includes("article") ||
    source.includes("blog")
  ) {
    return "Artikel";
  }
  return "Berita";
}

function inferContentTypeFromText(value) {
  const source = String(value || "").toLowerCase();
  if (source.includes("event") || source.includes("acara")) return "event";
  if (source.includes("blog") || source.includes("artikel")) return "blog";
  if (source.includes("news") || source.includes("berita")) return "news";
  return "news";
}

function getContentChipLabel(value) {
  return inferContentTypeFromText(value);
}

function CategoryBadge({ category }) {
  const type = inferContentTypeFromText(category);
  return (
    <span className={`berita-category-badge berita-category-badge--${type}`}>
      {category || type.toUpperCase()}
    </span>
  );
}

function toSectionSlug(value) {
  return String(value || "berita")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= MAX_PAGINATION_NUMBERS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 4) {
    return [
      1,
      "ellipsis-left",
      totalPages - 8,
      totalPages - 7,
      totalPages - 6,
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 3,
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    currentPage + 3,
    currentPage + 4,
    "ellipsis-right",
    totalPages,
  ];
}

function BeritaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDataRef = useRef(null);
  if (!initialDataRef.current) {
    const snapshot = readWordPressPostsSnapshot();
    initialDataRef.current = {
      posts: snapshot || blogPosts,
      hasWordPressData: Boolean(snapshot && snapshot.length > 0),
    };
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState(initialDataRef.current.posts);
  const [isLoadingWp, setIsLoadingWp] = useState(() => isWordPressConfigured());
  const prefetchedImagesRef = useRef(new Set());
  const prefetchedDetailRef = useRef(new Set());
  const refreshPromiseRef = useRef(null);
  const hasSyncedWordPressRef = useRef(initialDataRef.current.hasWordPressData);

  useEffect(() => {
    document.body.classList.add("route-news");
    return () => {
      document.body.classList.remove("route-news");
    };
  }, []);

  useEffect(() => {
    const rawPage = Number(searchParams.get("page") ?? "1");
    const parsedPage =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    setCurrentPage(parsedPage);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const applyFetchedPosts = (wpPosts) => {
      if (Array.isArray(wpPosts) && wpPosts.length > 0) {
        setPosts(wpPosts);
        hasSyncedWordPressRef.current = true;
        writeWordPressPostsSnapshot(wpPosts);
        return;
      }

      if (!hasSyncedWordPressRef.current) {
        setPosts(blogPosts);
      }
    };

    async function refreshFromWordPress({
      forceFresh = false,
      initialLoad = false,
    } = {}) {
      if (!isWordPressConfigured()) {
        if (!cancelled && initialLoad) {
          setIsLoadingWp(false);
        }
        return;
      }

      let request = refreshPromiseRef.current;
      if (!request) {
        request = getBlogPostsFromWordPress({
          skipCache: forceFresh,
          staleWhileRevalidate: !forceFresh,
          ttlMs: 60 * 1000,
        });
        refreshPromiseRef.current = request;
      }

      try {
        const wpPosts = await request;
        if (!cancelled) {
          applyFetchedPosts(wpPosts);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "[BeritaPage] WordPress API error, keeping last known posts:",
            error?.message,
          );
          if (!hasSyncedWordPressRef.current) {
            setPosts(blogPosts);
          }
        }
      } finally {
        if (refreshPromiseRef.current === request) {
          refreshPromiseRef.current = null;
        }
        if (!cancelled && initialLoad) {
          setIsLoadingWp(false);
        }
      }
    }

    refreshFromWordPress({ initialLoad: true, forceFresh: true });

    const onFocus = () => refreshFromWordPress({ forceFresh: true });
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshFromWordPress({ forceFresh: true });
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshFromWordPress({ forceFresh: true });
      }
    }, LIVE_REFRESH_INTERVAL_MS);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const editorialPosts = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return blogPosts;
    return posts;
  }, [posts]);

  const filteredPosts = editorialPosts;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / ITEMS_PER_PAGE),
  );
  const pagedEditorialPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredPosts]);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(totalPages));
      return next;
    });
  }, [currentPage, setSearchParams, totalPages]);

  const featuredPost =
    pagedEditorialPosts[0] ||
    filteredPosts[0] ||
    editorialPosts[0] ||
    blogPosts[0];
  const sideHeroPosts = pagedEditorialPosts.slice(1, 3);
  const latestPosts = pagedEditorialPosts.slice(3, 8);

  const sectionGroups = useMemo(() => {
    const groups = new Map();
    pagedEditorialPosts.slice(8).forEach((post) => {
      const fallback = normalizeCategoryForFilter(post.category);
      const category = (post.category || fallback || "Berita").trim();
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(post);
    });

    return Array.from(groups.entries())
      .map(([name, items]) => ({
        name,
        slug: toSectionSlug(name),
        items,
      }))
      .filter((group) => group.items.length > 0)
      .slice(0, 3);
  }, [pagedEditorialPosts]);

  const spotlightMain = pagedEditorialPosts[5] || featuredPost;
  const spotlightSide = pagedEditorialPosts.slice(6, 10);

  const handlePageChange = (nextPage) => {
    const clampedPage = Math.min(totalPages, Math.max(1, nextPage));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(clampedPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );
  const showViewAllLinks = true;

  const prefetchDetail = (slug, imageUrl) => {
    if (!slug) return;

    prefetchRoute("/berita-detail");

    if (!prefetchedDetailRef.current.has(slug)) {
      prefetchBlogPostBySlugFromWordPress(slug);
      prefetchedDetailRef.current.add(slug);
    }

    if (
      typeof window !== "undefined" &&
      imageUrl &&
      !prefetchedImagesRef.current.has(imageUrl)
    ) {
      const image = new window.Image();
      image.decoding = "async";
      image.src = imageUrl;
      prefetchedImagesRef.current.add(imageUrl);
    }
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(0);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Score + filter by relevance
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return editorialPosts
      .map((post) => {
        const title = (post.title || '').toLowerCase();
        const excerpt = (post.excerpt || '').toLowerCase();
        const cat = (post.category || '').toLowerCase();
        let score = 0;
        if (title.startsWith(q)) score += 100;
        else if (title.includes(q)) score += 70 - title.indexOf(q) * 0.3;
        if (excerpt.includes(q)) score += 25;
        if (cat.includes(q)) score += 10;
        return { ...post, _score: score };
      })
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 7);
  }, [searchQuery, editorialPosts]);

  // Highlight matching substring
  const highlightText = useCallback((text, query) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'transparent', color: '#f5c518', fontWeight: 700 }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }, []);

  const handleSearchKeyDown = (e) => {
    if (!searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchFocus(f => Math.min(f + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchFocus(f => Math.max(f - 1, 0));
    } else if (e.key === 'Enter') {
      const hit = searchResults[searchFocus];
      if (hit) { setSearchOpen(false); setSearchQuery(''); navigate(`/berita/${hit.slug}`); }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  return (
    <div className="berita-editorial-page">
      <section className="section blog-news-page berita-editorial-wrap" data-nav-hero>
        <div className="container">
          {isLoadingWp && editorialPosts.length === 0 ? (
            <div className="berita-editorial-loading">
              Memuat berita terbaru...
            </div>
          ) : (
            <>
              <div id="berita-list" />
              <section className="berita-editorial-intro">
                {/* Top row: heading + meta stats */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <p className="berita-intro-kicker">Editorial Feed</p>
                    <h1 className="berita-intro-title">Berita &amp; Insight Trimitra</h1>
                    <p className="berita-intro-lead">
                      Update proyek terbaru, insight event, dan studi eksekusi lapangan
                      yang relevan untuk kebutuhan brand activation.
                    </p>
                  </div>
                  <div className="berita-intro-meta" aria-label="Ringkasan halaman berita">
                    <span>{filteredPosts.length} artikel</span>
                    <span>
                      Halaman {currentPage} / {totalPages}
                    </span>
                  </div>
                </div>

                {/* Search bar — inside hero, full width */}
                <div ref={searchRef} style={{ position: 'relative', marginTop: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(10,22,48,0.85)',
                    border: `1.5px solid ${searchOpen && searchQuery ? '#f5c518' : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: '12px',
                    padding: '10px 16px',
                    backdropFilter: 'blur(8px)',
                    transition: 'border-color 0.2s ease',
                  }}>
                    {/* Search icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Cari artikel..."
                      value={searchQuery}
                      aria-label="Cari artikel berita"
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchOpen(true);
                        setSearchFocus(0);
                      }}
                      onFocus={() => setSearchOpen(true)}
                      onKeyDown={handleSearchKeyDown}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                        aria-label="Hapus pencarian"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', lineHeight: 1 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Dropdown results */}
                  {searchOpen && searchQuery.trim() && (
                    <div
                      role="listbox"
                      aria-label="Hasil pencarian"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 200,
                        background: '#0d1f40',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                      }}
                    >
                      {searchResults.length === 0 ? (
                        <div style={{ padding: '16px 18px', color: '#64748b', fontSize: '14px' }}>
                          Tidak ada artikel yang cocok untuk &ldquo;<strong style={{ color: '#94a3b8' }}>{searchQuery}</strong>&rdquo;
                        </div>
                      ) : (
                        searchResults.map((post, idx) => (
                          <button
                            key={post.slug}
                            role="option"
                            aria-selected={idx === searchFocus}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              navigate(`/berita/${post.slug}`);
                            }}
                            onMouseEnter={() => setSearchFocus(idx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              width: '100%',
                              minHeight: '72px',
                              padding: '12px 16px',
                              background: idx === searchFocus
                                ? 'rgba(245,197,24,0.07)'
                                : 'transparent',
                              border: 'none',
                              borderBottom: idx < searchResults.length - 1
                                ? '1px solid rgba(255,255,255,0.05)'
                                : 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            {/* Thumbnail — fixed 56×56, always square */}
                            <div style={{
                              width: '56px',
                              height: '56px',
                              flexShrink: 0,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: '#1e3a60',
                            }}>
                              {post.image && (
                                <img
                                  src={post.image}
                                  alt=""
                                  aria-hidden="true"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                              )}
                            </div>

                            {/* Text — title + meta */}
                            <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                              <div style={{
                                color: idx === searchFocus ? '#f5c518' : '#e2e8f0',
                                fontSize: '14px',
                                fontWeight: 600,
                                lineHeight: '1.35',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                transition: 'color 0.15s ease',
                              }}>
                                {highlightText(post.title || '', searchQuery)}
                              </div>
                              <div style={{
                                color: '#475569',
                                fontSize: '11.5px',
                                fontWeight: 500,
                                letterSpacing: '0.01em',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {post.category} · {post.date}
                              </div>
                            </div>

                            {/* Arrow — vertically centered */}
                            <svg
                              width="14" height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={idx === searchFocus ? '#f5c518' : '#334155'}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ flexShrink: 0, transition: 'stroke 0.15s ease' }}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Featured Article — two-column hero */}
              <article
                className="berita-featured-card"
                onMouseEnter={() =>
                  prefetchDetail(featuredPost.slug, featuredPost.image)
                }
                onFocus={() =>
                  prefetchDetail(featuredPost.slug, featuredPost.image)
                }
              >
                <Link
                  to={`/berita/${featuredPost.slug}`}
                  className="berita-featured-image-col"
                >
                  <LazyImage
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    wrapperClassName="berita-featured-media"
                    wrapperStyle={{ maxHeight: '240px', overflow: 'hidden', width: '100%', height: '240px' }}
                    className="berita-featured-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '240px' }}
                  />
                </Link>
                <div className="berita-featured-copy">
                  <CategoryBadge category={featuredPost.category} />
                  <Link
                    to={`/berita/${featuredPost.slug}`}
                    className="berita-featured-title"
                  >
                    {featuredPost.title}
                  </Link>
                  <p className="berita-featured-excerpt">{featuredPost.excerpt}</p>
                  <p className="berita-date">{featuredPost.date}</p>
                </div>
              </article>

              {/* 3-column uniform blog grid */}
              <section className="berita-grid3-section">
                <div className="berita-grid3">
                  {pagedEditorialPosts.slice(1).map((item) => (
                    <article
                      key={item.slug}
                      className="berita-card3"
                      onMouseEnter={() => prefetchDetail(item.slug, item.image)}
                      onFocus={() => prefetchDetail(item.slug, item.image)}
                    >
                      <Link
                        to={`/berita/${item.slug}`}
                        className="berita-card3-image-link"
                      >
                        <LazyImage
                          src={item.image}
                          alt={item.title}
                          wrapperClassName="berita-card3-media"
                          wrapperStyle={{ maxHeight: '240px', overflow: 'hidden' }}
                          className="berita-card3-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '240px' }}
                        />
                      </Link>
                      <div className="berita-card3-copy">
                        <CategoryBadge category={item.category} />
                        <Link
                          to={`/berita/${item.slug}`}
                          className="berita-card3-title"
                        >
                          {item.title}
                        </Link>
                        <p className="berita-card3-excerpt">{item.excerpt}</p>
                        <p className="berita-date">{item.date}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Artikel Terbaru — horizontal 2-col section below grid */}
              {latestPosts.length > 0 && (
                <section className="berita-terbaru-section">
                  <div className="berita-terbaru-head">
                    <span className="berita-terbaru-kicker">Pilihan Redaksi</span>
                    <h2 className="berita-terbaru-title">Artikel Terbaru</h2>
                  </div>
                  <div className="berita-terbaru-grid">
                    {latestPosts.map((item) => (
                      <article key={item.slug} className="berita-terbaru-item">
                        <Link
                          to={`/berita/${item.slug}`}
                          className="berita-terbaru-thumb-link"
                          onMouseEnter={() => prefetchDetail(item.slug, item.image)}
                          onFocus={() => prefetchDetail(item.slug, item.image)}
                        >
                          <LazyImage
                            src={item.image}
                            alt={item.title}
                            wrapperClassName="berita-terbaru-thumb-wrap"
                            wrapperStyle={{ width: '96px', height: '72px', maxHeight: '72px', overflow: 'hidden', flexShrink: 0 }}
                            className="berita-terbaru-thumb-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Link>
                        <div className="berita-terbaru-copy">
                          <CategoryBadge category={item.category} />
                          <Link
                            to={`/berita/${item.slug}`}
                            className="berita-terbaru-item-title"
                          >
                            {item.title}
                          </Link>
                          <p className="berita-date">{item.date}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {sectionGroups.map((section) => (
                <section
                  key={section.slug}
                  className="berita-editorial-section"
                >
                  <div className="berita-section-head">
                    <h2>{section.name}</h2>
                    {showViewAllLinks ? (
                      <Link
                        to="/berita?page=1#berita-list"
                        className="berita-section-more"
                      >
                        View all »
                      </Link>
                    ) : null}
                  </div>

                  {/* Alternating full-width card layout */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {section.items.slice(0, 4).map((item, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <article
                          key={item.slug}
                          className="berita-alt-card"
                          style={{
                            display: 'flex',
                            flexDirection: isEven ? 'row' : 'row-reverse',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: 'linear-gradient(160deg, rgba(13,37,70,0.95), rgba(9,26,53,0.88))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 8px 24px rgba(3,10,24,0.28)',
                            transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
                            minHeight: '160px',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(3,10,24,0.44)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(3,10,24,0.28)'; }}
                        >
                          {/* Image column */}
                          <Link
                            to={`/berita/${item.slug}`}
                            style={{
                              display: 'block',
                              width: '55%',
                              flexShrink: 0,
                              overflow: 'hidden',
                              maxHeight: '280px',
                            }}
                            onMouseEnter={() => prefetchDetail(item.slug, item.image)}
                            onFocus={() => prefetchDetail(item.slug, item.image)}
                          >
                            <LazyImage
                              src={item.image}
                              alt={item.title}
                              wrapperClassName="berita-grid-media"
                              wrapperStyle={{ width: '100%', height: '100%', minHeight: '160px', maxHeight: '280px', overflow: 'hidden' }}
                              className="berita-grid-image"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease-out' }}
                            />
                          </Link>

                          {/* Text column */}
                          <div style={{
                            width: '45%',
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '10px',
                            minWidth: 0,
                          }}>
                            <CategoryBadge category={item.category} />
                            <Link
                              to={`/berita/${item.slug}`}
                              className="berita-grid-title"
                              style={{ fontSize: '17px', lineHeight: 1.25 }}
                            >
                              {item.title}
                            </Link>
                            {item.excerpt && (
                              <p style={{
                                color: '#CBD5E1',
                                fontSize: '13px',
                                lineHeight: 1.55,
                                margin: 0,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {item.excerpt}
                              </p>
                            )}
                            <p className="berita-date">{item.date}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

              ))}

              {spotlightMain ? (
                <section className="berita-editorial-spotlight">
                  <div className="berita-section-head">
                    <h2>{spotlightMain.category || "Sorotan"}</h2>
                    {showViewAllLinks ? (
                      <Link
                        to="/berita?page=1#berita-list"
                        className="berita-section-more"
                      >
                        View all »
                      </Link>
                    ) : null}
                  </div>
                  <div className="berita-spotlight-grid">
                    <article className="berita-spotlight-main">
                      <Link
                        to={`/berita/${spotlightMain.slug}`}
                        className="berita-image-link"
                        data-chip={getContentChipLabel(spotlightMain.category)}
                        onMouseEnter={() =>
                          prefetchDetail(
                            spotlightMain.slug,
                            spotlightMain.image,
                          )
                        }
                        onFocus={() =>
                          prefetchDetail(
                            spotlightMain.slug,
                            spotlightMain.image,
                          )
                        }
                      >
                        <LazyImage
                          src={spotlightMain.image}
                          alt={spotlightMain.title}
                          wrapperClassName="berita-spotlight-main-media"
                          wrapperStyle={{ maxHeight: '240px', overflow: 'hidden', width: '100%' }}
                          className="berita-spotlight-main-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '240px' }}
                        />
                      </Link>
                      <div className="berita-spotlight-main-copy">
                        <CategoryBadge category={spotlightMain.category} />
                        <Link
                          to={`/berita/${spotlightMain.slug}`}
                          className="berita-spotlight-main-title"
                        >
                          {spotlightMain.title}
                        </Link>
                        <p>{spotlightMain.excerpt}</p>
                        <p className="berita-date">{spotlightMain.date}</p>
                      </div>
                    </article>

                    <div className="berita-spotlight-side">
                      {spotlightSide.map((item) => (
                        <article
                          key={item.slug}
                          className="berita-spotlight-small"
                        >
                          <Link
                            to={`/berita/${item.slug}`}
                            className="berita-image-link"
                            data-chip={getContentChipLabel(item.category)}
                            onMouseEnter={() =>
                              prefetchDetail(item.slug, item.image)
                            }
                            onFocus={() =>
                              prefetchDetail(item.slug, item.image)
                            }
                          >
                            <LazyImage
                              src={item.image}
                              alt={item.title}
                              wrapperClassName="berita-spotlight-small-media"
                              wrapperStyle={{ maxHeight: '160px', overflow: 'hidden', width: '100%' }}
                              className="berita-spotlight-small-img"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '160px' }}
                            />
                          </Link>
                          <div className="berita-spotlight-small-copy">
                            <CategoryBadge category={item.category} />
                            <Link
                              to={`/berita/${item.slug}`}
                              className="berita-spotlight-small-title"
                            >
                              {item.title}
                            </Link>
                            <p className="berita-date">{item.date}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              {filteredPosts.length > 0 && (
                <div
                  className="gallery-pagination blog-pagination berita-pagination"
                  aria-label="Navigasi halaman berita"
                >
                  <button
                    type="button"
                    className="gallery-page-btn berita-page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  <div className="gallery-page-number-wrap berita-page-number-wrap">
                    {pageItems.map((item, index) => {
                      if (typeof item === "string") {
                        return (
                          <span
                            key={`${item}-${index}`}
                            className="gallery-page-ellipsis berita-page-ellipsis"
                            aria-hidden="true"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={item}
                          type="button"
                          className={`gallery-page-btn berita-page-btn ${item === currentPage ? "is-active" : ""}`}
                          onClick={() => handlePageChange(item)}
                          aria-current={
                            item === currentPage ? "page" : undefined
                          }
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="gallery-page-btn berita-page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default BeritaPage;
