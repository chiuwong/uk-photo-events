"use client";
import dynamic from "next/dynamic";
import type { CalEvent } from "./CalendarView";

// FullCalendar uses browser APIs — disable SSR
const CalendarView = dynamic(() => import("./CalendarView"), { ssr: false });

export default function CalendarWrapper({ events }: { events: CalEvent[] }) {
  return <CalendarView events={events} />;
}
