"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { googleCalUrl } from "@/lib/calendar";

export interface CalEvent {
  id: string;
  slug: string;
  title: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  status: string;
  type: string;
  region: string;
  city: string | null;
  venueName: string | null;
  postcode: string | null;
  description: string | null;
  routeDescription: string | null;
  featured: boolean;
  photoPotentialScore: number | null;
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:   "#16a34a",
  UNCONFIRMED: "#ca8a04",
  CANCELLED:   "#dc2626",
  CHANGED:     "#ea580c",
};

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(startIso: string, endIso: string | null, startTime: string | null, allDay: boolean): string {
  const s = new Date(startIso);
  const mo = MONTHS[s.getUTCMonth() + 1];
  const d  = s.getUTCDate();
  let str = !endIso ? `${d} ${mo}` : (() => {
    const e = new Date(endIso);
    return e.getUTCMonth() === s.getUTCMonth()
      ? `${d}–${e.getUTCDate()} ${mo}`
      : `${d} ${mo} – ${e.getUTCDate()} ${MONTHS[e.getUTCMonth() + 1]}`;
  })();
  if (!allDay && startTime) str += ` · ${startTime}`;
  return str;
}

export default function CalendarView({ events }: { events: CalEvent[] }) {
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startDate.slice(0, 10),
    end:   e.endDate ? (() => {
      // FullCalendar all-day end is exclusive — add 1 day
      const d = new Date(e.endDate);
      d.setUTCDate(d.getUTCDate() + 1);
      return d.toISOString().slice(0, 10);
    })() : undefined,
    allDay: true,
    backgroundColor: STATUS_COLOR[e.status] ?? "#6b7280",
    borderColor:     STATUS_COLOR[e.status] ?? "#6b7280",
    extendedProps:   { event: e },
  }));

  return (
    <>
      <div className="fc-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate="2026-01-01"
          events={fcEvents}
          height="auto"
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            setSelected(info.event.extendedProps.event as CalEvent);
          }}
          eventClassNames="cursor-pointer text-xs"
          headerToolbar={{
            left:   "prev,next today",
            center: "title",
            right:  "",
          }}
          dayMaxEvents={4}
          firstDay={1}
        />
      </div>

      {/* Event detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full md:max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {selected.type.charAt(0) + selected.type.slice(1).toLowerCase()} · {selected.region}
                </p>
                <h2 className="font-bold text-black text-base leading-snug">{selected.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDate(selected.startDate, selected.endDate, selected.startTime, selected.allDay)}
                  {(selected.venueName || selected.city) && (
                    <> &nbsp;·&nbsp; {[selected.venueName, selected.city].filter(Boolean).join(", ")}</>
                  )}
                  {selected.postcode && (
                    <> &nbsp;·&nbsp;{" "}
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(selected.postcode)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >{selected.postcode}</a>
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 text-gray-400 hover:text-black text-xl leading-none pt-0.5"
                aria-label="Close"
              >×</button>
            </div>

            {/* Status badge */}
            {selected.status !== "SCHEDULED" && (
              <div className="px-5 pt-3">
                <span className="text-xs font-medium bg-yellow-300 text-black px-2 py-1">
                  {selected.status === "CANCELLED" ? "Cancelled" :
                   selected.status === "CHANGED"   ? "Details changed" :
                   "Unconfirmed — check before travelling"}
                </span>
              </div>
            )}

            {/* Body */}
            <div className="p-5 space-y-3">
              {selected.photoPotentialScore && (
                <p className="text-xs text-gray-500">
                  Photo potential: <span className="font-bold text-black">{selected.photoPotentialScore}/5</span>
                </p>
              )}
              {selected.description && (
                <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
              )}
              {selected.routeDescription && (
                <p className="text-sm text-gray-500 border-l-2 border-gray-300 pl-3">{selected.routeDescription}</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3 flex-wrap border-t border-gray-100 pt-4">
              <a
                href={googleCalUrl({
                  title:       selected.title,
                  startDate:   selected.startDate,
                  endDate:     selected.endDate,
                  startTime:   selected.startTime,
                  endTime:     selected.endTime,
                  allDay:      selected.allDay,
                  description: selected.description,
                  venueName:   selected.venueName,
                  city:        selected.city,
                  postcode:    selected.postcode,
                })}
                target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium text-white bg-black px-4 py-2 hover:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                Add to Google Calendar ↗
              </a>
              <a
                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(selected.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm text-black underline underline-offset-2 hover:text-yellow-600 self-center"
                onClick={(e) => e.stopPropagation()}
              >
                Image search ↗
              </a>
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-gray-400 hover:text-black ml-auto self-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
