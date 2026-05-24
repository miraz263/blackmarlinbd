import { apiClient } from "./api/client";
import type { SEOPage } from "@/types";

export const seoKeys = {
  all:  ["seo"]                              as const,
  page: (key: string) => ["seo", key]       as const,
};

export const seoService = {
  getAll: () =>
    apiClient.get<SEOPage[]>("/seo/"),

  getByKey: (pageKey: string) =>
    apiClient.get<SEOPage>(`/seo/${encodeURIComponent(pageKey)}/`),

  upsert: (pageKey: string, data: FormData | Partial<SEOPage>) =>
    apiClient.patch<SEOPage>(`/seo/${encodeURIComponent(pageKey)}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  create: (data: FormData | Partial<SEOPage>) =>
    apiClient.post<SEOPage>("/seo/", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),
};
