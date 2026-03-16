"use client";

import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Users, Building2, BookOpen, Video, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Students', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'up' },
  { label: 'Departments', value: '12', change: '0%', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'neutral' },
  { label: 'Active Courses', value: '84', change: '+5%', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100', trend: 'up' },
  { label: 'Live Now', value: '8', change: 'Live', icon: Video, color: 'text-green-600', bg: 'bg-green-100', trend: 'up' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, Admin</h2>
          <p className="text-slate-500">Here's what's happening across the Faculty of Pharmacy today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800">Recent Class Activity</h3>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">Advanced Pharmacology - Session {i}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Started 45 mins ago • Dr. Sarah Ahmed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-8">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center gap-4 p-5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all group">
                <div className="p-3 bg-white/50 group-hover:bg-white/20 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold">New Department</span>
              </button>
              <button className="flex items-center gap-4 p-5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-600 hover:text-white transition-all group">
                <div className="p-3 bg-white/50 group-hover:bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold">Add User/Teacher</span>
              </button>
              <button className="flex items-center gap-4 p-5 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-600 hover:text-white transition-all group">
                <div className="p-3 bg-white/50 group-hover:bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-bold">Create New Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
