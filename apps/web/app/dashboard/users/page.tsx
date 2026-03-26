"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, User, Mail, Shield, MoreVertical, Edit2, Trash2, Loader2, X, GraduationCap, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

const roleStyles = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  DEPT_ADMIN: 'bg-purple-100 text-purple-700',
  TEACHER: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-slate-100 text-slate-700',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    departmentId: '',
    rollNumber: '',
    shift: 'MORNING'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments')
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        departmentId: user.departmentId || '',
        rollNumber: user.rollNumber || '',
        shift: user.shift || 'MORNING'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
        departmentId: '',
        rollNumber: '',
        shift: 'MORNING'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user');
    }
  };

  const filteredUsers = users.filter(u => {
    const searchLow = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(searchLow) ?? false;
    const emailMatch = u.email?.toLowerCase().includes(searchLow) ?? false;
    const rollMatch = u.rollNumber?.toLowerCase().includes(searchLow) ?? false;
    
    const matchesSearch = nameMatch || emailMatch || rollMatch;
    const matchesRole = filterRole ? u.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h2>
            <p className="text-slate-500 font-medium">Oversee all system users, assign roles, and manage permissions.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create User
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium text-sm flex items-center gap-3">
             <Shield className="w-5 h-5" />
             {error}
             <button onClick={() => fetchData()} className="ml-auto underline font-bold">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or roll number..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-slate-900"
              >
                <option value="" className="text-slate-900">All Roles</option>
                <option value="FACULTY" className="text-slate-900">Teachers</option>
                <option value="STUDENT" className="text-slate-900">Students</option>
                <option value="SUPER_ADMIN" className="text-slate-900">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 italic">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">User Information</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Role</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Details</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing User Segments...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                      No users found in the system.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5 border-r border-slate-100/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center text-lg font-black border-2 border-white shadow-sm ring-1 ring-blue-100">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 tracking-tight text-lg">{user.name}</p>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 uppercase tracking-tighter">
                              <Mail className="w-3 h-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 border-r border-slate-100/50">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${roleStyles[user.role as keyof typeof roleStyles] || 'bg-slate-50 border-slate-200'}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 border-r border-slate-100/50">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter italic">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {user.department?.name || 'Administrative'}
                          </p>
                          {user.rollNumber && (
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                              Roll: {user.rollNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button onClick={() => handleOpenModal(user)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                          <button className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingUser ? 'Edit User' : 'Create User'}</h3>
                    <p className="text-sm text-slate-500 font-medium">Define user credentials and role assignment.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Uzair Ahmed"
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="uzair@uok.edu.pk"
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      required={!editingUser}
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Assignment</label>
                    <select 
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                    >
                      <option value="STUDENT" className="text-slate-900">Student</option>
                      <option value="FACULTY" className="text-slate-900">Teacher</option>
                      <option value="HOD" className="text-slate-900">Department Admin</option>
                      <option value="SUPER_ADMIN" className="text-slate-900">Super Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
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
                  {formData.role === 'STUDENT' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                        <input 
                          type="text" 
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                          placeholder="e.g. 21B-45"
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shift</label>
                        <select 
                          value={formData.shift}
                          onChange={(e) => setFormData({...formData, shift: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        >
                          <option value="MORNING" className="text-slate-900">Morning</option>
                          <option value="EVENING" className="text-slate-900">Evening</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="pt-4 md:col-span-2">
                    <button type="submit" className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all uppercase text-xs tracking-widest border-b-4 border-blue-800">
                      {editingUser ? 'Update Profile' : 'Register User'}
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
