// Historical average temperatures by month and rough latitude band
// Used when event is > 14 days away
const historicalAvgByMonth: Record<number, { temp: number; desc: string }> = {
  1:  { temp: 5,  desc: "Cold & often overcast" },
  2:  { temp: 6,  desc: "Cold, chance of frost" },
  3:  { temp: 8,  desc: "Cool, improving light" },
  4:  { temp: 11, desc: "Mild, spring showers" },
  5:  { temp: 14, desc: "Warm, good light" },
  6:  { temp: 17, desc: "Warm, long days" },
  7:  { temp: 19, desc: "Warmest month, varied" },
  8:  { temp: 19, desc: "Warm, some rain" },
  9:  { temp: 16, desc: "Mild, golden light" },
  10: { temp: 12, desc: "Cool, autumn colours" },
  11: { temp: 8,  desc: "Cool & grey" },
  12: { temp: 5,  desc: "Cold, short days" },
};

export function getHistoricalWeather(month: number) {
  return historicalAvgByMonth[month] ?? historicalAvgByMonth[1];
}

export async function getLiveWeather(lat: number, lng: number, dateStr: string) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,weathercode` +
      `&timezone=Europe/London` +
      `&start_date=${dateStr}&end_date=${dateStr}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const temp = data.daily?.temperature_2m_max?.[0];
    const code = data.daily?.weathercode?.[0];
    if (temp == null) return null;
    return { temp: Math.round(temp), description: wmoDescription(code), isLive: true };
  } catch {
    return null;
  }
}

function wmoDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rainy";
  if (code <= 79) return "Snowy";
  if (code <= 84) return "Showers";
  if (code <= 99) return "Thunderstorms";
  return "Variable";
}
