"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, Video, FileText, LayoutDashboard, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
               <img src="/logo.jpg" alt="UOK Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Faculty of Pharmacy <span className="text-blue-600 font-extrabold text-xs align-top ml-0.5">UOK</span></span>
          </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center">Login</Link>
          <Link href="/signup" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md">Portal Access</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-tight tracking-tighter">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pharmacy</span> Education.
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Official Online Class Portal and Academic Management System for the Faculty of Pharmacy and Pharmaceutical Sciences, University of Karachi.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Video, title: 'Live Classes', description: 'Join sessions via Agora with real-time screen sharing and interaction.' },
            { icon: FileText, title: 'Course Materials', description: 'Access lecture notes, slides, and recordings directly from Google Drive.' },
            { icon: LayoutDashboard, title: 'Academic Reports', description: 'Track your attendance, view grades, and monitor course progress easily.' },
            { icon: Users, title: 'Collaborative Learning', description: 'Engage with teachers and peers through our integrated messaging system.' },
            { icon: BookOpen, title: 'Digital Library', description: 'Extensive repository of research papers, journals, and virtual lab demos.' },
            { icon: Settings, title: 'Advanced Tools', description: 'AI lecture transcription, plagiarism detection, and automated attendance.' },
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-default group"
            >
              <feature.icon className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-20 py-8 text-center border-t border-slate-200">
        <p className="text-slate-500 text-sm">© 2026 Faculty of Pharmacy, University of Karachi. All rights reserved.</p>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Developed by <span className="text-blue-500">Softsols Pakistan</span></p>
      </footer>
    </div>
  );
}
