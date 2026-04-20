import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
    {
        id: '01',
        label: 'Quality Assurance',
        title: 'Material Berkualitas Tinggi',
        stat: '98% on-time handover',
        ctaLabel: 'Konsultasi Material',
        ctaTo: '/kontak-kami',
        image: '/images/billboard-pasti-alam-sutera.jpg',
        description: 'Kami menyaring bahan konstruksi terbaik untuk ketahanan jangka panjang dan estetika yang tetap relevan.',
    },
    {
        id: '02',
        label: 'Design Precision',
        title: 'Presisi Arsitektural',
        stat: '350+ proyek terukur',
        ctaLabel: 'Lihat Layanan Desain',
        ctaTo: '/layanan',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
        description: 'Setiap sudut dirancang melalui koordinasi lintas disiplin agar komposisi ruang, struktur, dan estetika tetap harmonis.',
    },
    {
        id: '03',
        label: 'Execution Control',
        title: 'Manajemen Proyek Transparan',
        stat: 'Realtime progress report',
        ctaLabel: 'Diskusikan Proyek',
        ctaTo: '/kontak-kami',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
        description: 'Laporan progres tersusun jelas, milestone terpantau, dan keputusan eksekusi berjalan berbasis data lapangan aktual.',
    },
    {
        id: '04',
        label: 'Post Build Service',
        title: 'Garansi Pasca-Bangun',
        stat: 'Aftercare terstruktur',
        ctaLabel: 'Pelajari Dukungan Kami',
        ctaTo: '/layanan',
        image: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1400&q=80',
        description: 'Pendampingan layanan tetap hadir setelah serah terima untuk memastikan performa ruang sesuai standar yang dijanjikan.',
    },
]

const AUTO_ADVANCE_MS = 4000

function ValueNarrativeSection({ values = SLIDES } = {}) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [progressSeed, setProgressSeed] = useState(0)
    const [resetToken, setResetToken] = useState(0)

    useEffect(() => {
        if (typeof window === 'undefined') return undefined

        const intervalId = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % values.length)
            setProgressSeed((prev) => prev + 1)
        }, AUTO_ADVANCE_MS)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [values.length, resetToken])

    const handleStepperClick = (index) => {
        setActiveIndex(index)
        setProgressSeed((prev) => prev + 1)
        setResetToken((prev) => prev + 1)
    }

    const activeSlide = values[activeIndex]

    return (
        <section className="section quality-kami-section" data-gsap-section data-gsap-enhance="off">
            <div className="container quality-kami-intro">
                <p className="quality-kami-kicker">KUALITAS KAMI</p>
                <p className="quality-kami-subtitle">
                    Kerangka kerja kami menjaga kualitas tetap konsisten dari fase konsep hingga fase pasca-bangun.
                </p>
            </div>

            <div className="container quality-kami-shell">
                <div className="quality-kami-stepper" role="list" aria-label="Langkah kualitas Trimitra">
                    {values.map((item, index) => {
                        const isActive = activeIndex === index

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={`quality-kami-step ${isActive ? 'is-active' : ''}`}
                                onClick={() => handleStepperClick(index)}
                                aria-current={isActive ? 'step' : undefined}
                                aria-label={`${item.id} ${item.label}`}
                            >
                                <div className="quality-kami-step-head">
                                    <span className="quality-kami-step-number">{item.id}</span>
                                    <div className="quality-kami-step-copy">
                                        <span className="quality-kami-step-tag">{item.label.toUpperCase()}</span>
                                        <span className="quality-kami-step-title">{item.title}</span>
                                    </div>
                                </div>
                                <span className="quality-kami-step-progress" aria-hidden="true">
                                    <span
                                        key={`${item.id}-${progressSeed}`}
                                        className={`quality-kami-step-progress-fill ${isActive ? 'is-active' : ''}`}
                                    />
                                </span>
                            </button>
                        )
                    })}
                </div>

                <article className="quality-kami-panel" aria-live="polite">
                    <div className="quality-kami-media">
                        <img src={activeSlide.image} alt={activeSlide.title} loading="eager" decoding="async" />
                        <div className="quality-kami-overlay" />
                        <div className="quality-kami-media-meta">
                            <p className="quality-kami-slide-kicker">{activeSlide.label.toUpperCase()}</p>
                            <h3 className="quality-kami-media-title">{activeSlide.title}</h3>
                            <Link className="btn" to={activeSlide.ctaTo}>
                                {activeSlide.ctaLabel}
                            </Link>
                        </div>
                    </div>

                    <div className="quality-kami-copy">
                        <p className="quality-kami-slide-kicker">{activeSlide.label.toUpperCase()}</p>
                        <h3 className="quality-kami-slide-title">{activeSlide.title}</h3>
                        <p className="quality-kami-slide-copy">{activeSlide.description}</p>
                        <p className="quality-kami-slide-stat">{activeSlide.stat}</p>
                        <Link className="btn" to={activeSlide.ctaTo}>
                            {activeSlide.ctaLabel}
                        </Link>
                    </div>
                </article>
            </div>
        </section>
    )
}

export default ValueNarrativeSection