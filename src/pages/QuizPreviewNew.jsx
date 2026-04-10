import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Save, Edit, ArrowLeft, X, Clock, BookmarkCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../utils/socket';
import { quizRecordService } from '../services/api';

import { Button } from "../components/ui/button";

const QuestionCard = ({ question, index, isEditing, updateQuestion }) => {
  const [editedQuestion, setEditedQuestion] = useState(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleChange = (updated) => {
    setEditedQuestion(updated);
    updateQuestion(updated);
  };

  // Handle both option formats: object {A, B, C, D} and array
  const optionsArray = Array.isArray(editedQuestion.options) 
    ? editedQuestion.options 
    : Object.entries(editedQuestion.options || {}).map(([key, value]) => ({ key, value }));
  
  return (
    <div className="p-6 rounded-lg border border-white/10 bg-black/20 space-y-4">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#95ff00]/10 text-[#95ff00] font-medium">
          {index + 1}
        </span>
        <div className="flex-1 space-y-2">
          {editedQuestion.level && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
              {editedQuestion.level}
            </span>
          )}
          {isEditing ? (
            <input
              className="w-full p-2 bg-black border border-white/10 rounded text-white"
              value={editedQuestion.question}
              onChange={(e) =>
                handleChange({ ...editedQuestion, question: e.target.value })
              }
            />
          ) : (
            <h3 className="text-lg text-white">{editedQuestion.question}</h3>
          )}
          
          {/* Time field */}
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {isEditing ? (
              <input
                type="number"
                min="5"
                max="300"
                className="w-20 p-1 bg-black border border-white/10 rounded text-white text-sm"
                value={editedQuestion.time || 30}
                onChange={(e) =>
                  handleChange({ ...editedQuestion, time: parseInt(e.target.value) || 30 })
                }
              />
            ) : (
              <span className="text-sm text-gray-400">{editedQuestion.time || 30}</span>
            )}
            <span className="text-sm text-gray-400">seconds</span>
          </div>
        </div>
      </div>
      
      <div className="ml-12 space-y-3">
        {optionsArray.map((option, idx) => {
          const optionText = typeof option === 'string' ? option : option.value;
          const optionKey = typeof option === 'string' ? option : option.key;
          // For plain string arrays (e.g. saved drafts), use A/B/C/D as the display label
          const displayLabel = typeof option === 'string' ? String.fromCharCode(65 + idx) : option.key;
          const isCorrect = editedQuestion.answer === optionKey || editedQuestion.answer === optionText;
          
          return (
            <div 
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isCorrect
                  ? 'border-[#95ff00]/30 bg-[#95ff00]/5' 
                  : 'border-white/5 bg-black/20'
              }`}
            >
              {isCorrect && (
                <Check className="w-5 h-5 text-[#95ff00]" />
              )}
              <span className="font-mono font-bold text-gray-400 shrink-0">
                {displayLabel}.
              </span>
              {isEditing ? (
                <input
                  className="w-full p-2 bg-transparent border-b rounded-lg border-gray-700 text-white"
                  value={optionText}
                  onChange={(e) => {
                    if (Array.isArray(editedQuestion.options)) {
                      const newOptions = [...editedQuestion.options];
                      newOptions[idx] = e.target.value;
                      handleChange({ ...editedQuestion, options: newOptions });
                    } else {
                      const newOptions = { ...editedQuestion.options };
                      newOptions[optionKey] = e.target.value;
                      handleChange({ ...editedQuestion, options: newOptions });
                    }
                  }}
                />
              ) : (
                <span className={
                  isCorrect 
                    ? 'text-[#95ff00]' 
                    : 'text-gray-300'
                }>
                  {optionText}
                </span>
              )}
            </div>
          );
        })}
        
        {isEditing && (
          <select
            className="mt-2 p-2 bg-black border border-white/20 text-white w-full rounded-lg"
            value={editedQuestion.answer}
            onChange={(e) =>
              handleChange({ ...editedQuestion, answer: e.target.value })
            }
          >
            <option value="">Select Correct Answer</option>
            {optionsArray.map((opt, idx) => {
              const optionKey = typeof opt === 'string' ? opt : opt.key;
              const optionText = typeof opt === 'string' ? opt : opt.value;
              return (
                <option key={idx} value={optionKey}>
                  {optionKey}: {optionText}
                </option>
              );
            })}
          </select>
        )}
      </div>
    </div>
  );
};

const QuizPreviewNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state?.quizData;
  // draftId is set when teacher clicks "Edit" on an existing draft from the dashboard
  const existingDraftId = location.state?.draftId || null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [quizState, setQuizState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [storageKey, setStorageKey] = useState('');

  // Initialize storage key and state
  useEffect(() => {
    if (quizData) {
      // Create a unique key for this quiz session
      const newKey = `quiz_editor_state_${quizData.title}_${Date.now()}`;
      setStorageKey(newKey);
      
      // Ensure all questions have a time field (default 30 seconds)
      const quizWithTime = {
        ...quizData,
        quiz: quizData.quiz.map(q => ({
          ...q,
          time: q.time || 30
        }))
      };
      
      // Initialize with fresh quiz data
      setQuizState(quizWithTime);
      localStorage.setItem(newKey, JSON.stringify(quizWithTime));
    }
  }, [quizData]);

  // Save to localStorage whenever quizState changes
  useEffect(() => {
    if (quizState && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(quizState));
    }
  }, [quizState, storageKey]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    };
  }, [storageKey]);

  const handleQuestionUpdate = (idx, updatedQuestion) => {
    setQuizState(prev => {
      const newQuestions = prev.quiz.map((q, i) => i === idx ? updatedQuestion : q);
      return {
        ...prev,
        quiz: newQuestions,
      };
    });
  };

  const handleShareQuiz = async () => {
    if (!quizState) return;
    
    setIsSaving(true);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const teacherId = userInfo?._id;
      
      if (!teacherId) {
        throw new Error('User not authenticated');
      }

      // If editing an existing draft, first save the latest edits then share via API
      if (existingDraftId) {
        await quizRecordService.updateDraftQuiz(
          existingDraftId,
          quizState.quiz,
          quizState.title || 'Untitled Quiz'
        );
        const { roomId } = await quizRecordService.shareQuizFromDraft(existingDraftId, teacherId);
        if (storageKey) localStorage.removeItem(storageKey);
        navigate(`/quiz-lobby/${roomId}`);
        return;
      }
      
      // New quiz: generate room code and store via socket
      const roomId = teacherId.slice(-4) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
      
      // Store quiz data in Redis with Bloom's taxonomy format
      console.log('Storing quiz in Redis:', quizState.quiz);
      socket.emit('store_quiz', {
        roomId,
        quizData: quizState.quiz, // Contains Bloom's taxonomy questions with time
        teacherId
      });

      // Clear the storage after sharing
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      // Navigate to quiz lobby
      navigate(`/quiz-lobby/${roomId}`);
    } catch (error) {
      console.error('Error sharing quiz:', error);
      setIsSaving(false);
    }
  };

  const handleSaveForLater = async () => {
    if (!quizState) return;

    setIsSavingDraft(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const teacherId = userInfo?._id;
      if (!teacherId) throw new Error('User not authenticated');

      if (existingDraftId) {
        // Update the existing draft instead of creating a new one
        await quizRecordService.updateDraftQuiz(
          existingDraftId,
          quizState.quiz,
          quizState.title || 'Untitled Quiz'
        );
      } else {
        await quizRecordService.saveDraftQuiz(
          teacherId,
          quizState.quiz,
          quizState.title || 'Untitled Quiz'
        );
      }

      setDraftSaved(true);
      // Clear the local editor state after saving
      if (storageKey) localStorage.removeItem(storageKey);
      setTimeout(() => navigate('/teacher-dashboard'), 1500);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleBack = () => {
    // Clear the storage when going back
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    if (existingDraftId) {
      navigate('/teacher-dashboard');
    } else {
      navigate(-1);
    }
  };

  const handleResetQuiz = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      // Ensure all questions have a time field when resetting
      const quizWithTime = {
        ...quizData,
        quiz: quizData.quiz.map(q => ({
          ...q,
          time: q.time || 30
        }))
      };
      setQuizState(quizWithTime);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(quizWithTime));
      }
    }
  };

  if (!location.state) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-400">No quiz data found. Please generate a quiz first.</p>
          <Button 
            onClick={() => navigate('/create-quiz')}
            className="text-[#95ff00] hover:underline"
          >
            Return to Quiz Creator
          </Button>
        </div>
      </div>
    );
  }

  if (!quizState) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#95ff00]"></div>
          <p className="text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex flex-col gap-4 mb-8">
          <Button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
            variant="ghost"
            size="icon">
            <ArrowLeft className="w-5 h-5" />
            {existingDraftId ? 'Back to Dashboard' : 'Back to Editor'}
          </Button>

          <div className="flex items-center flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Done Editing' : 'Edit Quiz'}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
              onClick={handleResetQuiz}
            >
              <X className="w-4 h-4" />
              Reset Changes
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              onClick={handleSaveForLater}
              disabled={isSavingDraft || draftSaved}
            >
              {draftSaved ? (
                <><BookmarkCheck className="w-4 h-4" /> {existingDraftId ? 'Updated!' : 'Saved!'}</>
              ) : isSavingDraft ? (
                <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {existingDraftId ? 'Updating...' : 'Saving...'}</>
              ) : (
                <><BookmarkCheck className="w-4 h-4" /> {existingDraftId ? 'Update Draft' : 'Save for Later'}</>
              )}
            </Button>
            <Button 
              className="flex items-center gap-2 bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20"
              onClick={handleShareQuiz}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sharing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Share Quiz
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl font-bold">
              <span className="text-[#95ff00]">{quizState.title}</span> Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {quizState.quiz.map((question, idx) => (
                <QuestionCard 
                  key={idx} 
                  question={question} 
                  index={idx}
                  isEditing={isEditing}
                  updateQuestion={(updated) => handleQuestionUpdate(idx, updated)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPreviewNew; 