"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AgoraVideoPlayer from '../../../../../components/dashboard/AgoraVideoPlayer';
import dynamic from 'next/dynamic';

const AgoraWhiteboard = dynamic(() => import('../../../../../components/dashboard/AgoraWhiteboard'), {
  ssr: false,
});
import api from '../../../../../lib/api';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, Users, Settings, X, LogOut, Send, PenTool } from 'lucide-react';
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
          courseName: res.data.courseName || 'Live Session'
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
      try {
        await (api as any).post(`/classes/${sessionId}/messages`, { content: inputMessage });
        setMessages((prev) => [...prev, { from: user?.name || 'Me', msg: inputMessage, time: new Date() }]);
        setInputMessage('');
      } catch (err) {
        toast.error("Failed to send message");
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
        router.push(`/dashboard/courses/${params.id}`);
     }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white">
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-slate-900/50 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse">Live</div>
            <div>
              <h2 className="text-lg font-bold">{agoraConfig?.courseName || 'Live Session'}</h2>
              <p className="text-xs text-slate-400">{participants.length} Participants Present</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('participants')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
              <Users className="w-5 h-5 text-slate-300" />
            </button>
            <button 
              onClick={handleLeaveSession}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
            >
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
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Connecting to Secure Session...</p>
              </div>
            ) : isJoined && agoraConfig ? (
              <div className="w-full h-full flex flex-col gap-4">
                {showWhiteboard && agoraConfig.whiteboard ? (
                  <div className="flex-1 min-h-0 bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                    <AgoraWhiteboard 
                      appId={'876dc55e0241436fb6c63433afeb9563'} // Shared App ID
                      uuid={agoraConfig.whiteboard.uuid}
                      token={agoraConfig.whiteboard.token}
                      uid={agoraConfig.uid}
                    />
                    <button onClick={() => setShowWhiteboard(false)} className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full z-20"><X className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0">
                    <AgoraVideoPlayer 
                      {...agoraConfig} 
                      participants={participants}
                      isScreenSharing={isScreenSharing} 
                      onScreenShareEnd={() => setIsScreenSharing(false)} 
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-slate-900 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-white/10">
                <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-6"><Video className="w-12 h-12" /></div>
                <h3 className="text-2xl font-bold mb-2">Ready to join your class?</h3>
                <p className="text-slate-400 mb-8 max-w-sm text-center">Join as <span className="text-blue-400 font-bold uppercase">{user?.role}</span></p>
                <button 
                  disabled={!agoraConfig}
                  onClick={() => setIsJoined(true)}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50"
                >
                  {user?.role === 'STUDENT' ? 'Enter Classroom' : 'Start Lecture'}
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Sidebar */}
          <div className="w-85 bg-slate-900 rounded-3xl border border-white/10 flex flex-col shrink-0">
            <div className="flex border-b border-white/5">
               {['chat', 'participants', 'files'].map((tab) => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {activeTab === 'chat' && (
                 <>
                    {messages.map((m, i) => (
                      <div key={i} className="flex flex-col gap-1 anim-fade-in">
                        <p className="text-[9px] font-black text-slate-500 uppercase">
                          {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm"><span className="font-bold text-blue-400">{m.from}:</span> {m.msg}</p>
                      </div>
                    ))}
                 </>
               )}

               {activeTab === 'participants' && (
                 <div className="space-y-4">
                   {participants.map((p, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold">{p.name[0]}</div>
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black">{p.role}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}

               {activeTab === 'files' && (
                 <div className="space-y-4">
                   <div className="relative">
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <button disabled={isUploading} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
                        {isUploading ? 'Uploading...' : 'Share a File'}
                      </button>
                   </div>
                   {sharedFiles.map((f, i) => (
                     <a key={i} href={f.url} target="_blank" className="block p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all">
                        <p className="text-sm font-bold text-blue-400 truncate">{f.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase mt-1">Shared by {f.sender}</p>
                     </a>
                   ))}
                 </div>
               )}
            </div>

            {activeTab === 'chat' && (
              <div className="p-6 pt-0">
                 <div className="relative">
                   <input 
                    value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Message..." className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
                   />
                   <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-1.5 rounded-lg"><Send className="w-4 h-4" /></button>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="h-24 flex items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 shrink-0 px-8">
          <button onClick={() => setIsMicOn(!isMicOn)} className={`p-5 rounded-2xl transition-all ${isMicOn ? 'bg-slate-800 text-white' : 'bg-red-500/20 text-red-500'}`}>
            {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </button>
          <button onClick={() => setIsCamOn(!isCamOn)} className={`p-5 rounded-2xl transition-all ${isCamOn ? 'bg-slate-800 text-white' : 'bg-red-500/20 text-red-500'}`}>
            {isCamOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
          </button>
          {user?.role !== 'STUDENT' && (
            <>
              <button 
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-5 rounded-2xl transition-all ${isScreenSharing ? 'bg-blue-600' : 'bg-slate-800 text-slate-400'}`}
              >
                <ScreenShare className="w-7 h-7" />
              </button>
              <button 
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className={`p-5 rounded-2xl transition-all ${showWhiteboard ? 'bg-purple-600' : 'bg-slate-800 text-slate-400'}`}
              >
                <PenTool className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
