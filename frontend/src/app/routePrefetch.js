export const pageImporters = {
  '/': () => import('../pages/HomePage'),
  '/tentang-kami': () => import('../pages/TentangKamiPage'),
  '/layanan': () => import('../pages/LayananPage'),
  '/galeri': () => import('../pages/GaleriPage'),
  '/berita': () => import('../pages/BeritaPage'),
  '/berita-detail': () => import('../pages/BeritaDetailPage'),
  '/kontak-kami': () => import('../pages/KontakKamiPage'),
  '/kebijakan-privasi': () => import('../pages/KebijakanPrivasiPage'),
  '/syarat-layanan': () => import('../pages/SyaratLayananPage'),
}

const prefetched = new Set()

export function prefetchRoute(path) {
  const importer = pageImporters[path]
  if (!importer || prefetched.has(path)) return

  prefetched.add(path)
  importer().catch(() => {
    prefetched.delete(path)
  })
}
