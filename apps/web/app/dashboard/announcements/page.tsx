"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Bell, Send, Users, Filter, Trash2, Calendar, Target, MegaPhone, Loader2, X, GraduationCap, Building2, Clock } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../lib/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: '',
    targetYear: '',
    targetShift: '',
    departmentId: '',
  });

  const canCompose = ['MAIN_ADMIN', 'SUPER_ADMIN', 'HOD', 'FACULTY'].includes(user?.role || '');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, deptRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/departments')
      ]);
      setAnnouncements(annRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return toast.error("Please fill title and content");

    try {
      setIsSending(true);
      await api.post('/announcements', formData);
      toast.success("Announcement broadcasted successfully!");
      setShowCompose(false);
      setFormData({ title: '', content: '', targetRole: '', targetYear: '', targetShift: '', departmentId: '' });
      fetchData();
    } catch (err) {
      toast.error("Failed to send announcement");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                <Bell className="text-white w-6 h-6" />
              </div>
              {canCompose ? 'Message Box' : 'Announcements'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-15">
              {canCompose ? 'Send broadcasts to targeted users' : 'Important updates and notifications'}
            </p>
          </div>
          
          {canCompose && (
            <button 
              onClick={() => setShowCompose(true)}
              className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
            >
              <Send className="w-4 h-4" />
              Compose New
            </button>
          )}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Broadcasts...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 opacity-20" />
               </div>
               <p className="font-bold text-lg">No announcements found</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={ann.id} 
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <MegaPhone className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{ann.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ann.createdAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-blue-600">BY {ann.sender.name} ({ann.sender.role})</span>
                      </div>
                    </div>
                  </div>
                  {(canCompose && (ann.senderId === user?.id || user?.role === 'MAIN_ADMIN' || user?.role === 'SUPER_ADMIN')) && (
                    <button onClick={() => handleDelete(ann.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="pl-18 pr-4">
                  <p className="text-slate-600 leading-relaxed font-medium mb-6 whitespace-pre-wrap">{ann.content}</p>
                  
                  {/* Target Badges */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <Target className="w-3 h-3" /> Targeted:
                    </div>
                    {ann.targetRole ? (
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{ann.targetRole}</span>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Global</span>
                    )}
                    {ann.targetYear && <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{ann.targetYear}</span>}
                    {ann.targetShift && <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{ann.targetShift}</span>}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Compose Modal */}
        <AnimatePresence>
           {showCompose && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowCompose(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
                />
                <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                   className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden shadow-blue-900/10"
                >
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Compose Broadcast</h2>
                    <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSend} className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Title</label>
                       <input 
                         required
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         placeholder="e.g. Schedule Update for 1st Year"
                         className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Role</label>
                          <select 
                            value={formData.targetRole}
                            onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                          >
                             <option value="">All Roles</option>
                             <option value="STUDENT">Students</option>
                             <option value="FACULTY">Faculty Only</option>
                             <option value="HOD">HODs Only</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Year</label>
                          <select 
                            value={formData.targetYear}
                            onChange={(e) => setFormData({...formData, targetYear: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          >
                             <option value="">All Years</option>
                             <option value="1st Year">1st Year</option>
                             <option value="2nd Year">2nd Year</option>
                             <option value="3rd Year">3rd Year</option>
                             <option value="4th Year">4th Year</option>
                             <option value="5th Year">5th Year</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Shift</label>
                          <select 
                            value={formData.targetShift}
                            onChange={(e) => setFormData({...formData, targetShift: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          >
                             <option value="">All Shifts</option>
                             <option value="MORNING">Morning</option>
                             <option value="EVENING">Evening</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                          <select 
                            value={formData.departmentId}
                            onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          >
                             <option value="">All Departments</option>
                             {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Body</label>
                       <textarea 
                         required
                         rows={4}
                         value={formData.content}
                         onChange={(e) => setFormData({...formData, content: e.target.value})}
                         placeholder="Write your message here..."
                         className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none"
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSending}
                      className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                    >
                      {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      {isSending ? 'Broadcasting...' : 'Broadcast Message'}
                    </button>
                  </form>
                </motion.div>
             </div>
           )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
