const hasWindow = typeof window !== 'undefined'

const memoryCache = new Map()
const inflightRequests = new Map()
const revalidationRegistry = new Map()
const lastAutoRefreshAt = new Map()

let listenersBound = false

function getNow() {
  return Date.now()
}

function normalizeOptions(options) {
  if (typeof options === 'boolean') {
    return {
      staleWhileRevalidate: options,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      minBackgroundRefreshIntervalMs: 15000,
    }
  }

  return {
    staleWhileRevalidate: options?.staleWhileRevalidate !== false,
    revalidateOnFocus: options?.revalidateOnFocus !== false,
    revalidateOnReconnect: options?.revalidateOnReconnect !== false,
    minBackgroundRefreshIntervalMs: Math.max(1000, Number(options?.minBackgroundRefreshIntervalMs || 15000)),
  }
}

function readSessionEntry(key) {
  if (!hasWindow) return null
  const raw = window.sessionStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    window.sessionStorage.removeItem(key)
    return null
  }
}

function writeSessionEntry(key, entry) {
  if (!hasWindow) return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Ignore quota / serialization errors.
  }
}

function getCachedValue(cacheKey, ttlMs) {
  const now = getNow()
  const memoryEntry = memoryCache.get(cacheKey)
  if (memoryEntry && now - memoryEntry.time < ttlMs) {
    return memoryEntry.value
  }

  const sessionEntry = readSessionEntry(cacheKey)
  if (sessionEntry && now - sessionEntry.time < ttlMs) {
    memoryCache.set(cacheKey, sessionEntry)
    return sessionEntry.value
  }

  return null
}

function setCachedValue(cacheKey, value) {
  const entry = { value, time: getNow() }
  memoryCache.set(cacheKey, entry)
  writeSessionEntry(cacheKey, entry)
}

function registerForAutoRevalidation(cacheKey, ttlMs, loader, options) {
  revalidationRegistry.set(cacheKey, {
    ttlMs,
    loader,
    options,
  })

  if (!hasWindow || listenersBound) return

  const triggerFromFocus = () => triggerAutoRevalidation('focus')
  const triggerFromReconnect = () => triggerAutoRevalidation('reconnect')

  window.addEventListener('focus', triggerFromFocus)
  window.addEventListener('online', triggerFromReconnect)
  listenersBound = true
}

function getCacheEntry(cacheKey) {
  const memoryEntry = memoryCache.get(cacheKey)
  if (memoryEntry) return memoryEntry

  const sessionEntry = readSessionEntry(cacheKey)
  if (sessionEntry) {
    memoryCache.set(cacheKey, sessionEntry)
    return sessionEntry
  }

  return null
}

async function loadAndCache(cacheKey, loader) {
  const request = (async () => {
    const value = await loader()
    setCachedValue(cacheKey, value)
    return value
  })()

  inflightRequests.set(cacheKey, request)

  try {
    return await request
  } finally {
    inflightRequests.delete(cacheKey)
  }
}

function revalidateInBackground(cacheKey, loader) {
  if (inflightRequests.has(cacheKey)) return

  const request = (async () => {
    const value = await loader()
    setCachedValue(cacheKey, value)
    return value
  })()

  inflightRequests.set(cacheKey, request)
  request
    .catch(() => {
      // Ignore background refresh failures and keep stale cache.
    })
    .finally(() => {
      inflightRequests.delete(cacheKey)
    })
}

function canAutoRefresh(cacheKey, config, reason) {
  if (reason === 'focus' && !config.options.revalidateOnFocus) return false
  if (reason === 'reconnect' && !config.options.revalidateOnReconnect) return false
  if (inflightRequests.has(cacheKey)) return false

  const entry = getCacheEntry(cacheKey)
  if (!entry) return false

  const now = getNow()
  const age = now - entry.time
  if (age < config.ttlMs) return false

  const lastRunAt = lastAutoRefreshAt.get(cacheKey) || 0
  if (now - lastRunAt < config.options.minBackgroundRefreshIntervalMs) {
    return false
  }

  return true
}

function triggerAutoRevalidation(reason) {
  revalidationRegistry.forEach((config, cacheKey) => {
    if (!canAutoRefresh(cacheKey, config, reason)) return
    lastAutoRefreshAt.set(cacheKey, getNow())
    revalidateInBackground(cacheKey, config.loader)
  })
}

export async function withCache(cacheKey, ttlMs, loader, options = {}) {
  const normalizedOptions = normalizeOptions(options)
  registerForAutoRevalidation(cacheKey, ttlMs, loader, normalizedOptions)

  const cached = getCachedValue(cacheKey, ttlMs)
  if (cached !== null) return cached

  const cacheEntry = getCacheEntry(cacheKey)

  if (cacheEntry && normalizedOptions.staleWhileRevalidate) {
    revalidateInBackground(cacheKey, loader)
    return cacheEntry.value
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey)
  }

  return loadAndCache(cacheKey, loader)
}
