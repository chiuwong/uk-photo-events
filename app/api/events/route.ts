import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventType, EventStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const region   = searchParams.get("region") ?? undefined;
  const county   = searchParams.get("county") ?? undefined;
  const city     = searchParams.get("city") ?? undefined;
  const type     = searchParams.get("type") as EventType | null;
  const status   = searchParams.get("status") as EventStatus | null;
  const month    = searchParams.get("month");   // "1"–"12"
  const q        = searchParams.get("q");        // keyword search
  const featured = searchParams.get("featured"); // "true"
  const minScore = searchParams.get("minScore"); // "1"–"5"
  const free     = searchParams.get("free");     // "true" | "false"
  const archived = searchParams.get("archived"); // "true" — defaults false
  const limit    = parseInt(searchParams.get("limit") ?? "50");
  const offset   = parseInt(searchParams.get("offset") ?? "0");

  const where: Prisma.EventWhereInput = {
    archived: archived === "true" ? true : false,
    ...(region   && { region: { equals: region, mode: "insensitive" } }),
    ...(county   && { county: { contains: county, mode: "insensitive" } }),
    ...(city     && { city:   { contains: city,   mode: "insensitive" } }),
    ...(type     && { type }),
    ...(status   && { status }),
    ...(featured === "true" && { featured: true }),
    ...(free === "true"  && { free: true }),
    ...(free === "false" && { free: false }),
    ...(month && {
      startDate: {
        gte: new Date(`2026-${month.padStart(2, "0")}-01`),
        lt:  new Date(`2026-${String(parseInt(month) + 1).padStart(2, "0")}-01`),
      },
    }),
    ...(q && {
      OR: [
        { title:       { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { city:        { contains: q, mode: "insensitive" } },
        { venueName:   { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    }),
    ...(minScore && {
      photoMeta: { photoPotentialScore: { gte: parseInt(minScore) } },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { photoMeta: true },
      orderBy: [{ featured: "desc" }, { startDate: "asc" }],
      take: limit,
      skip: offset,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { photoMeta, ...eventData } = body;

  // Generate slug from title + date
  const base = (eventData.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const datePart = (eventData.startDate as string).replace(/-/g, "").slice(0, 8);
  let slug = `${base}-${datePart}`;

  // Ensure unique slug
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      slug,
      startDate: new Date(eventData.startDate),
      endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
      tags: eventData.tags ?? [],
      ...(photoMeta && {
        photoMeta: { create: photoMeta },
      }),
    },
    include: { photoMeta: true },
  });

  return NextResponse.json(event, { status: 201 });
}
