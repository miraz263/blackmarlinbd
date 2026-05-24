import { apiClient } from "./api/client";
import type { BuilderPage, BuilderPageListItem, BuilderBlock, BuilderBlockType, BuilderSection } from "@/types";

export const pbKeys = {
  all:     ["pages"]                               as const,
  list:    ()          => ["pages", "list"]        as const,
  detail:  (s: string) => ["pages", "detail", s]  as const,
};

export const pageBuilderService = {
  // ── Pages ──────────────────────────────────────────────────────────────
  listPages: () =>
    apiClient.get<BuilderPageListItem[]>("/pages/"),

  getPage: (slug: string) =>
    apiClient.get<BuilderPage>(`/pages/${slug}/`),

  createPage: (data: { title: string; description?: string }) =>
    apiClient.post<BuilderPageListItem>("/pages/", data),

  updatePage: (slug: string, data: Partial<BuilderPageListItem> & { meta?: object }) =>
    apiClient.patch<BuilderPageListItem>(`/pages/${slug}/`, data),

  deletePage: (slug: string) =>
    apiClient.delete(`/pages/${slug}/`),

  // ── Sections ────────────────────────────────────────────────────────────
  createSection: (slug: string, data: { label?: string; style_json?: object }) =>
    apiClient.post<BuilderSection>(`/pages/${slug}/sections/`, data),

  updateSection: (slug: string, sectionId: number, data: Partial<BuilderSection>) =>
    apiClient.patch<BuilderSection>(`/pages/${slug}/sections/${sectionId}/`, data),

  deleteSection: (slug: string, sectionId: number) =>
    apiClient.delete(`/pages/${slug}/sections/${sectionId}/`),

  reorderSections: (slug: string, items: { id: number; order: number }[]) =>
    apiClient.post(`/pages/${slug}/sections/reorder/`, items),

  // ── Blocks ──────────────────────────────────────────────────────────────
  createBlock: (slug: string, sectionId: number, blockType: BuilderBlockType) =>
    apiClient.post<BuilderBlock>(`/pages/${slug}/sections/${sectionId}/blocks/`, {
      block_type: blockType,
    }),

  updateBlock: (slug: string, sectionId: number, blockId: number, data: Partial<BuilderBlock>) =>
    apiClient.patch<BuilderBlock>(
      `/pages/${slug}/sections/${sectionId}/blocks/${blockId}/`, data,
    ),

  deleteBlock: (slug: string, sectionId: number, blockId: number) =>
    apiClient.delete(`/pages/${slug}/sections/${sectionId}/blocks/${blockId}/`),

  reorderBlocks: (slug: string, sectionId: number, items: { id: number; order: number }[]) =>
    apiClient.post(`/pages/${slug}/sections/${sectionId}/blocks/reorder/`, items),
};
