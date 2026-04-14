import { useLayoutEffect } from 'react'

function getRouteKind(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/galeri')) return 'gallery'
  if (pathname.startsWith('/berita')) return 'news'
  if (pathname.startsWith('/tentang-kami')) return 'about'
  if (pathname.startsWith('/layanan')) return 'services'
  if (pathname.startsWith('/kontak-kami')) return 'contact'
  return 'default'
}

function getMotionProfile(kind) {
  const defaults = {
    headlineFromY: 22,
    headlineDuration: 0.72,
    headlineStagger: 0.06,
    copyFromY: 14,
    copyDuration: 0.58,
    copyStagger: 0.03,
    cardFromY: 28,
    cardFromScale: 0.985,
    cardDuration: 0.72,
    cardStagger: 0.08,
    sectionFromY: 16,
    sectionDuration: 0.9,
  }

  if (kind === 'home') {
    return {
      ...defaults,
      headlineFromY: 28,
      headlineDuration: 0.8,
      headlineStagger: 0.07,
      cardFromY: 34,
      cardStagger: 0.1,
      sectionDuration: 1,
    }
  }

  if (kind === 'gallery') {
    return {
      ...defaults,
      headlineFromY: 18,
      copyFromY: 10,
      cardDuration: 0.64,
      cardStagger: 0.06,
    }
  }

  if (kind === 'news') {
    return {
      ...defaults,
      headlineFromY: 16,
      headlineDuration: 0.68,
      copyFromY: 12,
      cardFromY: 20,
      cardDuration: 0.66,
      cardStagger: 0.07,
    }
  }

  if (kind === 'about') {
    return {
      ...defaults,
      headlineFromY: 20,
      headlineDuration: 0.76,
      copyDuration: 0.62,
      sectionDuration: 0.96,
    }
  }

  if (kind === 'services') {
    return {
      ...defaults,
      headlineFromY: 24,
      cardFromY: 36,
      cardDuration: 0.78,
      cardStagger: 0.09,
    }
  }

  if (kind === 'contact') {
    return {
      ...defaults,
      headlineFromY: 14,
      headlineDuration: 0.62,
      copyFromY: 10,
      copyDuration: 0.5,
      cardFromY: 16,
      cardDuration: 0.6,
      sectionDuration: 0.72,
    }
  }

  return defaults
}

