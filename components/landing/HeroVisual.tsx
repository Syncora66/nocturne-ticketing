function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6.5L5 9L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroVisual() {
  return (
    <div
      className="relative aspect-square w-full max-w-md justify-self-center lg:justify-self-end"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full border border-nocturne-gray-dark" />
      <div className="absolute inset-10 rounded-full border border-nocturne-rose/15" />

      <div className="absolute inset-12 flex flex-col justify-center gap-3 rounded-2xl border border-nocturne-gray-dark bg-nocturne-gray p-6 shadow-2xl shadow-black/40 sm:inset-14">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-nocturne-cyan" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-nocturne-text/60">
            Support IA — en direct
          </span>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-lg bg-nocturne-rose px-3 py-2 text-xs leading-relaxed text-nocturne-white">
            J&apos;ai pas reçu mon billet
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg bg-nocturne-gray-dark px-3 py-2 text-xs leading-relaxed text-nocturne-white">
            C&apos;est renvoyé, vérifie ta boîte mail !
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-nocturne-cyan">
          <CheckIcon />
          Résolu automatiquement
        </div>
      </div>

      <div className="float-badge absolute -right-2 top-4 rounded-full border border-nocturne-cyan/40 bg-nocturne-black px-3 py-1.5 font-mono text-[10px] font-bold text-nocturne-cyan shadow-lg sm:-right-6">
        QR renvoyé
      </div>
      <div className="float-badge-delayed absolute -left-2 bottom-6 rounded-full border border-nocturne-rose/40 bg-nocturne-black px-3 py-1.5 font-mono text-[10px] font-bold text-nocturne-rose shadow-lg sm:-left-6">
        Remboursement transmis
      </div>
    </div>
  );
}
