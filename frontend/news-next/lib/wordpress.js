import { normalizePost } from './utils'

const API_BASE =
  globalThis.process?.env?.WP_API_URL?.replace(/\/$/, '') ?? ''

function ensureApiBase() {
  if (!API_BASE) {
    throw new Error('WP_API_URL is not configured')
  }
}

async function wpJson(path, params = {}, revalidate = 60) {
  ensureApiBase()
  const query = new URLSearchParams({ _embed: '1', ...params })
  const response = await fetch(`${API_BASE}${path}?${query.toString()}`, {
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(`WordPress request failed: ${response.status}`)
  }

  return response.json()
}

export async function getPosts(params = {}) {
  const posts = await wpJson(
    '/wp-json/wp/v2/posts',
    { per_page: '20', orderby: 'date', order: 'desc', ...params },
    60,
  )
  return posts.map(normalizePost)
}

export async function getPostsByCategory(categoryId, perPage = 8) {
  const posts = await wpJson(
    '/wp-json/wp/v2/posts',
    { categories: String(categoryId), per_page: String(perPage), orderby: 'date', order: 'desc' },
    60,
  )
  return posts.map(normalizePost)
}

export async function getCategories() {
  ensureApiBase()
  const response = await fetch(`${API_BASE}/wp-json/wp/v2/categories?per_page=10&orderby=count&order=desc`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`WordPress categories request failed: ${response.status}`)
  }

  return response.json()
}

export async function getCategoryBySlug(slug) {
  const categories = await getCategories()
  return categories.find((category) => category.slug === slug) ?? null
}

export async function getPostBySlug(slug) {
  const posts = await wpJson('/wp-json/wp/v2/posts', { slug, per_page: '1', orderby: 'date', order: 'desc' }, 60)
  return posts[0] ? normalizePost(posts[0]) : null
}
