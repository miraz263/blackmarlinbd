import { apiClient } from "./api/client";
import type {
  ServiceListItem,
  ServiceDetail,
  ServiceCategory,
  ServiceTechnology,
  ServiceParams,
} from "@/types";

export const servicesKeys = {
  all:        ["services"]                            as const,
  list:       (p?: ServiceParams) => ["services", "list", p ?? {}] as const,
  detail:     (slug: string)      => ["services", "detail", slug]  as const,
  categories: ["services", "categories"]              as const,
  technologies: ["services", "technologies"]          as const,
};

export const servicesService = {
  // ── Public reads ───────────────────────────────────────────────────────
  getAll: (params?: ServiceParams) =>
    apiClient.get<ServiceListItem[]>("/services/", { params }),

  getBySlug: (slug: string) =>
    apiClient.get<ServiceDetail>(`/services/${slug}/`),

  getCategories: () =>
    apiClient.get<ServiceCategory[]>("/services/categories/"),

  getTechnologies: () =>
    apiClient.get<ServiceTechnology[]>("/services/technologies/"),

  // ── Admin writes ────────────────────────────────────────────────────────
  create: (data: FormData) =>
    apiClient.post<ServiceListItem>("/services/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (slug: string, data: FormData | object) =>
    apiClient.patch<ServiceListItem>(`/services/${slug}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  remove: (slug: string) => apiClient.delete(`/services/${slug}/`),

  // ── Category admin ──────────────────────────────────────────────────────
  createCategory: (data: Partial<ServiceCategory>) =>
    apiClient.post<ServiceCategory>("/services/categories/", data),

  updateCategory: (slug: string, data: Partial<ServiceCategory>) =>
    apiClient.patch<ServiceCategory>(`/services/categories/${slug}/`, data),
};
