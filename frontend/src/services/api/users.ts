import { apiClient } from "./client";
import type { User, PaginatedResponse } from "@/types";

export const usersApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<User>>("/auth/users/", { params }),

  get: (id: number) => apiClient.get<User>(`/auth/users/${id}/`),

  update: (id: number, data: { role?: User["role"]; is_active?: boolean }) =>
    apiClient.patch<User>(`/auth/users/${id}/`, data),

  delete: (id: number) => apiClient.delete(`/auth/users/${id}/`),
};
