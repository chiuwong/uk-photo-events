"use client";
import { useState } from "react";
import type { Event, PhotoMeta } from "@prisma/client";

type EventWithMeta = Event & { photoMeta: PhotoMeta | null };

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
    pm?.fireSmokeLight      && "Fire / light",
    pm?.bannersFlagsCandles && "Banners / flags",
    pm?.processionElements  && "Procession",
    pm?.costumeCeremonial   && "Costume",
    pm?.routeMoving         && "Moving",
    pm?.protestVisibility   && "Protest",
    pm?.ritualSignificance  && "Ritual",
  ].filter(Boolean) as string[];

  const hasPhotoNotes = pm && (
    pm.photoPotentialScore != null ||
    pm.bestArrivalTime ||
    pm.bestViewingPosition ||
    pm.lensSuggestion ||
    visualFlags.length > 0 ||
    pm.safetyNotes ||
    pm.previousYearNotes
  );

  return (
    <div className="bg-white border border-gray-200 flex flex-col">
      {/* Image */}
      {event.imageUrl ? (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-1 bg-black" />
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Status */}
        {event.status !== "SCHEDULED" && (
          <p className="text-xs font-medium bg-yellow-300 text-black px-2 py-1 self-start">
            {event.status === "CANCELLED" ? "Cancelled" : event.status === "CHANGED" ? "Details changed" : "Unconfirmed"}
          </p>
        )}

        {/* Title & date */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-black text-base leading-tight">{event.title}</h3>
            {event.featured && (
              <span className="text-xs bg-yellow-300 text-black px-2 py-0.5 font-medium whitespace-nowrap shrink-0">Featured</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatDate(event.startDate, event.endDate, event.allDay ? null : event.startTime)}
            {(event.city || event.venueName) && (
              <> &nbsp;·&nbsp; {[event.venueName, event.city].filter(Boolean).join(", ")}</>
            )}
          </p>
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs border border-black px-2 py-0.5 capitalize">{event.type.toLowerCase()}</span>
          <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">{event.region}</span>
          {event.free === true && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Free</span>}
          {event.indoorOutdoor === "OUTDOOR" && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Outdoor</span>}
          {event.indoorOutdoor === "INDOOR"  && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Indoor</span>}
          {event.recurringAnnual && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Annual</span>}
          {pm?.photoPotentialScore != null && (
            <span className="text-xs bg-yellow-300 text-black px-2 py-0.5 font-medium">
              {"★".repeat(pm.photoPotentialScore)}{"☆".repeat(5 - pm.photoPotentialScore)}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
        )}

        {/* Route */}
        {event.routeDescription && (
          <p className="text-xs text-gray-500 border-l-2 border-gray-300 pl-3">{event.routeDescription}</p>
        )}

        {/* Travel */}
        {event.nearestStation && (
          <p className="text-xs text-gray-500">Station: {event.nearestStation}</p>
        )}

        {/* Official link */}
        {event.officialUrl && (
          <a
            href={event.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-black underline underline-offset-2 hover:text-yellow-600 self-start"
          >
            Official website ↗
          </a>
        )}

        {/* Photography notes */}
        {hasPhotoNotes && (
          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={() => setPhotoOpen((o) => !o)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-black">
                Photography notes
                {pm?.photoPotentialScore != null && (
                  <span className="ml-2 bg-yellow-300 px-1.5 py-0.5 normal-case font-normal tracking-normal">
                    {"★".repeat(pm.photoPotentialScore)}
                  </span>
                )}
              </span>
              <span className="text-gray-400 text-xs">{photoOpen ? "▲" : "▼"}</span>
            </button>

            {photoOpen && (
              <div className="mt-4 space-y-3">
                {pm?.bestArrivalTime && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Arrive</p>
                    <p className="text-sm text-gray-700">{pm.bestArrivalTime}</p>
                  </div>
                )}
                {pm?.daytimeNightValue && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Timing</p>
                    <p className="text-sm text-gray-700 capitalize">{pm.daytimeNightValue}</p>
                  </div>
                )}
                {pm?.bestViewingPosition && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Position</p>
                    <p className="text-sm text-gray-700">{pm.bestViewingPosition}</p>
                  </div>
                )}
                {pm?.lensSuggestion && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Lens</p>
                    <p className="text-sm text-gray-700">{pm.lensSuggestion}</p>
                  </div>
                )}
                {visualFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {visualFlags.map((f) => (
                      <span key={f} className="text-xs border border-yellow-400 text-black px-2 py-0.5">{f}</span>
                    ))}
                  </div>
                )}
                {pm?.safetyNotes && (
                  <div className="border-l-2 border-black pl-3">
                    <p className="text-xs font-bold uppercase tracking-wide mb-0.5">Safety</p>
                    <p className="text-sm text-gray-700">{pm.safetyNotes}</p>
                  </div>
                )}
                {pm?.previousYearNotes && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Previous year</p>
                    <p className="text-sm text-gray-600 italic">{pm.previousYearNotes}</p>
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
