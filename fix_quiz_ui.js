const fs = require('fs');

// 1. Fix QuizSummary.jsx "Start Quiz" loader
let quizSummaryPath = 'src/pages/quizsummary.jsx';
let summaryCode = fs.readFileSync(quizSummaryPath, 'utf8');

// Add isStartingQuiz state
summaryCode = summaryCode.replace(
  'const [selectedConcept, setSelectedConcept] = useState(null);',
  'const [selectedConcept, setSelectedConcept] = useState(null);\n  const [isStartingQuiz, setIsStartingQuiz] = useState(false);'
);

// Use isStartingQuiz in handleStartQuiz
summaryCode = summaryCode.replace(
  'setLoading(true);\n        toast({\n          title: "Generating quiz...",',
  'setIsStartingQuiz(true);\n        toast({\n          title: "Generating quiz...",'
);

summaryCode = summaryCode.replace(
  '} finally {\n        setLoading(false);',
  '} finally {\n        setIsStartingQuiz(false);'
);

// Update button UI
// Wait, the title: "Start Quiz", might appear multiple times. We can replace exactly the button block
summaryCode = summaryCode.replace(
  /title: "Start Quiz",\n\s*icon: \([\s\S]*?viewBox="0 0 24 24"\>\n\s*<path d="M8 5v14l11-7z" \/>\n\s*<\/svg>\n\s*\),\n\s*description: "Test your knowledge now!",\n\s*color: "cyan",\n\s*onClick: handleStartQuiz,/,
  `title: isStartingQuiz ? "Starting..." : "Start Quiz",
      icon: isStartingQuiz ? (
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
      ) : (
        <svg
          className="w-8 h-8 currentcolor"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      ),
      description: isStartingQuiz ? "Generating quiz..." : "Test your knowledge now!",
      color: "cyan",
      onClick: isStartingQuiz ? undefined : handleStartQuiz,`
);

fs.writeFileSync(quizSummaryPath, summaryCode);

// 2. Fix QuizDisplay.jsx UI Bugs
let quizDisplayPath = 'src/components/QuizDisplay.jsx';
let displayCode = fs.readFileSync(quizDisplayPath, 'utf8');

// Add Filter State
displayCode = displayCode.replace(
  'const [startTime] = useState(Date.now());',
  'const [startTime] = useState(Date.now());\n  const [filter, setFilter] = useState("all");'
);

// Remove the inline navbar header and add its info to main body, and add pt-32 to min-h-screen
displayCode = displayCode.replace(
  '<div className="min-h-screen bg-[#f9f9fd] #0a0f0d] text-slate-900 flex flex-col transition-colors duration-300">',
  '<div className="min-h-screen bg-[#f9f9fd] #0a0f0d] text-slate-900 flex flex-col transition-colors duration-300 pt-32">'
);

// Replace the <header> with an empty string, or we can just replace the entire block
// Or better, just remove the w-full h-20 div called 'header'.
// Looking at lines 439 to 468, it's `<header ...> ... </header>`
const headerRegex = /<header className="w-full h-20 flex items-center justify-between px-6 md:px-8 bg-white\/50 backdrop-blur-md z-50 border-b border-slate-200 ">[\s\S]*?<\/header>/;
displayCode = displayCode.replace(headerRegex, '');

// Reduce question font size
displayCode = displayCode.replace(
  'text-slate-900 font-extrabold text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight text-balance',
  'text-slate-900 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-[1.3] tracking-tight text-balance p-4'
);

// Insert Timer inside main section near the question
const mainSectionRegex = /(<main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 md:px-6 py-12">\n\s*<div className="w-full text-center space-y-8 md:space-y-12 mb-12 md:mb-16">\n\s*<div className="space-y-4">)/;

const newTimerDiv = `        {/* Question Header Area with Timer */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mx-auto mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col mb-4 sm:mb-0">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-none mb-1">Question</span>
              <span className="text-slate-900 font-extrabold text-2xl leading-none">{currentQuestion + 1} of {quizData.quiz.length}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right flex flex-col">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-none mb-1">Time Remaining</span>
                <span className="text-slate-900 font-bold text-xl leading-none">{timeLeft}s</span>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full">
                <CircularTimer
                  key={currentQuestion}
                  duration={quizData.quiz[currentQuestion]?.time || 30}
                  onTimeUp={handleTimeUp}
                />
              </div>
            </div>
          </div>\n\n`;

displayCode = displayCode.replace(mainSectionRegex, (match) => match.replace('<div className="space-y-4">', newTimerDiv + '          <div className="space-y-4">'));

// Modify filters section
const filtersRegex = /<div className="flex gap-6">\n\s*<span className="text-xs font-extrabold text-slate-900 border-b-2 border-slate-900 #95ff00\] pb-2">All Questions<\/span>\n\s*<\/div>/;

const newFilters = `<div className="flex gap-4 sm:gap-6 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={() => setFilter("all")} 
              className={\`px-4 py-2 text-xs font-extrabold rounded-lg transition-all \${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}\`}
            >
              All Questions
            </button>
            <button 
              onClick={() => setFilter("correct")} 
              className={\`px-4 py-2 text-xs font-extrabold rounded-lg transition-all \${filter === "correct" ? "bg-[#95ff00]/10 text-green-700" : "text-slate-500 hover:bg-[#95ff00]/5 hover:text-green-600"}\`}
            >
              Correct
            </button>
            <button 
              onClick={() => setFilter("incorrect")} 
              className={\`px-4 py-2 text-xs font-extrabold rounded-lg transition-all \${filter === "incorrect" ? "bg-red-50 text-red-700 shadow-sm" : "text-slate-500 hover:bg-red-50/50 hover:text-red-600"}\`}
            >
              Incorrect
            </button>
          </div>`;

displayCode = displayCode.replace(filtersRegex, newFilters);

// Filter questions before mapping
const mapRegex = /\{quizData\.quiz\.map\(\(question, index\) => \{([\s\S]*?)const userAnswer = selectedAnswers\[index\];/;
displayCode = displayCode.replace(mapRegex, `{quizData.quiz.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              let isCorrect = false;
              if (question.answer != null) {
                if (typeof question.options === 'object' && !Array.isArray(question.options)) {
                  isCorrect = userAnswer === question.options[question.answer];
                } else {
                  isCorrect = userAnswer === question.answer;
                }
              }

              // Apply filters
              if (filter === "correct" && !isCorrect) return null;
              if (filter === "incorrect" && isCorrect) return null;
`);

fs.writeFileSync(quizDisplayPath, displayCode);
console.log('Fixed successfully');
