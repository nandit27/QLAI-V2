import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CircularTimer from '@/components/CircularTimer';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import socket from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
// import confetti from 'canvas-confetti'; // Disabled - answers should only be visible after quiz ends

const QuizSession = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionsList, setQuestionsList] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));
  const isTeacher = userInfo?.role === 'teacher';
  const [showResults, setShowResults] = useState(false);
  const studentName = localStorage.getItem('quiz-student-name');

  // Gamification states
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [timeBonus, setTimeBonus] = useState(0);
  const [rank, setRank] = useState(null);
  const [showStreak, setShowStreak] = useState(false);
  const hasJoined = useRef(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Achievement definitions
  const ACHIEVEMENTS = {
    FIRST_CORRECT: { id: 'first_correct', title: 'First Blood!', description: 'Got your first correct answer', points: 50 },
    STREAK_3: { id: 'streak_3', title: 'On Fire!', description: 'Got 3 correct answers in a row', points: 100 },
    STREAK_5: { id: 'streak_5', title: 'Unstoppable!', description: 'Got 5 correct answers in a row', points: 200 },
    SPEED_DEMON: { id: 'speed_demon', title: 'Speed Demon', description: 'Answered correctly with more than 20s left', points: 150 },
    PERFECT_SCORE: { id: 'perfect_score', title: 'Perfect!', description: 'Got all questions correct', points: 500 },
  };

  // Add new state for quiz completion
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [waitingForResults, setWaitingForResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);

  // Add this near the top of the component with other state declarations
  const [studentNames, setStudentNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quiz-student-names')) || {};
    } catch {
      return {};
    }
  });

  // Track user's answers for results display
  const [userAnswers, setUserAnswers] = useState({});

  // Function to trigger confetti - DISABLED
  // Confetti disabled to prevent revealing correct answers during quiz
  // const triggerConfetti = () => {
  //   confetti({
  //     particleCount: 100,
  //     spread: 70,
  //     origin: { y: 0.6 }
  //   });
  // };

  // Function to check and award achievements
  const checkAchievements = (isCorrect, timeLeft) => {
    const newAchievements = [...achievements];
    let pointsToAdd = 0;

    // First correct answer
    if (isCorrect && !achievements.includes(ACHIEVEMENTS.FIRST_CORRECT.id)) {
      newAchievements.push(ACHIEVEMENTS.FIRST_CORRECT.id);
      pointsToAdd += ACHIEVEMENTS.FIRST_CORRECT.points;
      setCurrentAchievement(ACHIEVEMENTS.FIRST_CORRECT);
      setShowAchievement(true);
    }

    // Streak achievements
    if (streak === 2 && !achievements.includes(ACHIEVEMENTS.STREAK_3.id)) {
      newAchievements.push(ACHIEVEMENTS.STREAK_3.id);
      pointsToAdd += ACHIEVEMENTS.STREAK_3.points;
      setCurrentAchievement(ACHIEVEMENTS.STREAK_3);
      setShowAchievement(true);
    }

    if (streak === 4 && !achievements.includes(ACHIEVEMENTS.STREAK_5.id)) {
      newAchievements.push(ACHIEVEMENTS.STREAK_5.id);
      pointsToAdd += ACHIEVEMENTS.STREAK_5.points;
      setCurrentAchievement(ACHIEVEMENTS.STREAK_5);
      setShowAchievement(true);
    }

    // Speed demon achievement
    if (isCorrect && timeLeft > 20 && !achievements.includes(ACHIEVEMENTS.SPEED_DEMON.id)) {
      newAchievements.push(ACHIEVEMENTS.SPEED_DEMON.id);
      pointsToAdd += ACHIEVEMENTS.SPEED_DEMON.points;
      setCurrentAchievement(ACHIEVEMENTS.SPEED_DEMON);
      setShowAchievement(true);
    }

    // Perfect score achievement
    if (currentQuestion === questionsList.length - 1 && 
        isCorrect && 
        !achievements.includes(ACHIEVEMENTS.PERFECT_SCORE.id) &&
        scores[userInfo._id] === questionsList.length) {
      newAchievements.push(ACHIEVEMENTS.PERFECT_SCORE.id);
      pointsToAdd += ACHIEVEMENTS.PERFECT_SCORE.points;
      setCurrentAchievement(ACHIEVEMENTS.PERFECT_SCORE);
      setShowAchievement(true);
    }

    if (pointsToAdd > 0) {
      setPoints(prev => prev + pointsToAdd);
      // triggerConfetti(); // Disabled - answers should only be visible after quiz ends
    }

    setAchievements(newAchievements);
  };

  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => {
        setShowAchievement(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAchievement]);

  useEffect(() => {
    if (showStreak) {
      const timer = setTimeout(() => {
        setShowStreak(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showStreak]);

  // Separate effect for initial questions from location.state - runs ONCE on mount
  useEffect(() => {
    if (location.state?.questions) {
      console.log("Received questions from state:", location.state.questions);
      
      // Format 1: Direct array of Bloom's taxonomy questions
      if (Array.isArray(location.state.questions)) {
        console.log(`✅ State - Bloom's taxonomy quiz with ${location.state.questions.length} questions`);
        setQuestionsList(location.state.questions);
        setQuestions({ medium: location.state.questions });
      }
      // Format 2: {easy/medium/hard: [...questions]}
      else if (location.state.questions.easy || location.state.questions.medium || location.state.questions.hard) {
        const difficulty = location.state.questions.easy ? 'easy' 
                        : location.state.questions.medium ? 'medium'
                        : 'hard';
        console.log(`✅ State - Difficulty format: ${difficulty}`);
        setQuestionsList(location.state.questions[difficulty]);
        setQuestions(location.state.questions);
      } 
      // Format 3: {questions: {easy/medium/hard: [...questions]}}
      else if (location.state.questions.questions?.easy || 
               location.state.questions.questions?.medium || 
               location.state.questions.questions?.hard) {
        const difficulty = location.state.questions.questions.easy ? 'easy'
                        : location.state.questions.questions.medium ? 'medium'
                        : 'hard';
        console.log(`✅ State - Nested difficulty format: ${difficulty}`);
        setQuestionsList(location.state.questions.questions[difficulty]);
        setQuestions(location.state.questions.questions);
      }
      // Format 4: Fallback
      else {
        const questionsArray = Object.values(location.state.questions).find(val => Array.isArray(val));
        if (questionsArray) {
          setQuestionsList(questionsArray);
          setQuestions({ medium: questionsArray });
        }
      }
    }
  }, []); // Empty deps - run only once on mount

  // Separate effect for socket setup and event listeners
  useEffect(() => {
    if (!userInfo || !roomId) return;

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('quiz_questions', (questions) => {
      console.log('Received quiz questions from socket:', questions);
      
      if (Array.isArray(questions)) {
        setQuestionsList(questions);
        setQuestions({ medium: questions });
      } else if (questions.easy || questions.medium || questions.hard) {
        const difficulty = questions.easy ? 'easy' : questions.medium ? 'medium' : 'hard';
        setQuestionsList(questions[difficulty]);
        setQuestions(questions);
      } else if (questions.questions?.easy || questions.questions?.medium || questions.questions?.hard) {
        const difficulty = questions.questions.easy ? 'easy' : questions.questions.medium ? 'medium' : 'hard';
        setQuestionsList(questions.questions[difficulty]);
        setQuestions(questions.questions);
      }
    });

    socket.on('update_scores', ({ scores, allCompleted, studentNames }) => {
      console.log('Update scores received:', { scores, allCompleted, studentNames });
      setScores(scores);
      if (studentNames) {
        setStudentNames(studentNames);
        localStorage.setItem('quiz-student-names', JSON.stringify(studentNames));
      }
      if (allCompleted) {
        console.log('All students completed - setting quiz to completed');
        setQuizCompleted(true);
      }
    });

    socket.on('next_question', ({ questionIndex }) => {
      console.log('Moving to next question:', questionIndex);
      setCurrentQuestion(questionIndex);
      setSelectedOption(null);
    });

    socket.on('quiz_completed', (data) => {
      setQuizCompleted(true);
      setResultsData(data);
    });

    socket.on('waiting_for_results', () => {
      setWaitingForResults(true);
    });

    socket.on('results_published', (data) => {
      if (isTeacher) {
        navigate('/quiz-results', { state: { ...data, totalQuestions: data.quizData?.length || questionsList.length || 0 } });
      } else {
        navigate('/student-results', { 
          state: {
            ...data,
            totalQuestions: data.quizData?.length || questionsList.length || 0
          }
        });
      }
    });

    socket.on('quiz_cancelled', (data) => {
      if (isTeacher) {
        // Teacher navigates to results to see partial results
        navigate('/quiz-results', { 
          state: { 
            ...data,
            cancelled: true,
            totalQuestions: data.quizData?.length || questionsList.length || 0
          } 
        });
      } else {
        // Student navigates to their results showing what they attempted
        navigate('/student-results', { 
          state: {
            ...data,
            totalQuestions: data.quizData?.length || questionsList.length || 0,
            cancelled: true
          }
        });
      }
    });

    socket.on('final_scores', ({ scores, studentNames }) => {
      if (isTeacher) {
        setScores(scores);
        setShowResults(true);
        navigate('/quiz-results', { state: { scores, studentNames, totalQuestions: questionsList.length || 0 } });
      } else {
        navigate('/student-results', { state: { score: scores[userInfo._id], totalQuestions: questionsList.length || 0 } });
      }
    });

    // Join quiz room only once
    if (!hasJoined.current) {
      socket.emit('join_quiz_room', {
        roomId,
        userId: userInfo._id,
        role: userInfo.role,
        studentName: studentName
      });
      hasJoined.current = true;
    }

    return () => {
      socket.off('connect');
      socket.off('quiz_questions');
      socket.off('update_scores');
      socket.off('final_scores');
      socket.off('quiz_completed');
      socket.off('waiting_for_results');
      socket.off('results_published');
      socket.off('quiz_cancelled');
      socket.off('next_question');
      hasJoined.current = false;
    };
  }, [roomId, userInfo?._id]);

  useEffect(() => {
    console.log("questionsList updated:", questionsList);
    console.log("questions updated:", questions);
  }, [questionsList, questions]);

  const handleSubmitAnswer = () => {
    // Check if we've reached the end of questions
    if (currentQuestion >= questionsList.length) {
      setWaitingForResults(true);
      return;
    }
    
    // Calculate time bonus (kept for backend tracking)
    const timeLeft = document.querySelector('.timer-value')?.textContent || 0;
    const currentTimeBonus = Math.floor(timeLeft * 10); // 10 points per second left
    
    // Store user's answer locally for results display (even if null)
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: selectedOption
    }));

    // Only submit answer if an option was selected
    if (selectedOption) {
      socket.emit('submit_answer', {
        roomId,
        userId: userInfo._id,
        studentName: studentName,
        question: {
          ...questionsList[currentQuestion],
          totalQuestions: questionsList.length,
          answer: questionsList[currentQuestion].answer
        },
        selectedOption,
        timeLeft: timeLeft, // Send time for backend scoring calculation
      });
    }
    
    // Move to next question regardless of whether answer was selected
    setSelectedOption(null);
    const nextQuestion = currentQuestion + 1;
    
    // Check if this was the last question
    if (nextQuestion >= questionsList.length) {
      setWaitingForResults(true);
    } else {
      setCurrentQuestion(nextQuestion);
    }
  };

  const handlePublishResults = () => {
    console.log('Publishing results for room:', roomId);
    socket.emit('publish_results', {
      roomId,
      teacherId: userInfo._id
    });
  };

  const handleCancelQuiz = () => {
    if (window.confirm('Are you sure you want to cancel the quiz? Students\' attempted questions will be evaluated.')) {
      console.log('Cancelling quiz for room:', roomId);
      socket.emit('cancel_quiz', {
        roomId,
        teacherId: userInfo._id
      });
    }
  };

  const handleEndQuiz = () => {
    console.log('Ending quiz for room:', roomId);
    socket.emit('quiz_end', {
      roomId
    });
  };

  // Teacher waiting screen with publish button
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  {quizCompleted ? '🎉 Quiz Completed!' : '⌛ Quiz in Progress'}
                </h2>
                <p className="text-gray-400">
                  {quizCompleted 
                    ? 'All students have completed the quiz. You can now declare the results.'
                    : 'Waiting for all students to complete the quiz...'}
                </p>
              </div>
              
              {quizCompleted && (
                <div className="flex items-center gap-2 text-[#00FF9D]">
                  <div className="w-3 h-3 bg-[#00FF9D] rounded-full animate-pulse"></div>
                  Ready to Declare
                </div>
              )}
            </div>

            <div className="bg-black/20 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Student Progress</h3>
              <div className="space-y-4">
                {Object.entries(scores).map(([studentId, score]) => {
                  // Get the student name from the studentName object
                  const currentStudentName = studentNames[studentId] || `Student ${studentId.slice(-4)}`;
                  
                  return (
                    <div key={studentId} className="flex justify-between items-center border-b border-white/10 pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          quizCompleted ? 'bg-[#00FF9D]' : 'bg-yellow-400 animate-pulse'
                        }`}></div>
                        <span>{currentStudentName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {quizCompleted ? `${score}/${questionsList?.length || 0}` : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!quizCompleted && (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEndQuiz}
                  className="w-full bg-orange-500 text-white font-semibold
                    h-12 rounded-lg transition-all duration-300 flex items-center justify-center gap-2
                    hover:bg-orange-600"
                >
                  <span>End Quiz Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelQuiz}
                  className="w-full bg-red-500 text-white font-semibold
                    h-12 rounded-lg transition-all duration-300 flex items-center justify-center gap-2
                    hover:bg-red-600"
                >
                  <span>Cancel Quiz & Evaluate Attempts</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            )}

            {quizCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#00FF9D]/10 rounded-lg p-4">
                  <h3 className="text-[#00FF9D] font-semibold mb-2">Ready to Declare Results</h3>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Quiz results will be generated as CSV</li>
                    <li>• Leaderboard will be published to all students</li>
                    <li>• Top performers will receive badges (🥇, 🥈, 🥉)</li>
                    <li>• All students will see their rankings</li>
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublishResults}
                  className="w-full bg-[#00FF9D] text-black font-semibold
                    h-12 rounded-lg transition-all duration-300 flex items-center justify-center gap-2
                    hover:bg-[#00FF9D]/90"
                >
                  <span>Declare Results Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Student waiting screen
  if (waitingForResults) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold">Quiz Completed!</h2>
            <p className="text-xl text-gray-400">Results are being finalized by your teacher...</p>
            
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#00FF9D]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#00FF9D] border-t-transparent animate-spin"></div>
            </div>

            <motion.div
              className="space-y-4 text-gray-400 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 justify-center">
                <span className="text-[#00FF9D]">✓</span>
                <p>Your answers have been securely submitted</p>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-yellow-400">⌛</span>
                <p>Waiting for teacher to declare results</p>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-orange-400">🏆</span>
                <p>Rankings and achievements coming soon!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show loading state if no questions
  if (!questionsList || questionsList.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF9D]"></div>
      </div>
    );
  }

  // Show completion state
  if (currentQuestion >= questionsList.length) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Quiz Completed!</h2>
          <p className="text-gray-400">Waiting for final results...</p>
        </div>
      </div>
    );
  }

  // Get the current question from the questionsList array
  const currentQuiz = questionsList[currentQuestion];
  console.log("questionsList", questionsList);
  console.log("currentQuiz", currentQuiz);
  
  // Convert options to array format if it's an object (Bloom's taxonomy format)
  let optionsArray = [];
  if (currentQuiz?.options) {
    if (Array.isArray(currentQuiz.options)) {
      // Already an array
      optionsArray = currentQuiz.options;
    } else if (typeof currentQuiz.options === 'object') {
      // Object format: {A: "text", B: "text", C: "text", D: "text"}
      // Convert to array of objects with key and value
      optionsArray = Object.entries(currentQuiz.options).map(([key, value]) => ({
        key,
        value,
        label: `${key}. ${value}`
      }));
    }
  }
  
  // Add safety check for currentQuiz and its properties
  if (!currentQuiz?.question || optionsArray.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="text-red-500">Error: Invalid question data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* Achievement popup */}
        <AnimatePresence>
          {showAchievement && currentAchievement && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#00FF9D]/20 border border-[#00FF9D] p-4 rounded-lg shadow-lg z-50"
            >
              <h3 className="text-[#00FF9D] font-bold">{currentAchievement.title}</h3>
              <p className="text-sm text-white/80">{currentAchievement.description}</p>
              <p className="text-[#00FF9D] font-bold">+{currentAchievement.points} points!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak indicator */}
        <AnimatePresence>
          {showStreak && streak > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed top-24 right-8 bg-[#00FF9D]/20 border border-[#00FF9D] p-4 rounded-lg"
            >
              <p className="text-[#00FF9D] font-bold">🔥 {streak}x Streak!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          {/* Stats bar - HIDDEN during quiz to prevent revealing answer correctness */}
          {/* Points, streaks, and bonuses will be shown after teacher publishes results */}
          {/* <div className="flex justify-between items-center mb-6 p-4 bg-black/20 rounded-lg">
            <div>
              <p className="text-sm text-gray-400">Points</p>
              <p className="text-2xl font-bold text-[#00FF9D]">{points}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Time Bonus</p>
              <p className="text-2xl font-bold text-yellow-400">+{timeBonus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Streak</p>
              <p className="text-2xl font-bold text-orange-400">{streak}x</p>
            </div>
          </div> */}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Question {currentQuestion + 1} of {questionsList.length}
              </h2>
              <CircularTimer 
                key={currentQuestion}
                duration={currentQuiz?.time || 30} 
                onTimeUp={handleSubmitAnswer}
              />
            </div>
            
            <p className="text-lg">{currentQuiz.question}</p>
            
            {/* Display Bloom's taxonomy level if available */}
            {currentQuiz.level && (
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
                  {currentQuiz.level}
                </span>
              </div>
            )}
            
            <div className="space-y-3">
              {optionsArray.map((option, idx) => {
                // Handle both array format ["text1", "text2"] and object format [{key: "A", value: "text", label: "A. text"}]
                const optionValue = typeof option === 'string' ? option : option.key;
                const optionLabel = typeof option === 'string' ? option : option.label;
                
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOption(optionValue)}
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-300
                      ${selectedOption === optionValue 
                        ? 'border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D]' 
                        : 'border-white/10 hover:bg-white/5'}`}
                  >
                    {optionLabel}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAnswer}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] 
                hover:bg-[#00FF9D]/20 h-12 rounded-lg transition-all duration-300"
            >
              {selectedOption ? 'Submit Answer' : 'Skip Question'}
            </motion.button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizSession;