'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Book, Search, Download, ExternalLink, Filter, FileText, Globe, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const libraryResources = [
  { id: '1', title: 'Principles of Pharmacology', author: 'Dr. John Smith', category: 'E-Books', type: 'PDF', rating: 4.8 },
  { id: '2', title: 'Journal of Pharmaceutical Sciences (Vol 12)', author: 'Science Direct', category: 'Research Papers', type: 'Journal', rating: 4.5 },
  { id: '3', title: 'Clinical Pharmacy Handbook', author: 'UOK Faculty', category: 'Reference', type: 'PDF', rating: 4.9 },
  { id: '4', title: 'Modern Drug Design & Discovery', author: 'Elsevier', category: 'E-Books', type: 'Interactive', rating: 4.7 },
  { id: '5', title: 'Pharmacy Law & Ethics in Pakistan', author: 'Adv. M. Ali', category: 'Law', type: 'PDF', rating: 4.6 },
];

export default function DigitalLibraryPage() {
  const [filter, setFilter] = useState('ALL');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Digital Research Library</h2>
            <p className="text-slate-500 font-medium">Access over 5,000 journals, e-books, and pharmacy research papers.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text"
                    placeholder="Search library..."
                    className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-80 transition-all font-medium"
                />
             </div>
             <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm">
                <Filter className="w-5 h-5 text-slate-600" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {['ALL', 'E-Books', 'Research Papers', 'Journals', 'Reference', 'Thesis'].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        (filter === f || (f === 'ALL' && filter === 'ALL')) ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                >
                    {f}
                </button>
             ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-full md:col-span-full bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 mb-4"
            >
                <div className="relative z-10 text-white max-w-xl">
                    <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 mb-6 inline-block">Featured Resource</span>
                    <h3 className="text-3xl font-black mb-4 leading-tight italic">Biotechnology & Pharmaceutical Research (2026 Edition)</h3>
                    <p className="text-blue-50/80 font-medium mb-8 leading-relaxed">The latest breakthrough in pharmacokinetic modeling and drug delivery systems is now available for download.</p>
                    <button className="flex items-center gap-3 px-8 py-4 bg-white text-blue-700 font-black rounded-2xl shadow-xl hover:scale-105 transition-all">
                        <Download className="w-5 h-5" />
                        Download Now
                    </button>
                </div>
                <div className="relative z-10 w-full md:w-64 h-80 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md flex items-center justify-center p-8">
                     <Book className="w-32 h-32 text-blue-200/50" />
                     <div className="absolute top-4 left-4 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_#4ade80]" />
                </div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
            </motion.div>

            {libraryResources.map((item, idx) => (
                <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col justify-between"
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                {item.type === 'PDF' ? <FileText className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                            </div>
                            <div className="flex items-center gap-1 text-orange-400">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black text-slate-700">{item.rating}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.category}</span>
                            <h4 className="text-xl font-black text-slate-800 mt-1 mb-2 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                            <p className="text-sm font-bold text-slate-500 leading-snug tracking-tight">By {item.author}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2">
                        <button className="flex-1 py-4 bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            Preview
                        </button>
                        <button className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
