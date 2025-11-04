"use client";

import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  RoomContext,
  useTracks,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Play, Square } from "lucide-react";
import Header from "@/components/header";
import BasicFace from "@/components/face";
import { AnimatePresence, motion } from "framer-motion";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  function generate6DigitHash() {
    return Math.random().toString(36).substring(2, 8);
  }

  const room = useMemo(() => {
    return searchParams.get("roomId") || generate6DigitHash();
  }, [searchParams]);
  const name = generate6DigitHash();

  console.log("ROOM:", room);
  console.log("USERNAME:", name);

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

  useEffect(() => {
    if (isConnected) {
      if (roomInstance) {
        toggleMicrophone();
      }
    }
  }, [isConnected]);

  return (
    <RoomContext.Provider value={roomInstance}>
      <RoomAudioRenderer />
      <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-900  to-slate-800 ">
        <Header roomId={room} showShareButton={true} />

        <motion.div
          layout
          className="flex flex-col h-full w-full items-center justify-center gap-16"
        >
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <BasicFace canvasRef={faceCanvasRef!} color="#a142f4" />
            </motion.div>
          ) : (
            <MyVideoConference />
          )}

          <section className="flex items-center gap-2">
            <AnimatePresence>
              {isConnected && (
                <motion.nav
                  className={cn("actions-nav", { disabled: !isConnected })}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <button
                    className={cn("action-button mic-button")}
                    onClick={toggleMicrophone}
                  >
                    {isMicrophoneEnabled ? (
                      <Mic size={20} />
                    ) : (
                      <MicOff size={20} />
                    )}
                  </button>
                </motion.nav>
              )}
            </AnimatePresence>

            <motion.nav
              className={cn("actions-nav", { disabled: !isConnected })}
              layout
            >
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
                {isJoining ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isConnected ? (
                  <Square size={20} />
                ) : (
                  <Play size={20} />
                )}
              </button>
            </motion.nav>
          </section>
        </motion.div>
      </div>
    </RoomContext.Provider>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const agentTracks = tracks.filter((trackRef) => {
    const participant = trackRef.participant;
    return (
      participant?.identity?.includes("agent") ||
      participant?.metadata?.includes("agent") ||
      participant?.name?.toLowerCase().includes("agent")
    );
  });

  return (
    <GridLayout
      tracks={agentTracks}
      style={{ height: "fit-content", width: "fit-content" }}
    >
      <ParticipantTile>
        <BasicFaceComponent />
      </ParticipantTile>
    </GridLayout>
  );
}

function BasicFaceComponent() {
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <BasicFace canvasRef={faceCanvasRef!} color="#a142f4" />
      </motion.div>
    </AnimatePresence>
  );
}
