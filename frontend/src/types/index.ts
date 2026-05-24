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

// ─── Site Settings ─────────────────────────────────────────────────────────
export interface SiteSettings {
  id: number;
  company_name: string;
  company_short_name: string;
  logo: string | null;
  logo_url: string | null;
  favicon: string | null;
  favicon_url: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  google_map_embed: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  twitter: string;
  instagram: string;
}

export interface FooterSettings {
  id: number;
  copyright_text: string;
  footer_about: string;
  footer_logo: string | null;
  footer_logo_url: string | null;
  newsletter_enabled: boolean;
}

export interface ContactSettings {
  id: number;
  office_hours: string;
  support_email: string;
  sales_email: string;
}

// ─── Homepage ──────────────────────────────────────────────────────────────
export interface HeroButton {
  id: number;
  label: string;
  url: string;
  variant: "primary" | "outline";
  order: number;
  is_published: boolean;
}

export interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  badge_text: string;
  background_image_url: string | null;
  video_url: string;
  is_published: boolean;
  buttons: HeroButton[];
}

export interface StatisticCard {
  id: number;
  label: string;
  value: string;
  icon_name: string;
  order: number;
  is_published: boolean;
}

export interface PartnerLogo {
  id: number;
  name: string;
  logo_url: string | null;
  url: string;
  order: number;
  is_published: boolean;
}

export interface TechItem {
  id: number;
  name: string;
  logo: string;
  order: number;
  is_published: boolean;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  href: string;
  tags: string[];
  order: number;
  is_published: boolean;
}

export interface HomepageSection {
  id: number;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  badge_text: string;
  cta_text: string;
  cta_link: string;
  is_visible: boolean;
  order: number;
}

export interface HomepageData {
  hero: HeroSection;
  sections: Record<string, HomepageSection>;
  statistics: StatisticCard[];
  partners: PartnerLogo[];
  tech_items: TechItem[];
  services: ServiceItem[];
}

// ─── Services CMS ──────────────────────────────────────────────────────────
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  order: number;
  is_published: boolean;
  service_count: number;
}

export interface ServiceTechnology {
  id: number;
  name: string;
  logo: string;
  order: number;
}

export interface CaseStudy {
  id: number;
  title: string;
  client_name: string;
  challenge: string;
  solution: string;
  results: string;
  cover_image_url: string | null;
  is_published: boolean;
  order: number;
}

export interface ServiceListItem {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  short_description: string;
  icon_name: string;
  gradient: string;
  cover_image_url: string | null;
  category: ServiceCategory | null;
  technologies: ServiceTechnology[];
  featured: boolean;
  order: number;
  status: "draft" | "published";
  views_count: number;
}

export interface ServiceDetail extends ServiceListItem {
  description: string;
  body: string;
  capabilities: string[];
  case_studies: CaseStudy[];
}

export interface ServiceParams {
  search?: string;
  category?: string;
  featured?: boolean;
  status?: string;
  ordering?: string;
}

// ─── About CMS ─────────────────────────────────────────────────────────────
export interface AboutPage {
  id: number;
  badge_text: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  founded_year: number;
  tagline: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
}

export interface Vision {
  id: number;
  title: string;
  description: string;
}

export interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  order: number;
  is_published: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  designation: string;
  photo_url: string | null;
  bio: string;
  linkedin: string;
  github: string;
  email: string;
  display_order: number;
  is_published: boolean;
}

export interface AboutData {
  page: AboutPage;
  mission: Mission;
  vision: Vision;
  values: CoreValue[];
  team: TeamMember[];
}

export interface ReorderItem {
  id: number;
  order: number;
}

// ─── Page Builder ──────────────────────────────────────────────────────────
export type BuilderBlockType =
  | "hero" | "text" | "image" | "video"
  | "faq" | "gallery" | "stats" | "team" | "services";

