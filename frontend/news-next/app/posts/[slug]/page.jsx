import ArticleRoutePage from '../../../components/editorial/ArticleRoutePage'

export const revalidate = 60

export default async function PostsArticlePage({ params }) {
	return <ArticleRoutePage slug={params.slug} />
}
