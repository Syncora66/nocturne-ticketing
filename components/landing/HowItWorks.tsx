import FadeInSection from "@/components/FadeInSection";

const steps = [
  {
    index: "01",
    title: "Crée ton événement",
    description:
      "Nom, date, lieu, image. Lien de vente généré en moins de 2 minutes.",
    accent: "rose" as const,
  },
  {
    index: "02",
    title: "Vends tes billets",
    description: "Partage le lien. 0.50€ par ticket, tu gardes le reste.",
    accent: "cyan" as const,
  },
  {
    index: "03",
    title: "L'IA gère le support",
    description:
      "Billets perdus, remboursements, questions — traités 24/7, sans toi.",
    accent: "rose" as const,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-nocturne-black px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeInSection className="text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-nocturne-cyan">
            COMMENT ÇA MARCHE
          </span>
          <h2 className="mt-4 text-3xl font-bold text-nocturne-white sm:text-4xl">
            Trois étapes. Zéro friction.
          </h2>
        </FadeInSection>

        <div className="relative mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8">
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-nocturne-gray-dark sm:block"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <FadeInSection key={step.index} delayMs={i * 100}>
              <div className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                <span
                  className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bg-nocturne-black font-mono text-lg font-bold ${
                    step.accent === "rose"
                      ? "border-nocturne-rose text-nocturne-rose"
                      : "border-nocturne-cyan text-nocturne-cyan"
                  }`}
                >
                  {step.index}
                </span>
                <h3 className="mt-6 text-xl font-bold text-nocturne-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-nocturne-text">
                  {step.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
