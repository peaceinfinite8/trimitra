import ArticleCard from "./ArticleCard";
import Link from "next/link";

export default function CategorySection({
  categoryName,
  categorySlug,
  posts = [],
}) {
  return (
    <section className="space-y-5 border-b border-slate-200 pb-8">
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

      <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
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
  );
}
