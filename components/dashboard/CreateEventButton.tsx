import Link from "next/link";

export default function CreateEventButton() {
  return (
    <Link
      href="/dashboard/create-event"
      className="inline-block rounded-md bg-nocturne-rose px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black"
    >
      Créer un événement
    </Link>
  );
}
