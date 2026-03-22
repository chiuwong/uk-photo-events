import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-slate-800 text-sm">Admin</Link>
          <Link href="/admin/events/new" className="text-sm text-indigo-600 hover:text-indigo-800">+ New event</Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">View site →</Link>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="text-sm text-slate-400 hover:text-slate-600">Sign out</button>
        </form>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
