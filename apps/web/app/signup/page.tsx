'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Hash, BookOpen, Clock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    shift: 'MORNING',
    year: '1st Year',
    rollNumber: '',
    enrollmentNumber: '',
    phoneNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/register', formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
               <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Faculty of Pharmacy and Pharmaceutical Sciences UOK
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Student Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Shift</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all"
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                  >
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                  </select>
                </div>
              </div>

              {/* Class/Year */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Class / Academic Year</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Roll Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. 23-PHA-124"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Enrollment Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. UOK-EN-2023-144"
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({...formData, enrollmentNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="+92 XXX XXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="ali@student.uok.edu.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-900/10 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Register as Student
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-bold underline underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
