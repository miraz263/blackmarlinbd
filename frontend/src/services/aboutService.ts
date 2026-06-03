import { apiClient } from "./api/client";
import type {
  AboutData,
  AboutPage,
  Mission,
  Vision,
  CoreValue,
  TeamMember,
  AboutStatistic,
  ReorderItem,
} from "@/types";

export const aboutKeys = {
  all: ["about"] as const,
  team: ["about", "team"] as const,
  values: ["about", "values"] as const,
  statistics: ["about", "statistics"] as const,
  mission: ["about", "mission"] as const,
  vision: ["about", "vision"] as const,
};

export const aboutService = {
  // ── Read ────────────────────────────────────────────────────────────────
  getAll: () => apiClient.get<AboutData>("/about/"),
  getTeam: () => apiClient.get<TeamMember[]>("/about/team/"),
  getValues: () => apiClient.get<CoreValue[]>("/about/values/"),
  getMission: () => apiClient.get<Mission>("/about/mission/"),
  getVision: () => apiClient.get<Vision>("/about/vision/"),

  // ── Update singletons (admin) ────────────────────────────────────────────
  updatePage: (data: Partial<AboutPage>) =>
    apiClient.patch<AboutPage>("/about/page/", data),
  updateMission: (data: Partial<Mission>) =>
    apiClient.patch<Mission>("/about/mission/", data),
  updateVision: (data: Partial<Vision>) =>
    apiClient.patch<Vision>("/about/vision/", data),

  // ── Team member CRUD (admin) ─────────────────────────────────────────────
  createTeamMember: (data: FormData) =>
    apiClient.post<TeamMember>("/about/team/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateTeamMember: (id: number, data: FormData | Partial<TeamMember>) =>
    apiClient.patch<TeamMember>(`/about/team/${id}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),
  deleteTeamMember: (id: number) => apiClient.delete(`/about/team/${id}/`),
  reorderTeam: (items: ReorderItem[]) =>
    apiClient.post("/about/team/reorder/", items),

  // ── Core value CRUD (admin) ──────────────────────────────────────────────
  createValue: (data: Partial<CoreValue>) =>
    apiClient.post<CoreValue>("/about/values/", data),
  updateValue: (id: number, data: Partial<CoreValue>) =>
    apiClient.patch<CoreValue>(`/about/values/${id}/`, data),
  deleteValue: (id: number) => apiClient.delete(`/about/values/${id}/`),
  reorderValues: (items: ReorderItem[]) =>
    apiClient.post("/about/values/reorder/", items),

  // ── Statistics CRUD (admin) ──────────────────────────────────────────────
  getStatistics: () => apiClient.get<{ results: AboutStatistic[] }>("/about/statistics/"),
  createStatistic: (data: Omit<AboutStatistic, "id">) =>
    apiClient.post<AboutStatistic>("/about/statistics/", data),
  updateStatistic: (id: number, data: Partial<AboutStatistic>) =>
    apiClient.patch<AboutStatistic>(`/about/statistics/${id}/`, data),
  deleteStatistic: (id: number) => apiClient.delete(`/about/statistics/${id}/`),
  reorderStatistics: (items: ReorderItem[]) =>
    apiClient.post("/about/statistics/reorder/", items),
};

export const aboutQueryOptions = {
  queryKey: aboutKeys.all,
  queryFn: () => aboutService.getAll().then((r) => r.data),
  staleTime: 5 * 60 * 1000,
};
