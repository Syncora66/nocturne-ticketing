import HeroVideoScroll from "@/components/landing/HeroVideoScroll";
import ScrollReveal from "@/components/ScrollReveal";
import HowItWorks from "@/components/landing/HowItWorks";
import AiSupportShowcase from "@/components/landing/AiSupportShowcase";
import TrustSection from "@/components/landing/TrustSection";

export default function Home() {
  return (
    <main>
      <HeroVideoScroll />

      <HowItWorks />
      <AiSupportShowcase />
      <TrustSection />

      {/* CTA */}
      <section className="bg-tick8t-violet px-6 py-24 sm:px-10 lg:px-16">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
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
              className="inline-block rounded-md bg-nocturne-black px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-[transform,background-color,color] duration-200 ease-out hover:bg-tick8t-cyan hover:text-nocturne-black active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-black"
            >
              Créer mon événement
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-nocturne-gray-dark px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <span className="font-mono text-sm font-bold tracking-widest text-nocturne-white">
            NOCTURNE
          </span>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-tick8t-secondary">
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

          <span className="text-xs text-tick8t-secondary/60">
            © {new Date().getFullYear()} Nocturne Ticketing
          </span>
        </div>
      </footer>
    </main>
  );
}
