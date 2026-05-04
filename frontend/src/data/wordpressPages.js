import { withCache } from './wpCache'

const DEFAULT_WP_SITE_URL = 'https://cms.trimitramulti.co.id'
const RAW_WP_SITE_URL = (import.meta.env.VITE_WP_SITE_URL || '').trim().replace(/\/$/, '')
const WP_SITE_URL = (RAW_WP_SITE_URL || DEFAULT_WP_SITE_URL)
  .replace(/^https?:\/\/trimitramulti\.co\.id\/?$/i, DEFAULT_WP_SITE_URL)
  .replace(/\/$/, '')
const WP_CACHE_TTL_MS = 5 * 60 * 1000
const WP_CACHE_VERSION = 'v2'
const WP_FETCH_TIMEOUT_MS = 6500
const DEV_WP_PROXY_PREFIX = '/__wp_proxy__'

let cachedClients = null

const hasWindow = typeof window !== 'undefined'
const isLocalhostRuntime = hasWindow && ['localhost', '127.0.0.1'].includes(window.location.hostname)

function toRuntimeWpUrl(rawUrl) {
  if (!rawUrl) return rawUrl

  if (!isLocalhostRuntime) {
    return rawUrl
  }

  try {
    const wpOrigin = new URL(WP_SITE_URL).origin
    const resolved = new URL(rawUrl, WP_SITE_URL)

    if (resolved.origin !== wpOrigin) {
      return rawUrl
    }

    return `${DEV_WP_PROXY_PREFIX}${resolved.pathname}${resolved.search}`
  } catch {
    return rawUrl
  }
}

function normalizeWpAssetUrl(value) {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .replace(/^https?:\/\/trimitramulti\.co\.id(?=\/|$)/i, WP_SITE_URL)
    .replace(/^https?:\/\/www\.trimitramulti\.co\.id(?=\/|$)/i, WP_SITE_URL)
}

function parseClientNameFromMediaTitle(value, fallbackIndex = 0) {
  const decoded = stripHtml(value || '').trim()
  if (!decoded) return `Partner ${String(fallbackIndex + 1).padStart(2, '0')}`
  if (/^\d+$/.test(decoded)) return `Partner ${decoded.padStart(2, '0')}`
  return decoded
}

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
  if (source.includes('backdrop')) return 'Backdrop'
  if (source.includes('gate') || source.includes('gerbang')) return 'Gate'
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

