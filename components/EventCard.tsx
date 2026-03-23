"use client";
import type { Event, PhotoMeta } from "@prisma/client";

type EventWithMeta = Event & { photoMeta: PhotoMeta | null };

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(start: Date, end?: Date | null, startTime?: string | null): string {
  const s  = new Date(start);
  const mo = MONTHS[s.getMonth() + 1];
  const d  = s.getDate();
  let str = !end ? `${d} ${mo}` : (() => {
    const e = new Date(end);
    return e.getMonth() === s.getMonth()
      ? `${d}–${e.getDate()} ${mo}`
      : `${d} ${mo} – ${e.getDate()} ${MONTHS[e.getMonth() + 1]}`;
  })();
  if (startTime) str += ` · ${startTime}`;
  return str;
}

interface Props { event: EventWithMeta }

export default function EventCard({ event }: Props) {
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
    pm.bestArrivalTime ||
    pm.bestViewingPosition ||
    pm.lensSuggestion ||
    pm.daytimeNightValue ||
    visualFlags.length > 0 ||
    pm.safetyNotes ||
    pm.previousYearNotes
  );

  return (
    <div className="bg-white border border-gray-200">
      {/* Image — full width */}
      {event.imageUrl && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Body — two columns when photo notes exist */}
      <div className={`p-6 ${hasPhotoNotes ? "flex flex-col gap-8 md:grid md:grid-cols-[1fr_300px]" : "flex flex-col gap-5"}`}>

        {/* LEFT: event info */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          {event.status !== "SCHEDULED" && (
            <p className="text-xs font-medium bg-yellow-300 text-black px-2 py-1 self-start">
              {event.status === "CANCELLED" ? "Cancelled" : event.status === "CHANGED" ? "Details changed" : "Unconfirmed — check before travelling"}
            </p>
          )}

          {/* Title */}
          <div>
            <h3 className="font-bold text-black text-lg leading-tight mb-1">{event.title}</h3>
            <p className="text-sm text-gray-500">
              {formatDate(event.startDate, event.endDate, event.allDay ? null : event.startTime)}
              {(event.city || event.venueName) && (
                <> &nbsp;·&nbsp; {[event.venueName, event.city].filter(Boolean).join(", ")}</>
              )}
              {event.county && <> &nbsp;·&nbsp; {event.county}</>}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs border border-black px-2 py-0.5 capitalize font-medium">{event.type.toLowerCase()}</span>
            <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">{event.region}</span>
            {event.free === true && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Free</span>}
            {event.indoorOutdoor === "OUTDOOR" && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Outdoor</span>}
            {event.indoorOutdoor === "INDOOR"  && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Indoor</span>}
            {event.recurringAnnual && <span className="text-xs border border-gray-300 text-gray-500 px-2 py-0.5">Annual</span>}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
          )}

          {/* Route */}
          {event.routeDescription && (
            <p className="text-sm text-gray-500 border-l-2 border-gray-300 pl-3">{event.routeDescription}</p>
          )}

          {/* Travel */}
          {(event.nearestStation || event.travelNotes) && (
            <div className="text-sm text-gray-500 space-y-0.5">
              {event.nearestStation && <p>Station — {event.nearestStation}</p>}
              {event.travelNotes && <p>{event.travelNotes}</p>}
            </div>
          )}

          {/* Google Images link */}
          <a
            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(event.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black underline underline-offset-2 hover:text-yellow-600 self-start font-medium"
          >
            Image search ↗
          </a>
        </div>

        {/* RIGHT: photography notes */}
        {hasPhotoNotes && (
          <div className="border-t border-gray-200 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-black">Photography notes</p>

            {pm?.crowdSizeEstimate && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Attendance</p>
                <p className="text-sm text-gray-700">{pm.crowdSizeEstimate}</p>
              </div>
            )}

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
    </div>
  );
}
