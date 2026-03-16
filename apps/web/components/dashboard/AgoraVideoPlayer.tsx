"use client";

import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

interface AgoraVideoPlayerProps {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: 'audience' | 'host';
}

export default function AgoraVideoPlayer({ appId, channel, token, uid, role }: AgoraVideoPlayerProps) {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAgora = async () => {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      if (role === 'host') {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        
        await clientRef.current.join(appId, channel, token, uid);
        await clientRef.current.publish([audioTrack, videoTrack]);
        
        if (videoRef.current) {
          videoTrack.play(videoRef.current);
        }
      } else {
        await clientRef.current.join(appId, channel, token, uid);
      }

      clientRef.current.on('user-published', async (user, mediaType) => {
        await clientRef.current?.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers((prev) => [...prev, user]);
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
      clientRef.current?.leave();
    };
  }, [appId, channel, token, uid, role]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full bg-slate-900 p-4 rounded-3xl relative overflow-hidden">
      {role === 'host' && (
        <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-lg group">
          <div ref={videoRef} className="w-full h-full" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Host (You)</span>
          </div>
        </div>
      )}

      {remoteUsers.map((user) => (
        <RemoteVideo key={user.uid} user={user} />
      ))}

      {remoteUsers.length === 0 && role !== 'host' && (
        <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium">Waiting for the lecturer to start...</p>
        </div>
      )}
    </div>
  );
}

function RemoteVideo({ user }: { user: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
  }, [user]);

  return (
    <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-sm transition-transform hover:scale-[1.02]">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Lecturer</span>
      </div>
    </div>
  );
}
