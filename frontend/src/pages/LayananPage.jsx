import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { billboardData, boothData, eventData } from '../data/layananData'
import { getWordPressGalleryMedia, isWordPressConfiguredForPages } from '../data/wordpressPages'

const heroLines = ['Tiga Solusi.', 'Satu Partner.', 'Eksekusi Penuh.']
const heroLineDelays = [0.1, 0.25, 0.4]

const BASE_SECTION_ITEMS = [
  {
    id: 'billboard',
    label: billboardData.label,
    number: '01',
    titleLines: ['Billboard yang', 'Bicara Lebih', 'Keras dari Kata'],
    accentWord: 'Billboard',
    description: 'Kami merancang dan memasang media luar ruang yang memastikan brand Anda terlihat oleh ribuan orang setiap hari. Dengan jaringan 150+ lokasi strategis di 40+ kota, kami pastikan pesan Anda hadir di titik dengan visibilitas tertinggi.',
    chips: ['150+ Lokasi', '40+ Kota', '98% On-Time'],
    image: 'https://images.unsplash.com/photo-1598908314732-07113901949e?w=800&q=80',
    floatingTop: '150+ LOKASI AKTIF',
    floatingBottom: 'Sejak 2017',
    dark: true,
    reverse: false,
    buttonTheme: 'sky',
  },
  {
    id: 'event',
    label: eventData.label,
    number: '02',
    titleLines: ['Event yang', 'Dikenang,', 'Bukan Sekadar Dihadiri'],
    accentWord: 'Dikenang,',
    description: 'Kami tidak hanya mengelola logistik - kami merancang pengalaman. Dari konsep kreatif, tata panggung, vendor management, hingga dokumentasi pasca-event, semua berjalan dalam satu koordinasi yang rapi dan terukur.',
    chips: ['Konsep Kreatif', 'Manajemen Vendor', 'On-Site Execution'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    floatingTop: '250+ EVENT SUKSES',
    floatingBottom: '',
    dark: false,
    reverse: true,
    buttonTheme: 'navy',
  },
  {
    id: 'booth',
    label: boothData.label,
    number: '03',
    titleLines: ['Booth yang', 'Menjadi Magnet', 'di Tengah Keramaian'],
    accentWord: 'Magnet',
    description: 'Kami mendesain booth yang bukan sekadar tempat berdiri - tapi pengalaman spatial yang membuat pengunjung berhenti, masuk, dan berdialog. Dengan pendekatan spatial storytelling dan material premium, booth Anda tampil beda dari yang lain.',
    chips: ['Spatial Design', 'Material Premium', 'Instalasi Presisi'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    floatingTop: '350+ BOOTH SELESAI',
    floatingBottom: '',
    dark: true,
    reverse: false,
    buttonTheme: 'sky',
  },
]

const SERVICE_CATEGORY_MAP = {
  billboard: 'Billboard',
  event: 'Event',
  booth: 'Booth Pameran',
}

function applyGalleryServiceImages(baseItems, galleryItems = []) {
  if (!Array.isArray(galleryItems) || galleryItems.length === 0) return baseItems

  return baseItems.map((item) => {
    const targetCategory = SERVICE_CATEGORY_MAP[item.id]
    if (!targetCategory) return item

    const matchedGalleryImage = galleryItems.find((galleryItem) => galleryItem?.category === targetCategory)
    if (!matchedGalleryImage?.src) return item

    return {
      ...item,
      image: matchedGalleryImage.src,
    }
  })
}

function HeroLine({ text, delayStart = 0, className = '' }) {
  return (
    <span className={className}>
      <motion.span
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: delayStart, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  )
}

function ServiceHeading({ item }) {
  return (
    <h2 className="lp-service-heading">
      {item.titleLines.map((line) => {
        if (!line.includes(item.accentWord)) return <span key={line}>{line}</span>
        const [before, after] = line.split(item.accentWord)
        if (item.id === 'event') {
          return (
            <span key={line}>
              {before}
              <strong className="lp-accent lp-accent-event">{item.accentWord}</strong>
              {after}
            </span>
          )
        }
        return (
          <span key={line}>
            {before}
            <strong className="lp-accent">{item.accentWord}</strong>
            {after}
          </span>
        )
      })}
    </h2>
  )
}

function ServiceSection({ item }) {
  return (
    <section
      id={`lp-${item.id}`}
      className={`lp-section lp-service is-${item.id} ${item.dark ? 'is-dark' : 'is-light'} ${item.reverse ? 'is-reverse' : ''}`}
    >
      <div className="lp-service-inner">
        <motion.div
          className="lp-service-copy"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className={`lp-watermark ${item.dark ? 'is-dark' : 'is-light'}`}
            style={{ opacity: item.id === 'event' ? 0.06 : 0.12 }}
          >
            {item.number}
          </span>
          <p className="lp-label">{item.label}</p>
          <ServiceHeading item={item} />
          <p className="lp-description">{item.description}</p>

          <div className="lp-chip-row">
            {item.chips.map((chip) => (
              <span
                key={chip}
                className="lp-chip"
              >
                {chip}
              </span>
            ))}
          </div>

          <Link
            to={`/layanan/detail-${item.id}`}
            className={`lp-button ${item.buttonTheme === 'sky' ? 'is-sky' : 'is-navy'}`}
          >
            LIHAT DETAIL LAYANAN
          </Link>
        </motion.div>

        <motion.div
          className="lp-service-media"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={item.image}
            alt={item.label}
            loading="lazy"
            decoding="async"
            className="lp-media-image"
          />
          {item.floatingTop ? <span className="lp-floating-badge top">{item.floatingTop}</span> : null}
          {item.floatingBottom ? <span className="lp-floating-badge bottom">{item.floatingBottom}</span> : null}
        </motion.div>
      </div>
    </section>
  )
}

function LayananPage() {
  const [galleryItems, setGalleryItems] = useState([])

  useEffect(() => {
    let cancelled = false

    async function loadGalleryImages() {
      if (!isWordPressConfiguredForPages()) return

      try {
        const wpGallery = await getWordPressGalleryMedia({ perPage: 100, allPages: true })
        if (!cancelled) {
          setGalleryItems(wpGallery)
        }
      } catch {
        if (!cancelled) {
          setGalleryItems([])
        }
      }
    }

    loadGalleryImages()

    return () => {
      cancelled = true
    }
  }, [])

  const sectionItems = useMemo(
    () => applyGalleryServiceImages(BASE_SECTION_ITEMS, galleryItems),
    [galleryItems],
  )

  return (
    <>
      <style>{`
        .lp-section {
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .lp-hero {
          min-height: 80vh;
          background:
            radial-gradient(1000px 620px at 8% 10%, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 70%),
            radial-gradient(920px 560px at 90% 8%, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0) 70%),
            linear-gradient(150deg, #091a32 0%, #0c2340 48%, #102e50 100%);
          color: #fff;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 120px 24px 80px;
          position: relative;
        }
        .lp-hero::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 180px;
          background: linear-gradient(180deg, transparent 0%, rgba(6, 20, 43, 0.76) 42%, rgba(6, 20, 43, 1) 100%);
          pointer-events: none;
          z-index: 2;
        }
        .lp-hero-orb {
          position: absolute;
          width: min(50vw, 600px);
          aspect-ratio: 1;
          border-radius: 50%;
          top: -20%;
          right: -10%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 60%);
          filter: blur(40px);
          animation: lpOrbFloat 10s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 0;
        }
        .lp-hero-inner {
          max-width: 980px;
          display: grid;
          gap: 24px;
          position: relative;
          z-index: 3;
        }
        .lp-pill {
          margin: 0 auto;
          width: fit-content;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          background: rgba(56, 189, 248, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #7dd3fc;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.08em;
        }
        .lp-hero-title {
          margin: 0;
          display: grid;
          gap: 8px;
          font: 800 clamp(42px, 7vw, 84px)/1.05 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .lp-hero-line,
        .lp-hero-line span { display: inline-block; }
        .lp-hero-line.sky { color: #38bdf8; }
        .lp-hero-copy {
          margin: 0 auto;
          max-width: 580px;
          color: rgba(255, 255, 255, 0.7);
          font: 500 clamp(16px, 1.5vw, 20px)/1.7 'Inter', system-ui, sans-serif;
        }
        .lp-scroll-note {
          margin: 12px auto 0;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: grid;
          gap: 8px;
          justify-items: center;
        }
        .lp-scroll-note i {
          font-style: normal;
          animation: lpBounce 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          opacity: 0.6;
        }

        .lp-service {
          min-height: 90vh;
          display: grid;
          align-items: center;
          padding: 80px 8%;
          background: transparent;
          color: #0a1628;
        }
        .lp-service.is-dark {
          background:
            radial-gradient(900px 520px at 10% 12%, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0) 66%),
            radial-gradient(760px 460px at 92% 84%, rgba(29, 78, 216, 0.28) 0%, rgba(29, 78, 216, 0) 72%),
            linear-gradient(130deg, #06142b 0%, #0a2342 52%, #123563 100%);
          color: #e6f2ff;
        }
        .lp-service.is-light {
          background:
            radial-gradient(900px 520px at 10% 12%, rgba(186, 230, 253, 0.42) 0%, rgba(186, 230, 253, 0) 66%),
            linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
          color: #0a1628;
        }

        .lp-service.is-dark .lp-label {
          color: #60d0ff;
        }
        .lp-service.is-dark .lp-watermark {
          color: rgba(228, 243, 255, 0.09);
        }
        .lp-service.is-dark .lp-service-heading {
          color: #f2f8ff;
        }
        .lp-service.is-dark .lp-accent {
          color: #7dd3fc;
        }
        .lp-service.is-dark .lp-description {
          color: rgba(230, 242, 255, 0.84);
        }
        .lp-service.is-dark .lp-chip {
          background: rgba(8, 28, 52, 0.66);
          border-color: rgba(160, 213, 255, 0.28);
          color: #e8f3ff;
        }
        .lp-service.is-dark .lp-service-media {
          border-color: rgba(142, 206, 255, 0.26);
          box-shadow: 0 24px 64px rgba(4, 10, 22, 0.42);
          background: rgba(255, 255, 255, 0.08);
        }
        .lp-service.is-dark .lp-floating-badge {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.15);
          color: #f8fbff;
        }

        .lp-service.is-event {
          background: #f6fbff;
          color: #ffffff;
          isolation: isolate;
        }
        .lp-service.is-event::before,
        .lp-service.is-event::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 180px;
          pointer-events: none;
          z-index: 0;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .lp-service.is-event::before {
          top: -1px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.18) 100%);
        }
        .lp-service.is-event::after {
          bottom: -1px;
          background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.18) 100%);
        }
        .lp-service.is-event .lp-service-inner {
          position: relative;
          z-index: 1;
          padding: clamp(28px, 4vw, 48px);
          border-radius: 36px;
          background:
            radial-gradient(900px 520px at 10% 18%, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0) 60%),
            linear-gradient(130deg, rgba(6, 20, 43, 0.97) 0%, rgba(10, 35, 66, 0.97) 52%, rgba(18, 53, 99, 0.96) 100%);
          box-shadow: 0 28px 80px rgba(4, 10, 22, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
        }
        .lp-service.is-event .lp-service-copy,
        .lp-service.is-event .lp-service-media {
          position: relative;
          z-index: 1;
        }
        .lp-service.is-event .lp-service-copy {
          color: #fff;
        }
        .lp-service.is-event .lp-label {
          color: rgba(255, 255, 255, 0.82);
        }
        .lp-service.is-event .lp-watermark {
          color: rgba(255, 255, 255, 0.08);
        }
        .lp-service.is-event .lp-service-heading {
          color: #ffffff;
        }
        .lp-service.is-event .lp-accent-event {
          color: #ffffff;
          border-bottom: 3px solid rgba(125, 211, 252, 0.7);
        }
        .lp-service.is-event .lp-description {
          color: #ffffff !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
        }
        .lp-service.is-event .lp-chip {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.18);
          color: #ffffff !important;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
        }
        .lp-service.is-event .lp-service-media {
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 24px 64px rgba(4, 10, 22, 0.42);
          background: rgba(255, 255, 255, 0.08);
        }
        .lp-service.is-event .lp-floating-badge {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.18);
          color: #fff;
        }

        .lp-service-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
        .lp-service.is-reverse .lp-service-inner { direction: rtl; }
        .lp-service.is-reverse .lp-service-inner > * { direction: ltr; }

        .lp-service-copy {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 20px;
        }
        .lp-watermark {
          position: absolute;
          top: -80px;
          left: -10px;
          font: 900 clamp(140px, 15vw, 220px)/1 'Plus Jakarta Sans', sans-serif;
          pointer-events: none;
          z-index: 0;
          color: rgba(10, 22, 40, 0.03);
          letter-spacing: -0.04em;
        }

        .lp-label,
        .lp-service-heading,
        .lp-description,
        .lp-chip-row,
        .lp-button {
          position: relative;
          z-index: 1;
        }
        .lp-label {
          margin: 0;
          color: #0ea5e9;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lp-service.is-light .lp-label { color: #0ea5e9; }

        .lp-service-heading {
          margin: 0;
          font: 800 clamp(38px, 5vw, 64px)/1.1 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: -0.02em;
          display: grid;
          gap: 6px;
        }
        .lp-service-heading span { display: block; }
        .lp-accent { color: #0ea5e9; }
        .lp-accent-event {
          color: #0a1628;
          border-bottom: 3px solid rgba(14, 165, 233, 0.4);
          padding-bottom: 2px;
        }

        .lp-description {
          margin: 0;
          color: rgba(10, 22, 40, 0.75);
          font-weight: 400;
          font-size: 17px;
          line-height: 1.7;
          max-width: 580px;
        }
        .lp-service.is-light .lp-description { color: rgba(10, 22, 40, 0.75); }

        .lp-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .lp-chip {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(10, 22, 40, 0.08);
          color: #0a1628;
          border-radius: 100px;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 13px;
        }
        .lp-service.is-light .lp-chip {
          border-color: rgba(10, 22, 40, 0.08);
          color: #0a1628;
        }

        .lp-button {
          margin-top: 16px;
          width: fit-content;
          border-radius: 100px;
          padding: 14px 28px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          background: #0ea5e9;
          color: #fff;
          border: none;
          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.25);
        }
        .lp-button:hover { 
          transform: scale(1.02); 
          background: #0284c7;
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
        }
        .lp-button.is-navy {
          background: #0a1628;
          box-shadow: 0 4px 14px rgba(10, 22, 40, 0.2);
          color: #fff;
        }
        .lp-button.is-navy:hover {
          background: #1e293b;
          transform: scale(1.02);
        }

        .lp-service-media {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 4/5;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .lp-media-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .lp-floating-badge {
          position: absolute;
          padding: 10px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.02em;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          color: #0a1628;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .lp-floating-badge.top {
          top: 24px;
          right: 24px;
        }
        .lp-floating-badge.bottom {
          bottom: 24px;
          left: 24px;
        }

        .lp-cta {
          min-height: 60vh;
          background: transparent;
          display: grid;
          place-items: center;
          padding: 120px 24px;
          position: relative;
        }
        .lp-cta-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 640px;
          display: grid;
          gap: 20px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.6);
          padding: 64px 40px;
          border-radius: 32px;
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 24px 64px rgba(0,0,0,0.06);
        }
        .lp-cta-inner h3 {
          margin: 0;
          color: #0a1628;
          font: 800 clamp(32px, 4.5vw, 48px)/1.1 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: -0.02em;
        }
        .lp-cta-inner p {
          margin: 0;
          color: rgba(10, 22, 40, 0.75);
          font-weight: 400;
          font-size: 18px;
          line-height: 1.6;
        }
        .lp-cta-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          margin-top: 12px;
        }
        .lp-cta-actions a {
          text-decoration: none;
          border-radius: 100px;
          padding: 14px 28px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .lp-cta-actions .primary { 
          background: #0ea5e9; 
          color: #fff; 
          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
        }
        .lp-cta-actions .secondary {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(10, 22, 40, 0.15);
          color: #0a1628;
        }
        .lp-cta-actions .primary:hover {
          transform: scale(1.02);
          background: #0284c7;
        }
        .lp-cta-actions .secondary:hover { 
          background: #fff;
          transform: scale(1.02);
          border-color: rgba(10, 22, 40, 0.3);
        }

        @media (max-width: 1023px) {
          .lp-service {
            padding: 80px 24px;
          }
          .lp-service-inner {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .lp-service.is-reverse .lp-service-inner { direction: ltr; }
          .lp-service-media { order: -1; aspect-ratio: 16/10; }
        }

        @media (max-width: 768px) {
          .lp-hero {
            padding: 100px 24px 60px;
          }
          .lp-service {
            padding: 64px 24px;
          }
          .lp-service-media {
            border-radius: 20px;
            aspect-ratio: 1/1;
          }
          .lp-cta-inner {
            padding: 48px 24px;
            border-radius: 24px;
          }
        }

        @keyframes lpBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes lpOrbFloat {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-40px, 30px); }
        }
      `}</style>


      <div className="home-page-lumen">
        <section id="lp-hero" className="lp-section lp-hero" data-nav-hero>
          <div className="lp-hero-orb" aria-hidden="true" />
          <div className="lp-hero-inner">
            <p className="lp-pill">? PRODUK & JASA TRIMITRA</p>

            <h1 className="lp-hero-title">
              {heroLines.map((line, lineIndex) => (
                <HeroLine
                  key={line}
                  text={line}
                  delayStart={heroLineDelays[lineIndex]}
                  className={`lp-hero-line ${line === 'Satu Partner.' ? 'sky' : ''}`}
                />
              ))}
            </h1>

            <p className="lp-hero-copy">
              Dari billboard yang dilihat ribuan orang, event yang tak terlupakan, hingga booth yang menjadi magnet pameran -
              semua kami kerjakan dengan standar yang sama: presisi, kreatif, dan tepat waktu.
            </p>

            <div className="lp-scroll-note" aria-hidden="true">
              <span>SCROLL</span>
              <i>?</i>
            </div>
          </div>
        </section>

        {sectionItems.map((item) => (
          <ServiceSection
            key={item.id}
            item={item}
          />
        ))}

        <section className="lp-section lp-cta">
          <motion.div
            className="lp-cta-inner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <motion.h3 variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>Butuh Lebih dari Satu Layanan?</motion.h3>
            <motion.p variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
              Banyak klien kami menggabungkan ketiganya - billboard untuk awareness, event untuk engagement, dan booth untuk
              konversi langsung. Kami koordinasikan semuanya dalam satu tim.
            </motion.p>
            <motion.div className="lp-cta-actions" variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
              <Link to="/kontak-kami" className="primary">KONSULTASI SEKARANG</Link>
              <Link to="/tentang-kami" className="secondary">PELAJARI CARA KERJA KAMI</Link>
            </motion.div>
          </motion.div>
        </section>
      </div>



    </>
  )
}

export default LayananPage
