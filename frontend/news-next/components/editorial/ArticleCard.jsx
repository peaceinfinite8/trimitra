import Image from "next/image";
import Link from "next/link";
import CategoryTag from "./CategoryTag";
import { formatDate, getCategoryToneClasses } from "../../lib/utils";

function TagGroup({ categories, categoryName, categorySlug, href }) {
  if (Array.isArray(categories) && categories.length > 0) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {categories.slice(0, 2).map((category) => (
          <CategoryTag
            key={category.id ?? category.slug ?? category.name}
            name={category.name}
            slug={category.slug}
            href={category.slug ? `/category/${category.slug}` : undefined}
          />
        ))}
      </div>
    );
  }

  if (!categoryName) return null;

  return <CategoryTag name={categoryName} slug={categorySlug} href={href} />;
}

export default function ArticleCard({
  href,
  image,
  imageAlt,
  categoryName,
  categorySlug,
  categories,
  title,
  excerpt,
  date,
  author,
  authorAvatar,
  variant = "grid",
}) {
  const isHero = variant === "hero";
  const isSmall = variant === "small";
  const isFeature = variant === "feature";
  const chipLabel = (
    categories?.[0]?.name ||
    categoryName ||
    categorySlug ||
    "News"
  ).toUpperCase();
  const chipToneClass = getCategoryToneClasses(categorySlug, categoryName);

  return (
    <article className={`group/article ${isSmall ? "h-full" : ""}`}>
      <div
        className={[
          "overflow-hidden border border-slate-200 bg-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition-all duration-300 ease-out group-hover/article:-translate-y-1.5 group-hover/article:shadow-[0_24px_40px_-24px_rgba(2,132,199,0.45)]",
          isSmall ? "flex h-full flex-col" : "",
          isHero
            ? "rounded-[1.35rem] sm:rounded-[1.55rem] lg:rounded-[1.75rem]"
            : "",
          isFeature
            ? "rounded-[1.2rem] sm:rounded-[1.35rem] lg:rounded-[1.5rem]"
            : "",
          isSmall
            ? "rounded-[0.95rem] sm:rounded-[1.1rem] lg:rounded-[1.2rem]"
            : "",
          !isHero && !isFeature && !isSmall
            ? "rounded-[1rem] sm:rounded-[1.15rem] lg:rounded-[1.25rem]"
            : "",
        ].join(" ")}
      >
        <Link href={href} className="block">
          <div
            className={[
              "news-photo-shell relative overflow-hidden rounded-t-[inherit] bg-slate-100",
              isHero ? "aspect-[4/5]" : "",
              isFeature ? "aspect-[5/4]" : "",
              isSmall ? "aspect-[16/11]" : "",
              !isHero && !isFeature && !isSmall ? "aspect-[16/10]" : "",
            ].join(" ")}
          >
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="news-photo-img object-cover transition-transform duration-500 ease-out group-hover/article:scale-[1.06]"
              sizes={isHero ? "36vw" : "20vw"}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/24 via-slate-900/0 to-white/14" />
            {!isSmall ? (
              <span
                className={`news-hover-chip pointer-events-none absolute left-5 top-5 z-[3] inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-[0.34rem] text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.16em] opacity-0 transition-all duration-300 group-hover/article:translate-y-0 group-hover/article:opacity-100 group-focus-within/article:translate-y-0 group-focus-within/article:opacity-100 ${chipToneClass}`}
              >
                {chipLabel}
              </span>
            ) : null}
          </div>
        </Link>

        <div
          className={
            isHero
              ? "px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4"
              : `px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3 ${isSmall ? "flex flex-1 flex-col" : ""}`
          }
        >
          {isSmall ? (
            <p
              className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-[0.34rem] text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.14em] ${chipToneClass}`}
            >
              {chipLabel}
            </p>
          ) : (
            <TagGroup
              categories={categories}
              categoryName={categoryName}
              categorySlug={categorySlug}
              href={categorySlug ? `/category/${categorySlug}` : undefined}
            />
          )}

          <Link href={href} className="block">
            <h2
              className={[
                "font-bold text-slate-900 transition-colors group-hover/article:text-sky-700",
                isHero ? "mt-3 text-4xl leading-[1.02] lg:text-5xl" : "",
                isFeature ? "mt-2.5 text-2xl leading-[1.08] lg:text-3xl" : "",
                isSmall
                  ? "mt-1.5 line-clamp-3 text-sm leading-snug lg:text-base"
                  : "",
                !isHero && !isFeature && !isSmall
                  ? "mt-2 text-base leading-snug line-clamp-2"
                  : "",
              ].join(" ")}
            >
              {title}
            </h2>
          </Link>

          {excerpt ? (
            <p
              className={[
                "mt-2 text-sm leading-6 text-slate-600",
                isHero ? "max-w-[60ch]" : "",
                isFeature ? "line-clamp-4" : "line-clamp-3",
                isSmall ? "hidden" : "",
              ].join(" ")}
            >
              {excerpt}
            </p>
          ) : null}

          <div
            className={
              isSmall
                ? "mt-auto pt-2 text-xs text-slate-500"
                : "mt-3 flex items-center gap-2 text-xs text-slate-500"
            }
          >
            <span>{formatDate(date)}</span>
            {author ? (
              <>
                <span aria-hidden="true">•</span>
                <span>by {author}</span>
              </>
            ) : null}
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={author || "Author"}
                width={24}
                height={24}
                className="ml-1 rounded-full object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
