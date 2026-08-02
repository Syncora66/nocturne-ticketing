"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from "react";
import { motion, useScroll, cubicBezier } from "framer-motion";
import Image from "next/image";
import { useGsapHover } from "@/hooks/useGsapHover";

const HERO_VIDEO_SRC = "/tick8t-hero-video.mp4";

function noopSubscribe() {
  return () => {};
}

function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

// Same "strong ease-out" curve as the rest of the site's custom easing
// tokens (app/globals.css --ease-strong-out).
const EASE_STRONG_OUT = cubicBezier(0.23, 1, 0.32, 1);

// Every scroll-linked value on this hero (video currentTime, title-block
// opacity/y) is driven by hand from a single scrollYProgress subscription
// instead of Framer Motion's useTransform.
// Reason: useTransform's optional `ease` turns the binding into a
// hardware-accelerated Web Animation under the hood, and with six of those
// hanging off the same source MotionValue they were observed going out of
// sync with the actual scroll position after a fast/programmatic scroll
// jump (video.currentTime stayed correct throughout, since it's written
// directly in the same manual subscription used here). Plain arithmetic
// has no such failure mode.
function remap(value: number, input: number[], output: number[]): number {
  const last = input.length - 1;
  if (value <= input[0]) return output[0];
  if (value >= input[last]) return output[last];
  for (let i = 0; i < last; i++) {
    if (value >= input[i] && value <= input[i + 1]) {
      const span = input[i + 1] - input[i];
      const t = span === 0 ? 1 : (value - input[i]) / span;
      const eased = EASE_STRONG_OUT(t);
      return output[i] + (output[i + 1] - output[i]) * eased;
    }
  }
  return output[last];
}

type TitleBlock = {
  id: string;
  heading: ReactNode;
  body: ReactNode;
};

const TITLE_BLOCKS: TitleBlock[] = [
  {
    id: "sell",
    heading: (
      <>
        Billetterie autonome.
        <br />
        Support IA 24/7.
        <br />
        <span className="text-tick8t-cyan">
          Votre événement, sans stress clientèle !
        </span>
      </>
    ),
    body: (
      <div className="subtitle-accent mt-6">
        La billetterie que les organisateurs attendaient
      </div>
    ),
  },
  {
    id: "support",
    heading: (
      <>
        L&apos;IA gère ton
        <br />
        <span className="text-tick8t-cyan">support client.</span>
      </>
    ),
    body: (
      <div className="subtitle-accent mt-6 max-w-lg">
        Remboursements, renvoi de billets, questions clients — traités 24/7.
        Toi, tu gardes le contrôle total.
      </div>
    ),
  },
  {
    id: "commission",
    heading: (
      <>
        Zéro commission
        <br />
        <span className="text-tick8t-cyan">cachée.</span>
      </>
    ),
    body: (
      <div className="subtitle-accent mt-6 max-w-lg">
        1.50€ par ticket vendu. Pas de frais de service, pas de surprise à la
        caisse.
      </div>
    ),
  },
  {
    id: "cta",
    heading: (
      <>
        Crée ton événement
        <br />
        <span className="text-tick8t-cyan">en 2 minutes.</span>
      </>
    ),
    body: (
      <div className="subtitle-accent mt-6 max-w-lg">
        Nom, date, lieu, image. Lien de vente généré instantanément — vends dès
        aujourd&apos;hui.
      </div>
    ),
  },
];

function TitleBody({ block }: { block: TitleBlock }) {
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-4xl lg:text-5xl">
        {block.heading}
      </h1>
      {block.body}
    </div>
  );
}

// Evenly splits scroll progress into one range per title block, with a short
// crossfade window straddling each boundary so consecutive blocks blend
// instead of cutting. The first block is fully visible at progress=0 (the
// hero is the first thing on the page — nothing earlier to fade in from),
// and the last stays fully visible through progress=1 — all the way to the
// Hero's last pixel — since HeroHandoff.tsx already crossfades the whole
// Hero into the next section once the sticky pin releases; fading the text
// out early here just left a blank video-only gap before that handoff.
function titleTransforms(index: number, total: number) {
  const boundary = 1 / total;
  const crossfade = boundary * 0.3;
  const start = index * boundary;
  const end = start + boundary;

  // The input range must be strictly increasing — the first block has no
  // fade-in leg (it's already visible at progress=0) and the last has no
  // fade-out leg (it stays visible through progress=1), so those legs are
  // omitted entirely rather than left as a duplicate point.
  const input: number[] = [];
  const opacityOutput: number[] = [];
  const yOutput: number[] = [];

  if (index === 0) {
    input.push(0);
    opacityOutput.push(1);
    yOutput.push(0);
  } else {
    input.push(start - crossfade, start + crossfade);
    opacityOutput.push(0, 1);
    yOutput.push(14, 0);
  }

  if (index === total - 1) {
    input.push(1);
    opacityOutput.push(1);
    yOutput.push(0);
  } else {
    input.push(end - crossfade, end + crossfade);
    opacityOutput.push(1, 0);
    yOutput.push(0, -14);
  }

  return { input, opacityOutput, yOutput };
}

