"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SlideTransition from "@/components/SlideTransition";
import HowItWorks2Schema from "@/components/HowItWorks2Schema";

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current) return;

      gsap.set(headingRef.current, { opacity: 0, y: 28 });

      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <>
      <SlideTransition />
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-tick8t-black px-6 py-28 text-center sm:px-10 lg:px-16"
      >
        <div className="relative mx-auto max-w-6xl">
          <div ref={headingRef} className="mx-auto max-w-2xl">
            <h2 className="font-display text-3xl leading-tight text-tick8t-white [text-shadow:0_0_28px_rgba(79,216,232,0.55),0_0_60px_rgba(79,216,232,0.25)] sm:text-4xl lg:text-5xl">
              Une billetterie déléguée par l&apos;IA
            </h2>
            <p className="subtitle-accent mt-4">L&apos;IA agit. Tu valides.</p>
          </div>

          <HowItWorks2Schema />
        </div>
      </section>
    </>
  );
}
