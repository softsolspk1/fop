"use client";

import React, { useEffect, useRef, useState } from 'react';
import { WhiteWebSdk, Room, RoomPhase, ViewMode } from 'whiteboard-sdk';

interface AgoraWhiteboardProps {
  appId: string;
  uuid: string;
  token: string;
  uid: number;
}

export default function AgoraWhiteboard({ appId, uuid, token, uid }: AgoraWhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [phase, setPhase] = useState<RoomPhase>(RoomPhase.Connecting);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !appId || !uuid || !token) return;

    const sdk = new WhiteWebSdk({
      appIdentifier: appId,
      region: 'in-mum',
    });

    const joinRoom = async () => {
      try {
        const room = await sdk.joinRoom({
          uuid,
          roomToken: token,
          uid: uid.toString(),
        });
        roomRef.current = room;
        room.bindHtmlElement(containerRef.current);
        room.setViewMode(ViewMode.Broadcaster); // For teachers/hosts
        setPhase(room.phase);
        
        room.callbacks.on("onPhaseChanged", (p) => {
          setPhase(p);
        });
      } catch (err) {
        console.error('Whiteboard join error:', err);
      }
    };

    joinRoom();

    return () => {
      roomRef.current?.disconnect();
    };
  }, [appId, uuid, token, uid]);

  return (
    <div className="w-full h-full bg-white rounded-2xl relative overflow-hidden board-container shadow-inner min-h-[400px]">
      <div ref={containerRef} className="w-full h-full" style={{ height: '100%', width: '100%' }} />
      {phase === RoomPhase.Connecting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-black uppercase tracking-widest text-purple-600">Initializing Board...</span>
            </div>
        </div>
      )}
    </div>
  );
}
