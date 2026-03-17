"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ClipboardList, Calendar, MapPin, Award, Search, Plus, Loader2, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'RESULTS'>('SCHEDULE');
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'DEPT_ADMIN' || user?.role === 'TEACHER';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'SCHEDULE') {
        const res = await api.get('/exams/schedule');
        setExams(res.data);
      } else {
        const res = await api.get('/exams/my-results');
        setResults(res.data);
      }
    } catch (err) {
      console.error('Error fetching exam data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              Examination Portal
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Access official university date sheets and terminal exam results.
            </p>
          </div>
          
          {isAdmin && (
            <button className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              <Plus className="w-5 h-5" />
              Setup New Exam
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit">
          <button 
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all ${
              activeTab === 'SCHEDULE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            DATE SHEET
          </button>
          <button 
            onClick={() => setActiveTab('RESULTS')}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all ${
              activeTab === 'RESULTS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            EXAM RESULTS
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching exam data...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'SCHEDULE' ? (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 gap-6"
              >
                {exams.length === 0 ? (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-800">No Exams Scheduled</h3>
                    <p className="text-slate-500 font-medium">Official date sheets will appear here once announced.</p>
                  </div>
                ) : (
                  exams.map((exam, idx) => (
                    <motion.div 
                      key={exam.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group"
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           <span className="text-xs font-black uppercase tracking-widest opacity-60">
                             {new Date(exam.date).toLocaleString('default', { month: 'short' })}
                           </span>
                           <span className="text-2xl font-black tracking-tighter">
                             {new Date(exam.date).getDate()}
                           </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-800 leading-tight uppercase tracking-tight">{exam.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              {exam.course?.name} ({exam.course?.code})
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              {exam.location || 'Terminal Exam Hall - I'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                         <div className="text-right">
                            <div className="text-sm font-black text-slate-800">
                              {new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Start Time</div>
                         </div>
                         <button className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">
                            Admit Card
                         </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {results.length === 0 ? (
                  <div className="col-span-full bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                    <Award className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-800">No Results Found</h3>
                    <p className="text-slate-500 font-medium">Academic results are released after moderation.</p>
                  </div>
                ) : (
                  results.map((result, idx) => (
                    <motion.div 
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                           <Award className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 leading-tight uppercase tracking-tight">{result.exam?.title}</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{result.exam?.course?.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-4xl font-black text-blue-600 tracking-tighter">{result.score}%</div>
                        <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1">Grade: {result.grade || 'A'}</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}
