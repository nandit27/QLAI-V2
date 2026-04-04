import { BookOpen, Users, Brain, MessageSquare, Youtube } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Features = () => {
  const [hoveredFeature, setHoveredFeature] = useState(0); // Set first feature as default
  const videoRefs = useRef([]);

  // Handle video lazy loading and autoplay
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === hoveredFeature) {
          // Load and play the active video
          video.load();
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Auto-play was prevented:", error);
            });
          }
        } else {
          // Pause and reset other videos
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [hoveredFeature]);

  const features = [
    {
      id: 'yt-summary',
      icon: Youtube,
      title: 'YT Video Summary',
      description: 'Learn and Summarise Youtube Video in Seconds, Saving your Time',
      videoSrc: '/summary.webm',
      fallbackSrc: '/Summary.mp4',
      preview: {
        title: 'YouTube Video Summary',
        content: [
          'Instant video summarization',
          'Key points extraction', 
          'Time-stamped highlights'
        ]
      }
    },
    {
      id: 'mindmap',
      icon: Brain,
      title: 'MindMap',
      description: 'Visualise your Youtube Videos and make your Learning Faster',
      videoSrc: null, // No .webm available for mindmap
      fallbackSrc: '/MindMap.mp4',
      preview: {
        title: 'Interactive Mind Map',
        content: [
          'Visual concept mapping',
          'Topic breakdown',
          'Connection visualization'
        ]
      }
    },
    {
      id: 'quiz',
      icon: BookOpen,
      title: 'Smart Quiz',
      description: 'Attempt the Quiz & Test your knowledge on the Topic.',
      videoSrc: '/Quiz.webm',
      fallbackSrc: '/Quiz.mp4',
      preview: {
        title: 'Smart Quiz Generation',
        content: [
          'Personalized questions',
          'Multiple difficulty levels',
          'Instant feedback'
        ]
      }
    },
    {
      id: 'quickbot',
      icon: MessageSquare,
      title: 'WhisperDoc',
      description: 'Ask Questions to your PDF/PPT and improve your understanding',
      videoSrc: '/WhisperDoc.webm',
      fallbackSrc: '/WhisperDoc.mp4',
      preview: {
        title: 'AI Assistant',
        content: [
          'Document analysis',
          'Instant Q&A',
          'Concept clarification'
        ]
      }
    }
  ];

  return (
    <section className="py-24 bg-black overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Section Header with Enhanced Animation */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-[#00FF9D]/10 rounded-full px-6 py-2 mb-6"
          >
            <motion.span 
              className="h-2 w-2 bg-[#00FF9D] rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[#00FF9D] text-sm font-medium">AI-Powered Features</span>
          </motion.div>
          
          <motion.h2 
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-[#00FF9D] to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Smart Learning Tools
          </motion.h2>
          
          <motion.p
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Discover powerful AI-driven features designed to accelerate your learning journey
          </motion.p>
        </motion.div>

        {/* Features Layout with Enhanced Animations */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Features List */}
          <motion.div 
            className="flex flex-col gap-4 w-full lg:w-96"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isSelected = hoveredFeature === index;
              return (
                <motion.div 
                  key={feature.id}
                  className={`group p-6 rounded-2xl border bg-black/60 backdrop-blur-md cursor-pointer ${
                    isSelected 
                      ? 'border-[#00FF9D] bg-[#00FF9D]/10 shadow-lg shadow-[#00FF9D]/20' 
                      : 'border-white/10 bg-black/40 hover:border-[#00FF9D]/50'
                  }`}
                  onClick={() => setHoveredFeature(isSelected ? 0 : index)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + (index * 0.1),
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                        isSelected 
                          ? 'bg-[#00FF9D]/30' 
                          : 'bg-[#00FF9D]/20'
                      }`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent className={`h-6 w-6 transition-all duration-300 ${
                        isSelected 
                          ? 'text-[#00FF9D]' 
                          : 'text-[#00FF9D]/80 group-hover:text-[#00FF9D]'
                      }`} />
                    </motion.div>
                    <div className="flex-1">
                      <motion.h3 
                        className={`text-lg font-semibold mb-2 transition-all duration-300 ${
                          isSelected 
                            ? 'text-[#00FF9D]' 
                            : 'text-white group-hover:text-[#00FF9D]/90'
                        }`}
                      >
                        {feature.title}
                      </motion.h3>
                      <motion.p 
                        className={`text-sm leading-relaxed transition-all duration-300 ${
                          isSelected 
                            ? 'text-gray-200' 
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      >
                        {feature.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Preview Section - Enhanced with Smooth Animations */}
          <motion.div 
            className="hidden lg:block flex-1 ml-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="sticky top-8">
              <motion.div 
                className="p-8 rounded-2xl border-2 border-[#00FF9D] bg-black/80 backdrop-blur-md shadow-2xl shadow-[#00FF9D]/10"
                style={{ 
                  height: 'calc(4 * (6rem + 1.5rem) + 3rem)',
                  minHeight: '400px'
                }}
                whileHover={{ 
                  boxShadow: "0 25px 50px -12px rgba(0, 255, 157, 0.25)",
                  scale: 1.01
                }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hoveredFeature}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    {/* Video Preview Area - Full Coverage */}
                    <motion.div 
                      className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      whileHover={{ 
                        scale: 1.01,
                        boxShadow: "0 10px 20px rgba(0, 255, 157, 0.1)"
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#00FF9D]/20 to-transparent opacity-0 z-10"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        
                        {/* Feature Video */}
                        <video
                          ref={(el) => (videoRefs.current[hoveredFeature] = el)}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          muted
                          autoPlay
                          loop
                          playsInline
                          preload="metadata"
                          poster={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#1f2937"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">Loading...</text></svg>')}`}
                        >
                          {/* WebM format for better performance */}
                          {features[hoveredFeature]?.videoSrc && (
                            <source src={features[hoveredFeature].videoSrc} type="video/webm" />
                          )}
                          {/* MP4 fallback */}
                          <source src={features[hoveredFeature]?.fallbackSrc || features[hoveredFeature]?.videoSrc} type="video/mp4" />
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-300">
                            Video not supported
                          </div>
                        </video>
                        
                        {/* Video Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-20" />
                        
                        {/* Feature Label */}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded px-3 py-1.5 z-30">
                          <span className="text-[#00FF9D] text-sm font-medium">
                            {features[hoveredFeature]?.title}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Preview - Shows below features on mobile */}
        <motion.div 
          className="lg:hidden mt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="p-6 rounded-2xl border-2 border-[#00FF9D] bg-black/80 backdrop-blur-md shadow-lg shadow-[#00FF9D]/10"
            whileHover={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 255, 157, 0.25)" 
            }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={hoveredFeature}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden mb-4 border border-gray-700 w-full"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-full aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#00FF9D]/20 to-transparent opacity-0 z-10"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    
                    {/* Mobile Feature Video */}
                    <video
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      muted
                      autoPlay
                      loop
                      playsInline
                      preload="metadata"
                      poster={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#1f2937"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">Loading...</text></svg>')}`}
                    >
                      {/* WebM format for better performance */}
                      {features[hoveredFeature]?.videoSrc && (
                        <source src={features[hoveredFeature].videoSrc} type="video/webm" />
                      )}
                      {/* MP4 fallback */}
                      <source src={features[hoveredFeature]?.fallbackSrc || features[hoveredFeature]?.videoSrc} type="video/mp4" />
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-300 text-sm">
                        Video not supported
                      </div>
                    </video>
                    
                    {/* Mobile Video Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-20" />
                    
                    {/* Mobile Feature Label */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded px-3 py-1.5 z-30">
                      <span className="text-[#00FF9D] text-sm font-medium">
                        {features[hoveredFeature]?.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                <div className="space-y-3">
                  {features[hoveredFeature]?.preview.content.map((note, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4,
                        delay: 0.2 + (index * 0.1),
                        ease: "easeOut"
                      }}
                    >
                      <motion.div 
                        className="w-2 h-2 bg-[#00FF9D] rounded-full"
                        whileHover={{ 
                          scale: 1.5,
                          boxShadow: "0 0 8px rgba(0, 255, 157, 0.5)"
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.span 
                        className="text-white text-sm"
                        whileHover={{ 
                          color: '#00FF9D',
                          x: 2
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {note}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;