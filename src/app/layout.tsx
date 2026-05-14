import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import EventNotifier from "@/components/EventNotifier";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HUT IBI Kota Pekalongan",
  description: "Aplikasi Manajemen Kegiatan HUT IBI Ke-75 Kota Pekalongan",
  appleWebApp: {
    title: "HUT IBI",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} min-h-screen bg-background flex flex-col text-foreground antialiased`}>
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border/50">
          <div className="flex h-14 items-center px-4 max-w-md mx-auto justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
                IBI
              </div>
              <span className="font-semibold text-sm">HUT IBI Pekalongan</span>
            </div>
            <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-1 rounded-full border border-primary/10">
              <span className="text-sm font-semibold text-primary">Sarah</span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 max-w-md mx-auto w-full px-4 pt-4 flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="mt-8 mb-4 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">Sarah@2026. IBI Cab Kota Pekalongan</p>
          </footer>
        </main>

        <EventNotifier />
        <BottomNav />
      </body>
    </html>
  );
}
