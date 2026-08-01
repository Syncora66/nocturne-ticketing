"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const PARTICLE_COUNT = 8;

// Glowing seam dropped between two sections (Hero → HowItWorks): a full-width
// cyan hairline, a subtle violet depth halo behind it, and 8 sparks drifting
// off it. `anchorRef` is a zero-height flow element sitting exactly at the
// Hero/HowItWorks boundary — its absolutely-positioned child is centered on
// that point without pushing either section apart, and without needing
// `fixed` positioning (which would stay glued to the viewport instead of
// tracking this specific point in the document). pointer-events-none
// throughout so the overlay never intercepts clicks on the Hero CTA it
// happens to sit near while scrolling through.
export default function SlideTransition() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!anchorRef.current || !revealRef.current) return;

      gsap.set(revealRef.current, { opacity: 0, scaleX: 0.6 });
      gsap.to(revealRef.current, {
        opacity: 1,
        scaleX: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: anchorRef.current,
          start: "top 90%",
        },
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Drift distances shrink on narrow viewports so sparks stay inside
      // the visual instead of flying off a 375px screen.
      const driftScale = window.matchMedia("(max-width: 480px)").matches
        ? 0.5
        : 1;

      particleRefs.current.forEach((el, i) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { x: 0, y: 0, opacity: 0, scale: 0.6 },
          {
            x: () =>
              gsap.utils.random(30, 60) *
              driftScale *
              (Math.random() < 0.5 ? -1 : 1),
            y: () =>
              gsap.utils.random(40, 80) *
              driftScale *
              (Math.random() < 0.5 ? -1 : 1),
            opacity: 1,
            scale: 1,
            duration: () => gsap.utils.random(3, 4),
            ease: "power2.out",
            repeat: -1,
            repeatRefresh: true,
            yoyo: true,
            delay: i * 0.3,
          },
        );
      });
    },
    { scope: anchorRef },
  );

  return (
    <div ref={anchorRef} className="relative h-0" aria-hidden="true">
      <div
        ref={revealRef}
        className="pointer-events-none absolute inset-x-0 top-1/2 z-20 origin-center -translate-y-1/2"
      >
        <div className="relative h-40">
          {/* Cyan horizontal glow line — edge to edge, no padding/margin
              clipping it; deliberately NOT inside the max-w-6xl column below
              so it spans the true full page width. `inset-x-0` (not
              `w-screen`) on the wrapper above — 100vw includes the
              scrollbar's width, which this page's actual content area
              doesn't, so w-screen here was overflowing ~8px past the real
              right edge and forcing horizontal scroll. */}
          <div className="pulse-glow-line absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-tick8t-cyan shadow-[0_0_8px_2px_rgba(79,216,232,0.7),0_0_20px_5px_rgba(79,216,232,0.45),0_0_40px_10px_rgba(79,216,232,0.2)]" />

          {/* Halo + sparks stay centered in the content column — the glow
              line is the only element that needs to bleed to the edges. */}
          <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center px-6 sm:px-10 lg:px-16">
            {/* Subtle violet depth halo */}
            <div className="absolute h-28 w-2/3 rounded-full bg-tick8t-violet opacity-15 blur-3xl" />

            {/* Drifting cyan sparks */}
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  particleRefs.current[i] = el;
                }}
                className="absolute h-1.5 w-1.5 rounded-full bg-tick8t-cyan shadow-[0_0_8px_2px_rgba(79,216,232,0.7)]"
                style={{
                  left: "50%",
                  top: "50%",
                  marginLeft: "-3px",
                  marginTop: "-3px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
