"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Building2, 
  BookOpen, 
  Calendar,
  Loader2,
  User,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    departmentId: '',
    courseId: '',
    classId: '',
    status: '',
    search: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsRes, coursesRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses')
      ]);
      setDepartments(deptsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error('Initial fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = useCallback(async () => {
    try {
      setFetchingRecords(true);
      const query = new URLSearchParams();
      if (filters.departmentId) query.append('departmentId', filters.departmentId);
      if (filters.courseId) query.append('courseId', filters.courseId);
      if (filters.classId) query.append('classId', filters.classId);
      if (filters.status) query.append('status', filters.status);
      if (filters.search) query.append('userId', filters.search); // Search by ID or Roll for now

      const res = await api.get(`/attendance?${query.toString()}`);
      setAttendance(res.data);
    } catch (err) {
      console.error('Attendance fetch failed:', err);
    } finally {
      setFetchingRecords(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Derived filtered lists
  const filteredCourses = filters.departmentId 
    ? courses.filter(c => c.departmentId === filters.departmentId)
    : courses;

  const handleDepartmentChange = (id: string) => {
    setFilters(prev => ({ ...prev, departmentId: id, courseId: '', classId: '' }));
  };

  const handleCourseChange = async (id: string) => {
    setFilters(prev => ({ ...prev, courseId: id, classId: '' }));
    if (id) {
       try {
         const res = await api.get(`/classes?courseId=${id}`);
         setClasses(res.data);
       } catch (err) {}
    } else {
       setClasses([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Attendance</h2>
            <p className="text-slate-500 font-medium">Monitor and manage presence across sessions, courses, and departments.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 font-black rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-sm">
                <Download className="w-4 h-4" />
                Export Ledger
             </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2 px-2">
             <Filter className="w-4 h-4 text-blue-600" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Advanced Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(user?.role === 'MAIN_ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={filters.departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all appearance-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={filters.courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all appearance-none"
                >
                  <option value="">All Courses</option>
                  {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session / Class</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={filters.classId}
                  onChange={(e) => setFilters({...filters, classId: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all appearance-none"
                  disabled={!filters.courseId}
                >
                  <option value="">All Sessions</option>
                  {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.title}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
          {fetchingRecords ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Retrieving Presence Data...</p>
             </div>
          ) : attendance.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-6">
                   <CheckCircle2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">No Attendance Records Found</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-8 font-medium italic">Adjust your filters or select a specific course to view detailed presence logs.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student / Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department & Course</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Title</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((record, idx) => (
                    <motion.tr 
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm shrink-0">
                            {record.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{record.user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.user.rollNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{record.class.course.name}</span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{record.class.course.department.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight italic">{record.class.title}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">
                             {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             <Clock className="w-3 h-3" />
                             {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`
                          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest
                          ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            record.status === 'ABSENT' ? 'bg-red-50 text-red-600 border border-red-100' : 
                            'bg-amber-50 text-amber-600 border border-amber-100'}
                        `}>
                           {record.status === 'PRESENT' ? <CheckCircle2 className="w-3 h-3" /> : 
                            record.status === 'ABSENT' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                           {record.status}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
