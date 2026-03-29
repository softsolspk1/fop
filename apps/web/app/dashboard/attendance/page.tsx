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
import { formatDatePKT, formatTimePKT } from '../../../lib/date-utils';

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

  const handleExport = () => {
    if (attendance.length === 0) return alert('No data to export');
    
    // CSV Header row
    const headers = ['Student Name', 'Roll Number', 'Department', 'Course', 'Session', 'Date', 'Status'];
    
    // Data rows
    const rows = attendance.map(record => [
       `"${record.user.name}"`,
       `"${record.user.rollNumber || 'N/A'}"`,
       `"${record.class.course.department.name}"`,
       `"${record.class.course.name}"`,
       `"${record.class.title}"`,
       `"${new Date(record.createdAt).toLocaleDateString()}"`,
       `"${record.status}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'PRESENT').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
    percentage: attendance.length > 0 ? (attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length / attendance.length * 100).toFixed(1) : '0'
  };

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
             <button 
               onClick={handleExport}
               disabled={attendance.length === 0}
               className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 font-black rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Download className="w-4 h-4" />
                Export Ledger
             </button>
          </div>
        </div>

        {/* Stats Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <User className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</p>
                <h4 className="text-xl font-black text-slate-800">{stats.total}</h4>
             </div>
          </div>
          <div className="p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</p>
                <h4 className="text-xl font-black text-slate-800">{stats.present}</h4>
             </div>
          </div>
          <div className="p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
             <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                <XCircle className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</p>
                <h4 className="text-xl font-black text-slate-800">{stats.absent}</h4>
             </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-xl shadow-blue-200 flex items-center gap-4 text-white transform hover:scale-[1.02] transition-all">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Pres. Rate</p>
                <h4 className="text-xl font-black">{stats.percentage}%</h4>
             </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2 px-2">
             <Filter className="w-4 h-4 text-blue-600" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Advanced Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(user?.role === 'MAIN_ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-500">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={filters.departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                  >
                    <option value="" className="text-slate-900">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-500">Course</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={filters.courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                >
                  <option value="" className="text-slate-900">All Courses</option>
                  {filteredCourses.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-500">Session / Class</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={filters.classId}
                  onChange={(e) => setFilters({...filters, classId: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                  disabled={!filters.courseId}
                >
                  <option value="" className="text-slate-900">All Sessions</option>
                  {classes.map(cl => <option key={cl.id} value={cl.id} className="text-slate-900">{cl.title}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-500">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
              >
                <option value="" className="text-slate-900">All Statuses</option>
                <option value="PRESENT" className="text-slate-900">Present</option>
                <option value="ABSENT" className="text-slate-900">Absent</option>
                <option value="LATE" className="text-slate-900">Late</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden min-h-[400px]">
          {fetchingRecords ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Retrieving Presence Data...</p>
             </div>
          ) : attendance.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center justify-center mb-6">
                   <CheckCircle2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 uppercase">No Presence Logs</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-8 font-medium italic">Adjust your filters or select a specific course to view detailed presence logs.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student / Identity</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Department & Course</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Title</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date / Time</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((record, idx) => (
                    <motion.tr 
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center font-black border-2 border-white shadow-sm shrink-0">
                            {record.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{record.user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.user.rollNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800">{record.class.course.name}</span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{record.class.course.department.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tighter italic">{record.class.title}</span>
                         </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                             {formatDatePKT(record.createdAt)}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             <Clock className="w-3 h-3 text-blue-400" />
                             {formatTimePKT(record.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
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
