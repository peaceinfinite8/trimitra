import './globals.css'
import SiteHeader from '../components/editorial/SiteHeader'

export const metadata = {
  title: 'Hague Editorial News',
  description: 'Modern editorial news page powered by WordPress REST API.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
