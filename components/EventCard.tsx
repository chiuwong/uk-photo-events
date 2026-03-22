"use client";
import { useState } from "react";
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

function formatDate(start: Date, end?: Date | null, startTime?: string | null): string {
  const s  = new Date(start);
  const mo = MONTHS[s.getMonth() + 1];
  const d  = s.getDate();
  let str = "";
  if (!end) str = `${d} ${mo}`;
  else {
    const e = new Date(end);
    str = e.getMonth() === s.getMonth()
      ? `${d}–${e.getDate()} ${mo}`
      : `${d} ${mo} – ${e.getDate()} ${MONTHS[e.getMonth() + 1]}`;
  }
  if (startTime) str += ` · ${startTime}`;
  return str;
}

interface Props { event: EventWithMeta }

export default function EventCard({ event }: Props) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const pm = event.photoMeta;

  const visualFlags = [
    pm?.fireSmokeLight      && "🔥 fire/light",
    pm?.bannersFlagsCandles && "🚩 banners",
    pm?.processionElements  && "🚶 procession",
    pm?.costumeCeremonial   && "🎭 costume",
    pm?.routeMoving         && "➡ moving",
    pm?.protestVisibility   && "✊ protest",
    pm?.ritualSignificance  && "✨ ritual",
  ].filter(Boolean) as string[];

  const hasPhotoNotes = pm && (
    pm.photoPotentialScore != null ||
    pm.bestArrivalTime ||
    pm.bestViewingPosition ||
    pm.lensSuggestion ||
    pm.daytimeNightValue ||
    visualFlags.length > 0 ||
    pm.safetyNotes ||
    pm.previousYearNotes
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      {/* Image */}
      {event.imageUrl ? (
        <div className="aspect-video bg-slate-100 overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-400" />
      )}

      <div className="p-5 flex flex-col gap-3">
        {/* Status warning */}
        {event.status !== "SCHEDULED" && (
          <p className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
            {event.status === "CANCELLED" ? "⚠ Cancelled" : event.status === "CHANGED" ? "⚠ Date/details changed" : "⚠ Unconfirmed — check before travelling"}
          </p>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{event.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              📅 {formatDate(event.startDate, event.endDate, event.allDay ? null : event.startTime)}
              {(event.city || event.venueName) && (
                <> &nbsp;·&nbsp; 📍 {[event.venueName, event.city].filter(Boolean).join(", ")}</>
              )}
            </p>
          </div>
          {event.featured && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Featured</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLOURS[event.type] ?? "bg-slate-100 text-slate-600"}`}>
            {event.type.toLowerCase()}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{event.region}</span>
          {event.indoorOutdoor === "OUTDOOR" && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">☀ Outdoor</span>}
          {event.indoorOutdoor === "INDOOR"  && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">🏛 Indoor</span>}
          {event.free === true && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">Free</span>}
          {event.recurringAnnual && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">Annual</span>}
          {pm?.photoPotentialScore != null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-500">
              {"★".repeat(pm.photoPotentialScore)}{"☆".repeat(5 - pm.photoPotentialScore)}
            </span>
          )}
        </div>

        {/* Full description — no clipping */}
        {event.description && (
          <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
        )}

        {/* Route */}
        {event.routeDescription && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">➡ {event.routeDescription}</p>
        )}

        {/* Travel */}
        {event.nearestStation && (
          <p className="text-xs text-slate-500">🚉 {event.nearestStation}</p>
        )}

        {/* Official link */}
        {event.officialUrl && (
          <a
            href={event.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Official website ↗
          </a>
        )}

        {/* Photography notes — collapsible */}
        {hasPhotoNotes && (
          <div className="border-t border-slate-100 pt-3">
            <button
              onClick={() => setPhotoOpen((o) => !o)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                📷 Photography notes
                {pm?.photoPotentialScore != null && (
                  <span className="ml-2 text-amber-500 normal-case font-normal">
                    {"★".repeat(pm.photoPotentialScore)}{"☆".repeat(5 - pm.photoPotentialScore)}
                  </span>
                )}
              </span>
              <span className="text-slate-400 text-xs">{photoOpen ? "▲ hide" : "▼ show"}</span>
            </button>

            {photoOpen && (
              <div className="mt-3 space-y-3">
                {pm?.bestArrivalTime && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Best arrival time</p>
                    <p className="text-sm text-slate-700">{pm.bestArrivalTime}</p>
                  </div>
                )}
                {pm?.daytimeNightValue && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Timing</p>
                    <p className="text-sm text-slate-700 capitalize">{pm.daytimeNightValue}</p>
                  </div>
                )}
                {pm?.bestViewingPosition && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Best position</p>
                    <p className="text-sm text-slate-700">{pm.bestViewingPosition}</p>
                  </div>
                )}
                {pm?.lensSuggestion && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Lens suggestion</p>
                    <p className="text-sm text-slate-700">{pm.lensSuggestion}</p>
                  </div>
                )}
                {visualFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {visualFlags.map((f) => (
                      <span key={f} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                )}
                {pm?.safetyNotes && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-red-600">Safety</p>
                    <p className="text-sm text-red-700">{pm.safetyNotes}</p>
                  </div>
                )}
                {pm?.previousYearNotes && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Previous year</p>
                    <p className="text-sm text-slate-600 italic">{pm.previousYearNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
