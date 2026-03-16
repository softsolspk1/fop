'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Beaker, FlaskConical, Microscope, Play, ExternalLink, Info, Search, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const labSimulations = [
  { 
    id: '1', 
    title: 'Pharmacokinetic Modeling', 
    department: 'Pharmacology', 
    description: 'Simulate drug absorption and elimination processes using a virtual human model.',
    provider: 'PharmaSimuleX',
    difficulty: 'Intermediate'
  },
  { 
    id: '2', 
    title: 'Chemical Reactions & Titration', 
    department: 'Pharmaceutical Chemistry', 
    description: 'Perform precise acid-base titrations and observe chemical changes in a safe environment.',
    provider: 'PraxiLabs',
    difficulty: 'Beginner'
  },
  { 
    id: '3', 
    title: 'Microbiological Culture & Staining', 
    department: 'Pharmaceutics', 
    description: 'Learn the techniques of bacterial culture growth and Gram staining procedures.',
    provider: 'Virtual Labs',
    difficulty: 'Advanced'
  },
  { 
    id: '4', 
    title: 'Plant Anatomy & Herbal Extraction', 
    department: 'Pharmacognosy', 
    description: 'Investigate plant tissues and simulate the extraction of bioactive compounds.',
    provider: 'PhytoSim',
    difficulty: 'Intermediate'
  }
];

export default function VirtualLabsPage() {
  const [activeLab, setActiveLab] = useState<any>(null);

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
                        className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-80 transition-all font-medium"
                    />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {labSimulations.map((lab, idx) => (
                <motion.div 
                  key={lab.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/30 transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {lab.department === 'Pharmacology' ? <Beaker className="w-8 h-8" /> : 
                             lab.department === 'Pharmaceutical Chemistry' ? <FlaskConical className="w-8 h-8" /> : <Microscope className="w-8 h-8" />}
                        </div>
                        <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                            {lab.difficulty}
                        </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{lab.title}</h3>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">{lab.department}</p>
                    <p className="text-slate-500 font-medium mb-8 flex-1 leading-relaxed">{lab.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-slate-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Verified by {lab.provider}</span>
                        </div>
                        <button 
                            onClick={() => setActiveLab(lab)}
                            className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Launch Lab
                        </button>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-50 group-hover:bg-blue-100/50 rounded-full blur-3xl transition-all" />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setActiveLab(null)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Laboratory
                </button>
                <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 font-black rounded-lg text-xs uppercase tracking-widest">{activeLab.title}</span>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <Info className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 aspect-video rounded-[3rem] shadow-2xl overflow-hidden border-8 border-slate-800 flex items-center justify-center relative group">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                    <p className="text-blue-200 font-black uppercase tracking-[0.3em] text-sm">Initializing 3D Environment...</p>
                </div>
                {/* Simulation Frame Mockup */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-blue-500 to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest">Learning Objectives</h4>
                    <ul className="space-y-3">
                        {['Understand receptor binding', 'Observe pharmacological response', 'Analyze dose-response curves'].map((obj, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium text-slate-600">
                                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                                {obj}
                            </li>
                        ))}
                    </ul>
                 </div>
                 <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <ExternalLink className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 uppercase tracking-tight">Resource Documentation</p>
                            <p className="text-sm text-slate-500">Download the lab manual and safety guidelines for this simulation.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        View Manual
                    </button>
                 </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const ArrowLeft = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);
