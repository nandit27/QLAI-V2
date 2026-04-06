import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      <div className="text-center relative z-10 mt-40 max-w-4xl mx-auto px-4">

        {/* ── Eyebrow badge ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8"
        >
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-primary text-sm font-semibold tracking-wide">
            AI-Powered Learning Platform
          </span>
        </motion.div>

        {/* ── Main heading ────────────────────────────────────────────── */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="font-heading text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]"
        >
          {/* Line 1 */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="block text-white"
          >
            EXAMS ARE A
          </motion.span>

          {/* Line 2 — highlighted + glow */}
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="block text-primary italic text-glow-primary"
          >
            NIGHTMARE.
          </motion.span>

          {/* Line 3 */}
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="block text-white"
          >
            NOT ANYMORE.
          </motion.span>
        </motion.h1>

        {/* ── Underline accent ────────────────────────────────────────── */}
        <motion.div
          className="w-24 h-1 bg-primary rounded-full mx-auto mb-8"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
        />

        {/* ── Subheading paragraph ────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
          className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-body"
        >
          Stop juggling notes, quizzes, and PDFs.{" "}
          <motion.span
            className="text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            QuickLearn AI
          </motion.span>{" "}
          does everything — faster, smarter, stress-free.
        </motion.p>

        {/* ── CTA Buttons ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 bg-primary text-black font-semibold px-8 py-3 rounded-full text-sm hover:bg-primary/90 transition-all duration-300 shadow-[0_0_24px_rgba(149,255,0,0.3)]"
            >
              Get Started Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={handlePlayClick}
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3 rounded-full text-sm hover:bg-white/5 hover:border-white/30 transition-all duration-300"
            >
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* ── Video Player Section (logic + animations unchanged) ───── */}
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
                <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
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
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 group-hover/btn:shadow-primary/60 transition-all duration-300">
                          <motion.div
                            className="w-0 h-0 border-l-[16px] border-l-black border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>

                        {/* Pulse Ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary/60"
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
                          className="absolute inset-0 rounded-full border border-primary/40"
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
                        <h3 className="text-lg font-semibold text-primary font-heading">QuickLearn AI</h3>
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

      </div>
    </DottedBackground>
  );
}

export default Hero;
