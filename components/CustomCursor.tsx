"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

function noopSubscribe() {
  return () => {};
}

function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

function subscribeFinePointer(callback: () => void) {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

function useFinePointer() {
  return useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );
}

/**
 * Small trailing ring that follows the mouse with a spring lag —
 * additive, doesn't hide or replace the native cursor, so it never
 * gets in the way of actual pointer feedback (text selection, native
 * cursor changes over inputs/links, etc). Fine-pointer devices only,
 * respects prefers-reduced-motion.
 */
export default function CustomCursor() {
  const mounted = useMounted();
  const finePointer = useFinePointer();
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // A slightly under-damped spring gives the trailing ring real
  // momentum instead of feeling glued to the pointer — springs also
  // stay interruptible if the mouse changes direction mid-motion,
  // unlike a fixed-duration tween.
  const springX = useSpring(x, { stiffness: 280, damping: 26, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 280, damping: 26, mass: 0.4 });

  const active = mounted && finePointer && !shouldReduceMotion;

  useEffect(() => {
    if (!active) return;

    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 rounded-full border border-nocturne-cyan/50"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
    >
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nocturne-cyan/70" />
    </motion.div>
  );
}
