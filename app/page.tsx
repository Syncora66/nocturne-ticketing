import HeroVisual from "@/components/landing/HeroVisual";
import HowItWorks from "@/components/landing/HowItWorks";
import AiSupportShowcase from "@/components/landing/AiSupportShowcase";
import TrustSection from "@/components/landing/TrustSection";

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

            <div className="mt-6 max-w-lg rounded-lg border-l-2 border-nocturne-cyan bg-nocturne-cyan/5 py-3 pl-4">
              <p className="text-base font-bold leading-relaxed text-nocturne-white sm:text-lg">
                L&apos;IA gère ton support client — remboursements, renvoi de
                billets.{" "}
                <span className="text-nocturne-cyan">
                  Toi, tu gardes le contrôle total.
                </span>
              </p>
            </div>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-nocturne-text sm:text-base">
              Ticketing moderne pour collectifs événementiels. Zéro
              commission cachée.
            </p>

            <div className="mt-10">
              <a
                href="/auth/signup"
                className="inline-block rounded-md bg-nocturne-rose px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-[transform,background-color,color] duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
              >
                Créer mon événement
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-mono text-xs font-bold tracking-wide text-nocturne-text/70">
                0.50€ / TICKET
              </span>
              <span className="h-1 w-1 rounded-full bg-nocturne-gray-dark" />
              <span className="font-mono text-xs font-bold tracking-wide text-nocturne-text/70">
                SUPPORT IA 24/7
              </span>
              <span className="h-1 w-1 rounded-full bg-nocturne-gray-dark" />
              <span className="font-mono text-xs font-bold tracking-wide text-nocturne-text/70">
                0% COMMISSION CACHÉE
              </span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <HowItWorks />
      <AiSupportShowcase />
      <TrustSection />

      {/* CTA */}
      <section className="bg-nocturne-rose px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-4xl">
            Ton support client, sur pilote automatique.
          </h2>
          <p className="mt-4 text-base text-nocturne-white/80 sm:text-lg">
            Crée ton événement, vends tes billets. L&apos;IA prend le relais
            sur le support, tu gardes la main sur l&apos;argent.
          </p>

          <div className="mx-auto mt-10">
            <a
              href="/auth/signup"
              className="inline-block rounded-md bg-nocturne-black px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-[transform,background-color,color] duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-black"
            >
              Créer mon événement
            </a>
          </div>
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
