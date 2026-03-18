'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Send, Search, Users, User, Hash, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages();
      // Mock socket-like behavior for now or setup real polling/socket
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChannel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChannels = async () => {
    try {
      const { data } = await api.get('/chat/groups');
      const { data: users } = await api.get('/users');
      
      const dmChannels = users.filter((u: any) => u.id !== user?.id).map((u: any) => ({
        id: u.id,
        name: u.name,
        type: 'DM',
        role: u.role,
        avatar: u.avatar
      }));

      setChannels([...data.map((g: any) => ({ ...g, type: 'GROUP' })), ...dmChannels]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChannel) return;
    try {
      const endpoint = activeChannel.type === 'GROUP' 
        ? `/chat/group/${activeChannel.id}/messages`
        : `/chat/dm/${activeChannel.id}/messages`;
      const { data } = await api.get(endpoint);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel) return;

    try {
      const endpoint = activeChannel.type === 'GROUP'
        ? `/chat/group/${activeChannel.id}/send`
        : `/chat/dm/${activeChannel.id}/send`;
      
      await api.post(endpoint, { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-160px)] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden shadow-blue-100/20">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-50 flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Messages</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-4 focus:ring-blue-100 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Channels</p>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  activeChannel?.id === channel.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeChannel?.id === channel.id ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {channel.type === 'GROUP' ? <Hash className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="text-left flex-1 overflow-hidden">
                  <p className="font-bold truncate text-sm">{channel.name}</p>
                  <p className={`text-[10px] uppercase tracking-tighter font-black ${
                    activeChannel?.id === channel.id ? 'text-white/70' : 'text-slate-400'
                  }`}>
                    {channel.type === 'GROUP' ? 'Group Channel' : channel.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    {activeChannel.type === 'GROUP' ? <Hash className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{activeChannel.name}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="text-center py-10">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Beginning of encrypted history</p>
                </div>
                {messages.map((msg, idx) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                        <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium shadow-sm leading-relaxed ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200' 
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-8 bg-white border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <button type="button" className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all">
                    <Paperclip className="w-6 h-6" />
                  </button>
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Write a message to ${activeChannel.name}...`}
                    className="flex-1 px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800"
                  />
                  <button 
                    type="submit"
                    className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all border-b-4 border-blue-800"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
               <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[3rem] flex items-center justify-center mb-10 animate-bounce">
                  <Hash className="w-16 h-16" />
               </div>
               <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4 uppercase">KU Secure Messenger</h3>
               <p className="max-w-md text-slate-500 font-medium italic leading-relaxed">
                 Select a student, faculty member, or course group from the left to begin your real-time academic collaboration.
               </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
