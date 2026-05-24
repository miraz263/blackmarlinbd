import { apiClient } from "./api/client";
import type { HomepageData, HeroSection } from "@/types";

export const homepageKeys = {
  all: ["homepage"] as const,
  hero: ["homepage", "hero"] as const,
  statistics: ["homepage", "statistics"] as const,
  partners: ["homepage", "partners"] as const,
  sections: ["homepage", "sections"] as const,
};

export const homepageService = {
  getAll: () => apiClient.get<HomepageData>("/home/"),
  getHero: () => apiClient.get<HeroSection>("/home/hero/"),
  updateHero: (data: FormData | Partial<HeroSection>) =>
    apiClient.patch<HeroSection>("/home/hero/", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),
};

export const homepageQueryOptions = {
  queryKey: homepageKeys.all,
  queryFn: () => homepageService.getAll().then((r) => r.data),
  staleTime: 5 * 60 * 1000,
};
