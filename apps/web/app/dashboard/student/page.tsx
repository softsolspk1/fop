"use client";

import React from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { BookOpen, Video, FileText, Award, Clock, ArrowRight, Play, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

const studentStats = [
  { label: 'Enrolled Courses', value: '6', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Attendance', value: '94%', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'GPA', value: '3.8', icon: Award, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Pending Tasks', value: '3', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
];

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Student Portal</h2>
            <p className="text-slate-500">Welcome back, {user?.name || 'Student'}. You are enrolled in the <span className="text-blue-600 font-bold">{user?.shift || 'Morning'}</span> shift.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all hover:-translate-y-0.5 animate-pulse">
            <Video className="w-5 h-5" />
            Join Active Class
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentStats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className={`p-3 w-fit rounded-xl ${stat.bg} ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Class for Today</h3>
                <span className="text-sm font-bold text-slate-400">March 16, 2026</span>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Advanced Pharmacology I', time: '10:00 AM', status: 'In Progress', type: 'Live' },
                  { title: 'Pharmaceutical Microbiology', time: '12:30 PM', status: 'Scheduled', type: 'Live' },
                  { title: 'Biostatistics', time: '03:00 PM', status: 'Scheduled', type: 'Recorded' },
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${item.status === 'In Progress' ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-50 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'Live' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.time} • {item.type} Session</p>
                      </div>
                    </div>
                    {item.status === 'In Progress' ? (
                      <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Join Now</button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">My Recent Grades</h3>
                <Link href="/dashboard/student/report" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline">Transcript</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { course: 'Pharmacology I', score: '88/100', grade: 'A', remarks: 'Good work on the lab report.' },
                  { course: 'Pharmaceutics II', score: '92/100', grade: 'A+', remarks: 'Excellent understanding of kinetics.' },
                ].map((grade, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{grade.course}</h4>
                      <span className="text-2xl font-black text-blue-600">{grade.grade}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{grade.remarks}</p>
                    <div className="text-sm font-bold text-slate-700 underline underline-offset-2">Score: {grade.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Learning Tasks</h3>
              <div className="space-y-4">
                {[
                  { title: 'Assignment #4', due: 'In 2 days', type: 'Upload' },
                  { title: 'Quiz: Session 12', due: 'Tomorrow', type: 'Quiz' },
                  { title: 'Lab Feedback', due: 'Completed', type: 'Feedback' },
                ].map((task, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{task.type}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${task.due === 'Completed' ? 'text-green-600' : 'text-red-500'}`}>{task.due}</span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/student/assignments" className="w-full mt-6 py-3 border-2 border-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex justify-center items-center">
                View All Assignments
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Google Drive</h3>
                <p className="text-sm text-slate-500 mb-6">Access your study materials directly from your university drive.</p>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                  Access Materials
                </button>
              </div>
              <BookOpen className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-50 group-hover:text-blue-50 transition-colors -rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
