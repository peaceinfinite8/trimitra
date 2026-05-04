import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Shortest-column-first masonry grid.
 *
 * Items are distributed by always appending the next item to whichever column
 * currently has the least estimated total height. This keeps columns balanced
 * regardless of image aspect ratios.
 *
 * After all images in the grid load (or error), a layout recalculation is
 * triggered using actual rendered heights so the columns stay accurate.
 */

const ASPECT_RATIO_BY_TYPE = {
    wide: 16 / 9,
    tall: 3 / 4,
    square: 4 / 3,
}
const DEFAULT_ASPECT_RATIO = 4 / 3

function getColumnCount(containerWidth) {
    if (containerWidth >= 1180) return 3
    if (containerWidth >= 640) return 2
    return 1
}

function getGap(containerWidth, propGap) {
    if (containerWidth > 0 && containerWidth < 640) return 12
    return propGap
}

function estimateItemHeight(item, columnWidth) {
    if (item.width && item.height && item.width > 0) {
        return (item.height / item.width) * columnWidth
    }
    const ratio = ASPECT_RATIO_BY_TYPE[item.type] ?? DEFAULT_ASPECT_RATIO
    return columnWidth / ratio
}

function distributeToColumns(items, columnCount, columnWidth) {
    const columns = Array.from({ length: columnCount }, () => ({ items: [], height: 0 }))

    items.forEach((item) => {
        // Find the shortest column
        const shortestIdx = columns.reduce(
            (minIdx, col, idx) => (col.height < columns[minIdx].height ? idx : minIdx),
            0,
        )
        columns[shortestIdx].items.push(item)
        columns[shortestIdx].height += estimateItemHeight(item, columnWidth)
    })

    return columns.map((col) => col.items)
}

export default function MasonryGrid({ items, renderItem, className = '', gap = 16 }) {
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const [realHeights, setRealHeights] = useState({})

    // Observe container width changes
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const ro = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect?.width ?? 0
            if (width > 0) setContainerWidth(width)
        })
        ro.observe(el)

        // Set initial width
        setContainerWidth(el.getBoundingClientRect().width)

        return () => ro.disconnect()
    }, [])

    const columnCount = getColumnCount(containerWidth)
    const columnWidth = containerWidth > 0
        ? (containerWidth - gap * (columnCount - 1)) / columnCount
        : 0

    // Build height map: prefer real measured heights, fall back to estimates
    const heightMap = useMemo(() => {
        const map = {}
        items.forEach((item) => {
            const key = item.id ?? item.src
            map[key] = realHeights[key] ?? estimateItemHeight(item, columnWidth || 300)
        })
        return map
    }, [items, columnWidth, realHeights])

    // Distribute items shortest-column-first using heightMap
    const columns = useMemo(() => {
        if (columnCount === 1) return [items]

        const cols = Array.from({ length: columnCount }, () => ({ items: [], height: 0 }))
        items.forEach((item) => {
            const key = item.id ?? item.src
            const h = heightMap[key] ?? estimateItemHeight(item, columnWidth || 300)
            const shortestIdx = cols.reduce(
                (minIdx, col, idx) => (col.height < cols[minIdx].height ? idx : minIdx),
                0,
            )
            cols[shortestIdx].items.push(item)
            cols[shortestIdx].height += h
        })
        return cols.map((col) => col.items)
    }, [items, columnCount, columnWidth, heightMap])

    // After render, measure actual image heights and recalculate if needed
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const imgs = Array.from(el.querySelectorAll('img[data-masonry-key]'))
        if (imgs.length === 0) return

        let pending = imgs.filter((img) => !img.complete).length

        function measureAll() {
            const updates = {}
            imgs.forEach((img) => {
                const key = img.dataset.masonryKey
                const wrap = img.closest('.lazy-image-wrap')
                const h = wrap ? wrap.getBoundingClientRect().height : img.getBoundingClientRect().height
                if (h > 0) updates[key] = h
            })
            if (Object.keys(updates).length > 0) {
                setRealHeights((prev) => ({ ...prev, ...updates }))
            }
        }

        if (pending === 0) {
            measureAll()
            return
        }

        function onSettle() {
            pending -= 1
            if (pending <= 0) measureAll()
        }

        imgs.forEach((img) => {
            if (!img.complete) {
                img.addEventListener('load', onSettle, { once: true })
                img.addEventListener('error', onSettle, { once: true })
            }
        })

        return () => {
            imgs.forEach((img) => {
                img.removeEventListener('load', onSettle)
                img.removeEventListener('error', onSettle)
            })
        }
    }, [items, columnCount])

    // Reset real heights when items or column count changes
    useEffect(() => {
        setRealHeights({})
    }, [items, columnCount])

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: `${getGap(containerWidth, gap)}px`,
            }}
        >
            {columns.map((colItems, colIdx) => (
                <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={colIdx}
                    style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${getGap(containerWidth, gap)}px`,
                    }}
                >
                    {colItems.map((item, itemIdx) => {
                        const globalIdx = items.indexOf(item)
                        return renderItem(item, globalIdx, itemIdx, colIdx)
                    })}
                </div>
            ))}
        </div>
    )
}
