export type EventRow = {
  id: string;
  name: string;
  date: string;
  status: "draft" | "published" | "ended";
};

export default function EventsTable({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-nocturne-gray-dark p-10 text-center">
        <p className="text-sm text-nocturne-text">
          Aucun événement pour l&apos;instant.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-nocturne-gray-dark">
      <table className="w-full text-left text-sm">
        <thead className="bg-nocturne-gray text-nocturne-text">
          <tr>
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {events.slice(0, 5).map((event) => (
            <tr
              key={event.id}
              className="border-t border-nocturne-gray-dark text-nocturne-white"
            >
              <td className="px-4 py-3">{event.name}</td>
              <td className="px-4 py-3">
                {new Date(event.date).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3 capitalize">{event.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
