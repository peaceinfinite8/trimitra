import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionReveal } from '../animation/Reveal'

const SERVICE_SPLIT_ITEMS = [
  {
    id: '01',
    service: 'Booth Pameran',
    kicker: 'Layanan Booth & Exhibition',
    title: 'Booth Pameran yang Memperkuat Daya Tarik Brand di Area Event',
    copy:
      'Tim Trimitra menangani booth dari tahap konsep, produksi, hingga instalasi agar brand tampil menonjol, mudah dikenali, dan siap mendukung target interaksi pengunjung.',
    image:
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1300&q=80',
    imageAlt: 'Tim sedang menyiapkan booth pameran modern dengan pencahayaan hangat.',
    benefits: [
      {
        title: 'Konsep 3D Sesuai Brand',
        copy: 'Desain visual dirancang berdasarkan objektif campaign, karakter brand, dan kebutuhan area pameran.',
      },
      {
        title: 'Produksi & Instalasi Presisi',
        copy: 'Proses fabrication dan pemasangan dikelola terukur agar kualitas rapi dan timeline tetap aman.',
      },
    ],
    cta: '/kontak-kami',
  },
  {
    id: '02',
    service: 'Event Organizer',
    kicker: 'Layanan Event & Aktivasi',
    title: 'Event Organizer untuk Aktivasi Brand yang Terukur dan Berkesan',
    copy:
      'Kami mengelola event dari perencanaan konsep, rundown, hingga koordinasi pelaksanaan agar acara berjalan rapi, audiens tetap engaged, dan pesan brand tersampaikan kuat.',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1300&q=80',
    imageAlt: 'Suasana event perusahaan dengan stage utama dan audiens.',
    benefits: [
      {
        title: 'Perencanaan Acara End-to-End',
        copy: 'Struktur acara disusun dari pra-produksi hingga evaluasi untuk menjaga kualitas eksekusi.',
      },
      {
        title: 'Eksekusi Hari-H Terkendali',
        copy: 'Koordinasi tim kreatif, teknis, dan operasional dijalankan real-time selama event berlangsung.',
      },
    ],
    cta: '/kontak-kami',
  },
  {
    id: '03',
    service: 'Media Outdoor',
    kicker: 'Layanan Billboard & Outdoor',
    title: 'Media Outdoor Strategis untuk Jangkauan dan Recall yang Lebih Kuat',
    copy:
      'Layanan media outdoor Trimitra fokus pada pemilihan titik strategis, adaptasi materi visual, dan konsistensi eksposur agar pesan brand cepat terbaca di jalur traffic tinggi.',
    image:
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1300&q=80',
    imageAlt: 'Billboard outdoor di area kota dengan traffic padat.',
    benefits: [
      {
        title: 'Analisis Titik Penempatan',
        copy: 'Pemilihan lokasi dilakukan berbasis arus kendaraan, visibilitas, dan profil audiens area.',
      },
      {
        title: 'Adaptasi Materi Kreatif',
        copy: 'Materi visual dioptimalkan untuk format outdoor agar tetap jelas dan mudah dipahami sekilas.',
      },
    ],
    cta: '/layanan',
  },
]

function ServiceShowcaseSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <SectionReveal className="section service-showcase-section">
      <div className="container service-showcase-container">
        <div className="service-showcase-head">
          <p className="kicker">Layanan Kami</p>
          <h2 className="service-showcase-title text-shimmer">Solusi Layanan Utama Trimitra</h2>
          <p className="muted">
            Tiga layanan utama kami dirancang untuk membantu brand tampil menonjol melalui
            booth pameran, event organizer, dan media outdoor dengan eksekusi yang presisi.
          </p>
        </div>

        <div className="service-split-list">
          {SERVICE_SPLIT_ITEMS.map((service, index) => (
            <motion.article
              key={service.id}
              className={`service-split-block ${index % 2 === 1 ? 'is-reverse' : ''}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 } }
              }
            >
              <span className="service-split-accent-number" aria-hidden="true">{service.id}</span>

              <div className="service-split-visual-wrap">
                <img className="service-split-visual" src={service.image} alt={service.imageAlt} loading="lazy" />
              </div>

              <div className="service-split-content">
                <div className="service-split-eyebrow">
                  <span className="service-split-index">{service.id}</span>
                  <p className="service-split-kicker">{service.kicker}</p>
                </div>

                <p className="service-split-service">{service.service}</p>
                <h3>{service.title}</h3>
                <p className="service-split-copy">{service.copy}</p>

                <div className="service-split-benefits">
                  {service.benefits.map((benefit) => (
                    <article key={benefit.title} className="service-split-benefit-card">
                      <span className="service-benefit-icon" aria-hidden="true" />
                      <h4>{benefit.title}</h4>
                      <p>{benefit.copy}</p>
                    </article>
                  ))}
                </div>

                <div className="service-split-cta">
                  <Link className="btn" to={service.cta}>Diskusikan Layanan Ini</Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionReveal>
  )
}

export default ServiceShowcaseSection
