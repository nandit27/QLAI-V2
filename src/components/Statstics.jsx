import { motion } from "framer-motion"
import { useRef, useEffect, useState } from "react"

function useCountUp(to, { from = 0, duration = 2, separator = "", decimals = 0, prefix = "", suffix = "" } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const el = ref.current
    if (!el) return
    startTimeRef.current = null
    const fmt = (val) => {
      const fixed = val.toFixed(decimals)
      if (!separator) return fixed
      const [int, dec] = fixed.split(".")
      const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      return dec !== undefined ? `${formatted}.${dec}` : formatted
    }
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts
      const progress = Math.min((ts - startTimeRef.current) / 1000 / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = `${prefix}${fmt(from + (to - from) * eased)}${suffix}`
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
      else el.textContent = `${prefix}${fmt(to)}${suffix}`
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [inView, to, from, duration, separator, decimals, prefix, suffix])

  return ref
}

export default function Statstics() {
  return (
    <div className='max-w-7xl mx-auto px-4 py-24'>
      {/* Header Section */}
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 bg-[#00FF9D]/10 rounded-full px-6 py-2 mb-6"
        >
          <span className="h-2 w-2 bg-[#00FF9D] rounded-full animate-pulse"></span>
          <span className="text-[#00FF9D] text-sm font-medium">Real-time Analytics</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-[#00FF9D] to-white bg-clip-text text-transparent"
        >
          Platform Impact
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Transforming education through AI-powered learning experiences
        </motion.p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        {/* Active Learners */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center overflow-hidden group-hover:border-[#00FF9D]/30 transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-[#00FF9D]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#00FF9D]/20 transition-colors duration-300">
                <div className="w-8 h-8 bg-[#00FF9D] rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Counter */}
            <span ref={useCountUp(100, { suffix: "+", duration: 2.5 })} className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:text-[#00FF9D] transition-colors duration-300">100</span>
            
            {/* Label */}
            <p className="text-gray-400 text-lg font-medium group-hover:text-gray-300 transition-colors duration-300">
              Active Learners
            </p>
            
            {/* Subtitle */}
            <p className="text-gray-500 text-sm mt-2">
              Learning daily
            </p>
          </div>
        </motion.div>
        
        {/* Questions Generated */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center overflow-hidden group-hover:border-[#00FF9D]/30 transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-[#00FF9D]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#00FF9D]/20 transition-colors duration-300">
                <div className="w-8 h-8 border-2 border-[#00FF9D] rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#00FF9D] rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Counter */}
            <span ref={useCountUp(400, { suffix: "+", duration: 2.2 })} className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:text-[#00FF9D] transition-colors duration-300">400</span>
            
            {/* Label */}
            <p className="text-gray-400 text-lg font-medium group-hover:text-gray-300 transition-colors duration-300">
              Questions Generated
            </p>
            
            {/* Subtitle */}
            <p className="text-gray-500 text-sm mt-2">
              AI-powered content
            </p>
          </div>
        </motion.div>
        
        {/* Learning Accuracy */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center overflow-hidden group-hover:border-[#00FF9D]/30 transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-[#00FF9D]/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#00FF9D]/20 transition-colors duration-300">
                <div className="w-8 h-8 border-2 border-[#00FF9D] rounded-full relative">
                  <div className="absolute inset-1 bg-[#00FF9D] rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
            
            {/* Counter */}
            <span ref={useCountUp(94, { suffix: "%", duration: 2.8 })} className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:text-[#00FF9D] transition-colors duration-300">94</span>
            
            {/* Label */}
            <p className="text-gray-400 text-lg font-medium group-hover:text-gray-300 transition-colors duration-300">
              Learning Accuracy
            </p>
            
            {/* Subtitle */}
            <p className="text-gray-500 text-sm mt-2">
              AI precision rate
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <p className="text-gray-500 text-sm">
          Real-time data • Updated every minute • Powered by AI analytics
        </p>
      </motion.div>
    </div>
  )
}
