'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { 
  Beaker, 
  FlaskConical, 
  Microscope, 
  Play, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  Shield, 
  PenTool, 
  CheckSquare, 
  Search,
  ShieldCheck,
  Calculator,
  FileText,
  Youtube,
  ImageIcon,
  VideoIcon,
  Save,
  Clock3,
  StickyNote,
  ExternalLink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function VirtualLabsPage() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLab, setActiveLab] = useState<any>(null);
  const [workflowStep, setWorkflowStep] = useState<'PRE_LAB' | 'EXPERIMENT' | 'NOTEBOOK' | 'ASSESSMENT' | 'SUBMISSION'>('PRE_LAB');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Pharmaceutics',
    provider: 'UOK',
    difficulty: 'Intermediate',
    url: '',
    year: '1',
    courseId: '',
    multimediaContent: [] as any[]
  });

  const [submissionData, setSubmissionData] = useState({
    studentResult: '',
    studentObservation: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMedia = (type: string) => {
    setFormData({
      ...formData,
      multimediaContent: [...formData.multimediaContent, { type, url: '', title: '' }]
    });
  };

  const handleRemoveMedia = (index: number) => {
    const newContent = [...formData.multimediaContent];
    newContent.splice(index, 1);
    setFormData({ ...formData, multimediaContent: newContent });
  };

  const handleUpdateMedia = (index: number, field: string, value: string) => {
    const newContent = [...formData.multimediaContent];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData({ ...formData, multimediaContent: newContent });
  };

  const handleManualSubmit = async () => {
    if (!activeLab) return;
    
    // If no experiment exists, create one first or handle error
    const expId = activeLab.experiments?.[0]?.id;
    if (!expId) {
      alert('Please start the experiment first');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/labs/experiments/${expId}/submit`, submissionData);
      alert('Lab Report Submitted Successfully!');
      fetchData();
      setActiveLab(null);
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productionLabs = [
    {
      id: 'dissolution',
      title: 'Dissolution Rate Test',
      description: 'Evaluate the rate of drug release from solid dosage forms using USP Apparatus I/II.',
      department: 'Pharmaceutics',
      difficulty: 'Intermediate',
      type: 'dissolution'
    },
    {
      id: 'tablet',
      title: 'Tablet Formulation & Q.C.',
      description: 'Design tablet formulations and test mechanical strength vs disintegration time.',
      department: 'Pharmaceutics',
      difficulty: 'Advanced',
      type: 'tablet'
    },
    {
      id: 'emulsion',
      title: 'Emulsion Prep & Stability',
      description: 'Formulate oil-in-water emulsions using the HLB balance method.',
      department: 'Pharmaceutics',
      difficulty: 'Beginner',
      type: 'emulsion'
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const labsRes = await api.get('/labs');
      // Filter out labs that are already in productionLabs to avoid duplicates
      const prodIds = productionLabs.map(pl => pl.id.toLowerCase());
      const filtered = labsRes.data.filter((lab: any) => {
        const labIdLow = lab.id?.toLowerCase() || '';
        const labTitleLow = lab.title?.toLowerCase() || '';
        return !prodIds.includes(labIdLow) && 
               !prodIds.includes(labTitleLow.replace(/\s+/g, '-')) &&
               !productionLabs.some(pl => pl.title.toLowerCase() === labTitleLow);
      });
      setLabs(filtered);
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
        courseId: lab.courseId || '',
        multimediaContent: lab.multimediaContent || []
      });
    } else {
      setEditingLab(null);
      setFormData({
        title: '', 
        description: '', 
        department: 'Pharmaceutics', 
        provider: 'UOK', 
        difficulty: 'Intermediate', 
        url: '', 
        year: '1', 
        courseId: '',
        multimediaContent: []
      });
    }
    setSubmissionData({ studentResult: '', studentObservation: '' });
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
    return selectedDept === 'All' || lab.department === selectedDept;
  });

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {!activeLab ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Virtual Research Station</h2>
                <p className="text-slate-500 font-medium text-lg">High-precision digital laboratories for Pharmaceutics and Clinical Practice.</p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm uppercase tracking-widest"
                >
                  <option value="All">All Disciplines</option>
                  <option value="Pharmaceutics">Pharmaceutics</option>
                  <option value="Pharmacology">Pharmacology</option>
                  <option value="Pharmaceutical Chemistry">Pharmaceutical Chemistry</option>
                </select>
                {(['MAIN_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '') || user?.role === 'FACULTY') && (
                  <button 
                    onClick={() => handleOpenModal()}
                    className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 hover:bg-blue-700 transition-all active:border-b-0 active:translate-y-1"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>

            {/* Premium Certified Experiments */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-slate-100" />
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    UOK Certified Simulation Modules
                 </h3>
                 <div className="h-px flex-1 bg-slate-100" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {productionLabs.map((lab, idx) => (
                  <motion.div 
                    key={lab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20 group-hover:bg-blue-600/30 transition-all duration-700 blur-[40px]" />
                    <div className="relative z-10 flex flex-col h-full">
                       <div className="flex justify-between items-start mb-8">
                          <div className="p-5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/40">
                             <FlaskConical className="w-8 h-8" />
                          </div>
                          <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">{lab.difficulty}</span>
                       </div>
                       <h4 className="text-2xl font-black text-white uppercase mb-4 leading-tight tracking-tight group-hover:text-blue-400 transition-colors">{lab.title}</h4>
                       <p className="text-sm text-slate-400 font-medium mb-12 flex-1 leading-relaxed opacity-70 italic">"{lab.description}"</p>
                       <button 
                         onClick={() => window.location.href = `/dashboard/labs/simulation/${lab.type}`}
                         className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-900/40 border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                       >
                          <Play className="w-4 h-4 fill-current ml-1" />
                          Launch Terminal
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Extended Repository removed as per user request to avoid duplication */}
          </>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveLab(null)} className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase text-[11px] tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back to Station
              </button>
              {activeLab.multimediaContent?.length > 0 && (
                <div className="flex gap-2">
                  {activeLab.multimediaContent.map((media: any, i: number) => (
                    <a key={i} href={media.url} target="_blank" rel="noopener noreferrer" title={media.title} className="p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-500 transition-all group shadow-sm flex items-center gap-2">
                      {media.type === 'PDF' && <FileText className="w-5 h-5 text-red-500" />}
                      {media.type === 'PPTX' && <Save className="w-5 h-5 text-orange-500" />}
                      {media.type === 'VIDEO' && <VideoIcon className="w-5 h-5 text-blue-500" />}
                      {media.type === 'YOUTUBE' && <Youtube className="w-5 h-5 text-red-600" />}
                      <span className="text-[10px] font-black uppercase text-slate-400 max-w-[100px] truncate">{media.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
              {/* Header */}
              <div className="p-12 bg-slate-50/50 border-b border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tight mb-2">{activeLab.title}</h3>
                    <p className="text-slate-500 font-medium text-lg italic leading-relaxed">"{activeLab.description}"</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">{activeLab.department}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complexity: {activeLab.difficulty}</span>
                  </div>
                </div>

                {/* Workflow Tabs */}
                <div className="flex overflow-x-auto gap-4 p-2 bg-white rounded-[2.5rem] border border-slate-100 w-fit custom-scrollbar">
                   {[
                     { id: 'PRE_LAB', icon: BookOpen, label: 'Scientific Theory' },
                     { id: 'EXPERIMENT', icon: Play, label: 'Live Simulation' },
                     { id: 'SUBMISSION', icon: PenTool, label: 'Report Submission' }
                   ].map((tab) => (
                     <button
                       key={tab.id}
                       onClick={() => setWorkflowStep(tab.id as any)}
                       className={`flex items-center gap-3 px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                         workflowStep === tab.id ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'
                       }`}
                     >
                       <tab.icon className="w-4 h-4" />
                       {tab.label}
                     </button>
                   ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={workflowStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    {workflowStep === 'PRE_LAB' && (
                      <div className="max-w-4xl space-y-12">
                         <div className="space-y-6">
                            <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                               <Shield className="w-6 h-6 text-blue-600" />
                               Safety Protocols & Guidelines
                            </h4>
                            <div className="p-10 bg-blue-50/30 rounded-[3.5rem] border border-blue-100/50 text-slate-600 leading-relaxed font-medium">
                               {activeLab.safety || "Standard laboratory safety protocols apply. Ensure use of PPE, including lab coats and eye protection, before proceeding with the virtual simulation. Familiarize yourself with all safety equipment locations in the digital vicinity."}
                            </div>
                         </div>
                         <div className="space-y-6">
                            <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                               <BookOpen className="w-6 h-6 text-blue-600" />
                               Technical Background & Objectives
                            </h4>
                            <div className="text-slate-600 leading-relaxed font-medium space-y-4 text-justify px-4">
                               {activeLab.theory || "The virtual environment replicates high-fidelity research scenarios based on USP/BP/IP pharmacopoeial standards. Students are expected to understand the molecular interactions and procedural precision required to achieve valid scientific outcomes."}
                            </div>
                         </div>
                      </div>
                    )}

                    {workflowStep === 'EXPERIMENT' && (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-slate-50/30 rounded-[4rem] border-2 border-dashed border-slate-100">
                         <div className="w-32 h-32 bg-white text-blue-600 rounded-[4rem] flex items-center justify-center mb-10 shadow-2xl animate-bounce">
                            <Calculator className="w-16 h-16" />
                         </div>
                         <h4 className="text-3xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Core Simulation Interface</h4>
                         <p className="text-slate-500 max-w-md mb-12 font-medium leading-relaxed italic">The virtual engine is pre-calibrated for {activeLab.title}. Prepare for real-time data acquisition and analysis.</p>
                         <button 
                            onClick={() => window.location.href = `/dashboard/labs/simulation/${activeLab.type || 'generic'}`}
                            className="px-16 py-6 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl shadow-blue-200 uppercase tracking-[0.3em] text-[13px] border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-4"
                         >
                            <Play className="w-5 h-5 fill-current" />
                            Launch Environment
                         </button>
                      </div>
                    )}

                    {workflowStep === 'SUBMISSION' && (
                       <div className="max-w-3xl mx-auto space-y-12 py-10">
                          <div className="text-center mb-10 space-y-2">
                             <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10" />
                             </div>
                             <h4 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Academic Lab Report</h4>
                             <p className="text-slate-400 font-medium tracking-tight uppercase text-xs">Official Submission Portal • {new Date().toLocaleDateString()}</p>
                          </div>

                          <div className="space-y-8">
                             <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-4">
                                   <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                   Direct Observations
                                </label>
                                <textarea 
                                   value={submissionData.studentObservation}
                                   onChange={(e) => setSubmissionData({...submissionData, studentObservation: e.target.value})}
                                   placeholder="Detail your procedural notes and secondary observations here..."
                                   rows={8}
                                   className="w-full p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm text-sm"
                                />
                             </div>

                             <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-4">
                                   <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                   Analytical Results & Conclusion
                                </label>
                                <textarea 
                                   value={submissionData.studentResult}
                                   onChange={(e) => setSubmissionData({...submissionData, studentResult: e.target.value})}
                                   placeholder="State your final results, calculations, and clinical relevance..."
                                   rows={5}
                                   className="w-full p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm text-sm"
                                />
                             </div>

                             <div className="pt-6">
                               <button 
                                  onClick={handleManualSubmit}
                                  disabled={isSubmitting}
                                  className="w-full py-8 bg-slate-900 text-white font-black rounded-[3rem] shadow-[0_20px_50px_rgba(15,23,42,0.3)] uppercase tracking-[0.4em] text-sm hover:translate-y-[-4px] disabled:opacity-50 transition-all active:translate-y-0 flex items-center justify-center gap-4"
                               >
                                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                  Commit Formal Submission
                               </button>
                               <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed px-10">
                                 Note: Once committed, your report will be locked for evaluation by the department audit committee.
                               </p>
                             </div>
                          </div>
                       </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lab Configuration Tool</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Basic Information</label>
                  <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Experiment Title (e.g., Aspirin Synthesis)" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all text-sm" />
                  <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Methodology Summary & Objectives" rows={3} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all resize-none text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discipline</label>
                    <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none text-sm cursor-pointer">
                      <option>Pharmaceutics</option><option>Pharmacology</option><option>Pharmaceutical Chemistry</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Difficulty</label>
                    <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none text-sm cursor-pointer">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multimedia Resources</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleAddMedia('PDF')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"><FileText className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleAddMedia('PPTX')} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all"><Save className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleAddMedia('VIDEO')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"><VideoIcon className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleAddMedia('YOUTUBE')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"><Youtube className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formData.multimediaContent.map((media, idx) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          {media.type === 'PDF' && <FileText className="w-4 h-4 text-red-500" />}
                          {media.type === 'PPTX' && <Save className="w-4 h-4 text-orange-500" />}
                          {media.type === 'VIDEO' && <VideoIcon className="w-4 h-4 text-blue-500" />}
                          {media.type === 'YOUTUBE' && <Youtube className="w-4 h-4 text-red-600" />}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input placeholder="Resource Title" value={media.title} onChange={(e) => handleUpdateMedia(idx, 'title', e.target.value)} className="bg-transparent border-none outline-none font-bold text-xs" />
                          <input placeholder="URL / Link" value={media.url} onChange={(e) => handleUpdateMedia(idx, 'url', e.target.value)} className="bg-transparent border-none outline-none text-xs text-slate-500" />
                        </div>
                        <button type="button" onClick={() => handleRemoveMedia(idx)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                      </motion.div>
                    ))}
                    {formData.multimediaContent.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400">No resources added yet. Use icons above to add content.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-200 uppercase tracking-widest text-xs border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all">
                    Finalize & Sync Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
