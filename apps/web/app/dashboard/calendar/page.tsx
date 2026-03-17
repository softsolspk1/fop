"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Loader2, X, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    startTime: '',
    endTime: '',
    location: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // For now, using 'exams' or 'classes' as events
      const [eventsRes, coursesRes] = await Promise.all([
        api.get('/exams'), // Or a specialized /schedules endpoint if we add it
        api.get('/courses')
      ]);
      setEvents(eventsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming /exams can double as schedule events for now
      await api.post('/exams', {
        title: formData.title,
        courseId: formData.courseId,
        date: formData.startTime,
        location: formData.location
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to schedule class');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Time Table</h2>
            <p className="text-slate-500 font-medium">Coordinate lectures, laboratories, and examination schedules.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Class Schedule
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 border border-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 border border-slate-100">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvent = events.some(e => e.date?.startsWith(dateStr));
                
                return (
                  <div key={day} className="relative aspect-square bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-blue-50 transition-colors group cursor-pointer">
                    <span className="font-black text-slate-400 group-hover:text-blue-600">{day}</span>
                    {hasEvent && <div className="absolute bottom-2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3 italic">
              Today's Schedule
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] not-italic font-black border-2 border-white shadow-sm">
                4 Events
              </span>
            </h3>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, idx) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-8 border-l-blue-600 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{event.course?.code || 'ACAD'}</span>
                      <MoreVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-black text-slate-800 mb-4 tracking-tight leading-tight">{event.title}</h4>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location || 'Seminar Hall A'}</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">New Class Schedule</h3>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X className="w-6 h-6" /></button>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                      <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Pharmacology Lab Section B" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                      <select required value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                        <option value="">Select a course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Time</label>
                      <input required type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Room 204" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 uppercase text-xs tracking-widest">Confirm Schedule</button>
                 </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
