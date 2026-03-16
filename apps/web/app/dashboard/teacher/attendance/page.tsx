'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { CheckCircle, XCircle, Users, Calendar, Clock, Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Mock student data for the demonstration
const mockStudents = [
  { id: '1', name: 'Ali Khan', rollNumber: '23-PHA-124', status: 'PENDING' },
  { id: '2', name: 'Sana Fatima', rollNumber: '23-PHA-125', status: 'PENDING' },
  { id: '3', name: 'Omar Javed', rollNumber: '23-PHA-126', status: 'PENDING' },
  { id: '4', name: 'Zainab Bibi', rollNumber: '23-PHA-127', status: 'PENDING' },
  { id: '5', name: 'Mustafa Ahmed', rollNumber: '23-PHA-128', status: 'PENDING' },
];

export default function MarkAttendancePage() {
  const [students, setStudents] = useState(mockStudents);
  const [selectedClass, setSelectedClass] = useState('Advanced Pharmacology I');

  const updateStatus = (id: string, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAll = (status: string) => {
    setStudents(students.map(s => ({ ...s, status })));
  };

  const handleSave = () => {
    console.log('Saving Attendance:', students);
    // Add API call here
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/teacher" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
             </Link>
             <div>
                <h2 className="text-2xl font-bold text-slate-800">Attendance Tracker</h2>
                <p className="text-slate-500">Marking attendance for {selectedClass}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => markAll('PRESENT')}
                className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-600 hover:text-white transition-all shadow-sm"
             >
                Mark All Present
             </button>
             <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5"
             >
                <Save className="w-5 h-5" />
                Save Attendance
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="font-bold text-slate-800">March 16, 2026</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Time</p>
                    <p className="font-bold text-slate-800">10:00 AM - 11:30 AM</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registered</p>
                    <p className="font-bold text-slate-800">{students.length} Students</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Student Details</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Roll Number</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 font-bold rounded-full flex items-center justify-center">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-500">{student.rollNumber}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                            student.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 
                            student.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {student.status}
                          </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => updateStatus(student.id, 'PRESENT')}
                            className={`p-2 rounded-lg transition-all ${student.status === 'PRESENT' ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => updateStatus(student.id, 'ABSENT')}
                            className={`p-2 rounded-lg transition-all ${student.status === 'ABSENT' ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
