import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Youtube, Upload, FileText, X } from 'lucide-react';
import DottedBackground from '../components/DottedBackground';
import { BorderTrailCard } from '../components/core/BorderTrailCard';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quizRoomService, teacherYTQuizService, documentBloomQuizService } from '../services/api';

import { Button } from "../components/ui/button";

// Predefined topics for suggestions
const AVAILABLE_TOPICS = [
  'JavaScript Event Loop',
  'JavaScript Closures',
  'LLMs',
  'Finite Automata',
  'Neural Networks',
  'Biology',
  'Computer Science',
  'History',
  'Geography',
  'Literature',
  'Economics',
  'Psychology'
];

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("llm");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const topicInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState(null);
  
  // Mode toggle and custom breakdown states
  const [quizMode, setQuizMode] = useState('auto'); // 'auto' or 'custom'
  const [customBreakdown, setCustomBreakdown] = useState({
    easy: 2,
    medium: 2,
    hard: 1
  });
  
  // Document upload states
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedDocumentId, setUploadedDocumentId] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Filter topics based on input
  const filteredTopics = AVAILABLE_TOPICS.filter(
    topic => 
      topic.toLowerCase().includes(topicInput.toLowerCase()) &&
      !selectedTopics.includes(topic)
  );

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        topicInputRef.current &&
        !topicInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTopicInputChange = (e) => {
    setTopicInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleAddTopic = (topic) => {
    if (topic && !selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
      setTopicInput('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setSelectedTopics(selectedTopics.filter(t => t !== topicToRemove));
  };

  const handleTopicInputKeyDown = (e) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault();
      // Add custom topic if it doesn't exist
      const customTopic = topicInput.trim();
      if (!selectedTopics.includes(customTopic)) {
        setSelectedTopics([...selectedTopics, customTopic]);
        setTopicInput('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      // Close suggestions on Escape
      setShowSuggestions(false);
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty.toLowerCase());
    setIsDropdownOpen(false);
  };

  const handleCustomBreakdownChange = (level, value) => {
    const numValue = parseInt(value) || 0;
    setCustomBreakdown(prev => ({
      ...prev,
      [level]: numValue
    }));
  };

  // Calculate total questions from custom breakdown
  useEffect(() => {
    if (quizMode === 'custom') {
      const total = customBreakdown.easy + customBreakdown.medium + customBreakdown.hard;
      setNumQuestions(total);
    }
  }, [customBreakdown, quizMode]);

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
      
      const uploadResult = await documentBloomQuizService.uploadDocument(validFiles[0]);
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

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'youtube') {
      if (!youtubeUrl) {
        setError('Please enter a YouTube URL');
        return;
      }

      if (!validateYoutubeUrl(youtubeUrl)) {
        setError('Please enter a valid YouTube URL');
        return;
      }
    } else if (activeTab === 'document') {
      if (uploadedFiles.length === 0) {
        setError('Please upload a document');
        return;
      }
      if (!uploadedDocumentId) {
        setError('Document is still uploading. Please wait.');
        return;
      }
    } else {
      if (selectedTopics.length === 0) {
        setError('Please select at least one topic');
        return;
      }
    }

    if (quizMode === 'auto' && !selectedDifficulty) {
      setError('Please select a difficulty level');
      return;
    }

    if (quizMode === 'custom') {
      const total = customBreakdown.easy + customBreakdown.medium + customBreakdown.hard;
      if (total === 0) {
        setError('Please specify at least one question in custom breakdown');
        return;
      }
    }

    if (numQuestions < 1 || numQuestions > 20) {
      setError('Number of questions must be between 1 and 20');
      return;
    }

    setLoading(true);

    try {
      let quizData;
      if (activeTab === 'llm') {
        // Join topics with commas for the prompt
        const topicsString = selectedTopics.join(', ');
        
        if (quizMode === 'custom') {
          // TODO: Backend needs to support custom breakdown
          // For now, we'll pass the breakdown in the API call
          quizData = await quizRoomService.createQuiz(
            topicsString,
            numQuestions,
            'mixed', // Use 'mixed' difficulty for custom mode
            customBreakdown // Pass custom breakdown as 4th parameter
          );
        } else {
          quizData = await quizRoomService.createQuiz(
            topicsString,
            numQuestions,
            selectedDifficulty
          );
        }
        console.log(quizData);
        navigate('/quiz-preview', { state: { quiz: quizData } });
      } else if (activeTab === 'youtube') {
        console.log('Generating YouTube quiz:', youtubeUrl, numQuestions, selectedDifficulty);
        
        if (quizMode === 'custom') {
          // TODO: Backend needs to support custom breakdown for YouTube
          const response = await teacherYTQuizService.generateQuiz(
            youtubeUrl,
            numQuestions,
            'mixed', // Use 'mixed' difficulty for custom mode
            customBreakdown
          );
          
          if (!response || !response.bloom_quiz) {
            throw new Error('Invalid quiz data format');
          }
          console.log('YouTube quiz response:', response);
          
          // Transform data to match QuizPreviewNew expectations
          const transformedData = {
            quiz: response.bloom_quiz.questions,
            summary: response.summary,
            title: response.summary?.main_topic || 'YouTube Quiz'
          };
          
          navigate('/quiz-preview-new', { state: { quizData: transformedData } });
        } else {
          const response = await teacherYTQuizService.generateQuiz(
            youtubeUrl,
            numQuestions,
            selectedDifficulty
          );

          if (!response || !response.bloom_quiz) {
            throw new Error('Invalid quiz data format');
          }
          console.log('YouTube quiz response:', response);
          
          // Transform data to match QuizPreviewNew expectations
          const transformedData = {
            quiz: response.bloom_quiz.questions,
            summary: response.summary,
            title: response.summary?.main_topic || 'YouTube Quiz'
          };
          
          navigate('/quiz-preview-new', { state: { quizData: transformedData } });
        }
      } else if (activeTab === 'document') {
        toast({
          title: "Generating quiz...",
          description: "Creating questions from your document.",
        });

        if (quizMode === 'custom') {
          // TODO: Backend needs to support custom breakdown for Document
          const response = await documentBloomQuizService.generateQuizFromDocument(
            uploadedDocumentId,
            numQuestions,
            'mixed', // Use 'mixed' difficulty for custom mode
            customBreakdown
          );
          
          if (!response || !response.bloom_quiz) {
            throw new Error('Invalid quiz data format');
          }

          console.log('Document quiz response:', response);
          
          // Transform data to match QuizPreviewNew expectations
          const transformedData = {
            quiz: response.bloom_quiz.questions,
            summary: response.summary,
            title: response.summary?.main_topic || 'Document Quiz'
          };
          
          navigate('/quiz-preview-new', { state: { quizData: transformedData } });
        } else {
          const response = await documentBloomQuizService.generateQuizFromDocument(
            uploadedDocumentId,
            numQuestions,
            selectedDifficulty
          );
        
          if (!response || !response.bloom_quiz) {
            throw new Error('Invalid quiz data format');
          }

          console.log('Document quiz response:', response);
          
          // Transform data to match QuizPreviewNew expectations
          const transformedData = {
            quiz: response.bloom_quiz.questions,
            summary: response.summary,
            title: response.summary?.main_topic || response.document_info?.filename || 'Document Quiz'
          };
          
          navigate('/quiz-preview-new', { state: { quizData: transformedData } });
        }
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Define generateButton first since it's used in both tabs
  const generateButton = (
    <Button 
      onClick={handleGenerateQuiz}
      disabled={loading}
      className="w-full bg-transparent border-2 border-[#95ff00] text-[#95ff00] hover:bg-[#0C3D2A] hover:border-[#95ff00] hover:shadow-lg hover:shadow-[#95ff00]/30 h-14 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#95ff00]/20 border-t-[#95ff00]"></div>
          Generating Quiz...
        </>
      ) : (
        'Generate Quiz'
      )}
    </Button>
  );

  const llmTabContent = (
    <TabsContent value="llm" className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
        {/* Left Column - Topic Input (Takes more space) */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 flex-1 hover:border-[#95ff00]/50 transition-all duration-300">
            <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
              Topic Description
            </label>
            <div className="relative mb-6">
              <div className="relative w-full bg-[#000805] border-[#00784A] border-2 rounded-xl hover:border-[#95ff00] focus-within:border-[#95ff00] transition-all duration-300">
                <input
                  ref={topicInputRef}
                  type="text"
                  value={topicInput}
                  onChange={handleTopicInputChange}
                  onKeyDown={handleTopicInputKeyDown}
                  placeholder="Type to search or add topics..."
                  className="w-full h-14 px-5 py-4 bg-transparent outline-none text-white placeholder:text-gray-500 relative z-10 text-base"
                />
              </div>
              
              {showSuggestions && topicInput.trim() && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-20 w-full mt-2 bg-[#000805] border-2 border-[#00784A] rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                >
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic, index) => (
                      <Button
                        key={index}
                        type="button"
                        onClick={() => handleAddTopic(topic)}
                        className="w-full px-5 py-3.5 text-left text-white hover:bg-[#0C3D2A] hover:text-[#95ff00] transition-all duration-200 flex items-center gap-3 text-base"
                        variant="ghost"
                        size="icon">
                        <span className="text-[#95ff00] text-lg">+</span>
                        {topic}
                      </Button>
                    ))
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleAddTopic(topicInput.trim())}
                      className="w-full px-5 py-3.5 text-left text-white hover:bg-[#0C3D2A] hover:text-[#95ff00] transition-all duration-200 flex items-center gap-3 text-base"
                    >
                      <span className="text-[#95ff00] text-lg">+</span>
                      Add "{topicInput.trim()}" as custom topic
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-4">
                {selectedTopics.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-2 bg-[#95ff00]/15 border border-[#95ff00]/60 text-[#95ff00] px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-sm"
                  >
                    <span>{topic}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      className="hover:bg-[#95ff00]/30 rounded-full p-1 transition-colors"
                      variant="ghost"
                      size="icon">
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Press <kbd className="px-2 py-1 bg-[#00784A]/30 rounded text-[#95ff00] font-mono">Enter</kbd> to add custom topics • Click suggestions to add • Click X to remove
            </p>
          </div>
        </div>
        
        {/* Right Column - Quiz Settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {quizMode === 'auto' ? (
            <>
              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                  Number of Questions
                </label>
                <Input 
                  type="number" 
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-lg"
                />
              </div>
              
              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                  Difficulty Level
                </label>
                <div className="relative">
                  <Button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-left text-white flex items-center justify-between hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-lg"
                    variant="ghost"
                    size="icon">
                    <span className={selectedDifficulty ? 'text-white' : 'text-gray-500'}>{selectedDifficulty || 'Select difficulty'}</span>
                    <svg className="w-5 h-5 text-[#95ff00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </Button>
                  
                  {isDropdownOpen && (
                    <div className="absolute left-0 w-full mt-2 bg-[#000805] border-2 border-[#00784A] rounded-xl overflow-hidden z-20 shadow-2xl"
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                        <Button
                          key={difficulty}
                          type="button"
                          onClick={() => handleDifficultySelect(difficulty)}
                          className="w-full px-5 py-4 text-left hover:bg-[#0C3D2A] hover:text-[#95ff00] transition-all duration-300 text-white font-semibold text-base"
                          variant="ghost"
                          size="icon">
                          {difficulty}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <label className="text-sm font-semibold text-[#95ff00] block uppercase tracking-wider">
                    Number of Questions
                  </label>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {customBreakdown.easy + customBreakdown.medium + customBreakdown.hard}
                </div>
              </div>

              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <label className="text-sm font-semibold text-[#95ff00] block uppercase tracking-wider">
                    Custom Breakdown
                  </label>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    MANUAL MODE ACTIVE
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Easy</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="20"
                      value={customBreakdown.easy}
                      onChange={(e) => handleCustomBreakdownChange('easy', e.target.value)}
                      className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Medium</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="20"
                      value={customBreakdown.medium}
                      onChange={(e) => handleCustomBreakdownChange('medium', e.target.value)}
                      className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Hard</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="20"
                      value={customBreakdown.hard}
                      onChange={(e) => handleCustomBreakdownChange('hard', e.target.value)}
                      className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6"
        >
          {error}
        </motion.div>
      )}
      
      <div className="mt-8">
        {generateButton}
      </div>
    </TabsContent>
  );

  const youtubeTabContent = (
    <TabsContent value="youtube" className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
        {/* Left Column - YouTube URL (Takes more space) */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 flex-1 hover:border-[#95ff00]/50 transition-all duration-300">
            <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
              YouTube URL
            </label>
            <div className="relative">
              <Input 
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-base"
              />
            </div>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Paste any YouTube video URL to generate questions from the video content.
            </p>
          </div>
        </div>
        
        {/* Right Column - Quiz Settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {quizMode === 'auto' ? (
            <>
              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                  Number of Questions
                </label>
                <Input 
                  type="number" 
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-lg"
                />
              </div>
              
              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                  Difficulty Level
                </label>
                <div className="relative">
                  <Button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-left text-white flex items-center justify-between hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-lg"
                    variant="ghost"
                    size="icon">
                    <span className={selectedDifficulty ? 'text-white' : 'text-gray-500'}>{selectedDifficulty || 'Select difficulty'}</span>
                    <svg className="w-5 h-5 text-[#95ff00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </Button>
                  
                  {isDropdownOpen && (
                    <div className="absolute left-0 w-full mt-2 bg-[#000805] border-2 border-[#00784A] rounded-xl overflow-hidden z-20 shadow-2xl"
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                        <Button
                          key={difficulty}
                          type="button"
                          onClick={() => handleDifficultySelect(difficulty)}
                          className="w-full px-5 py-4 text-left hover:bg-[#0C3D2A] hover:text-[#95ff00] transition-all duration-300 text-white font-semibold text-base"
                          variant="ghost"
                          size="icon">
                          {difficulty}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <label className="text-sm font-semibold text-[#95ff00] block uppercase tracking-wider">
                    Number of Questions
                  </label>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    TOTAL
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {customBreakdown.easy + customBreakdown.medium + customBreakdown.hard}
                </div>
              </div>

              <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <label className="text-sm font-semibold text-[#95ff00] block uppercase tracking-wider">
                    Custom Breakdown
                  </label>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    MANUAL MODE ACTIVE
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Easy</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="20"
                      value={customBreakdown.easy}
                      onChange={(e) => handleCustomBreakdownChange('easy', e.target.value)}
                      className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Medium</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="20"
                      value={customBreakdown.medium}
                      onChange={(e) => handleCustomBreakdownChange('medium', e.target.value)}
                      className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Hard</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="20"
                      value={customBreakdown.hard}
                      onChange={(e) => handleCustomBreakdownChange('hard', e.target.value)}
                      className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6"
        >
          {error}
        </motion.div>
      )}
      
      <div className="mt-8">
        {generateButton}
      </div>
    </TabsContent>
  );

  return (
    <div className="min-h-screen bg-[#000805] text-white pt-32 pb-20 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-5"
          >
            Create <span className="text-[#95ff00]">Quiz</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Generate professional assessment questions instantly using our advanced AI engine.
          </motion.p>
          
          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <Button
              onClick={() => setQuizMode('auto')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                quizMode === 'auto'
                  ? 'bg-[#95ff00] text-[#000805] shadow-lg shadow-[#95ff00]/30'
                  : 'bg-transparent text-gray-400 hover:text-gray-300'
              }`}
              variant="ghost"
              size="sm">
              Auto Mode
            </Button>
            <Button
              onClick={() => setQuizMode('custom')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                quizMode === 'custom'
                  ? 'bg-[#95ff00] text-[#000805] shadow-lg shadow-[#95ff00]/30'
                  : 'bg-transparent text-gray-400 hover:text-gray-300'
              }`}
              variant="ghost"
              size="sm">
              Custom Mode
            </Button>
          </motion.div>
        </div>

        {/* Main Quiz Creation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BorderTrailCard className="p-1 rounded-3xl mb-16">
            <div className="bg-[#000A06]/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl min-h-[600px] flex flex-col">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 gap-3 bg-transparent mb-8">
                <TabsTrigger 
                  value="llm"
                  className={`py-3.5 px-4 rounded-xl transition-all duration-300 text-base font-medium ${
                    activeTab === "llm" 
                      ? 'bg-[#0C3D2A] text-[#95ff00] border border-[#95ff00] shadow-lg shadow-[#95ff00]/20'
                      : 'bg-[#002014] text-gray-300 hover:bg-[#0C3D2A] hover:text-[#95ff00] border border-[#00784A] hover:border-[#95ff00]'
                  }`}
                >
                  LLM
                </TabsTrigger>
                <TabsTrigger 
                  value="youtube"
                  className={`py-3.5 px-4 rounded-xl transition-all duration-300 text-base font-medium ${
                    activeTab === "youtube" 
                      ? 'bg-[#0C3D2A] text-[#95ff00] border border-[#95ff00] shadow-lg shadow-[#95ff00]/20'
                      : 'bg-[#002014] text-gray-300 hover:bg-[#0C3D2A] hover:text-[#95ff00] border border-[#00784A] hover:border-[#95ff00]'
                  }`}
                >
                  YouTube
                </TabsTrigger>
                <TabsTrigger 
                  value="document"
                  className={`py-3.5 px-4 rounded-xl transition-all duration-300 text-base font-medium ${
                    activeTab === "document" 
                      ? 'bg-[#0C3D2A] text-[#95ff00] border border-[#95ff00] shadow-lg shadow-[#95ff00]/20'
                      : 'bg-[#002014] text-gray-300 hover:bg-[#0C3D2A] hover:text-[#95ff00] border border-[#00784A] hover:border-[#95ff00]'
                  }`}
                >
                  Document
                </TabsTrigger>
              </TabsList>

              <TabsContent value="llm" className="space-y-5">
                {llmTabContent}
              </TabsContent>

              <TabsContent value="youtube" className="space-y-5">
                {youtubeTabContent}
              </TabsContent>

              <TabsContent value="document" className="flex-1 flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
                  {/* Left Column - Document Upload (Takes more space) */}
                  <div className="lg:col-span-3 flex flex-col">
                    <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 flex-1 hover:border-[#95ff00]/50 transition-all duration-300">
                      <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                        Upload Document
                      </label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                          isDragging
                            ? 'border-[#95ff00] bg-[#95ff00]/5'
                            : 'border-[#00784A] hover:border-[#95ff00] bg-[#000805]'
                        }`}
                        onClick={() => document.getElementById('file-upload-input').click()}
                      >
                        <input
                          id="file-upload-input"
                          type="file"
                          multiple
                          accept=".pdf,.ppt,.pptx,.doc,.docx"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <div className="flex flex-col items-center gap-5">
                          <div className="w-20 h-20 rounded-2xl bg-[#95ff00]/10 flex items-center justify-center hover:bg-[#95ff00]/20 transition-all duration-300 border border-[#95ff00]/30">
                            <Upload className="w-10 h-10 text-[#95ff00]" />
                          </div>
                          <div>
                            <p className="text-gray-300 font-semibold mb-2 text-base">
                              Drag & drop your document here
                            </p>
                            <p className="text-gray-500 text-sm">
                              or{" "}
                              <span className="text-[#95ff00] font-semibold">click to browse</span>
                            </p>
                            <p className="text-gray-400 text-xs mt-3">
                              Supports PDF, PPT, PPTX, DOC, DOCX
                            </p>
                          </div>
                        </div>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-5 space-y-3"
                        >
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-[#000805] border-2 border-[#00784A] rounded-xl p-4 hover:border-[#95ff00]/50 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#95ff00]/10 flex items-center justify-center border border-[#95ff00]/30">
                                  {uploadingDocument ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#95ff00]/20 border-t-[#95ff00]"></div>
                                  ) : uploadedDocumentId ? (
                                    <svg
                                      className="w-6 h-6 text-[#95ff00]"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <FileText className="w-6 h-6 text-[#95ff00]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-300">{file.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {uploadingDocument ? "Uploading..." : uploadedDocumentId ? "Ready for quiz generation" : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                disabled={uploadingDocument}
                                variant="ghost"
                                size="icon">
                                <X className="w-5 h-5" />
                              </Button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Column - Quiz Settings */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {quizMode === 'auto' ? (
                      <>
                        <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                          <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                            Number of Questions
                          </label>
                          <Input 
                            type="number" 
                            min="1"
                            max="20"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-lg"
                          />
                        </div>
                        
                        <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                          <label className="text-sm font-semibold text-[#95ff00] mb-4 block uppercase tracking-wider">
                            Difficulty Level
                          </label>
                          <div className="relative">
                            <Button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full bg-[#000805] border-[#00784A] border-2 rounded-xl py-4 px-5 text-left text-white flex items-center justify-between hover:border-[#95ff00] transition-all duration-300 h-14 font-semibold text-lg"
                              variant="ghost"
                              size="icon">
                              <span className={selectedDifficulty ? 'text-white' : 'text-gray-500'}>{selectedDifficulty || 'Select difficulty'}</span>
                              <svg className="w-5 h-5 text-[#95ff00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </Button>
                            
                            {isDropdownOpen && (
                              <div className="absolute left-0 w-full mt-2 bg-[#000805] border-2 border-[#00784A] rounded-xl overflow-hidden z-20 shadow-2xl"
                                onMouseLeave={() => setIsDropdownOpen(false)}
                              >
                                {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                                  <Button
                                    key={difficulty}
                                    type="button"
                                    onClick={() => handleDifficultySelect(difficulty)}
                                    className="w-full px-5 py-4 text-left hover:bg-[#0C3D2A] hover:text-[#95ff00] transition-all duration-300 text-white font-semibold text-base"
                                    variant="ghost"
                                    size="icon">
                                    {difficulty}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-5">
                            <label className="text-sm font-semibold text-[#95ff00] block uppercase tracking-wider">
                              Number of Questions
                            </label>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              TOTAL
                            </span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-1">
                            {customBreakdown.easy + customBreakdown.medium + customBreakdown.hard}
                          </div>
                        </div>

                        <div className="bg-[#051911]/50 border border-[#00784A] rounded-2xl p-6 hover:border-[#95ff00]/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-5">
                            <label className="text-sm font-semibold text-[#95ff00] block uppercase tracking-wider">
                              Custom Breakdown
                            </label>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              MANUAL MODE ACTIVE
                            </span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 font-medium">Easy</span>
                              <Input 
                                type="number" 
                                min="0"
                                max="20"
                                value={customBreakdown.easy}
                                onChange={(e) => handleCustomBreakdownChange('easy', e.target.value)}
                                className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 font-medium">Medium</span>
                              <Input 
                                type="number" 
                                min="0"
                                max="20"
                                value={customBreakdown.medium}
                                onChange={(e) => handleCustomBreakdownChange('medium', e.target.value)}
                                className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 font-medium">Hard</span>
                              <Input 
                                type="number" 
                                min="0"
                                max="20"
                                value={customBreakdown.hard}
                                onChange={(e) => handleCustomBreakdownChange('hard', e.target.value)}
                                className="w-20 bg-[#000805] border-[#00784A] border-2 rounded-lg py-2 px-3 text-white text-center focus:outline-none focus:border-[#95ff00] focus:ring-0 hover:border-[#95ff00] transition-all duration-300 font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="mt-8">
                  {generateButton}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </BorderTrailCard>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateQuiz;

