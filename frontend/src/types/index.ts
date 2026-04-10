// ─── User ──────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string;
  role: "admin" | "editor" | "viewer";
  is_newsletter_subscribed: boolean;
  date_joined: string;
  last_login: string;
}

// ─── Category ──────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  project_count: number;
}

// ─── Project ───────────────────────────────────────────────────────────────
export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: Category | null;
  tags: string[];
  tech_stack: string[];
  thumbnail: string | null;
  demo_url: string;
  github_url: string;
  case_study_url: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  order: number;
  client_name: string;
  completion_date: string | null;
  views_count: number;
  images: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: number;
  image: string;
  alt_text: string;
  order: number;
}

// ─── Blog ──────────────────────────────────────────────────────────────────
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: User;
  category: BlogCategory | null;
  tags: string[];
  cover_image: string | null;
  status: "draft" | "published" | "scheduled";
  is_featured: boolean;
  read_time: number;
  views_count: number;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  comments: Comment[];
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  author: User;
  content: string;
  is_approved: boolean;
  parent: number | null;
  replies: Comment[];
  created_at: string;
}

// ─── Job ───────────────────────────────────────────────────────────────────
export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "full_time" | "part_time" | "contract" | "internship" | "remote";
  experience: "junior" | "mid" | "senior" | "lead";
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string;
  requirements: string;
  benefits: string;
  skills: string[];
  status: "open" | "closed" | "draft";
  is_featured: boolean;
  deadline: string | null;
  application_count: number;
  created_at: string;
}

// ─── API ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

// ─── Contact Form ──────────────────────────────────────────────────────────
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  subject: string;
  message: string;
  budget?: string;
}
