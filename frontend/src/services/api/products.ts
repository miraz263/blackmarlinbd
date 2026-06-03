import { apiClient } from "./client";
import type { ProductDB, ProductCategory, PaginatedResponse } from "@/types";

export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<ProductDB>>("/products/", { params }),

  get: (slug: string) => apiClient.get<ProductDB>(`/products/${slug}/`),

  create: (data: Partial<ProductDB> & { category_id?: number | null }) =>
    apiClient.post<ProductDB>("/products/", data),

  update: (slug: string, data: Partial<ProductDB> & { category_id?: number | null }) =>
    apiClient.patch<ProductDB>(`/products/${slug}/`, data),

  delete: (slug: string) => apiClient.delete(`/products/${slug}/`),

  categories: {
    list: () => apiClient.get<PaginatedResponse<ProductCategory>>("/products/categories/"),
    create: (data: Partial<ProductCategory>) =>
      apiClient.post<ProductCategory>("/products/categories/", data),
  },
};
