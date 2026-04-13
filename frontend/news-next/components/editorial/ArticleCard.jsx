import Image from "next/image";
import Link from "next/link";
import CategoryTag from "./CategoryTag";
import { formatDate } from "../../lib/utils";

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

  return (
    <article className="group">
      <Link href={href} className="block">
        <div
          className={[
            "relative overflow-hidden bg-slate-100 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5",
            isHero ? "aspect-[3/4] rounded-[2px]" : "",
            isFeature ? "aspect-[4/3] rounded-[2px]" : "",
            isSmall ? "aspect-video rounded-[2px]" : "",
            !isHero && !isFeature && !isSmall
              ? "aspect-video rounded-[2px]"
              : "",
          ].join(" ")}
        >
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={isHero ? "36vw" : "20vw"}
          />
        </div>
      </Link>

      <div className={isHero ? "pt-5" : "pt-3"}>
        <TagGroup
          categories={categories}
          categoryName={categoryName}
          categorySlug={categorySlug}
          href={categorySlug ? `/category/${categorySlug}` : undefined}
        />

        <Link href={href} className="block">
          <h2
            className={[
              "font-bold text-slate-900 transition-colors group-hover:text-sky-700",
              isHero ? "mt-3 text-4xl leading-[1.02] lg:text-5xl" : "",
              isFeature ? "mt-3 text-2xl leading-[1.08] lg:text-3xl" : "",
              isSmall ? "mt-2 text-sm leading-snug lg:text-base" : "",
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
              ? "mt-1 text-xs text-slate-500"
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
    </article>
  );
}
