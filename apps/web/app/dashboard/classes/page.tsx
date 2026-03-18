'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Video, Calendar, Clock, User, AlertCircle, Play, Users, MapPin } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

export default function LiveClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Live Academic Sessions</h2>
            <p className="text-slate-500 font-medium">Join real-time lectures and mark your attendance automatically.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">System Status: Optimal</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
             <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-xs">Synchronizing Global Sessions...</p>
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {classes.map((cls, idx) => (
              <motion.div 
                key={cls.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/20 transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-blue-600 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl animate-pulse">
                      <Video className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{cls.title}</h3>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{cls.course?.name || 'General Course'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><User className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                        <p className="font-bold text-slate-800">{cls.faculty?.user?.name || 'Not Assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Clock className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                        <p className="font-bold text-slate-800">90 Minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Users className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendees</p>
                        <p className="font-bold text-slate-800">42 Students Joined</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lobby ID</p>
                        <p className="font-bold text-slate-800">UOK-L-{cls.id.substring(0,4).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-800 uppercase text-xs tracking-[0.2em]">
                      <Play className="w-4 h-4 fill-current" />
                      Enter Session
                    </button>
                     {user?.role === 'STUDENT' && (
                        <button 
                         onClick={async () => {
                           try {
                             await api.post(`/classes/${cls.id}/attendance`);
                             alert('Attendance Marked Successfully!');
                           } catch (err) {
                             alert('Failed to mark attendance');
                           }
                         }}
                         className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest border-b-4 border-slate-700 active:border-b-0 active:translate-y-1"
                        >
                          Mark Attendance
                        </button>
                     )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
             <div className="w-32 h-32 bg-slate-50 text-slate-300 rounded-[3rem] flex items-center justify-center mx-auto mb-10">
                <Video className="w-16 h-16" />
             </div>
             <h3 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">No Active Sessions</h3>
             <p className="text-slate-500 font-medium italic max-w-sm mx-auto">
               There are no live classes ongoing at this moment. Please check your Time Table for upcoming sessions.
             </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
