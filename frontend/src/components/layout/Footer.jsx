import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import { prefetchRoute } from '../../app/routePrefetch'

const socialItems = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@trimitraorganizer' },
  { label: 'Instagram', href: 'https://www.instagram.com/trimitra_organizer/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dharmawan-5a4253319/' },
]

const brandSocialItems = [
  { label: 'TikTok', icon: 'tiktok', href: 'https://www.tiktok.com/@trimitraorganizer' },
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/trimitra_organizer/' },
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/dharmawan-5a4253319/' },
]

function BrandSocialIcon({ type }) {
  if (type === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" fill="none" role="presentation" aria-hidden="true">
        <path d="M13 5.5v8.1a3.8 3.8 0 1 1-3.5-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 5.5c.8 1.9 2.2 3.2 4.3 3.6v2.2c-1.4-.1-2.7-.6-3.8-1.4v4.6a5.7 5.7 0 1 1-5-5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

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
        <path d="M6.5 9.5V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" />
        <path d="M11 18v-4.6c0-1.6 1.1-2.9 2.8-2.9 1.7 0 2.7 1.1 2.7 3V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 9.5V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return null
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

      <div className="container footer-grid" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <section className="footer-brand" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '32px' }}>
          <div className="footer-brand-head" style={{ marginBottom: '20px' }}>
            <img className="footer-brand-logo" src="/logo-trimitra.webp" alt="Logo Trimitra" style={{ height: '40px', width: 'auto' }} />
          </div>
          <p style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            PT Trimitra Multi Kreasi adalah partner untuk kebutuhan event,
            booth exhibition, dan advertising yang siap membantu Anda dalam
            menyusun perencanaan, design, budgeting, tata laksana, sampai
            penyelenggaraannya.
          </p>
          <div className="footer-brand-social">
            <span className="footer-brand-social-label" style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '16px', display: 'block' }}>Ikuti Kami</span>
            <motion.div
              className="footer-social-icons"
              variants={socialListVariants}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate={prefersReducedMotion ? {} : 'show'}
              aria-label="Brand social links"
              style={{ display: 'flex', gap: '12px' }}
            >
              {brandSocialItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="social-orb"
                  aria-label={item.label}
                  variants={socialItemVariants}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(14, 165, 233, 0.15)',
                    color: '#0ea5e9',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)'
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                    <BrandSocialIcon type={item.icon} />
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: '16px', fontWeight: 600 }}>Layanan</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px' }}><Link to="/layanan/detail-billboard" onMouseEnter={() => prefetchRoute('/layanan')} data-prefetch-route="/layanan" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Advertising (Billboard)</Link></li>
            <li style={{ marginBottom: '12px' }}><Link to="/layanan/detail-event" onMouseEnter={() => prefetchRoute('/layanan')} data-prefetch-route="/layanan" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Event Organizer</Link></li>
            <li><Link to="/layanan/detail-booth" onMouseEnter={() => prefetchRoute('/layanan')} data-prefetch-route="/layanan" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Booth Exhibition</Link></li>
          </ul>
        </section>

        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: '16px', fontWeight: 600 }}>Perusahaan</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px' }}><Link to="/tentang-kami" onMouseEnter={() => prefetchRoute('/tentang-kami')} data-prefetch-route="/tentang-kami" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Tentang Kami</Link></li>
            <li><Link to="/kontak-kami" onMouseEnter={() => prefetchRoute('/kontak-kami')} data-prefetch-route="/kontak-kami" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Kontak</Link></li>
          </ul>
        </section>

        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px' }}>
          <h4 style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: '16px', fontWeight: 600 }}>Hubungi Kami</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <MapPin size={18} style={{ marginTop: '2px', flexShrink: 0, color: '#0ea5e9' }} />
              <span>Ruko Anggrek 1, No 37, Grand Depok City, Jl Boulevard Raya Kota Depok</span>
            </li>
            <li style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <MapPin size={18} style={{ marginTop: '2px', flexShrink: 0, color: '#0ea5e9' }} />
              <span>Workshop Pameran: Jalan Serua Raya, Bojongsari Kota Depok</span>
            </li>
            <li style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <MapPin size={18} style={{ flexShrink: 0, color: '#0ea5e9' }} />
              <span>Workshop Reklame: Jalan Reformasi Raya no 2, Pondok Aren, Tangerang Selatan</span>
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <Phone size={18} style={{ flexShrink: 0, color: '#0ea5e9' }} />
              <a href="tel:+62811109842" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>0811109842</a>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <Mail size={18} style={{ flexShrink: 0, color: '#0ea5e9' }} />
              <a href="mailto:dhr@trimitramulti.co.id" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>dhr@trimitramulti.co.id</a>
            </li>
          </ul>
        </section>
      </div>

      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          © 2026 PT Trimitra Multi Kreasi. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  )
}

export default Footer
