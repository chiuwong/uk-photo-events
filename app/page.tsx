import { prisma } from "@/lib/prisma";
import { EventType } from "@prisma/client";
import EventCard from "@/components/EventCard";

const REGIONS = [
  "London","South East","South West","East of England",
  "East Midlands","West Midlands","Yorkshire",
  "North West","North East","Scotland","Wales","Northern Ireland",
];

const EVENT_TYPES: EventType[] = [
  "FESTIVAL","CUSTOM","NATURE","CULTURAL","RELIGIOUS",
  "SPORT","MARKET","ROYAL","PROTEST","PARADE","VIGIL","FAIR",
];

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface PageProps {
  searchParams: Promise<{
    region?: string;
    type?: string;
    month?: string;
    q?: string;
    minScore?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const { region, type, month, q, minScore } = params;

  const where = {
    archived: false,
    ...(region && { region }),
    ...(type   && { type: type as EventType }),
    ...(month  && {
      startDate: {
        gte: new Date(`2026-${month.padStart(2, "0")}-01`),
        lt:  new Date(`2026-${String(parseInt(month) + 1).padStart(2, "0")}-01`),
      },
    }),
    ...(q && {
      OR: [
        { title:       { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { city:        { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(minScore && {
      photoMeta: { photoPotentialScore: { gte: parseInt(minScore) } },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { photoMeta: true },
      orderBy: [{ featured: "desc" }, { startDate: "asc" }],
      take: 100,
    }),
    prisma.event.count({ where }),
  ]);

  const select = "border border-gray-300 bg-white text-black text-sm px-3 py-2 focus:outline-none focus:border-black";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-black pb-4">
        <h1 className="text-3xl font-bold text-black tracking-tight">UK Photo Events</h1>
        <p className="text-sm text-gray-500 mt-1">Festivals, protests, customs &amp; nature moments worth shooting</p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search…"
          className="flex-1 min-w-48 border border-gray-300 bg-white text-black text-sm px-3 py-2 focus:outline-none focus:border-black"
        />
        <select name="region" defaultValue={region ?? ""} className={select}>
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select name="type" defaultValue={type ?? ""} className={select}>
          <option value="">All types</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
        </select>
        <select name="month" defaultValue={month ?? ""} className={select}>
          <option value="">All months</option>
          {MONTHS.slice(1).map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
        </select>
        <select name="minScore" defaultValue={minScore ?? ""} className={select}>
          <option value="">Any score</option>
          <option value="3">★★★+</option>
          <option value="4">★★★★+</option>
          <option value="5">★★★★★ only</option>
        </select>
        <button type="submit" className="bg-black text-white text-sm font-medium px-5 py-2 hover:bg-gray-800 transition-colors">
          Filter
        </button>
        <a href="/" className="text-sm text-gray-400 hover:text-black px-3 py-2 self-center">Reset</a>
      </form>

      <p className="text-xs text-gray-400 uppercase tracking-widest">
        {events.length} of {total} events
      </p>

      {events.length === 0 ? (
        <div className="text-center py-24 border border-gray-200">
          <p className="text-gray-400 text-sm">No events match your filters</p>
          <a href="/" className="mt-3 text-sm text-black underline block">Reset filters</a>
        </div>
      ) : (
        <div className="max-w-2xl space-y-4">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
