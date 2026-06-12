import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const isAuthed =
    localStorage.getItem("admin_authed") === "true" ||
    sessionStorage.getItem("admin_authed") === "true";

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
