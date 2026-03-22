import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminEventRow from "./AdminEventRow";

interface PageProps {
  searchParams: Promise<{ q?: string; region?: string; archived?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { q, region, archived } = params;

  const where = {
    archived: archived === "true",
    ...(region && { region }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { city:  { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const events = await prisma.event.findMany({
    where,
    include: { photoMeta: true },
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Events ({events.length})</h1>
        <Link
          href="/admin/events/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          + New event
        </Link>
      </div>

      <form method="GET" className="flex gap-3 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title or city…"
          className="flex-1 min-w-48 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        <select name="archived" defaultValue={archived ?? ""} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Active</option>
          <option value="true">Archived</option>
        </select>
        <button type="submit" className="bg-slate-700 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded-xl">Search</button>
        <a href="/admin" className="text-sm text-slate-400 hover:text-slate-600 self-center px-2">Reset</a>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Region</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Score</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <AdminEventRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <p className="text-center py-12 text-slate-400">No events found</p>
        )}
      </div>
    </div>
  );
}
