"use client";

import { useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/StaggerGrid";
import { useGsapHoverAll } from "@/hooks/useGsapHover";

const features = [
  {
    emoji: "🤖",
    title: "Support IA 24/7",
    description:
      "Remboursements, billets perdus, questions clients — traités automatiquement, jour et nuit.",
  },
  {
    emoji: "⚡",
    title: "Zéro configuration",
    description:
      "Nom, date, lieu, image. Ton événement est en ligne et prêt à vendre en moins de 2 minutes.",
  },
  {
    emoji: "💰",
    title: "À la commission",
    description:
      "Pas d'abonnement, pas de frais fixes. Tu ne paies que sur les billets réellement vendus.",
  },
  {
    emoji: "🌍",
    title: "Multi-langue",
    description:
      "Billetterie et support IA disponibles dans la langue de chacun de tes acheteurs.",
  },
];

export default function FeaturesSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useGsapHoverAll(cardRefs);

  return (
    <section
      id="features"
      className="bg-nocturne-black px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-tick8t-cyan">
            FONCTIONNALITÉS
          </span>
          <h2 className="mt-4 font-display text-3xl text-nocturne-white sm:text-4xl">
            Tout ce qu&apos;il faut. Rien de superflu.
          </h2>
          <p className="subtitle-accent mx-auto mt-4 max-w-xl text-left">
            Une billetterie pensée pour les collectifs événementiels, pas pour
            les grandes plateformes.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <StaggerItem key={feature.title}>
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="flex h-full flex-col items-start rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-8"
              >
                <span className="text-3xl" aria-hidden="true">
                  {feature.emoji}
                </span>
                <h3 className="mt-5 font-exo text-lg font-semibold text-nocturne-white">
                  {feature.title}
                </h3>
                <p className="mt-3 font-exo text-sm leading-relaxed text-tick8t-secondary">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
