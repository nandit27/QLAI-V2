import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CircularTimer from "./CircularTimer";
import { calculateBloomAnalysis } from "../utils/bloomAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import BloomTaxonomyChart from "./BloomTaxonomyChart";

import { Button } from "../components/ui/button";

const QuizDisplay = ({ quizData, onFinish }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(quizData.quiz.length).fill(null),
  );
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => quizData.quiz[0]?.time || 30);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [filter, setFilter] = useState("all");

  // Validate quiz data structure
  useEffect(() => {
    if (!quizData || !Array.isArray(quizData.quiz)) {
      setError("Invalid quiz data format");
      return;
    }

    // Accept bloom_quiz format: question, options (object {A,B,C,D} or array), optional answer/level/ifright/ifwrong
    const invalidQuestions = quizData.quiz.some((q) => {
      if (!q || !q.question) return true;
      const hasOptions = Array.isArray(q.options) || (typeof q.options === 'object' && q.options !== null && Object.keys(q.options).length > 0);
      return !hasOptions;
    });

    if (invalidQuestions) {
      setError("Invalid question format in quiz data");
    }
  }, [quizData]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(quizData.quiz[currentQuestion]?.time || 30);
  }, [currentQuestion]);

  // Handle answer selection
  const handleAnswerSelect = (selectedOption) => {
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = selectedOption;
      return newAnswers;
    });
  };

  // Handle moving to next question
  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestion] !== null) {
      if (currentQuestion < quizData.quiz.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        showQuizResults();
      }
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    if (selectedAnswers[currentQuestion] === null) {
      setSelectedAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = "Not answered";
        return newAnswers;
      });
    }

    if (currentQuestion < quizData.quiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      showQuizResults();
    }
  };

  // Show final results
  const showQuizResults = () => {
    setShowResults(true);
    const score = calculateScore();
    const timeSpent = formatTime(Math.floor((Date.now() - startTime) / 1000));

    // Calculate Bloom's taxonomy analysis
    const analysis = calculateBloomAnalysis(quizData.quiz, selectedAnswers);

    // Pass quiz data and analysis to onFinish
    onFinish(score, timeSpent, selectedAnswers, quizData.quiz, analysis);
  };

  // Calculate score
  const calculateScore = () => {
    return selectedAnswers.reduce((acc, answer, index) => {
      if (!answer || answer === "Not answered") return acc;
      const question = quizData.quiz[index];

      // Check if answer is correct
      // Handle both array options and object options {A: "Newton", B: "Pascal"}
      let isCorrect = false;
      if (question.answer != null) {
        if (typeof question.options === 'object' && !Array.isArray(question.options)) {
          // User selected the value (e.g., "Newton"), correct answer is key (e.g., "A")
          isCorrect = answer === question.options[question.answer];
        } else {
          isCorrect = answer === question.answer;
        }
      }

      return acc + (isCorrect ? 1 : 0);
    }, 0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
          <h2 className="text-2xl font-semibold text-center mb-4 text-red-400">
            Error Loading Quiz
          </h2>
          <p className="text-center text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => onFinish()}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-3 px-4 rounded-xl hover:bg-red-500/20 transition-all duration-300"
          >
            Return to Quiz Generator
          </Button>
        </div>
      </div>
    );
  }

  // Show completion state
  if (showResults) {
    const score = calculateScore();
    const timeSpent = formatTime(Math.floor((Date.now() - startTime) / 1000));
    const analysis = calculateBloomAnalysis(quizData.quiz, selectedAnswers);
    const percentage = Math.round((score / quizData.quiz.length) * 100);

    // Get taxonomy level colors
    const getTaxonomyColor = (level) => {
      const colors = {
        remember: 'blue',
        understand: 'blue',
        apply: 'orange',
        analyze: 'purple',
        evaluate: 'purple',
        create: 'green'
      };
      return colors[level?.toLowerCase()] || 'gray';
    };

    // Calculate questions per level
    const levelQuestions = {};
    quizData.quiz.forEach((q, idx) => {
      const level = q.level?.toLowerCase();
      if (!levelQuestions[level]) {
        levelQuestions[level] = { total: 0, correct: 0 };
      }
      levelQuestions[level].total++;

      const userAnswer = selectedAnswers[idx];
      let isCorrect = false;
      if (q.answer != null) {
        if (typeof q.options === 'object' && !Array.isArray(q.options)) {
          isCorrect = userAnswer === q.options[q.answer];
        } else {
          isCorrect = userAnswer === q.answer;
        }
      }
      if (isCorrect) levelQuestions[level].correct++;
    });

    return (
      <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col transition-colors duration-300 pt-32">   <main className="flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 md:py-12">
        <div className="w-full max-w-6xl space-y-12 mb-16">

          {/* Header / Summary Card */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">
                <span>Quizzes</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span>Results</span>
              </nav>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white ">
                Quiz Analysis
              </h1>
              <p className="text-gray-400 font-medium max-w-xl text-lg">
                Comprehensive performance breakdown for your recent assessment.
              </p>
            </div>

            {/* Bento-style Score Card */}
            <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-3xl shadow-sm border border-white/10 flex items-center gap-6 sm:gap-8 min-w-fit md:min-w-[320px]">
              <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-100 " cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="8"></circle>
                  <circle
                    className="text-[#95ff00] transition-all duration-1000 ease-out"
                    cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <span className="absolute text-xl md:text-2xl font-extrabold text-white ">{percentage}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Final Score</div>
                <div className="text-2xl md:text-3xl font-extrabold text-white ">
                  {score} <span className="text-slate-400">/ {quizData.quiz.length}</span> <span className="text-sm font-medium text-slate-500 ">Questions</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-sm text-slate-400 ">schedule</span>
                  <span className="text-xs font-bold text-gray-400 ">Time: {timeSpent}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Bloom's Breakdown */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-white ">Cognitive Taxonomy Breakdown</h2>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#546100] #95ff00] bg-[#95ff00]/10 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-sm font-variation-settings-fill-1">auto_awesome</span>
                AI PERFORMANCE ANALYSIS
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].map((level) => {
                const levelData = levelQuestions[level] || { total: 0, correct: 0 };
                const levelPercentage = levelData.total > 0 ? Math.round((levelData.correct / levelData.total) * 100) : 0;
                const hasQuestions = levelData.total > 0;

                return (
                  <div key={level} className={`bg-[#0a0a0a] border border-white/10 p-5 md:p-6 rounded-2xl transition-all hover:-translate-y-1 shadow-sm ${!hasQuestions ? 'opacity-50' : ''}`}>
                    <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">{level}</div>
                    {hasQuestions ? (
                      <>
                        <div className="text-2xl md:text-3xl font-extrabold text-white mb-4">{levelPercentage}%</div>
                        <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                          <div className="bg-[#95ff00] h-full rounded-full transition-all duration-1000" style={{ width: `${levelPercentage}%` }}></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-bold text-slate-400 italic mb-4 mt-2">Not Assessed</div>
                        <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden"></div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Question Breakdown */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b-2 border-white/10 pb-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-white mb-4 sm:mb-0">Question Breakdown</h2>
              <div className="flex gap-4 sm:gap-6 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/10">
                <Button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${filter === "all" ? "bg-[#0a0a0a] text-white shadow-sm" : "text-slate-500 hover:text-white hover:bg-neutral-900"}`}
                >
                  All Questions
                </Button>
                <Button
                  onClick={() => setFilter("correct")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${filter === "correct" ? "bg-[#95ff00]/10 text-green-700" : "text-slate-500 hover:bg-[#95ff00]/5 hover:text-green-600"}`}
                >
                  Correct
                </Button>
                <Button
                  onClick={() => setFilter("incorrect")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${filter === "incorrect" ? "bg-red-50 text-red-700 shadow-sm" : "text-slate-500 hover:bg-red-50/50 hover:text-red-600"}`}
                >
                  Incorrect
                </Button>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              {quizData.quiz.filter((q, i) => {
                if (filter === 'all') return true;
                const uAns = selectedAnswers[i];
                let isCorr = false;
                if (q.answer != null) {
                  if (typeof q.options === 'object' && !Array.isArray(q.options)) {
                    isCorr = uAns === q.options[q.answer];
                  } else {
                    isCorr = uAns === q.answer;
                  }
                }
                return filter === 'correct' ? isCorr : !isCorr;
              }).map((question, mappedIndex) => {
                const index = quizData.quiz.indexOf(question); // Get original index
                const userAnswer = selectedAnswers[index];
                let isCorrect = false;
                if (question.answer != null) {
                  if (typeof question.options === 'object' && !Array.isArray(question.options)) {
                    isCorrect = userAnswer === question.options[question.answer];
                  } else {
                    isCorrect = userAnswer === question.answer;
                  }
                }
                const wasAnswered = userAnswer && userAnswer !== "Not answered";

                const getOptionLabel = (optionValue) => {
                  if (typeof question.options === 'object' && !Array.isArray(question.options)) {
                    const entry = Object.entries(question.options).find(([key, val]) => val === optionValue);
                    return entry ? entry[0] : optionValue;
                  }
                  return optionValue;
                };
                const userAnswerLabel = getOptionLabel(userAnswer);
                const correctAnswerLabel = question.answer;

                return (
                  <div key={index} className={`group bg-[#0a0a0a] border ${isCorrect ? 'border-white/10 border-l-4 border-l-[#95ff00]' : 'border-red-500/20 border-l-4 border-l-red-500'} p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-neutral-900 text-slate-700 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
                        {question.level || "General"}
                      </span>
                      <div className={`flex items-center gap-2 font-bold text-sm ${isCorrect ? 'text-[#95ff00]' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-snug">
                      {question.question}
                    </h3>

                    <div className="space-y-3 mb-8">
                      {/* User Answer block */}
                      {wasAnswered && (
                        <div className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl ${isCorrect
                          ? "bg-[#95ff00]/10 border border-[#95ff00]"
                          : "bg-red-500/10 border border-red-500/50"
                          }`}>
                          <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold text-sm ${isCorrect ? 'bg-[#95ff00] text-black' : 'bg-red-500 text-white'}`}>
                            {userAnswerLabel && String(userAnswerLabel).length <= 2 ? userAnswerLabel : 'A'}
                          </span>
                          <span className={`font-semibold text-sm md:text-base ${isCorrect ? 'text-white ' : 'text-red-800 '}`}>
                            {typeof question.options === 'object' && !Array.isArray(question.options) && userAnswerLabel
                              ? question.options[userAnswerLabel]
                              : userAnswer}
                          </span>
                          <span className={`ml-auto material-symbols-outlined ${isCorrect ? 'text-green-600 #95ff00]' : 'text-red-500'}`}>
                            {isCorrect ? 'check_circle' : 'cancel'}
                          </span>
                        </div>
                      )}

                      {/* Correct Answer block if wrong */}
                      {!isCorrect && question.answer != null && (
                        <div className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-[#95ff00]/10 border border-[#95ff00]/30 border-dashed">
                          <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#95ff00] text-black font-bold text-sm">
                            {correctAnswerLabel && String(correctAnswerLabel).length <= 2 ? correctAnswerLabel : 'C'}
                          </span>
                          <span className="font-semibold text-sm md:text-base text-white ">
                            {typeof question.options === 'object' && !Array.isArray(question.options)
                              ? question.options[correctAnswerLabel]
                              : question.answer}
                          </span>
                          <span className="ml-auto material-symbols-outlined text-green-600 #95ff00]">
                            check_circle
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mastery Insight */}
                    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 ">
                      <div className={`flex items-center gap-2 mb-3 font-extrabold text-sm uppercase tracking-wider ${isCorrect ? 'text-green-600 #95ff00]' : 'text-orange-500'}`}>
                        <span className="material-symbols-outlined text-lg font-variation-settings-fill-1">lightbulb</span>
                        {isCorrect ? 'Mastery Insight' : 'Learning Opportunity'}
                      </div>
                      <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                        {isCorrect ? question.ifright : question.ifwrong}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer Actions */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-12 border-t border-white/10 ">
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-8 py-4 bg-[#0a0a0a] text-white font-bold rounded-full border border-white/10 hover:bg-neutral-900 :bg-white/10 transition-colors shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Dashboard
            </motion.button>
            <motion.button
              onClick={() => navigate("/quiz")}
              className="w-full sm:w-auto px-8 py-4 bg-[#95ff00] text-white font-extrabold rounded-full shadow-xl shadow-black/10 #95ff00]/20 hover:scale-105 transition-transform"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retake Quiz
            </motion.button>
          </section>

        </div>
      </main>
      </div>
    );
  }

  // Ensure we have valid quiz data before rendering
  if (!quizData?.quiz?.[currentQuestion]) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#95ff00] mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizData.quiz[currentQuestion];

  // Convert options object to array if needed
  const getOptionsArray = (options) => {
    if (Array.isArray(options)) {
      return options;
    }
    // If options is an object like {A: "Newton", B: "Pascal"}
    if (typeof options === 'object') {
      return Object.entries(options).map(([key, value]) => value);
    }
    return [];
  };

  const optionsArray = getOptionsArray(currentQuiz.options);

  return (
    <div className="min-h-screen bg-[#f9f9fd] #0a0f0d] text-white flex flex-col transition-colors duration-300 pt-32">
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 md:px-6 py-12">
        <div className="w-full text-center space-y-8 md:space-y-12 mb-12 md:mb-16">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-[0.25em] rounded-full">
              {currentQuiz.level || "General"}
            </span>
            <h1 className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl leading-[1.3] tracking-tight text-balance p-4 whitespace-normal break-words max-w-full">
              {currentQuiz.question}
            </h1>
          </div>
        </div>

        <div className="w-full flex flex-col gap-4 max-w-4xl pb-32">
          {optionsArray.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === option;
            const letters = ['A', 'B', 'C', 'D', 'E'];
            return (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`group relative w-full text-left p-6 md:p-8 transition-all duration-300 flex items-center gap-4 md:gap-8 rounded-2xl ${isSelected
                  ? "bg-[#95ff00] ring-4 ring-[#95ff00]/50 ring-offset-4 ring-offset-[#f9f9fd] #0a0f0d] shadow-xl shadow-[#95ff00]/20"
                  : "bg-[#0a0a0a] hover:bg-[#0a0a0a] hover:bg-white/5 border border-white/10 "
                  }`}
                variant="ghost"
                size="icon">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-colors ${isSelected
                  ? "bg-black/20 text-black"
                  : "bg-neutral-900 text-slate-700 group-hover:bg-[#0a0a0a] :bg-white/20"
                  }`}>
                  {letters[index]}
                </div>
                <p className={`font-semibold text-lg md:text-xl leading-relaxed ${isSelected ? "text-black" : "text-slate-700 "
                  }`}>
                  {option}
                </p>
                {isSelected && (
                  <div className="ml-auto hidden sm:block">
                    <span className="material-symbols-outlined text-black text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-40">
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion]}
            className="pointer-events-auto px-10 py-5 bg-slate-900 #95ff00] text-white font-extrabold text-lg rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-0 disabled:translate-y-10 flex items-center justify-center gap-4"
            variant="ghost"
            size="icon">
            {currentQuestion === quizData.quiz.length - 1 ? "Finish Quiz" : "Next Question"}
            <span className="material-symbols-outlined font-bold">arrow_forward</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default QuizDisplay;
