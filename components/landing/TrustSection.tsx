import FadeInSection from "@/components/FadeInSection";

const comparisons = [
  {
    problem: "Eventbrite prend jusqu'à 4€ par ticket",
    solution: "0.50€ par ticket. Tu gardes 99.5%.",
  },
  {
    problem: "Frais additionnels à la caisse",
    solution: "Le prix affiché est le prix payé.",
  },
  {
    problem: "Support client externalisé, lent",
    solution: "IA intégrée, réponse immédiate.",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-nocturne-black px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeInSection className="text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-nocturne-cyan">
            TRANSPARENCE TOTALE
          </span>
          <h2 className="mt-4 text-3xl font-bold text-nocturne-white sm:text-4xl">
            Zéro commission cachée.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-nocturne-text">
            0.50€ par ticket vendu. Pas de frais de service, pas de
            pourcentage sur les recettes, pas de surprise à la fin du mois.
          </p>
        </FadeInSection>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {comparisons.map((c, i) => (
            <FadeInSection key={c.problem} delayMs={i * 80}>
              <div className="h-full rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-8">
                <p className="text-sm leading-relaxed text-nocturne-text/70 line-through decoration-nocturne-text/40">
                  {c.problem}
                </p>
                <p className="mt-4 font-mono text-base font-bold leading-relaxed text-nocturne-cyan">
                  {c.solution}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
