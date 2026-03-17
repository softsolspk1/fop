"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { User, Shield, Bell, Laptop, Save, Loader2, Camera, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (authUser) {
      setProfileData(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || '',
        role: authUser.role || '',
        department: (authUser as any).department?.name || 'Administrative'
      }));
    }
  }, [authUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/users/me', {
        name: profileData.name,
        email: profileData.email
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      setSaving(true);
      await api.put('/users/me/password', {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword
      });
      alert('Password updated successfully!');
      setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h2>
          <p className="text-slate-500 font-medium">Manage your profile, security preferences, and account configuration.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Profile Information</h3>
                  <p className="text-xs font-bold text-slate-400">Update your public identity on the platform.</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required 
                    type="email"
                    value={profileData.email} 
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department / Faculty</label>
                  <input disabled value={profileData.department} className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl font-black text-slate-400 outline-none cursor-not-allowed" />
                </div>
                <div className="pt-4 col-span-2 flex justify-end">
                   <button 
                    disabled={saving}
                    type="submit" 
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 active:translate-y-1 active:border-b-0 transition-all uppercase text-xs tracking-widest"
                   >
                     {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Save Changes
                   </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Security Credentials</h3>
                  <p className="text-xs font-bold text-slate-400">Manage your password and authentication methods.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input 
                    required 
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-red-100 transition-all" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      required 
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      required 
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                   <button 
                    disabled={saving}
                    type="submit" 
                    className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 border-b-4 border-slate-900 active:translate-y-1 active:border-b-0 transition-all uppercase text-xs tracking-widest"
                   >
                     Update Password
                   </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200">
                <div className="flex flex-col items-center text-center">
                   <div className="relative mb-6">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-4xl font-black border-4 border-white/30 shadow-2xl">
                        {authUser?.name?.charAt(0)}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 bg-white text-blue-600 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </button>
                   </div>
                   <h4 className="text-xl font-black italic">{authUser?.name}</h4>
                   <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mt-2 border border-white/20 italic">
                      {authUser?.role}
                   </span>
                </div>
                
                <div className="mt-8 space-y-4 pt-8 border-t border-white/10">
                   <div className="flex items-center gap-3 text-sm font-bold opacity-80 italic">
                      <Mail className="w-4 h-4" />
                      {authUser?.email}
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold opacity-80 italic">
                      <Shield className="w-4 h-4" />
                      ID: {authUser?.id?.substring(0, 8)}...
                   </div>
                </div>
             </div>

             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account Status</h5>
                <div className="flex items-center justify-between">
                   <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Verified Academic Account
                   </span>
                   <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
