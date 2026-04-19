import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Paper Feed",
  description: "Swipe through the latest AI papers on diffusion, generation, and language models",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface">{children}</body>
    </html>
  );
}
