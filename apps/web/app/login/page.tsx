'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border-4 border-white"
          >
            <img src="/logo.jpg" alt="UOK Logo" className="w-full h-full object-cover" />
          </motion.div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
          Portal Access
        </h2>
        <p className="mt-3 text-sm text-slate-500 font-medium">
          Faculty of Pharmacy and Pharmaceutical Sciences <br/>
          <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">University of Karachi</span>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100"
        >
          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mb-6 p-4 border rounded-2xl flex items-center gap-3 text-sm font-bold ${
                error.includes('pending') ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-red-50 border-red-100 text-red-600'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Institutional Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="ali@student.uok.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 px-1">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <span className="text-xs text-slate-400 font-medium">Secure biometric-ready access active</span>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-900/10 text-base font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
              >
                {isLoading ? 'Authenticating...' : 'Sign in to Portal'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-600 font-medium">
              New to the Faculty?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-black underline underline-offset-4 ml-1">
                Create Student Account
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex justify-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Link href="/" className="hover:text-slate-600 transition-colors">Support</Link>
              <Link href="/" className="hover:text-slate-600 transition-colors">Privacy</Link>
              <Link href="/" className="hover:text-slate-600 transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            Developed by <span className="text-slate-400">Softsols Pakistan</span>
          </p>
        </div>
      </div>
    </div>
  );
}
