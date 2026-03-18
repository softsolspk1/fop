"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, BookOpen, User, Clock, MoreVertical, Filter, ArrowRight, Loader2, X, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    departmentId: '',
    teacherId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, deptsRes, usersRes] = await Promise.all([
        api.get('/courses'),
        api.get('/departments'),
        api.get('/users')
      ]);
      setCourses(coursesRes.data);
      setDepartments(deptsRes.data);
      // Filter only teachers or admins for the teacher selection
      setTeachers(usersRes.data.filter((u: any) => u.role === 'TEACHER' || u.role === 'SUPER_ADMIN'));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (course: any = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        code: course.code,
        departmentId: course.departmentId,
        teacherId: course.teacherId
      });
    } else {
      setEditingCourse(null);
      setFormData({ name: '', code: '', departmentId: '', teacherId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving course:', err);
      alert('Failed to save course');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Course Catalog</h2>
            <p className="text-slate-500 font-medium">Manage academic courses, assign instructors, and monitor student enrollment.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Academic Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search courses by name or code..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm font-medium"
                />
              </div>
              <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {courses.map((course, idx) => (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(course)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="mb-6 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{course.code}</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                      Active
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{course.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{course.department?.name}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50 mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black border border-white shadow-sm">
                        {course.teacher?.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 text-xs">{course.teacher?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-bold text-[10px] uppercase tracking-widest">{course.students?.length || 0} Students</span>
                    </div>
                    <button className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-widest hover:gap-2 transition-all">
                      Manage <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingCourse ? 'Edit Course' : 'Create Course'}</h3>
                    <p className="text-sm text-slate-500 font-medium">Configure academic course details.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Advanced Pharmacology I"
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
                    <input 
                      required
                      type="text" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g. PHA-501"
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="" className="text-slate-900">Select Department</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id} value={dept.id} className="text-slate-900">{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Instructor</label>
                    <select 
                      required
                      value={formData.teacherId}
                      onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher: any) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all uppercase text-xs tracking-widest">
                      {editingCourse ? 'Update Course' : 'Launch Course'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
