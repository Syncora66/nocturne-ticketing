"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

type UseGsapHoverOptions = {
  scale?: number;
  glowColor?: string;
  duration?: number;
};

// Reusable hover micro-interaction: a subtle scale-up plus a soft neon glow
// on the element's own box-shadow, matching Tick8t's cyan accent. Kept as
// a plain mouseenter/mouseleave pair (not GSAP's `hover` helper, which
// doesn't exist) so it composes cleanly with any existing Tailwind
// hover: color classes on the same element — those animate color, this
// only ever touches transform/box-shadow.
export function useGsapHover(
  ref: RefObject<HTMLElement | null>,
  {
    scale = 1.03,
    glowColor = "rgba(79, 216, 232, 0.35)",
    duration = 0.25,
  }: UseGsapHoverOptions = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onEnter = () => {
      gsap.to(el, {
        scale,
        boxShadow: `0 0 32px 4px ${glowColor}`,
        duration,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        scale: 1,
        boxShadow: "0 0 0px 0px rgba(0, 0, 0, 0)",
        duration,
        ease: "power2.out",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      gsap.set(el, { clearProps: "scale,boxShadow" });
    };
  }, [ref, scale, glowColor, duration]);
}

// Same micro-interaction as useGsapHover, applied independently to every
// element in a ref array (e.g. a grid of cards built from a `.map()`,
// where each item holds its own ref rather than one shared ref).
export function useGsapHoverAll(
  refs: RefObject<(HTMLElement | null)[]>,
  {
    scale = 1.03,
    glowColor = "rgba(79, 216, 232, 0.35)",
    duration = 0.25,
  }: UseGsapHoverOptions = {}
) {
  useEffect(() => {
    const elements = refs.current.filter(
      (el): el is HTMLElement => el !== null
    );

    const cleanups = elements.map((el) => {
      const onEnter = () => {
        gsap.to(el, {
          scale,
          boxShadow: `0 0 32px 4px ${glowColor}`,
          duration,
          ease: "power2.out",
        });
      };
      const onLeave = () => {
        gsap.to(el, {
          scale: 1,
          boxShadow: "0 0 0px 0px rgba(0, 0, 0, 0)",
          duration,
          ease: "power2.out",
        });
      };
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        gsap.set(el, { clearProps: "scale,boxShadow" });
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [refs, scale, glowColor, duration]);
}
