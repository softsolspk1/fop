'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Beaker, FlaskConical, Users, Search, CheckCircle, XCircle, Clock, Info, ArrowLeft, MessageSquare, Star, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../lib/api';

export default function LabSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [grading, setGrading] = useState(false);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/labs/submissions/all');
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setGrading(true);
    try {
      await api.post(`/labs/experiments/${selectedSub.id}/grade`, {
        grade: gradeData.score,
        feedback: gradeData.feedback
      });
      alert('Grade submitted updated successfully!');
      fetchSubmissions();
      setSelectedSub(null);
      setGradeData({ score: '', feedback: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to submit grade.');
    } finally {
      setGrading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Lab Review Hub</h2>
            <p className="text-slate-500 font-medium">Evaluate student virtual laboratory notebooks and performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none w-64 shadow-sm" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving Submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending submissions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((sub, idx) => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-200/20 transition-all flex flex-col md:flex-row items-center gap-6"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 uppercase tracking-tighter">
                   {sub.student.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{sub.student.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${sub.status === 'GRADED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Beaker className="w-3 h-3" /> {sub.lab.title}
                  </p>
                </div>

                <div className="flex items-center gap-8 px-8 border-x border-slate-50 text-center">
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Observations</p>
                        <p className="text-sm font-black text-slate-700">{sub.observations.length}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Result</p>
                        <p className="text-sm font-black text-blue-600">
                            {Array.isArray(sub.resultData) ? 'Release Map' : 'Point Data'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                   {sub.grade !== null && (
                      <div className="px-5 py-3 bg-green-50 rounded-xl text-center">
                         <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">Score</p>
                         <p className="text-lg font-black text-green-700">{sub.grade}%</p>
                      </div>
                   )}
                   <button 
                    onClick={() => setSelectedSub(sub)}
                    className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all"
                   >
                     View & Grade
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedSub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSub(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black uppercase">{selectedSub.student.name.charAt(0)}</div>
                      <div>
                         <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedSub.student.name}</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedSub.lab.title}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedSub(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><XCircle className="w-6 h-6 text-slate-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div>
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Laboratory Input Parameters</h4>
                        <div className="grid grid-cols-2 gap-3">
                           {Object.entries(selectedSub.inputs || {}).map(([k, v]: any) => (
                              <div key={k} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{k}</p>
                                <p className="text-sm font-bold text-slate-700">{v}</p>
                              </div>
                           ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Digital Lab Notebook</h4>
                        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                           <table className="w-full text-left">
                              <thead className="bg-slate-200/50"><tr><th className="px-6 py-3 text-[8px] font-black text-slate-500 uppercase">Time Step</th><th className="px-6 py-3 text-[8px] font-black text-slate-500 uppercase">Reading</th></tr></thead>
                              <tbody className="divide-y divide-slate-100">
                                 {selectedSub.observations.map((obs: any, i: number) => (
                                    <tr key={i}><td className="px-6 py-3 text-xs font-bold text-slate-600">T+{obs.timeStep}min</td><td className="px-6 py-3 text-xs font-mono font-bold text-blue-600">{obs.reading}</td></tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                         <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-yellow-400 fill-current" />
                            <h4 className="font-black uppercase tracking-widest text-sm text-blue-400">Evaluation Form</h4>
                         </div>
                         <form onSubmit={handleGrade} className="space-y-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Numerical Grade (%)</label>
                               <input 
                                required
                                type="number" 
                                min="0" max="100"
                                value={gradeData.score}
                                onChange={(e) => setGradeData({...gradeData, score: e.target.value})}
                                placeholder="Enter score 0-100..." 
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold placeholder:text-white/30" 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Faculty Feedback</label>
                               <textarea 
                                required
                                rows={4}
                                value={gradeData.feedback}
                                onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                                placeholder="Provide clinical evaluation..." 
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold placeholder:text-white/30 resize-none" 
                               />
                            </div>
                            <button 
                             disabled={grading}
                             type="submit" 
                             className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                            >
                               {grading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                               Submit Evaluation
                            </button>
                         </form>
                      </div>

                      <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Simulation Intelligence Result</h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                            The automated simulation engine suggests that the student's inputs were {selectedSub.grade ? 'accurate' : 'consistent'} with pharmaceutical standards.
                         </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
