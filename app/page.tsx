import FadeInSection from "@/components/FadeInSection";

const painPoints = [
  {
    problem: "Eventbrite prend 4€ par ticket",
    solution: "0.50€ par ticket. Garde 99.5%",
  },
  {
    problem: "Support manuel épuisant",
    solution: "IA répond 24/7 à tes clients. Tu dors.",
  },
  {
    problem: "Check-in = papier ou Excel",
    solution: "Scan QR. 2 secondes.",
  },
];

const features = [
  {
    index: "01",
    title: "Event setup en 2 minutes",
    description:
      "Crée un événement en moins de 2 minutes. Lien de vente généré instantanément.",
    highlight: "Nom, date, lieu, image — c'est tout.",
    accent: "rose" as const,
  },
  {
    index: "02",
    title: "Support IA 24/7",
    description:
      "Tes clients ont des questions. L'IA répond 24h/24. Tu fais autre chose.",
    highlight: "Chatbot autonome, escalade humain si besoin.",
    accent: "cyan" as const,
  },
  {
    index: "03",
    title: "Check-in professionnel",
    description: "Oublie le papier. Scan QR à l'entrée. 2 secondes.",
    highlight: "App mobile, mode offline, anti-fraude.",
    accent: "rose" as const,
  },
  {
    index: "04",
    title: "Analytics en temps réel",
    description:
      "Vois combien tu vends, en direct. Graphiques, taux de conversion, revenue.",
    highlight: "Dashboard live, export CSV.",
    accent: "cyan" as const,
  },
];

function FeatureVisual({ index, accent }: { index: string; accent: "rose" | "cyan" }) {
  const accentColor =
    accent === "rose" ? "text-nocturne-rose" : "text-nocturne-cyan";
  const accentBorder =
    accent === "rose" ? "border-nocturne-rose/40" : "border-nocturne-cyan/40";

  return (
    <div
      className={`relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-lg border ${accentBorder} bg-nocturne-gray`}
      aria-hidden="true"
    >
      <div
        className={`absolute -left-10 -top-10 h-32 w-32 rounded-full border ${accentBorder}`}
      />
      <div
        className={`absolute -bottom-12 -right-12 h-40 w-40 rounded-full border ${accentBorder}`}
      />
      <span className={`font-mono text-6xl font-bold ${accentColor}`}>
        {index}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero-ambient-bg flex min-h-screen items-center px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-5xl lg:text-6xl">
              Vendre 300 tickets en 1 heure.
              <br />
              <span className="text-nocturne-rose">Garder 100% du prix.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-nocturne-text sm:text-lg">
              Ticketing moderne pour collectifs événementiels. Zéro
              commission cachée.
            </p>
            <div className="mt-10">
              <a
                href="/auth/signup"
                className="inline-block rounded-md bg-nocturne-rose px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
              >
                Démarrer gratuitement
              </a>
            </div>
          </div>

          <div
            className="relative aspect-square w-full max-w-md justify-self-center lg:justify-self-end"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full border border-nocturne-gray-dark" />
            <div className="absolute inset-8 rounded-full border border-nocturne-rose/40" />
            <div className="absolute inset-16 rounded-full border border-nocturne-cyan/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-sm font-bold tracking-widest text-nocturne-cyan">
                0.50€ / TICKET
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="bg-nocturne-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-nocturne-white sm:text-4xl">
            Pourquoi Nocturne Ticketing?
          </h2>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {painPoints.map((point) => (
              <div
                key={point.problem}
                className="rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-8"
              >
                <p className="text-sm leading-relaxed text-nocturne-text/70 line-through decoration-nocturne-text/40">
                  {point.problem}
                </p>
                <p className="mt-4 font-mono text-base font-bold leading-relaxed text-nocturne-cyan">
                  {point.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-nocturne-black px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-nocturne-white sm:text-4xl">
            De la création à la soirée
          </h2>

          <div className="mt-16 flex flex-col gap-24 sm:gap-16">
            {features.map((feature, i) => (
              <FadeInSection key={feature.index}>
                <div
                  className={`grid items-center gap-8 sm:grid-cols-2 sm:gap-12 ${
                    i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <FeatureVisual index={feature.index} accent={feature.accent} />
                  <div>
                    <span
                      className={`font-mono text-sm font-bold tracking-widest ${
                        feature.accent === "rose"
                          ? "text-nocturne-rose"
                          : "text-nocturne-cyan"
                      }`}
                    >
                      {feature.index}
                    </span>
                    <h3 className="mt-3 text-2xl font-bold text-nocturne-white sm:text-3xl">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-nocturne-text">
                      {feature.description}
                    </p>
                    <p className="mt-3 font-mono text-sm text-nocturne-text/60">
                      {feature.highlight}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nocturne-rose px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-4xl">
            Prêt à simplifier tes événements?
          </h2>
          <p className="mt-4 text-base text-nocturne-white/80 sm:text-lg">
            Rejoins les collectifs qui gardent 99.5% de leurs ventes.
          </p>

          <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="cta-email" className="sr-only">
              Adresse email
            </label>
            <input
              id="cta-email"
              type="email"
              required
              placeholder="ton@email.com"
              className="w-full rounded-md border border-nocturne-white/30 bg-nocturne-black/20 px-4 py-3 text-nocturne-white placeholder:text-nocturne-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-black"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-md bg-nocturne-black px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-black"
            >
              Démarrer gratuitement
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-nocturne-gray-dark px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <span className="font-mono text-sm font-bold tracking-widest text-nocturne-white">
            NOCTURNE
          </span>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-nocturne-text">
            <a href="#" className="transition-colors hover:text-nocturne-white">
              À propos
            </a>
            <a href="#" className="transition-colors hover:text-nocturne-white">
              Tarifs
            </a>
            <a href="#" className="transition-colors hover:text-nocturne-white">
              Docs
            </a>
            <a href="#" className="transition-colors hover:text-nocturne-white">
              Twitter
            </a>
            <a href="#" className="transition-colors hover:text-nocturne-white">
              Instagram
            </a>
          </nav>

          <span className="text-xs text-nocturne-text/60">
            © {new Date().getFullYear()} Nocturne Ticketing
          </span>
        </div>
      </footer>
    </main>
  );
}
