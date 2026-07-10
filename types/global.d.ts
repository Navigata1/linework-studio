// Shared scroll progress (0..1) published by <SmoothScroll>, read by the
// WebGL background each frame.
declare global {
  interface Window {
    __scroll?: number;
  }
}

export {};
