import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Copy, Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../utils/socket';

import { Button } from "../components/ui/Button";

const QuizLobby = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [students, setStudents] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!userInfo || !roomId || hasJoined.current) return;

    const role = userInfo.role;
    setIsTeacher(role === 'teacher');

    // Join quiz room
    socket.emit('join_quiz_room', {
      roomId,
      userId: userInfo._id,
      role,
    });
    
    hasJoined.current = true;

    // Listen for room updates
    socket.on('room_update', ({ students, teacher }) => {
      setStudents(students);
    });

    // Listen for quiz start
    socket.on('quiz_questions', (questions) => {
      navigate(`/quiz-session/${roomId}`, { state: { questions } });
    });

    // Listen for quiz cancellation
    socket.on('quiz_cancelled', (data) => {
      toast({
        title: "Quiz Cancelled",
        description: "The teacher has cancelled the quiz.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    });

    return () => {
      socket.off('room_update');
      socket.off('quiz_questions');
      socket.off('quiz_cancelled');
      hasJoined.current = false;
    };
  }, [roomId, userInfo?._id]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      toast({
        title: "Code Copied!",
        description: "Quiz code has been copied to clipboard",
        variant: "default",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStartQuiz = () => {
    if (!roomId) return;
    
    // Emit start_quiz event with room ID and teacher ID
    socket.emit('start_quiz', { 
      roomId,
      teacherId: userInfo._id 
    });
  };

  const handleCancelQuiz = () => {
    if (!roomId || !isTeacher) return;
    
    if (window.confirm('Are you sure you want to cancel the quiz? All students will be notified.')) {
      socket.emit('cancel_quiz', {
        roomId,
        teacherId: userInfo._id
      });
      
      toast({
        title: "Quiz Cancelled",
        description: "The quiz has been cancelled and students have been notified.",
        variant: "default",
      });
      
      // Navigate back to dashboard or home
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* Unique Code Display */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8 mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-400">UNIQUE CODE</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-bold text-[#95ff00] tracking-wider">
                {roomId}
              </span>
              <Button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isCopied 
                    ? 'bg-[#95ff00]/20 text-[#95ff00]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                variant="ghost"
                size="icon">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Students List */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#95ff00]" />
              <h2 className="text-xl font-semibold">STUDENTS JOINED</h2>
            </div>
            <span className="px-4 py-1 bg-[#95ff00]/10 text-[#95ff00] rounded-full text-sm">
              {students.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400">SNO</th>
                  <th className="text-left py-3 px-4 text-gray-400">STUDENT NAME</th>
                  <th className="text-left py-3 px-4 text-gray-400">
                    MARKS
                    <span className="text-sm ml-2 text-gray-500">(initial = 0 all)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="border-b border-white/5">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">0</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      Waiting for students to join...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Start Quiz Button */}
        {isTeacher && (
          <div className="space-y-4">
            <Button
              onClick={handleStartQuiz}
              disabled={students.length === 0}
              className="w-full bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20 h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START QUIZ
            </Button>
            <Button
              onClick={handleCancelQuiz}
              variant="outline"
              className="w-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 h-12 text-lg"
            >
              CANCEL QUIZ
            </Button>
          </div>
        )}
        {!isTeacher && (
          <div className="text-center text-gray-400 p-6 bg-black/20 rounded-lg border border-white/5">
            <p className="text-lg">Waiting for teacher to start the quiz...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizLobby; 