import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { questionBankService, statisticsService } from "../services/api";
import { toast } from "react-toastify";

const QuestionBankGenerator = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [lowScoreTopics, setLowScoreTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (activeTab === "improvement") {
      fetchLowScoreTopics();
    }
  }, [activeTab]);

  const fetchLowScoreTopics = async () => {
    try {
      setLoadingTopics(true);
      const statistics = await statisticsService.getStatistics(1, true);

      // Filter topics with scores less than 30%
      const lowScoreData = statistics.filter((stat) => {
        const scorePercentage = (stat.score / stat.totalscore) * 100;
        return scorePercentage < 40;
      });

      // Group by topic and get unique topics with their latest scores
      const topicsMap = new Map();
      lowScoreData.forEach((stat) => {
        const scorePercentage = (stat.score / stat.totalscore) * 100;
        if (
          !topicsMap.has(stat.topic) ||
          topicsMap.get(stat.topic).date < new Date(stat.createdAt)
        ) {
          topicsMap.set(stat.topic, {
            topic: stat.topic,
            score: scorePercentage.toFixed(1),
            totalQuestions: stat.totalscore,
            correctAnswers: stat.score,
            date: new Date(stat.createdAt),
            attempts: (topicsMap.get(stat.topic)?.attempts || 0) + 1,
          });
        }
      });

      setLowScoreTopics(Array.from(topicsMap.values()));
    } catch (error) {
      console.error("Failed to fetch quiz statistics:", error);
      toast.error("Failed to load quiz statistics");
      setLowScoreTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

   

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      await questionBankService.generateQuestionBank(topic);
      toast.success(`Question bank for "${topic}" generated successfully!`);
      setTopic("");
    } catch (error) {
      console.error("Question bank generation error:", error);
      toast.error(error.message || "Failed to generate question bank");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicGenerate = async (topicName) => {
    setLoading(true);
    try {
      await questionBankService.generateQuestionBank(topicName);
      toast.success(`Question bank for "${topicName}" generated successfully!`);
    } catch (error) {
      console.error("Question bank generation error:", error);
      toast.error(error.message || "Failed to generate question bank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-[#95ff00]/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-[#95ff00]/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1 mb-8 mx-auto"
        >
          <span className="h-2 w-2 bg-[#95ff00] rounded-full"></span>
          <span className="text-sm">AI-Powered Question Generation</span>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex bg-white/10 rounded-2xl p-1 mb-8 max-w-md mx-auto"
        >
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "manual"
                ? "bg-[#95ff00] text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            Manual Input
          </button>
          <button
            onClick={() => setActiveTab("improvement")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "improvement"
                ? "bg-[#95ff00] text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            Need Improvement
          </button>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "manual" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
          >
            <h1 className="text-4xl font-bold text-center mb-2">
              Question Bank Generator
              <motion.div
                className="h-1 w-24 bg-[#95ff00] mx-auto mt-2"
                initial={{ width: 0 }}
                animate={{ width: "6rem" }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h1>

            <p className="text-gray-400 text-center mb-8">
              Get comprehensive practice questions for your exams
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label
                    htmlFor="topic"
                    className="block text-lg text-gray-300 mb-3"
                  >
                    Enter Your Topic
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-4 bg-white/10 text-white rounded-lg border border-gray-700
                             focus:ring-2 focus:ring-[#95ff00] focus:border-transparent transition-all duration-300
                             placeholder-gray-500"
                    placeholder="e.g., Python Programming, Data Structures, Machine Learning"
                    required
                  />
                </motion.div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-8 rounded-lg text-lg font-semibold transition-all duration-300
                  ${
                    loading
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-[#95ff00] hover:bg-[#95ff00]/80 text-black"
                  }`}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Generating Questions...
                  </div>
                ) : (
                  "Generate Questions"
                )}
              </motion.button>
            </form>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 mt-12"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#95ff00]">10+</h3>
                <p className="text-gray-400 mt-1 text-sm">
                  Questions per Topic
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#95ff00]">3</h3>
                <p className="text-gray-400 mt-1 text-sm">Difficulty Levels</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#95ff00]">PDF</h3>
                <p className="text-gray-400 mt-1 text-sm">Export Format</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
          >
            <h1 className="text-4xl font-bold text-center mb-2">
              Topics Needing Improvement
              <motion.div
                className="h-1 w-32 bg-red-500 mx-auto mt-2"
                initial={{ width: 0 }}
                animate={{ width: "8rem" }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h1>

            <p className="text-gray-400 text-center mb-8">
              Topics where your quiz scores are below 40%
            </p>

            {loadingTopics ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#95ff00] mr-3"></div>
                <span className="text-gray-400">
                  Loading your quiz statistics...
                </span>
              </div>
            ) : lowScoreTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lowScoreTopics.map((topicData, index) => (
                  <motion.div
                    key={topicData.topic}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-red-900/20 to-red-700/20 border border-red-500/30 rounded-xl p-6 hover:border-red-400 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {topicData.topic}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Score: {topicData.score}%</span>
                          <span>
                            {topicData.correctAnswers}/
                            {topicData.totalQuestions}
                          </span>
                          <span>{topicData.attempts} attempts</span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(topicData.score) < 20
                            ? "bg-red-500/20 text-red-300 border border-red-500/50"
                            : parseFloat(topicData.score) < 30
                              ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                        }`}
                      >
                        {topicData.score}%
                      </div>
                    </div>

                    <motion.button
                      onClick={() => handleTopicGenerate(topicData.topic)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </div>
                      ) : (
                        "Generate Practice Questions"
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Great Job!
                  </h3>
                  <p className="text-gray-400">
                    You don't have any topics with scores below 40%. Keep up the
                    excellent work!
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankGenerator;
