import ArticleCard from './ArticleCard'
import LatestSidebar from './LatestSidebar'
import CategoryTag from './CategoryTag'
import { formatDate, truncateText } from '../../lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection({ featuredPost, sidePosts = [], latestPosts = [] }) {
  const leftCards = sidePosts.slice(0, 2)

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_3fr_1fr] md:grid-cols-2 sm:grid-cols-1">
      <div className="space-y-8">
        {leftCards.map((post) => (
          <ArticleCard
            key={post.id ?? post.slug}
            href={`/berita/${post.slug}`}
            image={post.featuredImage}
            imageAlt={post.title}
            categoryName={post.primaryCategory?.name}
            categorySlug={post.primaryCategory?.slug}
            title={post.title}
            date={post.date}
            variant="small"
          />
        ))}
      </div>

      {featuredPost ? (
        <article className="border-b border-slate-200 pb-6">
          <Link href={`/berita/${featuredPost.slug}`} className="block">
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 shadow-editorial">
              <Image
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                fill
                priority
                sizes="40vw"
                className="object-cover"
              />
            </div>
          </Link>
          <div className="mx-auto max-w-[760px] pt-5 text-center">
            <CategoryTag
              name={featuredPost.primaryCategory?.name ?? 'News'}
              slug={featuredPost.primaryCategory?.slug}
            />
            <Link href={`/berita/${featuredPost.slug}`} className="block">
              <h1 className="mt-4 text-4xl font-bold leading-[1.05] text-gray-900 lg:text-5xl">
                {featuredPost.title}
              </h1>
            </Link>
            <p className="mx-auto mt-4 max-w-[60ch] text-sm leading-7 text-slate-600">
              {truncateText(featuredPost.excerpt, 120)}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>{formatDate(featuredPost.date)}</span>
              <span>by {featuredPost.authorName}</span>
            </div>
          </div>
        </article>
      ) : null}

      <LatestSidebar posts={latestPosts} />
    </section>
  )
}
