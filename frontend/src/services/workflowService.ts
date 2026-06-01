import { apiClient } from "./api/client";
import type {
  ApprovalWorkflow,
  ContentReview,
  PaginatedResponse,
  WorkflowNotification,
  WorkflowStats,
  WorkflowTransition,
} from "@/types";

export const workflowKeys = {
  queue:       ["workflow", "queue"]       as const,
  submissions: ["workflow", "submissions"] as const,
  all:         (params?: object) => ["workflow", "all", params] as const,
  review:      (id: number) => ["workflow", "review", id]       as const,
  history:     (id: number) => ["workflow", "history", id]      as const,
  notifications: ["workflow", "notifications"]                   as const,
  unread:      ["workflow", "unread"]      as const,
  stats:       ["workflow", "stats"]       as const,
  status:      (app: string, model: string, id: number) =>
    ["workflow", "status", app, model, id] as const,
  workflows:   ["workflow", "workflows"]   as const,
};

export const workflowService = {
  // Queue views
  getQueue:       () => apiClient.get<PaginatedResponse<ContentReview>>("/workflow/queue/"),
  getSubmissions: () => apiClient.get<PaginatedResponse<ContentReview>>("/workflow/submissions/"),
  getAll: (params?: { status?: string; app?: string }) =>
    apiClient.get<PaginatedResponse<ContentReview>>("/workflow/all/", { params }),

  // Review detail
  getReview:  (id: number) => apiClient.get<ContentReview>(`/workflow/reviews/${id}/`),
  getHistory: (id: number) => apiClient.get<PaginatedResponse<WorkflowTransition>>(`/workflow/reviews/${id}/history/`),

  // Per-object status lookup
  getContentStatus: (appLabel: string, modelName: string, objectId: number) =>
    apiClient.get<ContentReview | null>("/workflow/reviews/status/", {
      params: { app_label: appLabel, model_name: modelName, object_id: objectId },
    }),

  // Lifecycle transitions
  submit: (appLabel: string, modelName: string, objectId: number, comment = "") =>
    apiClient.post<ContentReview>("/workflow/submit/", {
      app_label: appLabel, model_name: modelName, object_id: objectId, comment,
    }),
  approve: (id: number, comment = "") =>
    apiClient.post<ContentReview>(`/workflow/reviews/${id}/approve/`, { comment }),
  reject:  (id: number, comment = "") =>
    apiClient.post<ContentReview>(`/workflow/reviews/${id}/reject/`, { comment }),
  publish: (id: number, comment = "") =>
    apiClient.post<ContentReview>(`/workflow/reviews/${id}/publish/`, { comment }),
  archive: (id: number, comment = "") =>
    apiClient.post<ContentReview>(`/workflow/reviews/${id}/archive/`, { comment }),
  restore: (id: number, comment = "") =>
    apiClient.post<ContentReview>(`/workflow/reviews/${id}/restore/`, { comment }),

  // Notifications
  getNotifications: () => apiClient.get<PaginatedResponse<WorkflowNotification>>("/workflow/notifications/"),
  getUnreadCount:   () => apiClient.get<{ count: number }>("/workflow/notifications/unread/"),
  markRead:         (id: number) => apiClient.post(`/workflow/notifications/${id}/read/`, {}),
  markAllRead:      () => apiClient.post("/workflow/notifications/read-all/", {}),

  // Stats & workflow config
  getStats:     () => apiClient.get<WorkflowStats>("/workflow/stats/"),
  getWorkflows: () => apiClient.get<ApprovalWorkflow[]>("/workflow/workflows/"),
  createWorkflow: (data: Partial<ApprovalWorkflow>) =>
    apiClient.post<ApprovalWorkflow>("/workflow/workflows/", data),
  updateWorkflow: (id: number, data: Partial<ApprovalWorkflow>) =>
    apiClient.put<ApprovalWorkflow>(`/workflow/workflows/${id}/`, data),
  updateWorkflowSteps: (id: number, steps: object[]) =>
    apiClient.put<ApprovalWorkflow>(`/workflow/workflows/${id}/steps/`, steps),
};
