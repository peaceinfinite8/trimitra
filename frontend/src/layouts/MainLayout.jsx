import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsAppCTA from '../components/layout/WhatsAppCTA'
import { useGsapEnhance } from '../components/animation/useGsapEnhance'
import { useSexyScroll } from '../components/animation/useSexyScroll'
import { usePremiumInteractions } from '../components/animation/usePremiumInteractions'
import RouteTransitionLoader from '../components/ui/RouteTransitionLoader'

function MainLayout() {
  const location = useLocation()
  const routeLoaderKey = `${location.pathname}${location.search}`
  const hasMountedRef = useRef(false)
  const [isRouteLoaderVisible, setIsRouteLoaderVisible] = useState(false)

  useGsapEnhance(routeLoaderKey)
  useSexyScroll(location.key, 'balanced')
  usePremiumInteractions(location.key)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return undefined
    }

    setIsRouteLoaderVisible(true)

    const hideTimer = window.setTimeout(() => {
      setIsRouteLoaderVisible(false)
    }, 400)

    return () => {
      window.clearTimeout(hideTimer)
    }
  }, [location.key])

  // Double requestAnimationFrame memastikan scroll jalan setelah browser selesai paint frame pertama halaman baru
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
      })
    })
    return () => cancelAnimationFrame(id)
  }, [location.pathname])

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (main) main.focus({ preventScroll: true })
  }, [location.key, location.pathname, location.search])

  return (
    <div className="app-shell">
      {isRouteLoaderVisible ? <RouteTransitionLoader /> : null}
      <Navbar />
      <main className="page-main" id="main-content" tabIndex="-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeLoaderKey}
            className="route-transition-shell"
            style={{ position: 'relative' }}
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
