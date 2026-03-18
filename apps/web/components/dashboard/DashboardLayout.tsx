"use client";

import React from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-72">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for courses, students, or reports..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{user?.role?.replace('_', ' ') || 'Profile'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                {user?.name?.charAt(0) || <User className="w-5 h-5" />}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-12 py-6 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest no-print">
            <p>© 2026 Faculty of Pharmacy, University of Karachi</p>
            <p>Developed by <span className="text-blue-600">Softsols Pakistan</span></p>
          </footer>
        </main>
      </div>
    </div>
  );
}
