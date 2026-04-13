import HeroSection from './HeroSection'
import CategorySection from './CategorySection'
import FeaturedCategorySection from './FeaturedCategorySection'
import { getCategories, getPosts, getPostsByCategory } from '../../lib/wordpress'

function pickFeaturedCategory(categories) {
  return (
    categories.find((category) => ['politics', 'politik'].includes(category.slug)) ??
    categories[0] ??
    null
  )
}

async function loadEditorialData() {
  try {
    const [posts, categories] = await Promise.all([getPosts({ per_page: '20' }), getCategories()])

    const visibleCategories = categories.filter((category) => category.count > 0).slice(0, 4)
    const categoryPostMap = Object.fromEntries(
      await Promise.all(
        visibleCategories.map(async (category) => [category.id, await getPostsByCategory(category.id, 8)]),
      ),
    )

    const featuredCategory = pickFeaturedCategory(categories)
    const featuredCategoryPosts = featuredCategory ? await getPostsByCategory(featuredCategory.id, 8) : []

    return {
      featuredCategory,
      featuredCategoryPosts,
      categoryPostMap,
      visibleCategories,
      posts,
      error: null,
    }
  } catch (error) {
    return {
      error,
    }
  }
}

export default async function EditorialNewsPage() {
  const data = await loadEditorialData()

  if (data.error) {
    return (
      <main className="editorial-container py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
          <h1 className="text-2xl font-bold">WordPress API belum siap</h1>
          <p className="mt-3 text-sm leading-6">
            Isi <span className="font-semibold">WP_API_URL</span> di file .env.local untuk
            menampilkan data berita dari WordPress REST API.
          </p>
          <p className="mt-4 text-sm text-amber-700">{data.error.message}</p>
        </div>
      </main>
    )
  }

  const { featuredCategory, featuredCategoryPosts, categoryPostMap, visibleCategories, posts } = data
  const featuredPost = posts[0] ?? null
  const sidePosts = posts.slice(1, 3)
  const latestPosts = posts.slice(3, 8)

  return (
    <main className="bg-[#f8f7f3]">
      <section className="border-b border-slate-200 bg-white">
        <div className="editorial-container py-8 lg:py-12">
          <HeroSection featuredPost={featuredPost} sidePosts={sidePosts} latestPosts={latestPosts} />
        </div>
      </section>

      <div className="editorial-container space-y-16 py-10 lg:py-14">
        {visibleCategories.map((category) => (
          <CategorySection
            key={category.id}
            categoryName={category.name}
            categorySlug={category.slug}
            posts={categoryPostMap[category.id] ?? []}
          />
        ))}

        {featuredCategory ? (
          <FeaturedCategorySection
            categoryName={featuredCategory.name}
            categorySlug={featuredCategory.slug}
            posts={featuredCategoryPosts}
          />
        ) : null}
      </div>
    </main>
  )
}
