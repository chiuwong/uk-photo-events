import { UKEvent } from "./types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsDate(year: number, month: number, day: number) {
  return `${year}${pad(month)}${pad(day)}`;
}

export function generateIcs(event: UKEvent, year: number): string {
  const month = event.month;
  const day = event.day ?? 1;
  const endMonth = event.endMonth ?? month;
  const endDay = (event.endDay ?? day) + 1; // ICS end date is exclusive

  const dtStart = toIcsDate(year, month, day);
  const dtEnd = toIcsDate(year, endMonth, endDay);
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UK Photo Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}-${year}@uk-photo-events`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:📷 ${event.name}`,
    `DESCRIPTION:${event.description}\\nPhoto tip: ${event.photoTip}\\nBest time: ${event.bestTime}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(event: UKEvent, year: number) {
  const content = generateIcs(event, year);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}-${year}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
