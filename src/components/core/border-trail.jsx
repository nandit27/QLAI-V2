import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function BorderTrail({
  className,
  size = 60,
  transition,
  onAnimationComplete,
  style,
}) {
  const defaultTransition = {
    repeat: Infinity,
    duration: 8,
    ease: 'linear',
  };

  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        className={cn('absolute aspect-square bg-[#00FF9D]', className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          filter: 'drop-shadow(0 0 8px #00FF9D) drop-shadow(0 0 12px #00FF9D)',
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={transition || defaultTransition}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
