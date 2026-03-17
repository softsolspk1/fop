"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart, Printer, Download, Book, FileText, CheckCircle, TrendingUp, User, Building2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ReportsPage() {
  const { user: currentUser } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchReport(currentUser.id);
    }
  }, [currentUser]);

  const fetchReport = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/academic-reports/${userId}`);
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const printTranscript = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <BarChart className="w-8 h-8 text-blue-600" />
              Academic Performance
            </h2>
            <p className="text-slate-500 font-medium mt-1">Detailed overview of your academic progress and transcript.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={printTranscript}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Transcript
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Transcript Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden print:shadow-none print:border-none print:m-0">
          {/* Header Section */}
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 print:bg-white flex flex-col md:flex-row justify-between gap-8">
             <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                   <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-slate-900 uppercase">OFFICIAL ACADEMIC TRANSCRIPT</h1>
                   <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">University of Karachi - Faculty of Pharmacy</p>
                   <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {report.student.name}</span>
                      <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {report.student.department}</span>
                      <span className="flex items-center gap-1.5"><BarChart className="w-4 h-4" /> Roll: {report.student.rollNumber}</span>
                   </div>
                </div>
             </div>
             
             <div className="text-right flex flex-col justify-center">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cumulative GPA</div>
                <div className="text-6xl font-black text-blue-600 tracking-tighter">{report.overallGPA}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Generated on {new Date().toLocaleDateString()}</div>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50 border-b border-slate-50">
             <div className="p-8 text-center">
                <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Attendance</div>
                <div className="text-3xl font-black text-slate-800">
                   {report.courses.length > 0 ? (report.courses.reduce((a: any, b: any) => a + (b.attendancePercentage || 0), 0) / report.courses.length).toFixed(1) : 0}%
                </div>
             </div>
             <div className="p-8 text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Total Courses</div>
                <div className="text-3xl font-black text-slate-800">{report.courses.length}</div>
             </div>
             <div className="p-8 text-center">
                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Submissions</div>
                <div className="text-3xl font-black text-slate-800">
                   {report.courses.reduce((a: any, b: any) => a + b.submissionsCount, 0)}
                </div>
             </div>
          </div>

          {/* Courses Table */}
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Course Info</th>
                  <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Grade (Avg)</th>
                  <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Quiz (Avg)</th>
                  <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Attendance</th>
                  <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {report.courses.map((course: any) => (
                  <tr key={course.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4">
                       <div className="font-black text-slate-800 uppercase tracking-tight">{course.name}</div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{course.code}</div>
                    </td>
                    <td className="py-6 text-center">
                       <div className="text-lg font-black text-slate-700">{course.averageGrade ? course.averageGrade.toFixed(1) : 'N/A'}</div>
                    </td>
                    <td className="py-6 text-center">
                       <div className="text-lg font-black text-slate-700">{course.averageQuiz ? course.averageQuiz.toFixed(1) : 'N/A'}</div>
                    </td>
                    <td className="py-6 text-center">
                       <div className={`text-sm font-bold ${course.attendancePercentage < 75 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {course.attendancePercentage ? `${course.attendancePercentage.toFixed(1)}%` : '0%'}
                       </div>
                    </td>
                    <td className="py-6 text-right px-4">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          course.averageGrade >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                       }`}>
                          {course.averageGrade >= 50 ? 'Passed' : 'Pending'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-50/30 text-center border-t border-slate-50 no-print">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                This is a computer-generated transcript. Validity can be verified via the Faculty of Pharmacy portal.
             </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .DashboardLayout_main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
