import React from "react";
import { motion } from "framer-motion";

const BloomTaxonomyChart = ({ analysis }) => {
  const levels = [
    { key: "remember", label: "Remember", color: "#95ff00", icon: "💭" },
    { key: "understand", label: "Understand", color: "#3B82F6", icon: "💡" },
    { key: "apply", label: "Apply", color: "#8B5CF6", icon: "⚡" },
    { key: "analyze", label: "Analyze", color: "#F59E0B", icon: "🔍" },
    { key: "evaluate", label: "Evaluate", color: "#EF4444", icon: "⚖️" },
    { key: "create", label: "Create", color: "#EC4899", icon: "✨" },
  ];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md rounded-2xl p-8 border border-[#95ff00]/20"
      >
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          📊 Bloom's Taxonomy Performance
        </h3>
        
        <div className="space-y-6">
          {levels.map((level, index) => {
            const percentage = analysis[level.key] || 0;
            const hasData = percentage > 0 || analysis[level.key] === 0;
            
            return (
              <motion.div
                key={level.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Level Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{level.icon}</span>
                    <span className="text-white font-semibold text-lg">
                      {level.label}
                    </span>
                  </div>
                  <span
                    className="text-xl font-bold"
                    style={{ color: level.color }}
                  >
                    {hasData ? `${percentage}%` : "N/A"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: hasData ? `${percentage}%` : "0%" }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
                    className="h-full rounded-full relative"
                    style={{
                      background: `linear-gradient(90deg, ${level.color}40, ${level.color})`,
                    }}
                  >
                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{
                        animation: "shine 2s infinite",
                        animationDelay: `${index * 0.2}s`,
                      }}
                    />
                  </motion.div>
                </div>

                {/* Performance Indicator */}
                {hasData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="mt-1 text-xs text-gray-400"
                  >
                    {percentage >= 80 ? "🌟 Excellent" :
                     percentage >= 60 ? "👍 Good" :
                     percentage >= 40 ? "📈 Fair" :
                     percentage > 0 ? "💪 Needs Practice" : "❌ No Attempts"}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-gray-700/50"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#95ff00]">
                {Math.round(
                  Object.values(analysis).reduce((a, b) => a + b, 0) / 
                  Object.values(analysis).filter(v => v !== undefined).length
                )}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Average Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {Object.values(analysis).filter(v => v >= 70).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Strong Areas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {Object.values(analysis).filter(v => v < 60 && v > 0).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Areas to Improve</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default BloomTaxonomyChart;
