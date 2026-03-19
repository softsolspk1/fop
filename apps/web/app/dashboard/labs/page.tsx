'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Beaker, FlaskConical, Microscope, Play, ExternalLink, Info, Search, ShieldCheck, Plus, X, Edit2, Trash2, Loader2, ArrowLeft, BookOpen, Shield, PenTool, CheckSquare, BarChart3, Clock, Thermometer, Droplets, Gauge, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function VirtualLabsPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLab, setActiveLab] = useState<any>(null);
  const [workflowStep, setWorkflowStep] = useState<'PRE_LAB' | 'EXPERIMENT' | 'NOTEBOOK' | 'ASSESSMENT'>('PRE_LAB');
  const [observations, setObservations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<any>(null);
  const [simParams, setSimParams] = useState<any>({});
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [courses, setCourses] = useState<any[]>([]);

  const runSimulation = async () => {
    if (!activeLab) return;
    setSimulating(true);
    setSimResult(null);
    setExperimentId(null);
    try {
      const { data } = await api.post(`/labs/${activeLab.id}/simulate`, simParams);
      await new Promise(r => setTimeout(r, 1500));
      const res = data.results || data.resultData;
      setSimResult(res);
      setExperimentId(data.experimentId);
      
      // Auto-populate Notebook observations
      if (activeLab.title.includes('Dissolution') && Array.isArray(res)) {
        setObservations(res.map(point => ({
          time: `T+${point.time}min`,
          reading: point.release,
          unit: '%'
        })));
      } else {
        setObservations([{
          time: new Date().toLocaleTimeString(),
          reading: res.hardness || res.purity || res.stability || res.contraction || (typeof res === 'object' ? Object.values(res)[0] : res),
          unit: activeLab.title.includes('Tablet') ? 'kg' : activeLab.title.includes('Titration') ? '%' : 'Scale'
        }]);
      }
    } catch (err) {
      console.error(err);
      alert('Simulation error. Please check parameters.');
    } finally {
      setSimulating(false);
    }
  };

  const saveObservations = async () => {
    if (!experimentId) return alert('No active experiment found. Please run a simulation first.');
    setSaving(true);
    try {
      await api.post(`/labs/${experimentId}/observations`, { observations });
      alert('Lab observations saved to your digital notebook!');
      setWorkflowStep('ASSESSMENT');
    } catch (err) {
      console.error(err);
      alert('Failed to save observations.');
    } finally {
      setSaving(false);
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    provider: '',
    difficulty: 'Beginner',
    url: '',
    year: '1',
    courseId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [labsRes, coursesRes] = await Promise.all([
        api.get('/labs'),
        api.get('/courses')
      ]);
      setLabs(labsRes.data);
      setCourses(coursesRes.data);
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
        url: lab.url || '',
        year: String(lab.year || '1'),
        courseId: lab.courseId || ''
      });
    } else {
      setEditingLab(null);
      setFormData({
        title: '', description: '', department: '', provider: '', difficulty: 'Beginner', url: '', year: '1', courseId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData, year: parseInt(formData.year) };
      if (editingLab) {
        await api.put(`/labs/${editingLab.id}`, dataToSave);
      } else {
        await api.post('/labs', dataToSave);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving lab:', err);
      alert('Failed to save simulation');
    }
  };

  const filteredLabs = labs.filter(lab => {
    const deptMatch = selectedDept === 'All' || lab.department === selectedDept;
    const yearMatch = selectedYear === 'All' || String(lab.year) === selectedYear;
    return deptMatch && yearMatch;
  });

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
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                  >
                    <option value="All">All Departments</option>
                    <option value="Pharmaceutics">Pharmaceutics</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Pharmaceutical Chemistry">Pharmaceutical Chemistry</option>
                  </select>
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
                {filteredLabs.map((lab, idx) => (
                  <motion.div 
                    key={lab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/30 transition-all group relative overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {lab.department === 'Pharmacology' ? <Beaker className="w-8 h-8" /> : <FlaskConical className="w-8 h-8" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{lab.difficulty}</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleOpenModal(lab)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(lab.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{lab.title}</h3>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">{lab.department}</p>
                    <p className="text-slate-500 font-medium mb-8 flex-1 leading-relaxed italic line-clamp-2">"{lab.description}"</p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-slate-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Verified Provider</span>
                        </div>
                        <button 
                            onClick={() => { setActiveLab(lab); setWorkflowStep('PRE_LAB'); }}
                            className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Launch Lab
                        </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <button onClick={() => setActiveLab(null)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] tracking-widest w-fit">
                <ArrowLeft className="w-4 h-4" /> Exit Lab
              </button>
              <div className="flex items-center bg-white p-2 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                {[
                  { id: 'PRE_LAB', label: 'Pre-Lab', icon: BookOpen },
                  { id: 'EXPERIMENT', label: 'Experiment', icon: Play },
                  { id: 'NOTEBOOK', label: 'Notebook', icon: PenTool },
                  { id: 'ASSESSMENT', label: 'Assessment', icon: CheckSquare },
                ].map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setWorkflowStep(step.id as any)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap ${workflowStep === step.id ? 'bg-blue-600 text-white shadow-lg font-black' : 'text-slate-400 hover:text-slate-600 font-bold'}`}
                    >
                      <step.icon className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest">{step.label}</span>
                    </button>
                    {idx < 3 && <div className="w-8 h-[2px] bg-slate-100 mx-2 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {workflowStep === 'PRE_LAB' && (
                    <motion.div key="prelab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-3">01. Learning Objectives</h3>
                            <p className="text-slate-600 font-medium leading-relaxed italic">{activeLab.objectives || 'Master the fundamental principles of pharmaceutical science through rigorous virtual experimentation.'}</p>
                          </div>
                          <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-4">
                            <h4 className="flex items-center gap-2 font-black text-blue-900 uppercase text-xs tracking-widest">
                              <Info className="w-4 h-4" /> Theoretical Principle
                            </h4>
                            <p className="text-blue-800/80 text-sm font-medium leading-relaxed">{activeLab.theory || 'Loading clinical theory modules...'}</p>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-sm font-black text-red-600 uppercase tracking-[0.3em] mb-3">02. Safety Protocol</h3>
                            <div className="p-6 border-2 border-dashed border-red-100 rounded-[2rem] bg-red-50/30">
                              <p className="text-slate-600 font-medium text-sm flex items-start gap-3">
                                <Shield className="w-5 h-5 text-red-500 mt-0.5" /> {activeLab.safety || 'Wear PPE and follow standard laboratory guidelines.'}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => setWorkflowStep('EXPERIMENT')} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all uppercase text-[10px] tracking-widest shadow-xl">Begin Virtual Experiment</button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {workflowStep === 'EXPERIMENT' && (
                    <motion.div key="exp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Parameters</h3>
                        {activeLab.title.includes('Dissolution') && (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stirring Speed (RPM)</label>
                              <input type="range" min="50" max="150" step="10" value={simParams.rpm || 100} onChange={(e) => setSimParams({...simParams, rpm: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                              <div className="flex justify-between text-[10px] font-bold text-blue-600 uppercase"><span>50</span><span>{simParams.rpm || 100} RPM</span><span>150</span></div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formulation</label>
                              <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs" value={simParams.type || 'Immediate'} onChange={(e) => setSimParams({...simParams, type: e.target.value})}>
                                <option>Immediate Release</option><option>Modified Release</option>
                              </select>
                            </div>
                          </div>
                        )}
                        {activeLab.title.includes('Tablet') && (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Binder Percentage (%)</label>
                              <input type="range" min="1" max="10" value={simParams.binder || 5} onChange={(e) => setSimParams({...simParams, binder: parseFloat(e.target.value)})} className="w-full accent-blue-600" />
                              <div className="flex justify-between text-[10px] font-bold text-blue-600"><span>1%</span><span>{simParams.binder || 5}%</span><span>10%</span></div>
                            </div>
                          </div>
                        )}
                        {activeLab.title.includes('Emulsion') && (
                          <div className="space-y-6">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oil:Water Ratio</label>
                             <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs" value={simParams.ratio || '4:2:1'} onChange={(e) => setSimParams({...simParams, ratio: e.target.value})}>
                                <option>4:2:1</option><option>3:2:1</option><option>2:2:1</option>
                             </select>
                          </div>
                        )}
                        <button onClick={runSimulation} disabled={simulating} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                          {simulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                          {simulating ? 'Processing...' : 'Run Simulation'}
                        </button>
                      </div>
                      <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] border-[12px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                        {!simResult ? (
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto animate-pulse"><Play className="w-8 h-8 text-blue-500 fill-current ml-1" /></div>
                            <p className="text-blue-200 font-black uppercase tracking-widest text-[10px]">Awaiting Parameters</p>
                          </div>
                        ) : (
                          <div className="w-full h-full p-10 flex flex-col justify-between">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                               {Array.isArray(simResult) ? (
                                 <div className="col-span-2 h-40 flex items-end gap-1">
                                    {simResult.map((p, i) => <div key={i} style={{ height: `${p.release}%` }} className="flex-1 bg-blue-600 rounded-t-sm" />)}
                                 </div>
                               ) : Object.entries(simResult).map(([k, v]) => (
                                 <div key={k} className="p-4 bg-white/5 rounded-2xl">
                                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{k}</p>
                                   <p className="text-xl font-black text-white">{typeof v === 'number' ? v.toFixed(2) : String(v)}</p>
                                 </div>
                               ))}
                            </div>
                            <div className="mt-8 flex gap-4">
                              <button onClick={() => setWorkflowStep('NOTEBOOK')} className="flex-1 py-4 bg-white text-slate-900 font-black rounded-xl text-[10px] uppercase">Record Data</button>
                              <button onClick={() => setWorkflowStep('ASSESSMENT')} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase">Analyze</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {workflowStep === 'NOTEBOOK' && (
                    <motion.div key="nb" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Observation Registry</h3>
                        <button 
                          onClick={saveObservations} 
                          disabled={saving || observations.length === 0}
                          className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                          Save to Notebook
                        </button>
                      </div>
                      <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Point</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Reading</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Unit</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                          {observations.map((obs, i) => <tr key={i}><td className="px-6 py-4 font-bold text-sm">{obs.time}</td><td className="px-6 py-4 font-mono text-sm text-blue-600">{obs.reading}</td><td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{obs.unit}</td></tr>)}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {workflowStep === 'ASSESSMENT' && (
                    <motion.div key="as" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Final Assessment</h3>
                       <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
                          <p className="font-bold text-slate-800">Review your findings and submit for faculty evaluation.</p>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center"><BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" /><p className="text-[10px] font-black uppercase">Graph Generated</p></div>
                             <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center"><CheckSquare className="w-8 h-8 mx-auto mb-2 text-green-600" /><p className="text-[10px] font-black uppercase">Data Validated</p></div>
                          </div>
                          <button 
                            onClick={saveObservations} 
                            disabled={saving}
                            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-3"
                          >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            Submit Final Lab Report
                          </button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-xl">
                  <ShieldCheck className="w-10 h-10 text-blue-400" />
                  <h4 className="font-black uppercase tracking-widest text-blue-400">UOK Certified</h4>
                  <p className="text-xs opacity-70 italic font-medium leading-relaxed">This module is compliant with academic standards for Pharm D students.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h4>
                   <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><span className="text-[10px] font-black uppercase">Glossary</span><BookOpen className="w-4 h-4" /></button>
                   <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><span className="text-[10px] font-black uppercase">Calculations</span><Calculator className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-10">
                <h3 className="text-2xl font-black text-slate-800 mb-8">{editingLab ? 'Edit Lab' : 'Add New Lab'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Lab Title" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                  <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" rows={3} className="w-full p-4 bg-slate-50 rounded-2xl font-bold resize-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} placeholder="Department" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                    <input required value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})} placeholder="Provider" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest">Save Configuration</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
