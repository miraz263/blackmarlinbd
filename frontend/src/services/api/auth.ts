import { apiClient } from "./client";
import type { User } from "@/types";

export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
  }) => apiClient.post<User>("/auth/register/", data),

  login: (email: string, password: string) =>
    apiClient.post<User>("/auth/login/", { email, password }),

  logout: () => apiClient.post("/auth/logout/"),

  getMe: () => apiClient.get<User>("/auth/me/"),

  updateMe: (data: Partial<User>) =>
    apiClient.patch<User>("/auth/me/", data),

  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password2: string;
  }) => apiClient.post("/auth/change-password/", data),

  subscribeNewsletter: (email: string) =>
    apiClient.post("/auth/newsletter/subscribe/", { email }),
};
