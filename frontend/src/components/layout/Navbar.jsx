import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { navLinks } from '../../data/navLinks'
import { prefetchRoute } from '../../app/routePrefetch'
import { useNavbarScrollState } from '../animation/useNavbarScrollState'

function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isScrolled = useNavbarScrollState({
    threshold: 80,
    heroSelector: '[data-nav-hero]',
    routeKey: `${location.pathname}${location.search}`,
  })
  const headerRef = useRef(null)

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    const handleOutsideClick = (event) => {
      if (!headerRef.current) return
      if (!headerRef.current.contains(event.target)) closeMenu()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }

    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [isMenuOpen])

  return (
    <header
      className={`site-header nav-shell ${isScrolled ? 'nav-shell--glass is-scrolled' : 'nav-shell--transparent'} ${isMenuOpen ? 'nav-shell--menu-open' : ''}`}
      ref={headerRef}
      data-nav-state={isScrolled ? 'glass' : 'transparent'}
    >
      <div className="nav-wrap nav-wrap-shell">
        <NavLink
          className="brand"
          to="/"
          aria-label="Trimitra Home"
          onClick={closeMenu}
          data-prefetch-route="/"
        >
          <img className="brand-logo" src="/logo-trimitra.webp" alt="Logo Trimitra" />
        </NavLink>

        <nav className="main-nav" aria-label="Main navigation">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              data-prefetch-route={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              <span className="nav-link-label">{item.label}</span>
              <span className="nav-link-indicator" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <NavLink
            className="chat-button"
            to="/kontak-kami"
            aria-label="Chat"
            onMouseEnter={() => prefetchRoute('/kontak-kami')}
            onFocus={() => prefetchRoute('/kontak-kami')}
            data-prefetch-route="/kontak-kami"
          >
            <span className="chat-bubble" />
          </NavLink>

          <NavLink
            className="cta-button cta-button--glow"
            to="/kontak-kami"
            onClick={closeMenu}
            onMouseEnter={() => prefetchRoute('/kontak-kami')}
            onFocus={() => prefetchRoute('/kontak-kami')}
            data-prefetch-route="/kontak-kami"
            data-magnetic
          >
            <span className="cta-label">Konsultasi Gratis</span>
            <span className="cta-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" role="presentation">
                <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </NavLink>

          <button
            className={`mobile-menu mobile-nav-toggle ${isMenuOpen ? 'is-open' : ''}`}
            aria-label="Menu navigasi"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-panel mobile-nav-panel ${isMenuOpen ? 'open is-open' : ''}`}>
        <div className="container mobile-panel-inner">
          {navLinks.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              onClick={closeMenu}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              data-prefetch-route={item.to}
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link nav-link-active' : 'mobile-nav-link'
              }
              style={({ isActive }) => ({
                borderLeft: isActive ? '3px solid #0ea5e9' : 'none',
                paddingLeft: isActive ? '12px' : '15px',
                color: isActive ? '#0ea5e9' : 'inherit',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            className="btn"
            to="/kontak-kami"
            onClick={closeMenu}
            onMouseEnter={() => prefetchRoute('/kontak-kami')}
            onFocus={() => prefetchRoute('/kontak-kami')}
            data-prefetch-route="/kontak-kami"
          >
            Konsultasi Gratis
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export default Navbar
