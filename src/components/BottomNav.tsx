"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Wallet, FileText } from "lucide-react";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { name: "Keuangan", href: "/keuangan", icon: Wallet },
  { name: "Laporan", href: "/laporan", icon: FileText },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-border px-4 pb-safe-area-inset-bottom">
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
