import { withCache } from './wpCache'

const DEFAULT_WP_SITE_URL = 'https://cms.trimitramulti.co.id'
const RAW_WP_SITE_URL = (import.meta.env.VITE_WP_SITE_URL || '').trim().replace(/\/$/, '')
const WP_SITE_URL = (RAW_WP_SITE_URL || DEFAULT_WP_SITE_URL)
  .replace(/^https?:\/\/trimitramulti\.co\.id\/?$/i, DEFAULT_WP_SITE_URL)
  .replace(/\/$/, '')
const DEFAULT_WP_CLIENTS_ENDPOINT = `${DEFAULT_WP_SITE_URL}/wp-json/wp/v2/client`
const RAW_WP_CLIENTS_ENDPOINT = (import.meta.env.VITE_WP_CLIENTS_ENDPOINT || '').trim()
const WP_CLIENTS_ENDPOINT = RAW_WP_CLIENTS_ENDPOINT || DEFAULT_WP_CLIENTS_ENDPOINT
const WP_CACHE_TTL_MS = 5 * 60 * 1000
const WP_CACHE_VERSION = 'v2'
const WP_FETCH_TIMEOUT_MS = 6500

const hasWindow = typeof window !== 'undefined'

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

  return withCache(`wp:${WP_CACHE_VERSION}:${url}`, WP_CACHE_TTL_MS, async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

    let response
    try {
      response = await fetch(url, {
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
  }, { staleWhileRevalidate: false })
}

async function fetchWpAbsolute(url) {
  return withCache(`wp:${WP_CACHE_VERSION}:${url}`, WP_CACHE_TTL_MS, async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

    let response
    try {
      response = await fetch(url, {
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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

  let response
  try {
    response = await fetch(url, {
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
    _fields: 'id,source_url',
  })

  const media = result?.data
  if (media && typeof media === 'object' && media.source_url) {
    return normalizeWpAssetUrl(media.source_url)
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

export async function getWordPressClients({ perPage = 40 } = {}) {
  if (!isWordPressConfiguredForPages()) return []

  const palette = ['#1877F2', '#E4405F', '#0A66C2', '#FF6B35', '#16A34A', '#7C3AED', '#0EA5E9']
  const endpoints = ['client', 'clients']

  if (WP_CLIENTS_ENDPOINT) {
    try {
      const customUrl = WP_CLIENTS_ENDPOINT.startsWith('http')
        ? WP_CLIENTS_ENDPOINT
        : `${WP_SITE_URL}${WP_CLIENTS_ENDPOINT.startsWith('/') ? '' : '/'}${WP_CLIENTS_ENDPOINT}`

      const response = await fetchWpAbsoluteNoStore(customUrl)
      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : []

      const mappedCustom = await Promise.all(records.map(async (item, index) => {
        const name = stripHtml(
          item?.name ||
          item?.title ||
          item?.title?.rendered ||
          item?.post_title ||
          '',
        ) || `Client ${index + 1}`

        const tagline = stripHtml(
          item?.tagline ||
          item?.excerpt ||
          item?.excerpt?.rendered ||
          item?.description ||
          item?.content ||
          item?.content?.rendered ||
          '',
        ) || 'Partner layanan Trimitra'

        let logo =
          item?.logo ||
          item?.image ||
          item?.source_url ||
          item?.featured_image ||
          item?.featured_media_url ||
          item?.acf?.logo ||
          item?.acf?.client_logo ||
          item?.acf?.image ||
          ''

        if (logo && typeof logo === 'object') {
          logo =
            logo?.source_url ||
            logo?.url ||
            logo?.guid?.rendered ||
            ''
        }

        const embedded = item?._embedded?.['wp:featuredmedia']
        if ((!logo || typeof logo !== 'string') && Array.isArray(embedded) && embedded[0]?.source_url) {
          logo = embedded[0].source_url
        }

        if ((!logo || typeof logo !== 'string') && item?.featured_media) {
          logo = await getMediaSourceById(item.featured_media)
        }

        return {
          id: item?.id || `custom-${index}`,
          initials: getInitialsFromName(name),
          name,
          tagline,
          color: palette[index % palette.length],
          logo: normalizeWpAssetUrl(logo),
        }
      }))

      const usableCustom = mappedCustom.filter((item) => item.name)
      if (usableCustom.length > 0) {
        return usableCustom
      }
    } catch {
      // Continue to default endpoint probing.
    }
  }

  for (const endpoint of endpoints) {
    try {
      const first = await fetchWp(endpoint, {
        status: 'publish',
        per_page: String(Math.min(100, Math.max(1, perPage))),
        page: '1',
        orderby: 'menu_order',
        order: 'asc',
        _embed: '1',
        _fields: 'id,title.rendered,excerpt.rendered,content.rendered,featured_media,_embedded',
      })

      let posts = Array.isArray(first.data) ? [...first.data] : []

      if (Number(first.totalPages || 1) > 1) {
        const requests = []
        for (let page = 2; page <= first.totalPages; page += 1) {
          requests.push(
            fetchWp(endpoint, {
              status: 'publish',
              per_page: String(Math.min(100, Math.max(1, perPage))),
              page: String(page),
              orderby: 'menu_order',
              order: 'asc',
              _embed: '1',
              _fields: 'id,title.rendered,excerpt.rendered,content.rendered,featured_media,_embedded',
            }),
          )
        }

        const rest = await Promise.all(requests)
        rest.forEach((result) => {
          if (Array.isArray(result.data)) {
            posts = posts.concat(result.data)
          }
        })
      }

      const mapped = await Promise.all(
        posts.map(async (post, index) => {
          const name = stripHtml(post?.title?.rendered || '') || `Client ${index + 1}`
          const excerpt = stripHtml(post?.excerpt?.rendered || '')
          const content = stripHtml(post?.content?.rendered || '')
          const tagline = excerpt || content || 'Partner layanan Trimitra'

          let logo = ''
          const embedded = post?._embedded?.['wp:featuredmedia']
          if (Array.isArray(embedded) && embedded[0]?.source_url) {
            logo = normalizeWpAssetUrl(embedded[0].source_url)
          } else if (post?.featured_media) {
            logo = await getMediaSourceById(post.featured_media)
          }

          return {
            id: post?.id || `${endpoint}-${index}`,
            initials: getInitialsFromName(name),
            name,
            tagline,
            color: palette[index % palette.length],
            logo: normalizeWpAssetUrl(logo),
          }
        }),
      )

      const usable = mapped.filter((item) => item.name)
      if (usable.length > 0) {
        return usable
      }
    } catch {
      // Try next endpoint variant.
    }
  }

  try {
    // Fallback for installations where `client` CPT is not exposed in REST.
    const first = await fetchWp('media', {
      media_type: 'image',
      per_page: '100',
      page: '1',
      orderby: 'date',
      order: 'desc',
      _fields: 'id,title.rendered,source_url,media_details.sizes',
    })

    let mediaItems = Array.isArray(first.data) ? [...first.data] : []

    if (Number(first.totalPages || 1) > 1) {
      const maxPages = Math.min(Number(first.totalPages || 1), 5)
      const requests = []
      for (let page = 2; page <= maxPages; page += 1) {
        requests.push(
          fetchWp('media', {
            media_type: 'image',
            per_page: '100',
            page: String(page),
            orderby: 'date',
            order: 'desc',
            _fields: 'id,title.rendered,source_url,media_details.sizes',
          }),
        )
      }

      const rest = await Promise.all(requests)
      rest.forEach((result) => {
        if (Array.isArray(result.data)) {
          mediaItems = mediaItems.concat(result.data)
        }
      })
    }

    const logoItems = mediaItems.filter((item) => {
      const sizes = item?.media_details?.sizes
      return Boolean(sizes && sizes['clients-slider'])
    })

    if (logoItems.length > 0) {
      const mappedMediaFallback = logoItems
        .slice(0, Math.min(Math.max(1, perPage), 40))
        .map((item, index) => {
          const sliderLogo = item?.media_details?.sizes?.['clients-slider']?.source_url
          const fullLogo = item?.source_url
          return {
            id: item?.id || `media-client-${index}`,
            initials: getInitialsFromName(parseClientNameFromMediaTitle(item?.title?.rendered, index)),
            name: parseClientNameFromMediaTitle(item?.title?.rendered, index),
            tagline: 'Partner layanan Trimitra',
            color: palette[index % palette.length],
            logo: normalizeWpAssetUrl(sliderLogo || fullLogo || ''),
          }
        })
        .filter((item) => item.logo)

      if (mappedMediaFallback.length > 0) {
        return mappedMediaFallback
      }
    }
  } catch {
    // Keep empty and let UI fallback to hardcoded client cards.
  }

  return []
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
    const response = await fetch(pageUrl, {
      credentials: 'omit',
      cache: 'no-store',
    })
    if (response.ok) {
      renderedHtml = await response.text()
    }
  } catch {
    renderedHtml = ''
  }

  const renderedImages = extractGalleryImagesFromHtml(renderedHtml)
  const inlineImages = parseImagesFromRenderedHtml(page?.content?.rendered || '')

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

  return uniqueBySrc
}
