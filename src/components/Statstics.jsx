import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(to, { from = 0, duration = 2, decimals = 0 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    
    let startTime = null;
    const startValue = from;
    const endValue = to;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, to, from, duration]);

  return { ref, count };
}

const MetricCard = ({ metric, index }) => {
  const { ref, count } = useCountUp(metric.target, { duration: 2.5, decimals: metric.decimals || 0 });
  const [isHovered, setIsHovered] = useState(false);

  const displayValue = metric.decimals 
    ? count.toFixed(metric.decimals) 
    : Math.floor(count).toLocaleString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
          isHovered ? 'transform scale-[1.02]' : ''
        }`}
      >
        {/* Background gradient that shifts on hover */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(135deg, ${metric.color}10 0%, transparent 50%, ${metric.color}05 100%)`,
          }}
        />

        {/* Card surface */}
        <div 
          className="relative border rounded-3xl p-8 transition-all duration-300 group-hover:border-[var(--accent)]/30"
          style={{ 
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          {/* Glow border effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: `inset 0 0 30px ${metric.color}20`,
            }}
          />

          <div className="relative z-10">
            {/* Icon & Label Row */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${metric.color}15` }}
                >
                  <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    {metric.label}
                  </p>
                  <p className="text-xs mt-0.5 opacity-70" style={{ color: 'var(--foreground-muted)' }}>
                    {metric.subtitle}
                  </p>
                </div>
              </div>

              {/* Trend indicator */}
              {metric.trend && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.15, type: 'spring', stiffness: 200 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ backgroundColor: `${metric.trend > 0 ? '#16a34a' : '#dc2626'}15` }}
                >
                  <metric.trendIcon
                    className="w-3 h-3"
                    style={{ color: metric.trend > 0 ? '#16a34a' : '#dc2626' }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: metric.trend > 0 ? '#16a34a' : '#dc2626' }}
                  >
                    {Math.abs(metric.trend)}%
                  </span>
                </motion.div>
              )}
            </div>

            {/* Main Number Display */}
            <div className="flex items-baseline gap-2">
              <motion.span
                className="text-5xl md:text-6xl font-bold tracking-tight"
                style={{
                  color: metric.color,
                  textShadow: isHovered ? `0 0 40px ${metric.color}40` : 'none',
                }}
              >
                {displayValue}
              </motion.span>
              {metric.suffix && (
                <span className="text-2xl font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                  {metric.suffix}
                </span>
              )}
            </div>

            {/* Progress Bar (optional) */}
            {metric.progress !== undefined && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Progress</span>
                  <span className="text-xs font-semibold" style={{ color: metric.color }}>
                    {metric.progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-variant)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.progress}%` }}
                    transition={{ duration: 1.5, delay: 0.3 + index * 0.15, ease: 'easeOut' }}
                    viewport={{ once: true }}
                  />
                </div>
              </div>
            )}

            {/* Animated ring for visual interest */}
            {metric.ring && (
              <div className="absolute -top-4 -right-4 w-24 h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${metric.ring} 100`}
                    style={{ color: metric.color }}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PlatformMetrics = () => {
  const metrics = [
    {
      id: 'learners',
      label: 'Active Learners',
      subtitle: 'Growing daily',
      target: 2847,
      suffix: '+',
      icon: Users,
      color: '#0d7a4e',
      trend: 12,
      trendIcon: TrendingUp,
      ring: 72,
    },
    {
      id: 'videos',
      label: 'Videos Processed',
      subtitle: 'This month',
      target: 15420,
      suffix: '',
      icon: PlayCircle,
      color: '#22d68a',
      trend: 8,
      trendIcon: TrendingUp,
      ring: 85,
    },
    {
      id: 'accuracy',
      label: 'AI Accuracy',
      subtitle: 'Content generation',
      target: 94.7,
      suffix: '%',
      decimals: 1,
      icon: Target,
      color: '#4dd4a0',
      progress: 95,
    },
    {
      id: 'time',
      label: 'Time Saved',
      subtitle: 'Per learner avg',
      target: 12.4,
      suffix: ' hrs',
      decimals: 1,
      icon: Clock,
      color: '#11965f',
      progress: 78,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  );
};

function Users(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlayCircle(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  );
}

function Target(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function Clock(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TrendingUp(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

const Statstics = () => {
  return (
    <section className="relative py-32 overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(13, 122, 78, 0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(34, 214, 138, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6"
            style={{ backgroundColor: 'rgba(13, 122, 78, 0.1)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#0d7a4e' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#0d7a4e' }}></span>
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#0d7a4e' }}>
              Live Platform Stats
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            <span>Numbers that </span>
            <span className="landing-gradient-heading">speak volumes</span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
            Real-time metrics from our growing learning ecosystem. Every number represents a student achieving more.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <PlatformMetrics />

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ 
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    background: `linear-gradient(135deg, hsl(${140 + i * 20}, 70%, 50%), hsl(${150 + i * 20}, 60%, 40%))`,
                    borderColor: 'var(--surface)'
                  }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>2,847+ learners</span> joined this month
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Statstics;
