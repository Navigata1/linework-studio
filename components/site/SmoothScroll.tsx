"use client";
import { useEffect } from "react";

/**
 * GPU-friendly smooth scrolling (Lenis) with a gentle rubberband glide, plus
 * the global scroll-progress publisher (window.__scroll + --depth) that the
 * WebGL background and depth veil read.
 *
 * Hardening:
 * - In-page anchors (/#ethos etc.) are routed through lenis.scrollTo with a
 *   nav offset — Lenis/Next don't do this by themselves.
 * - If the Lenis import fails, or under prefers-reduced-motion, a native
 *   scroll listener still publishes progress so the story keeps working.
 */
export function SmoothScroll() {
  useEffect(() => {
    const publish = (scroll: number, limit: number) => {
      const p = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
      document.documentElement.style.setProperty("--depth", p.toFixed(4));
      window.__scroll = p;
    };

    const nativePublish = () => {
      publish(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lenis: {
      raf: (t: number) => void;
      destroy: () => void;
      on: (e: "scroll", cb: (d: { scroll: number; limit: number }) => void) => void;
      scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number }) => void;
    } | null = null;
    let cancelled = false;

    // anchor clicks → smooth glide (works for both lenis and native fallback)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"], a[href^="/#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href")!.replace(/^\//, "");
      if (!hash.startsWith("#") || hash === "#") return;
      const el = document.querySelector(hash);
      if (!el) return; // different page — let Next handle it
      e.preventDefault();
      history.pushState(null, "", hash);
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -72 });
      else (el as HTMLElement).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    };
    document.addEventListener("click", onClick);

    if (reduce) {
      // No smoothing — but the story still needs progress.
      nativePublish();
      window.addEventListener("scroll", nativePublish, { passive: true });
      return () => {
        document.removeEventListener("click", onClick);
        window.removeEventListener("scroll", nativePublish);
      };
    }

    (async () => {
      try {
        const mod = await import("lenis");
        if (cancelled) return;
        const Lenis = mod.default;
        lenis = new Lenis({
          lerp: 0.085,
          wheelMultiplier: 1,
          smoothWheel: true,
          syncTouch: false,
          touchMultiplier: 1.6,
        });
        document.documentElement.classList.add("lenis");
        lenis.on("scroll", ({ scroll, limit }) => publish(scroll, limit));
        const loop = (t: number) => {
          lenis!.raf(t);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch {
        // Lenis unavailable → native scroll still publishes the story.
        nativePublish();
        window.addEventListener("scroll", nativePublish, { passive: true });
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", nativePublish);
      lenis?.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  return null;
}
