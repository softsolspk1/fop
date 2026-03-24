"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, BookOpen, User, Clock, MoreVertical, Filter, ArrowRight, Loader2, X, Edit2, Trash2, FileText, Video, ShieldCheck } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';

import { useAuth } from '../../../context/AuthContext';

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [viewingCourse, setViewingCourse] = useState<any>(null);
  const [managingMaterials, setManagingMaterials] = useState<any>(null);


  const [searchQuery, setSearchQuery] = useState('');
  const [filterProfessional, setFilterProfessional] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    departmentId: '',
    teacherId: '',
    professional: '',
    semesterName: '',
    creditHours: 0,
    category: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterProfessional) params.professional = filterProfessional;
      if (filterSemester) params.semesterName = filterSemester;
      if (filterDepartment) params.departmentId = filterDepartment;

      const [coursesRes, deptsRes, usersRes] = await Promise.all([
        api.get('/courses', { params }),
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
  }, [filterProfessional, filterSemester, filterDepartment]);

  const handleOpenModal = (course: any = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        code: course.code,
        departmentId: course.departmentId,
        teacherId: course.teacherId,
        professional: course.professional || '',
        semesterName: course.semesterName || '',
        creditHours: course.creditHours || 0,
        category: course.category || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({ name: '', code: '', departmentId: '', teacherId: '', professional: '', semesterName: '', creditHours: 0, category: '' });
    }
    setIsModalOpen(true);
  };
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProf = filterProfessional ? course.professional === filterProfessional : true;
    const matchesSem = filterSemester ? course.semesterName === filterSemester : true;
    const matchesDept = filterDepartment ? course.departmentId === filterDepartment : true;
    return matchesSearch && matchesProf && matchesSem && matchesDept;
  });

  const handleSemesterVisibility = async (semesterName: string, isActive: boolean) => {
    if (!confirm(`Are you sure you want to ${isActive ? 'ACTIVATE' : 'DEACTIVATE'} all courses for ${semesterName}?`)) return;
    try {
      setIsSyncing(true);
      await api.put('/courses/visibility/bulk', { semesterName, isActive });
      await fetchData();
      alert(`Success: ${semesterName} courses are now ${isActive ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      console.error('Error updating visibility:', err);
      const errorDetail = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Failed to update visibility: ${errorDetail}`);
    } finally {
      setIsSyncing(false);
    }
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
          {currentUser?.role !== 'STUDENT' && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Academic Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses by name or code..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm font-medium"
                />
              </div>
              <select 
                value={filterProfessional}
                onChange={(e) => setFilterProfessional(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 shadow-sm"
              >
                <option value="">All Professionals</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
                <option value="Fourth">Fourth</option>
                <option value="Fifth">Fifth</option>
              </select>
              <select 
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 shadow-sm"
              >
                <option value="">All Semesters</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
              </select>
              <select 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 shadow-sm"
              >
                <option value="">All Departments</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name.replace('Department of ', '')}</option>
                ))}
              </select>

              {currentUser?.role === 'SUPER_ADMIN' && (
                <div className="flex gap-2 ml-auto">
                  <button 
                    disabled={isSyncing}
                    onClick={() => handleSemesterVisibility('1st Semester', true)}
                    className="px-4 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
                  >
                    Activate 1st Sem
                  </button>
                  <button 
                    disabled={isSyncing}
                    onClick={() => handleSemesterVisibility('2nd Semester', true)}
                    className="px-4 py-3 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border-b-4 border-teal-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
                  >
                    Activate 2nd Sem
                  </button>
                  <button 
                    disabled={isSyncing}
                    onClick={async () => {
                      if(!confirm('Deactivate ALL courses? Students will not see anything until you activate a semester.')) return;
                      setIsSyncing(true);
                      await Promise.all([
                        api.put('/courses/visibility/bulk', { semesterName: '1st Semester', isActive: false }),
                        api.put('/courses/visibility/bulk', { semesterName: '2nd Semester', isActive: false })
                      ]);
                      await fetchData();
                      setIsSyncing(false);
                    }}
                    className="px-4 py-3 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                  >
                    Disable All
                  </button>
                </div>
              )}
            </div>

            {filteredCourses.map((course, idx) => (
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
                  {currentUser?.role !== 'STUDENT' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(course)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                
                <div className="mb-6 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{course.code}</span>
                    <span className={`px-3 py-1 ${course.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'} rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{course.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {course.professional && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold">{course.professional} Prof</span>}
                    {course.semesterName && <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-[10px] font-bold">{course.semesterName}</span>}
                    {course.creditHours && <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold">Cr: {course.creditHours}</span>}
                    {course.category && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold">{course.category}</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-3">{course.department?.name}</p>
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
                        <span className="font-bold text-[10px] uppercase tracking-widest">{course._count?.students || 0} Students</span>
                      </div>
                    <div className="flex gap-2">
                      {currentUser?.role !== 'STUDENT' && (
                        <button 
                          onClick={() => setManagingMaterials(course)}
                          className="flex items-center gap-1 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all border border-slate-200 px-3 py-1.5 rounded-lg"
                        >
                          Materials
                        </button>
                      )}
                      <button 
                        onClick={() => setViewingCourse(course)}
                        className="flex items-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:gap-2 transition-all"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Material Management Modal */}
        <AnimatePresence>
          {managingMaterials && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setManagingMaterials(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Manage Materials</h3>
                    <p className="text-sm text-slate-500 font-medium">Add/Remove resources for {managingMaterials.name}</p>
                  </div>
                  <button onClick={() => setManagingMaterials(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Add Material Form */}
                  <div className="p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/80 space-y-6 shadow-inner">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-blue-600 rounded-lg text-white">
                          <Plus className="w-4 h-4" />
                       </div>
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Add New Resource</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Midterm Lecture Notes"
                          id="mat-title"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Type</label>
                        <select id="mat-type" className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm">
                          <option value="PDF">PDF Document</option>
                          <option value="VIDEO">Uploaded Video</option>
                          <option value="YOUTUBE">YouTube Link</option>
                          <option value="IMAGE">Image / Diagram</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL / Resource Link</label>
                        <input 
                          type="text" 
                          placeholder="https://..."
                          id="mat-url"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2 pt-2">
                        <button 
                          onClick={async () => {
                            const title = (document.getElementById('mat-title') as HTMLInputElement).value;
                            const type = (document.getElementById('mat-type') as HTMLSelectElement).value;
                            const url = (document.getElementById('mat-url') as HTMLInputElement).value;
                            if (!title || !url) return alert('Please fill all fields');
                            try {
                              await api.post('/lms/materials', { title, type, url, courseId: managingMaterials.id });
                              alert('Material submitted for HOD approval');
                              (document.getElementById('mat-title') as HTMLInputElement).value = '';
                              (document.getElementById('mat-url') as HTMLInputElement).value = '';
                              setManagingMaterials({...managingMaterials}); 
                            } catch (err) { alert('Error uploading material'); }
                          }}
                          className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-xs tracking-[0.2em] border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                          Submit for HOD Approval
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Materials List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Existing Resources</h4>
                    {(managingMaterials.materials || []).length === 0 ? (
                      <p className="text-center py-6 text-slate-400 font-bold text-sm">No materials added yet.</p>
                    ) : (
                      managingMaterials.materials.map((mat: any) => (
                        <div key={mat.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{mat.title}</p>
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${mat.status === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>{mat.status}</span>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              if (!confirm('Delete this material?')) return;
                              await api.delete(`/lms/materials/${mat.id}`);
                              setManagingMaterials({...managingMaterials});
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


        {/* View Details Modal */}
        <AnimatePresence>
          {viewingCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setViewingCourse(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{viewingCourse.code}</span>
                       <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{viewingCourse.professional} Prof</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{viewingCourse.name}</h3>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-tighter text-xs">{viewingCourse.department?.name}</p>
                  </div>
                  <button onClick={() => setViewingCourse(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400">
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                   {viewingCourse.outcomes && (
                     <section>
                       <h4 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-600 rounded-full" />
                         Learning Outcomes
                       </h4>
                       <div className="prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-line bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                          {viewingCourse.outcomes}
                       </div>
                     </section>
                   )}

                   {viewingCourse.contents && (
                     <section>
                       <h4 className="text-sm font-black text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <div className="w-2 h-2 bg-orange-600 rounded-full" />
                         Course Contents
                       </h4>
                       <div className="prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-line bg-orange-50/30 p-6 rounded-3xl border border-orange-100/30">
                          {viewingCourse.contents}
                       </div>
                     </section>
                   )}

                   {viewingCourse.readings && (
                     <section>
                       <h4 className="text-sm font-black text-purple-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <div className="w-2 h-2 bg-purple-600 rounded-full" />
                         Recommended Readings
                       </h4>
                       <div className="prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-line bg-purple-50/30 p-6 rounded-3xl border border-purple-100/30">
                          {viewingCourse.readings}
                       </div>
                     </section>
                   )}

                    {/* Approved Materials Gallery */}
                    <section>
                      <h4 className="text-sm font-black text-green-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        Course Resources & Materials
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(viewingCourse.materials || []).filter((m: any) => m.status === 'APPROVED').length === 0 ? (
                          <div className="col-span-full p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No verified materials available yet.</p>
                          </div>
                        ) : (
                          viewingCourse.materials.filter((m: any) => m.status === 'APPROVED').map((mat: any) => (
                            <a 
                              key={mat.id} 
                              href={mat.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-green-200 hover:shadow-lg hover:shadow-green-100/20 transition-all group"
                            >
                              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all">
                                 {mat.type === 'VIDEO' || mat.type === 'YOUTUBE' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-black text-slate-800 text-sm truncate">{mat.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mat.type}</span>
                                   <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                   <span className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Verified
                                   </span>
                                </div>
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Info</p>
                          <div className="space-y-2">
                            <div className="flex justify-between font-bold text-sm">
                              <span className="text-slate-500">Credit Hours:</span>
                              <span className="text-slate-800">{viewingCourse.creditHours}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm">
                              <span className="text-slate-500">Semester:</span>
                              <span className="text-slate-800">{viewingCourse.semesterName}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm">
                              <span className="text-slate-500">Category:</span>
                              <span className="text-slate-800">{viewingCourse.category}</span>
                            </div>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Faculty</p>
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                                {viewingCourse.teacher?.name?.charAt(0)}
                             </div>
                             <div>
                                <p className="font-bold text-slate-800">{viewingCourse.teacher?.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{viewingCourse.teacher?.designation || 'Faculty Member'}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                   <button 
                     onClick={() => setViewingCourse(null)}
                     className="px-8 py-3 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 transition-all text-xs tracking-widest uppercase"
                   >
                     Close View
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Advanced Pharmacology I"
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
                    <input 
                      required
                      type="text" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g. PHA-501"
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                    >
                      <option value="" className="text-slate-900">Select Department</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id} value={dept.id} className="text-slate-900">{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Instructor</label>
                    <select 
                      required
                      value={formData.teacherId}
                      onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                    >
                      <option value="" className="text-slate-900">Select Teacher</option>
                      {teachers.map((teacher: any) => (
                        <option key={teacher.id} value={teacher.id} className="text-slate-900">{teacher.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional</label>
                      <select 
                        value={formData.professional}
                        onChange={(e) => setFormData({...formData, professional: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      >
                        <option value="">Select</option>
                        <option value="First">First</option>
                        <option value="Second">Second</option>
                        <option value="Third">Third</option>
                        <option value="Fourth">Fourth</option>
                        <option value="Fifth">Fifth</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                      <select 
                        value={formData.semesterName}
                        onChange={(e) => setFormData({...formData, semesterName: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      >
                        <option value="">Select</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                      </select>
                    </div>
                  </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credit Hours</label>
                        <input 
                          type="number" 
                          step="0.5"
                          value={formData.creditHours}
                          onChange={(e) => setFormData({...formData, creditHours: parseFloat(e.target.value) || 0})}
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <input 
                          type="text" 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="e.g. Core"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                      </div>
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
