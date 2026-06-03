import { apiClient } from "./api/client";
import type { HomepageData, HeroSection, HeroButton, StatisticCard } from "@/types";

export const homepageKeys = {
  all:        ["homepage"]              as const,
  hero:       ["homepage", "hero"]      as const,
  statistics: ["homepage", "statistics"] as const,
  partners:   ["homepage", "partners"]  as const,
  sections:   ["homepage", "sections"]  as const,
  buttons:    ["homepage", "buttons"]   as const,
};

export const homepageService = {
  // ── Aggregate ────────────────────────────────────────────────────────────
  getAll: () => apiClient.get<HomepageData>("/home/"),

  // ── Hero singleton ────────────────────────────────────────────────────────
  getHero: () => apiClient.get<HeroSection>("/home/hero/"),
  updateHero: (data: Partial<HeroSection>) => apiClient.patch<HeroSection>("/home/hero/", data),

  // ── Hero buttons ──────────────────────────────────────────────────────────
  getButtons: () => apiClient.get<{ results: HeroButton[] }>("/home/hero/buttons/"),
  createButton: (data: Partial<HeroButton>) => apiClient.post<HeroButton>("/home/hero/buttons/", data),
  updateButton: (id: number, data: Partial<HeroButton>) => apiClient.patch<HeroButton>(`/home/hero/buttons/${id}/`, data),
  deleteButton: (id: number) => apiClient.delete(`/home/hero/buttons/${id}/`),

  // ── Statistics ────────────────────────────────────────────────────────────
  getStatistics: () => apiClient.get<{ results: StatisticCard[] }>("/home/statistics/"),
  createStatistic: (data: Omit<StatisticCard, "id">) => apiClient.post<StatisticCard>("/home/statistics/", data),
  updateStatistic: (id: number, data: Partial<StatisticCard>) => apiClient.patch<StatisticCard>(`/home/statistics/${id}/`, data),
  deleteStatistic: (id: number) => apiClient.delete(`/home/statistics/${id}/`),
};

export const homepageQueryOptions = {
  queryKey: homepageKeys.all,
  queryFn: () => homepageService.getAll().then((r) => r.data),
  staleTime: 5 * 60 * 1000,
};
