import { apiClient } from "./client";
import type { Job, PaginatedResponse } from "@/types";

export const jobsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<Job>>("/jobs/", { params }),

  get: (id: number) => apiClient.get<Job>(`/jobs/${id}/`),

  create: (data: Partial<Job>) => apiClient.post<Job>("/jobs/", data),

  update: (id: number, data: Partial<Job>) =>
    apiClient.patch<Job>(`/jobs/${id}/`, data),

  delete: (id: number) => apiClient.delete(`/jobs/${id}/`),

  apply: (jobId: number, data: FormData) =>
    apiClient.post(`/jobs/${jobId}/apply/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
