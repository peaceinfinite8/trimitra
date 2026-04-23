import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const SERVICE_SPLIT_ITEMS = [
    {
        id: '01',
        service: 'Booth Exhibition',
        kicker: 'Layanan Booth Exhibition',
        title: 'Booth Exhibition',
        copy:
            'Custom 3D booth design dan on-site installation untuk eksekusi brand yang rapi, cepat, dan tepat waktu.',
        image: '/images/booth-client.jpg',
        imageAlt: 'Booth pameran client dengan pencahayaan biru dan desain modern.',
        benefits: [
            {
                icon: 'spark',
                title: 'Custom 3D Booth Design',
                copy: 'Dirancang sesuai karakter brand dan tujuan campaign.',
            },
            {
                icon: 'gear',
                title: 'On-Site Installation',
                copy: 'Instalasi langsung di lokasi dengan standar rapi, cepat, dan tepat waktu.',
            },
        ],
        cta: '/kontak-kami',
    },
    {
        id: '02',
        service: 'Event Organizer',
        kicker: 'Layanan Event Organizer',
        title: 'Event Organizer',
        copy:
            'End-to-End Planning dan On-Site Execution untuk event yang berjalan optimal dan tepat waktu.',
        image: '/images/event-organizer-client.jpg',
        imageAlt: 'Suasana event perusahaan dengan stage utama dan audiens.',
        benefits: [
            {
                icon: 'map',
                title: 'End-to-End Planning',
                copy: 'Perencanaan event disusun secara strategis sesuai tujuan brand.',
            },
            {
                icon: 'pulse',
                title: 'On-Site Execution',
                copy: 'Pelaksanaan event dikontrol langsung di lokasi agar berjalan optimal dan tepat waktu.',
            },
        ],
        cta: '/kontak-kami',
    },
    {
        id: '03',
        service: 'Advertising',
        kicker: 'Layanan Advertising',
        title: 'Advertising',
        copy:
            'Location Strategy dan Visual Optimization untuk eksekusi advertising yang lebih terarah dan berdampak.',
        image: '/images/billboard-pasti-alam-sutera.jpg',
        imageAlt: 'Billboard Alam Sutera di area jalan utama.',
        benefits: [
            {
                icon: 'target',
                title: 'Location Strategy',
                copy: 'Penempatan berbasis data traffic dan audience insight.',
            },
            {
                icon: 'layers',
                title: 'Visual Optimization',
                copy: 'Materi dirancang agar impactful dalam waktu lihat yang singkat.',
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

const sectionVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.06,
        },
    },
}

const revealVariants = {
    hidden: {
        opacity: 0,
        y: 18,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.66,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

const gridVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
}

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.985,
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.72,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

const cardMediaVariants = {
    hidden: {
        opacity: 0,
        scale: 1.06,
        rotate: -1,
    },
    show: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            duration: 0.84,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

const featureListVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.12,
        },
    },
}

const featureVariants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.48,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

function ServiceFeatureIcon({ icon }) {
    const paths = FEATURE_ICON_PATHS[icon] || FEATURE_ICON_PATHS.spark

    return (
        <span className="service-showcase-anim-feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" role="presentation">
                {paths.map((d) => (
                    <path key={d} d={d} />
                ))}
            </svg>
        </span>
    )
}

const MotionLink = motion.create(Link)

function ServiceShowcaseSection({ items = SERVICE_SPLIT_ITEMS } = {}) {
    const prefersReducedMotion = useReducedMotion()

    return (
        <motion.section
            className="section service-showcase-section"
            data-gsap-enhance="off"
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.14 }}
        >
            <div className="container service-showcase-container service-showcase-anim-shell">
                <motion.div
                    className="service-showcase-anim-orb service-showcase-anim-orb-left"
                    aria-hidden="true"
                    animate={prefersReducedMotion ? undefined : { y: [0, -12, 0], x: [0, 8, 0], opacity: [0.24, 0.4, 0.24] }}
                    transition={prefersReducedMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="service-showcase-anim-orb service-showcase-anim-orb-right"
                    aria-hidden="true"
                    animate={prefersReducedMotion ? undefined : { y: [0, 14, 0], x: [0, -10, 0], opacity: [0.18, 0.32, 0.18] }}
                    transition={prefersReducedMotion ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div className="service-showcase-head service-showcase-anim-head" variants={revealVariants}>
                    <p className="kicker">Layanan Kami</p>
                    <h2 className="service-showcase-title text-shimmer">Layanan Utama Trimitra</h2>
                    <p className="muted service-showcase-intro-copy">
                        Membantu brand Anda terlihat, diingat, dan dipilih melalui eksekusi yang tepat dan berdampak.
                    </p>
                </motion.div>

                <motion.div className="service-showcase-anim-grid" variants={gridVariants}>
                    {items.map((service, index) => {
                        const cardAccent = [
                            { primary: '#15b8d9', soft: 'rgba(21, 184, 217, 0.18)' },
                            { primary: '#10b981', soft: 'rgba(16, 185, 129, 0.18)' },
                            { primary: '#0ea5e9', soft: 'rgba(14, 165, 233, 0.18)' },
                        ][index] || { primary: '#0ea5e9', soft: 'rgba(14, 165, 233, 0.18)' }

                        return (
                            <motion.article
                                key={service.id}
                                className="service-showcase-anim-card"
                                variants={cardVariants}
                                whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                                style={{
                                    '--service-accent': cardAccent.primary,
                                    '--service-accent-soft': cardAccent.soft,
                                }}
                            >
                                <motion.div className="service-showcase-anim-card-media" variants={cardMediaVariants}>
                                    <img className="service-showcase-anim-image" src={service.image} alt={service.imageAlt} loading="lazy" decoding="async" />
                                    <span className="service-showcase-anim-index" aria-hidden="true">
                                        {service.id}
                                    </span>
                                </motion.div>

                                <div className="service-showcase-anim-copy">
                                    <div className="service-showcase-anim-meta">
                                        <p className="service-sticky-kicker">{service.kicker}</p>
                                        <p className="service-sticky-service">{service.service}</p>
                                    </div>

                                    <h3 className="service-showcase-anim-title">{service.title}</h3>
                                    <p className="service-showcase-anim-description">{service.copy}</p>

                                    <motion.div className="service-showcase-anim-features" variants={featureListVariants}>
                                        {service.benefits.map((benefit) => (
                                            <motion.article key={benefit.title} className="service-showcase-anim-feature" variants={featureVariants}>
                                                <ServiceFeatureIcon icon={benefit.icon} />
                                                <div>
                                                    <h4>{benefit.title}</h4>
                                                    <p>{benefit.copy}</p>
                                                </div>
                                            </motion.article>
                                        ))}
                                    </motion.div>

                                    <MotionLink
                                        className="btn service-showcase-anim-cta"
                                        to={service.cta}
                                        data-magnetic
                                        whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.01 }}
                                        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                                    >
                                        Diskusikan Layanan Ini
                                    </MotionLink>
                                </div>
                            </motion.article>
                        )
                    })}
                </motion.div>
            </div>
        </motion.section>
    )
}

export default ServiceShowcaseSection
