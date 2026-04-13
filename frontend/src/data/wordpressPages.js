import { withCache } from './wpCache'

const WP_SITE_URL = (import.meta.env.VITE_WP_SITE_URL || '').trim().replace(/\/$/, '')
const WP_CACHE_TTL_MS = 5 * 60 * 1000
const WP_FETCH_TIMEOUT_MS = 6500

const hasWindow = typeof window !== 'undefined'

function decodeHtml(value) {
  if (!value) return ''
  if (!hasWindow) return value
  const parser = new window.DOMParser()
  return parser.parseFromString(value, 'text/html').documentElement.textContent || ''
}

function hasMeaningfulHtml(html) {
  const text = decodeHtml((html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
  return text.length > 0
}

function normalizeGalleryType(width, height) {
  if (!width || !height) return 'square'
  const ratio = width / height
  if (ratio >= 1.45) return 'wide'
  if (ratio <= 0.82) return 'tall'
  return 'square'
}

function inferGalleryCategory(text) {
  const source = (text || '').toLowerCase()
  if (source.includes('billboard') || source.includes('reklame')) return 'Billboard'
  if (source.includes('event') || source.includes('acara') || source.includes('wisuda')) return 'Event'
  return 'Booth Pameran'
}

function inferGalleryTypeFromRatio(width, height) {
  if (!width || !height) return 'square'
  const ratio = width / height
  if (ratio >= 1.45) return 'wide'
  if (ratio <= 0.82) return 'tall'
  return 'square'
}

function isImageUrl(value) {
  if (!value) return false
  return /\.(avif|webp|png|jpe?g|gif|bmp|svg)(\?.*)?$/i.test(value)
}

function extractGalleryImagesFromHtml(html) {
  if (!html || !hasWindow) return []

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes = Array.from(doc.querySelectorAll('img, a[href]'))

  const items = nodes
    .map((node) => {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || ''
        if (!isImageUrl(href)) return null

        const alt = decodeHtml(node.textContent || '').replace(/\s+/g, ' ').trim()
        return href.includes('/uploads/')
          ? {
            src: href,
            alt,
          }
          : null
      }

      const src = node.getAttribute('src') || node.getAttribute('data-src') || node.getAttribute('data-lazy-src') || ''
      if (!src || !src.includes('/uploads/')) return null

      const alt = decodeHtml(node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim()
      const width = Number(node.getAttribute('width') || '0') || undefined
      const height = Number(node.getAttribute('height') || '0') || undefined

      return {
        src,
        alt,
        width,
        height,
      }
    })
    .filter(Boolean)

  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.src)) return false
    seen.add(item.src)
    return true
  })
}

function parseImagesFromRenderedHtml(html) {
  if (!html) return []

  if (hasWindow) {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const imgNodes = Array.from(doc.querySelectorAll('img'))
    const linkNodes = Array.from(doc.querySelectorAll('a[href]'))

    const fromImgs = imgNodes
      .map((img) => ({
        src: img.getAttribute('src') || '',
        alt: decodeHtml(img.getAttribute('alt') || ''),
        width: Number(img.getAttribute('width') || '0') || undefined,
        height: Number(img.getAttribute('height') || '0') || undefined,
      }))
      .filter((item) => item.src)

    const fromLinks = linkNodes
      .map((link) => {
        const href = link.getAttribute('href') || ''
        if (!isImageUrl(href)) return null

        const textAlt = decodeHtml(link.textContent || '').trim()
        return {
          src: href,
          alt: textAlt,
          width: undefined,
          height: undefined,
        }
      })
      .filter(Boolean)

    return [...fromImgs, ...fromLinks]
  }

  return []
}

function dedupe(values = []) {
  return Array.from(new Set(values.filter(Boolean)))
}

function firstTextMatch(candidates, matcher) {
  for (const value of candidates) {
    if (matcher(value)) return value
  }
  return ''
}

function fetchMediaBySearchTerm(term, perPage) {
  return fetchWp('media', {
    media_type: 'image',
    search: term,
    per_page: String(perPage),
    page: '1',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,source_url,alt_text,title.rendered,caption.rendered,media_details.width,media_details.height',
  })
}

