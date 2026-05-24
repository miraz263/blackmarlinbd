import { apiClient } from "./api/client";
import type { SiteSettings, FooterSettings, ContactSettings } from "@/types";

export const siteService = {
  /** GET /api/v1/site/settings/ */
  getSettings: () => apiClient.get<SiteSettings>("/site/settings/"),

  /** GET /api/v1/site/footer/ */
  getFooter: () => apiClient.get<FooterSettings>("/site/footer/"),

  /** GET /api/v1/site/contact/ */
  getContact: () => apiClient.get<ContactSettings>("/site/contact/"),

  /** PATCH /api/v1/site/settings/ — admin only, multipart for logo/favicon */
  updateSettings: (data: FormData | Partial<SiteSettings>) =>
    apiClient.patch<SiteSettings>("/site/settings/", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    }),

  /** PATCH /api/v1/site/footer/ — admin only */
  updateFooter: (data: FormData | Partial<FooterSettings>) =>
    apiClient.patch<FooterSettings>("/site/footer/", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    }),

  /** PATCH /api/v1/site/contact/ — admin only */
  updateContact: (data: Partial<ContactSettings>) =>
    apiClient.patch<ContactSettings>("/site/contact/", data),
};

// ─── React Query key factories ─────────────────────────────────────────────
export const siteKeys = {
  settings: ["site", "settings"] as const,
  footer: ["site", "footer"] as const,
  contact: ["site", "contact"] as const,
};
