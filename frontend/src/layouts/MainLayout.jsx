import { useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsAppCTA from '../components/layout/WhatsAppCTA'
import { useGsapEnhance } from '../components/animation/useGsapEnhance'
import { useSexyScroll } from '../components/animation/useSexyScroll'
import { usePremiumInteractions } from '../components/animation/usePremiumInteractions'

function RoutePageLoader({ prefersReducedMotion }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsVisible(false)
    }, prefersReducedMotion ? 220 : 900)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [prefersReducedMotion])

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          className="page-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.16 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="page-loader-orb orb-1" aria-hidden="true" />
          <span className="page-loader-orb orb-2" aria-hidden="true" />
          <span className="page-loader-orb orb-3" aria-hidden="true" />
          <div className="page-loader-mark">
            <img src="/logo-trimitra.webp" alt="Trimitra" className="page-loader-logo" />
            <div className="page-loader-line" aria-hidden="true">
              <span className="page-loader-line-fill" />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function MainLayout() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const routeLoaderKey = `${location.pathname}${location.search}`
  const disableRouteLoader = location.pathname.startsWith('/layanan')

  useGsapEnhance(routeLoaderKey)
  useSexyScroll(location.key, 'balanced')
  usePremiumInteractions(location.key)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.key, location.pathname, location.search])

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (main) main.focus()
  }, [location.key, location.pathname, location.search])

  return (
    <div className="app-shell">
      {disableRouteLoader ? null : (
        <RoutePageLoader key={routeLoaderKey} prefersReducedMotion={prefersReducedMotion} />
      )}

      <Navbar />
      <main className="page-main" id="main-content" tabIndex="-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeLoaderKey}
            className="route-transition-shell"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppCTA />
    </div>
  )
}

export default MainLayout
