import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetchMe();
    }
  }, []);

  return { user, isAuthenticated, isLoading, login, logout };
}
