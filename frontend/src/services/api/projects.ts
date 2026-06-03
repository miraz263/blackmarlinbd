import { apiClient } from "./client";
import type { Project, Category, PaginatedResponse } from "@/types";

export const projectsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<Project>>("/projects/", { params }),

  featured: () => apiClient.get<PaginatedResponse<Project>>("/projects/featured/"),

  get: (slug: string) => apiClient.get<Project>(`/projects/${slug}/`),

  create: (data: FormData) =>
    apiClient.post<Project>("/projects/", data, {
      // undefined removes the default application/json so axios sets multipart+boundary
      headers: { "Content-Type": undefined },
    }),

  update: (slug: string, data: FormData | Partial<Project>) =>
    apiClient.patch<Project>(`/projects/${slug}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": undefined } : {},
    }),

  delete: (slug: string) => apiClient.delete(`/projects/${slug}/`),

  categories: {
    list: () => apiClient.get<PaginatedResponse<Category>>("/projects/categories/"),
    create: (data: Partial<Category>) =>
      apiClient.post<Category>("/projects/categories/", data),
  },
};
