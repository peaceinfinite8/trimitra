import ArticleCard from './ArticleCard'
import CategoryTag from './CategoryTag'
import Link from 'next/link'
import { formatDate, truncateText } from '../../lib/utils'
import Image from 'next/image'

export default function FeaturedCategorySection({ categoryName, categorySlug, posts = [] }) {
  const [featured, ...rest] = posts
  const rightPosts = rest.slice(0, 4)

  if (!featured) return null

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-800">{categoryName}</h2>
        <Link href={`/category/${categorySlug}`} className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Lihat Semua →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] sm:grid-cols-1">
        <article className="space-y-4">
          <Link href={`/berita/${featured.slug}`} className="block">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shadow-editorial">
              <Image
                src={featured.featuredImage}
                alt={featured.title}
                fill
                sizes="55vw"
                className="object-cover"
              />
            </div>
          </Link>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {featured.categories.slice(0, 2).map((category) => (
                <CategoryTag
                  key={category.id ?? category.slug}
                  name={category.name}
                  slug={category.slug}
                  href={`/category/${category.slug}`}
                />
              ))}
            </div>

            <Link href={`/berita/${featured.slug}`} className="block">
              <h2 className="text-3xl font-bold leading-[1.08] text-gray-900 lg:text-4xl">
                {featured.title}
              </h2>
            </Link>

            <p className="max-w-[68ch] text-sm leading-7 text-slate-600 line-clamp-4">
              {truncateText(featured.excerpt, 180)}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{formatDate(featured.date)}</span>
              <span className="flex items-center gap-2">
                <Image
                  src={featured.authorAvatar}
                  alt={featured.authorName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
                by {featured.authorName}
              </span>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-2 gap-4">
          {rightPosts.map((post) => (
            <ArticleCard
              key={post.id ?? post.slug}
              href={`/berita/${post.slug}`}
              image={post.featuredImage}
              imageAlt={post.title}
              categoryName={post.primaryCategory?.name ?? categoryName}
              categorySlug={post.primaryCategory?.slug ?? categorySlug}
              title={post.title}
              date={post.date}
              variant="small"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
