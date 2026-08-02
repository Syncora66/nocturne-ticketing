"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroVideoScroll from "@/components/landing/HeroVideoScroll";
import HeroHandoff from "@/components/landing/HeroHandoff";
import SlideTransition from "@/components/SlideTransition";
import ScrollReveal from "@/components/ScrollReveal";
import { useGsapHover } from "@/hooks/useGsapHover";
import HowItWorks from "@/components/landing/HowItWorks";
import AiSupportShowcase from "@/components/landing/AiSupportShowcase";
import TrustSection from "@/components/landing/TrustSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

// ============================================================================
// NAVBAR / HEADER
// ============================================================================

export const Navbar = () => {
  const { scrollY } = useScroll();
  // `null` means "not measured yet" — kept distinct from 0 so an
  // unmeasured state can never be mistaken for "Features starts at the
  // top of the page" (that footgun previously made the navbar flash to
  // full opacity on the very first pixel of scroll, before the real
  // measurement landed).
  const [featuresTop, setFeaturesTop] = useState<number | null>(null);
  const [pastThreshold, setPastThreshold] = useState(false);

  // Invisible through the Hero *and* the sections between it and Features
  // (HowItWorks, AiSupportShowcase, TrustSection) — measured from the
  // Features section's own DOM position rather than hard-coded, so this
  // keeps working if the Hero's scroll length or any section's height
  // ever changes. Re-measures on window `load` too, since webfonts/video
  // metadata can still shift section heights after the initial mount.
  useEffect(() => {
    const measure = () => {
      const featuresSection = document.getElementById("features");
      if (!featuresSection) return;
      setFeaturesTop(
        featuresSection.getBoundingClientRect().top + window.scrollY,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  useEffect(() => {
    return scrollY.on("change", (v) => {
      setPastThreshold(featuresTop != null && v >= featuresTop);
    });
  }, [scrollY, featuresTop]);

  // Fades in over the 600px of scroll leading up to Features, so it's
  // fully opaque by the time that section reaches the viewport. Until
  // the real position is measured, the output range collapses to a
  // constant 0 — the input range values don't matter (any two increasing
  // numbers work) since interpolating between two equal outputs is
  // always that value, regardless of scroll position.
  const ready = featuresTop != null;
  const fadeStart = ready ? Math.max(featuresTop - 600, 0) : 0;
  const fadeEnd = ready ? featuresTop : 1;
  const navbarOpacity = useTransform(
    scrollY,
    [fadeStart, fadeEnd],
    ready ? [0, 1] : [0, 0],
  );

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-[background-color,border-color] duration-300 ${
        pastThreshold
          ? "bg-[#071A1F]/95 backdrop-blur-md border-b border-[#1B4F5C]/30"
          : "bg-transparent"
      }`}
      style={{
        opacity: navbarOpacity,
        pointerEvents: pastThreshold ? "auto" : "none",
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <motion.div
          className="font-display text-base font-bold bg-gradient-to-r from-[#1B4F5C] to-[#4FD8E8] bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          TICK8T
        </motion.div>

        <div className="hidden md:flex gap-6">
          {["Features", "Pricing", "Docs", "Contact"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[#A8F0F7] font-exo text-xs hover:text-[#4FD8E8] transition-colors"
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        <motion.button
          className="bg-gradient-to-r from-[#1B4F5C] to-[#4FD8E8] text-[#071A1F] px-4 py-1.5 rounded-lg font-exo font-semibold text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign in
        </motion.button>
      </div>
    </motion.nav>
  );
};

// ============================================================================
// PAGE
// ============================================================================

export default function Home() {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  useGsapHover(ctaRef, { scale: 1.05, glowColor: "rgba(240, 251, 253, 0.4)" });

  return (
    <main>
      <Navbar />
      <HeroHandoff hero={<HeroVideoScroll />} nextSection={<HowItWorks />} />

      <SlideTransition />
      <AiSupportShowcase />
      <SlideTransition />
      <TrustSection />
      <SlideTransition />
      <FeaturesSection />
      <SlideTransition />
      <PricingSection />
      <SlideTransition />

      {/* CTA */}
      <section className="tick8t-teal-glow bg-tick8t-black px-6 py-24 sm:px-10 lg:px-16">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-tick8t-white sm:text-4xl">
            Ton seul job: vendre.
          </h2>
          <p className="subtitle-accent mx-auto mt-4 max-w-xl text-left">
            Concentre-toi seulement sur tes ventes.
          </p>

          <div className="mx-auto mt-10">
            <a
              ref={ctaRef}
              href="/auth/signup"
              className="inline-block rounded-md bg-tick8t-cyan px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-black transition-[background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-tick8t-violet hover:text-nocturne-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tick8t-cyan"
            >
              Créer mon événement
            </a>
          </div>
        </ScrollReveal>
      </section>

      <SlideTransition />
      <Footer />
    </main>
  );
}
