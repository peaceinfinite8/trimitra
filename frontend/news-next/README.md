# Hague Editorial News

Next.js App Router implementation for a modern editorial news page powered by the WordPress REST API.

## Stack

- Next.js App Router
- Next.js 15
- Tailwind CSS
- WordPress REST API
- `next/image` for remote WordPress images
- ISR with `revalidate: 60`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set your WordPress API URL in `.env.local`:

```bash
WP_API_URL=https://your-wordpress-site.com
```

3. Run the app:

```bash
npm run dev
```

## Routes

- `/news` and `/berita` - editorial homepage
- `/news/[slug]` and `/berita/[slug]` - article detail
- `/posts/[slug]` - article detail alias
- `/category/[slug]` - category archive

## Notes

- The layout follows the attached Hague-style magazine reference.
- Missing featured images fall back to `public/placeholder-news.svg`.
- Excerpts are stripped of HTML before rendering.
