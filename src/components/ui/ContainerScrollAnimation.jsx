"use client";

/**
 * Aceternity UI — Container Scroll Animation
 * Source: https://ui.aceternity.com/components/container-scroll-animation
 *
 * Ported to JSX for this Vite+React project.
 * Key adaptation: `useScroll` targets `containerRef` (the outer wrapper)
 * instead of the window, so it works correctly inside this app's layout
 * where the page scroll is on `document.documentElement` / `body`.
 *
 * Performance notes (see walkthrough.md):
 *  - Uses `useTransform` — values are computed on the compositor thread.
 *  - The outer container is `will-change: transform` via the `transform-gpu`
 *    class already present in App.jsx section wrappers.
 *  - Wrap usage sites in React.lazy + Suspense to keep bundle splits intact.
 */

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// ContainerScroll
// ---------------------------------------------------------------------------
/**
 * @param {object}  props
 * @param {React.ReactNode} props.titleComponent  — headline rendered above the card
 * @param {React.ReactNode} props.children        — content inside the 3-D card
 * @param {string}  [props.className]             — extra classes on the outer wrapper
 */
export function ContainerScroll({ titleComponent, children, className }) {
  const containerRef = useRef(null);

  /**
   * Attach scroll tracking to the *element* rather than the window.
   * `offset` controls when the animation starts/ends relative to the
   * viewport:  "start end" = track from when top of container hits
   * the bottom of the viewport, until "end start" = container bottom
   * hits top of viewport.
   */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth out the raw scroll value to avoid janky jumps
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  // Title: slides up + fades in
  const translateY   = useTransform(smoothProgress, [0, 0.5], [60, 0]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.3], [0, 1]);

  // Card: rotates from flat → upright as user scrolls in, then stays
  const rotate       = useTransform(smoothProgress, [0.1, 0.5], [20, 0]);
  const scale        = useTransform(smoothProgress, [0.1, 0.5], [0.9, 1]);
  const cardOpacity  = useTransform(smoothProgress, [0.05, 0.3], [0, 1]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-start py-20 md:py-40",
        // Reserve enough height so the scroll range feels natural.
        // Avoid `h-[80vh]` on a container whose children define its height
        // — it causes layout shift. Use min-height instead.
        "min-h-[60rem]",
        className
      )}
    >
      {/* Title / headline block */}
      <motion.div
        style={{ translateY, opacity: titleOpacity }}
        className="mb-8 max-w-5xl mx-auto text-center px-4 z-10 relative"
      >
        {titleComponent}
      </motion.div>

      {/* 3-D card container */}
      <motion.div
        style={{
          rotateX: rotate,
          scale,
          opacity: cardOpacity,
          // Perspective must live on the parent of the rotated element
          transformPerspective: 1000,
        }}
        className={cn(
          "w-full max-w-5xl mx-auto px-4",
          // GPU-promote this layer — avoids layout-shift repaints
          "will-change-transform"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header (thin wrapper used by ContainerScroll consumers)
// ---------------------------------------------------------------------------
/**
 * Convenience component for the headline text inside ContainerScroll.
 * Matches the Aceternity API so copy-paste examples work out of the box.
 */
export function Header({ translate, titleComponent }) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Card (thin wrapper matching Aceternity API)
// ---------------------------------------------------------------------------
/**
 * @param {object} props
 * @param {import("framer-motion").MotionValue<number>} props.rotate
 * @param {import("framer-motion").MotionValue<number>} props.scale
 * @param {import("framer-motion").MotionValue<number>} props.translate
 * @param {React.ReactNode} props.children
 */
export function Card({ rotate, scale, translate, children }) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY: translate,
        transformPerspective: 1000,
      }}
      className="w-full max-w-5xl mx-auto will-change-transform"
    >
      {children}
    </motion.div>
  );
}
