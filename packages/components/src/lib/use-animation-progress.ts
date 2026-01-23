import { useCurrentFrame, useVideoConfig } from "remotion";

export interface AnimationProgressOptions {
  delay?: number;
  durationInFrames?: number;
}

export const useAnimationProgress = (
  options: AnimationProgressOptions = {}
): number => {
  const frame = useCurrentFrame();
  const { durationInFrames: totalDuration } = useVideoConfig();

  const { delay = 0, durationInFrames = totalDuration - delay } = options;

  const adjustedFrame = frame - delay;

  if (adjustedFrame < 0) {
    return 0;
  }

  if (adjustedFrame >= durationInFrames) {
    return 1;
  }

  return adjustedFrame / durationInFrames;
};
