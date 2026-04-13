import ArticleCard from "./ArticleCard";
import CategoryTag from "./CategoryTag";
import Link from "next/link";
import { formatDate, truncateText } from "../../lib/utils";
import Image from "next/image";

export default function FeaturedCategorySection({
  categoryName,
  categorySlug,
  posts = [],
}) {
  const [featured, ...rest] = posts;
  const rightPosts = rest.slice(0, 4);

  if (!featured) return null;

  return (
    <section className="space-y-5 pb-6">
      <div className="news-section-divider flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="news-section-title text-xs font-bold uppercase tracking-[0.22em] text-slate-900">
          {categoryName}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="news-section-link text-sm font-medium text-sky-700 transition-colors hover:text-sky-800"
        >
          Lihat Semua →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2.15fr_1fr] sm:grid-cols-1">
        <article className="space-y-4">
          <Link href={`/berita/${featured.slug}`} className="block">
            <div className="news-photo-shell relative aspect-[5/4] overflow-hidden rounded-[2.4rem_1rem_2.6rem_1rem] bg-slate-100 ring-1 ring-slate-900/10 shadow-[0_28px_48px_-30px_rgba(14,116,144,0.5)]">
              <Image
                src={featured.featuredImage}
                alt={featured.title}
                fill
                sizes="55vw"
                className="news-photo-img object-cover transition-transform duration-700 ease-out hover:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/0 to-cyan-100/25" />
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
              <h2 className="text-3xl font-black leading-[1.05] text-slate-900 lg:text-4xl">
                {featured.title}
              </h2>
            </Link>

            <p className="max-w-[68ch] text-sm leading-7 text-slate-600 line-clamp-4">
              {truncateText(featured.excerpt, 180)}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500">
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

        <div className="grid grid-cols-1 gap-4 sm:auto-rows-fr sm:grid-cols-2">
          {rightPosts.map((post, idx) => (
            <div key={post.id ?? post.slug} className="h-full">
              <ArticleCard
                href={`/berita/${post.slug}`}
                image={post.featuredImage}
                imageAlt={post.title}
                categoryName={post.primaryCategory?.name ?? categoryName}
                categorySlug={post.primaryCategory?.slug ?? categorySlug}
                title={post.title}
                date={post.date}
                variant={idx === 0 ? "feature" : "small"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
