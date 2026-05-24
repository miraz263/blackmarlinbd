import { apiClient } from "./api/client";

// ─── Request types ────────────────────────────────────────────────────────────

export interface BlogRequest {
  topic:     string;
  keywords?: string[];
  tone?:     "professional" | "conversational" | "technical" | "enthusiastic";
  length?:   "short" | "medium" | "long";
  provider?: "openai" | "gemini" | null;
}

export interface SEORequest {
  content:          string;
  target_keywords?: string[];
  page_url?:        string;
  provider?:        "openai" | "gemini" | null;
}

export interface FAQRequest {
  topic:     string;
  count?:    number;
  audience?: string;
  provider?: "openai" | "gemini" | null;
}

export interface LeadRequest {
  contact_id?:   number | null;
  contact_data?: Record<string, string>;
  provider?:     "openai" | "gemini" | null;
}

export interface ChatRequest {
  message:     string;
  session_id?: number | null;
  context?:    "general" | "sales" | "support" | "technical";
  provider?:   "openai" | "gemini" | null;
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface BlogResponse {
  title:            string;
  excerpt:          string;
  content:          string;
  meta_description: string;
  tags:             string[];
  reading_time:     number;
}

export interface SEOResponse {
  score:                    number;
  title_suggestion:         string;
  meta_description:         string;
  h1_suggestion:            string;
  keyword_density:          Record<string, number>;
  issues:                   string[];
  suggestions:              string[];
  strengths:                string[];
  readability:              string;
  estimated_rank_potential: string;
}

export interface FAQItem {
  question: string;
  answer:   string;
}

export interface FAQResponse {
  faqs: FAQItem[];
}

export interface LeadResponse {
  score:                number;
  intent:               "high" | "medium" | "low";
  priority:             "hot" | "warm" | "cold";
  tags:                 string[];
  summary:              string;
  recommended_action:   string;
  next_steps:           string[];
  estimated_deal_size:  string;
  concerns:             string[];
}

export interface ChatMessage {
  id:         number;
  role:       "user" | "assistant" | "system";
  content:    string;
  tokens:     number;
  created_at: string;
}

export interface ChatSession {
  id:         number;
  context:    string;
  title:      string;
  messages:   ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatSessionSummary {
  id:         number;
  context:    string;
  title:      string;
  updated_at: string;
}

export interface ChatResponse {
  session_id: number;
  message:    string;
  provider:   string;
  model:      string;
}

export interface UsageRow {
  feature:  string;
  count:    number;
  tokens:   number;
}

export interface UsageResponse {
  available_providers: string[];
  by_feature:          UsageRow[];
  total_tokens:        number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiService = {
  generateBlog:  (data: BlogRequest)  => apiClient.post<BlogResponse>("/ai/blog/", data),
  analyzeSEO:    (data: SEORequest)   => apiClient.post<SEOResponse>("/ai/seo/",   data),
  generateFAQ:   (data: FAQRequest)   => apiClient.post<FAQResponse>("/ai/faq/",   data),
  analyzeLead:   (data: LeadRequest)  => apiClient.post<LeadResponse>("/ai/leads/", data),

  getSessions:   ()                   => apiClient.get<ChatSessionSummary[]>("/ai/chat/"),
  getSession:    (id: number)         => apiClient.get<ChatSession>(`/ai/chat/?session_id=${id}`),
  sendMessage:   (data: ChatRequest)  => apiClient.post<ChatResponse>("/ai/chat/", data),
  deleteSession: (id: number)         => apiClient.delete(`/ai/chat/?session_id=${id}`),

  getHistory:    (type?: string)      => apiClient.get("/ai/history/", { params: type ? { type } : {} }),
  getUsage:      ()                   => apiClient.get<UsageResponse>("/ai/usage/"),
};
