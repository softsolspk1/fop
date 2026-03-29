"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AgoraVideoPlayer from '../../../../../components/dashboard/AgoraVideoPlayer';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const AgoraWhiteboard = dynamic(() => import('../../../../../components/dashboard/AgoraWhiteboard'), {
  ssr: false,
});
import api from '../../../../../lib/api';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, Users, Settings, X, LogOut, Send, PenTool, FileText, Loader2, Upload, Trash2 } from 'lucide-react';
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

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(searchParams.get('sessionId') || searchParams.get('classId') || null);
  const scheduledId = searchParams.get('scheduledId');
  const [scheduledMaterial, setScheduledMaterial] = useState<any>(null);
  
  const [agoraConfig, setAgoraConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinData = async () => {
      try {
        setLoading(true);
        // Use sessionId from URL if available, otherwise use params.id (which backend now treats as fallback)
        const idToJoin = currentSessionId || params.id;
        console.log('[Live] Attempting to join session/course ID:', idToJoin);
        
        let path = `/classes/${idToJoin}/join`;
        if (scheduledId) path += `?scheduledId=${scheduledId}`;
        
        const res = await (api as any).get(path);
        console.log('[Live] Join authenticated for class:', res.data.channel);
        
        if (res.data.type === 'scheduled') {
           setScheduledMaterial({
             url: res.data.videoUrl,
             title: res.data.title
           });
        }

        // Update currentSessionId if the backend redirected us to an auto-found session
        if (res.data.id && res.data.id !== currentSessionId) {
           setCurrentSessionId(res.data.id as string);
        }

        setAgoraConfig({
          appId: res.data.appId,
          channel: res.data.channel,
          token: res.data.token,
          uid: res.data.uid,
          role: user?.role === 'STUDENT' ? 'audience' : 'host',
          courseName: res.data.courseName || 'Live Session',
          isFaculty: user?.role !== 'STUDENT'
        });

        // Use the actual target session ID for participants/sync
        const targetId = res.data.id || idToJoin;

        // Fetch initial participants
        try {
          const partsRes = await (api as any).get(`/classes/${targetId}/participants`);
          setParticipants(partsRes.data);
        } catch (err) {}
      } catch (err: any) {
        console.error('[Live] Error fetching join data:', err.response?.data || err.message);
        toast.error(err.response?.data?.message || "Failed to authenticate session.");
        if (err.response?.status === 404) {
          router.push(`/dashboard/courses/${params.id}`);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchJoinData();
  }, [params.id, user, router]);

  useEffect(() => {
    let syncInterval: any;
    let heartbeatInterval: any;
    const targetId = currentSessionId || params.id;

    if (isJoined && agoraConfig && targetId) {
      // Sync function
      const syncSession = async () => {
        try {
          const res = await (api as any).get(`/classes/${targetId}/sync`);
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
          await (api as any).post(`/classes/${targetId}/heartbeat`, { agoraUid: agoraConfig.uid });
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
  }, [isJoined, agoraConfig, currentSessionId, params.id]);

  const handleSendMessage = async () => {
    const targetId = currentSessionId || params.id;
    if (inputMessage.trim() && targetId) {
      const pendingText = inputMessage;
      setInputMessage(''); // Clear immediately for UX
      try {
        await (api as any).post(`/classes/${targetId}/messages`, { content: pendingText });
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

   // handleFileUpload replacement logic is now in the modal

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Re-fetch materials when modal is opened or shared
  const fetchSessionAssets = async () => {
     const targetId = currentSessionId || params.id;
     if (targetId) {
        try {
          const res = await (api as any).get(`/classes/${targetId}/sync`);
          if (res.data.assets) setSharedFiles(res.data.assets);
        } catch (err) {}
     }
  };

  const handleLeaveSession = async () => {
     if(confirm('Are you sure you want to leave this session?')) {
        try {
          await (api as any).post(`/classes/${currentSessionId}/leave`);
        } catch (e) {}
        router.push(`/dashboard/courses`);
     }
  };

  const handleStopSession = async () => {
    if(confirm('Are you sure you want to END this session for everyone?')) {
       try {
         await (api as any).put(`/classes/${currentSessionId}/stop`);
         await (api as any).post(`/classes/${currentSessionId}/leave`);
       } catch (e) {}
       router.push(`/dashboard/courses`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white font-sans">
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Material Upload Modal (Linked to Course Resources) */}
        <AnimatePresence>
          {isMaterialModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMaterialModalOpen(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between text-slate-800">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Upload Course Resource</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">This file will be shared in this session and saved to course resources.</p>
                  </div>
                  <button onClick={() => setIsMaterialModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-800">
                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                        <input type="text" id="mat-title" placeholder="e.g. Lecture Presentation" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                           <select id="mat-type" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400">
                             <option value="DOCUMENT">Document</option>
                             <option value="PPT">PowerPoint</option>
                             <option value="VIDEO">Video</option>
                             <option value="IMAGE">Image</option>
                           </select>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Downloadable</label>
                            <select id="mat-download" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400">
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select File</label>
                        <input type="file" id="mat-file" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white" />
                      </div>
                      <button 
                        onClick={async (e) => {
                           const btn = e.currentTarget;
                           const title = (document.getElementById('mat-title') as HTMLInputElement).value;
                           const type = (document.getElementById('mat-type') as HTMLSelectElement).value;
                           const isDownloadable = (document.getElementById('mat-download') as HTMLSelectElement).value === 'true';
                           const file = (document.getElementById('mat-file') as HTMLInputElement).files?.[0];
                           const courseId = params.id;
                           const classId = currentSessionId || params.id;

                           if(!title || !file) return toast.error("Provide title and file");

                           try {
                             btn.disabled = true; btn.innerHTML = 'Uploading...';
                             const fd = new FormData();
                             fd.append('title', title);
                             fd.append('type', type);
                             fd.append('courseId', String(courseId));
                             fd.append('file', file);
                             fd.append('isDownloadable', String(isDownloadable));

                             // 1. Upload as Material (Persistence)
                             const matRes = await api.post('/lms/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                             
                             // 2. Also register as Session Asset (Immediate view in Live Class)
                             await api.post(`/classes/${classId}/assets`, { 
                               title, 
                               url: matRes.data.url, 
                               type: type.toLowerCase().includes('video') ? 'video' : 'file' 
                             });

                             toast.success("Resource shared and saved!");
                             setIsMaterialModalOpen(false);
                             fetchSessionAssets();
                           } catch (err) { toast.error("Upload failed"); }
                           finally { btn.disabled = false; btn.innerHTML = 'Confirm Share'; }
                        }}
                        className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 uppercase text-xs tracking-widest border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
                      >
                        Confirm Share
                      </button>
                    </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                   {scheduledMaterial ? (
                     <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden group/video">
                        <video 
                          src={scheduledMaterial.url} 
                          controls 
                          autoPlay={true}
                          className="w-full h-full object-contain shadow-2xl"
                        />
                        <div className="absolute top-8 left-8 bg-purple-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl border-b-4 border-purple-800 flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Now Streaming: {scheduledMaterial.title}
                        </div>
                     </div>
                   ) : (
                     <AgoraVideoPlayer 
                       {...agoraConfig}
                       participants={participants}
                       isScreenSharing={isScreenSharing}
                       onScreenShareEnd={() => setIsScreenSharing(false)}
                     />
                   )}

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
                             <button 
                                onClick={() => setIsMaterialModalOpen(true)}
                                className="w-full py-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95"
                              >
                               <Upload className="w-4 h-4" />
                               Share Resource
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
