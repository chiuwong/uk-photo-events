import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">New event</h1>
      <EventForm />
    </div>
  );
}
