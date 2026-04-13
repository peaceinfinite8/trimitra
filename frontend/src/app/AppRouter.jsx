import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { pageImporters } from './routePrefetch'

const HomePage = lazy(pageImporters['/'])
const TentangKamiPage = lazy(pageImporters['/tentang-kami'])
const LayananPage = lazy(pageImporters['/layanan'])
const GaleriPage = lazy(pageImporters['/galeri'])
const BeritaPage = lazy(pageImporters['/berita'])
const BeritaDetailPage = lazy(pageImporters['/berita-detail'])
const KontakKamiPage = lazy(pageImporters['/kontak-kami'])
const KebijakanPrivasiPage = lazy(pageImporters['/kebijakan-privasi'])
const SyaratLayananPage = lazy(pageImporters['/syarat-layanan'])

function RouteFallback() {
  return <div className="route-loader" aria-label="Memuat halaman" />
}

function AppRouter() {
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
