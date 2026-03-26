'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Video, Calendar, Clock, User, AlertCircle, Play, Users, MapPin, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveClassesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    startTime: '',
    endTime: '',
    dayOfWeek: 'Monday',
    location: 'Lecture Hall 1',
    classType: 'Physical'
  });


  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const [classesRes, coursesRes, deptsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/courses'),
        api.get('/departments')
      ]);
      
      setClasses(classesRes.data || []);
      setCourses(coursesRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classes', formData);
      setIsModalOpen(false);
      fetchClasses();
      setFormData({
        title: '',
        courseId: '',
        startTime: '',
        endTime: '',
        dayOfWeek: 'Monday',
        location: 'Lecture Hall 1',
        classType: 'Physical'
      });
      setSelectedDept('');
      setSelectedSem('');
    } catch (err) {
      console.error(err);
      alert('Failed to create class session');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Failed to delete session');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchDept = selectedDept ? course.departmentId === selectedDept : true;
    const matchSem = selectedSem ? course.semesterName === selectedSem : true;
    return matchDept && matchSem;
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Live Academic Sessions</h2>
            <p className="text-slate-500 font-medium">Join real-time lectures and mark your attendance automatically.</p>
          </div>
          <div className="flex items-center gap-4">
            {(['MAIN_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '') || user?.role === 'FACULTY') && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 transition-all active:border-b-0 active:translate-y-1 font-black uppercase text-xs tracking-widest"
              >
                Create New Session
              </button>
            )}
            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">System Status: Optimal</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
             <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-xs">Synchronizing Global Sessions...</p>
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {classes.map((cls, idx) => (
              <motion.div 
                key={cls.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/20 transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-blue-600 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl animate-pulse">
                      <Video className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{cls.title}</h3>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{cls.course?.name || 'General Course'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><User className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                        <p className="font-bold text-slate-800">{cls.faculty?.user?.name || 'Not Assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Clock className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                        <p className="font-bold text-slate-800">90 Minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Users className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendees</p>
                        <p className="font-bold text-slate-800">42 Students Joined</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lobby ID</p>
                        <p className="font-bold text-slate-800">UOK-L-{cls.id.substring(0,4).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => router.push(`/dashboard/courses/${cls.courseId}/live?sessionId=${cls.id}`)}
                      className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-800 uppercase text-xs tracking-[0.2em]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Enter Session
                    </button>
                    
                    {/* Teacher Controls */}
                    {(user?.role === 'FACULTY' || ['MAIN_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) && (
                      <div className="flex gap-2">
                        {!cls.actualStartTime && (
                          <button 
                            onClick={async () => {
                              await api.put(`/classes/${cls.id}/start`);
                              fetchClasses();
                            }}
                            className="px-6 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all uppercase text-xs tracking-widest border-b-4 border-green-800"
                          >
                            Start Session
                          </button>
                        )}
                        {cls.actualStartTime && !cls.actualEndTime && (
                          <button 
                            onClick={async () => {
                              await api.put(`/classes/${cls.id}/stop`);
                              fetchClasses();
                            }}
                            className="px-6 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all uppercase text-xs tracking-widest border-b-4 border-red-800"
                          >
                            Stop Session
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(cls.id)}
                          className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Student Controls */}
                    {user?.role === 'STUDENT' && (
                      <div className="flex gap-2">
                        {cls.actualStartTime && !cls.actualEndTime && (
                          <button 
                            onClick={async () => {
                              try {
                                await api.post('/attendance/mark-start', { classId: cls.id });
                                alert('Start Attendance Marked!');
                              } catch (err: any) {
                                alert(err.response?.data?.message || 'Failed to mark attendance');
                              }
                            }}
                            className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest border-b-4 border-slate-700"
                          >
                            Check-In
                          </button>
                        )}
                        {cls.actualEndTime && (
                          <button 
                            onClick={async () => {
                              try {
                                await api.post('/attendance/mark-end', { classId: cls.id });
                                alert('End Attendance Marked! You are PRESENT.');
                              } catch (err: any) {
                                alert(err.response?.data?.message || 'Failed to mark attendance');
                              }
                            }}
                            className="px-6 py-4 bg-blue-900 text-white font-black rounded-2xl hover:bg-blue-800 transition-all uppercase text-xs tracking-widest border-b-4 border-blue-700"
                          >
                            Check-Out
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
             <div className="w-32 h-32 bg-slate-50 text-slate-300 rounded-[3rem] flex items-center justify-center mx-auto mb-10">
                <Video className="w-16 h-16" />
             </div>
             <h3 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">No Active Sessions</h3>
             <p className="text-slate-500 font-medium italic max-w-sm mx-auto">
               There are no live classes ongoing at this moment. Please check your Time Table for upcoming sessions.
             </p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden p-10 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8 uppercase">Create Live Session</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
                  <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Advanced Pharmaceutics Lecture" className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      value={selectedDept} 
                      onChange={(e) => { setSelectedDept(e.target.value); setFormData({...formData, courseId: ''}); }} 
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                    >
                      <option value="">All Departments</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                    <select 
                      value={selectedSem} 
                      onChange={(e) => { setSelectedSem(e.target.value); setFormData({...formData, courseId: ''}); }} 
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                    >
                      <option value="">All Semesters</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                    <select required value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm">
                      <option value="">Select Course</option>
                      {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Type</label>
                    <select required value={formData.classType} onChange={(e) => setFormData({...formData, classType: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm">
                      <option value="Physical">Physical</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                    <input required type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                    <input required type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-xs tracking-widest border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 hover:bg-blue-700 transition-all">Launch Session</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