export function extractContactInfoFromHtml(html) {
  const fallback = {
    address: '',
    emails: [],
    phones: [],
    whatsapp: '',
  }

  if (!html || !hasWindow) return fallback

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const links = Array.from(doc.querySelectorAll('a[href]'))
  const textBlocks = Array.from(doc.querySelectorAll('p, li, address, div'))
    .map((node) => decodeHtml(node.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((text) => text.length > 10)

  const emails = dedupe(
    links
      .map((link) => link.getAttribute('href') || '')
      .filter((href) => href.startsWith('mailto:'))
      .map((href) => href.replace(/^mailto:/i, '').trim()),
  )

  const phones = dedupe(
    links
      .map((link) => ({ href: link.getAttribute('href') || '', text: decodeHtml(link.textContent || '').trim() }))
      .filter((item) => item.href.startsWith('tel:'))
      .map((item) => item.text || item.href.replace(/^tel:/i, '').trim()),
  )

  const whatsapp =
    links
      .map((link) => link.getAttribute('href') || '')
      .find((href) => href.includes('wa.me/') || href.includes('api.whatsapp.com/')) ||
    ''

  const address = firstTextMatch(textBlocks, (value) => {
    const source = value.toLowerCase()
    return (
      source.includes('jl.') ||
      source.includes('jalan') ||
      source.includes('kota') ||
      source.includes('jakarta') ||
      source.includes('depok') ||
      source.includes('alamat')
    )
  })

  return {
    address,
    emails,
    phones,
    whatsapp,
  }
}

async function fetchWp(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `${WP_SITE_URL}/wp-json/wp/v2/${endpoint}${query ? `?${query}` : ''}`

  return withCache(`wp:${url}`, WP_CACHE_TTL_MS, async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

    let response
    try {
      response = await fetch(url, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`WordPress request failed: ${response.status}`)
    }

    const data = await response.json()
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || '1')
    return { data, totalPages }
  })
}

async function getMediaSourceById(mediaId) {
  if (!mediaId) return ''
  const result = await fetchWp(`media/${mediaId}`, {
    _fields: 'id,source_url',
  })

  const media = result?.data
  if (media && typeof media === 'object' && media.source_url) {
    return media.source_url
  }

  return ''
}

export function isWordPressConfiguredForPages() {
  return Boolean(WP_SITE_URL)
}

export async function getWordPressPageBySlugs(slugs = []) {
  if (!isWordPressConfiguredForPages()) return null

  for (const slug of slugs) {
    if (!slug) continue

    const result = await fetchWp('pages', {
      slug,
      status: 'publish',
      per_page: '1',
      _fields: 'id,slug,title.rendered,excerpt.rendered,content.rendered,featured_media,acf,meta',
    })

    const pages = Array.isArray(result.data) ? result.data : []
    if (pages.length === 0) continue

    const page = pages[0]
    const image = await getMediaSourceById(page?.featured_media)
    const contentHtml = page?.content?.rendered || ''
    const excerpt = decodeHtml(page?.excerpt?.rendered || '')
    const hasContent = hasMeaningfulHtml(contentHtml) || Boolean(excerpt) || Boolean(image)

    if (!hasContent) {
      continue
    }

    return {
      slug: page.slug,
      title: decodeHtml(page?.title?.rendered || ''),
      excerpt,
      contentHtml,
      image,
      acf: page?.acf && typeof page.acf === 'object' ? page.acf : {},
      meta: page?.meta && typeof page.meta === 'object' ? page.meta : {},
    }
  }

  return null
}

export async function getWordPressGalleryMedia({ perPage = 100, allPages = true } = {}) {
  if (!isWordPressConfiguredForPages()) return []

  const clampedPerPage = Math.min(25, Math.max(1, perPage))
  const searchTerms = ['booth', 'pameran', 'event', 'billboard', 'reklame', 'exhibition']

  const queries = await Promise.all(
    searchTerms.map(async (term) => {
      const result = await fetchMediaBySearchTerm(term, clampedPerPage)

      if (!allPages || result.totalPages <= 1) {
        return Array.isArray(result.data) ? result.data : []
      }

      const pages = Array.isArray(result.data) ? result.data : []
      const requests = []
      for (let page = 2; page <= result.totalPages; page += 1) {
        requests.push(
          fetchWp('media', {
            media_type: 'image',
            search: term,
            per_page: String(clampedPerPage),
            page: String(page),
            orderby: 'date',
            order: 'desc',
            _fields: 'id,source_url,alt_text,title.rendered,caption.rendered,media_details.width,media_details.height',
          }),
        )
      }

      const rest = await Promise.all(requests)
      rest.forEach((item) => {
        if (Array.isArray(item.data)) {
          pages.push(...item.data)
        }
      })

      return pages
    }),
  )

  const items = queries.flat()

  return items
    .map((item) => {
      const title = decodeHtml(item?.title?.rendered || '')
      const alt = decodeHtml(item?.alt_text || title)
      const caption = decodeHtml(item?.caption?.rendered || '')
      const hintText = `${title} ${alt} ${caption}`
      const width = item?.media_details?.width
      const height = item?.media_details?.height

      return {
        id: item?.id,
        src: item?.source_url,
        alt: alt || title || 'Galeri',
        category: inferGalleryCategory(hintText),
        type: normalizeGalleryType(width, height),
      }
    })
    .filter((item) => item.src)
}

