"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { motion, useScroll, useTransform, cubicBezier } from "framer-motion";
import { FRAME_COUNT, FRAME_PATHS } from "./heroFrames";

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

// Same "strong ease-out" curve as the rest of the site's custom
// easing tokens (app/globals.css --ease-strong-out) — used here for
// the text's scroll-linked fade since useTransform interpolates
// linearly by default otherwise.
const EASE_STRONG_OUT = cubicBezier(0.23, 1, 0.32, 1);

function HeroCopy() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-5xl lg:text-6xl">
          Vendre 300 tickets en 1 heure.
          <br />
          <span className="text-nocturne-rose">Garder 100% du prix.</span>
        </h1>

        <div className="mt-6 max-w-lg rounded-lg border-l-2 border-nocturne-cyan bg-nocturne-black/40 py-3 pl-4 backdrop-blur-sm">
          <p className="text-base font-bold leading-relaxed text-nocturne-white sm:text-lg">
            L&apos;IA gère ton support client — remboursements, renvoi de
            billets.{" "}
            <span className="text-nocturne-cyan">
              Toi, tu gardes le contrôle total.
            </span>
          </p>
        </div>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-nocturne-text sm:text-base">
          Ticketing moderne pour collectifs événementiels. Zéro commission
          cachée.
        </p>

        <div className="mt-10">
          <a
            href="/auth/signup"
            className="inline-block rounded-md bg-nocturne-rose px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-nocturne-cyan hover:text-nocturne-black active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
          >
            Créer mon événement
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="font-mono text-xs font-bold tracking-wide text-nocturne-text/70">
            0.50€ / TICKET
          </span>
          <span className="h-1 w-1 rounded-full bg-nocturne-gray-dark" />
          <span className="font-mono text-xs font-bold tracking-wide text-nocturne-text/70">
            SUPPORT IA 24/7
          </span>
          <span className="h-1 w-1 rounded-full bg-nocturne-gray-dark" />
          <span className="font-mono text-xs font-bold tracking-wide text-nocturne-text/70">
            0% COMMISSION CACHÉE
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroFrame({
  children,
  textOpacity,
  textY,
}: {
  children: ReactNode;
  textOpacity?: import("framer-motion").MotionValue<number>;
  textY?: import("framer-motion").MotionValue<number>;
}) {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-nocturne-black">
      {children}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-nocturne-black/85 via-nocturne-black/45 to-transparent"
        aria-hidden="true"
      />
      <motion.div
        className="relative z-10 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.div
          style={
            textOpacity || textY
              ? { opacity: textOpacity, y: textY }
              : undefined
          }
        >
          <HeroCopy />
        </motion.div>
      </motion.div>
    </div>
  );
}

function MobileHero() {
  return (
    <section className="relative min-h-screen">
      <div className="sticky top-0 h-screen">
        <HeroFrame>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FRAME_PATHS[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </HeroFrame>
      </div>
    </section>
  );
}

function DesktopScrollHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentDrawnRef = useRef(-1);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // The hero is the first thing on the page, so scrollY=0 already
  // *is* "arrived" — there's no earlier moment to fade in from. The
  // arrival fade is therefore a one-time mount transition (below, on
  // the outer motion.div), while this transform only handles the
  // "disparaît en douceur en sortant" half: fully visible for most of
  // the scroll, fading only as the hero approaches release.
  const textOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0], {
    ease: EASE_STRONG_OUT,
  });
  const textY = useTransform(scrollYProgress, [0.75, 1], [0, -16], {
    ease: EASE_STRONG_OUT,
  });

  useEffect(() => {
    function drawBlended(rawFrame: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const images = imagesRef.current;

      const frameA = Math.max(
        1,
        Math.min(FRAME_COUNT, Math.floor(rawFrame))
      );
      const frameB = Math.min(FRAME_COUNT, frameA + 1);
      const blend = Math.max(0, Math.min(1, rawFrame - frameA));

      const imgA = images[frameA - 1];
      const imgB = images[frameB - 1];
      if (!imgA || !imgA.complete || imgA.naturalWidth === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      const pixelWidth = Math.round(cssWidth * dpr);
      const pixelHeight = Math.round(cssHeight * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      function drawCover(img: HTMLImageElement, alpha: number) {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.max(canvas!.width / iw, canvas!.height / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (canvas!.width - dw) / 2;
        const dy = (canvas!.height - dh) / 2;
        ctx!.globalAlpha = alpha;
        ctx!.drawImage(img, dx, dy, dw, dh);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      drawCover(imgA, 1);

      if (
        blend > 0.001 &&
        imgB &&
        imgB.complete &&
        imgB.naturalWidth > 0 &&
        frameB !== frameA
      ) {
        drawCover(imgB, blend);
      }
      ctx.globalAlpha = 1;
    }

    let cancelled = false;
    const images = FRAME_PATHS.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });
    imagesRef.current = images;

    const decode = (img: HTMLImageElement) =>
      img.decode ? img.decode().catch(() => {}) : Promise.resolve();

    decode(images[0]).then(() => {
      if (!cancelled) {
        currentDrawnRef.current = 1;
        drawBlended(1);
      }
    });

    Promise.all(images.map(decode)).then(() => {
      if (!cancelled) drawBlended(currentDrawnRef.current || 1);
    });

    function handleResize() {
      drawBlended(currentDrawnRef.current || 1);
    }
    window.addEventListener("resize", handleResize);

    const unsubscribe = scrollYProgress.on("change", (v) => {
      const rawFrame = 1 + v * (FRAME_COUNT - 1);
      currentDrawnRef.current = rawFrame;
      drawBlended(rawFrame);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, [scrollYProgress]);

  return (
    <section ref={trackRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen">
        <HeroFrame textOpacity={textOpacity} textY={textY}>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </HeroFrame>
      </div>
    </section>
  );
}

export default function HeroFrameSequence() {
  const mounted = useMounted();

  // Pre-hydration and mobile both get the lightweight static hero —
  // avoids a blank 300vh scroll track before JS decides, and skips
  // the ~3MB frame preload on the connections/CPUs least able to
  // afford it. Checked once at mount, no resize listener: this isn't
  // an interactive control, just which hero experience to render.
  const isMobile =
    mounted && typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : true;

  return isMobile ? <MobileHero /> : <DesktopScrollHero />;
}
