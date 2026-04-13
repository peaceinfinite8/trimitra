import Link from 'next/link'

const navItems = [
  { label: 'Home', href: '/news' },
  { label: 'Posts', href: '/news' },
  { label: 'Business', href: '/category/business' },
  { label: 'Interview', href: '/category/interview' },
  { label: 'Politics', href: '/category/politics' },
  { label: 'Travel', href: '/category/travel' },
  { label: 'Author list', href: '/news' },
  { label: 'Pricing', href: '/news' },
  { label: 'Latest', href: '/news' },
  { label: 'Newsletter', href: '/news' },
]

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="editorial-container">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3 text-slate-500">
            <button aria-label="Open menu" className="rounded border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50">
              ☰
            </button>
            <span className="text-sm">⌕</span>
            <span className="text-sm">◌</span>
          </div>

          <Link href="/news" className="text-center text-3xl font-black tracking-[0.16em] text-slate-900">
            HAGUE
          </Link>

          <Link
            href="/news"
            className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Subscribe
          </Link>
        </div>

        <nav className="flex items-center justify-center gap-5 overflow-x-auto border-t border-slate-100 py-3 text-sm text-slate-600">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="whitespace-nowrap hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
