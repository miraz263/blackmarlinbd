import {
  Users, Database, Store, Package, MessageSquare, HardHat,
  UtensilsCrossed, Hotel, CalendarCheck, MenuSquare,
  BarChart2, Shield, Briefcase, Wallet, TrendingUp,
  ShoppingCart, ShoppingBag, Boxes,
  GraduationCap, BookOpen, ClipboardList, PenLine,
  Heart, Stethoscope, UserSearch, FileHeart,
  Newspaper, LayoutTemplate,
  CalendarDays, Ticket,
  Brain, MessageCircleMore, HelpCircle,
  Building2, FileStack, Contact,
  Zap, Globe,
  type LucideIcon,
} from "lucide-react";

export interface ProductItem {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;  // hex, used for icon bg
  isNew?: boolean;
  isFeatured?: boolean;
  badge?: string;
}

export interface ProductCategory {
  label: string;
  slug: string;
  icon: LucideIcon;
  products: ProductItem[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  // ─── Business Solution ────────────────────────────────────────────────────
  {
    label: "Business Solution",
    slug: "business-solution",
    icon: Building2,
    products: [
      {
        name: "HR Manager",
        slug: "hr-manager",
        tagline: "Human Resource Management",
        description: "Complete hire-to-retire HR platform with payroll, leave, attendance, and performance management.",
        icon: Users,
        iconColor: "#10b981",
        isFeatured: true,
      },
      {
        name: "ERP",
        slug: "erp",
        tagline: "Business ERP Solution / Company Management",
        description: "Integrated ERP covering accounting, inventory, procurement, and operations for mid-market companies.",
        icon: Database,
        iconColor: "#6366f1",
        isFeatured: true,
      },
      {
        name: "M-Store",
        slug: "m-store",
        tagline: "Multi-Store Inventory Management",
        description: "Centralised stock control across unlimited store locations with real-time transfer and reorder alerts.",
        icon: Store,
        iconColor: "#0ea5e9",
        isFeatured: true,
      },
      {
        name: "Wholesale",
        slug: "wholesale",
        tagline: "Inventory Management System",
        description: "B2B wholesale platform: bulk orders, distributor pricing tiers, credit limits, and delivery tracking.",
        icon: Package,
        iconColor: "#f59e0b",
      },
      {
        name: "Innue",
        slug: "innue",
        tagline: "Business Live Chatbot Software",
        description: "AI-powered live chat and chatbot platform that qualifies leads and routes them to the right agent.",
        icon: MessageSquare,
        iconColor: "#8b5cf6",
        isNew: true,
        badge: "AI",
      },
      {
        name: "Nirmako",
        slug: "nirmako",
        tagline: "Construction Cost Estimating Software",
        description: "BOQ generation, material takeoff, vendor comparison, and project budget tracking for contractors.",
        icon: HardHat,
        iconColor: "#ef4444",
      },
      {
        name: "CRM Pro",
        slug: "crm-pro",
        tagline: "Customer Relationship Management",
        description: "Sales pipeline, lead scoring, and email automation for growing B2B sales teams.",
        icon: Contact,
        iconColor: "#06b6d4",
      },
      {
        name: "DocuVault",
        slug: "docuvault",
        tagline: "Document Management System",
        description: "Version control, approval workflows, e-signature, and audit trails for enterprise document management.",
        icon: FileStack,
        iconColor: "#64748b",
      },
    ],
  },

  // ─── Hotel & Restaurant ───────────────────────────────────────────────────
  {
    label: "Hotel & Restaurant",
    slug: "hotel-restaurant",
    icon: Hotel,
    products: [
      {
        name: "HotelOS",
        slug: "hotelos",
        tagline: "Property Management System",
        description: "Full-featured hotel PMS: front desk, reservations, housekeeping, and channel manager integration.",
        icon: Hotel,
        iconColor: "#6366f1",
        isFeatured: true,
      },
      {
        name: "RestoPOS",
        slug: "restopos",
        tagline: "Restaurant POS & Kitchen Display",
        description: "Cloud POS with table management, KDS, split billing, and loyalty — works offline during internet outages.",
        icon: UtensilsCrossed,
        iconColor: "#ef4444",
        isFeatured: true,
      },
      {
        name: "TableBook",
        slug: "tablebook",
        tagline: "Online Table Reservation Platform",
        description: "Branded reservation widget, automated reminders, and no-show fee collection for restaurants.",
        icon: CalendarCheck,
        iconColor: "#f59e0b",
      },
      {
        name: "MenuMaster",
        slug: "menumaster",
        tagline: "Digital Menu & QR Ordering",
        description: "QR-code menus with real-time availability, allergy filters, and direct-to-kitchen ordering.",
        icon: MenuSquare,
        iconColor: "#10b981",
        isNew: true,
      },
    ],
  },

  // ─── FinTech ──────────────────────────────────────────────────────────────
  {
    label: "FinTech",
    slug: "fintech",
    icon: BarChart2,
    products: [
      {
        name: "TradeDesk OMS",
        slug: "tradedesk-oms",
        tagline: "Multi-Asset Order Management System",
        description: "FIX-native OMS handling equities, FI, FX, and derivatives with sub-10 µs order routing.",
        icon: TrendingUp,
        iconColor: "#8b5cf6",
        isFeatured: true,
        badge: "Enterprise",
      },
      {
        name: "RiskMatrix",
        slug: "riskmatrix",
        tagline: "Real-Time Risk Management System",
        description: "Pre- and post-trade risk engine: VaR, Greeks, stress testing, and FRTB capital reporting.",
        icon: Shield,
        iconColor: "#ef4444",
        isFeatured: true,
      },
      {
        name: "AlgoEngine",
        slug: "algoengine",
        tagline: "Algorithmic Trading Infrastructure",
        description: "C++ low-latency algo trading platform with Python strategy API, backtesting, and paper trading.",
        icon: Zap,
        iconColor: "#f59e0b",
        badge: "HFT",
      },
      {
        name: "PayGate",
        slug: "paygate",
        tagline: "Payment Gateway & Processing",
        description: "Multi-currency payment gateway supporting cards, bKash, Nagad, SWIFT, and bank transfers.",
        icon: Wallet,
        iconColor: "#10b981",
        isNew: true,
      },
      {
        name: "PortfolioIQ",
        slug: "portfolioiq",
        tagline: "Portfolio Management & Analytics",
        description: "Multi-asset portfolio analytics with Brinson attribution, GIPS reporting, and automated rebalancing.",
        icon: Briefcase,
        iconColor: "#6366f1",
      },
    ],
  },

  // ─── E-Commerce ───────────────────────────────────────────────────────────
  {
    label: "E-Commerce",
    slug: "ecommerce",
    icon: ShoppingCart,
    products: [
      {
        name: "MarketX",
        slug: "marketx",
        tagline: "Multi-Vendor Marketplace Platform",
        description: "Launch your own Amazon-style marketplace: vendor onboarding, commission management, and dispute resolution.",
        icon: ShoppingCart,
        iconColor: "#f59e0b",
        isFeatured: true,
      },
      {
        name: "ShopEngine",
        slug: "shopengine",
        tagline: "Headless E-Commerce Platform",
        description: "Composable headless commerce with Next.js storefront, AI recommendations, and 99+ payment methods.",
        icon: ShoppingBag,
        iconColor: "#8b5cf6",
        isFeatured: true,
        badge: "AI",
      },
      {
        name: "StockHub",
        slug: "stockhub",
        tagline: "Multi-Channel Inventory & Order Management",
        description: "Unified inventory across web, marketplace, and offline channels with automated reorder and WMS integration.",
        icon: Boxes,
        iconColor: "#0ea5e9",
      },
    ],
  },

  // ─── Education ────────────────────────────────────────────────────────────
  {
    label: "Education",
    slug: "education",
    icon: GraduationCap,
    products: [
      {
        name: "SchoolOS",
        slug: "schoolos",
        tagline: "K-12 School Management ERP",
        description: "Admissions, timetable, attendance, gradebook, fee collection, and parent portal in one platform.",
        icon: GraduationCap,
        iconColor: "#6366f1",
        isFeatured: true,
      },
      {
        name: "UniERP",
        slug: "unierp",
        tagline: "University Management System",
        description: "Student lifecycle, course registration, credit management, faculty portal, and accreditation reporting.",
        icon: BookOpen,
        iconColor: "#10b981",
        isFeatured: true,
      },
      {
        name: "LearnIQ LMS",
        slug: "learniq-lms",
        tagline: "AI-Powered Learning Management System",
        description: "Adaptive learning platform with AI tutor, live classes, SCORM content, and detailed learner analytics.",
        icon: ClipboardList,
        iconColor: "#8b5cf6",
        badge: "AI",
        isNew: true,
      },
      {
        name: "ExamPro",
        slug: "exampro",
        tagline: "Online Exam & Assessment Portal",
        description: "Proctored online exams with AI anti-cheating, auto-grading, and instant result publishing.",
        icon: PenLine,
        iconColor: "#ef4444",
        badge: "AI",
      },
    ],
  },

  // ─── Healthcare ───────────────────────────────────────────────────────────
  {
    label: "Healthcare",
    slug: "healthcare",
    icon: Heart,
    products: [
      {
        name: "Hospital ERP",
        slug: "hospital-erp",
        tagline: "End-to-End Hospital Management System",
        description: "Complete HMS: OPD/IPD, EMR, billing, pharmacy, lab, inventory, and FHIR R4 interoperability.",
        icon: Heart,
        iconColor: "#ef4444",
        isFeatured: true,
        badge: "FHIR R4",
      },
      {
        name: "TeleMed",
        slug: "telemed",
        tagline: "Telemedicine & Video Consultation",
        description: "HIPAA-compliant video consultations, e-prescriptions, and remote patient monitoring platform.",
        icon: Stethoscope,
        iconColor: "#10b981",
        isFeatured: true,
      },
      {
        name: "DoctorFinder",
        slug: "doctorfinder",
        tagline: "Doctor Directory & Appointment Platform",
        description: "Patient-facing doctor search, speciality filtering, insurance matching, and instant online booking.",
        icon: UserSearch,
        iconColor: "#6366f1",
      },
      {
        name: "HealthRecords",
        slug: "healthrecords",
        tagline: "Personal Health Record (PHR) Platform",
        description: "Patient-owned digital health records with AI symptom checker and care timeline visualization.",
        icon: FileHeart,
        iconColor: "#8b5cf6",
        badge: "AI",
        isNew: true,
      },
    ],
  },

  // ─── News Portal ──────────────────────────────────────────────────────────
  {
    label: "News Portal",
    slug: "news-portal",
    icon: Newspaper,
    products: [
      {
        name: "NewsCMS",
        slug: "newscms",
        tagline: "Modern News & Media Content Platform",
        description: "Multi-author news CMS with SEO tools, AMP support, subscription paywall, and ad management.",
        icon: Newspaper,
        iconColor: "#0ea5e9",
        isFeatured: true,
      },
      {
        name: "MultiPortal",
        slug: "multiportal",
        tagline: "Multi-Brand News Network",
        description: "Run unlimited news portals from one dashboard — each with its own domain, brand, and editorial team.",
        icon: Globe,
        iconColor: "#8b5cf6",
      },
    ],
  },

  // ─── Online Reservation ───────────────────────────────────────────────────
  {
    label: "Online Reservation",
    slug: "online-reservation",
    icon: CalendarDays,
    products: [
      {
        name: "BookNow",
        slug: "booknow",
        tagline: "Universal Online Booking Platform",
        description: "Customisable booking widget for any service business — salons, clinics, fitness studios, and more.",
        icon: CalendarDays,
        iconColor: "#10b981",
        isFeatured: true,
      },
      {
        name: "EventPro",
        slug: "eventpro",
        tagline: "Event Ticketing & Management",
        description: "End-to-end event platform: ticket sales, QR check-in, seat map, and post-event analytics.",
        icon: Ticket,
        iconColor: "#f59e0b",
      },
    ],
  },

  // ─── AI Suite ─────────────────────────────────────────────────────────────
  {
    label: "AI Suite",
    slug: "ai-suite",
    icon: Brain,
    products: [
      {
        name: "BlackMarlin AI Chat",
        slug: "ai-chatbot",
        tagline: "GPT-4 Customer Support Chatbot",
        description: "LLM-powered chatbot trained on your docs — resolves 70%+ of support tickets without human intervention.",
        icon: Brain,
        iconColor: "#6366f1",
        isFeatured: true,
        badge: "GPT-4",
        isNew: true,
      },
      {
        name: "KnowledgeAI",
        slug: "knowledge-ai",
        tagline: "RAG-Powered Enterprise Knowledge Base",
        description: "Semantic search across all company documents with source citations and access controls.",
        icon: MessageCircleMore,
        iconColor: "#8b5cf6",
        badge: "RAG",
        isNew: true,
      },
      {
        name: "SupportDesk AI",
        slug: "support-desk-ai",
        tagline: "Autonomous Tier-1 Support Resolution",
        description: "AI agent that classifies, resolves, and escalates support tickets — integrates with Zendesk, Freshdesk.",
        icon: HelpCircle,
        iconColor: "#0ea5e9",
        badge: "AI Agent",
        isNew: true,
      },
      {
        name: "DataLens",
        slug: "datalens",
        tagline: "AI-Powered Business Analytics",
        description: "Natural language querying of your business data — ask questions, get charts. No SQL required.",
        icon: BarChart2,
        iconColor: "#f59e0b",
        badge: "NLP",
        isNew: true,
      },
    ],
  },

  // ─── Templates ────────────────────────────────────────────────────────────
  {
    label: "Templates",
    slug: "templates",
    icon: LayoutTemplate,
    products: [
      {
        name: "CorpSite Pro",
        slug: "corpsite-pro",
        tagline: "Corporate Website Template",
        description: "Enterprise-grade Next.js website template with CMS, SEO, multi-language, and dark mode.",
        icon: LayoutTemplate,
        iconColor: "#6366f1",
      },
      {
        name: "StartupKit",
        slug: "startup-kit",
        tagline: "SaaS Startup Landing Page",
        description: "Conversion-optimised SaaS landing page template with pricing, testimonials, and waitlist.",
        icon: Zap,
        iconColor: "#f59e0b",
        isNew: true,
      },
    ],
  },
];

// Helper — find a category by slug
export function getCategoryBySlug(slug: string) {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug);
}

// Helper — find a product across all categories
export function getProductBySlug(productSlug: string) {
  for (const cat of PRODUCT_CATEGORIES) {
    const p = cat.products.find((p) => p.slug === productSlug);
    if (p) return { product: p, category: cat };
  }
  return null;
}

// All featured products for homepage showcase
export const FEATURED_PRODUCTS = PRODUCT_CATEGORIES.flatMap((cat) =>
  cat.products.filter((p) => p.isFeatured).map((p) => ({ ...p, categoryLabel: cat.label, categorySlug: cat.slug }))
);
