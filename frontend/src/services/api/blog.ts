import { apiClient } from "./client";
import type { BlogPost, BlogCategory, PaginatedResponse } from "@/types";

export const blogApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<BlogPost>>("/blog/", { params }),

  featured: () => apiClient.get<PaginatedResponse<BlogPost>>("/blog/featured/"),

  get: (slug: string) => apiClient.get<BlogPost>(`/blog/${slug}/`),

  create: (data: FormData) =>
    apiClient.post<BlogPost>("/blog/", data, {
      headers: { "Content-Type": undefined },
    }),

  update: (slug: string, data: FormData) =>
    apiClient.patch<BlogPost>(`/blog/${slug}/`, data, {
      headers: { "Content-Type": undefined },
    }),

  delete: (slug: string) => apiClient.delete(`/blog/${slug}/`),

  comment: (slug: string, content: string, parent?: number) =>
    apiClient.post(`/blog/${slug}/comments/`, { content, parent }),

  categories: {
    list: () => apiClient.get<PaginatedResponse<BlogCategory>>("/blog/categories/"),
    create: (data: { name: string; description?: string }) =>
      apiClient.post<BlogCategory>("/blog/categories/", data),
  },
};
