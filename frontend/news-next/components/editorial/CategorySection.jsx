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

      <div className="grid gap-5 lg:grid-cols-12 md:grid-cols-2 sm:grid-cols-1">
        {posts.slice(0, 4).map((post, idx) => (
          <div
            key={post.id ?? post.slug}
            className={[
              idx === 0 ? "lg:col-span-7" : "",
              idx === 1 ? "lg:col-span-5 lg:pt-5" : "",
              idx === 2 ? "lg:col-span-5 lg:-mt-2" : "",
              idx === 3 ? "lg:col-span-7" : "",
            ].join(" ")}
          >
            <ArticleCard
              href={`/berita/${post.slug}`}
              image={post.featuredImage}
              imageAlt={post.title}
              categoryName={post.primaryCategory?.name ?? categoryName}
              categorySlug={post.primaryCategory?.slug ?? categorySlug}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              variant={idx === 0 || idx === 3 ? "feature" : "grid"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
