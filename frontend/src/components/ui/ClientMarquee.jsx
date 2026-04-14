import { useEffect, useMemo, useState } from 'react'

const CLIENT_PARTNERS = [
    {
        name: 'PT Kota Advertise',
        tagline: 'Billboard advertising dan media outdoor',
        initials: 'PK',
        avatarColor: '#2f9ed5',
    },
    {
        name: 'Nexus Event Indonesia',
        tagline: 'Event organizer dan aktivasi brand',
        initials: 'NE',
        avatarColor: '#2f74dd',
    },
    {
        name: 'Prestige Booth Design',
        tagline: 'Booth exhibition dan pameran',
        initials: 'PB',
        avatarColor: '#5078e2',
    },
    {
        name: 'Metro Activation',
        tagline: 'Campaign activation lintas kota',
        initials: 'MA',
        avatarColor: '#248ebf',
    },
]

const MARQUEE_PARTNERS = [...CLIENT_PARTNERS, ...CLIENT_PARTNERS]

function ClientPartnerCard({ partner }) {
    return (
        <article className="services-redesign-trust-marquee-card">
            <div
                className="services-redesign-trust-marquee-avatar"
                style={{ background: `linear-gradient(145deg, ${partner.avatarColor}, #0f2a4a)` }}
                aria-hidden="true"
            >
                {partner.initials}
            </div>
            <div>
                <h3>{partner.name}</h3>
                <p>{partner.tagline}</p>
            </div>
        </article>
    )
}

function ClientMarquee() {
    const [MarqueeComponent, setMarqueeComponent] = useState(null)
    const [canUseMarquee, setCanUseMarquee] = useState(false)

    const partners = useMemo(() => MARQUEE_PARTNERS, [])

    useEffect(() => {
        setCanUseMarquee(typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined')
    }, [])

    useEffect(() => {
        if (!canUseMarquee) return

        let isActive = true

        import('react-fast-marquee')
            .then((module) => {
                if (isActive) {
                    setMarqueeComponent(() => module.default)
                }
            })
            .catch(() => {
                if (isActive) {
                    setMarqueeComponent(null)
                }
            })

        return () => {
            isActive = false
        }
    }, [canUseMarquee])

    if (!canUseMarquee || !MarqueeComponent) {
        return (
            <div className="services-redesign-trust-marquee-fallback" aria-label="Daftar partner layanan Trimitra">
                {partners.map((partner, index) => (
                    <ClientPartnerCard key={`${partner.name}-${index}`} partner={partner} />
                ))}
            </div>
        )
    }

    return (
        <div className="services-redesign-trust-marquee" aria-label="Daftar partner layanan Trimitra">
            <MarqueeComponent
                speed={40}
                gradient
                gradientColor="#0f2a4a"
                gradientWidth={80}
                pauseOnHover
            >
                {partners.map((partner, index) => (
                    <ClientPartnerCard key={`${partner.name}-${index}`} partner={partner} />
                ))}
            </MarqueeComponent>
        </div>
    )
}

export default ClientMarquee
