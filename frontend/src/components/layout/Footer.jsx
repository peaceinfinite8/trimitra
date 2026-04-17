import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { prefetchRoute } from '../../app/routePrefetch'

const socialItems = [
  { label: 'Twitter', href: 'https://x.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]

const brandSocialItems = [
  { label: 'Instagram', icon: 'instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com' },
  { label: 'Email', icon: 'email', href: 'mailto:dhr@trimitramulti.co.id' },
]

function BrandSocialIcon({ type }) {
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" role="presentation" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (type === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" fill="none" role="presentation" aria-hidden="true">
        <path d="M7.8 10.2v6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="7.8" cy="7.6" r="1.2" fill="currentColor" />
        <path d="M11.8 16.4v-3.4a2 2 0 0 1 3.9 0v3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" role="presentation" aria-hidden="true">
      <rect x="4.8" y="7" width="14.4" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 8.3 12 12.5l6-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const socialListVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const socialItemVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function Footer() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <footer className="site-footer">
      <div className="site-footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" role="presentation">
          <defs>
            <linearGradient id="footerWaveBase" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--cta-footer-wave-base-start)" stopOpacity="0.12" />
              <stop offset="38%" stopColor="var(--cta-footer-wave-base-mid)" stopOpacity="0.28" />
              <stop offset="72%" stopColor="var(--cta-footer-wave-base-mid)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--cta-footer-wave-base-end)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="footerWaveSoft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--cta-footer-wave-soft-start)" stopOpacity="0.08" />
              <stop offset="48%" stopColor="var(--cta-footer-wave-soft-mid)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--cta-footer-wave-soft-end)" stopOpacity="0.07" />
            </linearGradient>
            <linearGradient id="footerWaveLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--cta-footer-wave-line)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--cta-footer-wave-line)" stopOpacity="0.34" />
              <stop offset="100%" stopColor="var(--cta-footer-wave-line)" stopOpacity="0" />
            </linearGradient>
            <filter id="footerWaveBlur" x="-10%" y="-60%" width="120%" height="240%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <path
            className="site-footer-wave-mass"
            d="M0,108 C172,154 356,162 542,146 C746,128 892,82 1070,88 C1222,94 1340,132 1440,102 L1440,220 L0,220 Z"
            fill="url(#footerWaveBase)"
          />
          <path
            className="site-footer-wave-soft"
            d="M0,124 C164,92 330,84 508,102 C714,124 902,162 1096,162 C1248,162 1360,142 1440,122 L1440,216 L0,216 Z"
            fill="url(#footerWaveSoft)"
            filter="url(#footerWaveBlur)"
          />
          <path
            className="site-footer-wave-line"
            d="M0,118 C178,160 350,166 536,148 C730,130 888,92 1062,96 C1212,98 1328,126 1440,142"
            fill="none"
            stroke="url(#footerWaveLine)"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      <div className="container footer-grid">
        <section className="footer-brand">
          <div className="footer-brand-head">
            <img className="footer-brand-logo" src="/logo-trimitra.webp" alt="Logo Trimitra" />
          </div>
          <p>
            Mendefinisikan ulang standar arsitektur temporer melalui presisi
            teknik dan estetika modern sejak 2017.
          </p>
          <motion.div
            className="footer-social-icons"
            variants={socialListVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? {} : 'show'}
            aria-label="Brand social links"
          >
            {brandSocialItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                className="social-orb"
                aria-label={item.label}
                variants={socialItemVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
                whileFocus={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
              >
                <span className="social-orb-core" aria-hidden="true">
                  <BrandSocialIcon type={item.icon} />
                </span>
                <span className="social-orb-label">{item.label}</span>
              </motion.a>
            ))}
          </motion.div>
        </section>

        <section>
          <h4>Layanan</h4>
          <ul>
            <li><Link to="/layanan#advertising-billboard" onMouseEnter={() => prefetchRoute('/layanan')} data-prefetch-route="/layanan">Advertising (Billboard)</Link></li>
            <li><Link to="/layanan#event-organizer" onMouseEnter={() => prefetchRoute('/layanan')} data-prefetch-route="/layanan">Event Organizer</Link></li>
            <li><Link to="/layanan#booth-exhibition" onMouseEnter={() => prefetchRoute('/layanan')} data-prefetch-route="/layanan">Booth Exhibition</Link></li>
          </ul>
        </section>

        <section>
          <h4>Perusahaan</h4>
          <ul>
            <li><Link to="/tentang-kami" onMouseEnter={() => prefetchRoute('/tentang-kami')} data-prefetch-route="/tentang-kami">Tentang Kami</Link></li>
            <li><Link to="/kontak-kami" onMouseEnter={() => prefetchRoute('/kontak-kami')} data-prefetch-route="/kontak-kami">Kontak</Link></li>
            <li><Link to="/kebijakan-privasi" onMouseEnter={() => prefetchRoute('/kebijakan-privasi')} data-prefetch-route="/kebijakan-privasi">Kebijakan Privasi</Link></li>
            <li><Link to="/syarat-layanan" onMouseEnter={() => prefetchRoute('/syarat-layanan')} data-prefetch-route="/syarat-layanan">Syarat Layanan</Link></li>
          </ul>
        </section>

        <section>
          <h4>Hubungi Kami</h4>
          <ul>
            <li>Tirtajaya, Kec. Sukmajaya, Kota Depok, Jawa Barat 16413</li>
            <li><a href="tel:+62217894561">+62 21 789 4561</a></li>
            <li><a href="mailto:dhr@trimitramulti.co.id">dhr@trimitramulti.co.id</a></li>
          </ul>
        </section>
      </div>

      <div className="container footer-bottom">
        <div className="footer-copy">
          © 2026 PT Trimitra Multi Kreasi. Seluruh hak cipta dilindungi.
        </div>
        <motion.div
          className="footer-social-pills"
          variants={socialListVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? {} : 'show'}
          aria-label="Social media"
        >
          {socialItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="social-pill"
              variants={socialItemVariants}
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileFocus={prefersReducedMotion ? undefined : { y: -2 }}
            >
              <span className="social-pill-dot" aria-hidden="true" />
              <span className="social-pill-label">{item.label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
