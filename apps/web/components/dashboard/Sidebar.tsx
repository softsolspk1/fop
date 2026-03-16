import React from 'react';
import Link from 'next/link';
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
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Building2, label: 'Departments', href: '/dashboard/departments', roles: ['SUPER_ADMIN'] },
  { icon: Users, label: 'Users', href: '/dashboard/users', roles: ['SUPER_ADMIN'] },
  { icon: Calendar, label: 'Semesters', href: '/dashboard/semesters', roles: ['SUPER_ADMIN'] },
  { icon: CheckCircle, label: 'Attendance', href: '/dashboard/teacher/attendance', roles: ['TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
  { icon: FileText, label: 'Assignments', href: '/dashboard/teacher/assignments', roles: ['TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
  { icon: BookOpen, label: 'Courses', href: '/dashboard/courses', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: FileText, label: 'Research Library', href: '/dashboard/library', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Beaker, label: 'Virtual Labs', href: '/dashboard/labs', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden">
             <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 leading-tight">Faculty of</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pharmacy UOK</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.label === 'Dashboard' && user?.role === 'STUDENT' ? '/dashboard/student' : 
                      item.label === 'Dashboard' && user?.role === 'TEACHER' ? '/dashboard/teacher' : 
                      item.href}
                className="flex items-center gap-3 px-4 py-3 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
