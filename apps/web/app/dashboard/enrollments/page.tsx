"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UserPlus, Search, Check, X, Loader2, Filter, Mail, Phone, Building2, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enrollments/pending');
      setEnrollments(res.data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      await api.post(`/enrollments/${id}/${action}`);
      setEnrollments(enrollments.filter(e => e.id !== id));
    } catch (err) {
      console.error(`Error ${action}ing enrollment:`, err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enrollment record?')) return;
    try {
      await api.delete(`/enrollments/${id}`);
      setEnrollments(enrollments.filter(e => e.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    const searchLow = search.toLowerCase();
    const nameMatch = e.name?.toLowerCase().includes(searchLow) ?? false;
    const emailMatch = e.email?.toLowerCase().includes(searchLow) ?? false;
    return (nameMatch || emailMatch) && (filter === 'ALL' || e.department?.name === filter);
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-blue-600" />
              Enrollment Management
            </h2>
            <p className="text-slate-500 font-medium mt-1">Review and approve official student registration requests.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search applications..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-80 transition-all font-medium"
                />
             </div>
             <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm">
                <Filter className="w-5 h-5 text-slate-600" />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching pending requests...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center px-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Pending Enrollments</h3>
            <p className="text-slate-500 max-w-md mx-auto">All applications have been processed. New registrations will appear here for your review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredEnrollments.map((enrollment, idx) => (
                <motion.div 
                   key={enrollment.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col md:flex-row items-center gap-8"
                >
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center shrink-0">
                     <User className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div>
                      <h4 className="text-lg font-black text-slate-800 truncate uppercase tracking-tight">{enrollment.name}</h4>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        {enrollment.department?.name || 'No Department'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium truncate">{enrollment.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">{enrollment.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</div>
                        <p className="text-sm font-bold text-slate-700">Roll: {enrollment.rollNumber || 'N/A'}</p>
                        <p className="text-sm font-bold text-slate-700">Year: {enrollment.year || 'N/A'}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleDelete(enrollment.id)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Request"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        disabled={!!processing}
                        onClick={() => handleAction(enrollment.id, 'reject')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        {processing === enrollment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Reject
                      </button>
                      <button 
                        disabled={!!processing}
                        onClick={() => handleAction(enrollment.id, 'approve')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                      >
                        {processing === enrollment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
