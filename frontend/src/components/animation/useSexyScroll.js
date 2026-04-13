import { useEffect, useRef } from 'react'

const DESKTOP_MEDIA = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

const SCROLL_PRESETS = {
  soft: {
    smoothTime: 0.18,
    wheelMultiplier: 1.08,
    keyboardMultiplier: 1,
    settleThreshold: 0.2,
  },
  balanced: {
    smoothTime: 0.145,
    wheelMultiplier: 1.2,
    keyboardMultiplier: 1.08,
    settleThreshold: 0.2,
  },
  fast: {
    smoothTime: 0.085,
    wheelMultiplier: 1.82,
    keyboardMultiplier: 1.35,
    settleThreshold: 0.16,
  },
}

export const SEXY_SCROLL_PRESET_NAMES = Object.keys(SCROLL_PRESETS)

function resolvePreset(name) {
  return SCROLL_PRESETS[name] || SCROLL_PRESETS.balanced
}

const KEY_DELTAS = {
  ArrowDown: 88,
  ArrowUp: -88,
  PageDown: 620,
  PageUp: -620,
  ' ': 620,
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeWheelDelta(event) {
  if (event.deltaMode === 1) return event.deltaY * 16
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight
  return event.deltaY
}

function clampWheelDelta(delta) {
  return clamp(delta, -420, 420)
}

export function useSexyScroll(routeKey, selectedPreset) {
  const presetName =
    selectedPreset?.toLowerCase() ||
    import.meta.env.VITE_SEXY_SCROLL_PRESET?.toLowerCase() ||
    'balanced'
  const preset = resolvePreset(presetName)

  const stateRef = useRef({
    enabled: false,
    currentY: 0,
    targetY: 0,
    rafId: null,
    lastFrameTime: 0,
    isTicking: false,
    isProgrammatic: false,
    suppressSyncUntil: 0,
  })

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktopMedia = window.matchMedia(DESKTOP_MEDIA)
    const state = stateRef.current

    const getMaxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    const stopTick = () => {
      if (state.rafId !== null) {
        window.cancelAnimationFrame(state.rafId)
        state.rafId = null
      }
      state.isTicking = false
      state.lastFrameTime = 0
    }

    const tick = (timestamp) => {
      if (!state.lastFrameTime) state.lastFrameTime = timestamp
      const elapsedMs = timestamp - state.lastFrameTime
      state.lastFrameTime = timestamp

      // Use real frame time so motion remains smooth across varying FPS.
      const frameSeconds = clamp(elapsedMs / 1000, 1 / 240, 1 / 20)
      const delta = state.targetY - state.currentY
      const alpha = 1 - Math.exp(-frameSeconds / preset.smoothTime)
      const intendedStep = delta * alpha
      const maxStep = 240 * frameSeconds * 60
      state.currentY += clamp(intendedStep, -maxStep, maxStep)

      if (Math.abs(delta) < preset.settleThreshold) {
        state.currentY = state.targetY
      }

      state.isProgrammatic = true
      state.suppressSyncUntil = performance.now() + 120
      window.scrollTo(0, state.currentY)
      state.isProgrammatic = false

      if (Math.abs(state.targetY - state.currentY) <= preset.settleThreshold) {
        stopTick()
        return
      }

      state.rafId = window.requestAnimationFrame(tick)
    }

    const startTick = () => {
      if (state.isTicking) return
      state.isTicking = true
      state.lastFrameTime = 0
      state.rafId = window.requestAnimationFrame(tick)
    }

    const setTarget = (nextY) => {
      state.targetY = clamp(nextY, 0, getMaxScroll())
      startTick()
    }

    const syncFromScroll = () => {
      if (!state.enabled || state.isProgrammatic) return
      if (state.isTicking) return
      if (performance.now() < state.suppressSyncUntil) return
      const y = window.scrollY || window.pageYOffset || 0
      state.currentY = y
      state.targetY = y
    }

    const onWheel = (event) => {
      if (!state.enabled) return
      if (isEditableTarget(event.target)) return

      event.preventDefault()
      const rawDelta = normalizeWheelDelta(event) * preset.wheelMultiplier
      const deltaY = clampWheelDelta(rawDelta)
      setTarget(state.targetY + deltaY)
    }

    const onKeyDown = (event) => {
      if (!state.enabled) return
      if (isEditableTarget(event.target)) return

      if (event.key === 'Home') {
        event.preventDefault()
        setTarget(0)
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        setTarget(getMaxScroll())
        return
      }

      const delta = KEY_DELTAS[event.key]
      if (delta === undefined) return

      event.preventDefault()
      const signedDelta =
        (event.shiftKey && event.key === ' ' ? -620 : delta) *
        preset.keyboardMultiplier
      setTarget(state.targetY + signedDelta)
    }

    const updateEnableState = () => {
      const enabled = desktopMedia.matches && !prefersReducedMotion.matches
      state.enabled = enabled

      if (!enabled) {
        stopTick()
      }

      const y = window.scrollY || window.pageYOffset || 0
      state.currentY = y
      state.targetY = y
    }

    updateEnableState()

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', syncFromScroll, { passive: true })
    window.addEventListener('resize', syncFromScroll)
    desktopMedia.addEventListener('change', updateEnableState)
    prefersReducedMotion.addEventListener('change', updateEnableState)

    return () => {
      stopTick()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', syncFromScroll)
      window.removeEventListener('resize', syncFromScroll)
      desktopMedia.removeEventListener('change', updateEnableState)
      prefersReducedMotion.removeEventListener('change', updateEnableState)
    }
  }, [preset.keyboardMultiplier, preset.settleThreshold, preset.smoothTime, preset.wheelMultiplier])

  useEffect(() => {
    const state = stateRef.current
    const y = window.scrollY || window.pageYOffset || 0
    state.currentY = y
    state.targetY = y
  }, [routeKey])
}
