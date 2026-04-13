import { useState } from 'react'

function LazyImage({
  src,
  alt,
  className,
  wrapperClassName = '',
  style,
  onLoad,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState('')

  return (
    <div className={`lazy-image-wrap ${wrapperClassName}`.trim()}>
      <img
        src={src}
        alt={alt}
        className={`lazy-image ${isLoaded || loadedSrc === src ? 'is-loaded' : ''} ${className || ''}`.trim()}
        style={style}
        loading="lazy"
        decoding="async"
        onLoad={(event) => {
          setIsLoaded(true)
          setLoadedSrc(src)
          if (onLoad) onLoad(event)
        }}
        {...rest}
      />
    </div>
  )
}

export default LazyImage
