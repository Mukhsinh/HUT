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

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 sticky top-0 h-screen bg-white border-r border-border/50 flex flex-col">
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-4">Menu Utama</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"} />
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="px-4 py-4 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground/60 text-center">HUT IBI Ke-75 · 2026</p>
      </div>
    </aside>
  );
}
