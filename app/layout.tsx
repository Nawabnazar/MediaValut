import type { Metadata } from "next";
import { MediaProvider } from "@/contexts/MediaContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediaVault — Premium Media Gallery",
  description:
    "Apple-inspired media management with glassmorphism, animations, and SQLite storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-white">
        <ThemeProvider>
          <MediaProvider>{children}</MediaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
