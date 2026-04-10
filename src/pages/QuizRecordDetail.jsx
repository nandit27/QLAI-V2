import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Trophy, Calendar, Users, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { quizRecordService } from '../services/api';

const QuizRecordDetail = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [quizRecord, setQuizRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortedStudents, setSortedStudents] = useState([]);

  useEffect(() => {
    const fetchQuizRecord = async () => {
      try {
        setLoading(true);
        const response = await quizRecordService.getQuizRecordById(recordId);
        setQuizRecord(response.quizRecord);
        
        // Process and sort student results
        if (response.quizRecord.results) {
          const scores = response.quizRecord.results.scores || {};
          const studentNames = response.quizRecord.results.studentNames || {};
          
          const sorted = Object.entries(scores)
            .map(([id, scoreData]) => {
              const totalScore = typeof scoreData === 'object' ? scoreData.total : scoreData;
              const bloomScores = typeof scoreData === 'object' ? scoreData : {
                remember: 0,
                understand: 0,
                apply: 0,
                analyze: 0,
                evaluate: 0,
                create: 0,
                total: scoreData
              };
              
              return {
                id,
                name: studentNames[id] || `Student ${id.slice(-4)}`,
                score: totalScore,
                bloomScores: bloomScores
              };
            })
            .sort((a, b) => b.score - a.score);
          
          setSortedStudents(sorted);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz record:', err);
        setError('Failed to load quiz record');
        setLoading(false);
      }
    };

    fetchQuizRecord();
  }, [recordId]);

  const getBadge = (index) => {
    switch(index) {
      case 0: return { emoji: '🏆', color: 'text-yellow-400', label: 'Gold' };
      case 1: return { emoji: '🥈', color: 'text-gray-400', label: 'Silver' };
      case 2: return { emoji: '🥉', color: 'text-orange-400', label: 'Bronze' };
      default: return null;
    }
  };

  const handleExportResults = () => {
    if (!quizRecord) return;

    const csvContent = `Rank,Student ID,Name,Total Score,Remember,Understand,Apply,Analyze,Evaluate,Create,Badge\n${
      sortedStudents
        .map((student, index) => {
          const badge = getBadge(index);
          const bloom = student.bloomScores;
          return `${index + 1},${student.id},${student.name},${student.score},${bloom.remember},${bloom.understand},${bloom.apply},${bloom.analyze},${bloom.evaluate},${bloom.create},${badge ? badge.label : ''}`
        })
        .join('\n')
    }`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${quizRecord.roomId}_${new Date(quizRecord.createdAt).toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#95ff00] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading quiz record...</p>
        </div>
      </div>
    );
  }

  if (error || !quizRecord) {
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error || 'Quiz record not found'}</p>
              <Button
                onClick={() => navigate('/teacher-dashboard')}
                className="bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-6xl mx-auto p-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(quizRecord.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {quizRecord.totalStudents} Students
                </div>
                <div className="flex items-center gap-2">
                  <FileQuestion className="w-4 h-4" />
                  {quizRecord.totalQuestions} Questions
                </div>
              </div>
            </div>
            <Button
              onClick={handleExportResults}
              className="bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          {/* Top 3 Podium */}
          <div className="mb-12 flex justify-center items-end gap-4">
            {sortedStudents.slice(0, 3).map((student, index) => {
              const badge = getBadge(index);
              const podiumHeight = index === 0 ? 'h-32' : index === 1 ? 'h-24' : 'h-20';
              return (
                <motion.div
                  key={student.id}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="text-center mb-2">
                    <div className="text-4xl mb-1">{badge.emoji}</div>
                    <div className={`font-bold ${badge.color}`}>{student.name}</div>
                    <div className="text-sm text-gray-400">{student.score} points</div>
                  </div>
                  <motion.div
                    className={`w-24 ${podiumHeight} rounded-t-lg bg-[#95ff00]/20 border-t-2 border-[#95ff00]`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Full Leaderboard */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Student Name</th>
                  <th className="text-left py-3 px-4">Total Score</th>
                  <th className="text-left py-3 px-4">Remember</th>
                  <th className="text-left py-3 px-4">Understand</th>
                  <th className="text-left py-3 px-4">Apply</th>
                  <th className="text-left py-3 px-4">Analyze</th>
                  <th className="text-left py-3 px-4">Evaluate</th>
                  <th className="text-left py-3 px-4">Create</th>
                  <th className="text-left py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => {
                  const badge = getBadge(index);
                  return (
                    <motion.tr
                      key={student.id}
                      className="border-b border-white/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">#{index + 1}</span>
                          {badge && (
                            <span className={`${badge.color} text-xl`}>
                              {badge.emoji}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">{student.name}</td>
                      <td className="py-4 px-4 font-bold">{student.score}</td>
                      <td className="py-4 px-4 text-center">{student.bloomScores.remember}</td>
                      <td className="py-4 px-4 text-center">{student.bloomScores.understand}</td>
                      <td className="py-4 px-4 text-center">{student.bloomScores.apply}</td>
                      <td className="py-4 px-4 text-center">{student.bloomScores.analyze}</td>
                      <td className="py-4 px-4 text-center">{student.bloomScores.evaluate}</td>
                      <td className="py-4 px-4 text-center">{student.bloomScores.create}</td>
                      <td className="py-4 px-4">
                        <span className={
                          student.score >= 7 ? 'text-green-400' :
                          student.score >= 5 ? 'text-yellow-400' :
                          'text-red-400'
                        }>
                          {student.score >= 7 ? 'Excellent' :
                           student.score >= 5 ? 'Good' :
                           'Needs Improvement'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quiz Questions Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Quiz Questions</h2>
            {quizRecord.quizData && quizRecord.quizData.length > 0 ? (
              <div className="space-y-4">
                {quizRecord.quizData.map((question, index) => {
                  // Handle different quiz formats
                  const questionText = question.question || question.text || question.questionText || '';
                  const options = question.options || question.choices || [];
                  const answer = question.answer || question.correctAnswer || '';
                  const bloomLevel = question.bloomLevel || question.bloom_level || question.difficulty || 'N/A';
                  const points = question.points || 1;

                  return (
                    <Card key={index} className="bg-black/20 border border-white/5 p-6">
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-[#95ff00]">
                            Question {index + 1}
                          </h3>
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                              {bloomLevel}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                              {points} pts
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300">{questionText}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border ${
                              option === answer
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-white/10 bg-black/20 text-gray-400'
                            }`}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            {option}
                            {option === answer && (
                              <span className="ml-2 text-xs">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No quiz questions found.</p>
              </div>
            )}
          </div>

          {/* Back Button */}
          <Button
            onClick={() => navigate('/teacher-dashboard')}
            className="mt-8 flex items-center gap-2 bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QuizRecordDetail;
