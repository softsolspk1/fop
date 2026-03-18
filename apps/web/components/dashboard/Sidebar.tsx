"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Video, 
  Settings, 
  LogOut,
  Building2,
  Calendar,
  Beaker,
  CheckCircle,
  UserPlus,
  BarChart,
  CreditCard,
  ClipboardList,
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Building2, label: 'Departments', href: '/dashboard/departments', roles: ['SUPER_ADMIN'] },
  { icon: Users, label: 'User Management', href: '/dashboard/users', roles: ['SUPER_ADMIN', 'DEPT_ADMIN'] },
  { icon: UserPlus, label: 'Enrollments', href: '/dashboard/enrollments', roles: ['SUPER_ADMIN', 'DEPT_ADMIN'] },
  { icon: BookOpen, label: 'Course Catalog', href: '/dashboard/courses', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: MessageSquare, label: 'Live Chat', href: '/dashboard/chat', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Sparkles, label: 'AI Pharma-Tutor', href: '/dashboard/tutor', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Video, label: 'Live Classes', href: '/dashboard/classes', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Beaker, label: 'Virtual Lab', href: '/dashboard/labs', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: BarChart, label: 'Academic Reports', href: '/dashboard/reports', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: CreditCard, label: 'Fee Management', href: '/dashboard/fees', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'STUDENT'] },
  { icon: ClipboardList, label: 'Examination', href: '/dashboard/exams', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: FileText, label: 'Results', href: '/dashboard/results', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Users, label: 'Faculty', href: '/dashboard/faculty', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Calendar, label: 'Time Table', href: '/dashboard/calendar', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-72 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl italic">K</span>
          </div>
          <div>
            <h1 className="font-black text-slate-800 tracking-tight leading-none text-xl uppercase">FOP UOK</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Faculty of Pharmacy & Pharmaceutical Sciences</p>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`text-sm font-black tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-50">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black tracking-tight">System Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
