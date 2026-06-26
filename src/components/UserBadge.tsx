"use client";

import { useEffect, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionData {
  role: "super_admin" | "staf";
  email: string;
  name?: string;
}

export function UserBadge({
  variant = "sidebar",
  initialData
}: {
  variant?: "sidebar" | "header",
  initialData?: SessionData | null
}) {
  // Use initial data if provided (from SSR) to prevent "User" flicker
  const [userName, setUserName] = useState<string>(() => {
    if (initialData?.name) return initialData.name;
    if (initialData?.email === "sarahsafitri33@gmail.com") return "Sarah Safitri";
    if (initialData?.email === "panitia@bidan.com") return "Panitia";
    return "User";
  });

  const [userRole, setUserRole] = useState<string>(initialData?.role || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Client-side sync to stay up to date
    try {
      const authSession = getCookie("auth_session");
      if (authSession) {
        const session = JSON.parse(String(authSession)) as SessionData;
        setUserRole(session.role);

        if (session.name) {
          setUserName(session.name);
        } else if (session.email === "sarahsafitri33@gmail.com") {
          setUserName("Sarah Safitri");
        } else if (session.email === "panitia@bidan.com") {
          setUserName("Panitia");
        }
      }
    } catch (error) {
      console.error("Error reading user:", error);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      deleteCookie("auth_session");
      // Force reload to clear all states
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  const initial = userName.charAt(0).toUpperCase();
  const roleLabel = userRole === "super_admin" ? "Super Admin" : userRole === "staf" ? "Staf" : "";

  if (variant === "sidebar") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full border border-primary/10">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {initial}
          </div>
          <span className="text-sm font-bold text-primary">{userName}</span>
        </div>
        {roleLabel && (
          <span className="text-[10px] font-bold text-muted-foreground px-3 tracking-tight">{roleLabel}</span>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors font-bold text-sm disabled:opacity-50"
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span>Keluar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-primary/10 shadow-sm">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary leading-none">{userName}</span>
          {roleLabel && (
            <span className="text-[8px] font-bold text-muted-foreground mt-0.5">{roleLabel}</span>
          )}
        </div>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors disabled:opacity-50 shrink-0"
        title="Keluar"
        aria-label="Logout"
      >
        <LogOut size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
