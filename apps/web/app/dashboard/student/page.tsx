"use client";

import React from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { BookOpen, Video, FileText, Award, Clock, ArrowRight, Play, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [activeClasses, setActiveClasses] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, activeRes] = await Promise.all([
          api.get('/courses'),
          api.get('/classes/active')
        ]);
        setCourses(coursesRes.data);
        setActiveClasses(activeRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Student Portal</h2>
            <p className="text-slate-500 font-medium">
              Welcome back, <span className="text-slate-900 font-black">{user?.name}</span>. 
              You are currently enrolled in the <span className="text-blue-600 font-black uppercase">{user?.shift || 'Morning'}</span> shift, <span className="text-purple-600 font-black uppercase">{user?.year || '1st Year'}</span>.
            </p>
          </div>
          {activeClasses.length > 0 ? (
            <div className="flex gap-2">
              {activeClasses.length === 1 ? (
                <Link 
                  href={`/dashboard/courses/${activeClasses[0].courseId}/live?classId=${activeClasses[0].id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all hover:-translate-y-0.5 animate-pulse"
                >
                  <Video className="w-5 h-5" />
                  Join {activeClasses[0].course?.name}
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg animate-pulse">
                  <Video className="w-5 h-5" />
                  {activeClasses.length} Live Classes Active
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl border border-slate-200 cursor-not-allowed">
              <Video className="w-5 h-5" />
              No Live Classes
            </div>
          )}
        </div>

        {activeClasses.length > 0 && (
          <div className="bg-green-50 border border-green-100 p-6 rounded-2xl">
            <h3 className="text-lg font-black text-green-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              Live Now: Active Sessions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeClasses.map((cls) => (
                <div key={cls.id} className="bg-white p-4 rounded-xl border border-green-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{cls.title}</h4>
                    <p className="text-xs text-slate-500">{cls.course?.name}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase mt-2">Prof. {cls.course?.teacher?.name}</p>
                  </div>
                  <Link 
                    href={`/dashboard/courses/${cls.courseId}/live?classId=${cls.id}`}
                    className="mt-4 w-full py-2 bg-green-600 text-white text-center text-xs font-black rounded-lg hover:bg-green-700 transition-all"
                  >
                    JOIN SESSION
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Enrolled Courses', value: loading ? '...' : courses.length.toString(), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Attendance', value: '94%', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
            { label: 'GPA', value: '3.8', icon: Award, color: 'text-orange-600', bg: 'bg-orange-100' },
            { label: 'Pending Tasks', value: '3', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
          ].map((stat, idx) => (
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
                <h3 className="text-xl font-bold text-slate-800">My Assigned Courses</h3>
                <Link href="/dashboard/courses" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">View Catalogue</Link>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading academic records...</div>
                ) : courses.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-medium">No courses assigned yet.</div>
                ) : (
                  courses.slice(0, 4).map((course, idx) => (
                    <div key={course.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{course.name}</h4>
                          <p className="text-sm text-slate-500">{course.code} • {course.teacher?.name}</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/courses`} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  ))
                )}
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
