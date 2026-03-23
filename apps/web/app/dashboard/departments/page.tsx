"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Building2, User, BookOpen, Plus, Edit2, Shield, X, Loader2, CheckCircle2, MoreVertical, Search, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    hodId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsRes, usersRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users')
      ]);
      setDepartments(deptsRes.data);
      // Filter for potential HODs (Admins/Teachers)
      setUsers(usersRes.data.filter((u: any) => u.role !== 'STUDENT'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (dept: any = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, hodId: dept.hodId || '' });
    } else {
      setEditingDept(null);
      setFormData({ name: '', hodId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Departmental Infrastructure</h2>
            <p className="text-slate-500 font-medium">Manage academic units and assign Head of Departments (HOD).</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            Establish Department
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Architecting Units...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
              <motion.div 
                key={dept.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-200/20 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-8">
                   <div className="p-4 bg-blue-50 text-blue-600 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Building2 className="w-6 h-6" />
                   </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleOpenModal(dept)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                          <Edit2 className="w-5 h-5" />
                       </button>
                       <button onClick={() => handleDelete(dept.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                </div>
                
                <div className="mb-8 flex-1">
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{dept.name}</h3>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Academic Unit</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                            <Shield className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Head of Dept</p>
                            <p className="text-sm font-black text-slate-700 italic">{dept.hod?.name || 'Unassigned'}</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center justify-between text-xs font-bold text-slate-400 italic">
                      <div className="flex items-center gap-2">
                         <Users className="w-3.5 h-3.5" />
                         <span>{dept.users?.length || 0} Members</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <BookOpen className="w-3.5 h-3.5" />
                         <span>{dept.courses?.length || 0} Courses</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingDept ? 'Update Unit' : 'Establish Unit'}</h3>
                    <p className="text-sm text-slate-500 font-medium">Configure department identity and leadership.</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X className="w-6 h-6" /></button>
                 </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
                       <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pharmaceutical Chemistry" className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Appoint HOD</label>
                       <select value={formData.hodId} onChange={(e) => setFormData({...formData, hodId: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm">
                         <option value="" className="text-slate-900">Select a Faculty Member...</option>
                         {users.map(u => <option key={u.id} value={u.id} className="text-slate-900">{u.name} ({u.role})</option>)}
                       </select>
                     </div>
                     
                     <button type="submit" className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 uppercase text-xs tracking-[0.2em] active:translate-y-1 active:border-b-0 transition-all hover:bg-blue-700">
                       {editingDept ? 'Confirm Reconfiguration' : 'Activate Unit'}
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
