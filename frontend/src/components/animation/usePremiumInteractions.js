import { useEffect } from 'react'

const DESKTOP_POINTER_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'

function setupMagneticButtons(root) {
  const buttons = Array.from(root.querySelectorAll('[data-magnetic], .cta-button'))
  const listeners = []

  buttons.forEach((button) => {
    const onMove = (event) => {
      const rect = button.getBoundingClientRect()
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 10
      button.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`
    }

    const onLeave = () => {
      button.style.transform = 'translate3d(0, 0, 0)'
    }

    button.addEventListener('mousemove', onMove)
    button.addEventListener('mouseleave', onLeave)
    listeners.push(() => {
      button.removeEventListener('mousemove', onMove)
      button.removeEventListener('mouseleave', onLeave)
      button.style.transform = 'translate3d(0, 0, 0)'
    })
  })

  return () => {
    listeners.forEach((dispose) => dispose())
  }
}

function setupTiltCards(root) {
  const cards = Array.from(
    root.querySelectorAll(
      '[data-tilt-card], .journal-card, .portfolio-card, .service-split-benefit-card, .blog-card',
    ),
  )
  const listeners = []

  cards.forEach((card) => {
    const onMove = (event) => {
      const rect = card.getBoundingClientRect()
      const xRatio = (event.clientX - rect.left) / rect.width
      const yRatio = (event.clientY - rect.top) / rect.height
      const rotateY = (xRatio - 0.5) * 7
      const rotateX = (0.5 - yRatio) * 6

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`
    }

    const onLeave = () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)

    listeners.push(() => {
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    })
  })

  return () => {
    listeners.forEach((dispose) => dispose())
  }
}

export function usePremiumInteractions(triggerKey) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktopPointer = window.matchMedia(DESKTOP_POINTER_QUERY)

    let cleanup = () => {}

    const init = () => {
      cleanup()

      if (!desktopPointer.matches || prefersReducedMotion.matches) {
        cleanup = () => {}
        return
      }

      const releaseMagnetic = setupMagneticButtons(document)
      const releaseTilt = setupTiltCards(document)
      cleanup = () => {
        releaseMagnetic()
        releaseTilt()
      }
    }

    init()

    desktopPointer.addEventListener('change', init)
    prefersReducedMotion.addEventListener('change', init)

    return () => {
      cleanup()
      desktopPointer.removeEventListener('change', init)
      prefersReducedMotion.removeEventListener('change', init)
    }
  }, [triggerKey])
}