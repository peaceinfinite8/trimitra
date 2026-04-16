export function pickTextField(source, keys, fallback = '') {
  if (!source || typeof source !== 'object') return fallback

  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) return trimmed
    }
  }

  return fallback
}

export function pickLinkField(source, keys, fallback = '#') {
  const value = pickTextField(source, keys, fallback)
  return value || fallback
}

export function pickArrayField(source, keys, fallback = []) {
  if (!source || typeof source !== 'object') return fallback

  for (const key of keys) {
    const value = source[key]

    if (Array.isArray(value)) {
      return value.filter((item) => item !== null && item !== undefined)
    }

    if (typeof value === 'string') {
      const items = value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

      if (items.length > 0) {
        return items
      }
    }
  }

  return fallback
}