import { prisma } from "@/lib/prisma";
import CalendarWrapper from "@/components/CalendarWrapper";
import type { CalEvent } from "@/components/CalendarView";

export const metadata = { title: "Calendar · UK Photo Events" };

export default async function CalendarPage() {
  const raw = await prisma.event.findMany({
    where: { archived: false },
    include: { photoMeta: true },
    orderBy: { startDate: "asc" },
  });

  const events: CalEvent[] = raw.map((e) => ({
    id:                  e.id,
    slug:                e.slug,
    title:               e.title,
    startDate:           e.startDate.toISOString(),
    endDate:             e.endDate?.toISOString() ?? null,
    startTime:           e.startTime,
    endTime:             e.endTime,
    allDay:              e.allDay,
    status:              e.status,
    type:                e.type,
    region:              e.region,
    city:                e.city,
    venueName:           e.venueName,
    postcode:            e.postcode,
    description:         e.description,
    routeDescription:    e.routeDescription,
    featured:            e.featured,
    photoPotentialScore: e.photoMeta?.photoPotentialScore ?? null,
  }));

  const host = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const icsUrl = `${host}/api/calendar`;
  const webcalUrl = icsUrl.replace(/^https?/, "webcal");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-black pb-4 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">UK Photo Events</h1>
          <p className="text-sm text-gray-500 mt-1">Festivals, protests, customs &amp; nature moments worth shooting</p>
        </div>
        <a href="/admin/login" className="text-xs font-medium text-gray-400 hover:text-black px-3 py-1 border border-gray-300 hover:border-black transition-colors">
          Admin
        </a>
      </div>

      {/* View toggle + subscribe */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1">
          <a href="/"         className="text-sm px-4 py-1.5 border border-gray-300 text-gray-500 hover:text-black">List</a>
          <a href="/calendar" className="text-sm px-4 py-1.5 border border-black bg-black text-white">Calendar</a>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-600"></span>Confirmed
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-600 ml-2"></span>Unconfirmed
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 ml-2"></span>Cancelled
          </span>
          <a
            href={icsUrl}
            className="text-xs text-black underline underline-offset-2 hover:text-yellow-600 font-medium"
          >
            Download .ics ↓
          </a>
          <a
            href={webcalUrl}
            className="text-xs bg-black text-white px-3 py-1.5 hover:bg-gray-800 font-medium"
          >
            Subscribe (webcal) ↗
          </a>
        </div>
      </div>

      {/* Calendar */}
      <CalendarWrapper events={events} />
    </div>
  );
}
