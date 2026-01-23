import React from "react";
import { AbsoluteFill } from "remotion";
import {
  FadeIn,
  useAnimationProgress,
  easeOutCubic,
} from "@pixel-motion/components";

export const Main: React.FC = () => {
  const progress = useAnimationProgress({ delay: 30, durationInFrames: 60 });
  const scale = 0.8 + easeOutCubic(progress) * 0.2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FadeIn durationInFrames={30}>
        <div
          style={{
            transform: `scale(${scale})`,
            color: "white",
            fontSize: 80,
            fontWeight: "bold",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Pixel Motion
        </div>
      </FadeIn>

      <FadeIn durationInFrames={30} delay={45}>
        <div
          style={{
            color: "#888",
            fontSize: 32,
            marginTop: 20,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Create beautiful animations with React
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};
