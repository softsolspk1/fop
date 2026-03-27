import React, { useEffect, useRef, useState } from 'react';
import { WhiteWebSdk, Room, RoomPhase, ViewMode } from 'white-web-sdk';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !appId || !uuid || !token) {
      console.warn('[Whiteboard]: Missing required props for initialization');
      return;
    }

    let sdk: WhiteWebSdk;
    try {
      sdk = new WhiteWebSdk({
        appIdentifier: appId,
        region: 'in-mum',
      });
    } catch (e: any) {
      console.error('[Whiteboard]: SDK Init Error:', e);
      setError('Failed to initialize whiteboard SDK');
      return;
    }

    const joinRoom = async () => {
      try {
        const room = await sdk.joinRoom({
          uuid,
          roomToken: token,
          uid: uid.toString(),
        });
        roomRef.current = room;
        room.bindHtmlElement(containerRef.current);
        room.setViewMode(ViewMode.Broadcaster); 
        setPhase(room.phase);
        
        room.callbacks.on("onPhaseChanged", (p: RoomPhase) => {
          setPhase(p);
        });
      } catch (err: any) {
        console.error('[Whiteboard]: Join Error:', err);
        setError(`Failed to join whiteboard: ${err.message || 'Unknown error'}`);
      }
    };

    joinRoom();

    return () => {
      roomRef.current?.disconnect();
    };
  }, [appId, uuid, token, uid]);

  if (error) {
    return (
      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-8 text-center text-slate-600 rounded-3xl">
        <p className="font-bold text-red-500 mb-2">Whiteboard Error</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

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
