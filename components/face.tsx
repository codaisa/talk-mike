/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { type RefObject, useEffect, useState, useRef } from "react";
import { renderBasicFace } from "./basic-face-render";
import useHover from "@/hooks/use-hover";
import useTilt from "@/hooks/use-tilt";
import useFace from "@/hooks/use-face";
import { useTrackVolume, useVoiceAssistant } from "@livekit/components-react";

type BasicFaceProps = {
  /** The canvas element on which to render the face. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** The radius of the face. */
  radius?: number;
  /** The color of the face. */
  color?: string;
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
}: BasicFaceProps) {
  const [scale, setScale] = useState(0.1);

  const { audioTrack } = useVoiceAssistant();
  const volume = useTrackVolume(audioTrack);

  // Face state
  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: volume > 0,
  });

  useEffect(() => {
    function calculateScale() {
      const baseScale = Math.min(window.innerWidth, window.innerHeight) / 1000;
      // Always use desktop scale - force desktop mode
      setScale(baseScale);
    }
    window.addEventListener("resize", calculateScale);
    calculateScale();
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  // Render the face on the canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")!;
    if (ctx) {
      renderBasicFace({ ctx, mouthScale, eyeScale, color });
    }
  }, [canvasRef, eyeScale, mouthScale, color, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={radius * 2 * scale}
      height={radius * 2 * scale}
      style={{
        display: "block",
        borderRadius: "50%",
        transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
      }}
    />
  );
}
