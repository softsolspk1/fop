'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Hash, BookOpen, ArrowRight, AlertCircle, Loader2, Building2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function GraduateSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    year: 'M.Phil',
    departmentId: '',
    rollNumber: '',
    enrollmentNumber: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        // Filter for specific graduate departments requested
        const requestedDepts = [
          'Department of Pharmaceutics',
          'Department of Pharmacology',
          'Department of Pharmacognosy',
          'Department of Pharmaceutical Chemistry',
          'Department of Pharmacy Practice'
        ];
        const filtered = response.data.filter((d: any) => 
          requestedDepts.some(rd => d.name.toLowerCase().includes(rd.toLowerCase()) || rd.toLowerCase().includes(d.name.toLowerCase()))
        );
        setDepartments(filtered);
        if (filtered.length > 0) {
          setFormData(prev => ({ ...prev, departmentId: filtered[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      } finally {
        setIsLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/register', formData);
      setIsRegistered(true);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Registration Successful!</h2>
          <p className="text-slate-600 font-medium mb-8">Your graduate account request has been submitted for approval.</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-between items-center mb-6">
            <Link href="/signup" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-xs uppercase tracking-widest group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </Link>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
               <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="w-12 h-10" /> {/* Spacer */}
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          Post Graduate Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          M.Phil and Ph.D Program - Pharmacy UOK
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
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Class (Degree Program)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all uppercase font-bold"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  >
                    <option value="M.Phil">M.Phil</option>
                    <option value="Ph.D">Ph.D</option>
                  </select>
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Department</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    disabled={isLoadingDepts}
                  >
                    {isLoadingDepts ? (
                      <option>Loading departments...</option>
                    ) : (
                      departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name.replace('Department of ', '')}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Roll Number / Form Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                    placeholder="e.g. 24-PHA-G-12"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Enrollment Number (Optional)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                    placeholder="e.g. UOK-EN-2024-G-44"
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
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
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
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                    placeholder="name@uok.edu.pk"
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
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || isLoadingDepts}
                className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-900/10 text-base font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-[0.98]'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Register Post Graduate Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-50 pt-8">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
