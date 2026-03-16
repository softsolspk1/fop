'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { FileText, Calendar, Clock, Plus, Save, ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CreateAssignmentPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '23:59',
    courseId: '',
    points: '100',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating Assignment:', formData);
    // Add API call here
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
             <Link href="/dashboard/teacher" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
             </Link>
             <div>
                <h2 className="text-2xl font-bold text-slate-800">Create New Assignment</h2>
                <p className="text-slate-500">Publish a new task for your students to complete.</p>
             </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Assignment Title</label>
                    <input 
                        type="text"
                        required
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800"
                        placeholder="e.g. Mechanism of Action for Beta Blockers"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Instructions / Description</label>
                    <textarea 
                        required
                        rows={6}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 leading-relaxed"
                        placeholder="Detail the requirements, references, and formatting for this assignment..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="date"
                                required
                                className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Time</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="time"
                                required
                                className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                                value={formData.dueTime}
                                onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Points / Weight</label>
                        <input 
                            type="number"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800"
                            value={formData.points}
                            onChange={(e) => setFormData({...formData, points: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-blue-900">Reference Materials</p>
                        <p className="text-sm text-blue-700">Attach supporting docs or research papers from Google Drive.</p>
                    </div>
                </div>
                <button type="button" className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Link Resources
                </button>
            </div>

            <div className="flex justify-end gap-4">
                <button type="button" className="px-8 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                    Save as Draft
                </button>
                <button type="submit" className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1">
                    <Plus className="w-5 h-5" />
                    Post Assignment
                </button>
            </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
