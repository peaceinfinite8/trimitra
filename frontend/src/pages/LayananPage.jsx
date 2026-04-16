import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SectionReveal, StaggerGroup, StaggerItem } from '../components/animation/Reveal'
import LazyImage from '../components/ui/LazyImage'
import ClientMarquee from '../components/ClientMarquee'
import { getWordPressPageBySlugs, isWordPressConfiguredForPages } from '../data/wordpressPages'
import { pickLinkField, pickTextField } from '../data/wpUiFields'

function ServiceCardIcon({ type = 'strategy', accent = '#0ea5e9' }) {
  const icons = {
    strategy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8h24v24H12z"/><path d="M8 32h32M14 40h20"/><circle cx="24" cy="12" r="2" fill="${accent}"/></svg>`,
    design: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12c0-2.2 1.8-4 4-4h28c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V12z"/><circle cx="24" cy="24" r="6" fill="none"/><path d="M14 20l-2-2"/></svg>`,
    install: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 8v28M16 20l8-8 8 8M12 36h24"/></svg>`,
    creative: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V20z"/><path d="M28 24c1 1 2 2 4 2s3-1 4-2"/></svg>`,
    rundown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12h24M12 20h24M12 28h16"/><path d="M8 12v20c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V12"/></svg>`,
    operation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="14"/><path d="M24 18v12M18 24h12"/></svg>`,
  }

  return (
    <div className="services-card-icon" dangerouslySetInnerHTML={{ __html: icons[type] || icons.strategy }} />
  )
}

const PRIMARY_SERVICE_PACKAGES = [
  {
    id: '01',
    title: 'Advertising (Billboard)',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=82',
    imageAlt: 'Billboard advertising strategis di lokasi utama kota.',
    shortDescription:
      'Layanan advertising kami fokus pada billboard dengan penempatan strategis dan desain visual yang kuat agar pesan brand terbaca cepat dan meninggalkan kesan mendalam.',
    useCase: 'Billboard, baliho, dan OOH campaign di jalur utama dengan traffic tinggi untuk awareness skala massal.',
    integrationCopy: 'Analisis lokasi, desain materi visual menarik, dan instalasi profesional kami kelola end-to-end.',
    cards: [
      {
        icon: 'strategy',
        title: 'Strategi & Seleksi Titik',
        description: 'Pemilihan lokasi billboard berdasarkan traffic kendaraan, profil audiens, dan visibilitas optimal.',
        benefit: 'Eksposur tertinggi',
        example: 'Rute komuter, pusat komersial, bundaran strategis',
      },
      {
        icon: 'design',
        title: 'Desain Visual Billboard',
        description: 'Materi dirancang untuk durasi pelihatan singkat (3-5 detik) dengan hierarki pesan yang jelas dan menarik.',
        benefit: 'Brand memorable',
        example: 'One-liner bold dengan visual striking',
      },
      {
        icon: 'install',
        title: 'Instalasi & Maintenance',
        description: 'Tim ahli menangani pemasangan struktur, grafis, dan pernik hingga finishing sempurna.',
        benefit: 'Kualitas premium',
        example: 'Inspeksi berkala & maintenance rutin',
      },
    ],
    deliverables: [
      'Rekomendasi titik billboard dengan analisis traffic dan target demografi per lokasi.',
      'Desain materi advertising siap cetak sesuai spesifikasi billboard standard dan custom size.',
      'Instalasi profesional, perihal izin, hingga dokumentasi penyelesaian.',
    ],
    process: [
      'Audit lokasi dan pemetaan jalur traffic untuk identifikasi titik optimal.',
      'Briefing kreatif, konsep desain billboard, dan approval materi final.',
      'Produksi materi cetak, instalasi struktur, dan monitoring rutin.',
    ],
    outcomes: [
      'Brand awareness meningkat dengan eksposur harian ke ribuan calon konsumen.',
      'Pesan komunikasi terbaca efektif dan meninggalkan brand recall yang kuat.',
    ],
  },
  {
    id: '02',
    title: 'Event Organizer',
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1800&q=82',
    imageAlt: 'Suasana event activation dengan panggung dan audiens.',
    shortDescription:
      'Tim event organizer kami menangani konsep kreatif, produksi teknis, hingga koordinasi lapangan agar setiap momen brand berjalan rapi dan berdampak maksimal.',
    useCase: 'Roadshow brand, grand opening, gathering korporat, product launch, dan campaign activation.',
    integrationCopy: 'Kami menyatukan creative direction, produksi teknis, dan operasional lapangan dalam satu komando terpadu.',
    cards: [
      {
        icon: 'creative',
        title: 'Konsep & Arahan Kreatif',
        description: 'Merancang konsep acara, visual tone, storyline, dan experiential touchpoint sesuai objektif campaign.',
        benefit: 'Narasi kuat & memorable',
        example: 'Experiential activation untuk launch produk',
      },
      {
        icon: 'rundown',
        title: 'Produksi & Rundown Teknis',
        description: 'Mengatur rundown detail, technical cue, dan koordinasi tim produksi, MC, audiovisual, dan vendor.',
        benefit: 'Eksekusi smooth & sinkron',
        example: 'Koordinasi panggung, visual, musik, cahaya',
      },
      {
        icon: 'operation',
        title: 'Operasional & Monitoring Lapangan',
        description: 'Mendampingi event dari pembukaan hingga penutupan dengan monitoring kualitas dan responsif terhadap perubahan.',
        benefit: 'Risiko H-day diminimalkan',
        example: 'On-ground command center untuk koordinasi crew',
      },
    ],
    deliverables: [
      'Konsep acara lengkap dengan visual guideline, mood board, dan storyline narasi.',
      'Rundown teknis detail, timeline event, kebutuhan vendor, dan skenario contingency.',
      'Eksekusi hari-H end-to-end, dokumentasi event, dan laporan evaluasi post-event.',
    ],
    process: [
      'Kickoff dan workshop untuk menyamakan vision, objective, dan scope event.',
      'Penyusunan konsep kreatif, budgeting, site survey, dan koordinasi vendor awal.',
      'Eksekusi hari-H, real-time monitoring, dan follow-up laporan dampak campaign.',
    ],
    outcomes: [
      'Event berjalan profesional, terukur, dan mencapai KPI campaign yang ditetapkan.',
      'Tim klien fokus pada tamu dan hubungan bisnis karena eksekusi ditangani profesional.',
    ],
  },
  {
    id: '03',
    title: 'Booth Exhibition',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1800&q=82',
    imageAlt: 'Booth exhibition modern dengan desain menarik dan pengunjung aktif.',
    shortDescription:
      'Kami merancang dan mengeksekusi booth pameran dari konsep visual, alur interaksi, hingga instalasi lapangan agar brand tampil premium dan mudah diingat.',
    useCase: 'Pameran industri, trade show, expo retail, product showcase, dan B2B meeting venue.',
    integrationCopy: 'Desain 3D, fabrikasi in-house, dan instalasi onsite kami jalankan dalam satu pipeline kerja terpadu.',
    cards: [
      {
        icon: 'design',
        title: 'Konsep & Desain 3D',
        description: 'Layout booth dirancang berbasis target audiens, jalur traffic pameran, dan narasi brand yang ingin disampaikan.',
        benefit: 'Brand story jelas & engaging',
        example: 'Booth interaktif dengan demo produk & photo corner',
      },
      {
        icon: 'creative',
        title: 'Produksi & Fabrication In-House',
        description: 'Semua material structure, graphic panel, dan elemen branding diproduksi in-house untuk kontrol kualitas dan timeline ketat.',
        benefit: 'Kualitas premium terjaga',
        example: 'Struktur custom sesuai brand guideline & standar pameran',
      },
      {
        icon: 'install',
        title: 'Instalasi & Setup Lapangan',
        description: 'Tim instalasi profesional menangani assembly booth, electrical, signage, dan final touch-up di lokasi pameran.',
        benefit: 'Booth siap sempurna',
        example: 'Instalasi cepat untuk pameran multi-hall tanpa downtime',
      },
    ],
    deliverables: [
      'Konsep kreatif booth, layout 2D/3D, floor plan, dan rencana alur pengunjung.',
      'Material production: structure, graphic panel, furniture, signage, dan branding elements lengkap.',
      'Instalasi di lokasi, quality check final, dan dokumentasi handover booth.',
    ],
    process: [
      'Workshop kebutuhan brand dan objective pameran untuk brief komprehensif.',
      'Presentasi konsep 3D, revisi, dan approval final sebelum produksi dimulai.',
      'Produksi material, instalasi onsite, dan support operasional selama pameran berlangsung.',
    ],
    outcomes: [
      'Booth menonjol di antara kompetitor dan meningkatkan visitor engagement signifikan.',
      'Brand impression kuat dan lead generation meningkat dari booth visits.',
    ],
  },
]

const SERVICE_CATEGORY_OVERVIEW = [
  {
    title: 'Advertising (Billboard)',
    description: 'Tampilkan brand dengan billboard strategis di lokasi-lokasi utama untuk jangkauan awareness maksimal.',
    benefit: 'Meningkatkan brand visibility dan mencapai target audiens dalam radius area bisnis.',
    usage: 'Ideal untuk billboard di jalur utama, pusat komersial, dan bundaran strategis kota.',
  },
  {
    title: 'Event Organizer',
    description: 'Kelola event brand end-to-end dengan storytelling kuat dan operasional profesional dari konsep hingga closing.',
    benefit: 'Memastikan event berjalan smooth, terukur, dan memperkuat engagement dengan target audience.',
    usage: 'Cocok untuk launching, roadshow, gathering korporat, dan campaign activation di venue premium.',
  },
  {
    title: 'Booth Exhibition',
    description: 'Rancang booth premium dari konsep 3D, produksi quality, hingga instalasi sempurna untuk menonjol di pameran.',
    benefit: 'Meningkatkan traffic booth dan menciptakan brand impression yang mendalam pada pengunjung pameran.',
    usage: 'Ideal untuk expo, trade show, product showcase, dan B2B event di venue pameran internasional.',
  },
]

const SERVICE_SPEC_COMPARISON = [
  {
    label: 'Konsep',
    advertising: 'Analisis lokasi + visual hook singkat',
    event: 'Creative direction + rundown teknis',
    booth: '3D booth design + flow chart',
  },
  {
    label: 'Produksi',
    advertising: 'Produksi materi cetak & grafis outdoor',
    event: 'Produksi panggung dan audiovisual',
    booth: 'Fabrication structure & branding elements',
  },
  {
    label: 'Eksekusi',
    advertising: 'Instalasi billboard & monitoring tayang',
    event: 'Live operation & event management',
    booth: 'Instalasi onsite & technical support',
  },
]

const SERVICE_PILLARS = [
  {
    value: '17+',
    title: 'Tahun Pengalaman',
    copy: 'Sejak 2017 kami menangani proyek branding lapangan lintas industri dengan standar eksekusi konsisten.',
    tag: 'Experience',
  },
  {
    value: '420+',
    title: 'Aktivasi Terselesaikan',
    copy: 'Portofolio kami mencakup booth, event, dan media outdoor dengan koordinasi lintas tim yang terukur.',
    tag: 'Execution',
  },
  {
    value: '96%',
    title: 'On-Time Delivery',
    copy: 'Timeline kerja dipantau ketat dari tahap desain sampai handover agar proyek tetap tepat waktu.',
    tag: 'Reliability',
  },
]

const SERVICE_FLOW_STEPS = [
  {
    step: 'Langkah 01',
    title: 'Discovery & Scope',
    copy: 'Kami memetakan target campaign, area aktivasi, timeline, dan KPI agar kebutuhan proyek jelas sejak awal.',
    output: 'Output: Scope deck + KPI framework',
  },
  {
    step: 'Langkah 02',
    title: 'Concept & Proposal',
    copy: 'Tim kreatif menyiapkan konsep visual, alternatif format, serta rencana biaya dan teknis untuk disepakati.',
    output: 'Output: Creative concept + budget map',
  },
  {
    step: 'Langkah 03',
    title: 'Production & QA',
    copy: 'Produksi dijalankan dengan kontrol kualitas bertahap, termasuk checklist material, layout, dan safety.',
    output: 'Output: Production timeline + QA report',
  },
  {
    step: 'Langkah 04',
    title: 'Execution & Report',
    copy: 'Instalasi dan operasional lapangan dilakukan end-to-end lalu ditutup dengan evaluasi hasil dan dokumentasi.',
    output: 'Output: Execution documentation + insights',
  },
]

const SERVICE_FAQ_ITEMS = [
  {
    question: 'Apakah Trimitra bisa menangani proyek dari nol sampai eksekusi?',
    answer:
      'Ya. Kami menangani alur lengkap mulai dari discovery, konsep kreatif, produksi, hingga pelaksanaan di lapangan.',
  },
  {
    question: 'Berapa lama timeline rata-rata untuk proyek layanan?',
    answer:
      'Durasi menyesuaikan kompleksitas, namun umumnya 2-6 minggu. Timeline detail kami berikan pada tahap proposal.',
  },
  {
    question: 'Apakah layanan tersedia di luar kota besar?',
    answer:
      'Tersedia. Tim kami memiliki cakupan lintas kota dan bekerja dengan jaringan produksi untuk kebutuhan multi-lokasi.',
  },
  {
    question: 'Bisa konsultasi dulu sebelum menentukan paket layanan?',
    answer:
      'Bisa. Kami sarankan sesi konsultasi awal agar strategi layanan, anggaran, dan target campaign bisa disesuaikan tepat.',
  },
]

const ENABLE_LAYANAN_WP_ENHANCEMENT = false

function safeText(value, fallback) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function CountUpNumber({ value, suffix = '', duration = 1300 }) {
  const prefersReducedMotion = useReducedMotion()
  const rafRef = useRef(0)
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [duration, prefersReducedMotion, value])

  const shownValue = prefersReducedMotion ? value : displayValue

  return <span>{shownValue}{suffix}</span>
}

function LayananPage() {
  const prefersReducedMotion = useReducedMotion()
  const [wpPage, setWpPage] = useState(null)
  const [activeFaqIndex, setActiveFaqIndex] = useState(0)

  useEffect(() => {
    document.body.classList.add('route-services')
    return () => {
      document.body.classList.remove('route-services')
    }
  }, [])

  useEffect(() => {
    if (!ENABLE_LAYANAN_WP_ENHANCEMENT) return undefined

    let cancelled = false

    async function loadPageFromWordPress() {
      if (!isWordPressConfiguredForPages()) return
      try {
        const page = await getWordPressPageBySlugs(['produk-jasa', 'layanan', 'services'])
        if (!cancelled && page) {
          setWpPage(page)
        }
      } catch {
        // Keep existing fallback layout.
      }
    }

    loadPageFromWordPress()
    return () => {
      cancelled = true
    }
  }, [])

  const uiFields = ENABLE_LAYANAN_WP_ENHANCEMENT && wpPage ? { ...(wpPage.meta || {}), ...(wpPage.acf || {}) } : {}

  const pageKicker = pickTextField(uiFields, ['page_kicker', 'services_kicker'], 'Produk & Jasa')
  const pageTitle = safeText(
    pickTextField(uiFields, ['hero_title', 'services_title'], wpPage?.title || 'Solusi Produk & Jasa Trimitra'),
    'Solusi Produk & Jasa Trimitra',
  )
  const pageCopy = pickTextField(
    uiFields,
    ['hero_copy', 'services_copy'],
    'Kami fokus pada tiga layanan utama: advertising billboard, event organizer, dan booth exhibition. Setiap layanan dirancang dengan standar premium dan eksekusi presisi dari konsep hingga lapangan.',
  )
  const ctaTitle = pickTextField(uiFields, ['cta_title', 'services_cta_title'], 'Siap Wujudkan Aktivasi Brand yang Lebih Berdampak?')
  const ctaCopy = pickTextField(
    uiFields,
    ['cta_copy', 'services_cta_copy'],
    'Tim Trimitra siap membantu dari tahap konsep hingga eksekusi akhir dengan alur kerja yang cepat, terukur, dan presisi.',
  )
  const ctaPrimaryLabel = pickTextField(uiFields, ['cta_primary_label'], 'Konsultasi Sekarang')
  const ctaPrimaryLink = pickLinkField(uiFields, ['cta_primary_link'], '/kontak-kami')
  const ctaSecondaryLabel = pickTextField(uiFields, ['cta_secondary_label'], 'Lihat Portofolio')
  const ctaSecondaryLink = pickLinkField(uiFields, ['cta_secondary_link'], '/galeri')
  const titleWords = safeText(pageTitle, 'Solusi Produk & Jasa Trimitra').split(' ')
  const splitPoint = Math.max(1, Math.ceil(titleWords.length / 2))
  const titleLineOne = titleWords.slice(0, splitPoint).join(' ')
  const titleLineTwo = titleWords.slice(splitPoint).join(' ')

  return (
    <div className="services-page-sky">
      <SectionReveal className="section services-redesign-hero" data-nav-hero>
        <div className="services-redesign-hero-ambient" aria-hidden="true">
          <span className="services-redesign-orb orb-a" />
          <span className="services-redesign-orb orb-b" />
          <span className="services-redesign-orb orb-c" />
        </div>
        <div className="container services-redesign-hero-grid">
          <div className="services-redesign-hero-copy">
            <p className="kicker">{pageKicker}</p>
            <h1 className="services-redesign-title services-title-split">
              <motion.span
                className="services-title-line services-title-line-left"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -28 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              >
                {titleLineOne}
              </motion.span>
              <motion.span
                className="services-title-line services-title-line-right"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 28 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.46, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {titleLineTwo}
              </motion.span>
            </h1>
            <p className="muted services-redesign-description">{pageCopy}</p>

            <div className="services-redesign-hero-actions">
              <Link className="btn" to={ctaPrimaryLink}>{ctaPrimaryLabel}</Link>
              <Link className="btn outline" to={ctaSecondaryLink}>{ctaSecondaryLabel}</Link>
            </div>

            <div className="services-redesign-tags">
              <span>Advertising (Billboard)</span>
              <span>Event Organizer</span>
              <span>Booth Exhibition</span>
            </div>
          </div>

          <StaggerGroup className="services-redesign-metrics" once amount={0.35}>
            <StaggerItem>
              <article className="services-redesign-metric-card">
                <h3>
                  <CountUpNumber value={150} suffix="+" />
                </h3>
                <p>Billboard Locations</p>
              </article>
            </StaggerItem>
            <StaggerItem>
              <article className="services-redesign-metric-card">
                <h3>
                  <CountUpNumber value={250} suffix="+" />
                </h3>
                <p>Events Executed</p>
              </article>
            </StaggerItem>
            <StaggerItem>
              <article className="services-redesign-metric-card">
                <h3>
                  <CountUpNumber value={96} suffix="%" />
                </h3>
                <p>Client Satisfaction</p>
              </article>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </SectionReveal>

      <SectionReveal className="section services-redesign-catalog">
        <div className="container services-spotlight-shell">
          <div className="services-redesign-head">
            <p className="kicker">Paket Produk & Jasa</p>
            <h2 className="services-redesign-head-title">
              <span>3 layanan utama</span>
              <img
                src="/logo-trimitra.webp"
                alt="Logo Trimitra"
                className="services-redesign-head-logo"
                loading="lazy"
                decoding="async"
              />
            </h2>
            <p className="muted services-spotlight-copy">
              Setiap layanan disusun dengan alur kerja yang jelas, mulai dari strategi, produksi, sampai eksekusi lapangan.
            </p>
          </div>

          <div className="services-impact-strip" aria-label="Dampak layanan Trimitra">
            <article>
              <h3>Integrated Delivery</h3>
              <p>Desain, produksi, dan eksekusi bergerak dalam satu pipeline agar kualitas tetap konsisten.</p>
            </article>
            <article>
              <h3>Field Precision</h3>
              <p>Tim lapangan bekerja dengan checklist teknis yang ketat untuk meminimalkan risiko hari-H.</p>
            </article>
            <article>
              <h3>Brand Impact</h3>
              <p>Setiap aktivasi disusun untuk mendorong awareness, engagement, dan pesan yang lebih mudah diingat.</p>
            </article>
          </div>

          <div className="services-category-grid" aria-label="Ringkasan kategori produk dan jasa Trimitra">
            {SERVICE_CATEGORY_OVERVIEW.map((category, index) => (
              <motion.article
                key={category.title}
                className={`services-category-card services-category-card-${index + 1}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.34 }}
                transition={{ duration: 0.38, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="services-category-index">0{index + 1}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <p className="services-category-highlight"><strong>Manfaat:</strong> {category.benefit}</p>
                <p className="services-category-highlight"><strong>Contoh penggunaan:</strong> {category.usage}</p>
              </motion.article>
            ))}
          </div>

          <div className="services-main-flow" aria-label="Tiga layanan utama Trimitra">
            {PRIMARY_SERVICE_PACKAGES.map((service, serviceIndex) => (
              <motion.article
                key={service.id}
                className={`services-main-item ${serviceIndex % 2 === 1 ? 'is-reversed' : ''}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 26, filter: 'blur(6px)' }}
                whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.44, delay: serviceIndex * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.figure
                  className="services-main-media"
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, x: serviceIndex % 2 === 1 ? 36 : -36, scale: 0.97 }
                  }
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.32 }}
                  transition={{ duration: 0.52, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LazyImage src={service.image} alt={service.imageAlt} className="services-main-media-image" />
                  <span className="services-main-media-glow" aria-hidden="true" />
                </motion.figure>

                <motion.div
                  className="services-main-content"
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, x: serviceIndex % 2 === 1 ? -28 : 28 }
                  }
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.28 }}
                  transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.p
                    className="services-main-id"
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, rotate: -10 }}
                    whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Layanan {service.id}
                  </motion.p>
                  <h3>{service.title}</h3>
                  <p className="muted services-main-description">{service.shortDescription}</p>
                  <p className="services-main-integration">{service.integrationCopy}</p>
                  <p className="services-main-usecase"><strong>Contoh penggunaan:</strong> {service.useCase}</p>

                  <div className="services-main-card-grid">
                    {service.cards.map((card, index) => (
                      <motion.article
                        key={card.title}
                        className="services-main-card"
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
                        whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.42, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {card.icon && <ServiceCardIcon type={card.icon} accent="#0ea5e9" />}
                        <h4>{card.title}</h4>
                        <p className="services-card-description">{card.description}</p>
                        <div className="services-card-meta">
                          <span className="services-card-benefit"><strong>{card.benefit}</strong></span>
                          <span className="services-card-example">{card.example}</span>
                        </div>
                      </motion.article>
                    ))}
                  </div>

                </motion.div>

                <div className="services-main-deep-grid" aria-label={`Detail deliverables ${service.title}`}>
                  <article className="services-main-deep-card">
                    <h4>Yang Didapat Klien</h4>
                    <ul>
                      {service.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="services-main-deep-card">
                    <h4>Proses Kerja</h4>
                    <ul>
                      {service.process.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="services-main-deep-card">
                    <h4>Hasil yang Diharapkan</h4>
                    <ul>
                      {service.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                </div>
              </motion.article>
            ))}

            <div className="services-spec-grid" aria-label="Perbandingan deliverables layanan">
              {SERVICE_SPEC_COMPARISON.map((row) => (
                <article key={row.label} className="services-spec-card">
                  <h4>{row.label}</h4>
                  <p><strong>Advertising:</strong> {row.advertising}</p>
                  <p><strong>Event:</strong> {row.event}</p>
                  <p><strong>Booth:</strong> {row.booth}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="section services-redesign-pillars">
        <div className="container">
          <p className="kicker">Kenapa Trimitra</p>
          <h2 className="services-redesign-pillars-title">Partner eksekusi yang fokus pada hasil nyata</h2>
          <div className="services-redesign-pillars-grid" aria-label="Keunggulan layanan Trimitra">
            {SERVICE_PILLARS.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                className={`services-redesign-pillar-card services-redesign-pillar-card-${index + 1}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
                whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="services-redesign-pillar-tag">{pillar.tag}</p>
                <h3>{pillar.value}</h3>
                <p><strong>{pillar.title}</strong></p>
                <p>{pillar.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="section services-redesign-flow">
        <div className="container">
          <p className="kicker">Alur Kerja</p>
          <h2 className="services-redesign-pillars-title">Proses yang jelas dari brief sampai laporan akhir</h2>
          <div className="services-redesign-flow-track" aria-label="Tahapan kerja layanan Trimitra">
            {SERVICE_FLOW_STEPS.map((flow, index) => (
              <article key={flow.step} className={`services-redesign-flow-card ${index % 2 === 0 ? 'is-even' : 'is-odd'}`}>
                <p className="services-redesign-flow-step">{flow.step}</p>
                <h3>{flow.title}</h3>
                <p>{flow.copy}</p>
                <p className="services-redesign-flow-output">{flow.output}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="section services-redesign-trust">
        <div className="container services-redesign-trust-shell">
          <div className="services-redesign-trust-head">
            <p className="kicker">Client & Partner</p>
            <h2>Dipercaya untuk menjalankan layanan advertising, event, dan booth di seluruh Indonesia</h2>
            <p className="muted">
              Kolaborasi kami mencakup billboard advertising, event organizer, booth exhibition, dan proyek branding lapangan dengan eksekusi presisi dan kualitas premium.
            </p>
          </div>

          <ClientMarquee />
        </div>
      </SectionReveal>

      <SectionReveal className="section services-redesign-faq">
        <div className="container services-redesign-faq-shell">
          <div className="services-redesign-faq-head">
            <p className="kicker">FAQ</p>
            <h2>Pertanyaan yang sering ditanyakan sebelum mulai proyek</h2>
            <p className="muted">
              Jika ada kebutuhan khusus, tim kami siap menyesuaikan ruang lingkup, timeline, dan format layanan.
            </p>
          </div>

          <div className="services-redesign-faq-list">
            {SERVICE_FAQ_ITEMS.map((item, index) => {
              const isOpen = activeFaqIndex === index
              return (
                <article key={item.question} className={`services-redesign-faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="services-redesign-faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setActiveFaqIndex(isOpen ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <strong>{isOpen ? '−' : '+'}</strong>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.p
                        className="services-redesign-faq-answer"
                        initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {item.answer}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </article>
              )
            })}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="section services-redesign-cta">
        <div className="container services-redesign-cta-shell">
          <p className="kicker">Mulai Proyek Anda</p>
          <h2>{ctaTitle}</h2>
          <p className="muted services-redesign-cta-copy">{ctaCopy}</p>
          <div className="services-redesign-cta-actions">
            <Link className="btn" to={ctaPrimaryLink}>{ctaPrimaryLabel}</Link>
            <Link className="btn outline" to={ctaSecondaryLink}>{ctaSecondaryLabel}</Link>
          </div>
        </div>
      </SectionReveal>

      {ENABLE_LAYANAN_WP_ENHANCEMENT && wpPage?.contentHtml ? (
        <SectionReveal className="section cms-page-shell">
          <div className="container">
            <article className="blog-detail-content cms-page-content" dangerouslySetInnerHTML={{ __html: wpPage.contentHtml }} />
          </div>
        </SectionReveal>
      ) : null}
    </div>
  )
}

export default LayananPage
