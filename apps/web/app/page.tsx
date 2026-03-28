"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Video, FileText, LayoutDashboard, Settings, ChevronRight, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import MessageModal from '../components/landing/MessageModal';

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<'dean' | 'vc' | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <MessageModal 
        isOpen={activeModal === 'dean'} 
        onClose={() => setActiveModal(null)}
        title="Dean's Message"
        imageSrc="/dean-message.png"
      />
      <MessageModal 
        isOpen={activeModal === 'vc'} 
        onClose={() => setActiveModal(null)}
        title="Vice Chancellor Message"
        imageSrc="/vc-message.png"
      />

      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl shadow-blue-100">
               <img src="/logo.jpg" alt="UOK Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Faculty of Pharmacy</span>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">University of Karachi</span>
            </div>
          </div>

        <div className="hidden lg:flex items-center gap-8 mr-auto ml-12">
            <button 
                onClick={() => setActiveModal('dean')}
                className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
                Dean's Message
            </button>
            <button 
                onClick={() => setActiveModal('vc')}
                className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
                Vice Chancellor Message
            </button>
            <a 
                href="/catalogue.pdf" 
                target="_blank"
                className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
                Prospectus 2026
                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] rounded border border-red-100">PDF</span>
            </a>
        </div>

        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2.5 text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all border border-slate-100 rounded-xl hover:bg-slate-50">Login</Link>
          <Link href="/signup" className="px-6 py-2.5 text-xs font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest flex items-center gap-2">
            Portal Access
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-12">
        <div className="text-center mb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100 mb-8 shadow-sm shadow-blue-50/50 hover:bg-blue-100/50 transition-colors">
                <GraduationCap className="w-3 h-3" />
                Academic Session 2026
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic">
                Next-Gen <br/><span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-700">Pharmacy</span> <br/>Education.
              </h1>
              <p className="mt-10 text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
                Official Online Class Portal and Academic Management System for the <span className="text-slate-900 font-bold">Faculty of Pharmacy and Pharmaceutical Sciences</span>, University of Karachi.
              </p>
          </motion.div>
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
              className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-default group transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-32 py-12 text-center border-t border-slate-100 bg-white">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 overflow-hidden">© 2026 Faculty of Pharmacy and Pharmaceutical Sciences • UOK</p>
        <div className="h-[1px] w-24 bg-slate-100 mx-auto mb-6" />
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Developed with Excellence by <span className="text-blue-600">Softsols Pakistan</span></p>
      </footer>
    </div>
  );
}
