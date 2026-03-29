"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { 
  Plus, Search, BookOpen, User, Clock, MoreVertical, Filter, ArrowRight, 
  Loader2, X, Edit2, Trash2, FileText, Video as VideoIcon, ShieldCheck, 
  Video, Upload, Trash, ClipboardList, Zap, CheckCircle, GraduationCap,
  LayoutGrid, List, ExternalLink, Lock, Download, Calendar
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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
  const [activeManagementTab, setActiveManagementTab] = useState<'MATERIALS' | 'ASSIGNMENTS' | 'QUIZZES' | 'HISTORY'>('MATERIALS');
  const [newQuizQuestions, setNewQuizQuestions] = useState<any[]>([]);
  const [viewingCourseTab, setViewingCourseTab] = useState<'DETAILS' | 'LIVE' | 'MATERIALS' | 'ASSIGNMENTS' | 'QUIZZES'>('DETAILS');
  const [submittingAssignment, setSubmittingAssignment] = useState<any>(null);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [activeClasses, setActiveClasses] = useState<any[]>([]);
  const [quizTimer, setQuizTimer] = useState(0);
  const [selectedMaterialType, setSelectedMaterialType] = useState('DOCUMENT');
  const [viewingSubmissions, setViewingSubmissions] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);


  const [searchQuery, setSearchQuery] = useState('');
  const [filterProfessional, setFilterProfessional] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [assigningTeacherCourse, setAssigningTeacherCourse] = useState<any>(null);

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

      const [coursesRes, deptsRes, usersRes, activeRes] = await Promise.all([
        api.get('/courses', { params }),
        api.get('/departments'),
        api.get('/users'),
        api.get('/classes/active')
      ]);
      setCourses(coursesRes.data);
      setDepartments(deptsRes.data);
      setActiveClasses(activeRes.data);
      // Filter only teachers or admins for the teacher selection
      let availableTeachers = usersRes.data.filter((u: any) => ['FACULTY', 'HOD', 'SUPER_ADMIN', 'MAIN_ADMIN', 'SUB_ADMIN'].includes(u.role));
      if (currentUser?.role === 'HOD') {
        availableTeachers = availableTeachers.filter((u: any) => u.departmentId === currentUser.departmentId);
      }
      setTeachers(availableTeachers);
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
      setFormData({ 
        name: '', 
        code: '', 
        departmentId: currentUser?.role === 'HOD' ? (currentUser.departmentId || '') : '', 
        teacherId: '', 
        professional: '', 
        semesterName: '', 
        creditHours: 0, 
        category: '' 
      });
    }
    setIsModalOpen(true);
  };
  
  const filteredCourses = courses.filter(course => {
    const searchLow = searchQuery.toLowerCase();
    const nameMatch = course.name?.toLowerCase().includes(searchLow) ?? false;
    const codeMatch = course.code?.toLowerCase().includes(searchLow) ?? false;
    const matchesSearch = nameMatch || codeMatch;
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

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTeacherCourse) return;
    try {
      await api.put(`/courses/${assigningTeacherCourse.id}`, {
        teacherId: formData.teacherId
      });
      setAssigningTeacherCourse(null);
      fetchData();
      toast.success('Teacher assigned successfully');
    } catch (err) {
      console.error('Error assigning teacher:', err);
      alert('Failed to assign teacher');
    }
  };

  const handleToggleActive = async (course: any) => {
    try {
      const updatedStatus = !course.isActive;
      await api.put(`/courses/${course.id}`, { ...course, isActive: updatedStatus });
      toast?.success(`Course ${updatedStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (err) {
      console.error('Error toggling course status:', err);
      alert('Failed to update course status');
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
 
  const handleStartQuiz = async (quiz: any) => {
    try {
       const res = await api.get(`/quizzes/${quiz.id}`);
       if (res.data.alreadyAttempted) return alert('You have already attempted this quiz.');
       setQuizQuestions(res.data.questions);
       setActiveQuiz(quiz);
       setCurrentQuestionIndex(0);
       setQuizAnswers({});
       setQuizTimer(quiz.timeLimit * 60);
    } catch (err) { alert('Error starting quiz'); }
  };
 
  useEffect(() => {
    if (activeQuiz && quizTimer > 0) {
      const timer = setInterval(() => setQuizTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (activeQuiz && quizTimer === 0) {
       // Auto-submit quiz
       alert('Time is up! Your quiz will be submitted automatically.');
       // handleQuizSubmit(); // To be implemented
    }
  }, [activeQuiz, quizTimer]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!viewingCourse || viewingCourse.materials) return;
      try {
        const res = await api.get(`/courses/${viewingCourse.id}`);
        setViewingCourse(res.data);
      } catch (err) {
        console.error('Error fetching course details:', err);
      }
    };
    fetchCourseDetails();
  }, [viewingCourse?.id]);

  // Auto-Start effect for Scheduled Lectures
  useEffect(() => {
    if (!viewingCourse?.materials) return;
    
    const checkScheduled = () => {
      const now = new Date();
      viewingCourse.materials.forEach((mat: any) => {
        if (mat.isScheduled && mat.status === 'APPROVED' && mat.type === 'SCHEDULED_LECTURE') {
          const scheduledDate = new Date(mat.scheduledAt);
          // If scheduled time is reached within the last 10 seconds (to avoid spamming)
          const diff = now.getTime() - scheduledDate.getTime();
          if (diff >= 0 && diff < 10000) {
            toast.success(`Lecture Starting: ${mat.title}`, { duration: 10000 });
            window.open(mat.url, '_blank');
          }
        }
      });
    };

    const interval = setInterval(checkScheduled, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [viewingCourse?.materials]);

  const parseToItems = (text: string) => {
    if (!text) return [];
    // Collapse whitespace but keep it readable
    let collapsed = text.replace(/\s+/g, ' ');
    const items = collapsed.split(/\s*(?=\d+\.\s)/).map(i => i.trim()).filter(i => i !== '');
    return items.filter(i => {
      const clean = i.replace(/^\d+\.\s*/, '').trim();
      // More aggressive filtering: must have at least 5 meaningful characters
      return clean.length > 5 && !/^\d+$/.test(clean);
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Course Catalog</h2>
            <p className="text-slate-500 font-medium">Manage academic courses, assign instructors, and monitor student enrollment.</p>
          </div>
          {['MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'].includes(currentUser?.role || '') && (
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
                  {['MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'].includes(currentUser?.role || '') && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setAssigningTeacherCourse(course);
                          setFormData(prev => ({ ...prev, teacherId: course.teacherId }));
                        }} 
                        className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                        title="Assign Teacher"
                      >
                        <User className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenModal(course)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                
                <div className="mb-6 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{course.code}</span>
                    <button 
                      onClick={() => (['MAIN_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'HOD'].includes(currentUser?.role || '')) && handleToggleActive(course)}
                      disabled={!['MAIN_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'HOD'].includes(currentUser?.role || '')}
                      className={`px-3 py-1 ${course.isActive ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'} rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors cursor-pointer disabled:cursor-default`}
                    >
                      {course.isActive ? 'Active' : 'Inactive'}
                    </button>
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

                <div className="flex border-b border-slate-100 bg-slate-50/30">
                  <button 
                    onClick={() => setActiveManagementTab('MATERIALS')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'MATERIALS' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Resources
                  </button>
                  <button 
                    onClick={() => setActiveManagementTab('ASSIGNMENTS')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'ASSIGNMENTS' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Assignments
                  </button>
                   <button 
                     onClick={() => setActiveManagementTab('QUIZZES')}
                     className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'QUIZZES' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Quizzes & Exams
                   </button>
                   <button 
                     onClick={() => setActiveManagementTab('HISTORY')}
                     className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'HISTORY' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     History
                   </button>
                 </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {activeManagementTab === 'MATERIALS' && (
                    <>
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
                        <select 
                          id="mat-type" 
                          value={selectedMaterialType}
                          onChange={(e) => setSelectedMaterialType(e.target.value)}
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        >
                          <option value="DOCUMENT">Document (PDF)</option>
                          <option value="WORD">Word Document (DOC/DOCX)</option>
                          <option value="PPT">PowerPoint (PPTX)</option>
                          <option value="IMAGE">Image / Diagram</option>
                          <option value="VIDEO">Video (Google Drive Link)</option>
                          <option value="SCHEDULED_LECTURE">Scheduled Lecture (Auto-Play)</option>
                          <option value="YOUTUBE">YouTube Link</option>
                        </select>
                      </div>
                      <div className={`md:col-span-2 space-y-1.5 px-1 ${['VIDEO', 'SCHEDULED_LECTURE', 'YOUTUBE'].includes(selectedMaterialType) ? 'hidden' : ''}`}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct File Upload (Cloudinary)</label>
                        <input 
                          type="file" 
                          id="mat-file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{['VIDEO', 'SCHEDULED_LECTURE', 'YOUTUBE'].includes(selectedMaterialType) ? 'Google Drive Link / Video URL' : 'OR URL / Resource Link'}</label>
                        <input 
                          type="text" 
                          placeholder="https://..."
                          id="mat-url"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 px-1 col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-blue-500" /> {selectedMaterialType === 'SCHEDULED_LECTURE' ? 'Lecture Date & Time' : 'Expiration Date (Optional)'}
                        </label>
                        <input 
                          type="datetime-local" 
                          id="mat-expiresAt"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 px-1 col-span-1 flex flex-col justify-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Download Permission</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <input 
                            type="checkbox" 
                            id="mat-isDownloadable" 
                            defaultChecked 
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
                          />
                          <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Allow student to download</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 pt-2">
                        <button 
                          onClick={async (e) => {
                            const btn = e.currentTarget;
                            const title = (document.getElementById('mat-title') as HTMLInputElement).value;
                            const type = (document.getElementById('mat-type') as HTMLSelectElement).value;
                            const url = (document.getElementById('mat-url') as HTMLInputElement).value;
                            const fileInput = document.getElementById('mat-file') as HTMLInputElement;
                            const file = fileInput.files?.[0];
                            const expiresAt = (document.getElementById('mat-expiresAt') as HTMLInputElement).value;
                            const isDownloadable = (document.getElementById('mat-isDownloadable') as HTMLInputElement).checked;

                            if (!title || (!url && !file)) return alert('Please provide a title and either a file or a URL');
                            
                            try {
                              btn.disabled = true;
                              btn.innerHTML = 'Uploading...';
                              
                              const formData = new FormData();
                              formData.append('title', title);
                              formData.append('type', type);
                              formData.append('courseId', managingMaterials.id);
                              if (file) formData.append('file', file);
                              if (url) formData.append('url', url);
                              if (expiresAt) {
                                if (type === 'SCHEDULED_LECTURE') {
                                  formData.append('scheduledAt', expiresAt);
                                  formData.append('isScheduled', 'true');
                                } else {
                                  formData.append('expiresAt', expiresAt);
                                }
                              }

                              await api.post('/lms/materials', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });

                              alert('SUCCESS: Resource submitted.');
                              (document.getElementById('mat-title') as HTMLInputElement).value = '';
                              (document.getElementById('mat-url') as HTMLInputElement).value = '';
                              (document.getElementById('mat-expiresAt') as HTMLInputElement).value = '';
                              fileInput.value = '';
                              // Trigger a re-fetch of course data to show new material
                              await fetchData();
                              // Update the specific managingMaterials state to reflect local changes if needed
                              const updatedCourse = await api.get(`/courses/${managingMaterials.id}`);
                              setManagingMaterials(updatedCourse.data);
                            } catch (err: any) { 
                              console.error('Upload error:', err);
                              alert('Error uploading material: ' + (err.response?.data?.message || err.message)); 
                            }
                          }}
                          className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-xs tracking-[0.2em] border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                          Submit
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
                               setManagingMaterials({
                                 ...managingMaterials,
                                 materials: managingMaterials.materials.filter((m: any) => m.id !== mat.id)
                               });
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                    </>
                  )}

                  {activeManagementTab === 'ASSIGNMENTS' && (
                    <div className="space-y-8">
                      {/* Create Assignment Form */}
                      <div className="p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100/50 space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-blue-600 rounded-lg text-white">
                              <Plus className="w-4 h-4" />
                           </div>
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Post New Assignment</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignment Title</label>
                            <input type="text" id="asgn-title" placeholder="e.g. Clinical Pharmacy Case Study" className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-400 transition-all" />
                          </div>
                          <div className="md:col-span-2 space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Instructions</label>
                            <textarea id="asgn-desc" rows={3} className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-400 transition-all" />
                          </div>
                          <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                            <input type="datetime-local" id="asgn-start" className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-400 transition-all" />
                          </div>
                          <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                            <input type="datetime-local" id="asgn-due" className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-400 transition-all" />
                          </div>
                          <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Marks</label>
                            <input type="number" id="asgn-marks" defaultValue={100} className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-400 transition-all" />
                          </div>
                          <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference File (Optional)</label>
                            <input type="file" id="asgn-file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="w-full px-5 py-2.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-400 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                          </div>
                        </div>
                        <button 
                          onClick={async (e) => {
                            const btn = e.currentTarget;
                            const title = (document.getElementById('asgn-title') as HTMLInputElement).value;
                            const desc = (document.getElementById('asgn-desc') as HTMLTextAreaElement).value;
                            const start = (document.getElementById('asgn-start') as HTMLInputElement).value;
                            const due = (document.getElementById('asgn-due') as HTMLInputElement).value;
                            const marks = (document.getElementById('asgn-marks') as HTMLInputElement).value;
                            const file = (document.getElementById('asgn-file') as HTMLInputElement).files?.[0];

                            if (!title || !due) return alert('Title and Due Date are required');
                            try {
                              btn.disabled = true; btn.innerHTML = 'Posting...';
                              const fd = new FormData();
                              fd.append('title', title);
                              fd.append('description', desc || '');
                              fd.append('startTime', start || new Date().toISOString());
                              fd.append('dueDate', due);
                              fd.append('totalMarks', marks || '100');
                              fd.append('courseId', managingMaterials.id);
                              if (file) fd.append('file', file);

                              await api.post('/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              alert('SUCCESS: Assignment posted successfully to the course portal!');
                              // Instead of reload, re-fetch course details to stay in modal
                              const res = await api.get(`/courses/${managingMaterials.id}`);
                              setManagingMaterials(res.data);
                              // Reset form
                              (document.getElementById('asgn-title') as HTMLInputElement).value = '';
                              (document.getElementById('asgn-desc') as HTMLTextAreaElement).value = '';
                              (document.getElementById('asgn-due') as HTMLInputElement).value = '';
                           } catch (err: any) { 
                             alert('Error posting assignment: ' + (err.response?.data?.message || err.message)); 
                           }
                           finally { btn.disabled = false; btn.innerHTML = 'Post Assignment'; }
                          }}
                          className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 uppercase text-xs tracking-widest hover:bg-blue-700 transition-all"
                        >
                          Post Assignment
                        </button>
                      </div>

                      {/* Submissions Viewer Modal (Teacher/Admin) */}
                      <AnimatePresence>
                        {viewingSubmissions && (
                          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingSubmissions(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                                  <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Submissions</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{viewingSubmissions.title}</p>
                                  </div>
                                  <button onClick={() => setViewingSubmissions(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                               </div>
                               
                               <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                                  {submissions.length === 0 ? (
                                    <div className="py-20 text-center">
                                       <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-slate-300">
                                          <ClipboardList className="w-10 h-10" />
                                       </div>
                                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No submissions yet.</p>
                                    </div>
                                  ) : (
                                    submissions.map((sub: any) => (
                                      <div key={sub.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                                         <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-black">
                                               {sub.student?.name?.charAt(0)}
                                            </div>
                                            <div>
                                               <p className="font-black text-slate-800 text-sm">{sub.student?.name}</p>
                                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{sub.student?.rollNumber}</p>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-3">
                                            <a 
                                              href={`https://docs.google.com/viewer?url=${encodeURIComponent(sub.fileUrl)}&embedded=true`} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 uppercase tracking-widest"
                                            >
                                              View File
                                            </a>
                                            {sub.grade ? (
                                              <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                 Score: {sub.grade.score}
                                              </div>
                                            ) : (
                                              <button 
                                                onClick={() => {
                                                  const score = prompt('Enter score for ' + sub.student?.name);
                                                  if(score) {
                                                    api.post(`/assignments/submissions/${sub.id}/grade`, { score: parseFloat(score), feedback: 'Graded via portal' })
                                                      .then(() => {
                                                        alert('Graded!');
                                                        setViewingSubmissions(null);
                                                      });
                                                  }
                                                }}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest"
                                              >
                                                 Grade
                                              </button>
                                            )}
                                         </div>
                                      </div>
                                    ))
                                  )}
                               </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Assignment List */}
                      <div className="space-y-3">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Assignments</h4>
                         {(managingMaterials.assignments || []).length === 0 ? (
                           <p className="text-center py-6 text-slate-400 font-bold text-sm italic">No assignments posted for this course.</p>
                         ) : (
                           managingMaterials.assignments.map((asgn: any) => (
                             <div key={asgn.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <ClipboardList className="w-6 h-6" />
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-800 text-base">{asgn.title}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Due: {new Date(asgn.dueDate).toLocaleDateString()}</span>
                                         <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{asgn.totalMarks} Marks</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <button 
                                     onClick={async () => {
                                       try {
                                         const res = await api.get(`/assignments/${asgn.id}/submissions`);
                                         setSubmissions(res.data);
                                         setViewingSubmissions(asgn);
                                       } catch (err) {
                                         alert('Error fetching submissions');
                                       }
                                     }}
                                     className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-50 hover:text-blue-600 transition-all"
                                   >
                                     View Submissions
                                   </button>
                                   <button onClick={async () => {
                                      if(!confirm('Delete this assignment?')) return;
                                      await api.delete(`/assignments/${asgn.id}`);
                                      setManagingMaterials({
                                        ...managingMaterials,
                                        assignments: managingMaterials.assignments.filter((a: any) => a.id !== asgn.id)
                                      });
                                   }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                             </div>
                           ))
                         )}
                      </div>
                    </div>
                  )}

                   {activeManagementTab === 'QUIZZES' && (
                    <div className="space-y-8 h-full flex flex-col">
                       <div className="p-10 bg-purple-50/30 rounded-[2.5rem] border border-purple-100/50 space-y-8 shadow-inner">
                          <div className="flex items-center gap-4 mb-2">
                             <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
                                <Plus className="w-6 h-6" />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Setup Quiz / Exam</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Define assessment parameters</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="md:col-span-2 space-y-2 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Title</label>
                                <input type="text" id="quiz-title" placeholder="e.g. Pharmacology Midterm 2024" className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm" />
                             </div>
                             <div className="space-y-2 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                                <input type="datetime-local" id="quiz-start" className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm" />
                             </div>
                             <div className="space-y-2 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                                <input type="datetime-local" id="quiz-end" className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm" />
                             </div>
                             <div className="space-y-2 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Limit (Mins)</label>
                                <input type="number" id="quiz-limit" defaultValue={30} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm" />
                             </div>
                             <div className="space-y-2 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passing %</label>
                                <input type="number" id="quiz-pass" defaultValue={40} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm" />
                             </div>
                             <div className="space-y-2 md:col-span-2 flex items-center justify-between bg-white p-5 rounded-3xl border-2 border-slate-50 shadow-sm">
                                <div>
                                   <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Graded Examination</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">Increases visibility and importance</p>
                                </div>
                                <input type="checkbox" id="quiz-exam" className="w-6 h-6 accent-purple-600 rounded-lg cursor-pointer" />
                             </div>
                          </div>

                          <div className="pt-4 space-y-4">
                             <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Questions Management</h5>
                                <button 
                                  onClick={() => {
                                    setNewQuizQuestions([...newQuizQuestions, { text: '', options: ['', '', '', ''], answer: '' }]);
                                  }} 
                                  className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-black text-[10px] uppercase tracking-widest border-2 border-purple-100 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                >
                                   <Plus className="w-3 h-3" /> Add MCQ
                                </button>
                             </div>
                             
                             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {newQuizQuestions.map((q, qIdx) => (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    key={qIdx} 
                                    className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] space-y-6 shadow-sm relative group/q hover:border-purple-200 transition-all"
                                  >
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                                              #{qIdx + 1}
                                           </div>
                                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Details</span>
                                        </div>
                                        <button 
                                          onClick={() => {
                                            const updated = [...newQuizQuestions];
                                            updated.splice(qIdx, 1);
                                            setNewQuizQuestions(updated);
                                          }}
                                          className="p-2 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                     </div>
                                     
                                     <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-purple-600">Question Statement</label>
                                        <textarea 
                                          placeholder="Type your question here..." 
                                          rows={2}
                                          value={q.text}
                                          onChange={(e) => {
                                            const updated = [...newQuizQuestions];
                                            updated[qIdx].text = e.target.value;
                                            setNewQuizQuestions(updated);
                                          }}
                                          className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-200 rounded-2xl font-bold text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300" 
                                        />
                                     </div>

                                     <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Answer Options</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {['A', 'B', 'C', 'D'].map((optLabel, optIdx) => (
                                            <div key={optIdx} className="group/opt flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl border-2 border-slate-100 focus-within:border-purple-200 focus-within:bg-white transition-all">
                                               <div className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 group-focus-within/opt:bg-purple-600 group-focus-within/opt:text-white transition-all">
                                                  {optLabel}
                                               </div>
                                               <input 
                                                 type="text" 
                                                 placeholder={`Option ${optLabel}...`} 
                                                 value={q.options[optIdx]}
                                                 onChange={(e) => {
                                                   const updated = [...newQuizQuestions];
                                                   updated[qIdx].options[optIdx] = e.target.value;
                                                   setNewQuizQuestions(updated);
                                                 }}
                                                 className="w-full bg-transparent border-none text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300" 
                                               />
                                            </div>
                                          ))}
                                        </div>
                                     </div>

                                     <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 flex-1">
                                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answer Selection</label>
                                           <div className="relative">
                                              <select 
                                                value={q.answer}
                                                onChange={(e) => {
                                                  const updated = [...newQuizQuestions];
                                                  updated[qIdx].answer = e.target.value;
                                                  setNewQuizQuestions(updated);
                                                }}
                                                className="w-full pl-5 pr-10 py-3.5 bg-green-50/30 border-2 border-green-100/50 rounded-2xl font-black text-xs text-green-700 outline-none appearance-none focus:border-green-400 transition-all cursor-pointer"
                                              >
                                                <option value="">Select Correct Option</option>
                                                {q.options.filter((o: string) => o.trim() !== '').map((o: string, i: number) => (
                                                  <option key={i} value={o}>Option {['A','B','C','D'][q.options.indexOf(o)]}: {o}</option>
                                                ))}
                                              </select>
                                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-600">
                                                 <CheckCircle className="w-4 h-4" />
                                              </div>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auto-Graded</span>
                                        </div>
                                     </div>
                                  </motion.div>
                                ))}
                             </div>
                          </div>

                          <button onClick={async (e) => {
                             const btn = e.currentTarget;
                             if(newQuizQuestions.length === 0) return alert('Please add at least one question');
                             
                             const validatedQuestions = newQuizQuestions.filter(q => q.text && q.answer && q.options.filter((o: any) => o !== '').length >= 2);
                             if(validatedQuestions.length !== newQuizQuestions.length) return alert('Please fill all questions, options, and select correct answers.');

                             try {
                               btn.disabled = true; btn.innerHTML = 'Creating Quiz...';
                               await api.post('/quizzes', {
                                  title: (document.getElementById('quiz-title') as HTMLInputElement).value,
                                  startTime: (document.getElementById('quiz-start') as HTMLInputElement).value,
                                  endTime: (document.getElementById('quiz-end') as HTMLInputElement).value,
                                  timeLimit: parseInt((document.getElementById('quiz-limit') as HTMLInputElement).value),
                                  passingPercentage: parseInt((document.getElementById('quiz-pass') as HTMLInputElement).value),
                                  isExam: (document.getElementById('quiz-exam') as HTMLInputElement).checked,
                                  totalMarks: validatedQuestions.length, // Added totalMarks
                                  description: "Course Quiz", // Added description
                                  courseId: managingMaterials.id,
                                  questions: validatedQuestions
                               });
                               alert('SUCCESS: Quiz created successfully and sent for HOD approval!');
                               setNewQuizQuestions([]); // Reset state
                               // Re-fetch course details to stay in modal
                               const res = await api.get(`/courses/${managingMaterials.id}`);
                               setManagingMaterials(res.data);
                             } catch (err: any) { 
                               alert('Error creating quiz: ' + (err.response?.data?.message || err.message)); 
                             }
                             finally { btn.disabled = false; btn.innerHTML = 'Create Quiz'; }
                          }} className="w-full py-5 bg-purple-600 text-white font-black rounded-3xl shadow-xl shadow-purple-100 uppercase text-xs tracking-[0.2em]">Create Quiz & Go Live</button>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Quizzes</h4>
                          {(managingMaterials.quizzes || []).length === 0 ? (
                            <p className="text-center py-6 text-slate-400 font-bold text-sm italic">No quizzes created yet.</p>
                          ) : (
                            managingMaterials.quizzes.map((qz: any) => (
                              <div key={qz.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-purple-200 transition-all shadow-sm">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                       <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <p className="font-black text-slate-800 text-base">{qz.title}</p>
                                          {qz.isExam && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded uppercase">EXAM</span>}
                                       </div>
                                       <div className="flex items-center gap-3 mt-1">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{qz.questions?.length || 0} MCQs</span>
                                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                          <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">{qz.timeLimit} Mins</span>
                                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                          <span className={`text-[9px] font-black uppercase tracking-tighter ${qz.status === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>{qz.status}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <button onClick={async () => {
                                      if(!confirm('Delete this quiz?')) return;
                                      await api.delete(`/quizzes/${qz.id}`);
                                      setManagingMaterials({
                                        ...managingMaterials,
                                        quizzes: managingMaterials.quizzes.filter((q: any) => q.id !== qz.id)
                                      });
                                   }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))
                          )}
                       </div>
                    </div>
                  )}
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

                <div className="flex border-b border-slate-100 bg-slate-50/30">
                  {['DETAILS', 'LIVE', 'MATERIALS', 'ASSIGNMENTS', 'QUIZZES'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setViewingCourseTab(tab as any)}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${viewingCourseTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                   {viewingCourseTab === 'LIVE' && (
                     <div className="space-y-6">
                       <h4 className="text-sm font-black text-red-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                         Live Sessions & Virtual Classrooms
                       </h4>
                       
                       {(() => {
                         const courseActiveClasses = activeClasses.filter((c: any) => c.courseId === viewingCourse.id);
                         if (courseActiveClasses.length === 0) {
                           return (
                             <div className="p-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                               <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                               <p className="text-slate-500 font-bold">No active live sessions for this course at the moment.</p>
                               <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">Check back during scheduled hours</p>
                             </div>
                           );
                         }
                         return courseActiveClasses.map((cls: any) => (
                           <div key={cls.id} className="p-8 bg-white border-2 border-green-100 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-green-900/5 group">
                             <div className="flex items-center gap-6">
                               <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                                 <Video className="w-8 h-8" />
                               </div>
                               <div>
                                 <h4 className="text-xl font-black text-slate-800">{cls.title}</h4>
                                 <p className="text-xs text-green-600 font-black uppercase tracking-widest mt-1">Status: LIVE NOW</p>
                               </div>
                             </div>
                             <Link 
                               href={`/dashboard/courses/${cls.courseId}/live?sessionId=${cls.id}`}
                               className="px-10 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 uppercase text-xs tracking-[0.2em] hover:bg-green-700 transition-all hover:scale-105 active:scale-95"
                             >
                               Join Classroom
                             </Link>
                           </div>
                         ));
                       })()}
                       
                       <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4" /> Secure Session Info
                          </p>
                          <p className="text-xs text-slate-600 font-medium">All sessions are recorded and monitored for quality assurance. Please ensure you have a stable internet connection before joining.</p>
                       </div>
                     </div>
                   )}

                   {viewingCourseTab === 'DETAILS' && (
                     <div className="space-y-10">
                       {viewingCourse.outcomes && (
                         <section>
                           <h4 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <div className="w-2 h-2 bg-blue-600 rounded-full" />
                             Learning Outcomes
                           </h4>
                            <div className="space-y-3 bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                               {parseToItems(viewingCourse.outcomes).map((item, idx) => (
                                 <div key={idx} className="flex gap-3 text-slate-600 font-medium text-sm leading-relaxed">
                                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                                   <p>{item.replace(/^\d+\.\s*/, '')}</p>
                                 </div>
                               ))}
                               {!viewingCourse.outcomes.includes('1.') && (
                                 <p className="text-slate-600 font-medium whitespace-pre-line text-sm leading-relaxed">
                                   {viewingCourse.outcomes}
                                 </p>
                               )}
                            </div>
                         </section>
                       )}

                       {viewingCourse.contents && (
                         <section>
                           <h4 className="text-sm font-black text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <div className="w-2 h-2 bg-orange-600 rounded-full" />
                             Course Contents
                           </h4>
                            <div className="space-y-3 bg-orange-50/30 p-6 rounded-3xl border border-orange-100/30">
                               {parseToItems(viewingCourse.contents).map((item, idx) => (
                                 <div key={idx} className="flex gap-3 text-slate-600 font-medium text-sm leading-relaxed">
                                   <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0" />
                                   <p>{item.replace(/^\d+\.\s*/, '')}</p>
                                 </div>
                               ))}
                               {!viewingCourse.contents.includes('1.') && (
                                 <p className="text-slate-600 font-medium whitespace-pre-line text-sm leading-relaxed">
                                   {viewingCourse.contents}
                                 </p>
                               )}
                            </div>
                         </section>
                       )}

                       {viewingCourse.readings && (
                         <section>
                           <h4 className="text-sm font-black text-purple-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <div className="w-2 h-2 bg-purple-600 rounded-full" />
                             Recommended Readings
                           </h4>
                            <div className="space-y-3 bg-purple-50/30 p-6 rounded-3xl border border-purple-100/30">
                               {parseToItems(viewingCourse.readings).map((item, idx) => (
                                 <div key={idx} className="flex gap-3 text-slate-600 font-medium text-sm leading-relaxed">
                                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 shrink-0" />
                                   <p>{item.replace(/^\d+\.\s*/, '')}</p>
                                 </div>
                               ))}
                               {!viewingCourse.readings.includes('1.') && (
                                 <p className="text-slate-600 font-medium whitespace-pre-line text-sm leading-relaxed">
                                   {viewingCourse.readings}
                                 </p>
                               )}
                            </div>
                         </section>
                       )}

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
                   )}

                   {viewingCourseTab === 'MATERIALS' && (
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
                             <div 
                                key={mat.id} 
                                className={`p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 transition-all group ${mat.isScheduled && new Date(mat.scheduledAt) > new Date() ? 'opacity-70 grayscale pointer-events-none' : 'hover:border-green-200 hover:shadow-lg hover:shadow-green-100/20'}`}
                              >
                                <div className={`p-3 rounded-xl transition-all ${mat.type === 'VIDEO' || mat.type === 'YOUTUBE' || mat.type === 'SCHEDULED_LECTURE' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white'}`}>
                                   {mat.type === 'VIDEO' || mat.type === 'YOUTUBE' || mat.type === 'SCHEDULED_LECTURE' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div className="overflow-hidden flex-1">
                                  <div className="flex items-center justify-between">
                                     <p className="font-black text-slate-800 text-sm truncate">{mat.title}</p>
                                     {mat.isScheduled && new Date(mat.scheduledAt) > new Date() && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md">
                                           <span className="relative flex h-1.5 w-1.5">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                           </span>
                                           <span className="text-[8px] font-black uppercase tracking-tight">Starts in: {(() => {
                                              const diff = new Date(mat.scheduledAt).getTime() - new Date().getTime();
                                              const mins = Math.max(0, Math.floor(diff / 60000));
                                              const hours = Math.floor(mins / 60);
                                              if (hours > 0) return `${hours}h ${mins % 60}m`;
                                              return `${mins}m`;
                                           })()}</span>
                                        </div>
                                     )}
                                     {mat.isScheduled && new Date(mat.scheduledAt) <= new Date() && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-md">
                                           <span className="relative flex h-1.5 w-1.5">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                           </span>
                                           <span className="text-[8px] font-black uppercase tracking-tight">LIVE NOW</span>
                                        </div>
                                     )}
                                  </div>
                                  <div className="flex items-center justify-between mt-0.5">
                                     <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mat.type}</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                           <ShieldCheck className="w-2.5 h-2.5" /> Verified
                                        </span>
                                     </div>
                                     {(!mat.isScheduled || new Date(mat.scheduledAt) <= new Date()) && (
                                        <a 
                                          href={mat.type === 'VIDEO' || mat.type === 'YOUTUBE' || mat.type === 'SCHEDULED_LECTURE' ? mat.url : `https://docs.google.com/viewer?url=${encodeURIComponent(mat.url)}&embedded=true`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="px-3 py-1 bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        >
                                           {mat.type === 'VIDEO' || mat.type === 'YOUTUBE' || mat.type === 'SCHEDULED_LECTURE' ? 'Join Now' : 'View / Download'}
                                        </a>
                                     )}
                                  </div>
                                </div>
                              </div>
                           ))
                         )}
                       </div>
                     </section>
                   )}

                   {viewingCourseTab === 'ASSIGNMENTS' && (
                     <div className="space-y-6">
                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          Assignments & Tasks
                        </h4>
                        {(viewingCourse.assignments || []).length === 0 ? (
                           <p className="text-center py-10 text-slate-400 font-bold italic">No assignments posted for this course.</p>
                        ) : (
                          viewingCourse.assignments.map((asgn: any) => (
                            <div key={asgn.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                     <ClipboardList className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-800 text-base">{asgn.title}</p>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Due: {new Date(asgn.dueDate).toLocaleDateString()}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  {asgn.submissions?.[0] ? (
                                     <div className="flex flex-col items-end gap-1">
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                                           <CheckCircle className="w-2.5 h-2.5" /> Submitted
                                        </span>
                                        {asgn.submissions[0].grade && (
                                           <span className="text-[10px] font-black text-slate-800">Grade: {asgn.submissions[0].grade.score}/{asgn.totalMarks}</span>
                                        )}
                                     </div>
                                  ) : (
                                     <>
                                        {asgn.fileUrl && (
                                          <a 
                                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(asgn.fileUrl)}&embedded=true`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                          >
                                             <FileText className="w-5 h-5" />
                                          </a>
                                        )}
                                        <button onClick={() => setSubmittingAssignment(asgn)} className="px-5 py-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Submit Now</button>
                                     </>
                                  )}
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                   )}

                   {viewingCourseTab === 'QUIZZES' && (
                     <div className="space-y-6">
                        <h4 className="text-sm font-black text-purple-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full" />
                          Available Quizzes & Exams
                        </h4>
                        {(viewingCourse.quizzes || []).filter((q: any) => q.status === 'APPROVED').length === 0 ? (
                           <p className="text-center py-10 text-slate-400 font-bold italic">No active quizzes at the moment.</p>
                        ) : (
                          viewingCourse.quizzes.filter((q: any) => q.status === 'APPROVED').map((qz: any) => (
                            <div key={qz.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-purple-200 transition-all shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                     <Zap className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-800 text-base">{qz.title}</p>
                                        {qz.isExam && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded uppercase tracking-widest">EXAM</span>}
                                     </div>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{qz.timeLimit} Minutes • {qz.questions?.length || 0} Questions</p>
                                  </div>
                               </div>
                               {qz.results?.[0] ? (
                                  <div className="flex flex-col items-end gap-1">
                                     <span className={`px-3 py-1 ${qz.results[0].passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-[8px] font-black rounded uppercase tracking-widest flex items-center gap-1`}>
                                        {qz.results[0].passed ? <CheckCircle className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                        {qz.results[0].passed ? 'PASSED' : 'FAILED'}
                                     </span>
                                     <span className="text-[10px] font-black text-slate-800">Score: {qz.results[0].score}/{qz.totalMarks}</span>
                                  </div>
                               ) : (
                                  <button onClick={() => handleStartQuiz(qz)} className="px-5 py-2 bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">Attempt</button>
                               )}
                            </div>
                          ))
                        )}
                     </div>
                   )}
                   
                   {activeManagementTab === 'HISTORY' && (
                     <div className="space-y-6">
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Course Resource History</h4>
                       <div className="space-y-4">
                         {[
                           ...((managingMaterials.materials || []).map((m: any) => ({ ...m, category: 'RESOURCE' }))),
                           ...((managingMaterials.assignments || []).map((a: any) => ({ ...a, category: 'ASSIGNMENT' }))),
                           ...((managingMaterials.quizzes || []).map((q: any) => ({ ...q, category: 'QUIZ' })))
                         ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item: any) => (
                           <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                             <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                 item.category === 'RESOURCE' ? 'bg-blue-50 text-blue-600' : 
                                 item.category === 'ASSIGNMENT' ? 'bg-green-50 text-green-600' : 
                                 'bg-purple-50 text-purple-600'
                               }`}>
                                 {item.category === 'RESOURCE' ? <FileText className="w-5 h-5" /> : 
                                  item.category === 'ASSIGNMENT' ? <ClipboardList className="w-5 h-5" /> : 
                                  <Zap className="w-5 h-5" />}
                               </div>
                               <div>
                                 <div className="flex items-center gap-2">
                                   <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                                   <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase tracking-widest">{item.category}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Posted on {new Date(item.createdAt).toLocaleDateString()}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${item.status === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>{item.status || 'ACTIVE'}</span>
                             </div>
                           </div>
                         ))}
                         {[
                           ...(managingMaterials.materials || []),
                           ...(managingMaterials.assignments || []),
                           ...(managingMaterials.quizzes || [])
                         ].length === 0 && (
                           <p className="text-center py-10 text-slate-400 font-bold italic">No history found for this course.</p>
                         )}
                       </div>
                     </div>
                   )}
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

        {/* Assignment Submission Modal */}
        <AnimatePresence>
          {submittingAssignment && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSubmittingAssignment(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Submit Assignment</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{submittingAssignment.title}</p>
                  </div>
                  <button onClick={() => setSubmittingAssignment(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 border-dashed">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Upload your solution</p>
                      <input type="file" id="sub-file" className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes (Optional)</label>
                      <textarea id="sub-notes" rows={3} className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                   </div>
                   <button onClick={async (e) => {
                      const btn = e.currentTarget;
                      const file = (document.getElementById('sub-file') as HTMLInputElement).files?.[0];
                      if(!file) return alert('Please select a file to upload');

                      try {
                        btn.disabled = true; btn.innerHTML = 'Uploading...';
                        const fd = new FormData();
                        fd.append('file', file);
                        fd.append('notes', (document.getElementById('sub-notes') as HTMLTextAreaElement).value);

                        await api.post(`/assignments/${submittingAssignment.id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        alert('Assignment submitted successfully!');
                        setSubmittingAssignment(null);
                      } catch (err) { alert('Error submitting assignment'); }
                      finally { btn.disabled = false; btn.innerHTML = 'Confirm Submission'; }
                   }} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 uppercase text-xs tracking-widest">Confirm Submission</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Quiz Attempt Overlay */}
        <AnimatePresence>
          {activeQuiz && (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                        <Zap className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">{activeQuiz.title}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-sm">
                        <Clock className="w-4 h-4" />
                        {Math.floor(quizTimer / 60)}:{(quizTimer % 60).toString().padStart(2, '0')}
                     </div>
                     <button onClick={() => { if(confirm('Exit quiz? Progress will be lost.')) setActiveQuiz(null); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                     </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
                  <div className="max-w-3xl mx-auto space-y-12">
                     <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest">Question #{currentQuestionIndex + 1}</div>
                        <h2 className="text-3xl font-black text-slate-800 leading-tight">{quizQuestions[currentQuestionIndex]?.text}</h2>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {quizQuestions[currentQuestionIndex]?.options.map((opt: string, i: number) => {
                           const qId = quizQuestions[currentQuestionIndex]?.id;
                           const isSelected = quizAnswers[qId] === opt;
                           return (
                              <button 
                                 key={i}
                                 onClick={() => setQuizAnswers({...quizAnswers, [qId]: opt})}
                                 className={`p-6 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group ${isSelected ? 'border-purple-600 bg-purple-50/50' : 'border-white bg-white hover:border-purple-200'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                                       {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className={`font-bold ${isSelected ? 'text-purple-900' : 'text-slate-600'}`}>{opt}</span>
                                 </div>
                                 {isSelected && <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white"><CheckCircle className="w-4 h-4" /></div>}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between">
                  <button 
                     disabled={currentQuestionIndex === 0}
                     onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                     className="px-8 py-3 bg-slate-100 text-slate-400 font-black rounded-2xl disabled:opacity-30 uppercase text-[10px] tracking-widest"
                  >
                     Previous
                  </button>
                  {currentQuestionIndex === quizQuestions.length - 1 ? (
                     <button 
                        onClick={async (e) => {
                           const btn = e.currentTarget;
                           try {
                              btn.disabled = true; btn.innerHTML = 'Submitting...';
                              const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, { answers: quizAnswers });
                              alert(`Quiz submitted! Result: ${res.data.score}/${res.data.totalQuestions} (${res.data.percentage}%) - ${res.data.passed ? 'PASSED' : 'FAILED'}`);
                              setActiveQuiz(null);
                              location.reload();
                           } catch (err) { alert('Error submitting quiz'); }
                           finally { btn.disabled = false; btn.innerHTML = 'Finish Quiz'; }
                        }}
                        className="px-10 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all"
                     >
                        Finish Quiz
                     </button>
                  ) : (
                     <button 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-10 py-4 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-100 uppercase text-[10px] tracking-widest hover:bg-purple-700 transition-all"
                     >
                        Next Question
                     </button>
                  )}
               </div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {assigningTeacherCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setAssigningTeacherCourse(null)}
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
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Assign Teacher</h3>
                    <p className="text-sm text-slate-500 font-medium">{assigningTeacherCourse.name}</p>
                  </div>
                  <button onClick={() => setAssigningTeacherCourse(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAssignTeacher} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Instructor</label>
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
                  
                  <div className="pt-4">
                    <button type="submit" className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all uppercase text-xs tracking-widest">
                      Confirm Assignment
                    </button>
                  </div>
                </form>
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
                      disabled={currentUser?.role === 'HOD'}
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
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
