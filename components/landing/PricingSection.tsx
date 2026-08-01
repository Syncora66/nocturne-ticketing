"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useGsapHover } from "@/hooks/useGsapHover";

const leftFeatures = [
  "1.50€ reversés aux frais de plateforme",
  "Paiement sécurisé (carte, Apple Pay, Google Pay)",
  "QR codes anti-fraude générés automatiquement",
  "Support IA 24/7 pour tes acheteurs",
];

const rightFeatures = [
  "Remboursements toujours validés par toi",
  "Tableau de bord ventes en temps réel",
  "Export des billets vendus en un clic",
  "Aucun engagement, aucun abonnement",
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useGsapHover(cardRef, { scale: 1.015, glowColor: "rgba(79, 216, 232, 0.25)" });
  useGsapHover(ctaRef, { scale: 1.05, glowColor: "rgba(79, 216, 232, 0.5)" });

  useGSAP(
    () => {
      if (!headingRef.current || !cardRef.current) return;

      gsap.set(headingRef.current, { opacity: 0, y: 28 });
      gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.97 });
      gsap.set(itemRefs.current, { opacity: 0, x: -12 });

      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });

      // Stagger: the 8 checklist items step in one after another instead
      // of appearing all at once with the card.
      gsap.to(itemRefs.current, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 65%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="tick8t-teal-glow bg-tick8t-black px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div ref={headingRef} className="text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-tick8t-cyan">
            TARIFS
          </span>
          <h2 className="mt-4 font-display text-3xl text-tick8t-white sm:text-4xl">
            Un seul prix. Zéro surprise.
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-tick8t-cyan/30 bg-nocturne-black p-8 sm:p-12"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-tick8t-cyan/10 via-transparent to-tick8t-violet/10" />

            <div className="relative flex flex-col items-center text-center">
              <span className="inline-block rounded-full border border-tick8t-cyan bg-tick8t-cyan/10 px-4 py-1 font-mono text-xs font-bold tracking-widest text-tick8t-cyan">
                TOUT INCLUS
              </span>

              <div className="mt-6 flex items-end justify-center gap-2">
                <span className="font-display text-5xl text-nocturne-white sm:text-6xl">
                  €1.50
                </span>
                <span className="mb-2 font-exo text-lg text-tick8t-secondary">
                  / billet
                </span>
              </div>

              <p className="subtitle-accent mt-3">
                Facturé uniquement sur les billets vendus.
              </p>
            </div>

            <div className="relative mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[leftFeatures, rightFeatures].map((column, columnIndex) => (
                <ul key={columnIndex} className="space-y-4">
                  {column.map((item, itemIndex) => (
                    <li
                      key={item}
                      ref={(el) => {
                        itemRefs.current[columnIndex * 4 + itemIndex] = el;
                      }}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="mt-0.5 shrink-0 font-mono text-sm font-bold text-tick8t-cyan"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span className="font-exo text-sm leading-relaxed text-tick8t-secondary">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>

            <div className="relative mt-10 flex justify-center">
              <a
                ref={ctaRef}
                href="/auth/signup"
                className="inline-block rounded-md bg-tick8t-cyan px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-black transition-[background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-tick8t-violet hover:text-nocturne-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tick8t-cyan"
              >
                Créer mon événement
              </a>
            </div>

            <p className="relative mt-6 text-center font-exo text-xs text-tick8t-secondary/70">
              Aucun frais cachés. Aucun engagement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
