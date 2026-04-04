// src/pages/QuizPlay.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuizDisplay from '../components/QuizDisplay';
import { statisticsService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';

const QuizPlay = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const quizData = state?.quizData;
  const youtubeLink = state?.youtubeLink;
  const selectedModel = state?.selectedModel;
  const quizTitle = state?.title;

  const handleQuizFinish = async (score, timeSpent, userAnswers) => {
    try {
      const userInfo = localStorage.getItem('user-info');
      if (!userInfo) throw new Error('User not authenticated');

      const statisticsData = {
        pasturl: youtubeLink,
        score: score,
        totalscore: quizData.quiz.length,
        topic: quizTitle || 'Unknown Topic',
      };

      await statisticsService.storeStatistics(statisticsData);

      toast({
        title: "Success",
        description: "Quiz results saved successfully",
        variant: "default",
      });

      navigate('/quizsummary', {
        state: {
          quizData,
          summaryData: state?.summaryData,
          youtubeLink,
          selectedModel,
          title: quizTitle
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz results",
        variant: "destructive",
      });
    }
  };

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>No quiz data found. Please go back and try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <QuizDisplay quizData={quizData} onFinish={handleQuizFinish} />
    </div>
  );
};

export default QuizPlay;
