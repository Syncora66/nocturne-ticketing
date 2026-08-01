"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function HowItWorks2Schema() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.set(cardRefs.current, { opacity: 0, y: 24 });
      gsap.to(cardRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      className="relative mx-auto mt-16 max-w-6xl rounded-2xl border border-tick8t-cyan/40 bg-tick8t-black/40 p-8 backdrop-blur-sm sm:p-10"
    >
      <div className="flex flex-col items-center gap-10 md:flex-row md:items-stretch md:justify-center md:gap-0">
        {/* Schema 1 — the AI side */}
        <div
          ref={(el) => {
            cardRefs.current[0] = el;
          }}
          className="group flex flex-1 flex-col items-center gap-5 text-center md:pr-10"
        >
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="pulse-glow-line absolute h-24 w-24 rounded-full bg-tick8t-cyan/20 blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-tick8t-cyan bg-tick8t-black text-tick8t-cyan shadow-[0_0_16px_4px_rgba(79,216,232,0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_8px_rgba(79,216,232,0.7)]">
              <span className="font-display text-xs">IA</span>
            </div>
            <span className="absolute -bottom-1 right-2 rounded-full border border-tick8t-cyan bg-tick8t-black px-2 py-0.5 font-mono text-[10px] font-bold text-tick8t-cyan">
              24/7
            </span>
          </div>

          <div className="w-full max-w-[220px] rounded-lg border border-nocturne-gray-dark bg-nocturne-black p-3 text-left">
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-lg bg-nocturne-gray-dark px-3 py-1.5 text-[11px] leading-snug text-nocturne-white">
                Je n&apos;ai pas reçu mon billet
              </div>
            </div>
            <div className="mt-1.5 flex justify-start">
              <div className="max-w-[75%] rounded-lg bg-tick8t-cyan/10 px-3 py-1.5 text-[11px] leading-snug text-tick8t-cyan">
                C&apos;est renvoyé !
              </div>
            </div>
          </div>

          <p className="font-exo text-sm font-bold leading-relaxed text-tick8t-white">
            L&apos;IA pilote ton support 24/7.
          </p>
        </div>

        {/* Vertical neon divider on desktop, horizontal on mobile */}
        <div
          aria-hidden="true"
          className="pulse-glow-line mx-2 hidden w-[3px] self-stretch rounded-full bg-gradient-to-b from-tick8t-cyan via-tick8t-violet to-tick8t-cyan shadow-[0_0_12px_3px_rgba(79,216,232,0.5),0_0_20px_6px_rgba(75,63,134,0.4)] md:block"
        />
        <div
          aria-hidden="true"
          className="pulse-glow-line h-[3px] w-24 rounded-full bg-gradient-to-r from-tick8t-cyan via-tick8t-violet to-tick8t-cyan shadow-[0_0_12px_3px_rgba(79,216,232,0.5),0_0_20px_6px_rgba(75,63,134,0.4)] md:hidden"
        />

        {/* Schema 2 — the human side */}
        <div
          ref={(el) => {
            cardRefs.current[1] = el;
          }}
          className="group flex flex-1 flex-col items-center gap-5 text-center md:pl-10"
        >
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="pulse-glow-line absolute h-24 w-24 rounded-full bg-tick8t-violet/25 blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-tick8t-violet bg-tick8t-black text-tick8t-white shadow-[0_0_16px_4px_rgba(75,63,134,0.6)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_8px_rgba(75,63,134,0.8)]">
              <span className="font-display text-xs">TOI</span>
            </div>
            <span
              className="absolute -bottom-1 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-tick8t-violet bg-tick8t-black font-mono text-xs font-bold text-tick8t-violet"
              aria-hidden="true"
            >
              ✓
            </span>
          </div>

          <div className="w-full max-w-[220px] rounded-lg border border-nocturne-gray-dark bg-nocturne-black p-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-nocturne-white">
                Remboursement — 42€
              </span>
              <span className="rounded bg-tick8t-violet/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-tick8t-violet">
                high
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-tick8t-cyan px-3 py-1 font-mono text-[10px] font-bold uppercase text-nocturne-black">
                Approuver
              </span>
              <span className="rounded-full border border-tick8t-secondary/40 px-3 py-1 font-mono text-[10px] font-bold uppercase text-tick8t-secondary">
                Rejeter
              </span>
            </div>
          </div>

          <p className="font-exo text-sm font-bold leading-relaxed text-tick8t-white">
            Tu approuves les décisions importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
