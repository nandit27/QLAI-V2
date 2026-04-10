import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, Brain, Sparkles, X, MousePointer2, CheckCircle2 } from 'lucide-react';

const WhisperDocArtwork = () => (
  <div className="relative w-40 h-56 md:w-56 md:h-72 bg-[var(--surface)] border border-white/50 rounded-sm shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex flex-col p-4 md:p-6 gap-3">
    <div className="w-2/3 h-3 md:h-4 bg-[var(--surface-container-highest)] rounded-sm mb-2 md:mb-4" />
    <div className="w-full h-1.5 md:h-2 bg-[var(--surface-container)] rounded-full" />
    <div className="w-full h-1.5 md:h-2 bg-[var(--surface-container)] rounded-full" />
    <div className="w-4/5 h-1.5 md:h-2 bg-[var(--surface-container)] rounded-full" />
    <div className="w-full h-1.5 md:h-2 bg-[var(--surface-container)] rounded-full mt-2 md:mt-4" />
    <div className="w-3/4 h-1.5 md:h-2 bg-[var(--surface-container)] rounded-full" />
    <div className="w-full h-1.5 md:h-2 bg-[var(--surface-container)] rounded-full" />
    
    <div className="absolute -right-4 md:-right-6 bottom-10 md:bottom-12 bg-[#1a6b3c] dark:bg-[#2ebd68] p-3 md:p-4 rounded-2xl rounded-br-none shadow-lg">
      <MessageSquare className="w-4 h-4 md:w-6 md:h-6 text-white dark:text-black" />
    </div>
  </div>
);

