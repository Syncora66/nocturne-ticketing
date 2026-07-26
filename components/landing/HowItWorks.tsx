import ScrollReveal from "@/components/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/StaggerGrid";

const steps = [
  {
    index: "01",
    title: "Crée ton événement",
    description:
      "Nom, date, lieu, image. Lien de vente généré en moins de 2 minutes.",
    accent: "cyan" as const,
  },
  {
    index: "02",
    title: "Vends tes billets",
    description: "Partage le lien. 0.50€ par ticket, tu gardes le reste.",
    accent: "violet" as const,
  },
  {
    index: "03",
    title: "L'IA gère le support",
    description:
      "Billets perdus, remboursements, questions — traités 24/7, sans toi.",
    accent: "cyan" as const,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-tick8t-black px-6 py-28 text-center sm:px-10 lg:px-16">
      {/* Scene 2: data-rain loop. No single subject to protect (unlike the
          hero/robot scenes), so the scrim below is a flat wash rather than a
          directional gradient, and copy sits centered over it.
          tick8t-datarain-bg.mp4 doesn't exist yet — the poster (a still
          exported from the intended clip) is what renders until it's added;
          drop the file at this path and it starts looping automatically. */}
      <video
        className="tick8t-bg-video absolute inset-0 h-full w-full object-cover"
        src="/tick8t-datarain-bg.mp4"
        poster="/tick8t-datarain-poster.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-tick8t-black/70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-tick8t-black/60 via-transparent to-tick8t-black/60"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-tick8t-white [text-shadow:0_0_28px_rgba(79,216,232,0.55),0_0_60px_rgba(79,216,232,0.25)] sm:text-4xl lg:text-5xl">
            Comment ça marche
          </h2>
          <p className="mt-4 font-exo text-lg text-tick8t-secondary">
            Trois étapes. Zéro friction.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <StaggerItem key={step.index}>
              <div className="flex h-full flex-col items-center rounded-xl border border-white/10 bg-tick8t-black/60 p-8 text-center backdrop-blur-md">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-display text-base ${
                    step.accent === "violet"
                      ? "border-tick8t-violet text-tick8t-violet"
                      : "border-tick8t-cyan text-tick8t-cyan"
                  }`}
                >
                  {step.index}
                </span>
                <h3 className="mt-6 font-exo text-xl font-semibold text-tick8t-white">
                  {step.title}
                </h3>
                <p className="mt-3 font-exo text-sm leading-relaxed text-tick8t-secondary">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
