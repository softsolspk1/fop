"use client";

import React from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, Search, User, Mail, Shield, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        if (err.response?.status === 403) {
          setError('Access Denied: You do not have permission to view the user directory. Please ensure you are logged in as a Super Admin.');
        } else {
          setError('Failed to load user directory. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
            <p className="text-slate-500">Oversee all system users, assign roles, and manage permissions.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all">
            <Plus className="w-5 h-5" />
            Create User
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium text-sm flex items-center gap-3">
             <Shield className="w-5 h-5" />
             {error}
             <button onClick={() => window.location.reload()} className="ml-auto underline font-bold">Refresh Page</button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email or department..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">All Roles</option>
                <option value="TEACHER">Teachers</option>
                <option value="STUDENT">Students</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Information</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">Fetching User Directory...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No users found in the system.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${roleStyles[user.role as keyof typeof roleStyles]}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">{user.department?.name || 'Faculty'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
