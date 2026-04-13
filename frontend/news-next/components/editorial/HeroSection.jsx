import ArticleCard from "./ArticleCard";
import LatestSidebar from "./LatestSidebar";
import CategoryTag from "./CategoryTag";
import {
  formatDate,
  getCategoryToneClasses,
  truncateText,
} from "../../lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection({
  featuredPost,
  sidePosts = [],
  latestPosts = [],
}) {
  const leftCards = sidePosts.slice(0, 2);
  const heroChipToneClass = getCategoryToneClasses(
    featuredPost?.primaryCategory?.slug,
    featuredPost?.primaryCategory?.name,
  );

  return (
    <section className="grid gap-7 lg:grid-cols-[0.95fr_minmax(0,2.45fr)_1fr] md:grid-cols-2 sm:grid-cols-1">
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
        <article className="group/hero space-y-5 border-b border-slate-200 pb-6">
          <Link href={`/berita/${featuredPost.slug}`} className="block">
            <div className="news-photo-shell relative aspect-[4/5] overflow-hidden rounded-[1.35rem] sm:rounded-[1.6rem] lg:rounded-[1.9rem] bg-slate-100 ring-1 ring-slate-900/10 shadow-[0_22px_40px_-28px_rgba(14,116,144,0.5)] transition-all duration-300 group-hover/hero:-translate-y-1 group-hover/hero:shadow-[0_34px_52px_-28px_rgba(14,116,144,0.55)]">
              <Image
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                fill
                priority
                sizes="40vw"
                className="news-photo-img object-cover transition-transform duration-500 ease-out group-hover/hero:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/42 via-slate-900/0 to-white/20" />
              <span
                className={`news-hover-chip pointer-events-none absolute left-5 top-5 z-[3] inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-[0.34rem] text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.16em] opacity-0 transition-all duration-300 group-hover/hero:translate-y-0 group-hover/hero:opacity-100 group-focus-within/hero:translate-y-0 group-focus-within/hero:opacity-100 ${heroChipToneClass}`}
              >
                {(featuredPost.primaryCategory?.name || "News").toUpperCase()}
              </span>
            </div>
          </Link>
          <div className="mx-auto max-w-[760px] pb-1 text-center">
            <CategoryTag
              name={featuredPost.primaryCategory?.name ?? "News"}
              slug={featuredPost.primaryCategory?.slug}
              className="news-hero-kicker"
            />
            <Link href={`/berita/${featuredPost.slug}`} className="block">
              <h1 className="news-page-title mt-4 text-4xl font-black leading-[1.05] lg:text-5xl">
                {featuredPost.title}
              </h1>
            </Link>
            <p className="mx-auto mt-4 max-w-[60ch] text-sm leading-7 text-slate-600">
              {truncateText(featuredPost.excerpt, 120)}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span>{formatDate(featuredPost.date)}</span>
              <span>by {featuredPost.authorName}</span>
            </div>
          </div>
        </article>
      ) : null}

      <LatestSidebar posts={latestPosts} />
    </section>
  );
}
