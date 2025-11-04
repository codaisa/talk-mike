/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useRef, useState } from "react";

export type FaceResults = {
  /** A value that represents how open the eyes are. */
  eyesScale: number;
  /** A value that represents how open the mouth is. */
  mouthScale: number;
};

function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}

// Constrain value between lower and upper limits
function clamp(x: number, lowerlimit: number, upperlimit: number) {
  if (x < lowerlimit) x = lowerlimit;
  if (x > upperlimit) x = upperlimit;
  return x;
}

// GLSL smoothstep implementation
function smoothstep(edge0: number, edge1: number, x: number) {
  // Scale, bias, and saturate to range [0,1]
  x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  // Apply cubic polynomial smoothing
  return x * x * (3 - 2 * x);
}

type BlinkProps = {
  speed: number;
};

export function useBlink({ speed }: BlinkProps) {
  const [eyeScale, setEyeScale] = useState(1);
  const [frame, setFrame] = useState(0);

  const frameId = useRef(-1);

  useEffect(() => {
    function nextFrame() {
      frameId.current = window.requestAnimationFrame(() => {
        setFrame(frame + 1);
        let s = easeOutQuint((Math.sin(frame * speed) + 1) * 2);
        s = smoothstep(0.1, 0.25, s);
        s = Math.min(1, s);
        setEyeScale(s);
        nextFrame();
      });
    }

    nextFrame();

    return () => {
      window.cancelAnimationFrame(frameId.current);
    };
  }, [speed, eyeScale, frame]);

  return eyeScale;
}

export default function useFace() {
  const volume = 0
  const eyeScale = useBlink({ speed: 0.0125 });
  const [mouthScale, setMouthScale] = useState(0);
  const [lastMouthUpdate, setLastMouthUpdate] = useState(Date.now());
  const stuckThreshold = 3000; // 3 seconds
  const stuckMouthThreshold = 0.3; // mouth considered "stuck open" above this value

  useEffect(() => {
    const newMouthScale = volume / 2;
    const now = Date.now();
    
    // Update mouth scale
    setMouthScale(newMouthScale);
    
    // Check if mouth is stuck open
    if (newMouthScale > stuckMouthThreshold) {
      // If mouth has been open for too long, it might be stuck
      if (now - lastMouthUpdate > stuckThreshold) {
        console.warn("🔴 AVATAR MOUTH STUCK DETECTED:", {
          mouthScale: newMouthScale,
          volume,
          timeStuck: now - lastMouthUpdate,
          timestamp: new Date().toISOString()
        });
        
        // Force reset mouth position
        setMouthScale(0);
        console.log("✅ AVATAR MOUTH RESET - Forced mouth to close");
      }
    } else {
      // Update last update time when mouth moves to normal position
      setLastMouthUpdate(now);
    }
  }, [volume, lastMouthUpdate]);

  // Additional monitoring for debugging
  useEffect(() => {
    if (mouthScale > 0.5) {
      console.log("👄 MOUTH WIDE OPEN:", { mouthScale, volume, timestamp: new Date().toISOString() });
    }
  }, [mouthScale, volume]);

  return { eyeScale, mouthScale };
}
