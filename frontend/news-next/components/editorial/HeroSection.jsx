import ArticleCard from "./ArticleCard";
import LatestSidebar from "./LatestSidebar";
import CategoryTag from "./CategoryTag";
import { formatDate, truncateText } from "../../lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection({
  featuredPost,
  sidePosts = [],
  latestPosts = [],
}) {
  const leftCards = sidePosts.slice(0, 2);

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
        <article className="space-y-5 border-b border-slate-200 pb-6">
          <Link href={`/berita/${featuredPost.slug}`} className="block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-slate-100 shadow-editorial">
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
