import 'regenerator-runtime/runtime';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { WhiteWebSdk, Room, RoomPhase, ViewMode } from 'white-web-sdk';

// React 19 Shim for Whiteboard SDK
if (typeof window !== 'undefined' && !(ReactDOM as any).render) {
  (ReactDOM as any).render = (element: any, container: any) => {
    const root = createRoot(container);
    root.render(element);
  };
}

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !appId || !uuid || !token) {
      return;
    }

    let sdk: WhiteWebSdk;
    // Defensive check for App ID
    if (!appId || appId === '876dc55e0241436fb6c63433afeb9563') {
      setError('Whiteboard not configured. Please provide a valid Netless App Identifier in .env');
      setIsLoading(false);
      return;
    }

    try {
      sdk = new WhiteWebSdk({
        appIdentifier: appId,
        region: 'in-mum', 
      });
    } catch (e: any) {
      setError(`Whiteboard Initialization Failed: ${e.message || 'Check App ID'}`);
      setIsLoading(false);
      return;
    }

    const joinRoom = async () => {
      try {
        const room = await sdk.joinRoom({
          uuid: uuid,
          roomToken: token,
          uid: String(uid)
        });
        roomRef.current = room;
        
        if (containerRef.current) {
          room.bindHtmlElement(containerRef.current);
        }
        
        room.setViewMode(ViewMode.Broadcaster); 
        setPhase(room.phase);
        
        room.callbacks.on("onPhaseChanged", (p: RoomPhase) => {
          setPhase(p);
        });
        setIsLoading(false);
      } catch (err: any) {
        console.error('[Whiteboard]: Join error:', err);
        setError(`Failed to join whiteboard: ${err.message || 'Check credentials'}`);
        setIsLoading(false);
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
