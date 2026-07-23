// Fixed 9x9 pattern styled after a QR code (finder squares in three
// corners + scattered fill). Purely decorative — hand-authored and
// deterministic so server/client markup always matches.
const QR_FILLED_CELLS = new Set([
  "0,0","0,1","0,2","1,0","1,2","2,0","2,1","2,2",
  "0,6","0,7","0,8","1,6","1,8","2,6","2,7","2,8",
  "6,0","6,1","6,2","7,0","7,2","8,0","8,1","8,2",
  "4,0","4,2","4,4","4,6","4,8",
  "0,4","2,4","6,4","8,4",
  "3,3","3,5","5,3","5,5",
  "6,6","6,8","7,7","8,6","8,8",
]);

function QrGlyph() {
  const cells = [];
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      if (QR_FILLED_CELLS.has(`${x},${y}`)) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
      }
    }
  }

  return (
    <svg
      viewBox="0 0 9 9"
      className="h-16 w-16 rounded bg-nocturne-white p-1 fill-nocturne-black sm:h-20 sm:w-20"
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

export default function TicketScreenContent() {
  return (
    <div className="flex h-full flex-col justify-between px-1 py-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-nocturne-white/70">
          Nocturne
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-nocturne-cyan" />
      </div>

      <div>
        <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-nocturne-cyan">
          Billet électronique
        </p>
        <p className="mt-1 text-sm font-extrabold leading-tight text-nocturne-white sm:text-base">
          Midnight Sessions
        </p>
        <p className="mt-0.5 text-[10px] text-nocturne-text/70">
          24 juillet · Warehouse 9
        </p>
      </div>

      <div className="my-2 border-t border-dashed border-nocturne-white/15" />

      <div className="flex items-center justify-center">
        <QrGlyph />
      </div>

      <p className="mt-2 text-center font-mono text-[8px] tracking-[0.3em] text-nocturne-text/50">
        #NCT-8842
      </p>
    </div>
  );
}
