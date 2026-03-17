'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Beaker, FlaskConical, Microscope, Play, ExternalLink, Info, Search, ShieldCheck, Plus, X, Edit2, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function VirtualLabsPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLab, setActiveLab] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    provider: '',
    difficulty: 'Beginner',
    url: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/labs');
      setLabs(res.data);
    } catch (err) {
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (lab: any = null) => {
    if (lab) {
      setEditingLab(lab);
      setFormData({
        title: lab.title,
        description: lab.description,
        department: lab.department,
        provider: lab.provider,
        difficulty: lab.difficulty,
        url: lab.url || ''
      });
    } else {
      setEditingLab(null);
      setFormData({
        title: '',
        description: '',
        department: '',
        provider: '',
        difficulty: 'Beginner',
        url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLab) {
        await api.put(`/labs/${editingLab.id}`, formData);
      } else {
        await api.post('/labs', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving lab:', err);
      alert('Failed to save simulation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this simulation?')) return;
    try {
      await api.delete(`/labs/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting lab:', err);
      alert('Failed to delete simulation');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {!activeLab ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Virtual Laboratory</h2>
                <p className="text-slate-500 font-medium">Interactive 3D simulations for pharmacy students.</p>
              </div>
              <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search simulations..."
                        className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm w-full md:w-80 transition-all font-medium"
                    />
                  </div>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 transition-all active:border-b-0 active:translate-y-1"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Calibrating Lab Equipment...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {labs.map((lab, idx) => (
                  <motion.div 
                    key={lab.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/30 transition-all group relative overflow-hidden flex flex-col"
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                          <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {lab.department === 'Pharmacology' ? <Beaker className="w-8 h-8" /> : 
                               lab.department === 'Pharmaceutical Chemistry' ? <FlaskConical className="w-8 h-8" /> : <Microscope className="w-8 h-8" />}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleOpenModal(lab)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(lab.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors bg-slate-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center h-fit">
                                {lab.difficulty}
                            </span>
                          </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{lab.title}</h3>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">{lab.department}</p>
                      <p className="text-slate-500 font-medium mb-8 flex-1 leading-relaxed italic line-clamp-2">"{lab.description}"</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-slate-400">
                              <ShieldCheck className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-tighter">Verified Provider: {lab.provider}</span>
                          </div>
                          <button 
                              onClick={() => setActiveLab(lab)}
                              className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
                          >
                              <Play className="w-4 h-4 fill-current" />
                              Launch Lab
                          </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setActiveLab(null)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase text-xs tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Laboratory
                </button>
                <div className="flex items-center gap-4">
                    <span className="px-5 py-2.5 bg-blue-50 text-blue-700 font-extrabold rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-blue-100">{activeLab.title}</span>
                </div>
            </div>

            <div className="bg-slate-900 aspect-video rounded-[3.5rem] shadow-2xl overflow-hidden border-[12px] border-slate-800 flex items-center justify-center relative group">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl shadow-blue-500">
                        <Play className="w-10 h-10 text-white fill-current ml-1" />
                    </div>
                    <div>
                      <p className="text-blue-200 font-black uppercase tracking-[0.4em] text-sm">Initializing Simulation...</p>
                      <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Connect VR Headset for Immersive Experience</p>
                    </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-blue-500 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingLab ? 'Modify Simulation' : 'New Lab Integration'}</h3>
                    <p className="text-sm text-slate-500 font-medium">Add interactive academic simulations.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Simulation Title</label>
                    <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Molecular Docking Analysis" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-black" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the learning objectives..." rows={3} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none italic" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <input required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} placeholder="Pharmacology" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provider</label>
                    <input required value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})} placeholder="e.g. Labster" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                    <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Simulation URL</label>
                    <input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="External Link" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                  </div>
                  <div className="pt-4 col-span-2">
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500 hover:bg-blue-700 active:scale-95 transition-all uppercase text-xs tracking-[0.2em] border-b-4 border-blue-800">
                      {editingLab ? 'Update Configuration' : 'Integrate Simulation'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
