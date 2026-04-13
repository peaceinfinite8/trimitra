import EditorialNewsPage from '../../components/editorial/EditorialNewsPage'

export const revalidate = 60

export const metadata = {
  title: 'Berita | Hague Editorial News',
  description: 'Modern editorial news layout powered by WordPress REST API.',
}

export default async function BeritaPage() {
  return <EditorialNewsPage />
}
