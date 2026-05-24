import { apiClient } from "./api/client";

export type RangeOption = "7d" | "30d" | "90d";

export interface AnalyticsOverview {
  page_views:              number;
  page_views_change:       number;
  unique_visitors:         number;
  unique_visitors_change:  number;
  blog_views:              number;
  blog_views_change:       number;
  new_contacts:            number;
  new_contacts_change:     number;
  job_applications:        number;
  job_applications_change: number;
}

export interface ChartData {
  labels:   string[];
  views:    number[];
  visitors: number[];
}

export interface TopPage {
  path:   string;
  views:  number;
  unique: number;
}

export interface DeviceData {
  desktop: number;
  mobile:  number;
  tablet:  number;
}

export interface ReferrerRow {
  referrer: string;
  count:    number;
}

export const analyticsKeys = {
  overview:  (range: string) => ["analytics", "overview", range] as const,
  chart:     (range: string) => ["analytics", "chart",    range] as const,
  topPages:  (range: string) => ["analytics", "top-pages", range] as const,
  devices:   (range: string) => ["analytics", "devices",  range] as const,
  referrers: (range: string) => ["analytics", "referrers", range] as const,
};

export const analyticsService = {
  getOverview:  (range: RangeOption) =>
    apiClient.get<AnalyticsOverview>("/analytics/overview/", { params: { range } }),

  getChart:     (range: RangeOption) =>
    apiClient.get<ChartData>("/analytics/chart/", { params: { range } }),

  getTopPages:  (range: RangeOption) =>
    apiClient.get<TopPage[]>("/analytics/top-pages/", { params: { range } }),

  getDevices:   (range: RangeOption) =>
    apiClient.get<DeviceData>("/analytics/devices/", { params: { range } }),

  getReferrers: (range: RangeOption) =>
    apiClient.get<ReferrerRow[]>("/analytics/referrers/", { params: { range } }),

  getExportUrl: (range: RangeOption) =>
    `/api/v1/analytics/export/?range=${range}`,

  collect: (path: string, referrer: string) =>
    apiClient.post("/analytics/collect/", { path, referrer }).catch(() => null),
};
