// Permission utility functions for role-based access control

export interface SessionData {
  role: "super_admin" | "staf";
  email: string;
  name?: string;
}

/**
 * Get current user session from cookie
 */
export function getSessionFromCookie(cookieValue: string): SessionData | null {
  try {
    if (cookieValue.startsWith("{")) {
      return JSON.parse(cookieValue);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if user can edit transactions in keuangan page
 * Only super_admin can edit transactions, staf cannot
 */
export function canEditTransactions(role: "super_admin" | "staf" | null): boolean {
  return role === "super_admin";
}

/**
 * Check if user can add transactions in keuangan page
 * Only super_admin can add transactions, staf cannot
 */
export function canAddTransactions(role: "super_admin" | "staf" | null): boolean {
  return role === "super_admin";
}

/**
 * Check if user can download reports
 * Both super_admin and staf can download reports
 */
export function canDownloadReports(role: "super_admin" | "staf" | null): boolean {
  return role === "super_admin" || role === "staf";
}

/**
 * Check if user can access page
 * Both super_admin and staf can access all pages
 */
export function canAccessPage(role: "super_admin" | "staf" | null): boolean {
  return role === "super_admin" || role === "staf";
}

/**
 * Get role from cookie string (for client-side use)
 */
export function getRoleFromCookie(cookieValue: string): "super_admin" | "staf" | null {
  const session = getSessionFromCookie(cookieValue);
  return session?.role ?? null;
}
