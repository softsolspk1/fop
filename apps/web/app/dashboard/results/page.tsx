"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, FileText, User, BookOpen, Filter, Download, MoreVertical, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function ResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    marks: '',
    grade: '',
    semester: '1',
    academicYear: '2024-2025'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'STUDENT') {
        const res = await api.get(`/results/student/${user.id}`);
        setResults(res.data);
      } else {
        const [coursesRes, studentsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/users')
        ]);
        setCourses(coursesRes.data);
        setStudents(studentsRes.data.filter((u: any) => u.role === 'STUDENT'));
        
        if (coursesRes.data.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesRes.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseResults = async (courseId: string) => {
    if (!courseId || user?.role === 'STUDENT') return;
    try {
      const res = await api.get(`/results/course/${courseId}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) fetchCourseResults(selectedCourse);
  }, [selectedCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/results', formData);
      setIsModalOpen(false);
      setFormData({ ...formData, studentId: '', marks: '', grade: '' });
      if (formData.courseId === selectedCourse) {
        fetchCourseResults(selectedCourse);
      } else {
        setSelectedCourse(formData.courseId);
      }
    } catch (err) {
      alert('Failed to post result');
    }
  };

  const calculateGrade = (marks: number) => {
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Results</h2>
            <p className="text-slate-500 font-medium">Performance tracking and transcript management.</p>
          </div>
          {user?.role !== 'STUDENT' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" />
              Post New Result
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accessing Grade Ledger...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                   <div className="flex gap-4 items-center">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Examination Summary</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session: 2024-2025</p>
                      </div>
                      {user?.role !== 'STUDENT' && (
                        <div className="ml-8">
                          <select 
                            value={selectedCourse} 
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm"
                          >
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                          </select>
                        </div>
                      )}
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm shadow-sm">
                      <Download className="w-4 h-4" />
                      Download Transcript
                   </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 italic">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Course Description</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.role === 'STUDENT' ? 'Instructor' : 'Student'}</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Marks</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grade</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                             No records found in the current session.
                          </td>
                        </tr>
                      ) : (
                        results.map((res, idx) => (
                          <motion.tr 
                            key={res.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-blue-50/20 transition-colors group"
                          >
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-xs">
                                  {res.course?.code?.substring(0, 2)}
                                </div>
                                <div>
                                  <p className="font-black text-slate-800 tracking-tight">{res.course?.name}</p>
                                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.1em]">{res.course?.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black border border-white shadow-sm">
                                    {(user?.role === 'STUDENT' ? res.teacher?.name : res.student?.name)?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-700">{user?.role === 'STUDENT' ? res.teacher?.name : res.student?.name}</p>
                                    {user?.role !== 'STUDENT' && <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{res.student?.rollNumber}</p>}
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-6">
                              <span className="font-black text-slate-800">{res.marks}</span>
                              <span className="text-[10px] font-bold text-slate-400 ml-1">/ 100</span>
                            </td>
                            <td className="px-10 py-6">
                               <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${res.grade === 'F' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                  {res.grade}
                               </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 text-green-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                               </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {/* Post Result Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Post Academic Result</h3>
                    <p className="text-sm text-slate-500 font-medium">Add performance record to student ledger.</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Course</label>
                      <select required value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                        <option value="">Select a course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Student</label>
                      <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                        <option value="">Select a student...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Obtained Marks</label>
                        <input 
                          required 
                          type="number" 
                          max="100" 
                          value={formData.marks} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({...formData, marks: val, grade: calculateGrade(Number(val))});
                          }} 
                          placeholder="0-100" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calculated Grade</label>
                        <input disabled value={formData.grade} className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl font-black text-blue-600 outline-none cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                        <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Semester {n}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                        <select value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                          <option>2024-2025</option>
                          <option>2025-2026</option>
                        </select>
                      </div>
                    </div>
                    
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 uppercase text-xs tracking-[0.2em] active:translate-y-1 active:border-b-0 transition-all">Publish Result</button>
                 </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
