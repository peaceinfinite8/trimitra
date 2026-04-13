import CategoryArchivePage from '../../../components/editorial/CategoryArchivePage'
import { getCategoryBySlug } from '../../../lib/wordpress'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    return {
      title: 'Category not found | Hague Editorial News',
    }
  }

  return {
    title: `${category.name} | Hague Editorial News`,
    description: `Browse the latest stories in ${category.name}.`,
  }
}

export default async function CategoryPage({ params }) {
  return <CategoryArchivePage slug={params.slug} />
}
