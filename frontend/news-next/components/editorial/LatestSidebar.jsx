import Image from "next/image";
import Link from "next/link";
import { formatDate, getCategoryToneClasses } from "../../lib/utils";

export default function LatestSidebar({ posts = [] }) {
  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 news-latest-divider">
        <span className="news-latest-title text-xs font-bold uppercase tracking-[0.25em] text-slate-800">
          Latest
        </span>
      </div>

      <div className="space-y-5">
        {posts.slice(0, 5).map((post, index) => (
          <article
            key={post.id ?? post.slug}
            className={`group/latest news-latest-item relative rounded-2xl px-3 py-2 transition-colors duration-300 hover:bg-white ${index > 0 ? "border-t border-slate-200 pt-5" : ""}`.trim()}
          >
            <span className="pointer-events-none absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-sky-500 opacity-0 transition-all duration-300 group-hover/latest:translate-x-1 group-hover/latest:opacity-100 group-focus-within/latest:translate-x-1 group-focus-within/latest:opacity-100" />
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-[0.34rem] text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.14em] ${getCategoryToneClasses(
                    post.primaryCategory?.slug,
                    post.primaryCategory?.name,
                  )}`}
                >
                  {(post.primaryCategory?.name || "News").toUpperCase()}
                </p>
                <Link href={`/berita/${post.slug}`} className="block">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover/latest:text-sky-700">
                    {post.title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(post.date)}
                </p>
              </div>
              <Link
                href={`/berita/${post.slug}`}
                className="news-photo-shell relative h-[68px] w-[88px] shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-900/10 shadow-[0_10px_18px_-16px_rgba(15,23,42,0.45)]"
              >
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  sizes="80px"
                  className="news-photo-img object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/26 via-transparent to-white/14" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
