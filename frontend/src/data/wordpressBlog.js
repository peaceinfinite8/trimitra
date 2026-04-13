import { withCache } from './wpCache'

const WP_SITE_URL = (import.meta.env.VITE_WP_SITE_URL || '').replace(/\/$/, '')
const WP_CACHE_TTL_MS = 60 * 1000
const WP_FETCH_TIMEOUT_MS = 6500

const hasWindow = typeof window !== 'undefined'

function decodeHtml(value) {
  if (!value) return ''
  if (!hasWindow) return value
  const parser = new window.DOMParser()
  return parser.parseFromString(value, 'text/html').documentElement.textContent || ''
}

function stripHtml(value) {
  if (!value) return ''
  return decodeHtml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function formatDateId(value) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function estimateReadTime(contentText) {
  const words = contentText.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

function normalizeCategory(post, categoriesById) {
  const categoryIds = Array.isArray(post?.categories) ? post.categories : []
  const firstCategoryId = categoryIds[0]
  const categoryName = categoriesById.get(firstCategoryId)
  return decodeHtml(categoryName || 'Berita')
}

function normalizeImage(post) {
  return post?.jetpack_featured_media_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'
}

function normalizePost(post, categoriesById) {
  const title = decodeHtml(post?.title?.rendered || '')
  const excerptText = stripHtml(post?.excerpt?.rendered || post?.content?.rendered || '')
  const contentHtml = post?.content?.rendered || ''

  return {
    slug: post?.slug,
    title,
    excerpt: excerptText,
    image: normalizeImage(post),
    date: formatDateId(post?.date),
    category: normalizeCategory(post, categoriesById),
    readTime: estimateReadTime(stripHtml(contentHtml || excerptText)),
    contentHtml,
  }
}

async function requestWordPress(url, options = {}) {
  const { bypassHttpCache = false } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

  let response
  try {
    response = await fetch(url, {
      signal: controller.signal,
      cache: bypassHttpCache ? 'no-store' : 'default',
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`WordPress request failed: ${response.status}`)
  }

  const data = await response.json()
  const totalPages = Number(response.headers.get('X-WP-TotalPages') || '1')
  const totalItems = Number(response.headers.get('X-WP-Total') || String(Array.isArray(data) ? data.length : 0))

  return { data, totalPages, totalItems }
}

async function fetchWp(endpoint, params = {}, options = {}) {
  const {
    skipCache = false,
    ttlMs = WP_CACHE_TTL_MS,
    staleWhileRevalidate = true,
  } = options

  const searchParams = new URLSearchParams(params)
  if (skipCache) {
    searchParams.set('_', String(Date.now()))
  }
  const query = searchParams.toString()
  const url = `${WP_SITE_URL}/wp-json/wp/v2/${endpoint}${query ? `?${query}` : ''}`

  if (skipCache) {
    return requestWordPress(url, { bypassHttpCache: true })
  }

  return withCache(`wp:${url}`, ttlMs, async () => requestWordPress(url), { staleWhileRevalidate })
}

async function getCategoriesLookup(options = {}) {
  const firstPage = await fetchWp('categories', {
    per_page: '100',
    page: '1',
    _fields: 'id,name',
    hide_empty: 'false',
  }, options)

  let categories = Array.isArray(firstPage.data) ? firstPage.data : []

  if (firstPage.totalPages > 1) {
    const requests = []
    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      requests.push(
        fetchWp('categories', {
          per_page: '100',
          page: String(page),
          _fields: 'id,name',
          hide_empty: 'false',
        }, options),
      )
    }

    const results = await Promise.all(requests)
    results.forEach((result) => {
      if (Array.isArray(result.data)) {
        categories = categories.concat(result.data)
      }
    })
  }

  return new Map(categories.map((category) => [category.id, decodeHtml(category.name)]))
}

export function isWordPressConfigured() {
  return Boolean(WP_SITE_URL)
}

export async function getBlogPostsFromWordPress({
  perPage = 100,
  allPages = true,
  skipCache = false,
  staleWhileRevalidate = true,
  ttlMs = WP_CACHE_TTL_MS,
} = {}) {
  if (!isWordPressConfigured()) return []

  const fetchOptions = {
    skipCache,
    staleWhileRevalidate,
    ttlMs,
  }

  const clampedPerPage = Math.min(100, Math.max(1, perPage))

  const firstPage = await fetchWp('posts', {
    per_page: String(clampedPerPage),
    page: '1',
    status: 'publish',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,slug,title.rendered,excerpt.rendered,date,categories,jetpack_featured_media_url',
  }, fetchOptions)

  let posts = Array.isArray(firstPage.data) ? firstPage.data : []

  if (allPages && firstPage.totalPages > 1) {
    const remainingPages = []
    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      remainingPages.push(
        fetchWp('posts', {
          per_page: String(clampedPerPage),
          page: String(page),
          status: 'publish',
          orderby: 'date',
          order: 'desc',
          _fields: 'id,slug,title.rendered,excerpt.rendered,date,categories,jetpack_featured_media_url',
        }, fetchOptions),
      )
    }

    const pageResults = await Promise.all(remainingPages)
    pageResults.forEach((result) => {
      if (Array.isArray(result.data)) {
        posts = posts.concat(result.data)
      }
    })
  }

  const categoriesById = await getCategoriesLookup(fetchOptions)

  return posts.map((post) => normalizePost(post, categoriesById)).filter((post) => post.slug)
}

export async function getBlogPostBySlugFromWordPress(
  slug,
  {
    skipCache = false,
    staleWhileRevalidate = true,
    ttlMs = WP_CACHE_TTL_MS,
  } = {},
) {
  if (!isWordPressConfigured() || !slug) return null

  const fetchOptions = {
    skipCache,
    staleWhileRevalidate,
    ttlMs,
  }

  const result = await fetchWp('posts', {
    slug,
    status: 'publish',
    _fields: 'id,slug,title.rendered,excerpt.rendered,content.rendered,date,categories,jetpack_featured_media_url',
  }, fetchOptions)

  const posts = Array.isArray(result.data) ? result.data : []

  if (!Array.isArray(posts) || posts.length === 0) return null
  const categoriesById = await getCategoriesLookup(fetchOptions)
  return normalizePost(posts[0], categoriesById)
}

export function prefetchBlogPostBySlugFromWordPress(slug) {
  if (!slug || !isWordPressConfigured()) return
  getBlogPostBySlugFromWordPress(slug).catch(() => {
    // Ignore prefetch errors; navigation should still work with normal fetch.
  })
}
