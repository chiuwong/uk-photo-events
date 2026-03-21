import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Photo Events",
  description: "Discover UK festivals, customs & nature events perfect for photography",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
