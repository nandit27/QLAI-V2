import { useEffect, useRef, useState } from "react"

export function CountUp({
  to,
  from = 0,
  duration = 2,
  separator = "",
  direction = "up",
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  onStart,
  onEnd,
}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  // IntersectionObserver — only animate when visible on screen
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Run animation when inView becomes true
  useEffect(() => {
    if (!inView) return

    const startVal = direction === "down" ? to : from
    const endVal = direction === "down" ? from : to
    const el = ref.current
    if (!el) return

    onStart?.()

    const formatNumber = (val) => {
      const fixed = val.toFixed(decimals)
      if (!separator) return fixed
      const [int, dec] = fixed.split(".")
      const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      return dec !== undefined ? `${formatted}.${dec}` : formatted
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = (timestamp - startTimeRef.current) / 1000
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (endVal - startVal) * eased

      el.textContent = `${prefix}${formatNumber(current)}${suffix}`

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        el.textContent = `${prefix}${formatNumber(endVal)}${suffix}`
        onEnd?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [inView, from, to, duration, separator, direction, decimals, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}{direction === "down" ? to : from}{suffix}
    </span>
  )
}

export default CountUp