function getTimestampFromUrlPath(url) {
  if (!url || typeof url !== 'string') return 0

  const withDayMatch = url.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (withDayMatch) {
    const year = Number(withDayMatch[1])
    const month = Number(withDayMatch[2])
    const day = Number(withDayMatch[3])
    if (year >= 2000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return Date.UTC(year, month - 1, day)
    }
  }

  const uploadFolderMatch = url.match(/\/uploads\/(\d{4})\/(\d{2})\//)
  if (uploadFolderMatch) {
    const year = Number(uploadFolderMatch[1])
    const month = Number(uploadFolderMatch[2])
    if (year >= 2000 && month >= 1 && month <= 12) {
      return Date.UTC(year, month - 1, 1)
    }
  }

  return 0
}

function getGallerySortValue(item) {
  const urlTimestamp = Math.max(
    getTimestampFromUrlPath(item?.fullSrc),
    getTimestampFromUrlPath(item?.src),
  )

  if (urlTimestamp > 0) return urlTimestamp

  const numericId = Number(item?.id)
  return Number.isFinite(numericId) ? numericId : 0
}

function pickPreferredSrcFromSrcSet(srcset, fallbackSrc = '') {
  if (!srcset || typeof srcset !== 'string') return fallbackSrc

  const candidates = srcset
    .split(',')
    .map((entry) => entry.trim())
    .map((entry) => {
      const parts = entry.split(/\s+/).filter(Boolean)
      if (parts.length === 0) return null
      const url = parts[0]
      const descriptor = parts[1] || ''
      const width = descriptor.endsWith('w') ? Number(descriptor.slice(0, -1)) : NaN

      return {
        url,
        width: Number.isFinite(width) ? width : undefined,
      }
    })
    .filter((item) => item && item.url)

  if (candidates.length === 0) return fallbackSrc

  const sized = candidates.filter((item) => Number.isFinite(item.width))
  if (sized.length === 0) return candidates[0].url || fallbackSrc

  const targetWidth = 1024
  const closest = sized.reduce((best, current) => {
    const currentDistance = Math.abs((current.width || targetWidth) - targetWidth)
    const bestDistance = Math.abs((best.width || targetWidth) - targetWidth)
    return currentDistance < bestDistance ? current : best
  }, sized[0])

  return closest?.url || fallbackSrc
}

function extractGalleryImagesFromHtml(html) {
  if (!html || !hasWindow) return []

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const galleryItems = Array.from(doc.querySelectorAll('dl.gallery-item'))
  const fromGalleryItems = galleryItems
    .map((item) => {
      const img = item.querySelector('img')
      const anchor = item.querySelector('a[href]')
      const caption = decodeHtml(item.querySelector('.gallery-caption')?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim()

      const thumbSrc = img
        ? (img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '')
        : ''
      const srcSet = img ? (img.getAttribute('srcset') || '') : ''
      const previewSrc = pickPreferredSrcFromSrcSet(srcSet, thumbSrc)
      let fullSrc = ''
      if (anchor) {
        const href = anchor.getAttribute('href') || ''
        if (isImageUrl(href)) {
          fullSrc = href
        }
      }
      const src = previewSrc || thumbSrc || fullSrc
      if (!src || !src.includes('/uploads/')) return null

      const altFromImage = decodeHtml(img?.getAttribute('alt') || '').replace(/\s+/g, ' ').trim()
      const width = Number(img?.getAttribute('width') || '0') || undefined
      const height = Number(img?.getAttribute('height') || '0') || undefined

      return {
        src,
        fullSrc: fullSrc || src,
        alt: caption || altFromImage,
        caption,
        width,
        height,
      }
    })
    .filter(Boolean)

  const nodes = Array.from(doc.querySelectorAll('img, a[href]'))
  const fromGenericNodes = nodes
    .map((node) => {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || ''
        if (!isImageUrl(href)) return null

        const alt = decodeHtml(node.textContent || '').replace(/\s+/g, ' ').trim()
        return href.includes('/uploads/')
          ? {
            src: href,
            alt,
            caption: '',
          }
          : null
      }

      const src = node.getAttribute('src') || node.getAttribute('data-src') || node.getAttribute('data-lazy-src') || ''
      const srcSet = node.getAttribute('srcset') || ''
      const previewSrc = pickPreferredSrcFromSrcSet(srcSet, src)
      if (!src || !src.includes('/uploads/')) return null

      const alt = decodeHtml(node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim()
      const width = Number(node.getAttribute('width') || '0') || undefined
      const height = Number(node.getAttribute('height') || '0') || undefined

      return {
        src: previewSrc || src,
        fullSrc: src,
        alt,
        caption: '',
        width,
        height,
      }
    })
    .filter(Boolean)

  const items = fromGalleryItems.length > 0 ? fromGalleryItems : fromGenericNodes

  const seen = new Set()
  return items.filter((item) => {
    const identity = item.fullSrc || item.src
    if (seen.has(identity)) return false
    seen.add(identity)
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

function stripHtml(value) {
  if (!value) return ''
  return decodeHtml(String(value).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function getInitialsFromName(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CL'
}

function firstTextMatch(candidates, matcher) {
  for (const value of candidates) {
    if (matcher(value)) return value
  }
  return ''
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

async function fetchWp(endpoint, params = {}, options = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `${WP_SITE_URL}/wp-json/wp/v2/${endpoint}${query ? `?${query}` : ''}`
  const requestUrl = toRuntimeWpUrl(url)

  const { skipCache = false } = options

  const fetchFn = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

    let response
    try {
      response = await fetch(requestUrl, {
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`WordPress request failed: ${response.status}`)
    }

    const data = await response.json()
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || '1')
    return { data, totalPages }
  }

  // If skipCache is true, fetch directly without caching
  if (skipCache) {
    return fetchFn()
  }

  // Otherwise use cache as before
  return withCache(`wp:${WP_CACHE_VERSION}:${url}`, WP_CACHE_TTL_MS, fetchFn, { staleWhileRevalidate: false })
}

async function fetchWpAbsolute(url) {
  const requestUrl = toRuntimeWpUrl(url)
  return withCache(`wp:${WP_CACHE_VERSION}:${url}`, WP_CACHE_TTL_MS, async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

    let response
    try {
      response = await fetch(requestUrl, {
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`WordPress request failed: ${response.status}`)
    }

    return response.json()
  }, { staleWhileRevalidate: false })
}

async function fetchWpAbsoluteNoStore(url) {
  const requestUrl = toRuntimeWpUrl(url)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

  let response
  try {
    response = await fetch(requestUrl, {
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit',
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`WordPress request failed: ${response.status}`)
  }

  return response.json()
}

async function getMediaSourceById(mediaId) {
  if (!mediaId) return ''
  const result = await fetchWp(`media/${mediaId}`, {
    _fields: 'id,source_url,media_details.sizes.thumbnail.source_url,media_details.sizes.medium.source_url,media_details.sizes.medium_large.source_url',
  })

  const media = result?.data
  if (media && typeof media === 'object' && media.source_url) {
    return normalizeWpAssetUrl(pickSmallImageSource(media))
  }

  return ''
}

function pickSmallImageSource(media) {
  const thumbnail = media?.media_details?.sizes?.thumbnail?.source_url
  const medium = media?.media_details?.sizes?.medium?.source_url
  const mediumLarge = media?.media_details?.sizes?.medium_large?.source_url
  const sourceUrl = thumbnail || medium || mediumLarge || media?.source_url || ''

  if (!sourceUrl) return ''
  if (/([?&])w=\d+/i.test(sourceUrl)) return sourceUrl

  return `${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}w=100`
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
    const hasAcf = Boolean(page?.acf && typeof page.acf === 'object' && Object.keys(page.acf).length > 0)
    const hasContent = hasMeaningfulHtml(contentHtml) || Boolean(excerpt) || Boolean(image) || hasAcf

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

export async function getWordPressClients({ perPage = 40, skipCache = false } = {}) {
  if (!isWordPressConfiguredForPages()) return []

  if (!skipCache && Array.isArray(cachedClients) && cachedClients.length > 0) {
    return cachedClients
  }

  const palette = ['#1877F2', '#E4405F', '#0A66C2', '#FF6B35', '#16A34A', '#7C3AED', '#0EA5E9']
  const fetchOptions = skipCache ? { skipCache: true } : {}

  async function mapClientItems(records) {
    const mapped = await Promise.all(
      records.map(async (item, index) => {
        const name = stripHtml(item?.title?.rendered || item?.title || item?.name || '') || `Client ${index + 1}`
        const label = 'Partner'

        let logo = ''
        const embeddedMedia = item?._embedded?.['wp:featuredmedia']
        if (Array.isArray(embeddedMedia) && embeddedMedia[0]) {
          logo = pickSmallImageSource(embeddedMedia[0])
        } else if (item?.featured_media) {
          logo = await getMediaSourceById(item.featured_media)
        }

        return {
          id: item?.id || `client-${index}`,
          initials: getInitialsFromName(name),
          name,
          tagline: label || 'Partner',
          color: palette[index % palette.length],
          logo: normalizeWpAssetUrl(logo),
        }
      }),
    )

    return mapped.filter((item) => item.name)
  }

  try {
    const first = await fetchWp('client', {
      per_page: String(Math.min(100, Math.max(1, perPage))),
      page: '1',
      orderby: 'date',
      order: 'desc',
      _embed: '1',
      _fields: 'id,title.rendered,featured_media,_embedded',
    }, fetchOptions)

    let posts = Array.isArray(first.data) ? [...first.data] : []

    if (Number(first.totalPages || 1) > 1) {
      const requests = []
      for (let page = 2; page <= first.totalPages; page += 1) {
        requests.push(
          fetchWp('client', {
            per_page: String(Math.min(100, Math.max(1, perPage))),
            page: String(page),
            orderby: 'date',
            order: 'desc',
            _embed: '1',
            _fields: 'id,title.rendered,featured_media,_embedded',
          }, fetchOptions),
        )
      }

      const rest = await Promise.all(requests)
      rest.forEach((result) => {
        if (Array.isArray(result.data)) {
          posts = posts.concat(result.data)
        }
      })
    }

    const mapped = await mapClientItems(posts)
    cachedClients = mapped
    return mapped
  } catch {
    return []
  }
}

export function getCachedWordPressClients() {
  return Array.isArray(cachedClients) && cachedClients.length > 0 ? cachedClients : null
}

export async function getWordPressGalleryMedia({ perPage = 100, allPages = true } = {}) {
  if (!isWordPressConfiguredForPages()) return []

  const clampedPerPage = Math.min(100, Math.max(1, perPage))
  const firstPage = await fetchWp('media', {
    media_type: 'image',
    per_page: String(clampedPerPage),
    page: '1',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,source_url,alt_text,title.rendered,caption.rendered,media_details.width,media_details.height',
  })

  let items = Array.isArray(firstPage.data) ? [...firstPage.data] : []

  if (allPages && Number(firstPage.totalPages || 1) > 1) {
    const requests = []
    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      requests.push(
        fetchWp('media', {
          media_type: 'image',
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
        items = items.concat(item.data)
      }
    })
  }

  const normalizedItems = items
    .map((item) => {
      const title = decodeHtml(item?.title?.rendered || '')
      const alt = decodeHtml(item?.alt_text || title)
      const caption = decodeHtml(item?.caption?.rendered || '')
      const sourceUrl = item?.source_url || ''
      const hintText = `${title} ${alt} ${caption} ${sourceUrl}`
      const width = item?.media_details?.width
      const height = item?.media_details?.height

      return {
        id: item?.id,
        src: sourceUrl,
        title: title || alt || 'Galeri',
        date: item?.date || item?.date_gmt || '',
        alt: alt || title || 'Galeri',
        category: inferGalleryCategory(hintText),
        type: normalizeGalleryType(width, height),
        width,
        height,
      }
    })
    .filter((item) => {
      if (!item.src) return false

      const source = item.src.toLowerCase()
      const isUtilityAsset =
        source.includes('/email.') ||
        source.includes('/telp.') ||
        source.includes('/wa.') ||
        source.includes('/logo-') ||
        source.includes('/icon-') ||
        source.includes('/favicon')

      if (isUtilityAsset) return false

      const hasLargeEnoughDimensions = (item.width || 0) >= 480 && (item.height || 0) >= 280
      return hasLargeEnoughDimensions || source.includes('/uploads/2025/') || source.includes('/uploads/2026/')
    })

  return normalizedItems
}

export async function getWordPressGalleryFromPageBySlugs(slugs = ['galeri', 'gallery'], options = {}) {
  if (!isWordPressConfiguredForPages()) return []

  const { skipCache = false } = options
  const fetchOptions = skipCache ? { skipCache: true } : {}

  let page = null
  for (const slug of slugs) {
    if (!slug) continue
    const result = await fetchWp('pages', {
      slug,
      status: 'publish',
      per_page: '1',
      _fields: 'id,slug,link,content.rendered',
    }, fetchOptions)
    const pages = Array.isArray(result.data) ? result.data : []
    if (pages.length > 0) {
      page = pages[0]
      break
    }
  }

  if (!page) return []

  return extractGalleryFromWordPressPage(page, options)
}

export async function getWordPressGalleryFromPageId(pageId, options = {}) {
  if (!isWordPressConfiguredForPages()) return []

  const { skipCache = false } = options
  const fetchOptions = skipCache ? { skipCache: true } : {}

  const numericPageId = Number(pageId)
  if (!Number.isFinite(numericPageId) || numericPageId <= 0) return []

  let page
  try {
    const result = await fetchWp(`pages/${numericPageId}`, {
      _fields: 'id,slug,link,content.rendered',
    }, fetchOptions)

    const pageData = result?.data
    if (!pageData || typeof pageData !== 'object' || !pageData.id) {
      return []
    }

    page = pageData
  } catch {
    return []
  }

  return extractGalleryFromWordPressPage(page, options)
}

async function extractGalleryFromWordPressPage(page, options = {}) {
  if (!page || typeof page !== 'object') return []

  const { skipCache = false } = options
  const fetchOptions = skipCache ? { skipCache: true } : {}

  const pageId = page.id
  const pageUrl = page?.link || `${WP_SITE_URL}/${String(page.slug || '').replace(/^\/+|\/+$/g, '')}/`
  const runtimePageUrl = toRuntimeWpUrl(pageUrl)

  let renderedHtml = ''
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), Math.min(WP_FETCH_TIMEOUT_MS, 5000))
    let response
    try {
      response = await fetch(runtimePageUrl, {
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store',
      })
    } finally {
      clearTimeout(timeoutId)
    }
    if (response.ok) {
      renderedHtml = await response.text()
    }
  } catch {
    renderedHtml = ''
  }

  const renderedImages = extractGalleryImagesFromHtml(renderedHtml)
  const inlineImages = parseImagesFromRenderedHtml(page?.content?.rendered || '')

  const fromRendered = renderedImages.map((item) => {
    const caption = decodeHtml(item.caption || '').replace(/\s+/g, ' ').trim()
    const alt = decodeHtml(item.alt || '').replace(/\s+/g, ' ').trim()
    const hintText = `${caption} ${alt} ${item.src || ''}`
    return {
      id: `rendered-${item.src}`,
      src: item.src,
      fullSrc: item.fullSrc || item.src,
      alt: caption || alt || 'Galeri',
      category: inferGalleryCategory(hintText),
      type: inferGalleryTypeFromRatio(item.width, item.height),
      width: item.width,
      height: item.height,
    }
  })

  const inlineMapped = inlineImages.map((item) => {
    const hintText = `${item.alt || ''}`
    return {
      id: `inline-${item.src}`,
      src: item.src,
      fullSrc: item.src,
      alt: item.alt || 'Galeri',
      category: inferGalleryCategory(hintText),
      type: inferGalleryTypeFromRatio(item.width, item.height),
      width: item.width,
      height: item.height,
    }
  })

  let combined = [...fromRendered, ...inlineMapped].filter((item) => item.src)

  // Muffin Builder setups often keep gallery selections outside content.rendered.
  // In that case, use media attached to this GALERI page as a strict page-level fallback.
  if (combined.length === 0 && pageId) {
    const mediaFirstPage = await fetchWp('media', {
      parent: String(pageId),
      media_type: 'image',
      per_page: '100',
      page: '1',
      orderby: 'date',
      order: 'desc',
      _fields: 'id,source_url,alt_text,title.rendered,caption.rendered,media_details.width,media_details.height',
    }, fetchOptions)

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
          }, fetchOptions),
        )
      }

      const restResults = await Promise.all(reqs)
      restResults.forEach((result) => {
        if (Array.isArray(result.data)) {
          mediaItems = mediaItems.concat(result.data)
        }
      })
    }

    combined = mediaItems
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
          fullSrc: item?.source_url,
          alt: alt || title || 'Galeri',
          category: inferGalleryCategory(hintText),
          type: inferGalleryTypeFromRatio(width, height),
          width,
          height,
        }
      })
      .filter((item) => item.src)
  }

  const uniqueBySrc = []
  const seen = new Set()

  combined.forEach((item) => {
    if (seen.has(item.src)) return
    seen.add(item.src)
    uniqueBySrc.push(item)
  })

  uniqueBySrc.sort((a, b) => getGallerySortValue(b) - getGallerySortValue(a))

  return uniqueBySrc
}
