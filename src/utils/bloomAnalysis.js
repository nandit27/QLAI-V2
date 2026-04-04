/**
 * Calculate Bloom's taxonomy performance analysis from quiz results
 * @param {Array} questions - Array of quiz questions with level property
 * @param {Array} userAnswers - Array of user's selected answers
 * @returns {Object} Analysis object with percentage of correct answers for each level
 */
export const calculateBloomAnalysis = (questions, userAnswers) => {
  // Initialize counters for each level
  const levelStats = {
    remember: { correct: 0, total: 0 },
    understand: { correct: 0, total: 0 },
    apply: { correct: 0, total: 0 },
    analyze: { correct: 0, total: 0 },
    evaluate: { correct: 0, total: 0 },
    create: { correct: 0, total: 0 },
  };

  // Process each question
  questions.forEach((question, index) => {
    const level = question.level?.toLowerCase();
    const userAnswer = userAnswers[index];

    // Skip if level is not recognized or answer is missing
    if (!level || !levelStats[level] || !userAnswer || userAnswer === "Not answered") {
      return;
    }

    // Increment total for this level
    levelStats[level].total++;

    // Check if answer is correct
    // Handle both array options and object options {A: "Newton", B: "Pascal"}
    let isCorrect = false;
    if (typeof question.options === 'object' && !Array.isArray(question.options)) {
      // User selected the value (e.g., "Newton"), correct answer is key (e.g., "A")
      // Check if the selected value matches the value of the correct answer key
      isCorrect = userAnswer === question.options[question.answer];
    } else {
      // Direct comparison for array-based options
      isCorrect = userAnswer === question.answer;
    }
    
    if (isCorrect) {
      levelStats[level].correct++;
    }
  });

  // Calculate percentages
  const analysis = {};
  Object.keys(levelStats).forEach((level) => {
    const { correct, total } = levelStats[level];
    // If no questions for this level, set to 0
    analysis[level] = total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  return analysis;
};

/**
 * Format quiz data for statistics API
 * Extracts only necessary fields from the full quiz response
 * @param {Object} quizResponse - Full quiz response from /quiz API
 * @returns {Object} Formatted quiz object for storage
 */
export const formatQuizForStatistics = (quizResponse) => {
  if (!quizResponse || !quizResponse.bloom_quiz || !quizResponse.bloom_quiz.questions) {
    return null;
  }

  return {
    questions: quizResponse.bloom_quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      level: q.level,
      ifright: q.ifright,
      ifwrong: q.ifwrong,
    })),
  };
};
