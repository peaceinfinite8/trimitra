import { useEffect, useRef, useState } from 'react'

/**
 * Custom styled dropdown for mobile category filter.
 * Replaces native <select> which cannot be styled cross-browser.
 */
export default function CategoryDropdown({ filters, activeFilter, categoryCounts, onSelect }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return

        function onPointerDown(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [isOpen])

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return

        function onKeyDown(e) {
            if (e.key === 'Escape') setIsOpen(false)
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen])

    const visibleFilters = filters.filter((f) => {
        const count = categoryCounts[f] ?? 0
        return f === 'Semua' || count > 0
    })

    return (
        <div ref={containerRef} className="cat-dropdown">
            {/* Trigger button */}
            <button
                type="button"
                className="cat-dropdown-trigger"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className="cat-dropdown-label">{activeFilter}</span>
                <span className={`cat-dropdown-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                            d="M2.5 5L7 9.5L11.5 5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>

            {/* Dropdown panel */}
            <div
                className={`cat-dropdown-panel ${isOpen ? 'is-open' : ''}`}
                role="listbox"
                aria-label="Pilih kategori"
            >
                {visibleFilters.map((filter) => {
                    const count = categoryCounts[filter] ?? 0
                    const isActive = filter === activeFilter
                    return (
                        <button
                            key={filter}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={`cat-dropdown-option ${isActive ? 'is-active' : ''}`}
                            onClick={() => {
                                onSelect(filter)
                                setIsOpen(false)
                            }}
                        >
                            <span>{filter}</span>
                            <span className="cat-dropdown-option-count">
                                {String(count).padStart(2, '0')}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
