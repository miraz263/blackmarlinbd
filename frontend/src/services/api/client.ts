import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send httpOnly cookies
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach current language to every content-fetching request
apiClient.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("bmbd-language");
    if (stored) {
      const { state } = JSON.parse(stored) as { state: { language: string } };
      const lang = state?.language;
      if (lang && lang !== "en") {
        config.params = { lang, ...config.params };
      }
    }
  } catch {
    // never block a request
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(undefined);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/token/refresh/");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        const isAuthCheck = originalRequest.url?.includes("/auth/me");
        if (!isAuthCheck && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
