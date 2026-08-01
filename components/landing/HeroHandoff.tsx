"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Crossfades the Hero out and the next section in as the Hero's sticky pin
// releases. `trigger` is the Hero's own wrapping element, so the window is
// always derived from its *actual* current bounding box (via ScrollTrigger,
// recalculated on scroll/resize) rather than a hand-measured pixel
// threshold — the wrong kind of measurement is exactly what caused the
// earlier Framer Motion version of this to hide HowItWorks by mistake.
// start "bottom bottom" → the Hero's bottom edge reaches the viewport's
// bottom edge (its sticky pin is about to release). end "bottom top" → its
// bottom edge reaches the viewport's top (fully scrolled past) — the same
// one-viewport-height window used before, just driven by ScrollTrigger's
// own trigger geometry instead of a separately computed offset.
export default function HeroHandoff({
  hero,
  nextSection,
}: {
  hero: ReactNode;
  nextSection: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!heroRef.current || !nextRef.current) return;

      gsap.set(nextRef.current, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "bottom bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      tl.to(heroRef.current, { opacity: 0, ease: "none" }, 0).to(
        nextRef.current,
        { opacity: 1, ease: "none" },
        0
      );

      // The Hero renders a short static placeholder first (its own
      // pre-hydration/mobile fallback) and swaps to the tall 900vh scroll
      // variant once it mounts on desktop, changing its height well after
      // this effect first runs. Three redundant, independent triggers for
      // re-measuring once that settles — any one of them firing is enough:
      // a ResizeObserver on the Hero itself (the direct signal), a couple
      // of animation frames in (covers the swap's own render+layout pass),
      // and the window `load` event (covers late webfont/asset reflow).
      const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(heroRef.current);

      const rafId = requestAnimationFrame(() =>
        requestAnimationFrame(() => ScrollTrigger.refresh())
      );

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(rafId);
        window.removeEventListener("load", onLoad);
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <div ref={heroRef}>{hero}</div>
      <div ref={nextRef}>{nextSection}</div>
    </div>
  );
}
