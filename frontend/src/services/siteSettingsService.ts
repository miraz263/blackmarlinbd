import { apiClient } from "./api/client";
import type { SiteSettings, FooterSettings, ContactSettings } from "@/types";

export const siteSettingsKeys = {
  site:    ["site-settings", "site"]    as const,
  footer:  ["site-settings", "footer"]  as const,
  contact: ["site-settings", "contact"] as const,
};

export const siteSettingsService = {
  getSiteSettings:    () => apiClient.get<SiteSettings>("/site/settings/"),
  updateSiteSettings: (data: FormData | Partial<SiteSettings>) =>
    apiClient.patch<SiteSettings>("/site/settings/", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  getFooterSettings:    () => apiClient.get<FooterSettings>("/site/footer/"),
  updateFooterSettings: (data: FormData | Partial<FooterSettings>) =>
    apiClient.patch<FooterSettings>("/site/footer/", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  getContactSettings:    () => apiClient.get<ContactSettings>("/site/contact/"),
  updateContactSettings: (data: Partial<ContactSettings>) =>
    apiClient.patch<ContactSettings>("/site/contact/", data),
};
