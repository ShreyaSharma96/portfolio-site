import { useEffect, useRef, useState } from 'react'

// Reveals its children when they scroll into view and hides them again when
// they scroll back out, so the motion reverses on the way up.
// variant: 'up' (rise), 'fade' (opacity only), 'mask' (text slides up from a clip)
export default function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return undefined
    }
    const io = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px',
    })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${shown ? 'reveal--in' : ''} ${className}`.trim()}
      style={{ '--d': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}