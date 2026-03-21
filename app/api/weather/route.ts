import { getLiveWeather } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const date = searchParams.get("date") ?? "";

  if (isNaN(lat) || isNaN(lng) || !date) {
    return Response.json({ error: "Invalid params" }, { status: 400 });
  }

  const result = await getLiveWeather(lat, lng, date);
  if (!result) return Response.json({ error: "No forecast" }, { status: 500 });
  return Response.json(result);
}
