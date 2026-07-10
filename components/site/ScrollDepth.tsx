"use client";
import { useEffect } from "react";

// Drives the page's descent: sets --depth (0 at the surface → 1 at the floor)
// on <html>, which the depth veil and glass tints read. rAF-throttled.
export function ScrollDepth() {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const d = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      document.documentElement.style.setProperty("--depth", d.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div className="depth-veil" aria-hidden />;
}
