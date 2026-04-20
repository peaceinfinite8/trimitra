import { useEffect, useState } from 'react'

function LazyImage({
  src,
  fallbackSrc,
  alt,
  className,
  wrapperClassName = '',
  style,
  loading = 'lazy',
  fetchPriority,
  onLoad,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState('')
  const [resolvedSrc, setResolvedSrc] = useState(src)

  useEffect(() => {
    setResolvedSrc(src)
    setIsLoaded(false)
  }, [src])

  return (
    <div className={`lazy-image-wrap ${wrapperClassName}`.trim()}>
      <img
        src={resolvedSrc}
        alt={alt}
        className={`lazy-image ${isLoaded || loadedSrc === resolvedSrc ? 'is-loaded' : ''} ${className || ''}`.trim()}
        style={style}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={(event) => {
          setIsLoaded(true)
          setLoadedSrc(resolvedSrc)
          if (onLoad) onLoad(event)
        }}
        onError={() => {
          if (fallbackSrc && resolvedSrc !== fallbackSrc) {
            setResolvedSrc(fallbackSrc)
            return
          }

          // Prevent staying invisible forever when image fails to load.
          setIsLoaded(true)
        }}
        {...rest}
      />
    </div>
  )
}

export default LazyImage
