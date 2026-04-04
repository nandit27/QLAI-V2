import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Full-page maintenance screen displayed when the site is under maintenance.
 * This blocks all user interaction until maintenance is complete.
 */
const MaintenancePage = ({ message, onRetry, isRetrying }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center z-[9999] p-4"
    >
      <div className="max-w-lg w-full text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-orange-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Under Maintenance
        </motion.h1>

        {/* Status indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-orange-400 text-sm">System Update in Progress</span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl mb-8"
        >
          <p className="text-gray-300 leading-relaxed">
            {message || "We're performing scheduled maintenance to improve your experience. Please check back shortly."}
          </p>
        </motion.div>

        {/* Retry Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking...' : 'Check Again'}
          </button>
        </motion.div>

        {/* Additional info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-gray-500 text-sm"
        >
          We apologize for the inconvenience. Thank you for your patience.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default MaintenancePage;
