export const FRAME_COUNT = 61;
export const FRAME_WIDTH = 960;
export const FRAME_HEIGHT = 540;

export function framePath(index: number): string {
  const n = String(index).padStart(3, "0");
  return `/tick8t-frames/frame_${n}.jpg`;
}

export const FRAME_PATHS = Array.from({ length: FRAME_COUNT }, (_, i) =>
  framePath(i + 1)
);
