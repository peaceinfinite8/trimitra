import { useEffect, useState } from 'react'

// Durations (ms) — keep total under 400ms
const HOLD_MS = 180   // how long to show before starting fade-out
const FADE_MS = 200   // CSS opacity transition duration

function RouteTransitionLoader({ label = 'Memuat halaman' }) {
    const [exiting, setExiting] = useState(false)

    useEffect(() => {
        const holdTimer = window.setTimeout(() => setExiting(true), HOLD_MS)
        return () => window.clearTimeout(holdTimer)
    }, [])

    return (
        <div
            className="page-loader-overlay"
            role="status"
            aria-live="polite"
            aria-label={label}
            style={{
                opacity: exiting ? 0 : 1,
                transition: `opacity ${FADE_MS}ms ease-out`,
                pointerEvents: 'none',
            }}
        >
            <div className="page-loader-mark">
                <div className="page-loader-aura" />
                <div className="page-loader-ring" />
                <img className="page-loader-logo" src="/logo-trimitra.webp" alt="Trimitra" />
            </div>
        </div>
    )
}

export default RouteTransitionLoader
