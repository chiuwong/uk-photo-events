"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Event, PhotoMeta, EventType, EventStatus, IndoorOutdoor } from "@prisma/client";

type EventWithMeta = Event & { photoMeta: PhotoMeta | null };

const REGIONS = [
  "London","South East","South West","East of England",
  "East Midlands","West Midlands","Yorkshire","North West","North East",
];

const EVENT_TYPES: EventType[] = [
  "FESTIVAL","CUSTOM","NATURE","CULTURAL","RELIGIOUS",
  "SPORT","MARKET","ROYAL","PROTEST","PARADE","VIGIL","FAIR",
];

const EVENT_STATUSES: EventStatus[] = ["SCHEDULED","UNCONFIRMED","CHANGED","CANCELLED"];

interface Props {
  event?: EventWithMeta;
}

export default function EventForm({ event }: Props) {
  const router = useRouter();
  const isEdit = !!event;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: event?.title ?? "",
    type: event?.type ?? "FESTIVAL",
    status: event?.status ?? "SCHEDULED",
    region: event?.region ?? "London",
    county: event?.county ?? "",
    city: event?.city ?? "",
    venueName: event?.venueName ?? "",
    address: event?.address ?? "",
    description: event?.description ?? "",
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 10) : "",
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 10) : "",
    startTime: event?.startTime ?? "",
    endTime: event?.endTime ?? "",
    allDay: event?.allDay ?? true,
    recurringAnnual: event?.recurringAnnual ?? false,
    oneOff: event?.oneOff ?? false,
    free: event?.free ?? null,
    indoorOutdoor: event?.indoorOutdoor ?? "",
    featured: event?.featured ?? false,
    organizerName: event?.organizerName ?? "",
    nearestStation: event?.nearestStation ?? "",
    travelNotes: event?.travelNotes ?? "",
    routeDescription: event?.routeDescription ?? "",
    tags: event?.tags?.join(", ") ?? "",
  });

  const [photo, setPhoto] = useState({
    photoPotentialScore: event?.photoMeta?.photoPotentialScore?.toString() ?? "",
    bestViewingPosition: event?.photoMeta?.bestViewingPosition ?? "",
    lensSuggestion: event?.photoMeta?.lensSuggestion ?? "",
    bestArrivalTime: event?.photoMeta?.bestArrivalTime ?? "",
    daytimeNightValue: event?.photoMeta?.daytimeNightValue ?? "",
    costumeCeremonial: event?.photoMeta?.costumeCeremonial ?? false,
    fireSmokeLight: event?.photoMeta?.fireSmokeLight ?? false,
    bannersFlagsCandles: event?.photoMeta?.bannersFlagsCandles ?? false,
    processionElements: event?.photoMeta?.processionElements ?? false,
    ritualSignificance: event?.photoMeta?.ritualSignificance ?? false,
    protestVisibility: event?.photoMeta?.protestVisibility ?? false,
    routeMoving: event?.photoMeta?.routeMoving ?? false,
    safetyNotes: event?.photoMeta?.safetyNotes ?? "",
    previousYearNotes: event?.photoMeta?.previousYearNotes ?? "",
  });

  function setF(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setP(field: string, value: unknown) {
    setPhoto((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      free: form.free === null ? null : Boolean(form.free),
      indoorOutdoor: form.indoorOutdoor || null,
      endDate: form.endDate || null,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      county: form.county || null,
      city: form.city || null,
      venueName: form.venueName || null,
      address: form.address || null,
      description: form.description || null,
      organizerName: form.organizerName || null,
      nearestStation: form.nearestStation || null,
      travelNotes: form.travelNotes || null,
      routeDescription: form.routeDescription || null,
      photoMeta: {
        ...photo,
        photoPotentialScore: photo.photoPotentialScore ? parseInt(photo.photoPotentialScore) : null,
        daytimeNightValue: photo.daytimeNightValue || null,
        bestViewingPosition: photo.bestViewingPosition || null,
        lensSuggestion: photo.lensSuggestion || null,
        bestArrivalTime: photo.bestArrivalTime || null,
        safetyNotes: photo.safetyNotes || null,
        previousYearNotes: photo.previousYearNotes || null,
      },
    };

    const url = isEdit ? `/api/events/${event.id}` : "/api/events";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const input = "w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white";
  const label = "block text-xs font-medium text-slate-600 mb-1";
  const section = "bg-white rounded-2xl border border-slate-200 p-6 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

      {/* Basic info */}
      <div className={section}>
        <h2 className="font-semibold text-slate-700">Basic info</h2>
        <div>
          <label className={label}>Title *</label>
          <input className={input} required value={form.title} onChange={(e) => setF("title", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Type *</label>
            <select className={input} value={form.type} onChange={(e) => setF("type", e.target.value)}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Status</label>
            <select className={input} value={form.status} onChange={(e) => setF("status", e.target.value)}>
              {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea className={input} rows={4} value={form.description} onChange={(e) => setF("description", e.target.value)} />
        </div>
        <div>
          <label className={label}>Tags (comma separated)</label>
          <input className={input} value={form.tags} onChange={(e) => setF("tags", e.target.value)} placeholder="costume, procession, folk" />
        </div>
        <div>
          <label className={label}>Organiser</label>
          <input className={input} value={form.organizerName} onChange={(e) => setF("organizerName", e.target.value)} />
        </div>
      </div>

      {/* Dates */}
      <div className={section}>
        <h2 className="font-semibold text-slate-700">Dates & times</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Start date *</label>
            <input type="date" className={input} required value={form.startDate} onChange={(e) => setF("startDate", e.target.value)} />
          </div>
          <div>
            <label className={label}>End date</label>
            <input type="date" className={input} value={form.endDate} onChange={(e) => setF("endDate", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Start time</label>
            <input type="time" className={input} value={form.startTime} onChange={(e) => setF("startTime", e.target.value)} />
          </div>
          <div>
            <label className={label}>End time</label>
            <input type="time" className={input} value={form.endTime} onChange={(e) => setF("endTime", e.target.value)} />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.allDay} onChange={(e) => setF("allDay", e.target.checked)} />
            All day
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.recurringAnnual} onChange={(e) => setF("recurringAnnual", e.target.checked)} />
            Recurring annual
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.oneOff} onChange={(e) => setF("oneOff", e.target.checked)} />
            One-off
          </label>
        </div>
      </div>

      {/* Location */}
      <div className={section}>
        <h2 className="font-semibold text-slate-700">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Region *</label>
            <select className={input} value={form.region} onChange={(e) => setF("region", e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>County</label>
            <input className={input} value={form.county} onChange={(e) => setF("county", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>City / town</label>
            <input className={input} value={form.city} onChange={(e) => setF("city", e.target.value)} />
          </div>
          <div>
            <label className={label}>Venue name</label>
            <input className={input} value={form.venueName} onChange={(e) => setF("venueName", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={label}>Address</label>
          <input className={input} value={form.address} onChange={(e) => setF("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Nearest station</label>
            <input className={input} value={form.nearestStation} onChange={(e) => setF("nearestStation", e.target.value)} />
          </div>
          <div>
            <label className={label}>Indoor / outdoor</label>
            <select className={input} value={form.indoorOutdoor} onChange={(e) => setF("indoorOutdoor", e.target.value)}>
              <option value="">Unknown</option>
              <option value="OUTDOOR">Outdoor</option>
              <option value="INDOOR">Indoor</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>
        <div>
          <label className={label}>Route description (for marches/processions)</label>
          <textarea className={input} rows={2} value={form.routeDescription} onChange={(e) => setF("routeDescription", e.target.value)} />
        </div>
        <div>
          <label className={label}>Travel notes</label>
          <textarea className={input} rows={2} value={form.travelNotes} onChange={(e) => setF("travelNotes", e.target.value)} />
        </div>
      </div>

      {/* Admin flags */}
      <div className={section}>
        <h2 className="font-semibold text-slate-700">Admin flags</h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.featured} onChange={(e) => setF("featured", e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.free === true} onChange={(e) => setF("free", e.target.checked ? true : null)} />
            Free entry
          </label>
        </div>
      </div>

      {/* Photo metadata */}
      <div className={section}>
        <h2 className="font-semibold text-slate-700">Photography notes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Photo potential score (1–5)</label>
            <select className={input} value={photo.photoPotentialScore} onChange={(e) => setP("photoPotentialScore", e.target.value)}>
              <option value="">—</option>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Daytime / night</label>
            <select className={input} value={photo.daytimeNightValue} onChange={(e) => setP("daytimeNightValue", e.target.value)}>
              <option value="">Unknown</option>
              <option value="daytime">Daytime</option>
              <option value="night">Night</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        <div>
          <label className={label}>Best arrival time</label>
          <input className={input} value={photo.bestArrivalTime} onChange={(e) => setP("bestArrivalTime", e.target.value)} placeholder="e.g. 30 mins before start" />
        </div>
        <div>
          <label className={label}>Best viewing position</label>
          <textarea className={input} rows={2} value={photo.bestViewingPosition} onChange={(e) => setP("bestViewingPosition", e.target.value)} />
        </div>
        <div>
          <label className={label}>Lens suggestion</label>
          <input className={input} value={photo.lensSuggestion} onChange={(e) => setP("lensSuggestion", e.target.value)} placeholder="e.g. 24–70mm, 85mm portrait" />
        </div>
        <div>
          <label className={label}>Visual elements</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              ["costumeCeremonial", "Costume / ceremonial"],
              ["fireSmokeLight", "Fire, smoke, light"],
              ["bannersFlagsCandles", "Banners, flags, candles"],
              ["processionElements", "Procession"],
              ["ritualSignificance", "Ritual significance"],
              ["protestVisibility", "Protest visibility"],
              ["routeMoving", "Moving (not static)"],
            ].map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={photo[key as keyof typeof photo] as boolean}
                  onChange={(e) => setP(key, e.target.checked)}
                />
                {lbl}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={label}>Safety notes</label>
          <textarea className={input} rows={2} value={photo.safetyNotes} onChange={(e) => setP("safetyNotes", e.target.value)} />
        </div>
        <div>
          <label className={label}>Previous year notes</label>
          <textarea className={input} rows={2} value={photo.previousYearNotes} onChange={(e) => setP("previousYearNotes", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>
        <a href="/admin" className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 self-center">Cancel</a>
      </div>
    </form>
  );
}
