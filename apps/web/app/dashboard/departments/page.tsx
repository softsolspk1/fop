"use client";

import React from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, Building2, MoreVertical, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const departments = [
  { id: '1', name: 'Department of Pharmaceutical Chemistry', courses: 22, faculty: 14, status: 'Active' },
  { id: '2', name: 'Department of Pharmaceutics', courses: 20, faculty: 12, status: 'Active' },
  { id: '3', name: 'Department of Pharmacognosy', courses: 15, faculty: 8, status: 'Active' },
  { id: '4', name: 'Department of Pharmacology', courses: 24, faculty: 15, status: 'Active' },
  { id: '5', name: 'Department of Pharmacy Practice', courses: 18, faculty: 10, status: 'Active' },
];

export default function DepartmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Department Management</h2>
            <p className="text-slate-500">Manage academic departments, faculty assignments, and course offerings.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all">
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search departments..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">Export PDF</button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Count</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map((dept, idx) => (
                <motion.tr 
                  key={dept.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-800">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{dept.courses} Courses</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{dept.faculty} Instructors</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
