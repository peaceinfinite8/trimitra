import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICE_SPLIT_ITEMS = [
  {
    id: '01',
    service: 'Booth Pameran',
    kicker: 'Layanan Booth & Exhibition',
    title: 'Booth Pameran yang Memperkuat Daya Tarik Brand di Area Event',
    copy:
      'Konsep, produksi, dan instalasi booth dijalankan dalam satu alur agar brand lebih menonjol dan mudah diingat pengunjung.',
    image:
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1300&q=80',
    imageAlt: 'Tim sedang menyiapkan booth pameran modern dengan pencahayaan hangat.',
    benefits: [
      {
        icon: 'spark',
        title: 'Konsep 3D Sesuai Brand',
        copy: 'Desain 3D mengikuti objektif campaign dan karakter brand.',
      },
      {
        icon: 'gear',
        title: 'Produksi & Instalasi Presisi',
        copy: 'Fabrication dan instalasi dikawal ketat agar rapi dan tepat waktu.',
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
      'Perencanaan, rundown, dan operasional event dikelola end-to-end agar aktivasi brand berjalan rapi dan tetap impactful.',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1300&q=80',
    imageAlt: 'Suasana event perusahaan dengan stage utama dan audiens.',
    benefits: [
      {
        icon: 'map',
        title: 'Perencanaan Acara End-to-End',
        copy: 'Alur acara disusun dari pra-produksi sampai evaluasi akhir.',
      },
      {
        icon: 'pulse',
        title: 'Eksekusi Hari-H Terkendali',
        copy: 'Koordinasi tim berjalan real-time agar event tetap stabil.',
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
      'Pemilihan titik dan adaptasi materi outdoor difokuskan untuk visibilitas tinggi dan pesan brand yang cepat terbaca.',
    image:
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1300&q=80',
    imageAlt: 'Billboard outdoor di area kota dengan traffic padat.',
    benefits: [
      {
        icon: 'target',
        title: 'Analisis Titik Penempatan',
        copy: 'Lokasi dipilih dari traffic, visibilitas, dan profil audiens.',
      },
      {
        icon: 'layers',
        title: 'Adaptasi Materi Kreatif',
        copy: 'Materi disesuaikan untuk format outdoor agar cepat dipahami.',
      },
    ],
    cta: '/kontak-kami',
  },
]

const FEATURE_ICON_PATHS = {
  spark: ['M7 12h10M12 7v10', 'M4 4l3 3M17 17l3 3'],
  gear: ['M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7', 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2'],
  map: ['M3 5.5l6-2l6 2l6-2v15l-6 2l-6-2l-6 2z', 'M9 3.5v15M15 5.5v15'],
  pulse: ['M3 12h4l2.2-4.5L13 16l2.2-4h5.8'],
  target: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16', 'M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9', 'M12 2.8v2.4M12 18.8v2.4'],
  layers: ['M12 3.5l8.5 4.8L12 13L3.5 8.3z', 'M3.5 13.3l8.5 4.7l8.5-4.7'],
}

function ServiceFeatureIcon({ icon }) {
  const paths = FEATURE_ICON_PATHS[icon] || FEATURE_ICON_PATHS.spark

  return (
    <span className="service-feature-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" role="presentation">
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  )
}

function ServiceShowcaseSection({ items = SERVICE_SPLIT_ITEMS } = {}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const sectionRef = useRef(null)
  const stickyTrackRef = useRef(null)
  const stickyShellRef = useRef(null)
  const panelRefs = useRef([])
  const ctaRefs = useRef({})

  const showPanel = (index) => {
    const panels = panelRefs.current.filter(Boolean)
    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index
      gsap.set(panel, {
        autoAlpha: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      })
    })
  }

  const animatePanel = (index) => {
    const panel = panelRefs.current[index]
    if (!panel) return

    const image = panel.querySelector('.service-sticky-media-wrap')
    const textNodes = panel.querySelectorAll(
      '.service-sticky-kicker, .service-sticky-service, .service-sticky-heading, .service-sticky-copy, .service-sticky-cta',
    )
    const features = panel.querySelectorAll('.service-sticky-feature')
    const progressValue = panel.querySelector('.service-sticky-progress-value')
    const direction = index % 2 === 0 ? -72 : 72

    gsap.fromTo(
      image,
      { x: direction, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', overwrite: true },
    )

    gsap.fromTo(
      textNodes,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        overwrite: true,
      },
    )

    gsap.fromTo(
      features,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.1,
        ease: 'power2.out',
        overwrite: true,
      },
    )

    gsap.fromTo(
      progressValue,
      { scale: 1.5, opacity: 0, transformOrigin: 'left center' },
      { scale: 1, opacity: 0.08, duration: 0.62, ease: 'power2.out', overwrite: true },
    )
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    ScrollTrigger.matchMedia({
      '(min-width: 769px)': () => {
        const panels = panelRefs.current.filter(Boolean)
        if (!stickyTrackRef.current || !stickyShellRef.current || panels.length === 0) {
          return undefined
        }

        showPanel(0)
        activeIndexRef.current = 0
        setActiveIndex(0)
        animatePanel(0)

        const pinTrigger = ScrollTrigger.create({
          id: 'service-showcase-pin',
          trigger: stickyTrackRef.current,
          start: 'top top+=78',
          end: 'bottom bottom',
          pin: stickyShellRef.current,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            showPanel(activeIndexRef.current)
          },
          onRefresh: () => {
            showPanel(activeIndexRef.current)
          },
          onUpdate: (self) => {
            const total = items.length
            const nextIndex = Math.min(total - 1, Math.floor(self.progress * total))
            if (nextIndex === activeIndexRef.current) return

            const prevPanel = panels[activeIndexRef.current]
            const nextPanel = panels[nextIndex]
            if (!nextPanel) return

            if (prevPanel) {
              gsap.to(prevPanel, {
                autoAlpha: 0,
                duration: 0.36,
                ease: 'power2.out',
                overwrite: true,
                onComplete: () => {
                  gsap.set(prevPanel, { pointerEvents: 'none' })
                },
              })
            }

            gsap.set(nextPanel, { pointerEvents: 'auto' })
            gsap.fromTo(
              nextPanel,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.42, ease: 'power2.out', overwrite: true },
            )

            activeIndexRef.current = nextIndex
            setActiveIndex(nextIndex)
            animatePanel(nextIndex)
          },
        })

        return () => {
          pinTrigger.kill()
        }
      },
      '(max-width: 768px)': () => {
        const cards = section.querySelectorAll('.service-mobile-card')
        const tweens = []

        cards.forEach((card, index) => {
          const tween = gsap.from(card, {
            opacity: 0,
            y: 28,
            duration: 0.58,
            ease: 'power2.out',
            scrollTrigger: {
              id: `service-showcase-mobile-${index}`,
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          })
          tweens.push(tween)
        })

        return () => {
          tweens.forEach((tween) => {
            tween.scrollTrigger?.kill()
            tween.kill()
          })
        }
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith('service-showcase')) {
          trigger.kill()
        }
      })
      ScrollTrigger.refresh()
    }
  }, [])

  useEffect(() => {
    const ctaButtons = Object.values(ctaRefs.current).filter(Boolean)
    const cleanups = []

    ctaButtons.forEach((button) => {
      const handleEnter = () => {
        gsap.to(button, {
          scale: 1.03,
          x: 4,
          duration: 0.24,
          ease: 'power2.out',
          overwrite: true,
        })
      }

      const handleLeave = () => {
        gsap.to(button, {
          scale: 1,
          x: 0,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: true,
        })
      }

      button.addEventListener('mouseenter', handleEnter)
      button.addEventListener('mouseleave', handleLeave)

      cleanups.push(() => {
        button.removeEventListener('mouseenter', handleEnter)
        button.removeEventListener('mouseleave', handleLeave)
      })
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <section className="section service-showcase-section">
      <div className="container service-showcase-container" ref={sectionRef}>
        <div className="service-showcase-head">
          <p className="kicker">Layanan Kami</p>
          <h2 className="service-showcase-title text-shimmer">Solusi Layanan Utama Trimitra</h2>
          <p className="muted service-showcase-intro-copy">
            Tiga layanan inti Trimitra untuk mendorong awareness, engagement, dan eksekusi brand yang lebih presisi.
          </p>
        </div>

        <div className="service-sticky-track" ref={stickyTrackRef}>
          <div className="service-sticky-shell" ref={stickyShellRef}>
            <aside className="service-sticky-nav" aria-label="Navigasi layanan">
              {items.map((service, index) => (
                <div
                  key={`nav-${service.id}`}
                  className={`service-sticky-nav-item ${activeIndex === index ? 'is-active' : ''}`}
                >
                  <span>{service.id}</span>
                  <span className="service-sticky-nav-dot" aria-hidden="true" />
                </div>
              ))}
            </aside>

            <div className="service-sticky-stage" aria-live="polite">
              {items.map((service, index) => {
                const progressValue = `${Math.round(((index + 1) / items.length) * 100)}%`
                return (
                  <article
                    key={service.id}
                    ref={(node) => {
                      panelRefs.current[index] = node
                    }}
                    data-service-id={service.id}
                    className={`service-sticky-panel ${index % 2 === 1 ? 'is-reverse' : ''}`}
                  >
                    <div className="service-sticky-media-wrap">
                      <img className="service-sticky-media" src={service.image} alt={service.imageAlt} loading="lazy" decoding="async" />
                    </div>

                    <div className="service-sticky-content">
                      <div className="service-sticky-progress" aria-hidden="true">
                        <span className="service-sticky-progress-value">{service.id}</span>
                        <span className="service-sticky-progress-track">
                          <span className="service-sticky-progress-fill" style={{ width: progressValue }} />
                        </span>
                      </div>

                      <p className="service-sticky-kicker">{service.kicker}</p>
                      <p className="service-sticky-service">{service.service}</p>
                      <h3 className="service-sticky-heading">{service.title}</h3>
                      <p className="service-sticky-copy">{service.copy}</p>

                      <div className="service-sticky-features">
                        {service.benefits.map((benefit) => (
                          <article key={benefit.title} className="service-sticky-feature">
                            <ServiceFeatureIcon icon={benefit.icon} />
                            <div>
                              <h4>{benefit.title}</h4>
                              <p>{benefit.copy}</p>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="service-sticky-cta">
                        <Link
                          className="btn service-cta-btn"
                          to={service.cta}
                          ref={(node) => {
                            ctaRefs.current[`desktop-${service.id}`] = node
                          }}
                        >
                          Diskusikan Layanan Ini
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>

        <div className="service-mobile-list">
          {items.map((service) => (
            <article key={`mobile-${service.id}`} className="service-mobile-card">
              <div className="service-mobile-media-wrap">
                <img className="service-mobile-media" src={service.image} alt={service.imageAlt} loading="lazy" decoding="async" />
              </div>

              <div className="service-mobile-content">
                <div className="service-mobile-head">
                  <span className="service-mobile-index">{service.id}</span>
                  <p className="service-sticky-kicker">{service.kicker}</p>
                </div>
                <h3 className="service-sticky-heading">{service.title}</h3>
                <p className="service-sticky-copy">{service.copy}</p>

                <div className="service-sticky-features">
                  {service.benefits.map((benefit) => (
                    <article key={`mobile-${benefit.title}`} className="service-sticky-feature">
                      <ServiceFeatureIcon icon={benefit.icon} />
                      <div>
                        <h4>{benefit.title}</h4>
                        <p>{benefit.copy}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <Link
                  className="btn service-cta-btn"
                  to={service.cta}
                  ref={(node) => {
                    ctaRefs.current[`mobile-${service.id}`] = node
                  }}
                >
                  Diskusikan Layanan Ini
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceShowcaseSection
