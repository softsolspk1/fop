"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, User, Filter, GraduationCap, Building2, MoreVertical, Edit2, Trash2, Loader2, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facRes, deptRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/departments')
      ]);
      setFaculty(facRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFaculty = faculty.filter(f => {
    return (filterDept === '' || f.department === filterDept) &&
           (filterDesignation === '' || f.designation === filterDesignation);
  });

  const deptNames = departments.map(d => d.name);
  const designations = Array.from(new Set(faculty.map(f => f.designation)));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', designation: '', departmentId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find the department name for the selected ID to maintain consistency if backend expects name
      // or just send departmentId if backend is updated.
      // Based on previous faculty.controller.ts, it expects 'department' as string (name).
      const selectedDept = departments.find(d => d.id === formData.departmentId);
      await api.post('/faculty', {
        ...formData,
        department: selectedDept?.name || ''
      });
      setIsModalOpen(false);
      setFormData({ name: '', designation: '', departmentId: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add faculty member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await api.delete(`/faculty/${id}`);
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
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Faculty Directory</h2>
            <p className="text-slate-500 font-medium">Manage faculty members, designations, and department assignments.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Faculty Member
          </button>
        </div>

        {/* ... (rest of the table code remains the same) ... */}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                 <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Add Faculty</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. Uzair" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                      <input required value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Associate Professor" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                      <select 
                        required 
                        value={formData.departmentId} 
                        onChange={(e) => setFormData({...formData, departmentId: e.target.value})} 
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      >
                        <option value="" className="text-slate-900">Select Department</option>
                        {departments.map((dept: any) => (
                          <option key={dept.id} value={dept.id} className="text-slate-900">{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-xs tracking-widest border-b-4 border-blue-800 hover:bg-blue-700 transition-all">Record Faculty Data</button>
                 </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search faculty by name..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            >
              <option value="" className="text-slate-900">All Departments</option>
              {departments.map(dept => <option key={dept.id} value={dept.name} className="text-slate-900">{dept.name}</option>)}
            </select>
            <select 
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            >
              <option value="" className="text-slate-900">All Designations</option>
              {designations.map(des => <option key={des as string} value={des as string} className="text-slate-900">{des as string}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 italic">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Faculty Information</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Designation</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Department</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Directory...</p>
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-medium">No faculty members found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f, idx) => (
                  <motion.tr 
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5 border-r border-slate-100/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center text-lg font-black border-2 border-white shadow-sm ring-1 ring-blue-100">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight text-lg">{f.name}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 uppercase tracking-tighter italic">
                            Official Academic Profile
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 border-r border-slate-100/50">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                            <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-700 font-black text-xs uppercase tracking-tight">{f.designation}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 border-r border-slate-100/50">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-700 font-black text-xs uppercase tracking-tight">{f.department}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(f.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        <button className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Showing {filteredFaculty.length} Academic Staff Members</p>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
