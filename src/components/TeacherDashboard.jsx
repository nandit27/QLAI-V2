import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import socket from '../utils/socket.js';
import { doubtService, quizRecordService } from '../services/api';

import { Button } from "../components/ui/Button";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [newDoubts, setNewDoubts] = useState([]);
  const [solvedDoubts, setSolvedDoubts] = useState([]);
  const [quizRecords, setQuizRecords] = useState([]);
  const [loadingQuizRecords, setLoadingQuizRecords] = useState(false);
  const [draftQuizzes, setDraftQuizzes] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [sharingDraftId, setSharingDraftId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, recordId: null, isDraft: false });
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  // TODO: API - Fetch total quizzes count
  const totalQuizzes = 42;
  
  // TODO: API - Fetch total students helped count
  const totalStudentsHelped = 1204;
  
  // TODO: API - Fetch question bank count
  const questionBankCount = 850;

  useEffect(() => {
    // Fetch teacher's doubts on mount
    const fetchDoubts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/doubt/teacher/${userInfo._id}/doubts`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        
        const doubts = response.data;
        setNewDoubts(doubts.filter(d => d.status !== 'resolved'));
        setSolvedDoubts(doubts.filter(d => d.status === 'resolved'));
      } catch (error) {
        console.error('Error fetching doubts:', error);
      }
    };

    // Fetch teacher's quiz records
    const fetchQuizRecords = async () => {
      try {
        setLoadingQuizRecords(true);
        const response = await quizRecordService.getTeacherQuizRecords(userInfo._id, 1, 5);
        setQuizRecords(response.quizRecords || []);
        setLoadingQuizRecords(false);
      } catch (error) {
        console.error('Error fetching quiz records:', error);
        setLoadingQuizRecords(false);
      }
    };

    // Fetch teacher's saved (draft) quizzes
    const fetchDraftQuizzes = async () => {
      try {
        setLoadingDrafts(true);
        const response = await quizRecordService.getDraftQuizzes(userInfo._id, 1, 10);
        setDraftQuizzes(response.drafts || []);
        setLoadingDrafts(false);
      } catch (error) {
        console.error('Error fetching draft quizzes:', error);
        setLoadingDrafts(false);
      }
    };

    fetchDoubts();
    fetchQuizRecords();
    fetchDraftQuizzes();

    // Listen for new doubts
    socket.on('new_doubt', (doubt) => {
      setNewDoubts(prev => [...prev, doubt]);
      if (Notification.permission === 'granted') {
        new Notification('New Doubt Assigned', {
          body: `New doubt in ${doubt.topics ? doubt.topics.join(' › ') : 'General'}`,
        });
      }
    });

    return () => {
      socket.off('new_doubt');
    };
  }, []);

  const handleJoinChat = (doubtId) => {
    socket.emit('join_chat', {
      doubtId,
      userId: userInfo._id,
      role: 'teacher'
    });
    
    navigate(`/doubt/${doubtId}/chat`);
  };

  const handleDeleteRecord = (e, recordId, isDraft = false) => {
    e.stopPropagation();
    setConfirmModal({ open: true, recordId, isDraft });
  };

  const confirmAndDelete = async () => {
    const { recordId, isDraft } = confirmModal;
    setConfirmModal({ open: false, recordId: null, isDraft: false });
    try {
      setDeletingId(recordId);
      await quizRecordService.deleteQuizRecord(recordId);
      if (isDraft) {
        setDraftQuizzes(prev => prev.filter(d => d._id !== recordId));
      } else {
        setQuizRecords(prev => prev.filter(r => r._id !== recordId));
      }
    } catch (error) {
      console.error('Error deleting quiz record:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleShareDraft = async (recordId) => {
    try {
      setSharingDraftId(recordId);
      const { roomId } = await quizRecordService.shareQuizFromDraft(recordId, userInfo._id);
      // Remove from drafts list and navigate to lobby
      setDraftQuizzes(prev => prev.filter(d => d._id !== recordId));
      navigate(`/quiz-lobby/${roomId}`);
    } catch (error) {
      console.error('Error sharing draft quiz:', error);
    } finally {
      setSharingDraftId(null);
    }
  };

  const handleMarkResolved = async (doubtId) => {
    try {
      await doubtService.markDoubtAsResolved(doubtId);
      
      setNewDoubts(prevDoubts => {
        const resolvedDoubt = prevDoubts.find(d => d._id === doubtId);
        const updatedDoubts = prevDoubts.filter(d => d._id !== doubtId);
        
        if (resolvedDoubt) {
          setSolvedDoubts(prev => [...prev, { ...resolvedDoubt, status: 'resolved' }]);
        }
        
        return updatedDoubts;
      });
    } catch (error) {
      console.error('Error marking doubt as resolved:', error);
    }
  };

  const getStatusColor = (status) => {
    // TODO: API - Map actual status values from backend
    if (status === 'completed') return { bg: 'bg-[#95ff00]/10', text: 'text-[#95ff00]', border: 'border-[#95ff00]/20', dot: 'bg-[#95ff00]' };
    if (status === 'active') return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400 animate-pulse' };
    return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' };
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 70) return { bar: 'bg-[#00FF99]', shadow: 'shadow-[0_0_8px_rgba(0,255,153,0.5)]', text: 'text-[#00FF99]' };
    if (percentage >= 50) return { bar: 'bg-yellow-400', shadow: 'shadow-[0_0_8px_rgba(250,204,21,0.5)]', text: 'text-yellow-400' };
    return { bar: 'bg-red-400', shadow: 'shadow-[0_0_8px_rgba(248,113,113,0.5)]', text: 'text-red-400' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#020403] text-white relative overflow-x-hidden">
      {/* Light Leaks */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,255,153,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,255,153,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>
      <main className="max-w-screen-2xl mx-auto px-8 pt-12 pb-24 relative z-10 mt-20">
        {/* Hero Section */}
        <section className="relative mb-24 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <span className="text-[#00FF99] text-sm font-bold tracking-[0.3em] uppercase mb-4 block">
                Instructor Dashboard
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Namaste, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00FF99] to-[#95ff00]">
                  {userInfo?.username || 'Teacher'}
                </span>
              </h1>
              <div className="flex items-center gap-8 mt-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-bold text-white">
                      {parseFloat(userInfo?.rating || 0).toFixed(1)}
                    </span>
                    <span className="bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30 text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">
                      {userInfo?.rating > 0 ? 'EXPERT' : 'NEW'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
                    Global Score
                  </span>
                </div>
                <div className="h-12 w-[1px] bg-white/10"></div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#00FF99]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#00FF99] font-black text-lg tracking-tight">Expert Level</p>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Instructor Status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="relative w-full md:w-[450px] h-[300px] flex items-center justify-center">
              <motion.div 
                className="absolute glass-panel p-6 rounded-3xl top-0 right-0 border-[#00FF99]/40 hover:border-[#00FF99] transition-all bg-white/5 backdrop-blur-md"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-6 h-6 text-[#00FF99] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-2xl font-bold">{totalQuizzes}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Quizzes</p>
                <span className="text-[10px] text-[#95ff00] mt-2 block">+12% Month</span>
              </motion.div>

              <motion.div 
                className="absolute glass-panel p-6 rounded-3xl bottom-0 left-0 border-[#00FF99]/40 hover:border-[#00FF99] transition-all bg-white/5 backdrop-blur-md"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <svg className="w-6 h-6 text-[#00FF99] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-2xl font-bold">{totalStudentsHelped}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Students Helped</p>
                <span className="text-[10px] text-[#95ff00] mt-2 block">+8% Reach</span>
              </motion.div>

              <motion.div 
                className="absolute glass-panel p-6 rounded-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-white/10 hover:border-[#00FF99] transition-all bg-white/5 backdrop-blur-md"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              >
                <svg className="w-6 h-6 text-[#00FF99] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-2xl font-bold">{questionBankCount}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Question Bank</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* New Doubts Section - Left Column */}
          <div className="lg:col-span-4 relative">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse"></span>
                NEW DOUBTS
              </h2>
              <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60 font-bold">
                {newDoubts.length} PENDING
              </span>
            </div>

            <div className="relative space-y-12 pl-10">
              {/* Timeline Line */}
              <div className="absolute left-5 top-10 bottom-[-20px] w-[1px] bg-gradient-to-b from-[#00FF99] to-transparent opacity-30"></div>

              {newDoubts.length > 0 ? (
                newDoubts.map((doubt, index) => (
                  <div key={doubt._id} className="relative group">
                    <div className="absolute -left-[35px] top-2 w-4 h-4 rounded-full bg-[#020403] border-2 border-[#00FF99] shadow-[0_0_10px_#00FF99] z-10 transition-transform group-hover:scale-125"></div>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-transparent hover:border-[#00FF99]/40 p-6 rounded-3xl transition-all duration-500">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                          {doubt.topics?.join(' • ') || 'General'} • {formatTime(doubt.createdAt)}
                        </span>
                        {index === 0 && (
                          <span className="text-[9px] bg-[#00FF99] text-black px-2 py-0.5 rounded-full font-black">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 leading-relaxed mb-6 font-medium">
                        {doubt.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                            {doubt.studentName?.charAt(0) || 'S'}
                          </div>
                          <span className="text-xs font-bold text-white/60">
                            {doubt.studentName || 'Student'}
                          </span>
                        </div>
                        <Button 
                          onClick={() => handleJoinChat(doubt._id)}
                          className="text-[10px] font-black text-[#00FF99] uppercase tracking-widest hover:brightness-125 transition-all"
                        >
                          Solve Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  <p className="text-sm">No pending doubts at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Records Section - Right Column */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Recent Quiz Records
              </h2>
              <Button className="text-xs text-[#00FF99] font-bold uppercase tracking-widest border-b border-[#00FF99]/30 hover:border-[#00FF99] transition-all pb-1">
                Archive
              </Button>
            </div>

            {loadingQuizRecords ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00FF99]"></div>
                  <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Loading Records</span>
                </div>
              </div>
            ) : quizRecords.length > 0 ? (
              <div className="flex flex-col gap-3">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-4 px-5 pb-2 border-b border-white/5">
                  <span className="col-span-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Quiz</span>
                  <span className="col-span-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Audience</span>
                  <span className="col-span-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Performance</span>
                  <span className="col-span-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</span>
                  <span className="col-span-1 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Act.</span>
                </div>

                {quizRecords.map((record, idx) => {
                  const avgPerformance = Math.floor(Math.random() * 40) + 60;
                  const performanceColors = getPerformanceColor(avgPerformance);
                  const status = record.isActive ? 'active' : 'completed';
                  const statusColors = getStatusColor(status);

                  return (
                    <div
                      key={record._id}
                      className="group grid grid-cols-12 gap-4 items-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-[#00FF99]/25 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200"
                      onClick={() => navigate(`/quiz-record/${record._id}`)}
                    >
                      {/* Quiz Detail */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#00FF99]/10 border border-[#00FF99]/20 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-[#00FF99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            Quiz — {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-white/35 font-semibold mt-0.5">
                            {formatTime(record.createdAt)}
                          </p>
                        </div>
                      </div>
                      {/* Audience */}
                      <div className="col-span-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-white/70">{record.totalStudents}</span>
                        <span className="text-xs text-white/30 hidden xl:inline">students</span>
                      </div>
                      {/* Performance */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${performanceColors.bar}`}
                            style={{ width: `${avgPerformance}%` }}
                          />
                        </div>
                        <span className={`text-sm font-black tabular-nums w-10 text-right ${performanceColors.text}`}>
                          {avgPerformance}%
                        </span>
                      </div>
                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${statusColors.bg} ${statusColors.text} border ${statusColors.border} uppercase tracking-wider`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                          {status}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <Button
                          onClick={(e) => handleDeleteRecord(e, record._id, false)}
                          disabled={deletingId === record._id}
                          className="p-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all duration-200 disabled:opacity-40"
                          title="Delete quiz record"
                          variant="ghost"
                          size="icon">
                          {deletingId === record._id ? (
                            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-white/50 font-semibold text-sm">No quiz records yet</p>
                <p className="text-xs text-white/25 mt-1">Conduct a quiz to see records here</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Saved Quizzes (Drafts) Section ─────────────────────────────── */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]"></span>
              Saved Quizzes
            </h2>
            <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-300 font-black tracking-widest">
              {draftQuizzes.length} DRAFT{draftQuizzes.length !== 1 ? 'S' : ''}
            </span>
          </div>

          {loadingDrafts ? (
            <div className="flex items-center justify-center py-14">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-blue-400"></div>
                <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Loading Drafts</span>
              </div>
            </div>
          ) : draftQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {draftQuizzes.map((draft) => (
                <div
                  key={draft._id}
                  className="group relative bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.07] hover:border-blue-400/30 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-0 overflow-hidden"
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/60 to-transparent rounded-t-2xl" />

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-1 rounded-md font-black uppercase tracking-widest shrink-0">
                      DRAFT
                    </span>
                  </div>

                  {/* Title & meta */}
                  <p className="text-white font-bold text-sm leading-snug mb-1 truncate">
                    {draft.title || 'Untitled Quiz'}
                  </p>
                  <p className="text-[11px] text-white/35 font-medium mb-4">
                    {formatDate(draft.createdAt)} &nbsp;·&nbsp; {formatTime(draft.createdAt)}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-bold text-white/50">{draft.totalQuestions ?? '—'} Questions</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.06] mb-4" />

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      onClick={(e) => handleDeleteRecord(e, draft._id, true)}
                      disabled={deletingId === draft._id}
                      className="p-2.5 rounded-xl border border-red-400/20 hover:border-red-400/50 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 disabled:opacity-40 shrink-0"
                      title="Delete draft"
                      variant="ghost"
                      size="icon">
                      {deletingId === draft._id ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </Button>

                    <Button
                      onClick={() => navigate('/quiz-preview-new', {
                        state: {
                          quizData: { title: draft.title, quiz: draft.quizData },
                          draftId: draft._id
                        }
                      })}
                      className="p-2.5 rounded-xl border border-white/[0.08] hover:border-yellow-400/40 text-white/50 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-200 shrink-0"
                      title="Edit draft"
                      variant="ghost"
                      size="icon">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>

                    <Button
                      onClick={() => handleShareDraft(draft._id)}
                      disabled={sharingDraftId === draft._id}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 hover:border-blue-400/60 text-blue-400 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-60"
                      variant="ghost"
                      size="icon">
                      {sharingDraftId === draft._id ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Starting...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <p className="text-white/50 font-semibold text-sm">No saved quizzes yet</p>
              <p className="text-xs text-white/25 mt-1.5">
                Create a quiz and click <span className="text-blue-400/60 font-semibold">"Save for Later"</span> to prepare it in advance
              </p>
            </div>
          )}
        </div>
      </main>
      {/* Floating Create Quiz Button */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <Link to="/create-quiz">
          <Button
            className="group relative flex items-center gap-4 bg-black border border-[#00FF99]/50 hover:border-[#00FF99] px-8 py-5 rounded-full transition-all duration-300 shadow-[0_0_40px_rgba(0,255,153,0.15)] hover:shadow-[0_0_60px_rgba(0,255,153,0.3)] hover:-translate-y-2"
            variant="ghost"
            size="icon">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00FF99]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-full bg-[#00FF99] flex items-center justify-center text-black relative z-10">
              <svg className="w-6 h-6 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[#00FF99] font-black tracking-[0.15em] uppercase text-sm relative z-10">
              Create New Quiz
            </span>
          </Button>
        </Link>
      </div>
      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#00FF99]/5 to-transparent pointer-events-none z-0"></div>
      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmModal({ open: false, recordId: null, isDraft: false })}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 bg-[#0a0f0a] border border-red-500/30 rounded-3xl p-8 w-full max-w-md mx-4 shadow-[0_0_60px_rgba(239,68,68,0.15)]"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            {/* Text */}
            <h3 className="text-xl font-black text-white text-center mb-2 tracking-tight">
              Delete {confirmModal.isDraft ? 'Draft' : 'Quiz Record'}?
            </h3>
            <p className="text-sm text-white/50 text-center leading-relaxed mb-8">
              Are you sure you want to delete this {confirmModal.isDraft ? 'saved draft' : 'quiz record'}?<br/>
              <span className="text-red-400/80 font-semibold">This action cannot be undone.</span>
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmModal({ open: false, recordId: null, isDraft: false })}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-xs font-black uppercase tracking-widest transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAndDelete}
                className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-500 text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                variant="destructive">
                Yes, Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
