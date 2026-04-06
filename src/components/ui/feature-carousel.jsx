"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import clsx from "clsx"
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react"
import Balancer from "react-wrap-balancer"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 4

const ANIMATION_PRESETS = {
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
  },
}

function useNumberCycler(totalSteps = TOTAL_STEPS, interval = 4000) {
  const [currentNumber, setCurrentNumber] = useState(0)
  const timerRef = useRef(null)

  const setupTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCurrentNumber((prev) => (prev + 1) % totalSteps)
      setupTimer()
    }, interval)
  }, [interval, totalSteps])

  const increment = useCallback(() => {
    setCurrentNumber((prev) => (prev + 1) % totalSteps)
    setupTimer()
  }, [totalSteps, setupTimer])

  useEffect(() => {
    setupTimer()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [setupTimer])

  return { currentNumber, increment }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const isSmall = window.matchMedia("(max-width: 768px)").matches
    setIsMobile(isSmall)
  }, [])
  return isMobile
}

function IconCheck({ className, ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={cn("h-4 w-4", className)} {...props}>
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  )
}

const stepVariants = {
  inactive: { scale: 0.8, opacity: 0.5 },
  active: { scale: 1, opacity: 1 },
}

// ── FeatureVideo: renders video for a given step ──────────────────────────────
function FeatureVideo({ videoSrc, fallbackSrc, alt, className, preset = "fadeInScale", delay = 0, onAnimationComplete }) {
  const videoRef = useRef(null)
  const presetConfig = ANIMATION_PRESETS[preset]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.load()
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {})
    }
    return () => {
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [videoSrc, fallbackSrc])

  return (
    <motion.div
      className={className}
      {...presetConfig}
      transition={{ ...presetConfig.transition, delay }}
      onAnimationComplete={onAnimationComplete}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
      >
        {videoSrc && <source src={videoSrc} type="video/webm" />}
        <source src={fallbackSrc || videoSrc} type="video/mp4" />
      </video>
      {/* Bottom label */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-[#95ff00] text-xs font-medium px-3 py-1 rounded-full border border-[#95ff00]/20">
          {alt}
        </span>
      </div>
    </motion.div>
  )
}

// ── FeatureCard wrapper with mouse glow ───────────────────────────────────────
function FeatureCard({ bgClass, children, step, steps }) {
  const [mounted, setMounted] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isMobile = useIsMobile()

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    if (isMobile) return
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  useEffect(() => { setMounted(true) }, [])

  return (
    <motion.div
      className="animated-cards relative w-full rounded-[16px]"
      onMouseMove={handleMouseMove}
      style={{ "--x": useMotionTemplate`${mouseX}px`, "--y": useMotionTemplate`${mouseY}px` }}
    >
      <div className={clsx(
        "group relative w-full overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-b from-neutral-900/90 to-stone-800 transition duration-300",
        "md:hover:border-transparent", bgClass
      )}>
        <div className="m-10 min-h-[450px] w-full">
          <AnimatePresence mode="wait">
            <motion.div key={step} className="flex w-4/6 flex-col gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.h2
                className="font-heading text-xl font-bold tracking-tight text-white md:text-2xl"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {steps[step].title}
              </motion.h2>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <p className="font-body text-sm leading-relaxed text-neutral-300 sm:text-base">
                  <Balancer>{steps[step].description}</Balancer>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          {mounted ? children : null}
        </div>
      </div>
    </motion.div>
  )
}

// ── Steps progress nav ────────────────────────────────────────────────────────
function Steps({ steps: stepData, current, onChange }) {
  return (
    <nav aria-label="Progress" className="flex justify-center px-4">
      <ol className="flex w-full flex-wrap items-start justify-start gap-2 sm:justify-center md:w-10/12" role="list">
        {stepData.map((step, stepIdx) => {
          const isCompleted = current > stepIdx
          const isCurrent = current === stepIdx
          const isFuture = !isCompleted && !isCurrent
          return (
            <motion.li key={`${step.name}-${stepIdx}`} initial="inactive" animate={isCurrent ? "active" : "inactive"}
              variants={stepVariants} transition={{ duration: 0.3 }}
              className={cn("relative z-50 rounded-full px-3 py-1 transition-all duration-300 ease-in-out md:flex",
                isCompleted ? "bg-neutral-500/20" : "bg-neutral-500/10")}
            >
              <div className={cn("group flex w-full cursor-pointer items-center focus:outline-none",
                (isFuture || isCurrent) && "pointer-events-none")}
                onClick={() => onChange(stepIdx)}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <motion.span initial={false} animate={{ scale: isCurrent ? 1.2 : 1 }}
                    className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full duration-300",
                      isCompleted && "bg-[#95ff00] text-[#0c0e11]",
                      isCurrent && "bg-[#95ff00]/30 text-neutral-400",
                      isFuture && "bg-neutral-500/20")}
                  >
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <IconCheck className="h-3 w-3 text-[#0c0e11]" />
                      </motion.div>
                    ) : (
                      <span className={cn("text-xs", !isCurrent && "text-[#95ff00]")}>{stepIdx + 1}</span>
                    )}
                  </motion.span>
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={clsx("font-body text-sm font-medium duration-300",
                      isCompleted && "text-neutral-500",
                      isCurrent && "text-[#95ff00]",
                      isFuture && "text-neutral-500")}
                  >
                    {step.name}
                  </motion.span>
                </span>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </nav>
  )
}

// ── Main exported Component ───────────────────────────────────────────────────
export function FeatureCarousel({ features, bgClass }) {
  const { currentNumber: step, increment } = useNumberCycler(features.length, 4000)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleIncrement = () => {
    if (isAnimating) return
    setIsAnimating(true)
    increment()
  }
  const handleAnimationComplete = () => setIsAnimating(false)

  // Map features to steps format
  const steps = features.map((f, i) => ({
    id: String(i + 1),
    name: `Step ${i + 1}`,
    title: f.title,
    description: f.description,
  }))

  const currentFeature = features[step]

  return (
    <FeatureCard bgClass={bgClass} step={step} steps={steps}>
      {/* Video area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          {...ANIMATION_PRESETS.fadeInScale}
          className="absolute left-0 top-0 w-full h-full"
          onAnimationComplete={handleAnimationComplete}
        >
          <FeatureVideo
            videoSrc={currentFeature?.videoSrc}
            fallbackSrc={currentFeature?.fallbackSrc}
            alt={currentFeature?.title}
            preset="fadeInScale"
            className="absolute left-[5%] top-[40%] md:top-[28%] w-[90%] h-[55%] overflow-hidden rounded-t-[24px] border border-white/10"
            onAnimationComplete={handleAnimationComplete}
          />
        </motion.div>
      </AnimatePresence>

      {/* Steps nav overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="absolute left-[12rem] top-5 z-50 h-full w-full cursor-pointer md:left-0"
      >
        <Steps current={step} onChange={() => {}} steps={steps} />
      </motion.div>

      {/* Click-to-advance overlay */}
      <motion.div
        className="absolute right-0 top-0 z-50 h-full w-full cursor-pointer md:left-0"
        onClick={handleIncrement}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      />
    </FeatureCard>
  )
}

FeatureCarousel.displayName = "FeatureCarousel"
