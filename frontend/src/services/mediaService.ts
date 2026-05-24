import { apiClient } from "./api/client";
import type { MediaAsset, MediaListParams, PaginatedResponse } from "@/types";

export const mediaKeys = {
  all:     ["media"]                                    as const,
  list:    (p?: MediaListParams) => ["media", "list", p ?? {}] as const,
  detail:  (id: number)          => ["media", id]       as const,
  folders: ["media", "folders"]                         as const,
};

export const mediaService = {
  getAll: (params?: MediaListParams) =>
    apiClient.get<PaginatedResponse<MediaAsset>>("/media/", { params }),

  getById: (id: number) =>
    apiClient.get<MediaAsset>(`/media/${id}/`),

  upload: (files: File[], folder = "") => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (folder) form.append("folder", folder);
    return apiClient.post<MediaAsset[]>("/media/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: { title?: string; alt_text?: string; folder?: string }) =>
    apiClient.patch<MediaAsset>(`/media/${id}/`, data),

  remove: (id: number) =>
    apiClient.delete(`/media/${id}/`),

  getFolders: () =>
    apiClient.get<string[]>("/media/folders/"),
};
