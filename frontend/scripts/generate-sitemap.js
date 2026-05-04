/**
 * generate-sitemap.js
 *
 * Fetches all published posts from WordPress REST API and generates
 * a valid XML sitemap at dist/sitemap.xml after vite build.
 *
 * Run: node scripts/generate-sitemap.js
 * Or via npm script: "build": "vite build && node scripts/generate-sitemap.js"
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE_DOMAIN = 'https://trimitramulti.co.id'
const WP_API = 'https://cms.trimitramulti.co.id/wp-json/wp/v2'
const OUTPUT_PATH = join(__dirname, '../dist/sitemap.xml')

// Static pages — update if routes change
const STATIC_PAGES = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/tentang-kami', priority: '0.8', changefreq: 'monthly' },
    { loc: '/layanan', priority: '0.9', changefreq: 'monthly' },
    { loc: '/galeri', priority: '0.8', changefreq: 'weekly' },
    { loc: '/berita', priority: '0.8', changefreq: 'daily' },
    { loc: '/kontak-kami', priority: '0.7', changefreq: 'monthly' },
]

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function toIsoDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0]
    return new Date(dateStr).toISOString().split('T')[0]
}

async function fetchAllPosts() {
    const posts = []
    let page = 1
    const perPage = 100

    while (true) {
        const url = `${WP_API}/posts?per_page=${perPage}&page=${page}&_fields=slug,modified&status=publish`
        console.log(`  Fetching posts page ${page}…`)

        let res
        try {
            res = await fetch(url)
        } catch (err) {
            console.warn(`  Warning: failed to fetch posts (${err.message}). Skipping post URLs.`)
            break
        }

        if (!res.ok) {
            if (res.status === 400) break // no more pages
            console.warn(`  Warning: WP API returned ${res.status}. Skipping post URLs.`)
            break
        }

        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) break

        posts.push(...data)

        const totalPages = Number(res.headers.get('X-WP-TotalPages') || '1')
        if (page >= totalPages) break
        page++
    }

    return posts
}

function buildSitemap(staticPages, posts) {
    const now = new Date().toISOString().split('T')[0]

    const staticEntries = staticPages.map(({ loc, priority, changefreq }) => `
  <url>
    <loc>${escapeXml(BASE_DOMAIN + loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')

    const postEntries = posts.map(({ slug, modified }) => `
  <url>
    <loc>${escapeXml(`${BASE_DOMAIN}/berita/${slug}`)}</loc>
    <lastmod>${toIsoDate(modified)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${postEntries}
</urlset>
`.trim()
}

async function main() {
    console.log('🗺  Generating sitemap.xml…')

    console.log('  Fetching WordPress posts…')
    const posts = await fetchAllPosts()
    console.log(`  Found ${posts.length} post(s).`)

    const xml = buildSitemap(STATIC_PAGES, posts)

    writeFileSync(OUTPUT_PATH, xml, 'utf-8')
    console.log(`✅ sitemap.xml written to ${OUTPUT_PATH}`)
    console.log(`   Total URLs: ${STATIC_PAGES.length + posts.length}`)
}

main().catch((err) => {
    console.error('❌ Failed to generate sitemap:', err)
    process.exit(1)
})
