import { useState } from 'react'

// Shows an image when `src` is set and loads, otherwise a clearly labelled
// placeholder. To replace a placeholder, add the file named in `hint` and set
// the matching `image` path in src/data.js.
//   focus: CSS object-position, e.g. '50% 18%' keeps a face in view when cropped
//   eager: load immediately (use for above-the-fold images)
export default function Visual({ src, alt, label, hint, focus = '50% 50%', eager = false, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <div className={`visual ${className}`.trim()}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          style={{ objectPosition: focus }}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="ph" role="img" aria-label={`${label} (placeholder)`}>
          <span>{label}</span>
          <small>Placeholder. Add {hint}</small>
        </div>
      )}
    </div>
  )
}