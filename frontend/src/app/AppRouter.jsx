import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { pageImporters } from './routePrefetch'
import MaintenancePage from '../pages/MaintenancePage'
import RouteTransitionLoader from '../components/ui/RouteTransitionLoader'

const HomePage = lazy(pageImporters['/'])
const TentangKamiPage = lazy(pageImporters['/tentang-kami'])
const LayananPage = lazy(() => import('../pages/LayananPage'))
const DetailBillboardPage = lazy(() => import('../pages/DetailBillboardPage'))
const DetailEventOrganizerPage = lazy(() => import('../pages/DetailEventOrganizerPage'))
const DetailBoothExhibitionPage = lazy(() => import('../pages/DetailBoothExhibitionPage'))
const GaleriPage = lazy(pageImporters['/galeri'])
const BeritaPage = lazy(pageImporters['/berita'])
const BeritaDetailPage = lazy(pageImporters['/berita-detail'])
const KontakKamiPage = lazy(pageImporters['/kontak-kami'])
const KebijakanPrivasiPage = lazy(pageImporters['/kebijakan-privasi'])
const SyaratLayananPage = lazy(pageImporters['/syarat-layanan'])

function RouteFallback() {
  return <RouteTransitionLoader />
}

function DetailFallback() {
  return <RouteTransitionLoader label="Memuat detail halaman" />
}

function AppRouter() {
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode) {
    return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/galeri" element={<Suspense fallback={<RouteFallback />}><GaleriPage /></Suspense>} />
        </Route>
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Suspense fallback={<RouteFallback />}><HomePage /></Suspense>} />
        <Route path="/tentang-kami" element={<Suspense fallback={<RouteFallback />}><TentangKamiPage /></Suspense>} />
        <Route path="/layanan" element={<Suspense fallback={<RouteFallback />}><LayananPage /></Suspense>} />
        <Route path="/galeri" element={<Suspense fallback={<RouteFallback />}><GaleriPage /></Suspense>} />
        <Route path="/berita" element={<Suspense fallback={<RouteFallback />}><BeritaPage /></Suspense>} />
        <Route path="/berita/:slug" element={<Suspense fallback={<RouteFallback />}><BeritaDetailPage /></Suspense>} />
        <Route path="/kontak-kami" element={<Suspense fallback={<RouteFallback />}><KontakKamiPage /></Suspense>} />
        <Route path="/kebijakan-privasi" element={<Suspense fallback={<RouteFallback />}><KebijakanPrivasiPage /></Suspense>} />
        <Route path="/syarat-layanan" element={<Suspense fallback={<RouteFallback />}><SyaratLayananPage /></Suspense>} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/layanan/detail-billboard" element={<Suspense fallback={<DetailFallback />}><DetailBillboardPage /></Suspense>} />
      <Route path="/layanan/detail-event" element={<Suspense fallback={<DetailFallback />}><DetailEventOrganizerPage /></Suspense>} />
      <Route path="/layanan/detail-booth" element={<Suspense fallback={<DetailFallback />}><DetailBoothExhibitionPage /></Suspense>} />
    </Routes>
  )
}

export default AppRouter
