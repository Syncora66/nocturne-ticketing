export default function StatsCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-6">
      <p className="text-sm text-nocturne-text">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-nocturne-white">
        {value}
      </p>
    </div>
  );
}
