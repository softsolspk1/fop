"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/dashboard/DashboardLayout';
import AgoraVideoPlayer from '../../../../../components/dashboard/AgoraVideoPlayer';
import api from '../../../../../lib/api';
import { chatClient, initChat, sendMessage, onMessageReceived } from '../../../../../components/dashboard/AgoraChatService';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, Users, Settings, X, LogOut, Send } from 'lucide-react';

export default function LiveClassPage() {
  const params = useParams();
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [agoraConfig, setAgoraConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinData = async () => {
      try {
        setLoading(true);
        // If sessionId is provided, join that specific session, else fallback to course-based (if supported by backend)
        const idToJoin = sessionId || (params.id as string);
        const res = await (api as any).get(`/classes/${idToJoin}/join`);
        setAgoraConfig({
          appId: res.data.appId,
          channel: res.data.channel,
          token: res.data.token,
          uid: res.data.uid,
          userToken: 'mock_chat_token', 
          role: 'host' 
        });
      } catch (err) {
        console.error('Error fetching join data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJoinData();
  }, [params.id, sessionId]);

  useEffect(() => {
    if (isJoined && agoraConfig) {
      // Initialize Chat
      initChat(agoraConfig.uid.toString(), agoraConfig.userToken);
      
      onMessageReceived((msg) => {
        setMessages((prev) => [...prev, { from: msg.from, msg: msg.msg, time: new Date().toLocaleTimeString() }]);
      });
    }
  }, [isJoined, agoraConfig]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && agoraConfig) {
      sendMessage(agoraConfig.channel, inputMessage);
      setMessages((prev) => [...prev, { from: 'Me', msg: inputMessage, time: new Date().toLocaleTimeString() }]);
      setInputMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-slate-900/50 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse">Live</div>
            <div>
              <h2 className="text-lg font-bold">Advanced Pharmacology - Session 12</h2>
              <p className="text-xs text-slate-400">Dr. Sarah Ahmed • {120 + messages.length} Students Present</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
              <Users className="w-5 h-5 text-slate-300" />
            </button>
            <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all">
              <LogOut className="w-4 h-4" />
              Leave Session
            </button>
          </div>
        </header>

        {/* Video Area */}
        <div className="flex-1 p-6 overflow-hidden flex gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Authenticating Session...</p>
              </div>
            ) : isJoined && agoraConfig ? (
              <AgoraVideoPlayer {...agoraConfig} />
            ) : (
              <div className="w-full h-full bg-slate-900 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-white/10">
                <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Video className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ready to join your class?</h3>
                <p className="text-slate-400 mb-8 max-w-sm text-center">Ensure your camera and microphone are working. You are joining as a **Lecturer**.</p>
                <div className="flex gap-4">
                  <button 
                    disabled={!agoraConfig}
                    onClick={() => setIsJoined(true)}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                  >
                    {!agoraConfig ? 'Connection Failed' : 'Start Your Lecture'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 bg-slate-900 rounded-3xl border border-white/10 flex flex-col shrink-0">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Live Interaction
                </h3>
                <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/5 rounded-md transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <p className="text-center text-slate-500 text-xs py-10 italic">No messages yet. Start the conversation!</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className="flex flex-col gap-1.5 animate-in slide-in-from-right-2 duration-300">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.time}</p>
                    <p className="text-sm leading-relaxed">
                      <span className={`font-bold ${m.from === 'Me' ? 'text-blue-400' : 'text-purple-400'}`}>{m.from}:</span> {m.msg}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-6 pt-0">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Send a message..." 
                    className="w-full bg-slate-800 border-transparent rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-1.5 rounded-lg text-white hover:bg-blue-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="h-24 flex items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 shrink-0 px-8 relative">
          <div className="absolute left-8 flex items-center gap-3">
             <button onClick={() => setShowChat(!showChat)} className={`p-4 rounded-2xl transition-all ${showChat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-5 rounded-2xl transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
            >
              {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </button>
            <button 
              onClick={() => setIsCamOn(!isCamOn)}
              className={`p-5 rounded-2xl transition-all ${isCamOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
            >
              {isCamOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </button>
            <button className="p-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all hover:-translate-y-1">
              <ScreenShare className="w-7 h-7" />
            </button>
          </div>

          <div className="absolute right-8">
            <button className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