export interface BuilderBlock {
  id: number;
  block_type: BuilderBlockType;
  order: number;
  content_json: Record<string, unknown>;
  style_json: Record<string, unknown>;
  is_published: boolean;
}

export interface BuilderSection {
  id: number;
  label: string;
  order: number;
  style_json: Record<string, unknown>;
  is_published: boolean;
  blocks: BuilderBlock[];
}

export interface BuilderPage {
  id: number;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  meta: Record<string, unknown>;
  sections: BuilderSection[];
  created_at: string;
  updated_at: string;
}

export interface BuilderPageListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  section_count: number;
  created_at: string;
  updated_at: string;
}

// ─── RBAC ──────────────────────────────────────────────────────────────────
export type RBACModule =
  | "users" | "jobs" | "blog" | "projects" | "services"
  | "homepage" | "about" | "seo" | "media" | "contacts" | "site_settings";

export type RBACAction = "view" | "create" | "edit" | "delete" | "publish";

export interface RBACPermission {
  id: number;
  module: RBACModule;
  action: RBACAction;
  codename: string;
  name: string;
}

export interface RBACRole {
  id: number;
  name: string;
  slug: string;
  description: string;
  permissions: RBACPermission[];
  is_system: boolean;
  user_count: number;
}

export interface UserRoleInfo {
  role_id: number;
  role_slug: string;
  role_name: string;
  permissions: string[];
}

export interface MyPermissions {
  role_slug: string;
  role_name: string;
  permissions: string[];
  is_superadmin: boolean;
}

export interface UserAdmin {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "editor" | "viewer";
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  avatar_url: string | null;
  userrole: UserRoleInfo | null;
}

// ─── SEO ───────────────────────────────────────────────────────────────────
export interface SEOPage {
  id: number;
  page_key: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image_url: string | null;
  resolved_og_title: string;
  resolved_og_desc: string;
  og_type: string;
  twitter_card: "summary" | "summary_large_image";
  schema_json: object | null;
  no_index: boolean;
}

export interface SEOOverrides {
  title?: string;
  description?: string;
  ogType?: string;
  ogImage?: string | null;
  canonical?: string;
  schemaJson?: object | null;
  noIndex?: boolean;
}

// ─── Media Library ─────────────────────────────────────────────────────────
export type MediaAssetType = "image" | "video" | "pdf" | "doc" | "other";

export interface MediaAsset {
  id: number;
  title: string;
  url: string | null;
  thumbnail_url: string | null;
  asset_type: MediaAssetType;
  mime_type: string;
  size: number;
  alt_text: string;
  folder: string;
  original_filename: string;
  uploaded_by: { id: number; username: string } | null;
  created_at: string;
}

export interface MediaUploadParams {
  folder?: string;
}

export interface MediaListParams {
  type?: MediaAssetType;
  folder?: string;
  search?: string;
  page?: number;
}

// ─── Workflow ──────────────────────────────────────────────────────────────
export type WorkflowStatus = "draft" | "review" | "approved" | "published" | "archived";

export interface WorkflowStep {
  id: number;
  name: string;
  order: number;
  required_role: number | null;
  required_role_name: string | null;
  instructions: string;
}

export interface ApprovalWorkflow {
  id: number;
  name: string;
  app_label: string;
  model_name: string;
  description: string;
  is_active: boolean;
  auto_publish: boolean;
  steps: WorkflowStep[];
}

export interface ContentReview {
  id: number;
  object_id: number;
  status: WorkflowStatus;
  content_title: string;
  workflow_name: string;
  current_step_name: string | null;
  submitted_by_name: string | null;
  submitted_at: string | null;
  content_type_label: string;
  valid_transitions: WorkflowStatus[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowTransition {
  id: number;
  from_status: WorkflowStatus;
  to_status: WorkflowStatus;
  actor_name: string;
  comment: string;
  created_at: string;
}

export interface WorkflowNotification {
  id: number;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface WorkflowStats {
  draft?: number;
  review?: number;
  approved?: number;
  published?: number;
  archived?: number;
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
