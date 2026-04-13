import ArticleCard from './ArticleCard'
import Link from 'next/link'

export default function CategorySection({ categoryName, categorySlug, posts = [] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-800">{categoryName}</h2>
        <Link href={`/category/${categorySlug}`} className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Lihat Semua →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        {posts.slice(0, 4).map((post, idx) => (
          <ArticleCard
            key={post.id ?? post.slug}
            href={`/berita/${post.slug}`}
            image={post.featuredImage}
            imageAlt={post.title}
            categoryName={post.primaryCategory?.name ?? categoryName}
            categorySlug={post.primaryCategory?.slug ?? categorySlug}
            title={post.title}
            excerpt={post.excerpt}
            date={post.date}
          />
        ))}
      </div>
    </section>
  )
}
