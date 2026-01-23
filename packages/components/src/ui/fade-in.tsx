import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export interface FadeInProps {
  children: React.ReactNode;
  durationInFrames?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  durationInFrames = 30,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay, delay + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
