"use client";
import { useEffect, useState } from "react";
import { UKEvent } from "@/lib/types";
import { getHistoricalWeather } from "@/lib/weather";

function isWithin14Days(month: number, day: number): { within: boolean; dateStr: string } {
  const now = new Date();
  const year = now.getFullYear();
  let eventDate = new Date(year, month - 1, day || 1);
  if (eventDate < now) eventDate = new Date(year + 1, month - 1, day || 1);
  const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const d = eventDate;
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { within: diff <= 14 && diff >= 0, dateStr };
}

export default function WeatherBadge({ event }: { event: UKEvent }) {
  const [weather, setWeather] = useState<{ temp: number; description: string; isLive: boolean } | null>(null);

  useEffect(() => {
    const hist = getHistoricalWeather(event.month);
    setWeather({ temp: hist.temp, description: hist.desc, isLive: false });

    if (event.day) {
      const { within, dateStr } = isWithin14Days(event.month, event.day);
      if (within) {
        fetch(`/api/weather?lat=${event.lat}&lng=${event.lng}&date=${dateStr}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.temp != null) setWeather({ temp: d.temp, description: d.description, isLive: true });
          })
          .catch(() => {});
      }
    }
  }, [event]);

  if (!weather) return null;

  return (
    <div className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
      weather.isLive ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-500"
    }`}>
      <span>{weather.isLive ? "🌤️ Live forecast:" : "📊 Avg weather:"}</span>
      <span className="font-semibold">{weather.temp}°C</span>
      <span>{weather.description}</span>
    </div>
  );
}
