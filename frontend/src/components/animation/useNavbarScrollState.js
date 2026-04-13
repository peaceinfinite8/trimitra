import { useEffect, useState } from 'react'

const DEFAULT_THRESHOLD = 80
const DEFAULT_HERO_SELECTOR = '[data-nav-hero]'

export function useNavbarScrollState({ threshold = DEFAULT_THRESHOLD, heroSelector = DEFAULT_HERO_SELECTOR, routeKey = '' } = {}) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let disposed = false
    let hasHero = false

    const updateState = () => {
      if (disposed) return
      setIsScrolled(window.scrollY > threshold || !hasHero)
    }

    const evaluateHeroPresence = () => {
      if (disposed) return
      hasHero = Boolean(document.querySelector(heroSelector))
      document.body.classList.toggle('nav-over-hero', hasHero)
      updateState()
    }

    const updateScrollState = () => {
      updateState()
    }

    evaluateHeroPresence()

    // Route transitions and HMR can mount hero slightly after this effect runs.
    let probeCount = 0
    const probeTimerId = window.setInterval(() => {
      probeCount += 1
      evaluateHeroPresence()
      if (probeCount >= 12) {
        window.clearInterval(probeTimerId)
      }
    }, 80)

    const observer = new MutationObserver(() => {
      evaluateHeroPresence()
    })

    if (document.body) {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-nav-hero'],
      })
    }

    window.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      disposed = true
      window.clearInterval(probeTimerId)
      observer.disconnect()
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
      document.body.classList.remove('nav-over-hero')
    }
  }, [heroSelector, routeKey, threshold])

  return isScrolled
}