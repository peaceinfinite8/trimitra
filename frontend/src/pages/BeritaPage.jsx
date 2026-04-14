import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  return inferContentTypeFromText(value).toUpperCase();
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

  return (
    <div className="berita-editorial-page">
      <section className="section blog-news-page berita-editorial-wrap">
        <div className="container">
          {isLoadingWp && editorialPosts.length === 0 ? (
            <div className="berita-editorial-loading">
              Memuat berita terbaru...
            </div>
          ) : (
            <>
              <div id="berita-list" />
              <section className="berita-editorial-hero">
                <div className="berita-editorial-left">
                  {sideHeroPosts.map((item) => (
                    <article key={item.slug} className="berita-mini-card">
                      <Link
                        to={`/berita/${item.slug}`}
                        className="berita-image-link"
                        data-chip={getContentChipLabel(item.category)}
                        onMouseEnter={() =>
                          prefetchDetail(item.slug, item.image)
                        }
                        onFocus={() => prefetchDetail(item.slug, item.image)}
                      >
                        <LazyImage
                          src={item.image}
                          alt={item.title}
                          wrapperClassName="berita-mini-media"
                          className="berita-mini-image"
                        />
                      </Link>
                      <div className="berita-mini-copy">
                        <p className="berita-kicker">{item.category}</p>
                        <Link
                          to={`/berita/${item.slug}`}
                          className="berita-mini-title"
                        >
                          {item.title}
                        </Link>
                        <p className="berita-date">{item.date}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <article className="berita-editorial-main">
                  <Link
                    to={`/berita/${featuredPost.slug}`}
                    className="berita-image-link"
                    data-chip={getContentChipLabel(featuredPost.category)}
                    onMouseEnter={() =>
                      prefetchDetail(featuredPost.slug, featuredPost.image)
                    }
                    onFocus={() =>
                      prefetchDetail(featuredPost.slug, featuredPost.image)
                    }
                  >
                    <LazyImage
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      wrapperClassName="berita-main-media"
                      className="berita-main-image"
                    />
                  </Link>
                  <div className="berita-main-copy">
                    <p className="berita-kicker">{featuredPost.category}</p>
                    <h1>{featuredPost.title}</h1>
                    <p>{featuredPost.excerpt}</p>
                    <p className="berita-date">{featuredPost.date}</p>
                  </div>
                </article>

                <aside className="berita-editorial-latest">
                  <div className="berita-latest-head">LATEST</div>
                  {latestPosts.map((item) => (
                    <article key={item.slug} className="berita-latest-item">
                      <div className="berita-latest-copy">
                        <Link
                          to={`/berita/${item.slug}`}
                          className="berita-latest-title"
                          onMouseEnter={() =>
                            prefetchDetail(item.slug, item.image)
                          }
                          onFocus={() => prefetchDetail(item.slug, item.image)}
                        >
                          {item.title}
                        </Link>
                        <p className="berita-date">{item.date}</p>
                      </div>
                      <Link
                        to={`/berita/${item.slug}`}
                        className="berita-latest-thumb"
                      >
                        <LazyImage
                          src={item.image}
                          alt={item.title}
                          wrapperClassName="berita-latest-thumb-wrap"
                          className="berita-latest-thumb-img"
                        />
                      </Link>
                    </article>
                  ))}
                </aside>
              </section>

              {sectionGroups.map((section) => (
                <section
                  key={section.slug}
                  className="berita-editorial-section"
                >
                  <div className="berita-section-head">
                    <h2>{section.name}</h2>
                    {showViewAllLinks ? (
                      <Link
                        to={`/berita?type=${inferContentTypeFromText(section.name)}&page=1#berita-list`}
                        className="berita-section-more"
                      >
                        View all »
                      </Link>
                    ) : null}
                  </div>
                  <div className="berita-editorial-grid4">
                    {section.items.slice(0, 4).map((item, index) => {
                      const gridVariantClass =
                        index === 0
                          ? "is-lead"
                          : index === 1
                            ? "is-tall"
                            : index === 2
                              ? "is-regular"
                              : "is-wide";

                      return (
                        <article
                          key={item.slug}
                          className={`berita-grid-card ${gridVariantClass}`}
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
                              wrapperClassName="berita-grid-media"
                              className="berita-grid-image"
                            />
                          </Link>
                          <div className="berita-grid-copy">
                            <p className="berita-kicker">{item.category}</p>
                            <Link
                              to={`/berita/${item.slug}`}
                              className="berita-grid-title"
                            >
                              {item.title}
                            </Link>
                            <p className="berita-date">{item.date}</p>
                            <p>{item.excerpt}</p>
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
                        to={`/berita?type=${inferContentTypeFromText(spotlightMain.category)}&page=1#berita-list`}
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
                          className="berita-spotlight-main-img"
                        />
                      </Link>
                      <div className="berita-spotlight-main-copy">
                        <p className="berita-kicker">
                          {spotlightMain.category}
                        </p>
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
                              className="berita-spotlight-small-img"
                            />
                          </Link>
                          <div className="berita-spotlight-small-copy">
                            <p className="berita-kicker">{item.category}</p>
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
                  className="gallery-pagination blog-pagination"
                  aria-label="Navigasi halaman berita"
                >
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
                      if (typeof item === "string") {
                        return (
                          <span
                            key={`${item}-${index}`}
                            className="gallery-page-ellipsis"
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
                          className={`gallery-page-btn ${item === currentPage ? "is-active" : ""}`}
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
                    className="gallery-page-btn"
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
