import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '../../lib/utils'

export default function LatestSidebar({ posts = [] }) {
  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-800\">Latest</span>
      </div>

      <div className="space-y-5">
        {posts.slice(0, 5).map((post, index) => (
          <article key={post.id ?? post.slug} className={index > 0 ? 'border-t border-slate-200 pt-5' : ''}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <Link href={`/berita/${post.slug}`} className="block">
                  <h3 className="text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-blue-700">
                    {post.title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-gray-400">{formatDate(post.date)}</p>
              </div>
              <Link href={`/berita/${post.slug}`} className="relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-[2px] bg-slate-100">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </aside>
  )
}
