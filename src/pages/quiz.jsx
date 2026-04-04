import { useState, useEffect } from "react";
import { Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuizDisplay from "../components/QuizDisplay";
import { quizService, documentQuizService } from "../services/api";
import FlashCard from "../components/FlashCard";
import { useToast } from "@/components/ui/use-toast";
import { statisticsService } from "../services/api";
import socket from "../utils/socket";
import { motion, AnimatePresence } from "framer-motion";
import NameInputModal from "../components/NameInputDialog";
import { BorderTrailCard } from "../components/core/BorderTrailCard";
import Footer from "../components/Footer";

const QuizGenerator = () => {
 const { toast } = useToast();
 const [loading, setLoading] = useState(false);
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const [selectedDifficulty, setSelectedDifficulty] = useState("");
 const [error, setError] = useState("");
 const [quizData, setQuizData] = useState(null);
 const [showQuiz, setShowQuiz] = useState(false);
 const [showSummary, setShowSummary] = useState(false);
 const [summaryData, setSummaryData] = useState(null);
 const [quizStats, setQuizStats] = useState(null);
 const [showStats, setShowStats] = useState(false);
 const [quizTitle, setQuizTitle] = useState("");

 // Mode selection state
 const [selectedMode, setSelectedMode] = useState('youtube'); // 'youtube' or 'document'

 // Form state
 const [youtubeLink, setYoutubeLink] = useState("");
 const [questionCount, setQuestionCount] = useState(5);
 const [uploadedFiles, setUploadedFiles] = useState([]);
 const [isDragging, setIsDragging] = useState(false);
 const [uploadedDocumentId, setUploadedDocumentId] = useState(null);
 const [uploadingDocument, setUploadingDocument] = useState(false);

 // Add new state for model dropdown
 const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
 const [selectedModel, setSelectedModel] = useState("");
 const [showModelSuggestion, setShowModelSuggestion] = useState(false);

 // Add state for recent quizzes
 const [recentQuizzes, setRecentQuizzes] = useState([]);
 const [loadingRecentQuizzes, setLoadingRecentQuizzes] = useState(false);

 // Add navigate hook
 const navigate = useNavigate();

 const handleModeChange = (mode) => {
 setSelectedMode(mode);
 setError("");
 };

 const handleFileUpload = async (files) => {
 const validFiles = Array.from(files).filter(file => {
 const ext = file.name.split('.').pop().toLowerCase();
 return ['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(ext);
 });
 
 if (validFiles.length === 0) {
 setError("Please upload a valid document (PDF, PPT, PPTX, DOC, DOCX)");
 return;
 }
 
 setUploadedFiles(validFiles);
 setError("");
 
 // Upload the document immediately
 try {
 setUploadingDocument(true);
 toast({
 title: "Uploading document...",
 description: "Please wait while we process your document.",
 });
 
 const uploadResult = await documentQuizService.uploadDocument(validFiles[0]);
 setUploadedDocumentId(uploadResult.documentId);
 
 toast({
 title: "Document uploaded!",
 description: `${uploadResult.filename} is ready for quiz generation.`,
 });
 } catch (error) {
 console.error("Error uploading document:", error);
 setError(error.message || "Failed to upload document. Please try again.");
 toast({
 title: "Upload failed",
 description: error.message || "Failed to upload document. Please try again.",
 variant: "destructive",
 });
 setUploadedFiles([]);
 } finally {
 setUploadingDocument(false);
 }
 };

 const handleDrop = async (e) => {
 e.preventDefault();
 setIsDragging(false);
 await handleFileUpload(e.dataTransfer.files);
 };

 const handleDragOver = (e) => {
 e.preventDefault();
 setIsDragging(true);
 };

 const handleDragLeave = (e) => {
 e.preventDefault();
 setIsDragging(false);
 };

 const removeFile = (index) => {
 setUploadedFiles(files => files.filter((_, i) => i !== index));
 setUploadedDocumentId(null);
 };

 const handleDifficultySelect = (difficulty) => {
 setSelectedDifficulty(difficulty.toLowerCase());
 setIsDropdownOpen(false);
 };

 const validateYoutubeUrl = (url) => {
 const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
 return youtubeRegex.test(url);
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");

 // Validate based on mode
 if (selectedMode === 'youtube') {
 if (!youtubeLink) {
 setError("Please enter a YouTube URL");
 return;
 }
 if (!validateYoutubeUrl(youtubeLink)) {
 setError("Please enter a valid YouTube URL");
 return;
 }
 } else if (selectedMode === 'document') {
 if (uploadedFiles.length === 0) {
 setError("Please upload a document");
 return;
 }
 if (!uploadedDocumentId) {
 setError("Document is still uploading. Please wait.");
 return;
 }
 }

 if (!selectedDifficulty) {
 setError("Please select a difficulty level");
 return;
 }

 if (!selectedModel) {
 setError("Please select a model");
 return;
 }

 try {
 setLoading(true);
 
 let response;
 let sourceLink = '';
 
 if (selectedMode === 'youtube') {
 // YouTube summary generation only - quiz will be generated on demand
 response = await quizService.generateSummary(
 youtubeLink,
 selectedModel,
 );
 sourceLink = youtubeLink;
 
 // Navigate to summary page without quiz data
 const title = response.title || response.summary?.main_topic || "Unknown Topic";
 setQuizTitle(title);

 navigate("/quizsummary", {
 state: {
 summaryData: response.summary,
 artifactData: response.artifact ?? "",
 quizData: null, // Quiz will be generated on demand
 youtubeLink: sourceLink,
 selectedModel,
 title,
 quizMode: selectedMode,
 // Pass quiz parameters for later generation
 questionCount,
 selectedDifficulty,
 },
 });
 } else {
 // Document-based quiz generation (keeps existing behavior)
 toast({
 title: "Generating quiz...",
 description: "Creating questions from your document.",
 });

 // Generate quiz from already uploaded document
 response = await documentQuizService.generateQuizFromDocument(
 uploadedDocumentId,
 questionCount,
 selectedDifficulty,
 selectedModel
 );
 
 sourceLink = uploadedFiles[0].name;
 
 if (!response || !response.bloom_quiz || !response.summary) {
 throw new Error("Invalid quiz data format");
 }

 // Extract quiz questions from bloom_quiz
 const quizQuestions = response.bloom_quiz.questions || [];

 // Set the quiz title for later use and navigate to summary page with data
 const title = response.title || response.summary?.main_topic || "Unknown Topic";
 setQuizTitle(title);

 navigate("/quizsummary", {
 state: {
 summaryData: response.summary,
 quizData: {
 quiz: quizQuestions,
 userAnswers: new Array(quizQuestions.length).fill(null),
 },
 youtubeLink: sourceLink,
 selectedModel,
 title,
 quizMode: selectedMode,
 },
 });
 }
 } catch (error) {
 setError(error.message || "Failed to generate quiz. Please try again.");
 console.error("Error:", error);
 toast({
 title: "Error",
 description: error.message || "Failed to generate quiz. Please try again.",
 variant: "destructive",
 });
 } finally {
 setLoading(false);
 }
 };

 const handleStartQuiz = () => {
 setShowSummary(false);
 setShowQuiz(true);
 };

 const handleQuizFinish = async (score, timeSpent, userAnswers, quizQuestions, analysis) => {
 setQuizStats({
 score,
 totalQuestions: quizData.quiz.length,
 timeSpent,
 questions: quizData.quiz,
 userAnswers: userAnswers,
 });

 try {
 const userInfo = localStorage.getItem("user-info");
 if (!userInfo) {
 throw new Error("User not authenticated");
 }
 
 // Create statistics data with quiz and analysis
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
 console.log("Sending statistics data:", statisticsData);

 const response = await statisticsService.storeStatistics(statisticsData);
 console.log("Statistics stored successfully:", response);

 toast({
 title: "Success",
 description: "Quiz results saved successfully",
 variant: "default",
 });
 } catch (error) {
 console.error("Failed to store quiz statistics:", error);
 toast({
 title: "Error",
 description:
 error.message || "Failed to save quiz results. Please try again.",
 variant: "destructive",
 });
 }

 setShowStats(true);
 setShowQuiz(false);
 };

 // Add this function to handle summary regeneration
 const handleGenerateSummary = async () => {
 try {
 setLoading(true);
 const response = await quizService.generateQuiz(
 youtubeLink,
 questionCount,
 selectedDifficulty,
 selectedModel,
 );

 if (!response || !response.summary) {
 throw new Error("Invalid summary data format");
 }

 // Update both summary and quiz data
 setSummaryData(response.summary);
 
 if (response.bloom_quiz && response.bloom_quiz.questions) {
 setQuizData({
 quiz: response.bloom_quiz.questions,
 userAnswers: new Array(response.bloom_quiz.questions.length).fill(null),
 });
 }
 } catch (error) {
 setError(
 error.message || "Failed to regenerate summary. Please try again.",
 );
 console.error("Error:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleMindMapNavigation = () => {
 if (!youtubeLink) {
 alert("Please enter a YouTube URL first!");
 return;
 }

 // Navigate with the encoded URL
 const encodedUrl = encodeURIComponent(youtubeLink);
 window.location.href = `/mindmap?url=${encodedUrl}`; // Using direct navigation
 };

 // Add model selection handler
 const handleModelSelect = (model) => {
 setSelectedModel(model);
 setIsModelDropdownOpen(false);
 setShowModelSuggestion(false); // Hide suggestion when model is selected
 };

 // Add function to show model suggestion
 const handleModelDropdownClick = () => {
 setIsModelDropdownOpen(!isModelDropdownOpen);
 };

 // Fetch recent quizzes on mount
 useEffect(() => {
 const fetchRecentQuizzes = async () => {
 try {
 setLoadingRecentQuizzes(true);
 const response = await statisticsService.getStatistics();

 // Process statistics to show unique recent quizzes
 const uniqueQuizzes = [];
 const seenUrls = new Set();

 // Sort by creation date (most recent first) and filter unique URLs
 response
 .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
 .forEach((stat) => {
 if (!seenUrls.has(stat.pasturl) && uniqueQuizzes.length < 6) {
 seenUrls.add(stat.pasturl);
 uniqueQuizzes.push({
 url: stat.pasturl,
 topic: stat.topic,
 score: stat.score,
 totalScore: stat.totalscore,
 date: stat.createdAt,
 });
 }
 });

 setRecentQuizzes(uniqueQuizzes);
 } catch (error) {
 console.error("Error fetching recent quizzes:", error);
 } finally {
 setLoadingRecentQuizzes(false);
 }
 };

 fetchRecentQuizzes();
 }, []);

 // Handle selecting a recent quiz
 const handleRecentQuizSelect = (quiz) => {
 setYoutubeLink(quiz.url);

 // Show success toast
 toast({
 title: "Quiz Selected",
 description: `Using video: ${quiz.topic || "Untitled Quiz"}`,
 variant: "default",
 });

 // Optionally scroll to form
 window.scrollTo({ top: 0, behavior: "smooth" });
 };

 // Extract video ID from YouTube URL for thumbnail
 const getYouTubeVideoId = (url) => {
 const regex =
 /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
 const match = url.match(regex);
 return match ? match[1] : null;
 };

 // Show quiz if active
 if (showQuiz && quizData) {
 return <QuizDisplay quizData={quizData} onFinish={handleQuizFinish} />;
 }

 // Show summary if available
 if (showSummary && summaryData) {
 return (
 <div className="min-h-screen bg-[#000805] text-white pt-24">
 <div className="max-w-6xl mx-auto p-8">
 {/* Back Button at Top */}
 <div className="mb-8">
 <motion.button
 onClick={() => setShowSummary(false)}
 className="group flex items-center gap-3 px-6 py-3 bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl hover:border-[#1BFFA8]/50 transition-all duration-300"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <svg
 className="w-5 h-5 text-gray-400 group-hover:text-[#1BFFA8] transition-colors duration-300"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 19l-7-7 7-7"
 />
 </svg>
 <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
 Back to Generator
 </span>
 </motion.button>
 </div>

 <div className="text-center mb-12">
 <h1 className="text-4xl font-bold mb-4">
 Video <span className="text-[#1BFFA8]">Summary</span>
 </h1>
 <p className="text-gray-400">
 Here&apos;s what we learned from the video
 </p>
 </div>

 <div className="space-y-6 mb-12">
 {Object.entries(summaryData).map(([key, value]) => (
 <FlashCard key={key} title={key} content={value} />
 ))}
 </div>

 {/* Action Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {/* Start Quiz Card */}
 <motion.div
 className="group relative bg-gradient-to-br from-[#1BFFA8]/20 via-[#1BFFA8]/10 to-transparent border border-[#1BFFA8]/30 rounded-2xl p-6 cursor-pointer overflow-hidden"
 whileHover={{ scale: 1.05, y: -5 }}
 whileTap={{ scale: 0.95 }}
 onClick={handleStartQuiz}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1BFFA8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 <div className="relative z-10">
 <div className="w-12 h-12 bg-[#1BFFA8]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1BFFA8]/30 transition-colors duration-300">
 <svg
 className="w-6 h-6 text-[#1BFFA8]"
 fill="currentColor"
 viewBox="0 0 24 24"
 >
 <path d="M8 5v14l11-7z" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#1BFFA8] transition-colors duration-300">
 Start Quiz
 </h3>
 <p className="text-sm text-gray-400">
 Begin your learning assessment
 </p>
 </div>
 <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#1BFFA8]/10 rounded-full blur-xl group-hover:bg-[#1BFFA8]/20 transition-colors duration-500"></div>
 </motion.div>

 {/* Mind Map Card */}
 <motion.div
 className="group relative bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6 cursor-pointer overflow-hidden"
 whileHover={{ scale: 1.05, y: -5 }}
 whileTap={{ scale: 0.95 }}
 onClick={handleMindMapNavigation}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 <div className="relative z-10">
 <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors duration-300">
 <svg
 className="w-6 h-6 text-purple-400"
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
 </div>
 <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">
 Mind Map
 </h3>
 <p className="text-sm text-gray-400">Visualize key concepts</p>
 </div>
 <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors duration-500"></div>
 </motion.div>

 {/* Regenerate Summary Card */}
 <motion.div
 className="group relative bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl p-6 cursor-pointer overflow-hidden"
 whileHover={{ scale: loading ? 1 : 1.05, y: loading ? 0 : -5 }}
 whileTap={{ scale: loading ? 1 : 0.95 }}
 onClick={handleGenerateSummary}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 <div className="relative z-10">
 <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors duration-300">
 {loading ? (
 <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-400 border-t-transparent"></div>
 ) : (
 <svg
 className="w-6 h-6 text-orange-400"
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
 )}
 </div>
 <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
 {loading ? "Regenerating..." : "Regenerate"}
 </h3>
 <p className="text-sm text-gray-400">
 {loading ? "Creating new summary" : "Get a fresh summary"}
 </p>
 </div>
 <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors duration-500"></div>
 </motion.div>

 {/* Solve Doubt Card */}
 <motion.div
 className="group relative bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-6 cursor-pointer overflow-hidden"
 whileHover={{ scale: 1.05, y: -5 }}
 whileTap={{ scale: 0.95 }}
 onClick={() =>
 navigate("/youtube-chat", {
 state: {
 youtubeUrl: youtubeLink,
 model: selectedModel,
 title: quizTitle,
 },
 })
 }
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 <div className="relative z-10">
 <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors duration-300">
 <svg
 className="w-6 h-6 text-blue-400"
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
 </div>
 <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
 Solve Doubt
 </h3>
 <p className="text-sm text-gray-400">Ask AI about the video</p>
 </div>
 <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
 </motion.div>
 </div>

 {/* Quick Stats or Additional Info */}
 <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
 <div className="flex items-center justify-between text-sm text-gray-400">
 <span>Ready to test your knowledge?</span>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 bg-[#1BFFA8] rounded-full animate-pulse"></span>
 <span>Summary generated successfully</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 // Show stats if available
 if (showStats && quizStats) {
 return (
 <div className="min-h-screen bg-[#000805] text-white pt-24">
 <div className="max-w-4xl mx-auto p-8">
 {/* Back Button at Top */}
 <div className="mb-8">
 <motion.button
 onClick={() => {
 setShowStats(false);
 setQuizData(null);
 setYoutubeLink("");
 setSelectedDifficulty("");
 setQuestionCount(5);
 }}
 className="group flex items-center gap-3 px-6 py-3 bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl hover:border-[#1BFFA8]/50 transition-all duration-300"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <svg
 className="w-5 h-5 text-gray-400 group-hover:text-[#1BFFA8] transition-colors duration-300"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 19l-7-7 7-7"
 />
 </svg>
 <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
 Back to Generator
 </span>
 </motion.button>
 </div>

 <div className="text-center mb-12">
 <h2 className="text-6xl font-bold mb-4">
 YOUR SCORE:{" "}
 <span className="text-[#1BFFA8]">
 {quizStats.score}/{quizStats.totalQuestions}
 </span>
 </h2>
 <p className="text-2xl text-gray-400">
 Time utilised: {quizStats.timeSpent}
 </p>
 </div>

 <div className="space-y-6">
 <div className="grid grid-cols-3 gap-4 mb-4 text-xl font-bold">
 <div>Questions</div>
 <div>Your Answer</div>
 <div>Correct Answer</div>
 </div>

 {quizStats.questions.map((question, index) => (
 <div
 key={index}
 className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${quizStats.userAnswers[index] === question.answer
 ? "bg-green-500/10 border border-green-500/30"
 : "bg-red-500/10 border border-red-500/30"
 }`}
 >
 <div>{question.question}</div>
 <div>{quizStats.userAnswers[index] || "Not answered"}</div>
 <div>{question.answer}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300">
 <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
 {/* Header */}
 <header className="text-center mb-16 max-w-3xl mx-auto">
 <motion.h1
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight"
 >
 Create Your <span className="bg-[#95ff00] text-black px-4 py-1 rounded-2xl inline-block mt-2 md:mt-0">Quiz</span>
 </motion.h1>
 <motion.p
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="text-lg text-slate-600 font-medium"
 >
 Turn any video or document into a personalized learning assessment in seconds.
 </motion.p>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Left Column: Source Selection & Form */}
 <div className="lg:col-span-7 space-y-8">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.2 }}
 >
 {/* Toggle Switch */}
 <div className="bg-slate-200/50 p-2 rounded-full flex gap-2 w-fit mx-auto lg:mx-0 shadow-sm border border-slate-200 mb-8">
 <button
 type="button"
 onClick={() => handleModeChange('youtube')}
 className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
 selectedMode === 'youtube'
 ? "bg-white text-slate-900 shadow-sm"
 : "text-slate-500 hover:bg-slate-200"
 }`}
 >
 <span className="material-symbols-outlined font-variation-settings-fill-0">play_circle</span>
 YouTube Video
 </button>
 <button
 type="button"
 onClick={() => handleModeChange('document')}
 className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
 selectedMode === 'document'
 ? "bg-white text-slate-900 shadow-sm"
 : "text-slate-500 hover:bg-slate-200"
 }`}
 >
 <span className="material-symbols-outlined font-variation-settings-fill-0">description</span>
 PDF / PPT
 </button>
 </div>

 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6 p-4 rounded-2xl bg-red-100 border border-red-200 text-red-600 text-sm font-medium"
 >
 {error}
 </motion.div>
 )}

 {/* Main Input Card */}
 <div className="bg-white backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_24px_48px_rgba(26,28,31,0.06)] border border-slate-100 ">
 <AnimatePresence mode="wait">
 {!selectedMode && (
 <motion.div
 key="placeholder"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.25 }}
 className="flex items-center justify-center min-h-[300px]"
 >
 <p className="text-slate-500 text-center font-medium">
 Select an option above to load the generation form
 </p>
 </motion.div>
 )}

 {selectedMode === 'youtube' && (
 <motion.form
 key="youtube-form"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.25, ease: "easeInOut" }}
 onSubmit={handleSubmit}
 className="space-y-6"
 >
 {/* YouTube Video Link */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">YouTube Video Link</label>
 <div className="relative group">
 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
 <span className="material-symbols-outlined text-slate-400">link</span>
 </div>
 <input
 type="url"
 value={youtubeLink}
 onChange={(e) => setYoutubeLink(e.target.value)}
 placeholder="Paste your video URL here..."
 className="w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#95ff00] transition-all"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Number of Questions */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Number of Questions</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
 <span className="material-symbols-outlined text-slate-400">format_list_numbered</span>
 </div>
 <input
 type="number"
 min="1"
 max="20"
 value={questionCount}
 onChange={(e) => setQuestionCount(Number(e.target.value))}
 className="w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-slate-900 focus:ring-2 focus:ring-[#95ff00] transition-all"
 />
 </div>
 </div>

 {/* Difficulty Level */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Difficulty Level</label>
 <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                              <span className="material-symbols-outlined text-slate-400">signal_cellular_alt</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className={`w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-left flex items-center justify-between transition-all relative z-0 ${isDropdownOpen ? 'ring-2 ring-[#95ff00]' : ''}`}
                            >
                              <span className={selectedDifficulty ? "text-slate-900 capitalize" : "text-slate-400"}>
                                {selectedDifficulty || "Select"}
                              </span>
                              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </button>
                            
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20"
                                >
                                  {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => {
                                        setSelectedDifficulty(level);
                                        setIsDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors capitalize ${selectedDifficulty === level ? 'bg-slate-50 text-[#95ff00] font-bold' : 'text-slate-700'}`}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
 </div>
 </div>

 {/* Select Model */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Select Model</label>
 <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                              <span className="material-symbols-outlined text-slate-400">smart_toy</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                              className={`w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-left flex items-center justify-between transition-all relative z-0 ${isModelDropdownOpen ? 'ring-2 ring-[#95ff00]' : ''}`}
                            >
                              <span className={selectedModel ? "text-slate-900" : "text-slate-400"}>
                                {selectedModel || "Select Model"}
                              </span>
                              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </button>
                            
                            <AnimatePresence>
                              {isModelDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20"
                                >
                                  {['chatgroq', 'gemini'].map((model) => (
                                    <button
                                      key={model}
                                      type="button"
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setIsModelDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors ${selectedModel === model ? 'bg-slate-50 text-[#95ff00] font-bold' : 'text-slate-700'}`}
                                    >
                                      {model}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-[#95ff00] text-black py-6 rounded-full font-extrabold text-xl shadow-lg shadow-[#95ff00]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <div className="animate-spin rounded-full h-6 w-6 border-2 border-black/20 border-t-black"></div>
 ) : (
 <span className="material-symbols-outlined font-bold">bolt</span>
 )}
 {loading ? "Generating..." : "Generate Quiz"}
 </button>
 </motion.form>
 )}

 {selectedMode === 'document' && (
 <motion.form
 key="document-form"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.25, ease: "easeInOut" }}
 onSubmit={handleSubmit}
 className="space-y-6"
 >
 <div className="space-y-6">
 {/* Upload Document */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Upload Document</label>
 <div
 onDrop={handleDrop}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onClick={() => document.getElementById('file-upload').click()}
 className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
 isDragging 
 ? 'border-[#95ff00] bg-[#95ff00]/5' 
 : 'border-slate-300 bg-slate-50 hover:border-[#95ff00]'
 }`}
 >
 <input
 id="file-upload"
 type="file"
 multiple
 accept=".pdf,.ppt,.pptx,.doc,.docx"
 className="hidden"
 onChange={(e) => handleFileUpload(e.target.files)}
 />
 <div className="flex flex-col items-center gap-4">
 <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 ">
 <span className="material-symbols-outlined text-3xl">upload_file</span>
 </div>
 <p className="text-slate-600 font-medium">Drag & drop PDFs or PPTs here, or <span className="text-primary font-bold">click to browse</span></p>
 </div>
 </div>

 {uploadedFiles.length > 0 && (
 <div className="mt-4 space-y-2">
 {uploadedFiles.map((file, index) => (
 <div key={index} className="flex items-center justify-between bg-slate-100 rounded-xl p-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-[#95ff00]/20 flex items-center justify-center text-primary">
 {uploadingDocument ? (
 <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
 ) : (
 <span className="material-symbols-outlined">description</span>
 )}
 </div>
 <div>
 <p className="text-sm font-bold text-slate-900 ">{file.name}</p>
 <p className="text-xs text-slate-500">{uploadingDocument ? "Uploading..." : "Ready"}</p>
 </div>
 </div>
 <button type="button" onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 p-2">
 <span className="material-symbols-outlined">close</span>
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Questions */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Number of Questions</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
 <span className="material-symbols-outlined text-slate-400">format_list_numbered</span>
 </div>
 <input
 type="number"
 min="1"
 max="20"
 value={questionCount}
 onChange={(e) => setQuestionCount(Number(e.target.value))}
 className="w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-slate-900 focus:ring-2 focus:ring-[#95ff00] transition-all"
 />
 </div>
 </div>

 {/* Difficulty */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Difficulty Level</label>
 <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                              <span className="material-symbols-outlined text-slate-400">signal_cellular_alt</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className={`w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-left flex items-center justify-between transition-all relative z-0 ${isDropdownOpen ? 'ring-2 ring-[#95ff00]' : ''}`}
                            >
                              <span className={selectedDifficulty ? "text-slate-900 capitalize" : "text-slate-400"}>
                                {selectedDifficulty || "Select"}
                              </span>
                              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </button>
                            
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20"
                                >
                                  {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => {
                                        setSelectedDifficulty(level);
                                        setIsDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors capitalize ${selectedDifficulty === level ? 'bg-slate-50 text-[#95ff00] font-bold' : 'text-slate-700'}`}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
 </div>
 </div>

 {/* Model */}
 <div>
 <label className="block text-slate-700 text-sm font-bold mb-3">Select Model</label>
 <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                              <span className="material-symbols-outlined text-slate-400">smart_toy</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                              className={`w-full bg-slate-100 border-none rounded-full py-5 pl-14 pr-6 text-left flex items-center justify-between transition-all relative z-0 ${isModelDropdownOpen ? 'ring-2 ring-[#95ff00]' : ''}`}
                            >
                              <span className={selectedModel ? "text-slate-900" : "text-slate-400"}>
                                {selectedModel || "Select Model"}
                              </span>
                              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </button>
                            
                            <AnimatePresence>
                              {isModelDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20"
                                >
                                  {['chatgroq', 'gemini'].map((model) => (
                                    <button
                                      key={model}
                                      type="button"
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setIsModelDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors ${selectedModel === model ? 'bg-slate-50 text-[#95ff00] font-bold' : 'text-slate-700'}`}
                                    >
                                      {model}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
 </div>

 <button
 type="submit"
 disabled={loading || uploadingDocument}
 className="w-full bg-[#95ff00] text-black py-6 rounded-full font-extrabold text-xl shadow-lg shadow-[#95ff00]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading || uploadingDocument ? (
 <div className="animate-spin rounded-full h-6 w-6 border-2 border-black/20 border-t-black"></div>
 ) : (
 <span className="material-symbols-outlined font-bold">bolt</span>
 )}
 {loading ? "Generating..." : uploadingDocument ? "Uploading..." : "Generate Quiz"}
 </button>
 </div>
 </motion.form>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 </div>

 {/* Right Column: Recent Quizzes & Join Quiz */}
 <div className="lg:col-span-5 space-y-8 h-full">
 <div className="bg-white/50 p-8 rounded-3xl relative overflow-hidden flex flex-col min-h-[400px] border border-slate-200 ">
 {/* Recent Quizzes directly in the right column */}
 <div className="relative z-10 w-full mb-8">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-10 h-10 rounded-full bg-[#95ff00]/20 flex items-center justify-center">
 <span className="material-symbols-outlined text-[#546100]">history</span>
 </div>
 <span className="font-bold text-slate-900 text-xl">Recent Quizzes</span>
 </div>
 <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
 {loadingRecentQuizzes ? (
 <div className="flex justify-center p-4">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#95ff00]"></div>
 </div>
 ) : recentQuizzes.length > 0 ? (
 recentQuizzes.map((quiz, i) => (
 <div key={i} onClick={() => handleRecentQuizSelect(quiz)} className="text-sm text-slate-600 flex justify-between items-center py-3 border-b border-slate-100 last:border-0 cursor-pointer hover:text-slate-900 transition-colors group bg-white px-4 rounded-xl mb-2 shadow-sm border">
 <span className="truncate font-medium flex-1 pr-4">{quiz.topic || "Untitled Quiz"}</span>
 <div className="flex flex-col items-end gap-1 shrink-0">
 <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded inline-block whitespace-nowrap">
 {new Date(quiz.date).toLocaleDateString()}
 </span>
 <span className="text-xs text-[#546100] opacity-0 group-hover:opacity-100 transition-opacity font-bold">Use Again</span>
 </div>
 </div>
 ))
 ) : (
 <div className="text-sm text-slate-500 text-center py-4 font-medium">No recent quizzes found.</div>
 )}
 </div>
 </div>

 {/* Join Quiz Section */}
 <div className="mt-auto relative z-10 w-full pt-8 border-t border-slate-200">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
 <span className="material-symbols-outlined text-slate-700">group_add</span>
 </div>
 <h2 className="text-xl font-bold text-slate-900">Join a Quiz</h2>
 </div>
 <QuizJoinSection />
 </div>

 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#95ff00]/20 rounded-full blur-3xl pointer-events-none"></div>
 </div>
 </div>
 </div>
 </main>
 <Footer />
 </div>
 );
};

const QuizJoinSection = () => {
 const [joinCode, setJoinCode] = useState("");
 const [error, setError] = useState("");
 const [isVerifying, setIsVerifying] = useState(false);
 const [showNameDialog, setShowNameDialog] = useState(false);
 const navigate = useNavigate();
 const userInfo = JSON.parse(localStorage.getItem("user-info"));

 useEffect(() => {
 // Check if socket is connected
 if (!socket.connected) {
 try {
 socket.connect();
 } catch (error) {
 console.error("Socket connection failed:", error);
 setError("Connection to server failed. Please try again.");
 setIsVerifying(false);
 }
 }

 // Listen for room verification response
 socket.on("room_verified", ({ exists }) => {
 setIsVerifying(false);
 if (exists) {
 setShowNameDialog(true); // Show name dialog instead of navigating directly
 } else {
 setError("Invalid quiz code or quiz has expired");
 }
 });

 // Add connection error handler
 socket.on("connect_error", (error) => {
 console.error("Socket connection error:", error);
 setError("Connection to server failed. Please try again.");
 setIsVerifying(false);
 });

 socket.on("error", (error) => {
 setIsVerifying(false);
 setError(error.message || "Failed to join quiz");
 });

 return () => {
 socket.off("room_verified");
 socket.off("connect_error");
 socket.off("error");
 };
 }, [joinCode, navigate]);

 const handleJoinQuiz = async () => {
 try {
 if (!joinCode.trim()) {
 setError("Please enter a quiz code");
 return;
 }

 if (!userInfo?._id) {
 setError("Please login to join the quiz");
 return;
 }

 // Check socket connection before proceeding
 if (!socket.connected) {
 setError("Not connected to server. Please refresh the page.");
 return;
 }

 setError("");
 setIsVerifying(true);

 // Emit verify_room event
 socket.emit("verify_room", {
 roomId: joinCode,
 userId: userInfo._id,
 role: "student",
 });
 } catch (error) {
 setIsVerifying(false);
 setError("Failed to join quiz");
 console.error("Quiz join error:", error);
 }
 };

 const handleNameSubmit = (studentName) => {
 // Store name in localStorage for persistence during quiz
 localStorage.setItem("quiz-student-name", studentName);
 // Navigate to lobby with the name
 navigate(`/student-lobby/${joinCode}`);
 };

 return (
  <div className="space-y-4">
  <div className="relative">
  <input
  type="text"
  placeholder="Enter Quiz Code"
  value={joinCode}
  onChange={(e) => setJoinCode(e.target.value)}
  className="w-full bg-slate-100 border-none rounded-full py-5 px-6 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#95ff00] transition-all"
  disabled={isVerifying}
  />
  </div>
  
  {error && (
  <p className="text-red-500 font-medium text-sm px-2">
  {error}
  </p>
  )}
  
  <motion.button
  onClick={handleJoinQuiz}
  className="w-full bg-[#95ff00] text-black py-5 rounded-full font-extrabold text-lg shadow-lg shadow-[#95ff00]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
  disabled={isVerifying}
  whileHover={{
  scale: 1.02,
  }}
 whileTap={{ scale: 0.98 }}
 transition={{ duration: 0.2 }}
 >
 <motion.div
 className="absolute inset-0 bg-white/20"
 initial={{ scale: 0 }}
 whileHover={{ scale: 1 }}
 transition={{ duration: 0.3 }}
 />
 {isVerifying ? (
 <div className="flex items-center justify-center gap-2 relative z-10">
 <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black"></div>
 Verifying...
 </div>
 ) : (
 <span className="relative z-10">Join Quiz</span>
 )}
 </motion.button>
 
 <NameInputModal
 open={showNameDialog}
 onSubmit={handleNameSubmit}
 onClose={() => setShowNameDialog(false)}
 />
 </div>
 );
};

export default QuizGenerator;