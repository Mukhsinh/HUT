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

export function UserBadge({ variant = "sidebar" }: { variant?: "sidebar" | "header" }) {
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
      router.push("/login");
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
          <span className="text-sm font-semibold text-primary">{userName}</span>
        </div>
        {roleLabel && (
          <span className="text-[10px] font-medium text-muted-foreground px-3">{roleLabel}</span>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          style={{ color: "#dc2626" }}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Keluar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-primary/10">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-primary leading-none">{userName}</span>
          {roleLabel && (
            <span className="text-[8px] text-muted-foreground">{roleLabel}</span>
          )}
        </div>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        style={{ color: "#dc2626" }}
        className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
        title="Keluar"
        aria-label="Logout"
      >
        <LogOut size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
