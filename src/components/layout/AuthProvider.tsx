"use client";
import { useEffect } from "react";
import { listenAuthState } from "@/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

function setAuthCookie(role: string | null) {
  if (role) {
    document.cookie = `auth_role=${role}; path=/; SameSite=Strict; max-age=86400`;
    return;
  }
  document.cookie = "auth_role=; path=/; SameSite=Strict; max-age=0";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsub = listenAuthState((user) => {
      if (user) {
        login(user);
        setAuthCookie(user.role);
      } else {
        logout();
        setAuthCookie(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [login, logout, setLoading]);

  return <>{children}</>;
}
