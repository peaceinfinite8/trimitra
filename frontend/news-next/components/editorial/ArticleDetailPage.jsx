import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '../../lib/wordpress'
import CategoryTag from './CategoryTag'
import { formatDate, truncateText } from '../../lib/utils'

export default async function ArticleDetailPage({ slug }) {
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="editorial-container py-10">
      <article className="mx-auto max-w-4xl space-y-6">
        <Link href="/news" className="text-sm text-blue-600 hover:underline">
          ← Back to News
        </Link>

        <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-slate-100">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" sizes="100vw" priority />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {post.categories.slice(0, 2).map((category) => (
              <CategoryTag
                key={category.id ?? category.slug}
                name={category.name}
                slug={category.slug}
                href={`/category/${category.slug}`}
              />
            ))}
          </div>
          <h1 className="text-4xl font-bold leading-tight text-gray-900">{post.title}</h1>
          {post.excerpt ? (
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              {truncateText(post.excerpt, 180)}
            </p>
          ) : null}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-2">
              <Image
                src={post.authorAvatar}
                alt={post.authorName}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
              by {post.authorName}
            </span>
          </div>
        </div>

        <div
          className="space-y-6 text-base leading-8 text-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  )
}
