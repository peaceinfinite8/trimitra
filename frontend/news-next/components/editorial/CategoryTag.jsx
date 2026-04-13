import Link from 'next/link'
import { getCategoryColorClass } from '../../lib/utils'

export default function CategoryTag({ name, slug, href, className = '' }) {
  const colorClass = getCategoryColorClass(slug)
  const classes = `${colorClass} text-xs font-bold uppercase tracking-[0.18em] ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={classes}>
        {name}
      </Link>
    )
  }

  return <span className={classes}>{name}</span>
}
