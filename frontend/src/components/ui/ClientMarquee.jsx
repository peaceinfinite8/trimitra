import { Component, useEffect, useMemo, useState } from 'react'

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

const marqueeMaskStyle = {
    maskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
}

class ClientMarqueeErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error) {
        console.error('ClientMarquee crashed:', error)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }
        return this.props.children
    }
}

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

    const fallbackContent = (
        <div className="services-redesign-trust-marquee-fallback" aria-label="Daftar partner layanan Trimitra" style={marqueeMaskStyle}>
            {partners.map((partner, index) => (
                <ClientPartnerCard key={`${partner.name}-${index}`} partner={partner} />
            ))}
        </div>
    )

    if (!canUseMarquee || !MarqueeComponent) {
        return fallbackContent
    }

    return (
        <ClientMarqueeErrorBoundary fallback={fallbackContent}>
            <div className="services-redesign-trust-marquee" aria-label="Daftar partner layanan Trimitra" style={marqueeMaskStyle}>
                <MarqueeComponent
                    speed={40}
                    pauseOnHover
                >
                    {partners.map((partner, index) => (
                        <ClientPartnerCard key={`${partner.name}-${index}`} partner={partner} />
                    ))}
                </MarqueeComponent>
            </div>
        </ClientMarqueeErrorBoundary>
    )
}

export default ClientMarquee
