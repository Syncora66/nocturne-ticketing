import TicketScreenContent from "./TicketScreenContent";

/**
 * Static fallback for Hero3DPhone — used on mobile / small viewports
 * where the WebGL scene is skipped for performance, and as the
 * no-JS/pre-hydration placeholder shape.
 */
export default function HeroVisual() {
  return (
    <div
      className="relative aspect-square w-full max-w-md justify-self-center lg:justify-self-end"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full border border-nocturne-gray-dark" />
      <div className="absolute inset-10 rounded-full border border-nocturne-rose/15" />

      <div className="absolute inset-12 rounded-2xl border border-nocturne-gray-dark bg-nocturne-gray p-4 shadow-2xl shadow-black/40 sm:inset-14">
        <TicketScreenContent />
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
