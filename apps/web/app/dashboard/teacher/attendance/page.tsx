"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { CheckCircle, XCircle, Clock, Save, Loader2, Users, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../lib/api';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  shift: string;
}

interface AttendanceRecord {
  userId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks: string;
}

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        // Filter courses where the user is the teacher
        const myCourses = res.data.filter((c: any) => c.teacherId === user?.id);
        setCourses(myCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      setLoading(true);
      try {
        const res = await api.get(`/courses/${selectedCourse}/students`);
        setStudents(res.data);
        
        // Initialize attendance state
        const initialAttendance: Record<string, AttendanceRecord> = {};
        res.data.forEach((s: Student) => {
          initialAttendance[s.id] = { userId: s.id, status: 'PRESENT', remarks: '' };
        });
        setAttendance(initialAttendance);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedCourse]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      // For now, we use a placeholder classId or allow selection later
      const records = Object.values(attendance);
      await api.post('/attendance/mark', {
        classId: 'manual-entry-' + Date.now(), // Placeholder for now
        records
      });
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to mark attendance. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Attendance Register</h2>
            <p className="text-slate-500">Mark daily attendance for students in your courses.</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={submitting || students.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Submit Register
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Select Course
              </h3>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-bold"
              >
                <option value="" className="text-slate-900">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id} className="text-slate-900">{course.name} ({course.code})</option>
                ))}
              </select>
              {courses.length === 0 && !loading && (
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> No courses assigned to you yet.
                </p>
              )}
            </div>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl border font-bold flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></span>
                  Student List {students.length > 0 && `(${students.length})`}
                </h3>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Loading class list...</p>
                </div>
              ) : !selectedCourse ? (
                <div className="p-12 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Please select a course to view students.</p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 font-medium">No students enrolled in this course.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.rollNumber} • {student.shift}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                            {[
                              { id: 'PRESENT', icon: CheckCircle, color: 'text-green-600', bg: 'bg-white' },
                              { id: 'ABSENT', icon: XCircle, color: 'text-red-600', bg: 'bg-white' },
                              { id: 'LATE', icon: Clock, color: 'text-orange-600', bg: 'bg-white' }
                            ].map((s) => (
                              <button
                                key={s.id}
                                onClick={() => handleStatusChange(student.id, s.id as any)}
                                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-bold ${
                                  attendance[student.id]?.status === s.id 
                                    ? `${s.bg} ${s.color} shadow-sm` 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <s.icon className="w-3.5 h-3.5" />
                                {s.id}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="text"
                            placeholder="Optional remarks..."
                            value={attendance[student.id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            className="w-full bg-transparent text-sm border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-1 transition-all text-slate-900 font-medium"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
