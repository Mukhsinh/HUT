"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Camera, Wallet, FileText } from "lucide-react";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { name: "Galeri", href: "/galeri", icon: Camera },
  { name: "Keuangan", href: "/keuangan", icon: Wallet },
  { name: "Laporan", href: "/laporan", icon: FileText },
];

interface BottomNavProps {
  variant?: "bottom" | "sidebar";
}

export default function BottomNav({ variant = "bottom" }: BottomNavProps) {
  const pathname = usePathname();

  // Sidebar variant for desktop
  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col px-3 py-4 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Bottom nav variant for mobile
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-border px-4 pb-safe-area-inset-bottom md:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  isActive ? "bg-secondary text-primary" : ""
                }`}
              >
                <Icon size={24} />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
