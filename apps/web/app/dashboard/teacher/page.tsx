"use client";

import React from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { BookOpen, Video, FileText, Users, Clock, Plus, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

const teacherStats = [
  { label: 'My Courses', value: '4', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Total Students', value: '320', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Class Hours', value: '18h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Pending Grades', value: '12', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lecturer Dashboard</h2>
            <p className="text-slate-500">Welcome back, {user?.name || 'Professor'}. Here's your teaching schedule for today.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5">
            <Video className="w-5 h-5" />
            Start Live Class
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teacherStats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
                <h3 className="text-xl font-bold text-slate-800">Upcoming Lectures</h3>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Full Schedule</button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Advanced Pharmacology I', time: '10:00 AM - 11:30 AM', room: 'Virtual Room 4', status: 'Live Soon' },
                  { title: 'Clinical Pharmacy Practices', time: '02:00 PM - 03:30 PM', room: 'Virtual Room 1', status: 'Upcoming' },
                ].map((lecture, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <span className="text-xs uppercase">Mar</span>
                        <span className="text-xl">16</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{lecture.title}</h4>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {lecture.time} • {lecture.room}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                      <Play className="w-4 h-4 fill-current" />
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Recent Submissions</h3>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
              </div>
              <div className="space-y-4">
                {[
                  { student: 'Ali Khan', course: 'Pharmacology I', assignment: 'Lab Report 4', date: '2 hours ago' },
                  { student: 'Sana Fatima', course: 'Clinical Pharmacy', assignment: 'Case Study A', date: '5 hours ago' },
                ].map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {sub.student.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{sub.student}</p>
                        <p className="text-xs text-slate-500">{sub.course} • {sub.assignment}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">{sub.date}</p>
                      <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">Grade Now <ArrowRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Quick Resources</h3>
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center gap-4 p-5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all group">
                  <Plus className="w-6 h-6" />
                  <span className="font-bold">Upload Lecture Note</span>
                </button>
                <Link href="/dashboard/teacher/assignments" className="flex items-center gap-4 p-5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-600 hover:text-white transition-all group w-full">
                  <FileText className="w-6 h-6" />
                  <span className="font-bold">Create Assignment</span>
                </Link>
                <Link href="/dashboard/teacher/attendance" className="flex items-center gap-4 p-5 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-600 hover:text-white transition-all group w-full">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold">Mark Attendance</span>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">Agora Integration</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Your live class token is ready. Ensure your camera and microphone are tested before starting the session.
              </p>
              <button className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-md">
                Test Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
