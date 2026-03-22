"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event, PhotoMeta } from "@prisma/client";

type EventWithMeta = Event & { photoMeta: PhotoMeta | null };

export default function AdminEventRow({ event }: { event: EventWithMeta }) {
  const router = useRouter();

  async function toggleArchive() {
    await fetch(`/api/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !event.archived }),
    });
    router.refresh();
  }

  async function toggleFeatured() {
    await fetch(`/api/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !event.featured }),
    });
    router.refresh();
  }

  async function deleteEvent() {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    router.refresh();
  }

  const dateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "—";

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {event.featured && <span className="text-amber-500 text-xs">★</span>}
          <span className="font-medium text-slate-800">{event.title}</span>
        </div>
        {event.city && <span className="text-xs text-slate-400">{event.city}</span>}
      </td>
      <td className="px-4 py-3 text-slate-600 capitalize">{event.type.toLowerCase()}</td>
      <td className="px-4 py-3 text-slate-600">{event.region}</td>
      <td className="px-4 py-3 text-slate-600">{dateStr}</td>
      <td className="px-4 py-3 text-slate-600">
        {event.photoMeta?.photoPotentialScore ? `${event.photoMeta.photoPotentialScore}/5` : "—"}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          event.status === "SCHEDULED" ? "bg-green-100 text-green-700" :
          event.status === "CANCELLED" ? "bg-red-100 text-red-700" :
          event.status === "UNCONFIRMED" ? "bg-yellow-100 text-yellow-700" :
          "bg-slate-100 text-slate-600"
        }`}>
          {event.status.toLowerCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 justify-end">
          <button onClick={toggleFeatured} className="text-xs text-slate-400 hover:text-amber-500" title={event.featured ? "Unfeature" : "Feature"}>
            {event.featured ? "★" : "☆"}
          </button>
          <Link href={`/admin/events/${event.id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-800">Edit</Link>
          <button onClick={toggleArchive} className="text-xs text-slate-400 hover:text-slate-700">
            {event.archived ? "Restore" : "Archive"}
          </button>
          <button onClick={deleteEvent} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
      </td>
    </tr>
  );
}