export function useGsapEnhance(triggerKey = '') {
  useLayoutEffect(() => {
    const pathname = window.location.pathname || ''
    if (pathname.startsWith('/layanan')) return undefined

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return undefined

    let isMounted = true
    let cleanup = () => { }

    const init = async () => {
      const gsapModule = await import('gsap')
      const scrollTriggerModule = await import('gsap/ScrollTrigger')
      if (!isMounted) return

      const gsap = gsapModule.default || gsapModule.gsap
      const ScrollTrigger =
        scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default
      const routeKind = getRouteKind(window.location.pathname)
      const profile = getMotionProfile(routeKind)

      gsap.registerPlugin(ScrollTrigger)

      const parallaxTargets = gsap.utils.toArray('[data-gsap-parallax]')
      const layeredParallaxTargets = gsap.utils.toArray('[data-gsap-parallax-layer]')
      const floatTargets = gsap.utils.toArray('[data-gsap-float]')
      const pageSections = gsap.utils.toArray(
        'main .section, main .about-hero, main .gallery-hero, main .berita-hero, main .services-redesign-hero, main .contact-hero, main .dark-cta',
      )

      const tweens = []

      parallaxTargets.forEach((target) => {
        tweens.push(
          gsap.fromTo(
            target,
            { yPercent: -4, scale: 1.03 },
            {
              yPercent: 8,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: target,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          ),
        )
      })

      const depthMap = {
        background: { fromY: -8, toY: 12, fromScale: 1.08, toScale: 1 },
        middle: { fromY: -4, toY: 6, fromScale: 1.03, toScale: 1 },
        foreground: { fromY: -2, toY: 4, fromScale: 1.01, toScale: 1 },
        content: { fromY: 2, toY: -8, fromScale: 1, toScale: 1 },
      }

      layeredParallaxTargets.forEach((target) => {
        const layerName = target.getAttribute('data-gsap-parallax-layer') || 'middle'
        const depth = depthMap[layerName] || depthMap.middle

        tweens.push(
          gsap.fromTo(
            target,
            {
              yPercent: depth.fromY,
              scale: depth.fromScale,
            },
            {
              yPercent: depth.toY,
              scale: depth.toScale,
              ease: 'none',
              scrollTrigger: {
                trigger: target,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          ),
        )
      })

      floatTargets.forEach((target, index) => {
        tweens.push(
          gsap.to(target, {
            y: -8,
            duration: 2 + (index % 3) * 0.25,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          }),
        )
      })

      pageSections.forEach((section, index) => {
        const headlineTargets = section.querySelectorAll(
          'h1, h2, .section-title, .services-redesign-title, .home-journal-title, .home-dark-cta-title, .story-title, .values-simple-title, .journey-timeline-title, .service-showcase-title, .blog-feature-copy h1, .blog-detail-head h1',
        )
        const copyTargets = section.querySelectorAll(
          '.kicker, .muted, p, .services-redesign-tags, .home-journal-more-btn, .btn, .nav-link, .service-split-kicker, .service-split-service, .service-split-copy, .values-simple-copy, .story-copy, .blog-card-readtime, .blog-card-category, .contact-box, .contact-whatsapp-banner',
        )
        const cardTargets = section.querySelectorAll(
          '.card, .service-split-block, .story-metric-card, .values-simple-card, .gallery-card, .blog-card, .home-journal-feature-card, .home-journal-side-card, .gallery-grid-item, .services-main-card, .services-spec-card, .contact-form, .contact-box, .contact-whatsapp-banner',
        )

        if (headlineTargets.length > 0) {
          const headlineFrom =
            routeKind === 'news'
              ? {
                autoAlpha: 0,
                x: (headlineIndex) => (headlineIndex % 2 === 0 ? -20 : 20),
                y: profile.headlineFromY,
              }
              : { autoAlpha: 0, y: profile.headlineFromY }

          tweens.push(
            gsap.fromTo(
              headlineTargets,
              headlineFrom,
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                duration: profile.headlineDuration,
                stagger: profile.headlineStagger,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 82%',
                  once: true,
                  immediateRender: false,
                },
              },
            ),
          )
        }

        if (copyTargets.length > 0) {
          tweens.push(
            gsap.fromTo(
              copyTargets,
              { autoAlpha: 0, y: profile.copyFromY },
              {
                autoAlpha: 1,
                y: 0,
                duration: profile.copyDuration,
                stagger: profile.copyStagger,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 80%',
                  once: true,
                  immediateRender: false,
                },
              },
            ),
          )
        }

        if (cardTargets.length > 0) {
          const cardList = Array.from(cardTargets)

          if (routeKind === 'gallery') {
            cardList.forEach((card, cardIndex) => {
              const lane = cardIndex % 3
              const fromVars = {
                autoAlpha: 0,
                y: lane === 1 ? 18 : 10,
                x: lane === 0 ? -18 : lane === 2 ? 18 : 0,
                scale: profile.cardFromScale,
              }

              tweens.push(
                gsap.fromTo(
                  card,
                  fromVars,
                  {
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: profile.cardDuration,
                    ease: 'power3.out',
                    delay: Math.min(cardIndex * 0.04, 0.3),
                    scrollTrigger: {
                      trigger: section,
                      start: 'top 76%',
                      once: true,
                      immediateRender: false,
                    },
                  },
                ),
              )
            })
          } else {
            const cardFromVars =
              routeKind === 'services'
                ? { autoAlpha: 0, y: profile.cardFromY, scale: profile.cardFromScale, rotateX: 5 }
                : { autoAlpha: 0, y: profile.cardFromY, scale: profile.cardFromScale }

            const cardToVars =
              routeKind === 'services'
                ? { autoAlpha: 1, y: 0, scale: 1, rotateX: 0 }
                : { autoAlpha: 1, y: 0, scale: 1 }

            tweens.push(
              gsap.fromTo(
                cardTargets,
                cardFromVars,
                {
                  ...cardToVars,
                  duration: profile.cardDuration,
                  stagger: profile.cardStagger,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: section,
                    start: 'top 76%',
                    once: true,
                    immediateRender: false,
                  },
                },
              ),
            )
          }

        }

        if (index === 0) {
          tweens.push(
            gsap.fromTo(
              section,
              { autoAlpha: 0, y: profile.sectionFromY },
              {
                autoAlpha: 1,
                y: 0,
                duration: profile.sectionDuration,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 85%',
                  once: true,
                  immediateRender: false,
                },
              },
            ),
          )
        }
      })

      cleanup = () => {
        tweens.forEach((tween) => tween.kill())
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }
    }

    init()

    return () => {
      isMounted = false
      cleanup()
    }
  }, [triggerKey])
}
