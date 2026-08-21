import { useEffect, useRef, useState } from 'react'

/**
 * Wraps any content and fades/slides it into view the first time it
 * scrolls into the viewport. Respects prefers-reduced-motion via CSS.
 */
export default function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const Tag = as

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}