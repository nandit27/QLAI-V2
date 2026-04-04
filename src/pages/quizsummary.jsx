import React, { useState, useMemo} from "react";
import { useLocation, useNavigate} from "react-router-dom";
import { motion, AnimatePresence} from "framer-motion";
import { quizService} from "../services/api";
import { statisticsService} from "../services/api";
import { useToast} from "@/components/ui/use-toast";
import QuizDisplay from "../components/QuizDisplay";
import { ArtifactRenderer} from "../components/ArtifactRenderer";
import { parseArtifactString} from "../utils/artifactParser";

const QuizSummary = () => {
 const { state} = useLocation();
 const navigate = useNavigate();
 const { toast} = useToast();

 const [summaryData, setSummaryData] = useState(state?.summaryData || null);
 const [artifactData, setArtifactData] = useState(state?.artifactData ?? "");
 const [artifactDrawerOpen, setArtifactDrawerOpen] = useState(false);
 const [quizData, setQuizData] = useState(state?.quizData || null);
 const [error, setError] = useState("");
 const [youtubeLink, setYoutubeLink] = useState(state?.youtubeLink || "");
 const [selectedModel, setSelectedModel] = useState(
 state?.selectedModel || "",
 );
 const [quizTitle, setQuizTitle] = useState(state?.title || "");
 const [loading, setLoading] = useState(false);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
 const [showSummary, setShowSummary] = useState(true);
 const [showQuiz, setShowQuiz] = useState(false);
 const [selectedDifficulty] = useState(state?.selectedDifficulty || "medium");
 const [questionCount] = useState(state?.questionCount || 5);
 const [showVideoPopup, setShowVideoPopup] = useState(false);
 const [selectedConcept, setSelectedConcept] = useState(null);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);

 const handleStartQuiz = async () => {
 // If quiz data doesn't exist, generate it first
 if (!quizData) {
 try {
 setLoading(true);
 toast({
 title: "Generating quiz...",
 description: "Please wait while we create your quiz questions.",
});

 const response = await quizService.generateQuizOnly(
 youtubeLink,
 questionCount,
 selectedDifficulty,
 selectedModel,
 );

 // Accept bloom_quiz format: response.quiz (from API layer) or response.bloom_quiz.questions
 const questions = response?.quiz ?? response?.bloom_quiz?.questions;
 if (!response || !Array.isArray(questions) || questions.length === 0) {
 throw new Error("Invalid quiz data format");
}

 // Set quiz data with the new format
 setQuizData({
 quiz: questions,
 userAnswers: new Array(questions.length).fill(null),
});

 toast({
 title: "Success",
 description: "Quiz generated successfully!",
});

 // Show quiz after successful generation
 setShowQuiz(true);
 setShowSummary(false);
} catch (error) {
 setError(error.message || "Failed to generate quiz. Please try again.");
 console.error("Error:", error);
 toast({
 title: "Error",
 description: error.message || "Failed to generate quiz.",
 variant: "destructive",
});
} finally {
 setLoading(false);
}
} else {
 // Quiz already exists, just show it
 setShowQuiz(true);
 setShowSummary(false);
}
};

 const handleGenerateSummary = async () => {
 try {
 setLoading(true);
 const response = await quizService.generateSummary(
 youtubeLink,
 selectedModel,
 );
 if (!response || !response.summary) {
 throw new Error("Invalid response data");
}
 setSummaryData(response.summary);
 setArtifactData(response.artifact ?? "");
 setArtifactDrawerOpen(Boolean(response.artifact));
 setShowSummary(true);
 setQuizTitle(
 response.title || response.summary?.main_topic || "Unknown Topic",
 );
 toast({
 title: "Success",
 description: "Summary regenerated successfully!",
});
} catch (error) {
 setError(
 error.message || "Failed to regenerate summary. Please try again.",
 );
 console.error("Error:", error);
 toast({
 title: "Error",
 description: error.message || "Failed to regenerate summary.",
 variant: "destructive",
});
} finally {
 setLoading(false);
}
};

 const handleMindMapNavigation = () => {
 if (!youtubeLink) {
 toast({
 title: "Error",
 description: "Please enter a YouTube URL first!",
 variant: "destructive",
});
 return;
}
 const encodedUrl = encodeURIComponent(youtubeLink);
 window.location.href = `/mindmap?url=${encodedUrl}`;
};

 const handleQuizFinish = async (score, timeSpent, userAnswers, quizQuestions, analysis) => {
 try {
 const userInfo = localStorage.getItem("user-info");
 if (!userInfo) {
 throw new Error("User not authenticated");
}

 const statisticsData = {
 pasturl: youtubeLink,
 score: score,
 totalscore: quizData.quiz.length,
 topic: quizTitle || "Unknown Topic",
 quiz: {
 questions: quizQuestions,
},
 analysis: analysis,
};

 const response = await statisticsService.storeStatistics(statisticsData);
 toast({
 title: "Success",
 description: "Quiz results saved successfully",
 variant: "default",
});

 // Let users stay on results page to view their performance
} catch (error) {
 console.error("Failed to store quiz statistics:", error);
 toast({
 title: "Error",
 description: error.message || "Failed to save quiz results.",
 variant: "destructive",
});
 // Let users stay on results page even if save fails
}
};

 const openVideoPopup = (concept) => {
 console.log("Opening video popup for concept:", concept);
 setSelectedConcept(concept);
 setShowVideoPopup(true);
};

 const closeVideoPopup = () => {
 setShowVideoPopup(false);
 setSelectedConcept(null);
};

 const getYouTubeVideoId = (url) => {
 const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
 const match = url.match(regExp);
 return (match && match[2].length === 11) ? match[2] : null;
};

 const parsedArtifacts = useMemo(
 () => parseArtifactString(artifactData),
 [artifactData]
 );
 const hasArtifacts = parsedArtifacts.length> 0;
 const artifactTypes = useMemo(
 () => [...new Set(parsedArtifacts.map((artifact) => artifact.type.replace(/_/g, " ")))],
 [parsedArtifacts]
 );

 if (showQuiz && quizData) {
 return <QuizDisplay quizData={quizData} onFinish={handleQuizFinish} />;
}

 return (
 <div className="min-h-screen bg-[#f9f9fd] #0a0f0d] text-slate-900 pt-32 pb-12 font-sans transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Header Section */}
 <header className="mb-16">
 <div className="flex items-center gap-4 mb-4">
 <span className="bg-[#95ff00] text-black px-4 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase">Interactive Unit</span>
 <span className="text-slate-600 font-bold text-sm">Key Concepts & Findings</span>
 </div>
 <motion.h1 
 initial={{ opacity: 0, y: -20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ duration: 0.5}}
 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-tight mb-8"
>
 Interactive <br/><span className="text-[#95ff00]">{quizTitle || "Video Summary"}</span>
 </motion.h1>
 <motion.button
 onClick={() => navigate("/quiz")}
 className="inline-flex items-center px-6 py-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 :bg-white/10 font-bold text-slate-900 transition-all duration-300"
 whileHover={{ scale: 1.05}}
 whileTap={{ scale: 0.95}}
>
 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 Back to Generator
 </motion.button>
 </header>

 {/* Summary Section */}
 <AnimatePresence>
 {showSummary && summaryData && (
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 transition={{ duration: 0.5}}
 className="space-y-8 mb-12"
>
 {/* Main Topic and Overview */}
 <motion.div
 className="bg-white border border-slate-100 shadow-[0_40px_40px_-20px_rgba(45,47,50,0.04)] rounded-3xl p-8 lg:p-12 mb-12"
 initial={{ y: 20, opacity: 0}}
 animate={{ y: 0, opacity: 1}}
 transition={{ delay: 0.2}}
>
 <div className="flex justify-between items-start mb-6">
 <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 ">
 {summaryData.main_topic}
 </h2>
 </div>
 <p className="text-xl text-slate-700 leading-relaxed font-medium mb-8">
 {summaryData.overview}
 </p>
 <div className="pt-8 border-t border-slate-100 ">
 <h3 className="text-lg font-bold text-slate-900 #95ff00] mb-4">
 Key Takeaways
 </h3>
 <ul className="space-y-3">
 {summaryData.takeaways.map((takeaway, index) => (
 <motion.li
 key={index}
 className="flex items-start text-slate-700 font-medium"
 initial={{ x: -20, opacity: 0}}
 animate={{ x: 0, opacity: 1}}
 transition={{ delay: 0.3 + index * 0.1}}
>
 <span className="w-2 h-2 bg-[#95ff00] rounded-full mr-4 mt-2.5 flex-shrink-0"></span>
 <span className="leading-relaxed">{takeaway}</span>
 </motion.li>
 ))}
 </ul>
 </div>
 </motion.div>

 {/* Key Concepts - Masonry Flashcards */}
 <div className="columns-1 md:columns-2 xl:columns-3 gap-6">
 {summaryData.key_concepts.map((concept, index) => (
 <motion.div
 key={index}
 className="break-inside-avoid mb-6 bg-white p-8 rounded-3xl shadow-[0_40px_40px_-20px_rgba(45,47,50,0.04)] border border-slate-100 hover:scale-[1.01] transition-transform duration-300"
 initial={{ y: 20, opacity: 0}}
 animate={{ y: 0, opacity: 1}}
 transition={{ delay: 0.4 + index * 0.1}}
 style={{ pointerEvents: 'auto'}}
>
 <div className="flex justify-between items-start mb-6">
 <h3 className="font-extrabold text-2xl tracking-tight text-slate-900 ">
 {concept.concept}
 </h3>
 <span className="material-symbols-outlined text-[#95ff00]" style={{ fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
 </div>
 <p className="text-lg text-slate-700 leading-relaxed mb-8 font-medium">
 {concept.explanation}
 </p>
 <div className="flex flex-wrap gap-2 mb-8">
 {concept.key_points.map((point, idx) => (
 <span key={idx} className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
 {point}
 </span>
 ))}
 </div>
 <div className="pt-6 border-t-4 border-[#95ff00]">
 <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Example Application</span>
 <p className="text-sm font-bold text-slate-700 italic">"{concept.examples[0]}"</p>
 </div>
 
 {/* Video Section */}
 <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center" style={{ pointerEvents: 'auto'}}>
 <div>
 <h4 className="text-sm font-bold text-slate-900 mb-1">
 Video Segment
 </h4>
 <p className="text-xs font-medium text-slate-500 ">
 {concept.start_time} - {concept.end_time}
 </p>
 </div>
 <button
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 openVideoPopup(concept);
}}
 className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full hover:bg-[#95ff00] hover:text-black :bg-[#95ff00] :text-black transition-colors duration-300 transform hover:scale-105 active:scale-95 text-slate-900 "
 style={{ pointerEvents: 'auto', zIndex: 10}}
>
 <span className="material-symbols-outlined font-variation-settings-fill-1">play_arrow</span>
 </button>
 </div>
 
 </motion.div>
 ))}
 </div>
 {hasArtifacts && (
 <motion.div
 className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.55}}
>
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-[0.24em] currentcolor/80">
 Visual Lab
 </p>
 <h3 className="mt-1 text-xl font-semibold text-slate-900 ">
 Open the artifact drawer for richer visual explanations
 </h3>
 <div className="mt-3 flex flex-wrap gap-2">
 {artifactTypes.map((artifactType) => (
 <span
 key={artifactType}
 className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-800 font-bold"
>
 {artifactType}
 </span>
 ))}
 </div>
 </div>
 <motion.button
 type="button"
 onClick={() => setArtifactDrawerOpen(true)}
 className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#95ff00] text-black px-6 py-3 text-sm font-extrabold shadow-lg shadow-[#95ff00]/20"
 whileHover={{ scale: 1.03}}
 whileTap={{ scale: 0.97}}
>
 Open Artifacts
 </motion.button>
 </div>
 </motion.div>
 )}
 </motion.div>
 )}
 </AnimatePresence>

 {/* Action Buttons */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
 {[
 {
 title: "Start Quiz",
 icon: (
 <svg
 className="w-8 h-8 currentcolor"
 fill="currentColor"
 viewBox="0 0 24 24"
>
 <path d="M8 5v14l11-7z" />
 </svg>
 ),
 description: "Test your knowledge now!",
 color: "cyan",
 onClick: handleStartQuiz,
},
 {
 title: "Mind Map",
 icon: (
 <svg
 className="w-8 h-8 currentcolor"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
>
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
 />
 </svg>
 ),
 description: "Visualize key concepts",
 color: "purple",
 onClick: handleMindMapNavigation,
},
 {
 title: loading ? "Regenerating..." : "Regenerate",
 icon: loading ? (
 <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400 border-t-transparent"></div>
 ) : (
 <svg
 className="w-8 h-8 currentcolor"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
>
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
 />
 </svg>
 ),
 description: loading
 ? "Creating new summary"
 : "Get a fresh summary",
 color: "orange",
 onClick: handleGenerateSummary,
},
 {
 title: "Solve Doubt",
 icon: (
 <svg
 className="w-8 h-8 currentcolor"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
>
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 ),
 description: "Ask AI about the video",
 color: "blue",
 onClick: () =>
 navigate("/youtube-chat", {
 state: {
 youtubeUrl: youtubeLink,
 model: selectedModel,
 title: quizTitle,
},
}),
},
 ].map((action, index) => (
 <motion.div
 key={index}
 className="relative bg-white border border-slate-100 rounded-3xl p-6 cursor-pointer overflow-hidden group hover:shadow-xl :shadow-none transition-all duration-300"
 whileHover={{ scale: 1.02, y: -5}}
 whileTap={{ scale: 0.98}}
 onClick={action.onClick}
 initial={{ y: 20, opacity: 0}}
 animate={{ y: 0, opacity: 1}}
 transition={{ delay: 0.6 + index * 0.1}}
>
 <div className="relative z-10 flex flex-col h-full">
 <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#95ff00] group-hover:text-black transition-colors duration-300 text-slate-700 ">
 {action.icon}
 </div>
 <h3 className="text-xl font-extrabold text-slate-900 mb-2 transition-colors duration-300 line-clamp-1">
 {action.title}
 </h3>
 <p className="text-sm font-medium text-slate-500 mt-auto">{action.description}</p>
 </div>
 </motion.div>
 ))}
 </div>

 {hasArtifacts && !artifactDrawerOpen && (
 <motion.button
 type="button"
 onClick={() => setArtifactDrawerOpen(true)}
 className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-3 rounded-l-2xl border border-cyan-500/30 bg-slate-950/95 px-3 py-4 shadow-[0_20px_60px_rgba(8,145,178,0.22)] backdrop-blur"
 initial={{ x: 24, opacity: 0}}
 animate={{ x: 0, opacity: 1}}
 whileHover={{ x: -4}}
>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </span>
 <div className="hidden text-left sm:block">
 <div className="text-[10px] font-semibold uppercase tracking-[0.24em] currentcolor/70">Artifacts</div>
 <div className="text-sm font-medium text-slate-900 ">Open visual lab</div>
 </div>
 </motion.button>
 )}

 <AnimatePresence>
 {hasArtifacts && artifactDrawerOpen && (
 <>
 <motion.button
 type="button"
 aria-label="Close artifact drawer overlay"
 className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 onClick={() => setArtifactDrawerOpen(false)}
 />
 <motion.aside
 className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-2xl flex-col border-l border-cyan-500/20 bg-slate-950/96 shadow-[0_30px_80px_rgba(15,23,42,0.7)]"
 initial={{ x: "100%"}}
 animate={{ x: 0}}
 exit={{ x: "100%"}}
 transition={{ type: "spring", damping: 28, stiffness: 220}}
>
 <div className="border-b border-cyan-500/15 bg-gradient-to-r from-cyan-500/10 via-slate-950 to-pink-500/10 px-5 py-5">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-[0.24em] currentcolor/75">
 Visual Lab
 </p>
 <h3 className="mt-1 text-2xl font-semibold text-slate-900 ">Summary artifacts</h3>
 <p className="mt-2 text-sm leading-6 text-slate-400">
 Explore the generated visuals, study aids, and structured explanations without leaving the summary page.
 </p>
 </div>
 <button
 type="button"
 onClick={() => setArtifactDrawerOpen(false)}
 className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800"
>
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <div className="mt-4 flex flex-wrap gap-2">
 {artifactTypes.map((artifactType) => (
 <span
 key={artifactType}
 className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-800 font-bold"
>
 {artifactType}
 </span>
 ))}
 </div>
 </div>
 <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
 <ArtifactRenderer artifacts={parsedArtifacts} />
 </div>
 </motion.aside>
 </>
 )}
 </AnimatePresence>


 {/* Video Popup Modal */}
 <AnimatePresence>
 {showVideoPopup && selectedConcept && (
 <motion.div
 className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 onClick={closeVideoPopup}
>
 <motion.div
 className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
 initial={{ scale: 0.9, y: 20}}
 animate={{ scale: 1, y: 0}}
 exit={{ scale: 0.9, y: 20}}
 onClick={(e) => e.stopPropagation()}
>
 {/* Modal Header */}
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-2xl font-bold currentcolor">
 {selectedConcept.concept}
 </h3>
 <button
 onClick={closeVideoPopup}
 className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300"
>
 <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Video Player */}
 <div className="mb-6">
 <div className="aspect-video bg-black rounded-lg overflow-hidden">
 {youtubeLink && getYouTubeVideoId(youtubeLink) ? (
 <iframe
 width="100%"
 height="100%"
 src={`https://www.youtube.com/embed/${getYouTubeVideoId(youtubeLink)}?start=${selectedConcept.start_time.split(':').reduce((acc, time) => (60 * acc) + +time)}&end=${selectedConcept.end_time.split(':').reduce((acc, time) => (60 * acc) + +time)}`}
 title={selectedConcept.concept}
 frameBorder="0"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
></iframe>
 ) : (
 <div className="flex items-center justify-center h-full text-gray-400">
 <div className="text-center">
 <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
 </svg>
 <p>Video not available</p>
 </div>
 </div>
 )}
 </div>
 <div className="mt-4 text-center">
 <span className="text-sm currentcolor font-medium">
 Video Segment: {selectedConcept.start_time} - {selectedConcept.end_time}
 </span>
 </div>
 </div>

 {/* Concept Details */}
 <div className="space-y-4">
 <div>
 <h4 className="text-lg font-semibold text-pink-400 mb-2">Explanation</h4>
 <p className="text-gray-300 leading-relaxed">{selectedConcept.explanation}</p>
 </div>
 
 <div>
 <h4 className="text-lg font-semibold text-pink-400 mb-2">Key Points</h4>
 <ul className="space-y-2 text-gray-200">
 {selectedConcept.key_points.map((point, idx) => (
 <li key={idx} className="flex items-start">
 <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
 <span>{point}</span>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-lg font-semibold text-pink-400 mb-2">Examples</h4>
 <div className="space-y-2">
 {selectedConcept.examples.map((example, idx) => (
 <p key={idx} className="text-gray-300 bg-gray-800/50 rounded-lg p-3">
 {example}
 </p>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
};

export default QuizSummary;
