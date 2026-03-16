'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { FileText, Calendar, Clock, ArrowRight, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const mockAssignments = [
  { id: '1', title: 'Mechanism of Action: Beta Blockers', course: 'Pharmacology I', due: 'March 18, 2026', status: 'PENDING', type: 'Clinical Report' },
  { id: '2', title: 'Limit Test for Iron', course: 'Pharmaceutics II', due: 'March 20, 2026', status: 'SUBMITTED', type: 'Lab Report' },
  { id: '3', title: 'Pharmacy Law & Ethics Quiz', course: 'Forensic Pharmacy', due: 'March 15, 2026', status: 'LATE', type: 'Quiz' },
];

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState('ALL');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Assignments</h2>
            <p className="text-slate-500">Track and submit your academic tasks here.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search tasks..."
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
             </div>
             <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <Filter className="w-5 h-5 text-slate-600" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {['ALL', 'PENDING', 'SUBMITTED', 'GRADED'].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                        filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                >
                    {f}
                </button>
             ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAssignments.map((assignment, idx) => (
                <motion.div 
                    key={assignment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${
                            assignment.status === 'SUBMITTED' ? 'bg-green-100 text-green-600' : 
                            assignment.status === 'LATE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            assignment.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 
                            assignment.status === 'LATE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {assignment.status}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {assignment.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mb-6 uppercase tracking-wider">{assignment.course} • {assignment.type}</p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">Due: {assignment.due}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">11:59 PM (PST)</span>
                        </div>
                    </div>

                    <button className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        assignment.status === 'SUBMITTED' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                    }`}>
                        {assignment.status === 'SUBMITTED' ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Submitted
                            </>
                        ) : (
                            <>
                                Upload Submission
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </motion.div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
