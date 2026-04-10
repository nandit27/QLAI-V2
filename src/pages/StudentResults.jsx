import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateBloomAnalysis } from '../utils/bloomAnalysis';

import { Button } from "../components/ui/button";

const StudentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores, points, rankings, studentNames, quizData, userAnswers, cancelled } = location.state || {};
  
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [sortedLeaderboard, setSortedLeaderboard] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [bloomAnalysis, setBloomAnalysis] = useState(null);

  useEffect(() => {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
    setCurrentUserInfo(userInfo);

    if (userInfo._id && scores) {
      // Handle both old format (number) and new format (object with Bloom's breakdown)
      const userScore = scores[userInfo._id];
      const totalScore = typeof userScore === 'object' ? userScore.total : userScore || 0;
      setMyScore(totalScore);
      setMyPoints(points?.[userInfo._id] || 0);
      setMyRank(rankings?.[userInfo._id] || 0);
    }

    // Create sorted leaderboard
    if (scores && points) {
      const leaderboard = Object.entries(points)
        .map(([id, pts]) => {
          const scoreData = scores[id];
          const totalScore = typeof scoreData === 'object' ? scoreData.total : scoreData || 0;
          return {
            id,
            name: studentNames?.[id] || `Student ${id.slice(-4)}`,
            score: totalScore,
            points: pts,
            rank: rankings?.[id] || 0
          };
        })
        .sort((a, b) => b.points - a.points);
      
      setSortedLeaderboard(leaderboard);
    }

    // If quiz data is available, extract questions
    let extractedQuestions = [];
    if (quizData) {
      // Handle different quiz data formats
      if (Array.isArray(quizData)) {
        extractedQuestions = quizData;
      } else if (quizData.questions) {
        if (Array.isArray(quizData.questions)) {
          extractedQuestions = quizData.questions;
        } else {
          // Handle difficulty-based format {easy: [], medium: [], hard: []}
          const difficulty = Object.keys(quizData.questions)[0];
          extractedQuestions = quizData.questions[difficulty] || [];
        }
      }
      
      setQuestions(extractedQuestions);
    }

    // Store user answers if available - extract current user's answers
    if (userAnswers && userInfo._id) {
      // userAnswers is structured as {userId: {0: answer, 1: answer, ...}}
      const currentUserAnswers = userAnswers[userInfo._id] || {};
      setSelectedAnswers(currentUserAnswers);
      
      // Calculate Bloom's taxonomy analysis if questions available
      if (extractedQuestions.length > 0) {
        const analysis = calculateBloomAnalysis(extractedQuestions, currentUserAnswers);
        setBloomAnalysis(analysis);
      }
    }
  }, [scores, points, rankings, studentNames, quizData, userAnswers]);

  useEffect(() => {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
    setCurrentUserInfo(userInfo);

    if (userInfo._id && scores) {
      // Handle both old format (number) and new format (object with Bloom's breakdown)
      const userScore = scores[userInfo._id];
      const totalScore = typeof userScore === 'object' ? userScore.total : userScore || 0;
      setMyScore(totalScore);
      setMyPoints(points?.[userInfo._id] || 0);
      setMyRank(rankings?.[userInfo._id] || 0);
    }

    // Create sorted leaderboard
    if (scores && points) {
      const leaderboard = Object.entries(points)
        .map(([id, pts]) => {
          const scoreData = scores[id];
          const totalScore = typeof scoreData === 'object' ? scoreData.total : scoreData || 0;
          return {
            id,
            name: studentNames?.[id] || `Student ${id.slice(-4)}`,
            score: totalScore,
            points: pts,
            rank: rankings?.[id] || 0
          };
        })
        .sort((a, b) => b.points - a.points);
      
      setSortedLeaderboard(leaderboard);
    }

    // Extract questions from quiz data
    let extractedQuestions = [];
    if (quizData) {
      // Format 1: Direct array
      if (Array.isArray(quizData)) {
        extractedQuestions = quizData;
      } 
      // Format 2: Object with questions property
      else if (quizData.questions) {
        // Format 2a: questions is an array
        if (Array.isArray(quizData.questions)) {
          extractedQuestions = quizData.questions;
        } 
        // Format 2b: questions is an object with difficulty levels
        else if (typeof quizData.questions === 'object') {
          const difficulty = Object.keys(quizData.questions).find(key => 
            Array.isArray(quizData.questions[key]) && quizData.questions[key].length > 0
          );
          if (difficulty) {
            extractedQuestions = quizData.questions[difficulty];
          }
        }
      }
      // Format 3: Object with difficulty level keys directly
      else if (typeof quizData === 'object') {
        const difficulty = ['easy', 'medium', 'hard'].find(level => 
          Array.isArray(quizData[level]) && quizData[level].length > 0
        );
        if (difficulty) {
          extractedQuestions = quizData[difficulty];
        }
      }
      
      setQuestions(extractedQuestions);
    }

    // Store user answers - extract current user's answers from the userAnswers object
    if (userAnswers && userInfo._id) {
      // userAnswers is structured as {userId: {0: answer, 1: answer, ...}}
      const currentUserAnswers = userAnswers[userInfo._id] || {};
      setSelectedAnswers(currentUserAnswers);
      
      // Calculate Bloom's taxonomy analysis
      if (extractedQuestions.length > 0) {
        const analysis = calculateBloomAnalysis(extractedQuestions, currentUserAnswers);
        setBloomAnalysis(analysis);
      }
    }
  }, [scores, points, rankings, studentNames, quizData, userAnswers]);

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

  const getBadge = (index) => {
    switch(index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return null;
    }
  };

  if (!location.state) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <p className="text-red-400 text-center mb-4">No results data available</p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] font-medium py-3 px-4 rounded-xl hover:bg-[#95ff00]/20 transition-all duration-300"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length || myScore || 10;
  const percentage = Math.round((myScore / totalQuestions) * 100);

  // Calculate questions per level
  const levelQuestions = {};
  questions.forEach((q, idx) => {
    const level = q.level?.toLowerCase();
    if (!levelQuestions[level]) {
      levelQuestions[level] = { total: 0, correct: 0 };
    }
    levelQuestions[level].total++;
    
    const userAnswer = selectedAnswers[idx];
    let isCorrect = false;
    
    // Check if options are in object format {A: "text", B: "text"}
    if (typeof q.options === 'object' && !Array.isArray(q.options)) {
      // userAnswer is the key (like "A"), q.answer is also the key (like "A")
      isCorrect = userAnswer === q.answer;
    } else {
      // For array format or direct answer comparison
      isCorrect = userAnswer === q.answer;
    }
    
    if (isCorrect) levelQuestions[level].correct++;
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-black">
      <main className="flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 md:py-12">
        <div className="w-full max-w-5xl space-y-8 md:space-y-12">
          {/* SECTION 1: Score Overview Card */}
          <section className="flex flex-col gap-6">
            <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-white md:text-4xl">
              Your Quiz Result
            </h1>
            
            {cancelled && (
              <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-orange-500 font-semibold">Quiz Cancelled by Teacher</p>
                    <p className="text-orange-300 text-sm">These are the results for questions you attempted before cancellation.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="rounded-xl border border-white/10 bg-white/5 p-1 shadow-lg shadow-black/5 backdrop-blur-sm">
              <div className="flex flex-col gap-6 rounded-lg bg-transparent p-6 md:flex-row md:gap-4">
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-4">
                  <p className="text-base font-medium text-slate-400">Total Score</p>
                  <p className="text-3xl font-bold leading-tight tracking-tight text-white">
                    {myScore} / {totalQuestions}
                  </p>
                </div>
                <div className="hidden w-px bg-white/10 md:block"></div>
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-4">
                  <p className="text-base font-medium text-slate-400">Percentage</p>
                  <p className="text-3xl font-bold leading-tight tracking-tight text-white">
                    {percentage}%
                  </p>
                </div>
                <div className="hidden w-px bg-white/10 md:block"></div>
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-4">
                  <p className="text-base font-medium text-slate-400">Your Rank</p>
                  <p className="text-3xl font-bold leading-tight tracking-tight text-white">
                    #{myRank}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/5">
              <div className="flex items-center justify-between gap-6">
                <p className="text-base font-medium text-white">{percentage}% Correct</p>
                <p className="text-sm font-normal text-slate-400">{totalQuestions} Questions</p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-[#95ff00]" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Bloom's Taxonomy Performance Chart */}
          {bloomAnalysis && (
            <section className="flex flex-col gap-4">
              <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-white">
                Performance by Cognitive Level
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].map((level) => {
                  const levelData = levelQuestions[level] || { total: 0, correct: 0 };
                  const levelPercentage = levelData.total > 0 ? Math.round((levelData.correct / levelData.total) * 100) : 0;
                  const hasQuestions = levelData.total > 0;
                  const colorClass = getTaxonomyColor(level);

                  return (
                    <div key={level} className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white capitalize">{level}</h3>
                        <span className={`text-sm font-medium ${
                          !hasQuestions ? 'text-slate-500' : 
                          levelPercentage === 100 ? 'text-[#95ff00]' : 
                          levelPercentage === 0 ? 'text-red-500' : 
                          'text-[#95ff00]'
                        }`}>
                          {hasQuestions ? `${levelPercentage}%` : 'N/A'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {levelData.correct}/{levelData.total} questions
                      </p>
                      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-700">
                        <div 
                          className={`h-1.5 rounded-full ${
                            !hasQuestions ? 'bg-slate-400' :
                            levelPercentage === 0 ? 'bg-red-500' : 'bg-[#95ff00]'
                          }`} 
                          style={{ width: `${levelPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 3: Detailed Review of Each Question */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-white">
              Question Breakdown
            </h2>
            <div className="flex flex-col gap-4">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const wasAnswered = userAnswer && userAnswer !== "Not answered";
                const colorClass = getTaxonomyColor(question.level);

                // Determine if options are in object or array format
                const hasObjectOptions = question.options && typeof question.options === 'object' && !Array.isArray(question.options);
                
                // Check if answer is correct
                let isCorrect = false;
                let correctAnswerValue = null;
                let userAnswerKey = null;
                
                if (hasObjectOptions) {
                  // Object format: {A: "Task queue", B: "Micro-task queue"}
                  // userAnswer is the key (like "A"), question.answer is also the key (like "A")
                  isCorrect = userAnswer === question.answer;
                  correctAnswerValue = question.options[question.answer];
                  userAnswerKey = userAnswer;
                } else {
                  // Array format or direct answer
                  isCorrect = userAnswer === question.answer;
                  correctAnswerValue = question.answer;
                }

                return (
                  <div key={index} className="flex gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/5">
                    <div className={`w-1.5 shrink-0 ${isCorrect ? 'bg-[#95ff00]' : 'bg-red-500'}`}></div>
                    <div className="flex-1 py-4 pr-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-400">
                              Question {index + 1}
                            </p>
                            <p className="mt-1 text-base text-white">
                              {question.question}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {question.level && (
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${
                                colorClass === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                colorClass === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                colorClass === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {question.level}
                              </span>
                            )}
                            {question.difficulty && (
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${
                                question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {question.difficulty}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* All Options Display */}
                        <div className="space-y-2">
                          {hasObjectOptions ? (
                            // Display object format options: {A: "...", B: "..."}
                            (Object.entries(question.options).map(([key, value]) => {
                              const isUserAnswer = key === userAnswer;
                              const isCorrectAnswer = key === question.answer;
                              
                              return (
                                <div
                                  key={key}
                                  className={`flex items-center gap-3 rounded-lg border p-3 text-white ${
                                    isCorrectAnswer
                                      ? 'border-[#95ff00]/50 bg-[#95ff00]/20'
                                      : isUserAnswer
                                      ? 'border-red-500/50 bg-red-500/20'
                                      : 'border-white/10 bg-white/5'
                                  }`}
                                >
                                  {(isUserAnswer || isCorrectAnswer) && (
                                    <span className={`text-xl ${isCorrectAnswer ? 'text-[#95ff00]' : 'text-red-500'}`}>
                                      {isCorrectAnswer ? '✓' : '✗'}
                                    </span>
                                  )}
                                  <div className="flex-1">
                                    <span className="font-mono font-bold mr-2">{key}.</span>
                                    <span>{value}</span>
                                  </div>
                                  {isCorrectAnswer && (
                                    <span className="text-[#95ff00] text-sm font-medium">Correct</span>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <span className="text-red-400 text-sm font-medium">Your Answer</span>
                                  )}
                                </div>
                              );
                            }))
                          ) : (
                            // Fallback: Show user answer and correct answer
                            (<>
                              {wasAnswered && (
                                <div className={`flex items-center gap-3 rounded-lg border p-3 text-white ${
                                  isCorrect 
                                    ? 'border-[#95ff00]/50 bg-[#95ff00]/20'
                                    : 'border-red-500/50 bg-red-500/20'
                                }`}>
                                  <span className={`text-xl ${isCorrect ? 'text-[#95ff00]' : 'text-red-500'}`}>
                                    {isCorrect ? '✓' : '✗'}
                                  </span>
                                  <div className="flex-1">
                                    <span className="font-medium">Your answer: </span>
                                    <span>{userAnswer}</span>
                                  </div>
                                </div>
                              )}
                              {!isCorrect && (
                                <div className="flex items-center gap-3 rounded-lg border border-[#95ff00]/50 bg-[#95ff00]/20 p-3 text-white">
                                  <span className="text-xl text-[#95ff00]">✓</span>
                                  <div className="flex-1">
                                    <span className="font-medium">Correct answer: </span>
                                    <span>{correctAnswerValue}</span>
                                  </div>
                                </div>
                              )}
                            </>)
                          )}
                        </div>

                        {/* Explanation */}
                        <div className="w-full">
                          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                            <h4 className="font-bold text-white">
                              {isCorrect ? 'Well Done' : 'Learning Opportunity'}
                            </h4>
                            <p className="mt-2">
                              {isCorrect ? question.ifright : question.ifwrong}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: Leaderboard */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-white">
              Leaderboard
            </h2>
            <div className="flex flex-col gap-3">
              {sortedLeaderboard.slice(0, 10).map((student, index) => {
                const isCurrentUser = student.id === currentUserInfo?._id;
                const badge = getBadge(index);
                
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                      isCurrentUser
                        ? "border-[#95ff00]/50 bg-[#95ff00]/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-400 min-w-[2rem]">#{index + 1}</span>
                      {badge && <span className="text-2xl">{badge}</span>}
                      <div>
                        <p className={`font-semibold ${isCurrentUser ? "text-[#95ff00]" : "text-white"}`}>
                          {student.name} {isCurrentUser && "(You)"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {student.score} correct • {student.points} pts
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {sortedLeaderboard.length > 10 && (
              <div className="text-center text-sm text-slate-400">
                Showing top 10 of {sortedLeaderboard.length} students
              </div>
            )}
          </section>

          {/* SECTION 5: Footer Actions */}
          <section className="flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-end md:pt-12">
            <motion.button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto flex items-center gap-2 px-6 py-3 bg-[#95ff00]/10 text-base font-semibold rounded-full border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20 hover:border-[#95ff00]/50 transition-all duration-300 relative overflow-hidden group"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0, 255, 157, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#95ff00]/10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Back to Home</span>
            </motion.button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentResults; 