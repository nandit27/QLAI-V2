import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import DottedBackground from "./DottedBackground";
import { BorderTrailCard } from "./core/BorderTrailCard";
import { useState } from "react";
function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <DottedBackground className="flex-1 w-full flex items-center justify-center relative overflow-hidden min-h-screen">
      <div className="text-center relative z-10 mt-40">
        {/* Main Heading with Enhanced Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold mb-6 relative"
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Next Gen{' '}
          </motion.span>
          <motion.span 
            className="bg-gradient-to-r from-[#00FF9D] to-[#1BFFA8] bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            EdTech
          </motion.span>
          <br />
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Fueled by{' '}
          </motion.span>
          <span className="relative">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-white"
            >
              AI
            </motion.span>
            <motion.div
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00FF9D] to-[#1BFFA8] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#00FF9D] rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2 }}
            />
          </span>
        </motion.h1>

        {/* Description with Enhanced Animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          className="text-[#CCCCCC] text-lg md:text-xl mb-16 max-w-3xl mx-auto leading-relaxed"
        >
          Transform your learning journey with our AI-powered educational platform that combines 
          <motion.span
            className="text-[#00FF9D] font-medium"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {' '}intelligent content creation
          </motion.span>, personalized learning experiences, and expert teacher guidance.
        </motion.p>

        {/* Video Player Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto mb-16"
        >
          <BorderTrailCard 
            className="p-1"
            size={80}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: 'linear',
            }}
          >
            <div className="relative group">
              <div className="bg-black/80 backdrop-blur-md rounded-3xl overflow-hidden border border-gray-600/30">
                <div className="aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center relative overflow-hidden">
                  {/* Always show YouTube iframe but control playback */}
                  <iframe
                    className="absolute inset-0 w-full h-full rounded-3xl"
                    src={`https://www.youtube.com/embed/Ui-Qv5YKu-0?${isPlaying ? 'autoplay=1&' : ''}rel=0&modestbranding=1`}
                    title="QuickLearn AI"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                  
                  {/* Custom Play Button Overlay (only show when not playing) */}
                  {!isPlaying && (
                    <motion.button
                      onClick={handlePlayClick}
                      className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-black/20 hover:bg-black/10 transition-all duration-300 group/btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        {/* Main Play Button */}
                        <div className="w-20 h-20 bg-gradient-to-br from-[#00FF9D] to-[#1BFFA8] rounded-full flex items-center justify-center shadow-2xl shadow-[#00FF9D]/50 group-hover/btn:shadow-[#00FF9D]/70 transition-all duration-300">
                          <motion.div
                            className="w-0 h-0 border-l-[16px] border-l-black border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>

                        {/* Pulse Ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[#00FF9D]/60"
                          animate={{ 
                            scale: [1, 1.8, 1], 
                            opacity: [0.8, 0, 0.8] 
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />

                        {/* Secondary Pulse */}
                        <motion.div
                          className="absolute inset-0 rounded-full border border-[#00FF9D]/40"
                          animate={{ 
                            scale: [1, 2.2, 1], 
                            opacity: [0.6, 0, 0.6] 
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.5
                          }}
                        />
                      </div>
                    </motion.button>
                  )}
                </div>

                {/* Video Info Overlay */}
                {!isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2 }}
                      className="flex items-center justify-between text-white"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-[#00FF9D]">QuickLearn AI</h3>
                        
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span>2:34</span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </BorderTrailCard>
        </motion.div>

        {/* Stats Section */}
      </div>
    </DottedBackground>
  );
}

export default Hero;
