"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CreditCard, DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, Plus, Search, Filter, Loader2, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function FeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = ['MAIN_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '') || user?.role === 'HOD';

  useEffect(() => {
    fetchFees();
  }, [isAdmin]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/fees/all' : '/fees/my-fees';
      const res = await api.get(endpoint);
      setFees(res.data);
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/fees/${id}/status`, { status });
      setFees(fees.map(f => f.id === id ? { ...f, status } : f));
    } catch (err) {
      console.error('Error updating fee status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await api.delete(`/fees/${id}`);
      setFees(fees.filter(f => f.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              Fee Management
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {isAdmin ? 'Monitor and manage student financial records.' : 'View and pay your university fees.'}
            </p>
          </div>
          
          {isAdmin && (
            <button className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              <Plus className="w-5 h-5" />
              Generate Fee
            </button>
          )}
        </div>

        {/* Overview Cards for Students */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-blue-600" />
               </div>
               <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</div>
                  <div className="text-2xl font-black text-slate-800">
                    Rs. {fees.reduce((acc, f) => f.status === 'UNPAID' || f.status === 'OVERDUE' ? acc + f.amount : acc, 0).toLocaleString()}
                  </div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
               <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
               </div>
               <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pending Invoices</div>
                  <div className="text-2xl font-black text-slate-800">
                    {fees.filter(f => f.status === 'UNPAID' || f.status === 'OVERDUE').length}
                  </div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
               <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
               </div>
               <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Paid Requests</div>
                  <div className="text-2xl font-black text-slate-800">
                    {fees.filter(f => f.status === 'PAID').length}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Search & Filter (Admin Only) */}
        {isAdmin && (
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by student name or roll number..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
             </div>
             <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600">
                   <Filter className="w-4 h-4" />
                   Filters
                </button>
             </div>
          </div>
        )}

        {/* Fees List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading financial records...</p>
             </div>
          ) : fees.length === 0 ? (
            <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-slate-200">
               <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <h3 className="text-xl font-black text-slate-800">No Fee Records</h3>
               <p className="text-slate-500 font-medium">All financial dues are currently clear.</p>
            </div>
          ) : (
            <AnimatePresence>
              {fees.map((fee, idx) => (
                <motion.div 
                  key={fee.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      fee.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                      fee.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{fee.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-widest uppercase">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(fee.dueDate).toLocaleDateString()}
                        </span>
                        {isAdmin && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 tracking-widest uppercase px-2 py-0.5 bg-blue-50 rounded-md">
                            <User className="w-3.5 h-3.5" />
                            {fee.user?.name} ({fee.user?.rollNumber})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="text-right">
                       <div className="text-2xl font-black text-slate-800">Rs. {fee.amount.toLocaleString()}</div>
                       <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${
                          fee.status === 'PAID' ? 'text-emerald-500' : 
                          fee.status === 'OVERDUE' ? 'text-red-500' : 'text-blue-500'
                       }`}>
                          {fee.status}
                       </div>
                    </div>

                     <div className="flex items-center gap-3">
                        {isAdmin ? (
                          <>
                            <button 
                              onClick={() => updateStatus(fee.id, 'PAID')}
                              className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                            >
                               Mark Paid
                            </button>
                            <button 
                              onClick={() => handleDelete(fee.id)}
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                               <Trash2 className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition-all">
                               <AlertCircle className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          fee.status !== 'PAID' && (
                            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                              Pay Now
                            </button>
                          )
                        )}
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
