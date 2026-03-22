import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { photoMeta: true, sources: true },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { photoMeta, ...eventData } = body;

  if (eventData.startDate) eventData.startDate = new Date(eventData.startDate);
  if (eventData.endDate) eventData.endDate = new Date(eventData.endDate);
  if (eventData.endDate === "") eventData.endDate = null;

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...eventData,
      ...(photoMeta && {
        photoMeta: {
          upsert: {
            create: photoMeta,
            update: photoMeta,
          },
        },
      }),
    },
    include: { photoMeta: true },
  });

  return NextResponse.json(event);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