const SmartQuizArtwork = () => (
  <div className="relative w-56 h-36 md:w-[22rem] md:h-56 bg-[var(--surface-container)] rounded-t-[0.75rem] md:rounded-t-[1rem] p-1.5 md:p-2 shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex flex-col mb-4 md:mb-5 border border-white/50 relative z-10">
    {/* Screen */}
    <div className="flex-1 w-full bg-[var(--background)] border-[3px] md:border-4 border-[var(--surface-container-highest)] rounded-lg flex items-center justify-center relative overflow-hidden">
      <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-[#1a6b3c] dark:text-[#2ebd68]" />
      <div className="absolute bottom-1.5 left-2 md:bottom-2 md:left-2 flex gap-1">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500/50" />
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-500/50" />
      </div>
    </div>
    {/* Base of laptop */}
    <div className="absolute -bottom-3 md:-bottom-5 left-1/2 -translate-x-1/2 w-[115%] h-4 md:h-6 bg-[var(--surface-container-high)] rounded-b-xl md:rounded-b-2xl rounded-t-sm shadow-xl flex justify-center border-t border-[var(--border)]">
      <div className="w-12 h-1 md:w-16 md:h-1 bg-[var(--border)] rounded-b-lg opacity-50" />
    </div>
  </div>
);

const MindMapArtwork = () => (
  <div className="relative w-40 h-48 md:w-56 md:h-64 bg-[var(--surface-container)] rounded-r-xl border border-white/50 border-l-[12px] md:border-l-[16px] border-l-[#1a6b3c] dark:border-l-[#2ebd68] shadow-[0_10px_25px_rgba(0,0,0,0.15)] p-6 z-10 transition-colors">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-16 md:h-16 border-2 border-[#1a6b3c] dark:border-[#2ebd68] rounded-full flex items-center justify-center z-10 bg-[var(--surface)]">
      <Brain className="w-5 h-5 md:w-8 md:h-8 text-[#1a6b3c] dark:text-[#2ebd68]" />
    </div>
    <svg className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M 50 50 L 20 20" stroke="currentColor" strokeWidth="2" fill="none" className="text-[var(--border)]" />
      <path d="M 50 50 L 80 30" stroke="currentColor" strokeWidth="2" fill="none" className="text-[var(--border)]" />
      <path d="M 50 50 L 30 80" stroke="currentColor" strokeWidth="2" fill="none" className="text-[var(--border)]" />
      <path d="M 50 50 L 70 80" stroke="currentColor" strokeWidth="2" fill="none" className="text-[var(--border)]" />
      <circle cx="20" cy="20" r="4" fill="currentColor" className="text-[var(--border)]" />
      <circle cx="80" cy="30" r="4" fill="currentColor" className="text-[var(--border)]" />
      <circle cx="30" cy="80" r="4" fill="currentColor" className="text-[var(--border)]" />
      <circle cx="70" cy="80" r="4" fill="currentColor" className="text-[var(--border)]" />
    </svg>
  </div>
);

const FlashcardsArtwork = () => (
  <div className="relative w-40 h-28 md:w-56 md:h-40 z-10">
    <div className="absolute inset-0 bg-[var(--surface-container)] border border-white/50 rounded-xl shadow-sm transform -rotate-6" />
    <div className="absolute inset-0 bg-[var(--surface-container-high)] border border-white/50 rounded-xl shadow-sm transform rotate-3" />
    <div className="absolute inset-0 bg-[var(--surface)] border border-white/50 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-4">
      <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[#1a6b3c] dark:text-[#2ebd68] mb-2 md:mb-4" />
      <div className="w-1/2 h-1.5 md:h-2 bg-[var(--surface-container-highest)] rounded-full mb-1.5 md:mb-2" />
      <div className="w-1/3 h-1.5 md:h-2 bg-[var(--surface-variant)] rounded-full" />
    </div>
  </div>
);

/* 
 * Desktop positions pushed securely to corners to perfectly encircle central badge
 */
const features = [
  {
    id: 'quickbot',
    title: 'Whisper Doc',
    tagline: 'Chat with your study materials',
    description: 'Have a conversation with your PDFs and presentations. Ask anything, get instant, cited answers directly from your course materials. No more endlessly skimming pages to find that one specific detail.',
    videoSrc: '/WhisperDoc.webm',
    desktopPos: 'md:top-[12%] lg:top-[15%] md:left-[5%] lg:left-[12%]',
    rotation: -8,
    Artwork: WhisperDocArtwork
  },
  {
    id: 'smart-quiz',
    title: 'Smart Quiz',
    tagline: 'Adaptive quizzing engine',
    description: 'AI-generated quizzes that adapt to your exact knowledge level. We test your weakest areas and reinforce concepts iteratively until absolute mastery is reliably achieved.',
    videoSrc: '/Quiz.webm',
    desktopPos: 'md:top-[15%] lg:top-[18%] md:right-[5%] lg:right-[15%]',
    rotation: 6,
    Artwork: SmartQuizArtwork
  },
  {
    id: 'mindmap',
    title: 'Mind Map',
    tagline: 'Visual thinking, automated',
    description: 'Watch complex, tangled concepts bloom into beautiful visual maps. Connect ideas spatially and unlock patterns you never knew existed. Perfect for organic and visual learners.',
    videoSrc: '/MindMap.mp4',
    desktopPos: 'md:bottom-[15%] lg:bottom-[18%] md:left-[8%] lg:left-[18%]',
    rotation: -4,
    Artwork: MindMapArtwork
  },
  {
    id: 'flashcards',
    title: 'AI Powered Flash Cards',
    tagline: 'Watch less, learn more',
    description: 'Transform any long YouTube lecture into crystal-clear insights. Our AI automatically extracts the essence, transcribes, and highlights key points, leaving you with actionable knowledge instantly.',
    videoSrc: '/summary.webm',
    desktopPos: 'md:bottom-[18%] lg:bottom-[22%] md:right-[10%] lg:right-[20%]',
    rotation: 5,
    Artwork: FlashcardsArtwork
  },
];

const Features = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    if (selectedFeature) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedFeature]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedFeature(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section id="features" className="relative w-full min-h-[160vh] md:min-h-[100vh] bg-[var(--background)] font-sans overflow-hidden flex flex-col md:block items-center py-24 md:py-0 gap-20 border-b border-[var(--border)]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,700;1,700&display=swap');
        
        .font-blocky {
          font-family: 'Chakra Petch', sans-serif;
        }
      `}</style>
      
      {/* Desk Texture Overlay - Theme Aware */}
      <div 
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1] pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")` }} 
      />

      {/* Styled Structural Title Badge perfectly centered across BOTH axes */}
      <div className="relative md:absolute mt-8 md:mt-0 md:top-1/2 mx-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col items-center z-10 group">
        <div className="bg-[var(--surface-container)] border-2 border-[var(--border)] shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.6)] rounded-full px-10 md:px-16 py-4 md:py-6 text-center transform -rotate-1 transition-transform group-hover:rotate-0 group-hover:scale-105 duration-500 whitespace-nowrap">
           <span className="text-[var(--foreground)] font-blocky font-bold text-2xl md:text-3xl lg:text-4xl tracking-[0.1em] uppercase">
             Platform Features
           </span>
        </div>
        
        {/* Helper instruction */}
        <div className="absolute -bottom-8 whitespace-nowrap text-[var(--text-muted)] font-blocky text-xs lg:text-sm uppercase tracking-[0.2em] font-semibold hidden md:block">
           Select any tool to examine
        </div>
      </div>

      {/* Objects scattered on desk */}
      {features.map((feature) => (
        <motion.div
          key={feature.id}
          layoutId={`card-${feature.id}`}
          className={`relative md:absolute ${feature.desktopPos} cursor-pointer group z-20 flex flex-col items-center`}
          initial={{ rotate: feature.rotation }}
          whileHover={{ rotate: 0, scale: 1.05, y: -10, zIndex: 30 }}
          onClick={() => setSelectedFeature(feature)}
        >
          {/* Permanent Floating Identification Tag */}
          <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 bg-[var(--surface-container-high)] border border-[var(--border)] text-[var(--text-secondary)] px-4 md:px-5 py-2 md:py-2.5 rounded-xl shadow-lg font-blocky text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase whitespace-nowrap opacity-90 transition-all duration-300 group-hover:-translate-y-2 group-hover:text-[var(--foreground)] group-hover:border-[#1a6b3c] dark:group-hover:border-[#2ebd68] z-20">
            {feature.title}
            {/* Little triangle pointing down automatically adopting border color */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--surface-container-high)] border-b border-r border-[var(--border)] group-hover:border-[#1a6b3c] dark:group-hover:border-[#2ebd68] transform rotate-45 transition-colors duration-300" />
          </div>

          <div className="pointer-events-none drop-shadow-[0_15px_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.2)] transition-shadow duration-300 pt-4 md:pt-0">
            <feature.Artwork />
          </div>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] text-[10px] md:text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg delay-100 z-20">
            <MousePointer2 className="w-3 h-3" /> Click to open
          </div>
        </motion.div>
      ))}

      {/* Expanded Object Overlay Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[var(--background)]/95 backdrop-blur-md" 
              onClick={() => setSelectedFeature(null)} 
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div 
                layoutId={`card-${selectedFeature.id}`} 
                className="w-full max-w-5xl bg-[var(--surface)] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row overflow-hidden pointer-events-auto border border-[var(--border)]"
              >
                {/* Close button */}
                <button 
                  onClick={() => setSelectedFeature(null)} 
                  className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 bg-[var(--surface-container)]/80 backdrop-blur-md rounded-full border border-[var(--border)] hover:bg-[var(--surface-variant)] transition-colors shadow-sm cursor-pointer"
                >
                  <X className="w-5 h-5 text-[var(--foreground)]" />
                </button>
                
                {/* Video side */}
                <div className="w-full lg:w-[55%] aspect-video lg:aspect-auto lg:h-[60vh] bg-black relative">
                  <motion.video
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    src={selectedFeature.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Branding watermark */}
                  <div className="absolute bottom-4 left-4 text-white/50 font-blocky text-xs uppercase tracking-widest font-bold z-10 pointer-events-none drop-shadow-md">
                    {selectedFeature.title} Demo
                  </div>
                </div>
                
                {/* Info side */}
                <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 lg:p-14 bg-[var(--surface)] overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    <div className="text-[#1a6b3c] dark:text-[#2ebd68] font-blocky text-xs tracking-widest font-bold mb-4 uppercase drop-shadow-sm">Exploration Mode</div>
                    <h3 className="text-3xl md:text-5xl font-bold font-blocky text-[var(--foreground)] tracking-tight mb-4 leading-tight uppercase">
                      {selectedFeature.title}
                    </h3>
                    <h4 className="text-xl font-medium text-[var(--text-muted)] mb-6 tracking-tight">
                      {selectedFeature.tagline}
                    </h4>
                    <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-10 font-medium">
                      {selectedFeature.description}
                    </p>
                    <button className="group inline-flex items-center justify-center gap-2 bg-[#1a6b3c] hover:bg-[#13522d] dark:bg-[#2ebd68] dark:hover:bg-[#259c55] text-white dark:text-black transition-all px-7 py-3.5 rounded-full font-bold tracking-wide text-sm shadow-md hover:shadow-lg">
                      Interact with {selectedFeature.title}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Features;
