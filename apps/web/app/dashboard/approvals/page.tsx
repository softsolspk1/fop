"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Check, X, FileText, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function ApprovalsPage() {
  const [pendingMaterials, setPendingMaterials] = useState<any[]>([]);
  const [pendingQuizzes, setPendingQuizzes] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const [materialsRes, quizzesRes, usersRes] = await Promise.all([
        api.get('/lms/pending'),
        api.get('/quizzes/pending'),
        api.get('/users/pending')
      ]);
      setPendingMaterials(materialsRes.data || []);
      setPendingQuizzes(quizzesRes.data || []);
      setPendingUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching pending items:', err);
      setError('Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApproveMaterial = async (id: string, approve: boolean) => {
    try {
      await api.put(`/lms/materials/${id}/status`, { status: approve ? 'APPROVED' : 'REJECTED' });
      fetchPending();
    } catch (err) {
      alert('Error updating material status');
    }
  };

  const handleApproveQuiz = async (id: string, approve: boolean) => {
    try {
      await api.put(`/quizzes/${id}/status`, { status: approve ? 'APPROVED' : 'REJECTED' });
      fetchPending();
    } catch (err) {
      alert('Error updating quiz status');
    }
  };

  const handleApproveUser = async (id: string, approve: boolean) => {
    try {
      await api.put(`/users/${id}`, { status: approve ? 'APPROVED' : 'REJECTED' });
      fetchPending();
    } catch (err) {
      alert('Error updating user status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pending Approvals</h2>
          <p className="text-slate-500 font-medium tracking-tight">Review and approve course materials and examinations submitted by faculty.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Pending Queue...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Materials Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Course Materials</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">{pendingMaterials.length}</span>
              </div>
              
              <div className="space-y-4">
                {pendingMaterials.length === 0 ? (
                  <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <p className="text-slate-400 font-bold text-sm">No materials awaiting approval.</p>
                  </div>
                ) : (
                  pendingMaterials.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-tight">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {item.course?.code} • {item.uploadedBy?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleApproveMaterial(item.id, false)}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleApproveMaterial(item.id, true)}
                          className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Quizzes Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-purple-600 rounded-full" />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Exams & Quizzes</h3>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black">{pendingQuizzes.length}</span>
              </div>

              <div className="space-y-4">
                {pendingQuizzes.length === 0 ? (
                  <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <p className="text-slate-400 font-bold text-sm">No exams/quizzes awaiting approval.</p>
                  </div>
                ) : (
                  pendingQuizzes.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-tight">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {item.course?.code} • {item.isExam ? 'EXAM' : 'QUIZ'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleApproveQuiz(item.id, false)}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleApproveQuiz(item.id, true)}
                          className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* User Registrations Section (Full Width) */}
          <section className="space-y-4 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-6 bg-green-600 rounded-full" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">User Registrations</h3>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black">{pendingUsers.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.length === 0 ? (
                <div className="col-span-full p-10 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                  <p className="text-slate-400 font-bold text-sm">No new user registrations pending approval.</p>
                </div>
              ) : (
                pendingUsers.map((user) => (
                  <motion.div 
                    key={user.id} 
                    layout
                    className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 leading-tight truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
                          {user.role} • {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 italic text-[10px] text-slate-400 font-medium">
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>{user.department?.name || 'No Dept'}</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApproveUser(user.id, false)}
                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        REJECT
                      </button>
                      <button 
                        onClick={() => handleApproveUser(user.id, true)}
                        className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-black text-xs hover:bg-green-700 transition-all shadow-md active:scale-95"
                      >
                        APPROVE
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
