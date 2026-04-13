export function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateText(text = '', maxLength = 120) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

export function getPrimaryCategory(post) {
  return post?._embedded?.['wp:term']?.[0]?.[0] ?? null
}

export function getCategoriesFromPost(post) {
  return post?._embedded?.['wp:term']?.[0] ?? []
}

export function getFeaturedImage(post) {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/placeholder-news.svg'
}

export function getAuthorName(post) {
  return post?._embedded?.author?.[0]?.name ?? 'Editorial'
}

export function getAuthorAvatar(post) {
  return post?._embedded?.author?.[0]?.avatar_urls?.[48] ?? '/placeholder-news.svg'
}

export function normalizePost(post) {
  const title = stripHtml(post?.title?.rendered ?? '')
  const excerpt = truncateText(stripHtml(post?.excerpt?.rendered ?? ''), 120)
  const categories = getCategoriesFromPost(post)
  const primaryCategory = categories[0] ?? null

  return {
    id: post?.id,
    slug: post?.slug,
    title,
    excerpt,
    content: post?.content?.rendered ?? '',
    date: post?.date,
    authorName: getAuthorName(post),
    authorAvatar: getAuthorAvatar(post),
    featuredImage: getFeaturedImage(post),
    categories,
    primaryCategory,
  }
}

export function getCategoryColorClass(slug = '') {
  const map = {
    business: 'text-blue-600',
    politics: 'text-red-600',
    travel: 'text-green-600',
    opinion: 'text-purple-600',
  }

  return map[slug] ?? 'text-gray-600'
}
