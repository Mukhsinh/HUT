"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { getRoleFromCookie } from "@/lib/permissions";

export function useUserPermissions() {
  const [role, setRole] = useState<"super_admin" | "staf" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const authSession = getCookie("auth_session");
      if (authSession) {
        const userRole = getRoleFromCookie(String(authSession));
        setRole(userRole);
      }
    } catch (error) {
      console.error("Error reading user role:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    role,
    isLoading,
    isSuperAdmin: role === "super_admin",
    isStaf: role === "staf",
  };
}
