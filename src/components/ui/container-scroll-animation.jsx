"use client";
/**
 * Aceternity UI — Container Scroll Animation
 * Source: https://ui.aceternity.com/components/container-scroll-animation
 *
 * Customisations for this project:
 *  - Card is bg-transparent / no border / no padding → no "double card" effect
 *  - rotateX starts at 15° (not 20°) per design spec
 *  - overflow-hidden on outer container so the scroll trigger fires correctly
 *  - useSpring wraps raw scrollYProgress for smooth easing
 */
import React, { useRef } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);

  // Track scroll relative to this element — works inside any scroll container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Spring-smooth the raw scroll value to avoid jank on fast flings
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  // rotateX: 15° → 0° (was 20° — reduced per spec)
  const rotate    = useTransform(smoothProgress, [0, 1], [15, 0]);
  const scale     = useTransform(smoothProgress, [0, 1], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20 overflow-hidden"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center mb-12"
    >
      {titleComponent}
    </motion.div>
  );
};

/**
 * Card — intentionally no background, border, padding, or shadow.
 * The consumer is responsible for all card styling inside the children.
 * This prevents the "double card" look when the user places a styled
 * component inside ContainerScroll.
 */
export const Card = ({ rotate, scale, children }) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        // No boxShadow — removed to prevent double-layering
      }}
      // bg-transparent: no fill; no border; no padding
      // will-change-transform: GPU-promote to compositor layer
      className="max-w-5xl -mt-12 mx-auto w-full bg-transparent rounded-[30px] will-change-transform"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl">
        {children}
      </div>
    </motion.div>
  );
};
