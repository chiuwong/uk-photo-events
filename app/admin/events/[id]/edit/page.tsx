import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EventForm from "../../EventForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { photoMeta: true },
  });

  if (!event) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Edit: {event.title}</h1>
      <EventForm event={event} />
    </div>
  );
}
