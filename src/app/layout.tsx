import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import EventNotifier from "@/components/EventNotifier";
import { UserBadge } from "@/components/UserBadge";

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
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {/* Desktop: sidebar layout | Mobile: top header + bottom nav */}
        <div className="flex min-h-screen">
          {/* Sidebar nav — visible only on desktop (md+) */}
          <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 md:left-0 md:z-40 bg-white border-r border-border/50">
            {/* Logo area */}
            <div className="flex items-center space-x-3 px-5 h-16 border-b border-border/50">
              <img 
                src="/logo IBI.png" 
                alt="Logo IBI" 
                className="w-9 h-9 object-contain shrink-0"
              />
              <span className="font-semibold text-sm leading-tight">HUT IBI Pekalongan</span>
            </div>
            {/* Nav links rendered by BottomNav in sidebar mode */}
            <BottomNav variant="sidebar" />

          </aside>

          {/* Main content area */}
          <div className="flex flex-col flex-1 md:ml-56">
            {/* Top header — visible on mobile only */}
            <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border/50 md:hidden">
              <div className="flex h-14 items-center px-4 max-w-md mx-auto justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/logo IBI.png" 
                    alt="Logo IBI" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-semibold text-sm">HUT IBI Pekalongan</span>
                </div>
                <UserBadge variant="header" />
              </div>
            </header>

            {/* Desktop top bar */}
            <header className="hidden md:flex sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border/50 h-16 items-center px-8 justify-between">
              <h2 className="font-semibold text-base text-foreground">Manajemen HUT IBI Ke-75</h2>
              <UserBadge variant="header" />
            </header>

            {/* Page content */}
            <main className="flex-1 pb-24 md:pb-8 px-4 pt-4 md:px-8 md:pt-6 flex flex-col max-w-5xl md:max-w-none w-full mx-auto md:mx-0">
              <div className="flex-1">{children}</div>
              <footer className="mt-8 mb-4 text-center">
                <p className="text-[10px] text-muted-foreground font-medium">Sarah@2026. IBI Cab Kota Pekalongan</p>
              </footer>
            </main>
          </div>
        </div>

        <EventNotifier />
        {/* Bottom nav — mobile only */}
        <BottomNav variant="bottom" />
      </body>
    </html>
  );
}
