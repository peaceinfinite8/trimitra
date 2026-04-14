import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "../../lib/wordpress";
import CategoryTag from "./CategoryTag";
import { formatDate, truncateText } from "../../lib/utils";

function getReadingTime(content = "") {
  const plain = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain ? plain.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

const WHATSAPP_NUMBER = "62811109842";

export default async function ArticleDetailPage({ slug }) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Halo Tim Trimitra, saya baru membaca artikel Anda dan ingin konsultasi terkait kebutuhan booth/event saya.",
  )}`;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const latestPosts = await getPosts({ per_page: "9" });
  const currentCategoryIds = new Set(
    (post.categories ?? []).map((cat) => cat.id),
  );

  const relatedPosts = latestPosts
    .filter((item) => item.slug !== post.slug)
    .filter((item) =>
      (item.categories ?? []).some((cat) => currentCategoryIds.has(cat.id)),
    )
    .slice(0, 5);

  const fallbackPosts = latestPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 5);

  const sidebarPosts = relatedPosts.length > 0 ? relatedPosts : fallbackPosts;
  const popularPosts = latestPosts
    .filter((item) => item.slug !== post.slug)
    .slice(5, 9);

  const topicMap = new Map();
  [...(post.categories ?? []), ...latestPosts.flatMap((item) => item.categories ?? [])].forEach(
    (category) => {
      if (!category?.slug || topicMap.has(category.slug)) return;
      topicMap.set(category.slug, category);
    },
  );
  const topicTags = Array.from(topicMap.values()).slice(0, 10);

  const readingTime = getReadingTime(post.content);

  return (
    <main className="bg-[linear-gradient(120deg,#d8edf9_0%,#d8edf9_45%,#e5e7f5_100%)]">
      <section className="editorial-container py-8 lg:py-10">
        <div className="mb-6 space-y-4 border-b border-slate-300/55 pb-5">
          <Link
            href="/berita"
            className="inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800 hover:underline"
          >
            {"<-"} Kembali ke Berita
          </Link>

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

          <h1 className="max-w-5xl text-3xl font-black leading-[1.06] text-slate-900 sm:text-4xl lg:text-[4rem]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{readingTime}</span>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)] lg:items-start">
          <article className="min-w-0 space-y-6 rounded-2xl border border-slate-200/75 bg-white/92 p-5 shadow-[0_22px_52px_-36px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="news-photo-shell relative aspect-[16/9] overflow-hidden rounded-[1.35rem] bg-slate-100">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="news-photo-img object-cover"
                sizes="(max-width: 1024px) 100vw, 68vw"
                priority
              />
            </div>

            {post.excerpt ? (
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                {truncateText(post.excerpt, 220)}
              </p>
            ) : null}

            <div className="flex items-center gap-3 border-y border-slate-200 py-3 text-sm text-slate-500">
              <Image
                src={post.authorAvatar}
                alt={post.authorName}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="font-medium text-slate-700">
                {post.authorName}
              </span>
            </div>

            <div
              className="article-content space-y-6 text-base leading-8 text-slate-700 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-slate-900 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:shadow-sm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-slate-200/75 bg-white/96 p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.5)]">
              <h2 className="mb-3 text-lg font-bold text-slate-900">
                Related Articles
              </h2>
              <div className="space-y-3">
                {sidebarPosts.map((item) => (
                  <Link
                    key={item.id ?? item.slug}
                    href={`/berita/${item.slug}`}
                    className="group/related grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
                  >
                    <div className="news-photo-shell relative h-[72px] overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        sizes="88px"
                        className="news-photo-img object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-slate-900 group-hover/related:text-sky-700">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.primaryCategory?.name || "News"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {popularPosts.length > 0 ? (
              <section className="rounded-2xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f3f9ff_100%)] p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.5)]">
                <h3 className="mb-3 text-base font-bold text-slate-900">
                  Artikel Populer
                </h3>
                <div className="space-y-3">
                  {popularPosts.map((item, index) => (
                    <Link
                      key={item.id ?? item.slug}
                      href={`/berita/${item.slug}`}
                      className="group/popular flex items-start justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover/popular:text-sky-700">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(item.date)}
                        </p>
                      </div>
                      <span className="mt-1 text-sm font-semibold text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {topicTags.length > 0 ? (
              <section className="rounded-2xl border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f3fffb_100%)] p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.5)]">
                <h3 className="mb-3 text-base font-bold text-slate-900">Tag Topik</h3>
                <div className="flex flex-wrap gap-2">
                  {topicTags.map((tag) => (
                    <Link
                      key={tag.id ?? tag.slug}
                      href={`/category/${tag.slug}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-sky-200 bg-[linear-gradient(165deg,#ffffff_0%,#eef7ff_100%)] p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.5)]">
              <h3 className="text-base font-bold text-slate-900">
                Butuh Konsep Booth yang Menarik?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tim Trimitra siap bantu Anda dari ide, desain, sampai eksekusi
                event.
              </p>
              <Link
                href="/kontak-kami"
                className="mt-4 inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Konsultasi Gratis
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
              >
                Chat WhatsApp
              </a>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
