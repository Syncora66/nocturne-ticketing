import FadeInSection from "@/components/FadeInSection";

export default function AiSupportShowcase() {
  return (
    <section className="border-y border-nocturne-gray-dark bg-nocturne-gray px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeInSection className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-nocturne-rose">
            LA DIFFÉRENCE NOCTURNE
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-4xl">
            L&apos;IA gère ton support client.
            <br />
            <span className="text-nocturne-cyan">
              Toi, tu gardes le contrôle total.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-nocturne-text sm:text-lg">
            Remboursements, billets perdus, questions clients — l&apos;agent
            IA s&apos;en occupe jour et nuit. Rien n&apos;est décidé sans toi
            sur l&apos;argent.
          </p>
        </FadeInSection>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <FadeInSection delayMs={0}>
            <div className="flex h-full flex-col rounded-lg border border-nocturne-gray-dark bg-nocturne-black p-8">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-nocturne-cyan">
                Automatique
              </span>
              <h3 className="mt-3 text-xl font-bold text-nocturne-white">
                Renvoi de billet, sans intervention
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-nocturne-text">
                Un acheteur a perdu son QR code ? L&apos;IA retrouve son
                billet, en génère un nouveau et le renvoie par email. Résolu
                en quelques secondes.
              </p>

              <div className="mt-6 rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg bg-nocturne-gray-dark px-3 py-2 text-xs leading-relaxed text-nocturne-white">
                    Je n&apos;ai pas reçu mon billet
                  </div>
                </div>
                <div className="mt-2 flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-nocturne-cyan/10 px-3 py-2 text-xs leading-relaxed text-nocturne-cyan">
                    C&apos;est renvoyé, vérifie ta boîte mail !
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delayMs={100}>
            <div className="flex h-full flex-col rounded-lg border border-nocturne-gray-dark bg-nocturne-black p-8">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-nocturne-rose">
                Toujours validé par toi
              </span>
              <h3 className="mt-3 text-xl font-bold text-nocturne-white">
                Remboursements, jamais décidés sans toi
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-nocturne-text">
                L&apos;IA ne rembourse jamais seule. Elle qualifie la
                demande, la classe par priorité et te la transmet dans un
                tableau de bord dédié. Tu valides, elle exécute.
              </p>

              <div className="mt-6 rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-nocturne-white">
                    Marie D.
                  </span>
                  <span className="rounded bg-nocturne-rose/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-nocturne-rose">
                    high
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-nocturne-text">
                  « L&apos;événement a été annulé, je veux être remboursée »
                </p>
                <div className="mt-3 inline-block rounded-md bg-nocturne-gray-dark px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-nocturne-text">
                  En attente de validation
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
