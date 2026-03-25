"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { 
  Users, Building2, BookOpen, Video, ArrowUpRight, ArrowDownRight, 
  Clock, GraduationCap, ClipboardList, Zap, Bell, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);

  const [activeClasses, setActiveClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeRes = await api.get('/classes/active');
        setActiveClasses(activeRes.data);

        if (user?.role === 'SUPER_ADMIN' || user?.role === 'DEPT_ADMIN') {
          const { data } = await api.get('/reports/dashboard-stats/stats');
          setDashboardStats(data);
        } else if (user?.role === 'STUDENT') {
          const coursesRes = await api.get('/courses');
          setStudentCourses(coursesRes.data);
          setDashboardStats({
            totalCourses: coursesRes.data.length,
            completedAssignments: 12,
            upcomingQuizzes: 2,
            gpa: '3.8'
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (user?.role === 'STUDENT') {
    return (
      <DashboardLayout>
        <div className="space-y-10 pb-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Assalam-o-Alaikum, {user.name}</h2>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-tighter text-sm">Welcome to your Academic Portal • {user.rollNumber}</p>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                  <Bell className="w-6 h-6" />
               </button>
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
                  {user.name.charAt(0)}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard label="Enrolled Courses" value={dashboardStats?.totalCourses || 0} icon={BookOpen} color="text-blue-600" bg="bg-blue-50" />
             <StatCard label="Assignments" value={dashboardStats?.completedAssignments || 0} icon={ClipboardList} color="text-green-600" bg="bg-green-50" />
             <StatCard label="Upcoming Quizzes" value={dashboardStats?.upcomingQuizzes || 0} icon={Zap} color="text-purple-600" bg="bg-purple-50" />
             <StatCard label="Sessional GPA" value={dashboardStats?.gpa || '0.0'} icon={GraduationCap} color="text-orange-600" bg="bg-orange-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Courses</h3>
                  <Link href="/dashboard/courses" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View Catalogue</Link>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {studentCourses.map((course, idx) => (
                    <motion.div 
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-6 bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            <BookOpen className="w-8 h-8" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase tracking-widest">{course.code}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{course.semesterName}</span>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">{course.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">Instructor: {course.teacher?.name}</p>
                         </div>
                      </div>
                      <Link href="/dashboard/courses" className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                         <ArrowUpRight className="w-6 h-6" />
                      </Link>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Upcoming Deadlines</h3>
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10" />
                  <div className="space-y-6 relative z-10">
                     <DeadlineItem title="Pharmacology Quiz" date="Tomorrow, 10:00 AM" type="QUIZ" />
                     <DeadlineItem title="Organic Chemistry Lab" date="Friday, 2:00 PM" type="ASSIGNMENT" />
                     <DeadlineItem title="Biochemistry Prep" date="Monday, 9:00 AM" type="EXAM" />
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase text-[10px] tracking-[0.2em] relative z-10">View Schedule</button>
               </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback to original Admin Dashboard view if not student
  const displayStats = [
    { label: 'Total Students', value: loading ? '...' : dashboardStats?.students || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Departments', value: loading ? '...' : dashboardStats?.departments || '0', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Active Courses', value: loading ? '...' : dashboardStats?.courses || '0', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Virtual Labs', value: loading ? '...' : dashboardStats?.labs || '0', icon: Video, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h2>
          <p className="text-slate-500 font-bold uppercase tracking-tighter text-xs mt-1">Pharmacy Academic Management Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Class Activity</h3>
              <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest border-b-2 border-blue-600 pb-1">Historical Logs</button>
            </div>
            <div className="space-y-6">
              {activeClasses.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-50 rounded-[2rem]">
                   No sessions currently active
                </div>
              ) : (
                activeClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-4 p-5 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default group">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800">{cls.title}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter flex items-center gap-2">
                         <Clock className="w-3 h-3 text-blue-600" /> Live Session • {cls.course?.teacher?.name}
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/courses/${cls.courseId}/live?classId=${cls.id}`}
                      className="px-6 py-2.5 bg-slate-800 text-white text-[10px] font-black rounded-xl shadow-lg shadow-slate-200 uppercase tracking-widest hover:bg-slate-900 transition-all"
                    >
                      {user?.role === 'STUDENT' ? 'Join' : 'Monitor'}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">System Tools</h3>
            <div className="grid grid-cols-1 gap-4">
              <QuickActionButton icon={Building2} label="Departments" color="bg-blue-50 text-blue-700" />
              <QuickActionButton icon={Users} label="User Directory" color="bg-purple-50 text-purple-700" />
              <QuickActionButton icon={BookOpen} label="Course Builder" color="bg-orange-50 text-orange-700" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all group"
    >
      <div className={`p-4 rounded-3xl mb-4 inline-block ${bg} ${color} transition-all group-hover:scale-110`}>
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-1">{value}</h3>
    </motion.div>
  );
}

function DeadlineItem({ title, date, type }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'QUIZ' ? 'bg-purple-600/30' : type === 'EXAM' ? 'bg-red-600/30' : 'bg-blue-600/30'}`}>
         {type === 'QUIZ' ? <Zap className="w-5 h-5" /> : type === 'EXAM' ? <GraduationCap className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
      </div>
      <div>
         <p className="font-black text-sm tracking-tight">{title}</p>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, color }: any) {
  return (
    <button className={`flex items-center gap-4 p-5 ${color} rounded-[1.5rem] hover:opacity-80 transition-all font-black text-xs uppercase tracking-widest group shadow-sm`}>
      <div className="p-3 bg-white/50 rounded-xl group-hover:scale-110 transition-all">
        <Icon className="w-5 h-5" />
      </div>
      {label}
    </button>
  );
}
