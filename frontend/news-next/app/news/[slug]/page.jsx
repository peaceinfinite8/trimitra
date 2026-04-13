import ArticleRoutePage from '../../../components/editorial/ArticleRoutePage'
import { getPostBySlug } from '../../../lib/wordpress'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Article not found | Hague Editorial News',
    }
  }

  return {
    title: `${post.title} | Hague Editorial News`,
    description: post.excerpt,
  }
}

export default async function NewsArticlePage({ params }) {
  return <ArticleRoutePage slug={params.slug} />
}
