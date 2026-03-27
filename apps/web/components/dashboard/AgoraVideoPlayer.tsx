"use client";

import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

interface AgoraVideoPlayerProps {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: 'audience' | 'host';
  participants?: any[];
  isScreenSharing?: boolean;
  onScreenShareEnd?: () => void;
}

export default function AgoraVideoPlayer({ 
  appId, channel, token, uid, role, 
  participants = [],
  isScreenSharing = false, 
  onScreenShareEnd 
}: AgoraVideoPlayerProps) {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Helper to get name from uid
  const getUserName = (remoteUid: any) => {
    const p = participants.find(part => part.agoraUid === Number(remoteUid));
    return p ? p.name : `User ${remoteUid}`;
  };
  
  useEffect(() => {
    const initAgora = async () => {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      if (role === 'host') {
        try {
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          
          await clientRef.current.join(appId, channel, token, uid);
          await clientRef.current.publish([audioTrack, videoTrack]);
          
          if (videoRef.current) {
            videoTrack.play(videoRef.current);
          }
        } catch (err) {
          console.error("Error creating tracks:", err);
        }
      } else {
        await clientRef.current.join(appId, channel, token, uid);
      }

      clientRef.current.on('user-published', async (user, mediaType) => {
        await clientRef.current?.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers((prev) => {
            if (prev.find(u => u.uid === user.uid)) return prev;
            return [...prev, user];
          });
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      clientRef.current.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });
    };

    initAgora();

    return () => {
      localAudioTrack?.close();
      localVideoTrack?.close();
      screenTrack?.close();
      clientRef.current?.leave();
    };
  }, [appId, channel, token, uid, role]);

  // Handle Screen Sharing
  useEffect(() => {
    if (role !== 'host') return;

    const startScreenShare = async () => {
      if (isScreenSharing && !screenTrack) {
        try {
          const result = await AgoraRTC.createScreenVideoTrack({}, "auto");
          const track = Array.isArray(result) ? result[0] : result;
          setScreenTrack(track);
          if (clientRef.current) {
            await clientRef.current.publish(track);
          }
          if (screenRef.current) {
            track.play(screenRef.current);
          }
          track.on("track-ended", () => {
             stopScreenShare();
             if (onScreenShareEnd) onScreenShareEnd();
          });
        } catch (err) {
          console.error("Failed to create screen track:", err);
          if (onScreenShareEnd) onScreenShareEnd();
        }
      } else if (!isScreenSharing && screenTrack) {
        stopScreenShare();
      }
    };

    const stopScreenShare = async () => {
      if (screenTrack) {
        if (clientRef.current) {
          await clientRef.current.unpublish(screenTrack);
        }
        screenTrack.close();
        setScreenTrack(null);
      }
    };

    startScreenShare();
  }, [isScreenSharing, role]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Main Stage (Screen Share or Primary Video) */}
      <div className="flex-1 min-h-0 relative">
          {screenTrack ? (
            <div className="w-full h-full bg-slate-800 rounded-3xl overflow-hidden border-4 border-blue-500 shadow-2xl relative group">
                <div ref={screenRef} className="w-full h-full" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-sm font-black text-white uppercase tracking-widest">Presenting Screen</span>
                </div>
            </div>
          ) : (
            <div className={`w-full h-full bg-slate-900/50 p-2 rounded-3xl relative overflow-hidden flex flex-wrap gap-2 justify-center items-center`}>
               {role === 'host' && (
                <div className={`relative bg-slate-800 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-lg group transition-all duration-500 ${remoteUsers.length === 0 ? 'w-full h-full max-h-[85vh]' : 'aspect-video flex-1 min-w-[300px]'}`}>
                  <div ref={videoRef} className="w-full h-full [&>div]:!object-cover" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Host (You)</span>
                  </div>
                </div>
              )}

              {remoteUsers.map((user) => (
                <div key={user.uid} className={`relative bg-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-sm transition-all duration-500 ${remoteUsers.length === 1 && role !== 'host' ? 'w-full h-full max-h-[85vh]' : 'aspect-video flex-1 min-w-[300px]'}`}>
                   <RemoteVideo user={user} name={getUserName(user.uid)} />
                </div>
              ))}

              {remoteUsers.length === 0 && role !== 'host' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-10 h-10 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xl font-black uppercase tracking-widest text-slate-500">Waiting for Lecture to Start...</p>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Grid view when screening */}
      {screenTrack && (
        <div className="h-40 flex gap-4 overflow-x-auto pb-2 shrink-0">
           {role === 'host' && (
             <div className="aspect-video h-full bg-slate-800 rounded-xl overflow-hidden border border-white/10 relative shrink-0">
                <div ref={videoRef} className="w-full h-full" />
                <p className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded text-white">You</p>
             </div>
           )}
           {remoteUsers.map((user) => (
              <div key={user.uid} className="aspect-video h-full shrink-0">
                <RemoteVideo user={user} name={getUserName(user.uid)} />
              </div>
           ))}
        </div>
      )}
    </div>
  );
}

function RemoteVideo({ user, name }: { user: any, name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
  }, [user]);

  return (
    <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-sm transition-transform hover:scale-[1.02] w-full h-full">
      <div ref={containerRef} className="w-full h-full [&>div]:!object-cover" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
        <span className="text-xs font-bold text-white uppercase tracking-wider">{name}</span>
      </div>
    </div>
  );
}
