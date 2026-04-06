import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Save, Edit, ArrowLeft, X, Clock, BookmarkCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../utils/socket';
import { quizRecordService } from '../services/api';

const QuestionCard = ({ question, index, isEditing, updateQuestion }) => {
  const [editedQuestion, setEditedQuestion] = useState(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleChange = (updated) => {
    setEditedQuestion(updated);
    updateQuestion(updated);
  };

  // Handle both array options and object options {A: "text", B: "text"}
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
          <div className="flex gap-2">
            {editedQuestion.level && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
                {editedQuestion.level}
              </span>
            )}
            {editedQuestion.difficulty && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                editedQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                editedQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {editedQuestion.difficulty}
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              className="w-full p-2 bg-black border border-white/10 rounded text-white"
              value={editedQuestion.question}
              onChange={(e) =>
                handleChange({ ...editedQuestion, question: e.target.value })
              }
            />
          ) : (
            <h3 className="text-lg text-white">{question.question}</h3>
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
          // For plain string arrays, use A/B/C/D as the display label
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
                <span
                  className={
                    isCorrect
                      ? 'text-[#95ff00]'
                      : 'text-gray-300'
                  }
                >
                  {optionText}
                </span>
              )}
            </div>
          );
        })}

        {isEditing && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

const QuizPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz, isNew } = location.state || {};
  
  // Generate a unique storage key based on topic name and timestamp
  const [storageKey, setStorageKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [quizState, setQuizState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Initialize storage key and state
  useEffect(() => {
    if (quiz) {
      // Create a unique key for this quiz session
      const newKey = `quiz_editor_state_${quiz.topic_name}_${Date.now()}`;
      setStorageKey(newKey);
      
      // Clear any previous data for this quiz
      localStorage.removeItem(newKey);
      
      // Ensure all questions have a time field (default 30 seconds)
      const quizWithTime = {
        ...quiz,
        questions: Array.isArray(quiz.questions) 
          ? quiz.questions.map(q => ({ ...q, time: q.time || 30 }))
          : Object.fromEntries(
              Object.entries(quiz.questions).map(([difficulty, qs]) => [
                difficulty,
                qs.map(q => ({ ...q, time: q.time || 30 }))
              ])
            )
      };
      
      // Initialize with fresh quiz data
      setQuizState(quizWithTime);
      localStorage.setItem(newKey, JSON.stringify(quizWithTime));
    }
  }, [quiz]);

  // Save to localStorage whenever quizState changes
  useEffect(() => {
    if (quizState && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(quizState));
    }
  }, [quizState, storageKey]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (storageKey && isNew) {
        localStorage.removeItem(storageKey);
      }
    };
  }, [storageKey, isNew]);

  const handleQuestionUpdate = (idx, updatedQuestion) => {
    setQuizState(prev => {
      const newQuestions = Array.isArray(prev.questions) 
        ? prev.questions.map((q, i) => i === idx ? updatedQuestion : q)
        : prev.questions;

      const updatedQuiz = {
        ...prev,
        questions: newQuestions,
      };

      return updatedQuiz;
    });
  };

  const handleShareQuiz = async () => {
    if (!quizState || !storageKey) return;

    setIsSaving(true);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const teacherId = userInfo?._id;

      if (!teacherId) {
        throw new Error('User not authenticated');
      }

      const roomId = teacherId.slice(-4) + Math.floor(Math.random() * 100).toString().padStart(2, '0');

      socket.emit('store_quiz', {
        roomId,
        quizData: quizState,
        teacherId
      });

      // Clear the storage after sharing
      localStorage.removeItem(storageKey);

      navigate(`/quiz-lobby/${roomId}`, {
        state: { quiz: quizState }
      });
    } catch (error) {
      console.error('Error sharing quiz:', error);
      setIsSaving(false);
    }
  };

  // Flatten questions to an array regardless of format (array vs difficulty-keyed object)
  const flattenQuestions = (questions) => {
    if (!questions) return [];
    if (Array.isArray(questions)) return questions;
    return Object.values(questions).flat();
  };

  const handleSaveForLater = async () => {
    if (!quizState) return;

    setIsSavingDraft(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const teacherId = userInfo?._id;
      if (!teacherId) throw new Error('User not authenticated');

      await quizRecordService.saveDraftQuiz(
        teacherId,
        flattenQuestions(quizState.questions),
        quizState.topic_name || 'Untitled Quiz'
      );

      setDraftSaved(true);
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
    navigate(-1);
  };

  const handleResetQuiz = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      // Ensure all questions have a time field when resetting
      const quizWithTime = {
        ...quiz,
        questions: Array.isArray(quiz.questions) 
          ? quiz.questions.map(q => ({ ...q, time: q.time || 30 }))
          : Object.fromEntries(
              Object.entries(quiz.questions).map(([difficulty, qs]) => [
                difficulty,
                qs.map(q => ({ ...q, time: q.time || 30 }))
              ])
            )
      };
      setQuizState(quizWithTime); // Reset to original quiz data
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(quizWithTime));
      }
    }
  };

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
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Editor
          </button>

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
                <><BookmarkCheck className="w-4 h-4" /> Saved!</>
              ) : isSavingDraft ? (
                <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
              ) : (
                <><BookmarkCheck className="w-4 h-4" /> Save for Later</>
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
              <span className="text-[#95ff00]">{quizState.topic_name}</span> Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {Array.isArray(quizState.questions) ? (
              <div className="space-y-6">
                {quizState.questions.map((question, idx) => (
                  <QuestionCard
                    key={`question-${idx}`}
                    question={question}
                    index={idx}
                    isEditing={isEditing}
                    updateQuestion={(updated) =>
                      handleQuestionUpdate(idx, updated)
                    }
                  />
                ))}
              </div>
            ) : (
              Object.entries(quizState.questions).map(([difficulty, questions]) => (
                <div key={difficulty} className="mb-8 last:mb-0">
                  <h2 className="text-xl font-semibold mb-4 capitalize">
                    {difficulty} Questions
                  </h2>
                  <div className="space-y-6">
                    {questions.map((question, idx) => (
                      <QuestionCard
                        key={`${difficulty}-${idx}`}
                        question={question}
                        index={idx}
                        isEditing={isEditing}
                        updateQuestion={(updated) =>
                          handleQuestionUpdate(idx, updated)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPreview;