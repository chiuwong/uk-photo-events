"use client";
import Link from "next/link";
import type { Event, PhotoMeta } from "@prisma/client";

type EventWithMeta = Event & { photoMeta: PhotoMeta | null };

const TYPE_COLOURS: Record<string, string> = {
  FESTIVAL:  "bg-pink-100 text-pink-700",
  CUSTOM:    "bg-amber-100 text-amber-700",
  NATURE:    "bg-green-100 text-green-700",
  CULTURAL:  "bg-purple-100 text-purple-700",
  RELIGIOUS: "bg-blue-100 text-blue-700",
  SPORT:     "bg-orange-100 text-orange-700",
  MARKET:    "bg-teal-100 text-teal-700",
  ROYAL:     "bg-yellow-100 text-yellow-800",
  PROTEST:   "bg-red-100 text-red-700",
  PARADE:    "bg-fuchsia-100 text-fuchsia-700",
  VIGIL:     "bg-slate-100 text-slate-600",
  FAIR:      "bg-lime-100 text-lime-700",
};

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(start: Date, end?: Date | null): string {
  const s  = new Date(start);
  const mo = MONTHS[s.getMonth() + 1];
  const d  = s.getDate();
  if (!end) return `${d} ${mo}`;
  const e = new Date(end);
  if (e.getMonth() === s.getMonth()) return `${d}–${e.getDate()} ${mo}`;
  return `${d} ${mo} – ${e.getDate()} ${MONTHS[e.getMonth() + 1]}`;
}

interface Props { event: EventWithMeta }

export default function EventCard({ event }: Props) {
  const pm = event.photoMeta;

  const badges: string[] = [];
  if (pm?.fireSmokeLight)      badges.push("🔥 fire/light");
  if (pm?.bannersFlagsCandles) badges.push("🚩 banners");
  if (pm?.processionElements)  badges.push("🚶 procession");
  if (pm?.costumeCeremonial)   badges.push("🎭 costume");
  if (pm?.routeMoving)         badges.push("➡ moving");

  return (
    <Link
      href={`/events/${event.slug}`}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
    >
      {/* Image */}
      {event.imageUrl ? (
        <div className="aspect-video bg-slate-100 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl text-slate-300">
          📷
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-700 transition-colors">{event.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDate(event.startDate, event.endDate)} &middot; {event.city ?? event.region}
            </p>
          </div>
          {event.featured && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Featured</span>
          )}
        </div>

        {/* Type + region + score badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLOURS[event.type] ?? "bg-slate-100 text-slate-600"}`}>
            {event.type.toLowerCase()}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {event.region}
          </span>
          {pm?.photoPotentialScore != null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-amber-500">
              {"★".repeat(pm.photoPotentialScore)}{"☆".repeat(5 - pm.photoPotentialScore)}
            </span>
          )}
          {event.recurringAnnual && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">Annual</span>
          )}
        </div>

        {/* Description — 3 lines max, click card to see full */}
        {event.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{event.description}</p>
        )}

        {/* Best arrival time */}
        {pm?.bestArrivalTime && (
          <p className="text-xs text-slate-500">⏰ {pm.bestArrivalTime}</p>
        )}

        {/* Visual element badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((b) => (
              <span key={b} className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full">{b}</span>
            ))}
          </div>
        )}

        {/* Status warning */}
        {event.status !== "SCHEDULED" && (
          <p className="text-xs text-amber-600 font-medium">
            {event.status === "CANCELLED" ? "⚠ Cancelled" : event.status === "CHANGED" ? "⚠ Date/details changed" : "⚠ Unconfirmed"}
          </p>
        )}

        <p className="text-xs text-indigo-500 mt-auto">Tap for full details →</p>
      </div>
    </Link>
  );
}
