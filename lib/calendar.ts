/** Shared calendar utilities: Google Calendar URL builder + ICS helpers */

export interface CalEventInput {
  title: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
  allDay: boolean;
  description?: string | null;
  venueName?: string | null;
  city?: string | null;
  postcode?: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const hhmm00 = (t: string) => t.replace(":", "") + "00"; // "14:30" → "143000"

/** Google Calendar "add event" URL */
export function googleCalUrl(event: CalEventInput): string {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate);

  let startStr: string, endStr: string;

  if (event.allDay) {
    startStr = ymd(start);
    // Google Calendar end date for all-day is exclusive — add 1 day
    const endEx = new Date(end);
    endEx.setUTCDate(endEx.getUTCDate() + 1);
    endStr = ymd(endEx);
  } else {
    const st = event.startTime ? hhmm00(event.startTime) : "120000";
    const et = event.endTime ? hhmm00(event.endTime) : st;
    startStr = `${ymd(start)}T${st}`;
    endStr   = `${ymd(end)}T${et}`;
  }

  const location = [event.venueName, event.city, event.postcode]
    .filter(Boolean)
    .join(", ");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("dates", `${startStr}/${endStr}`);
  if (event.description) url.searchParams.set("details", event.description.slice(0, 500));
  if (location) url.searchParams.set("location", location);

  return url.toString();
}

/** Escape special chars for ICS DESCRIPTION / SUMMARY / LOCATION */
export function escapeICS(s: string): string {
  return s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
}

/** Fold ICS lines to 75-char max per RFC 5545 */
export function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  chunks.push(line.slice(0, 75));
  for (let i = 75; i < line.length; i += 74) {
    chunks.push(" " + line.slice(i, i + 74));
  }
  return chunks.join("\r\n");
}