function AnimatedTitleBlock({
  block,
  index,
  total,
  initialProgress,
  innerRef,
}: {
  block: TitleBlock;
  index: number;
  total: number;
  initialProgress: number;
  innerRef: Ref<HTMLDivElement>;
}) {
  const { input, opacityOutput, yOutput } = titleTransforms(index, total);
  const opacity = remap(initialProgress, input, opacityOutput);
  const y = remap(initialProgress, input, yOutput);

  return (
    <div
      ref={innerRef}
      className="[grid-area:1/1]"
      style={{ opacity, transform: `translateY(${y}px)` }}
    >
      <TitleBody block={block} />
    </div>
  );
}

function HeroCta() {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  useGsapHover(ctaRef, { scale: 1.05, glowColor: "rgba(79, 216, 232, 0.5)" });

  return (
    <div className="mt-10">
      <a
        ref={ctaRef}
        href="/auth/signup"
        className="inline-block rounded-md bg-tick8t-cyan px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-black transition-[background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-tick8t-violet hover:text-nocturne-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tick8t-cyan"
      >
        Créer mon événement
      </a>
    </div>
  );
}

function HeroBadges() {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
      <span className="font-mono text-xs font-bold tracking-wide text-tick8t-secondary/70">
        1.50€ / TICKET
      </span>
      <span className="h-1 w-1 rounded-full bg-nocturne-gray-dark" />
      <span className="font-mono text-xs font-bold tracking-wide text-tick8t-secondary/70">
        SUPPORT IA 24/7
      </span>
      <span className="h-1 w-1 rounded-full bg-nocturne-gray-dark" />
      <span className="font-mono text-xs font-bold tracking-wide text-tick8t-secondary/70">
        0% COMMISSION CACHÉE
      </span>
    </div>
  );
}

function HeroVideo({
  videoRef,
  className,
}: {
  videoRef?: Ref<HTMLVideoElement>;
  className: string;
}) {
  return (
    <video
      ref={videoRef}
      className={className}
      // Forces this video onto its own GPU compositing layer. iOS Safari
      // has a known bug where a <video> nested inside a `position: sticky`
      // + `overflow: hidden` ancestor (exactly this Hero's structure, for
      // the 900vh scroll-pin effect) can fail to composite at all and
      // renders solid black, independent of whether the video itself is
      // playing or has painted a frame. translateZ(0) is the standard
      // workaround — it's a no-op transform that exists purely to promote
      // the element to its own layer.
      style={{ transform: "translateZ(0)", willChange: "transform" }}
      src={HERO_VIDEO_SRC}
      // Same JPEG as the static hero's fallback image — renders instantly
      // (tens of KB vs. the video's 1MB+) so there's something on screen
      // the moment this element mounts, instead of the section's plain
      // black background for however long the video takes to buffer.
      poster="/hero-frame.jpg"
      muted
      playsInline
      preload="auto"
    />
  );
}

