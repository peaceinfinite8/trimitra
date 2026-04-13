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