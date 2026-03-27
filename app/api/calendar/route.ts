import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { escapeICS, foldLine } from "@/lib/calendar";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd  = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const ymdt = (d: Date, t?: string | null) => {
  if (!t) return `${ymd(d)}T120000Z`;
  const [h, m] = t.split(":");
  return `${ymd(d)}T${h}${m}00Z`;
};

export async function GET() {
  const events = await prisma.event.findMany({
    where: { archived: false },
    orderBy: { startDate: "asc" },
  });

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UK Photo Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:UK Photo Events",
    "X-WR-CALDESC:Festivals\\, customs\\, protests & photography events across England",
    "X-WR-TIMEZONE:Europe/London",
  ];

  for (const e of events) {
    const endDate = e.endDate ?? e.startDate;

    let dtstart: string, dtend: string;
    if (e.allDay) {
      const endEx = new Date(endDate);
      endEx.setUTCDate(endEx.getUTCDate() + 1);
      dtstart = `DTSTART;VALUE=DATE:${ymd(e.startDate)}`;
      dtend   = `DTEND;VALUE=DATE:${ymd(endEx)}`;
    } else {
      dtstart = `DTSTART:${ymdt(e.startDate, e.startTime)}`;
      dtend   = `DTEND:${ymdt(endDate, e.endTime ?? e.startTime)}`;
    }

    const location = [e.venueName, e.city, e.postcode].filter(Boolean).join(", ");
    const icsStatus =
      e.status === "SCHEDULED"   ? "CONFIRMED" :
      e.status === "CANCELLED"   ? "CANCELLED" : "TENTATIVE";

    lines.push(
      "BEGIN:VEVENT",
      foldLine(`UID:${e.slug}@ukphotoevents`),
      foldLine(`SUMMARY:${escapeICS(e.title)}`),
      dtstart,
      dtend,
      `STATUS:${icsStatus}`,
      ...(e.description ? [foldLine(`DESCRIPTION:${escapeICS(e.description.slice(0, 400))}`)] : []),
      ...(location       ? [foldLine(`LOCATION:${escapeICS(location)}`)]                      : []),
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type":        "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="uk-photo-events.ics"',
      "Cache-Control":       "s-maxage=3600, stale-while-revalidate",
    },
  });
}
