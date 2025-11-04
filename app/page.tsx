"use client";

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  RoomContext,
  useTracks,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Play, Square } from "lucide-react";
import Header from "@/components/header";
import { motion } from "framer-motion";
import BasicFace from "@/components/face";

export default function Page() {
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);

  function generate6DigitHash() {
    return Math.random().toString(36).substring(2, 8);
  }

  const room = generate6DigitHash();
  const name = "anonymous";
  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  const handleJoinRoom = async () => {
    setIsJoining(true);
    try {
      const resp = await fetch(`/api/token?room=${room}&username=${name}`);
      const data = await resp.json();
      if (data.token) {
        await roomInstance.connect(
          process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
          data.token
        );
        setIsConnected(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  const toggleMicrophone = async () => {
    if (roomInstance) {
      await roomInstance.localParticipant.setMicrophoneEnabled(
        !isMicrophoneEnabled
      );
      setIsMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  return (
    <RoomContext.Provider value={roomInstance}>
      <RoomAudioRenderer />
      <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-900  to-slate-800">
        <div className="flex w-full h-full overflow-auto">
          <Header />

          <motion.div
            className="streaming-console "
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="keynote-companion flex flex-col items-center justify-center h-full">
              <BasicFace canvasRef={faceCanvasRef!} color="#a142f4" />
            </div>
          </motion.div>

          <section className="control-tray">
            <nav className={cn("actions-nav", { disabled: !isConnected })}>
              <button
                className={cn("action-button mic-button")}
                onClick={toggleMicrophone}
              >
                {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </nav>

            <div className={cn("connection-container", { isConnected })}>
              <div className="connection-button-container">
                <button
                  className={cn("action-button connect-toggle", {
                    isConnected,
                  })}
                  onClick={
                    isConnected
                      ? () => {
                          roomInstance.disconnect();
                          setIsConnected(false);
                        }
                      : handleJoinRoom
                  }
                >
                  {isConnected ? <Square size={20} /> : <Play size={20} />}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </RoomContext.Provider>
  );
}
