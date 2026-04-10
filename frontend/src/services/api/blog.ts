import { apiClient } from "./client";
import type { BlogPost, BlogCategory, PaginatedResponse } from "@/types";

export const blogApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<BlogPost>>("/blog/", { params }),

  featured: () => apiClient.get<BlogPost[]>("/blog/featured/"),

  get: (slug: string) => apiClient.get<BlogPost>(`/blog/${slug}/`),

  create: (data: FormData) =>
    apiClient.post<BlogPost>("/blog/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (slug: string, data: Partial<BlogPost>) =>
    apiClient.patch<BlogPost>(`/blog/${slug}/`, data),

  delete: (slug: string) => apiClient.delete(`/blog/${slug}/`),

  comment: (slug: string, content: string, parent?: number) =>
    apiClient.post(`/blog/${slug}/comments/`, { content, parent }),

  categories: {
    list: () => apiClient.get<BlogCategory[]>("/blog/categories/"),
  },
};
