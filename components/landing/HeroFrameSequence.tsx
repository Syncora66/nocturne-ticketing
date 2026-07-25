"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useScroll } from "framer-motion";
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
            className="inline-block rounded-md bg-nocturne-rose px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-[transform,background-color,color] duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
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

function HeroFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-nocturne-black">
      {children}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-nocturne-black/85 via-nocturne-black/45 to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full">
        <HeroCopy />
      </div>
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
  const currentFrameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    function drawFrame(index: number) {
      const canvas = canvasRef.current;
      const img = imagesRef.current[index - 1];
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(canvas.width / iw, canvas.height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (canvas.width - dw) / 2;
      const dy = (canvas.height - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
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
        currentFrameRef.current = 1;
        drawFrame(1);
      }
    });

    Promise.all(images.map(decode)).then(() => {
      if (!cancelled) drawFrame(currentFrameRef.current || 1);
    });

    function handleResize() {
      drawFrame(currentFrameRef.current || 1);
    }
    window.addEventListener("resize", handleResize);

    const unsubscribe = scrollYProgress.on("change", (v) => {
      const frame = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.round(1 + v * (FRAME_COUNT - 1)))
      );
      if (frame !== currentFrameRef.current) {
        currentFrameRef.current = frame;
        drawFrame(frame);
      }
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
        <HeroFrame>
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
