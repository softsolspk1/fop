'use client';

import React from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Award, BookOpen, Clock, Download, Printer, ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const mockReport = {
  student: {
    name: 'Ali Khan',
    rollNumber: '23-PHA-124',
    department: 'Department of Pharmacology',
    year: '3rd Year',
    shift: 'MORNING'
  },
  courses: [
    { code: 'PHM-301', name: 'Advanced Pharmacology I', grade: 88, attendance: 95, status: 'EXCELLENT' },
    { code: 'PHM-305', name: 'Clinical Pharmacy', grade: 92, attendance: 92, status: 'OUTSTANDING' },
    { code: 'PHM-308', name: 'Pharmaceutics II', grade: 84, attendance: 88, status: 'GOOD' },
    { code: 'PHM-312', name: 'Pharmacognosy', grade: 79, attendance: 98, status: 'STABLE' },
  ]
};

export default function AcademicReportPage() {
  const gpa = (mockReport.courses.reduce((acc, c) => acc + (c.grade / 25), 0) / mockReport.courses.length).toFixed(2);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/student" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
             </Link>
             <div>
                <h2 className="text-2xl font-bold text-slate-800">Academic Progress Report</h2>
                <p className="text-slate-500">Semester: Spring 2026</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Printer className="w-4 h-4" />
                Print Transcript
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                <Download className="w-5 h-5" />
                Download PDF
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20 rotate-12" />
                <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Cumulative GPA</p>
                <h3 className="text-5xl font-black">{gpa}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                    <Award className="w-4 h-4" />
                    Top 5% of Class
                </div>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Student Name</p>
                        <p className="text-lg font-bold text-slate-800">{mockReport.student.name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Roll Number</p>
                        <p className="text-lg font-bold text-slate-800">{mockReport.student.rollNumber}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                        <p className="text-sm font-bold text-slate-800">{mockReport.student.department}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Shift / Year</p>
                        <p className="text-sm font-bold text-slate-800">{mockReport.student.shift} • {mockReport.student.year}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Course Performance
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left order-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Course Code / Name</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Avg. Grade</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Attendance</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Insight</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockReport.courses.map((course, idx) => (
                            <tr key={course.code} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">{course.code}</p>
                                            <p className="font-bold text-slate-800">{course.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="inline-flex flex-col items-center">
                                        <span className="text-xl font-black text-slate-900">{course.grade}%</span>
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.grade}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                        course.attendance >= 90 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {course.attendance}% Present
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className="text-xs font-black text-slate-400 italic">
                                        {course.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
