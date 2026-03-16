"use client";

import React from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, BookOpen, User, Clock, MoreVertical, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const courses = [
  { id: '1', name: 'Advanced Pharmacology I', code: 'PHA-501', department: 'Pharmacology', instructor: 'Dr. Sarah Ahmed', students: 120, status: 'Active' },
  { id: '2', name: 'Biopharmaceutics', code: 'PHA-504', department: 'Pharmaceutics', instructor: 'Dr. John Doe', students: 95, status: 'Active' },
  { id: '3', name: 'Medicinal Chemistry', code: 'PHA-507', department: 'Pharmaceutical Chemistry', instructor: 'Dr. Jane Smith', students: 110, status: 'Active' },
  { id: '4', name: 'Clinical Pharmacy', code: 'PHA-602', department: 'Pharmacy Practice', instructor: 'Dr. Mike Wilson', students: 80, status: 'Upcoming' },
];

export default function CoursesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Course Catalog</h2>
            <p className="text-slate-500">Manage academic courses, assign instructors, and monitor student enrollment.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all">
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-3 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses by name, code or instructor..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {courses.map((course, idx) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-800 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{course.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {course.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{course.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{course.department}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{course.students} Students</span>
                  </div>
                  <button className="flex items-center gap-1 text-blue-600 font-bold hover:gap-2 transition-all">
                    Manage <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
