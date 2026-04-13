import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getPostsByCategory } from '../../lib/wordpress'
import { formatDate } from '../../lib/utils'

export default async function CategoryArchivePage({ slug }) {
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const posts = await getPostsByCategory(category.id, 12)

  return (
    <main className="editorial-container py-10">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-[0.18em] text-gray-900">
          {category.name}
        </h1>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        {posts.map((post) => (
          <article key={post.id ?? post.slug}>
            <Link href={`/berita/${post.slug}`} className="block">
              <div className="relative aspect-video overflow-hidden rounded-[2px] bg-slate-100">
                <Image src={post.featuredImage} alt={post.title} fill className="object-cover" sizes="25vw" />
              </div>
            </Link>
            <div className="pt-3">
              <p className="text-xs font-bold uppercase text-[#0088cc]">{post.primaryCategory?.name ?? category.name}</p>
              <Link href={`/berita/${post.slug}`} className="block">
                <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-gray-900 hover:text-blue-700">
                  {post.title}
                </h2>
              </Link>
              <p className="mt-1 text-xs text-gray-400">{formatDate(post.date)}</p>
              <p className="mt-2 line-clamp-3 text-sm text-gray-500">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
