"use client";

import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  RoomContext,
  useParticipantContext,
  useTracks,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Play, Square } from "lucide-react";
import Header from "@/components/header";
import BasicFace from "@/components/face";

export default function Page() {
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

          {!isConnected ? (
            <div className="keynote-companion flex flex-col items-center justify-center h-full">
              <BasicFace canvasRef={faceCanvasRef!} color="#a142f4" />
            </div>
          ) : (
            <MyVideoConference />
          )}

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
                  {isJoining ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isConnected ? (
                    <Square size={20} />
                  ) : (
                    <Play size={20} />
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
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
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile>
        <BasicFaceComponent />
      </ParticipantTile>
    </GridLayout>
  );
}

function BasicFaceComponent() {
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const participant = useParticipantContext();

  const isAgent =
    participant?.identity?.includes("agent") ||
    participant?.metadata?.includes("agent") ||
    participant?.name?.toLowerCase().includes("agent");

  if (!isAgent) {
    return null;
  }

  return (
    <div className="keynote-companion flex flex-col items-center justify-center h-full">
      <BasicFace canvasRef={faceCanvasRef!} color="#a142f4" />
    </div>
  );
}
