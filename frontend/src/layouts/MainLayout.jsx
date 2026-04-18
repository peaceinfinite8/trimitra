import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsAppCTA from '../components/layout/WhatsAppCTA'
import { useGsapEnhance } from '../components/animation/useGsapEnhance'
import { useSexyScroll } from '../components/animation/useSexyScroll'
import { usePremiumInteractions } from '../components/animation/usePremiumInteractions'

function MainLayout() {
  const location = useLocation()
  const routeLoaderKey = `${location.pathname}${location.search}`

  useGsapEnhance(routeLoaderKey)
  useSexyScroll(location.key, 'balanced')
  usePremiumInteractions(location.key)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

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
      <Navbar />
      <main className="page-main" id="main-content" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppCTA />
    </div>
  )
}

export default MainLayout
