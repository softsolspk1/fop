'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Send, Bot, Sparkles, Wand2, BookOpen, Search, Command, Loader2, BrainCircuit, User, Shield } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AITutorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { id: 'welcome', role: 'assistant', content: `Hello ${user?.name}! I am your AI Pharma-Tutor. I can help you with drug formulations, pharmaceutics calculations, or explaining complex pharmacology concepts. What would you like to learn today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/tutor', { prompt: input });
      const assistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-160px)] gap-8">
        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-100/20 overflow-hidden relative">
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                 <Bot className="w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-2xl font-black tracking-tight uppercase">Pharma-Tutor AI</h2>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Powered by Gemini Pro</span>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Academic Assistant</span>
            </div>
          </div>

          <div className="absolute top-20 left-0 right-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none z-10" />

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
             <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                         msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
                       }`}>
                          {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                       </div>
                       <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                         msg.role === 'user' 
                           ? 'bg-slate-50 text-slate-700 rounded-tr-none border border-slate-100' 
                           : 'bg-white text-slate-800 rounded-tl-none border-2 border-blue-50'
                       }`}>
                          {msg.content}
                       </div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesizing Response...</span>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
             <form onSubmit={handleSend} className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white text-blue-600 rounded-2xl shadow-sm group-focus-within:shadow-blue-200 transition-all">
                   <Sparkles className="w-5 h-5" />
                </div>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Dissolution Tests, Granulation, or drug interactions..."
                  className="w-full pl-20 pr-32 py-6 bg-white border border-slate-200 rounded-[2.5rem] font-bold text-slate-800 focus:ring-8 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-xl shadow-blue-200/5 placeholder:text-slate-300"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3.5 bg-blue-600 text-white font-black rounded-[2rem] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2 border-b-4 border-blue-800 disabled:opacity-50 disabled:translate-y-1 disabled:border-b-0"
                >
                  Ask Tutor
                  <Send className="w-3.5 h-3.5" />
                </button>
             </form>
             <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <BookOpen className="w-3.5 h-3.5" />
                   RAG-Enhanced Data
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <BrainCircuit className="w-3.5 h-3.5" />
                   Context Aware
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 space-y-6">
           <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
                 <Command className="w-4 h-4 text-blue-600" />
                 Quick Topics
              </h3>
              <div className="space-y-3">
                 {['Pharmaceutics I', 'Clinical Pharmacy', 'Dosage Form Design', 'Pharmacology Rules'].map(topic => (
                   <button key={topic} className="w-full p-4 bg-slate-50 text-slate-600 rounded-2xl text-left font-bold text-xs hover:bg-blue-600 hover:text-white transition-all group flex items-center justify-between">
                     {topic}
                     <Wand2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                 <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-black mb-2 uppercase tracking-tight">Verified Knowledge</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                Responses are synthesized from official Faculty course materials and validated pharmaceutical databases.
              </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
