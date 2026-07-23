"use client";

import { Suspense, useEffect, useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useScroll, useSpring } from "framer-motion";
import type * as THREE from "three";
import HeroVisual from "@/components/landing/HeroVisual";
import TicketScreenContent from "@/components/landing/TicketScreenContent";

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

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

// Scroll-linked motion: driven by a spring (not the raw scroll value) so
// the phone eases toward its target each frame instead of snapping 1:1
// with scroll events — same "damped follow" the rest of the site's
// scroll reveals use, just applied to a 3D transform instead of opacity/y.
function useHeroScrollProgress(target: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.5,
  });

  const progressRef = useRef(0);
  useEffect(() => {
    return smoothed.on("change", (v) => {
      progressRef.current = v;
    });
  }, [smoothed]);

  return progressRef;
}

function PhoneModel({
  scrollProgress,
  reduceMotion,
}: {
  scrollProgress: React.RefObject<number>;
  reduceMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const { camera } = state;
    const t = state.clock.elapsedTime;
    const scroll = scrollProgress.current;

    if (group.current) {
      const idleY = reduceMotion ? 0 : Math.sin(t * 0.3) * 0.06;
      const idleX = reduceMotion ? 0 : Math.cos(t * 0.25) * 0.02;
      // Extra yaw as the hero scrolls past — kept small (~±10° total
      // swing) since the crisp ticket content is a flat HTML overlay,
      // not part of the 3D mesh: too much rotation and it visibly
      // detaches from the phone's screen face.
      const scrollYaw = (scroll - 0.5) * 0.32;
      group.current.rotation.y = -0.18 + idleY + scrollYaw;
      group.current.rotation.x = idleX + scroll * 0.06;
    }

    // Slight dolly-in as the user scrolls through the hero.
    const targetZ = 5 - scroll * 0.35;
    camera.position.z += (targetZ - camera.position.z) * 0.08;
  });

  return (
    <group ref={group} rotation={[0, -0.18, 0]}>
      <RoundedBox args={[1.6, 3.2, 0.16]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.25} />
      </RoundedBox>

      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[1.42, 2.92]} />
        <meshStandardMaterial color="#0a0a0a" emissive="#00d9ff" emissiveIntensity={0.1} />
      </mesh>

      <mesh position={[0, 1.36, 0.09]}>
        <planeGeometry args={[0.45, 0.07]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function Scene({
  scrollProgress,
  reduceMotion,
}: {
  scrollProgress: React.RefObject<number>;
  reduceMotion: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={45} color="#00d9ff" />
      <pointLight position={[-3, -2, 2]} intensity={35} color="#ff006e" />
      <Suspense fallback={null}>
        {reduceMotion ? (
          <PhoneModel scrollProgress={scrollProgress} reduceMotion />
        ) : (
          <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
            <PhoneModel scrollProgress={scrollProgress} reduceMotion={false} />
          </Float>
        )}
      </Suspense>
    </>
  );
}

export default function Hero3DPhone() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useHeroScrollProgress(containerRef);

  // Skip the WebGL scene on small viewports — checked once after mount,
  // no resize listener needed for a hero visual that isn't interactive.
  const isMobile =
    mounted && typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false;

  const showScene = mounted && !isMobile;

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full max-w-md justify-self-center lg:justify-self-end"
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,0,110,0.16),transparent),radial-gradient(closest-side,rgba(0,217,255,0.14),transparent_70%)] bg-[position:30%_25%,75%_75%] bg-[size:65%_65%,65%_65%] bg-no-repeat blur-2xl"
        aria-hidden="true"
      />

      {showScene ? (
        <>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 35 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <Scene scrollProgress={scrollProgress} reduceMotion={reduceMotion} />
          </Canvas>

          <div className="pointer-events-none absolute inset-[18%] flex flex-col justify-center px-2">
            <TicketScreenContent />
          </div>
        </>
      ) : (
        <HeroVisual />
      )}
    </div>
  );
}
