import { BorderTrail } from './border-trail';
import { motion } from 'framer-motion';

export function BorderTrailCard({ 
  children, 
  className = '',
  style = {},
  size = 60,
  transition,
  onAnimationComplete
}) {
  return (
    <div className={`relative rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 backdrop-blur-sm ${className}`}>
      <BorderTrail
        size={size}
        transition={transition}
        onAnimationComplete={onAnimationComplete}
        style={style}
      />
      {children}
    </div>
  );
}
