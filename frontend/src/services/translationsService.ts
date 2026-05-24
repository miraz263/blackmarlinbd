import { apiClient } from "./api/client";

export interface Language {
  code:        string;
  name:        string;
  native_name: string;
  direction:   "ltr" | "rtl";
  is_active:   boolean;
  is_default:  boolean;
  order:       number;
}

export interface TranslatableModel {
  key:        string;
  app_label:  string;
  model_name: string;
  label:      string;
  fields:     { name: string; long: boolean }[];
}

export interface TranslatableObject {
  id:                   number;
  title:                string;
  translated_languages: string[];
}

export interface UIStringRow {
  language: string;
  key:      string;
  value:    string;
}

export const translationsKeys = {
  languages:  ["translations", "languages"]  as const,
  ui:         (lang: string) => ["translations", "ui", lang] as const,
  models:     ["translations", "models"]     as const,
  objects:    (app: string, model: string) => ["translations", "objects", app, model] as const,
  content:    (app: string, model: string, id: number) => ["translations", "content", app, model, id] as const,
};

export const translationsService = {
  getLanguages: () => apiClient.get<Language[]>("/translations/languages/"),
  updateLanguage: (code: string, data: Partial<Language>) =>
    apiClient.put<Language>(`/translations/languages/${code}/`, data),

  getUIStrings: (lang: string) => apiClient.get<Record<string, string>>(`/translations/ui/${lang}/`),
  getUIStringsList: (lang: string) => apiClient.get<UIStringRow[]>("/translations/ui/", { params: { lang } }),
  saveUIString: (language: string, key: string, value: string) =>
    apiClient.post("/translations/ui/", { language, key, value }),
  bulkSaveUIStrings: (items: UIStringRow[]) => apiClient.put("/translations/ui/", items),
  deleteUIString: (language: string, key: string) =>
    apiClient.delete("/translations/ui/", { data: { language, key } }),

  getModels: () => apiClient.get<TranslatableModel[]>("/translations/content/models/"),
  getObjects: (app_label: string, model_name: string) =>
    apiClient.get<{ fields: string[]; objects: TranslatableObject[] }>(
      "/translations/content/objects/",
      { params: { app_label, model_name } }
    ),

  getContentTranslations: (app_label: string, model_name: string, object_id: number) =>
    apiClient.get<Record<string, Record<string, string>>>("/translations/content/", {
      params: { app_label, model_name, object_id },
    }),

  saveContentTranslations: (
    app_label: string,
    model_name: string,
    object_id: number,
    language: string,
    fields: Record<string, string>
  ) =>
    apiClient.post("/translations/content/", {
      app_label, model_name, object_id, language, fields,
    }),
};
