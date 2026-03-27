"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AgoraVideoPlayer from '../../../../../components/dashboard/AgoraVideoPlayer';
import dynamic from 'next/dynamic';

const AgoraWhiteboard = dynamic(() => import('../../../../../components/dashboard/AgoraWhiteboard'), {
  ssr: false,
});
import api from '../../../../../lib/api';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, Users, Settings, X, LogOut, Send, PenTool, FileText, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LiveClassPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'files'>('chat');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const sessionId = searchParams.get('sessionId') || searchParams.get('classId');
  
  const [agoraConfig, setAgoraConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinData = async () => {
      try {
        setLoading(true);
        if (!sessionId) {
          toast.error("No active session ID provided.");
          router.push(`/dashboard/courses/${params.id}`);
          return;
        }

        const res = await (api as any).get(`/classes/${sessionId}/join`);
        setAgoraConfig({
          appId: res.data.appId,
          channel: res.data.channel,
          token: res.data.token,
          uid: res.data.uid,
          whiteboard: res.data.whiteboard,
          role: user?.role === 'STUDENT' ? 'audience' : 'host',
          courseName: res.data.courseName || 'Live Session',
          isFaculty: user?.role !== 'STUDENT'
        });

        // Fetch initial participants
        const partsRes = await (api as any).get(`/classes/${sessionId}/participants`);
        setParticipants(partsRes.data);
      } catch (err) {
        console.error('Error fetching join data:', err);
        toast.error("Failed to authenticate session.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchJoinData();
  }, [params.id, sessionId, user, router]);

  useEffect(() => {
    let syncInterval: any;
    let heartbeatInterval: any;

    if (isJoined && agoraConfig && sessionId) {
      // Sync function
      const syncSession = async () => {
        try {
          const res = await (api as any).get(`/classes/${sessionId}/sync`);
          if (res.data.participants) setParticipants(res.data.participants);
          if (res.data.messages) setMessages(res.data.messages);
          if (res.data.assets) setSharedFiles(res.data.assets);
        } catch (err) {
          console.error('Sync failed:', err);
        }
      };

      // Heartbeat function
      const sendHeartbeat = async () => {
        try {
          await (api as any).post(`/classes/${sessionId}/heartbeat`, { agoraUid: agoraConfig.uid });
        } catch (err) {}
      };

      syncSession();
      sendHeartbeat();
      syncInterval = setInterval(syncSession, 5000);
      heartbeatInterval = setInterval(sendHeartbeat, 10000);
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [isJoined, agoraConfig, sessionId]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && sessionId) {
      const pendingText = inputMessage;
      setInputMessage(''); // Clear immediately for UX
      try {
        await (api as any).post(`/classes/${sessionId}/messages`, { content: pendingText });
        // Optionally add to state immediately with formatted time
        setMessages((prev) => [...prev, { 
          sender: user?.name || 'Me', 
          text: pendingText, 
          time: new Date().toISOString(),
          senderId: user?.id 
        }]);
      } catch (err) {
        toast.error("Failed to send message");
        setInputMessage(pendingText); // Restore on failure
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !sessionId) return;

     setIsUploading(true);
     const formData = new FormData();
     formData.append('file', file);
     formData.append('upload_preset', 'ml_default');

     try {
       const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dq78ed4vu'}/upload`, {
         method: 'POST',
         body: formData,
       });
       const data = await res.json();
       
       const title = file.name;
       const url = data.secure_url;
       const type = file.type.includes('video') ? 'video' : 'file';

       await (api as any).post(`/classes/${sessionId}/assets`, { title, url, type });
       
       toast.success(`${type === 'video' ? 'Video' : 'File'} shared successfully!`);
     } catch (err) {
       toast.error("Share failed.");
     } finally {
       setIsUploading(false);
     }
  };

  const handleLeaveSession = async () => {
     if(confirm('Are you sure you want to leave this session?')) {
        try {
          await (api as any).post(`/classes/${sessionId}/leave`);
        } catch (e) {}
        router.push(`/dashboard/courses`);
     }
  };

  const handleStopSession = async () => {
    if(confirm('Are you sure you want to END this session for everyone?')) {
       try {
         await (api as any).put(`/classes/${sessionId}/stop`);
         await (api as any).post(`/classes/${sessionId}/leave`);
       } catch (e) {}
       router.push(`/dashboard/courses`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white font-sans">
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-slate-900/50 border-b border-white/10 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Live
            </div>
            <div>
              <h2 className="text-sm font-bold truncate max-w-[200px] md:max-w-[400px]">{agoraConfig?.courseName || 'Live Session'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{participants.length} Active Participants</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {user?.role === 'FACULTY' || user?.role === 'SUPER_ADMIN' ? (
                <>
                  <button 
                    onClick={handleStopSession}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    End Session
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm('Are you sure you want to PERMANENTLY DELETE this session and all its data?')) {
                        try {
                          await api.delete(`/classes/${sessionId}`);
                          toast.success("Session deleted successfully");
                          router.push(`/dashboard/courses/${params.id}`);
                        } catch (err) {
                          toast.error("Failed to delete session");
                        }
                      }
                    }}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Session
                  </button>
                </>
             ) : (
               <button 
                 onClick={handleLeaveSession}
                 className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all"
               >
                 <LogOut className="w-4 h-4" />
                 Leave
               </button>
             )}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
          {/* Main Stage (Video or Whiteboard) */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : ''}`}>
             {!isJoined ? (
               <div className="flex-1 bg-slate-900 rounded-[32px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 shadow-inner">
                  <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mb-6 animate-bounce"><Video className="w-12 h-12" /></div>
                  <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">Ready to join your class?</h3>
                  <p className="text-slate-400 mb-10 max-w-sm text-center font-medium">Connecting as <span className="text-blue-400 font-black uppercase">{user?.role}</span></p>
                  <button 
                    disabled={!agoraConfig || loading}
                    onClick={() => setIsJoined(true)}
                    className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl transition-all disabled:opacity-50 hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (user?.role === 'STUDENT' ? 'Enter Classroom' : 'Start Lecture')}
                  </button>
               </div>
             ) : (
               <div className="flex-1 rounded-[32px] bg-slate-900 border border-white/5 shadow-2xl overflow-hidden relative group">
                   <AgoraVideoPlayer 
                     {...agoraConfig}
                     participants={participants}
                     isScreenSharing={isScreenSharing}
                     onScreenShareEnd={() => setIsScreenSharing(false)}
                   />

                  {/* Stage Utilities */}
                  <div className="absolute bottom-6 right-6 flex gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl transition-all hover:scale-110"
                        title={isFullScreen ? "Exit Full Screen" : "Fill Screen"}
                      >
                        {isFullScreen ? <X className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
                      </button>
                  </div>
               </div>
             )}
          </div>

          {/* Sidebar Area */}
          {!isFullScreen && (
            <div className="w-80 bg-slate-900/50 rounded-[32px] border border-white/10 flex flex-col shrink-0 overflow-hidden shadow-2xl">
               {/* Sidebar Tabs */}
               <div className="flex border-b border-white/5 p-2 gap-1 bg-slate-950/20">
                  {['chat', 'participants', 'files'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {activeTab === 'chat' && (
                    <div className="space-y-4">
                       {messages.length === 0 ? (
                         <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]">No messages yet</div>
                       ) : (
                         messages.map((m, i) => (
                           <div key={i} className="flex flex-col gap-1 anim-fade-in group">
                             <div className="flex justify-between items-center">
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{m.sender}</p>
                               <p className="text-[8px] font-bold text-slate-600">
                                 {m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                               </p>
                             </div>
                             <div className="bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                               <p className="text-xs text-slate-200 leading-relaxed">{m.text}</p>
                             </div>
                           </div>
                         ))
                       )}
                    </div>
                  )}

                  {activeTab === 'participants' && (
                    <div className="space-y-3">
                      {participants.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                           <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black uppercase shadow-lg">{p.name[0]}</div>
                           <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">{p.name}</p>
                             <div className="flex items-center gap-2">
                               <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{p.role}</p>
                               {p.role === 'STUDENT' && (
                                 <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${p.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                   {p.status}
                                 </span>
                               )}
                             </div>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                {p.joinTime ? new Date(p.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Joining'}
                              </span>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'files' && (
                    <div className="space-y-4">
                       {(user?.role === 'FACULTY' || user?.role === 'SUPER_ADMIN') && (
                          <div className="relative group">
                             <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                             <button disabled={isUploading} className="w-full py-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95">
                               {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                               {isUploading ? 'Uploading...' : 'Share Resource'}
                             </button>
                          </div>
                       )}
                       
                       <div className="space-y-3">
                          {sharedFiles.length === 0 ? (
                            <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]">No shared resources</div>
                          ) : (
                            sharedFiles.map((f, i) => (
                              <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group overflow-hidden">
                                 <p className="text-xs font-bold text-slate-200 truncate mb-3">{f.name}</p>
                                 {f.type === 'video' ? (
                                   <video src={f.url} controls className="w-full h-auto rounded-xl mb-3 shadow-2xl border border-white/10" />
                                 ) : (
                                   <div className="flex items-center gap-2 py-3 px-4 bg-slate-950/40 rounded-xl mb-3 border border-white/5">
                                      <FileText className="w-4 h-4 text-blue-400" />
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Document Asset</span>
                                   </div>
                                 )}
                                 <div className="flex justify-between items-center bg-slate-950/20 -m-4 mt-2 px-4 py-3">
                                    <p className="text-[8px] font-black text-slate-500 uppercase">BY {f.sender}</p>
                                    <a href={f.url} download target="_blank" className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase underline-offset-4 hover:underline">Download</a>
                                 </div>
                              </div>
                            ))
                          )}
                       </div>
                    </div>
                  )}

                  {activeTab === 'whiteboard' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-purple-600/5 rounded-3xl border border-purple-600/10">
                       <PenTool className="w-12 h-12 text-purple-600 mb-4 animate-pulse" />
                       <h4 className="text-sm font-black uppercase tracking-tighter text-purple-600 mb-2">Interactive Board Active</h4>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed">The whiteboard is currently active on the main stage. You can illustrate and explain concepts in real-time.</p>
                       <button 
                        onClick={() => setActiveTab('chat')}
                        className="mt-6 px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                       >
                         Back to Chat
                       </button>
                    </div>
                  )}
               </div>

               {/* Message Input (Only for Chat Tab) */}
               {activeTab === 'chat' && (
                  <div className="p-4 bg-slate-950/40 border-t border-white/5">
                    <div className="relative">
                      <input 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full bg-slate-800/50 rounded-2xl px-5 py-4 text-xs font-medium outline-none border border-white/5 focus:border-blue-500 focus:bg-slate-800 transition-all shadow-inner placeholder:text-slate-600"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-xl text-white shadow-lg transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
               )}
            </div>
          )}
        </div>

        {/* Global Controls Overlay/Footer */}
        <div className="h-24 flex items-center justify-center gap-6 bg-slate-900/80 backdrop-blur-3xl border-t border-white/5 shrink-0 px-8 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${isMicOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button onClick={() => setIsCamOn(!isCamOn)} className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${isCamOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
              {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          </div>
          
          <div className="w-px h-10 bg-white/10 mx-2" />

          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                 setActiveTab('whiteboard');
                 setIsFullScreen(false);
               }}
               className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${activeTab === 'whiteboard' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
               title="Interactive Whiteboard"
             >
               <PenTool className="w-6 h-6" />
             </button>
             {user?.role !== 'STUDENT' && (
               <button 
                 onClick={() => setIsScreenSharing(!isScreenSharing)}
                 className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${isScreenSharing ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                 title="Share Screen"
               >
                 <ScreenShare className="w-6 h-6" />
               </button>
             )}
          </div>
          
          <div className="hidden lg:flex absolute right-8 items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                HD Connection
             </div>
             <div className="h-4 w-px bg-white/10" />
             AES-256 Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
