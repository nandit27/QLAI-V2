import { motion } from 'framer-motion';
import { FeatureCarousel } from './ui/feature-carousel';

const features = [
  {
    id: 'yt-summary',
    title: 'YT Video Summary',
    description: 'Learn and Summarise Youtube Video in Seconds, Saving your Time',
    videoSrc: '/summary.webm',
    fallbackSrc: '/Summary.mp4',
  },
  {
    id: 'mindmap',
    title: 'MindMap',
    description: 'Visualise your Youtube Videos and make your Learning Faster',
    videoSrc: null,
    fallbackSrc: '/MindMap.mp4',
  },
  {
    id: 'quiz',
    title: 'Smart Quiz',
    description: 'Attempt the Quiz & Test your knowledge on the Topic.',
    videoSrc: '/Quiz.webm',
    fallbackSrc: '/Quiz.mp4',
  },
  {
    id: 'quickbot',
    title: 'WhisperDoc',
    description: 'Ask Questions to your PDF/PPT and improve your understanding',
    videoSrc: '/WhisperDoc.webm',
    fallbackSrc: '/WhisperDoc.mp4',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#0a0a0a] relative overflow-hidden">

      {/* Decorative grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#95ff00 1px, transparent 1px), linear-gradient(to right, #95ff00 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">

        {/* Section badge + heading */}
        <motion.div
          className="mb-12 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="inline-flex items-center rounded-full bg-[#95ff00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#95ff00]">
            Platform Features
          </span>
          <h2 className="font-heading max-w-2xl text-4xl font-bold tracking-tight text-white md:text-5xl">
            Smart Learning Tools
          </h2>
          <p className="font-body max-w-xl text-base leading-relaxed text-neutral-400">
            Discover powerful AI-driven features designed to accelerate your learning journey
          </p>
        </motion.div>

        {/* Carousel wrapper */}
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <div
            className="rounded-[34px] p-[2px]"
            style={{
              background: 'linear-gradient(135deg, rgba(149,255,0,0.15), rgba(255,255,255,0.04))',
            }}
          >
            <div className="rounded-[33px] bg-[#0c0e11] p-2">
              <div className="relative z-10 grid w-full gap-8 rounded-[28px] bg-neutral-950 p-2">
                <FeatureCarousel
                  features={features}
                  bgClass="bg-gradient-to-br from-neutral-900 to-[#0c0e11]"
                />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Features;