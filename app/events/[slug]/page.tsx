import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(start: Date, end?: Date | null, startTime?: string | null, endTime?: string | null) {
  const s = new Date(start);
  const mo = MONTHS[s.getMonth() + 1];
  const d = s.getDate();
  let str = end && new Date(end).getDate() !== d
    ? (new Date(end).getMonth() === s.getMonth()
        ? `${d}–${new Date(end).getDate()} ${mo}`
        : `${d} ${mo} – ${new Date(end).getDate()} ${MONTHS[new Date(end).getMonth() + 1]}`)
    : `${d} ${mo}`;
  if (startTime) str += ` · ${startTime}${endTime ? `–${endTime}` : ""}`;
  return str;
}

const TYPE_COLOURS: Record<string, string> = {
  FESTIVAL: "bg-pink-100 text-pink-700", CUSTOM: "bg-amber-100 text-amber-700",
  NATURE: "bg-green-100 text-green-700", CULTURAL: "bg-purple-100 text-purple-700",
  RELIGIOUS: "bg-blue-100 text-blue-700", SPORT: "bg-orange-100 text-orange-700",
  MARKET: "bg-teal-100 text-teal-700", ROYAL: "bg-yellow-100 text-yellow-800",
  PROTEST: "bg-red-100 text-red-700", PARADE: "bg-fuchsia-100 text-fuchsia-700",
  VIGIL: "bg-slate-100 text-slate-600", FAIR: "bg-lime-100 text-lime-700",
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await prisma.event.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: { photoMeta: true, sources: true },
  });

  if (!event || event.archived) notFound();

  const pm = event.photoMeta;

  const visualFlags = [
    pm?.costumeCeremonial   && "🎭 Costume / ceremonial",
    pm?.fireSmokeLight      && "🔥 Fire, smoke or light",
    pm?.bannersFlagsCandles && "🚩 Banners, flags, candles",
    pm?.processionElements  && "🚶 Procession",
    pm?.ritualSignificance  && "✨ Ritual significance",
    pm?.protestVisibility   && "✊ Protest visibility",
    pm?.routeMoving         && "➡ Moving (not static)",
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">← Back to events</Link>

      {/* Image */}
      {event.imageUrl && (
        <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${TYPE_COLOURS[event.type] ?? "bg-slate-100 text-slate-600"}`}>
            {event.type.toLowerCase()}
          </span>
          {event.recurringAnnual && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Annual</span>
          )}
          {event.status !== "SCHEDULED" && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
              ⚠ {event.status === "CANCELLED" ? "Cancelled" : event.status === "CHANGED" ? "Details changed" : "Unconfirmed"}
            </span>
          )}
          {event.featured && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">Featured</span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>📅 {formatDate(event.startDate, event.endDate, event.allDay ? null : event.startTime, event.allDay ? null : event.endTime)}</span>
          {(event.city || event.venueName) && <span>📍 {[event.venueName, event.city, event.county, event.region].filter(Boolean).join(", ")}</span>}
          {event.free === true && <span>✓ Free entry</span>}
          {event.indoorOutdoor && <span>{event.indoorOutdoor === "OUTDOOR" ? "☀ Outdoor" : event.indoorOutdoor === "INDOOR" ? "🏛 Indoor" : "☀/🏛 Indoor & outdoor"}</span>}
        </div>
      </div>

      {/* Official link */}
      {event.officialUrl && (
        <a
          href={event.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Official website ↗
        </a>
      )}

      {/* Description */}
      {event.description && (
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed text-base">{event.description}</p>
        </div>
      )}

      {/* Route */}
      {event.routeDescription && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Route</p>
          <p className="text-sm text-slate-700">{event.routeDescription}</p>
        </div>
      )}

      {/* Travel */}
      {(event.nearestStation || event.travelNotes) && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Getting there</p>
          {event.nearestStation && <p className="text-sm text-slate-700">🚉 {event.nearestStation}</p>}
          {event.travelNotes && <p className="text-sm text-slate-700">{event.travelNotes}</p>}
        </div>
      )}

      {/* Photo metadata */}
      {pm && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">📷 Photography notes</h2>
            {pm.photoPotentialScore != null && (
              <span className="text-amber-500 text-lg">
                {"★".repeat(pm.photoPotentialScore)}{"☆".repeat(5 - pm.photoPotentialScore)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {pm.bestArrivalTime && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Best arrival time</p>
                <p className="text-slate-700">{pm.bestArrivalTime}</p>
              </div>
            )}
            {pm.daytimeNightValue && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Timing</p>
                <p className="text-slate-700 capitalize">{pm.daytimeNightValue}</p>
              </div>
            )}
            {pm.bestViewingPosition && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Best viewing position</p>
                <p className="text-slate-700">{pm.bestViewingPosition}</p>
              </div>
            )}
            {pm.lensSuggestion && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Lens suggestion</p>
                <p className="text-slate-700">{pm.lensSuggestion}</p>
              </div>
            )}
          </div>

          {visualFlags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visualFlags.map((f) => (
                <span key={f} className="text-xs bg-white border border-amber-200 text-slate-600 px-2.5 py-1 rounded-full">{f}</span>
              ))}
            </div>
          )}

          {pm.safetyNotes && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-red-600 mb-0.5">Safety notes</p>
              <p className="text-sm text-red-700">{pm.safetyNotes}</p>
            </div>
          )}

          {pm.previousYearNotes && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Previous year notes</p>
              <p className="text-sm text-slate-700 italic">{pm.previousYearNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((t) => (
            <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