export async function getWordPressGalleryFromPageBySlugs(slugs = ['galeri', 'gallery']) {
  if (!isWordPressConfiguredForPages()) return []

  let page = null
  for (const slug of slugs) {
    if (!slug) continue
    const result = await fetchWp('pages', {
      slug,
      status: 'publish',
      per_page: '1',
      _fields: 'id,slug,link,content.rendered',
    })
    const pages = Array.isArray(result.data) ? result.data : []
    if (pages.length > 0) {
      page = pages[0]
      break
    }
  }

  if (!page) return []

  const pageId = page.id
  const pageUrl = page?.link || `${WP_SITE_URL}/${String(page.slug || '').replace(/^\/+|\/+$/g, '')}/`

  let renderedHtml = ''
  try {
    const response = await fetch(pageUrl, { credentials: 'omit' })
    if (response.ok) {
      renderedHtml = await response.text()
    }
  } catch {
    renderedHtml = ''
  }

  const renderedImages = extractGalleryImagesFromHtml(renderedHtml)
  const inlineImages = parseImagesFromRenderedHtml(page?.content?.rendered || '')

  const mediaFirstPage = await fetchWp('media', {
    parent: String(pageId),
    media_type: 'image',
    per_page: '100',
    page: '1',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,source_url,alt_text,title.rendered,caption.rendered,media_details.width,media_details.height',
  })

  let mediaItems = Array.isArray(mediaFirstPage.data) ? mediaFirstPage.data : []

  if (mediaFirstPage.totalPages > 1) {
    const reqs = []
    for (let pageNumber = 2; pageNumber <= mediaFirstPage.totalPages; pageNumber += 1) {
      reqs.push(
        fetchWp('media', {
          parent: String(pageId),
          media_type: 'image',
          per_page: '100',
          page: String(pageNumber),
          orderby: 'date',
          order: 'desc',
          _fields: 'id,source_url,alt_text,title.rendered,caption.rendered,media_details.width,media_details.height',
        }),
      )
    }

    const restResults = await Promise.all(reqs)
    restResults.forEach((result) => {
      if (Array.isArray(result.data)) {
        mediaItems = mediaItems.concat(result.data)
      }
    })
  }

  const fromRendered = renderedImages.map((item) => {
    const hintText = `${item.alt || ''} ${item.src || ''}`
    return {
      id: `rendered-${item.src}`,
      src: item.src,
      alt: item.alt || 'Galeri',
      category: inferGalleryCategory(hintText),
      type: inferGalleryTypeFromRatio(item.width, item.height),
      width: item.width,
      height: item.height,
    }
  })

  const fromMedia = mediaItems.map((item) => {
    const title = decodeHtml(item?.title?.rendered || '')
    const alt = decodeHtml(item?.alt_text || title)
    const caption = decodeHtml(item?.caption?.rendered || '')
    const hintText = `${title} ${alt} ${caption}`
    const width = item?.media_details?.width
    const height = item?.media_details?.height

    return {
      id: item?.id,
      src: item?.source_url,
      alt: alt || title || 'Galeri',
      category: inferGalleryCategory(hintText),
      type: inferGalleryTypeFromRatio(width, height),
      width,
      height,
    }
  })

  const inlineMapped = inlineImages.map((item) => {
    const hintText = `${item.alt || ''}`
    return {
      id: `inline-${item.src}`,
      src: item.src,
      alt: item.alt || 'Galeri',
      category: inferGalleryCategory(hintText),
      type: inferGalleryTypeFromRatio(item.width, item.height),
      width: item.width,
      height: item.height,
    }
  })

  const combined = [...fromRendered, ...fromMedia, ...inlineMapped].filter((item) => item.src)
  const uniqueBySrc = []
  const seen = new Set()

  combined.forEach((item) => {
    if (seen.has(item.src)) return
    seen.add(item.src)
    uniqueBySrc.push(item)
  })

  return uniqueBySrc
}
