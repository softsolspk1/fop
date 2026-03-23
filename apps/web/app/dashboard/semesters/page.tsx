"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Calendar, Save, Loader2, BookOpen, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSemester, setNewSemester] = useState({ name: '', startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/semesters');
      setSemesters(res.data);
    } catch (err) {
      console.error('Error fetching semesters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/semesters', newSemester);
      setMessage({ type: 'success', text: 'Semester created successfully!' });
      setIsCreating(false);
      setNewSemester({ name: '', startDate: '', endDate: '' });
      fetchSemesters();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create semester. Ensure the name is unique.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;
    try {
      await api.delete(`/semesters/${id}`);
      fetchSemesters();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Semester Management</h2>
            <p className="text-slate-500">Define academic terms and periods for course organization.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Semester
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Academic Terms
                  </h3>
               </div>
               
               {loading ? (
                 <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading semesters...</p>
                 </div>
               ) : semesters.length === 0 ? (
                 <div className="p-12 text-center text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No semesters defined yet.</p>
                 </div>
               ) : (
                 <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Semester Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Courses</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {semesters.map((sem) => (
                        <tr key={sem.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800">{sem.name}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                              {sem._count?.courses || 0} Courses
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button onClick={() => handleDelete(sem.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               )}
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {isCreating && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5"
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Create Semester</h3>
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Term Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Fall 2025"
                        value={newSemester.name}
                        onChange={(e) => setNewSemester({...newSemester, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                      <input 
                        required
                        type="date" 
                        value={newSemester.startDate}
                        onChange={(e) => setNewSemester({...newSemester, startDate: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                       <input 
                         required
                         type="date" 
                         value={newSemester.endDate}
                         onChange={(e) => setNewSemester({...newSemester, endDate: e.target.value})}
                         className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex gap-4 pt-4">
                       <button 
                         type="button"
                         onClick={() => setIsCreating(false)}
                         className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest"
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit"
                         disabled={submitting}
                         className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 active:translate-y-1 active:border-b-0 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center"
                       >
                         {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Activate Term'}
                       </button>
                    </div>
                  </form>

                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl border font-bold flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">Pro Tip</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Defining semesters allows you to group courses and generate academic reports efficiently. Each course should be linked to exactly one active semester.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