function HeroFrame({
  media,
  children,
}: {
  media: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-nocturne-black">
      {media}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-nocturne-black/85 via-nocturne-black/45 to-transparent"
        aria-hidden="true"
      />
      {/* Static scrim (no scroll-linked opacity) that softens the hand-off
          into the next section's own dark background — always present at
          the bottom edge rather than animated, so there's no scroll-progress
          calculation that could ever paint it fully opaque by mistake. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-tick8t-black sm:h-48"
        aria-hidden="true"
      />
      <motion.div
        className="relative z-10 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Used only when the visitor prefers reduced motion (and briefly
// pre-hydration): a single, non-cycling pitch backed by a static image (a
// JPEG extracted from the hero video's own opening frame, kept
// pixel-identical to what the scroll version shows at progress=0) instead
// of a <video> element. Genuinely static — no scroll listener, no video
// decode, no momentary play() — which is what prefers-reduced-motion asks
// for. This is distinct from the "video paused but never played" bug that
// used to make the old mobile fallback render solid black on iOS Safari:
// ScrollHero's video is never in that state, since seeking it (below)
// forces a real frame paint from the first scroll tick.
function StaticHero() {
  return (
    <section className="relative min-h-screen">
      <div className="sticky top-0 h-screen">
        <HeroFrame
          media={
            <Image
              src="/hero-frame.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          }
        >
          <TitleBody block={TITLE_BLOCKS[0]} />
          <HeroCta />
          <HeroBadges />
        </HeroFrame>
      </div>
    </section>
  );
}

function ScrollHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const video = videoRef.current;

    function seekVideo(progress: number) {
      const v = videoRef.current;
      if (!v) return;
      const duration = v.duration;
      if (!duration || Number.isNaN(duration)) return;
      const target = progress * duration;
      // Skip sub-frame seeks (video is 24fps, ~0.042s/frame — half a
      // frame's tolerance avoids redundant currentTime writes on every
      // scroll tick without ever missing an actual frame change).
      if (Math.abs(v.currentTime - target) > 0.02) {
        v.currentTime = target;
      }
    }

    function updateTitles(progress: number) {
      TITLE_BLOCKS.forEach((_, i) => {
        const el = blockRefs.current[i];
        if (!el) return;
        const { input, opacityOutput, yOutput } = titleTransforms(
          i,
          TITLE_BLOCKS.length,
        );
        el.style.opacity = String(remap(progress, input, opacityOutput));
        el.style.transform = `translateY(${remap(progress, input, yOutput)}px)`;
      });
    }

    function update(progress: number) {
      seekVideo(progress);
      updateTitles(progress);
    }

    function handleLoadedMetadata() {
      // Mobile Safari (and several other mobile browsers) won't decode or
      // paint any frame for a <video> that has never had play() called on
      // it — not even via a currentTime seek, which is all `update` does
      // below. Desktop browsers paint a sought frame with no play() ever
      // needed, which is why this only shows up on mobile: a play()-then-
      // pause() unlocks the decoder there without introducing real motion
      // (same fix already used for the reduced-motion static image's
      // video, before it became an <img> — see StaticHero). Pausing on
      // the very next tick isn't enough on some devices — play() can
      // resolve before a frame has actually been composited, so pause()
      // fires before anything was ever painted. Two rAF ticks guarantee
      // at least one real paint cycle has happened first.
      function pauseAfterFirstPaint() {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            video!.pause();
            update(scrollYProgress.get());
          });
        });
      }

      video!.play().then(pauseAfterFirstPaint).catch(pauseAfterFirstPaint);
    }

    video?.addEventListener("loadedmetadata", handleLoadedMetadata);
    if (video && video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      // Video metadata may still be loading — seed title state immediately
      // so it isn't stuck at its JSX-rendered initial values until the
      // video catches up.
      updateTitles(scrollYProgress.get());
    }

    const unsubscribe = scrollYProgress.on("change", update);

    return () => {
      video?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      unsubscribe();
    };
  }, [scrollYProgress]);

  const initialProgress = scrollYProgress.get();

  return (
    // 900vh = 3x the original 300vh pin length. Scroll progress is
    // (scrollY - sectionTop) / (sectionHeight - viewportHeight), so tripling
    // the height means it takes 3x the scroll distance to traverse the same
    // video/title sequence — i.e. the scroll-to-video mapping is 3x slower.
    <section ref={trackRef} className="relative h-[900vh]">
      <div className="sticky top-0 h-screen">
        <HeroFrame
          media={
            <HeroVideo
              videoRef={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          }
        >
          <div className="grid">
            {TITLE_BLOCKS.map((block, i) => (
              <AnimatedTitleBlock
                key={block.id}
                block={block}
                index={i}
                total={TITLE_BLOCKS.length}
                initialProgress={initialProgress}
                innerRef={(el) => {
                  blockRefs.current[i] = el;
                }}
              />
            ))}
          </div>
          <HeroCta />
          <HeroBadges />
        </HeroFrame>
      </div>
    </section>
  );
}

export default function HeroVideoScroll() {
  const mounted = useMounted();

  // Pre-hydration and prefers-reduced-motion get the lightweight static
  // hero — avoids a blank 900vh scroll track before JS decides, and
  // respects the visitor's motion preference. Every other visitor,
  // mobile included, gets the full scroll-driven video — checked once at
  // mount, no resize listener: this isn't an interactive control, just
  // which hero experience to render.
  const useStatic =
    mounted && typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : true;

  return useStatic ? <StaticHero /> : <ScrollHero />;
}
