import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Star, Zap,
  Shield, Globe, Users, Server, Database, BarChart2,
  MessageSquare, Phone, Play,
  type LucideIcon,
} from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { getProductBySlug } from "@/data/productCatalog";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Static extended details per product slug ─────────────────────────────────

interface ProductExtended {
  problemStatement: string;
  features: { icon: LucideIcon; title: string; description: string }[];
  capabilities: string[];
  architecture: string[];
  screenshots: { label: string; photoId: string }[];
  pricing: { name: string; price: string; period: string; highlight: boolean; features: string[]; cta: string }[];
}

const DETAILS: Record<string, ProductExtended> = {
  "hr-manager": {
    problemStatement: "HR teams buried in spreadsheets miss compliance deadlines, make payroll errors, and lack the workforce data leadership needs. BlackMarlin HR Manager replaces every HR spreadsheet with one integrated platform.",
    features: [
      { icon: Users, title: "Full Employee Lifecycle", description: "Recruitment, onboarding, employment, and exit — digital forms, e-signature, and automated task assignment at every stage." },
      { icon: Database, title: "Payroll Engine", description: "Multi-country payroll with tax, provident fund, and statutory deduction auto-calculations. Payslips emailed automatically." },
      { icon: Zap, title: "Leave & Attendance", description: "Leave requests, biometric clock-in, overtime calculation, and shift scheduling in one mobile-friendly interface." },
      { icon: BarChart2, title: "Performance Reviews", description: "360° feedback cycles, OKR tracking, and calibration tools for fair annual reviews across the organisation." },
      { icon: Shield, title: "Compliance Automation", description: "Built-in rules for BD, IN, UAE, UK, and US labour law. Automated statutory reports and filing reminders." },
      { icon: Globe, title: "Employee Self-Service", description: "Staff update own data, apply for leave, download payslips, and raise HR tickets — reducing admin queries by 80%." },
    ],
    capabilities: [
      "Applicant Tracking System (ATS) with job board integrations",
      "Digital onboarding with e-signature and task workflows",
      "Multi-country payroll with statutory compliance",
      "Biometric and mobile attendance tracking",
      "Performance management and OKR tracking",
      "Training and certification tracking",
      "Expense management and reimbursement",
      "HR analytics dashboard and workforce planning",
    ],
    architecture: [
      "Django REST backend — multi-tenant schema isolation per company",
      "Celery + Redis for async payroll processing and notifications",
      "React web dashboard with role-based views (HR, Manager, Employee)",
      "React Native mobile app for iOS and Android",
      "PostgreSQL with field-level encryption for PII data",
      "Biometric SDK integration (ZKTeco, Suprema, Fingertec)",
    ],
    screenshots: [
      { label: "Employee Dashboard",  photoId: "1551434678-e076c223a692" },
      { label: "Payroll Processing",  photoId: "1554224155-6726b3ff858f" },
      { label: "Attendance Report",   photoId: "1573164713988-8665fc963095" },
      { label: "Leave Calendar",      photoId: "1506784365847-bbad939e9335" },
    ],
    pricing: [
      { name: "SME", price: "৳499", period: "/ mo up to 50 staff", highlight: false, features: ["Core HR", "Payroll", "Leave management", "Mobile app"], cta: "Start Free Trial" },
      { name: "Business", price: "৳999", period: "/ mo up to 200 staff", highlight: true, features: ["All SME features", "Performance reviews", "Multi-branch", "API access", "Priority support"], cta: "Get Demo" },
      { name: "Enterprise", price: "Custom", period: "unlimited staff", highlight: false, features: ["On-premise option", "Custom integrations", "Dedicated account manager", "SLA 99.9%"], cta: "Contact Sales" },
    ],
  },

  "erp": {
    problemStatement: "Mid-market companies run 5–10 disconnected tools for accounting, inventory, procurement, and HR — causing data silos, reconciliation nightmares, and delayed decisions. BlackMarlin ERP consolidates everything.",
    features: [
      { icon: Database, title: "Integrated Accounting", description: "Double-entry bookkeeping, multi-currency GL, accounts payable/receivable, bank reconciliation, and financial statements." },
      { icon: Zap, title: "Inventory Control", description: "Real-time stock levels across warehouses, batch/serial tracking, automated reorder points, and supplier lead-time management." },
      { icon: Shield, title: "Procurement & PO", description: "Purchase requisition to GRN workflow with 3-way matching (PO, GRN, invoice) and supplier performance tracking." },
      { icon: Globe, title: "Sales & CRM", description: "Quotation, order, delivery, and invoice in one workflow. Customer credit limits and aging reports built in." },
      { icon: BarChart2, title: "Manufacturing Module", description: "Bill of materials, production orders, shop floor control, and work-in-progress valuation for light manufacturers." },
      { icon: Users, title: "Executive Dashboard", description: "Real-time KPIs: cash position, receivables aging, inventory turnover, and gross margin — all on one screen." },
    ],
    capabilities: [
      "Multi-company and multi-branch support",
      "Multi-currency with live exchange rate feeds",
      "Tax management (VAT, GST, customs duties)",
      "Asset management with depreciation schedules",
      "Project accounting and job costing",
      "Budget management and variance reporting",
      "Custom approval workflows per document type",
      "REST API for third-party integrations",
    ],
    architecture: [
      "Python / Django core with modular app architecture",
      "PostgreSQL — partitioned tables for large transaction volumes",
      "React frontend with offline-capable service worker",
      "Celery for scheduled reports and batch posting",
      "Redis pub/sub for real-time dashboard updates",
      "Docker + Kubernetes deployment — scales to 10,000 concurrent users",
    ],
    screenshots: [
      { label: "Financial Dashboard",   photoId: "1504868584819-f8e8b4b6d7e3" },
      { label: "Inventory Management",  photoId: "1553413077-190dd305871c" },
      { label: "Purchase Orders",       photoId: "1454165804606-c3d57bc86b40" },
      { label: "Sales Pipeline",        photoId: "1551288049-bebda4e38f71" },
    ],
    pricing: [
      { name: "Standard", price: "৳2,499", period: "/ month", highlight: false, features: ["Accounting + Inventory", "Up to 10 users", "Standard reports"], cta: "Start Trial" },
      { name: "Professional", price: "৳5,999", period: "/ month", highlight: true, features: ["All modules", "Up to 50 users", "Manufacturing", "API access", "24/7 support"], cta: "Get Demo" },
      { name: "Enterprise", price: "Custom", period: "/ year", highlight: false, features: ["Unlimited users", "On-premise", "Source code license", "Dedicated team"], cta: "Contact Sales" },
    ],
  },

  "hospital-erp": {
    problemStatement: "Hospitals running siloed systems for clinical, administrative, and financial functions waste staff time on manual handoffs, lose revenue to billing gaps, and struggle to produce regulatory reports.",
    features: [
      { icon: Users, title: "Patient Management", description: "Full patient journey from registration to discharge. Smart bed management, OPD scheduling, and IPD tracking." },
      { icon: Shield, title: "Clinical Workflows", description: "CPOE, nursing notes, clinical decision support alerts, and medication administration integrated with EMR." },
      { icon: Database, title: "Billing & Insurance", description: "Automated claim generation, insurance pre-authorization, and real-time eligibility. 99.2% first-pass rate." },
      { icon: Zap, title: "Pharmacy Management", description: "Drug dispensing with barcode verification, formulary management, and automated stockout prevention." },
      { icon: Globe, title: "FHIR R4 APIs", description: "All clinical data via standard FHIR R4 APIs — integrate with national health exchanges, labs, and imaging." },
      { icon: BarChart2, title: "Hospital Analytics", description: "Real-time KPIs: bed occupancy, ALOS, revenue per bed, department P&L, and quality metrics." },
    ],
    capabilities: [
      "OPD, IPD, emergency, and day-care workflows",
      "Electronic Medical Records with clinical templates",
      "Lab and radiology order management",
      "Insurance TPA and cashless claim management",
      "Pharmacy and drug inventory management",
      "NABH / JCI accreditation reporting",
      "HL7 FHIR R4 interoperability",
      "Mobile app for doctors and nurses",
    ],
    architecture: [
      "Django REST Framework backend with FHIR R4 resources",
      "HAPI FHIR server for standards-compliant resource hosting",
      "PostgreSQL + Redis for clinical data and session management",
      "React web application + React Native mobile app",
      "Celery for async report generation and HL7 messaging",
      "AWS / Azure HIPAA-compliant cloud configuration",
    ],
    screenshots: [
      { label: "Patient Dashboard",    photoId: "1576091160399-112ba8d25d1d" },
      { label: "OPD Queue",            photoId: "1538108437191-34c98c280f64" },
      { label: "Pharmacy Dispensing",  photoId: "1584982751601-97d2e4e4b76e" },
      { label: "Billing & Insurance",  photoId: "1521791136064-7986c2920216" },
    ],
    pricing: [
      { name: "Clinic", price: "৳3,999", period: "/ month", highlight: false, features: ["Up to 50 beds", "OPD + Pharmacy", "Basic billing", "Email support"], cta: "Start Trial" },
      { name: "Hospital", price: "৳14,999", period: "/ month", highlight: true, features: ["Up to 500 beds", "Full clinical suite", "Insurance TPA", "FHIR APIs", "24/7 support"], cta: "Get Demo" },
      { name: "Network", price: "Custom", period: "/ year", highlight: false, features: ["Multi-facility", "Central analytics", "White-label", "On-premise"], cta: "Contact Sales" },
    ],
  },

  "ai-chatbot": {
    problemStatement: "Support teams are overwhelmed by repetitive tier-1 queries. Every hour spent on FAQs is an hour not spent on complex customer problems. Our AI Chat resolves 70%+ of tickets autonomously.",
    features: [
      { icon: Zap, title: "GPT-4 Powered", description: "Latest GPT-4 Turbo with function calling, fine-tuned on your product documentation and historical support conversations." },
      { icon: Globe, title: "95 Languages", description: "Auto-detects visitor language and responds fluently — no configuration needed. Handles code-switching mid-conversation." },
      { icon: Shield, title: "RAG Architecture", description: "Retrieval-augmented generation ensures every answer comes from your verified docs — source citations shown to users." },
      { icon: Database, title: "CRM Integration", description: "Creates tickets, looks up order status, and logs interactions directly in Zendesk, Freshdesk, or HubSpot." },
      { icon: Users, title: "Human Handoff", description: "Detects frustration and complexity. Passes full conversation context to human agent in one click — zero context loss." },
      { icon: BarChart2, title: "Analytics", description: "Resolution rate, CSAT, escalation rate, and common question clusters. Built-in continuous improvement loop." },
    ],
    capabilities: [
      "Website, mobile app, and WhatsApp deployment",
      "Document ingestion: PDF, Word, HTML, Notion, Confluence",
      "Real-time product catalog and FAQ auto-sync",
      "Order tracking and account lookup API integrations",
      "Appointment booking via calendar integration",
      "Lead capture and CRM handoff workflows",
      "GDPR-compliant conversation data handling",
      "Custom persona, tone, and brand voice configuration",
    ],
    architecture: [
      "OpenAI GPT-4 Turbo as LLM — switchable to on-premise LLaMA",
      "pgvector (PostgreSQL) for document embeddings and similarity search",
      "FastAPI backend with WebSocket for real-time streaming responses",
      "React embeddable chat widget — one script tag to deploy",
      "Webhook integrations to Zendesk, HubSpot, Freshdesk, Intercom",
      "Analytics: Kafka → ClickHouse → Grafana dashboard",
    ],
    screenshots: [
      { label: "Chat Interface",   photoId: "1677442135703-1787eea5ce01" },
      { label: "Admin Dashboard",  photoId: "1573164713988-8665fc963095" },
      { label: "Analytics View",   photoId: "1551288049-bebda4e38f71" },
      { label: "Knowledge Base",   photoId: "1633356122102-3fe601e05bd2" },
    ],
    pricing: [
      { name: "Starter", price: "$299", period: "/ month", highlight: false, features: ["5,000 messages/mo", "1 language", "Website widget", "Email support"], cta: "Start Free Trial" },
      { name: "Business", price: "$999", period: "/ month", highlight: true, features: ["50k messages/mo", "All languages", "All channels", "CRM integration", "Analytics", "Priority support"], cta: "Start Free Trial" },
      { name: "Enterprise", price: "Custom", period: "/ year", highlight: false, features: ["Unlimited messages", "On-premise LLM", "Custom fine-tuning", "SLA 99.9%"], cta: "Contact Sales" },
    ],
  },

  "schoolos": {
    problemStatement: "Schools managing admissions, timetables, fees, and parent communication through Excel and paper are drowning in admin work while parents demand digital access. SchoolOS digitises every school process.",
    features: [
      { icon: Users, title: "Student Lifecycle", description: "Online admissions, enrollment, class assignment, year progression, and alumni management in one workflow." },
      { icon: Database, title: "Timetable Builder", description: "AI-powered timetable generation respecting teacher availability, room capacity, and curriculum constraints." },
      { icon: Zap, title: "Fee Collection", description: "Online fee payment, instalment plans, auto-reminders, and real-time defaulter reports for the finance office." },
      { icon: Shield, title: "Gradebook & Reports", description: "Customisable grade schemes, progress reports, and report card generation — branded and print-ready." },
      { icon: Globe, title: "Parent Portal", description: "Parents track attendance, view results, pay fees, and message teachers from a branded mobile app." },
      { icon: BarChart2, title: "School Analytics", description: "Attendance trends, academic performance, fee collection rates, and teacher workload — all in one dashboard." },
    ],
    capabilities: [
      "Online and walk-in admissions management",
      "Multi-session and multi-campus support",
      "AI timetable generation",
      "Attendance tracking (RFID, biometric, manual)",
      "Gradebook and customisable report cards",
      "Online fee payment (bKash, Nagad, card)",
      "Parent and student mobile apps",
      "Library management module",
    ],
    architecture: [
      "Django REST backend with multi-tenant school isolation",
      "React web admin panel for school staff",
      "React Native mobile app for parents and students",
      "SMS gateway integration for instant notifications",
      "PostgreSQL with daily backup to S3",
      "Hosted on AWS Bangladesh region for data residency",
    ],
    screenshots: [
      { label: "School Dashboard",  photoId: "1580582932707-520aed937b7b" },
      { label: "Student Profile",   photoId: "1523050854058-8df90110c9f1" },
      { label: "Fee Management",    photoId: "1460925895917-afdab827c52f" },
      { label: "Parent Mobile App", photoId: "1522202176988-66273c2fd55f" },
    ],
    pricing: [
      { name: "Small School", price: "৳1,999", period: "/ month", highlight: false, features: ["Up to 500 students", "Core modules", "SMS notifications", "Email support"], cta: "Start Trial" },
      { name: "Medium School", price: "৳3,999", period: "/ month", highlight: true, features: ["Up to 2,000 students", "All modules", "Parent app", "Unlimited SMS", "24/7 support"], cta: "Get Demo" },
      { name: "Institution", price: "Custom", period: "/ year", highlight: false, features: ["Multi-campus", "Custom branding", "On-premise option", "Data migration"], cta: "Contact Sales" },
    ],
  },

  "marketx": {
    problemStatement: "Entrepreneurs want to launch their own Amazon-style marketplace but building the vendor management, commission engine, and dispute resolution from scratch costs $500k+. MarketX gives you all of that in weeks.",
    features: [
      { icon: Users, title: "Multi-Vendor Management", description: "Vendor onboarding, KYC verification, product listing approval, and performance scorecards — admin-controlled." },
      { icon: Database, title: "Commission Engine", description: "Flexible commission rules per category, vendor tier, or SKU. Automatic vendor payouts via bKash, Nagad, or bank transfer." },
      { icon: Zap, title: "AI Product Discovery", description: "Personalised search ranking, AI recommendations, and dynamic pricing tools drive 3× more conversions." },
      { icon: Shield, title: "Escrow & Dispute", description: "Buyer funds held in escrow until delivery confirmed. Structured dispute resolution workflow with admin arbitration." },
      { icon: Globe, title: "Delivery Integration", description: "Pathao, Steadfast, RedX, and custom courier integrations. Real-time tracking visible to buyer and seller." },
      { icon: BarChart2, title: "Marketplace Analytics", description: "GMV, take-rate, vendor performance, category trends, and buyer cohort analysis for data-driven growth." },
    ],
    capabilities: [
      "Unlimited vendors and product listings",
      "Bulk product import via CSV / API",
      "Dynamic commission and promotional rules",
      "Integrated payment gateway (bKash, Nagad, SSLCommerz)",
      "Buyer and seller review and rating system",
      "Flash sale and auction module",
      "Affiliate and influencer tracking",
      "Mobile commerce apps (iOS + Android)",
    ],
    architecture: [
      "Next.js 14 storefront with server-side rendering and edge caching",
      "Django REST Framework marketplace API with vendor isolation",
      "Elasticsearch for product search and faceted filtering",
      "PostgreSQL for orders and PostgreSQL + Redis for sessions",
      "Kafka for order events, inventory sync, and analytics pipeline",
      "AWS CloudFront CDN — sub-100ms page loads globally",
    ],
    screenshots: [
      { label: "Marketplace Home",  photoId: "1556742049-0cfed4f6a45d" },
      { label: "Vendor Dashboard",  photoId: "1516321318423-f06f85e504b3" },
      { label: "Order Management",  photoId: "1553413077-190dd305871c" },
      { label: "Analytics Panel",   photoId: "1504868584819-f8e8b4b6d7e3" },
    ],
    pricing: [
      { name: "Launch", price: "৳9,999", period: "/ month", highlight: false, features: ["Up to 100 vendors", "Core marketplace", "Standard payment gateways", "Email support"], cta: "Start Trial" },
      { name: "Scale", price: "৳24,999", period: "/ month", highlight: true, features: ["Unlimited vendors", "All features", "AI recommendations", "Custom domain", "24/7 support"], cta: "Get Demo" },
      { name: "Enterprise", price: "Custom", period: "/ year", highlight: false, features: ["White-label", "Source code license", "On-premise option", "Dedicated team"], cta: "Contact Sales" },
    ],
  },
};

// Default extended details for products without specific entries
const DEFAULT_DETAILS: ProductExtended = {
  problemStatement: "Businesses using manual processes and disconnected tools face operational inefficiencies, data silos, and scalability challenges. Our solution delivers an integrated, AI-powered platform built for modern enterprises.",
  features: [
    { icon: Zap, title: "Real-Time Dashboard", description: "Live KPIs and operational metrics on a single, customisable dashboard — accessible from any device." },
    { icon: Shield, title: "Enterprise Security", description: "Role-based access control, field-level encryption, audit trails, and SOC 2 / ISO 27001-aligned security controls." },
    { icon: Globe, title: "Multi-Language & Multi-Currency", description: "Built for global deployment with 20+ languages, multiple currencies, and timezone-aware reporting." },
    { icon: Database, title: "Advanced Reporting", description: "Scheduled reports, ad-hoc queries, and exportable dashboards in PDF, Excel, and CSV formats." },
    { icon: MessageSquare, title: "In-App Collaboration", description: "Threaded comments, task assignments, and @mentions directly on records — no external tool needed." },
    { icon: Server, title: "API-First Architecture", description: "Comprehensive REST and GraphQL APIs for seamless integration with any third-party system." },
  ],
  capabilities: [
    "Cloud-native SaaS with 99.9% uptime SLA",
    "Mobile-responsive web + native iOS/Android apps",
    "Two-way API integrations with 50+ popular tools",
    "Automated workflows and approval chains",
    "Real-time notifications via email, SMS, and push",
    "Role-based access control with granular permissions",
    "Full audit trail on every data change",
    "White-label and custom branding options",
  ],
  architecture: [
    "Python / Django REST API backend — horizontally scalable",
    "React frontend with TypeScript — fast and maintainable",
    "PostgreSQL primary database with read replicas",
    "Redis for caching and real-time pub/sub",
    "Celery for background jobs and scheduled tasks",
    "Docker + Kubernetes deployment on AWS or Azure",
  ],
  screenshots: [
    { label: "Main Dashboard",       photoId: "1504868584819-f8e8b4b6d7e3" },
    { label: "Data Management",      photoId: "1553413077-190dd305871c" },
    { label: "Reports & Analytics",  photoId: "1551288049-bebda4e38f71" },
    { label: "Mobile App",           photoId: "1522202176988-66273c2fd55f" },
  ],
  pricing: [
    { name: "Starter", price: "৳1,999", period: "/ month", highlight: false, features: ["Core features", "Up to 5 users", "Email support", "Standard integrations"], cta: "Start Free Trial" },
    { name: "Professional", price: "৳4,999", period: "/ month", highlight: true, features: ["All features", "Up to 25 users", "Priority support", "API access", "Advanced reports"], cta: "Get Demo" },
    { name: "Enterprise", price: "Custom", period: "/ year", highlight: false, features: ["Unlimited users", "On-premise option", "Custom integrations", "Dedicated success manager"], cta: "Contact Sales" },
  ],
};

// ─── Components ───────────────────────────────────────────────────────────────

const UNSPLASH_BASE = "https://images.unsplash.com/photo-";

function Screenshot({ label, photoId }: { label: string; photoId: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={`${UNSPLASH_BASE}${photoId}?w=800&h=450&fit=crop&q=80`}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle vignette + fake browser chrome */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/90 shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/90 shadow-sm" />
          </div>
          <div className="flex-1 h-5 rounded-md bg-white/10 backdrop-blur-sm border border-white/20" />
        </div>
        {/* Label overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
          <span className="text-xs text-white/90 font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ plan }: { plan: ProductExtended["pricing"][number] }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col h-full border transition-all duration-200 ${
      plan.highlight
        ? "bg-gradient-to-br from-brand-600 to-brand-500 border-brand-400 shadow-2xl shadow-brand-500/30"
        : "bg-card border-border hover:border-brand-500/40"
    }`}>
      {plan.highlight && (
        <div className="flex items-center gap-1 text-xs font-semibold text-brand-200 mb-2">
          <Star className="h-3.5 w-3.5 fill-current" /> Most Popular
        </div>
      )}
      <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
      <div className="flex items-end gap-1 mb-4">
        <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "gradient-text"}`}>{plan.price}</span>
        <span className={`text-xs mb-1 ${plan.highlight ? "text-brand-200" : "text-muted-foreground"}`}>{plan.period}</span>
      </div>
      <ul className="space-y-2 flex-1 mb-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? "text-brand-200" : "text-brand-400"}`} />
            <span className={`text-sm ${plan.highlight ? "text-brand-100" : "text-muted-foreground"}`}>{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/contact" className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
        plan.highlight ? "bg-white text-brand-600 hover:bg-white/90" : "bg-accent hover:bg-brand-500 hover:text-white border border-border"
      }`}>
        {plan.cta}
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const found = productSlug ? getProductBySlug(productSlug) : null;
  const { t } = useTranslation();

  if (!found) {
    return (
      <main className="pt-28 pb-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{t("products.not_found")}</h1>
          <p className="text-muted-foreground mb-8">{t("products.not_found_desc")}</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-medium">
            <ArrowLeft className="h-4 w-4" /> {t("products.browse_all")}
          </Link>
        </div>
      </main>
    );
  }

  const { product, category } = found;
  const ext = DETAILS[product.slug] ?? DEFAULT_DETAILS;
  const Icon = product.icon;

  // Related products from same category
  const related = category.products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <SEOHead
        pageKey="products"
        overrides={{
          title: `${product.name} — BlackMarlinBD`,
          description: product.description,
        }}
      />

      <main className="pt-20">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-brand-950/20" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }}
          />

          <div className="container mx-auto px-4 py-20 relative">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8 flex-wrap">
              <Link to="/products" className="hover:text-brand-400 transition-colors">Products</Link>
              <span>/</span>
              <span className="text-muted-foreground">{category.label}</span>
              <span>/</span>
              <span className="text-foreground font-medium">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
                  style={{ backgroundColor: product.iconColor + "22", border: `2px solid ${product.iconColor}44` }}
                >
                  <Icon className="h-8 w-8" style={{ color: product.iconColor }} />
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {product.isNew && <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">NEW</span>}
                  {product.badge && <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">{product.badge}</span>}
                  <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-muted-foreground">{category.label}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3 leading-tight">{product.name}</h1>
                <p className="text-lg text-brand-400 font-medium mb-4">{product.tagline}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity">
                    <Play className="h-4 w-4 fill-current" /> Request Demo
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border font-semibold hover:border-brand-500/50 transition-colors">
                    <Phone className="h-4 w-4" /> Talk to Sales
                  </Link>
                </div>
              </motion.div>

              {/* Problem statement */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-2xl bg-card border border-border p-8"
                style={{ borderColor: product.iconColor + "44" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">{t("products.detail_problem")}</p>
                <p className="text-foreground leading-relaxed text-base">{ext.problemStatement}</p>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-20">

          {/* ── Screenshots ─────────────────────────────────────────────── */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-2">{t("products.detail_screenshots")}</h2>
            <p className="text-muted-foreground mb-8">{t("products.detail_screenshots_desc")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ext.screenshots.map((s) => <Screenshot key={s.photoId} label={s.label} photoId={s.photoId} />)}
            </div>
          </section>

          {/* ── Features ────────────────────────────────────────────────── */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-2">{t("products.detail_features")}</h2>
            <p className="text-muted-foreground mb-8">{t("products.detail_everything")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ext.features.map((f, i) => {
                const FIcon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-card border border-border p-5"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: product.iconColor + "22" }}>
                      <FIcon className="h-4.5 w-4.5" style={{ color: product.iconColor }} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── Capabilities + Architecture ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
            <div className="rounded-2xl bg-card border border-border p-8">
              <h2 className="text-xl font-bold mb-5">{t("products.detail_included")}</h2>
              <ul className="space-y-3">
                {ext.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-card border border-border p-8">
              <h2 className="text-xl font-bold mb-2">{t("products.detail_architecture")}</h2>
              <p className="text-sm text-muted-foreground mb-5">{t("products.detail_arch_desc")}</p>
              <div className="space-y-3">
                {ext.architecture.map((layer, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                    <p className="text-sm text-muted-foreground">{layer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Pricing ─────────────────────────────────────────────────── */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">{t("products.detail_pricing")}</h2>
              <p className="text-muted-foreground">{t("products.detail_pricing_desc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {ext.pricing.map((p) => <PricingCard key={p.name} plan={p} />)}
            </div>
          </section>

          {/* ── Related products ─────────────────────────────────────────── */}
          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("products.detail_related", { category: category.label })}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((p) => {
                  const RIcon = p.icon;
                  return (
                    <Link
                      key={p.slug}
                      to={`/products/${p.slug}`}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-brand-500/50 transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: p.iconColor + "22" }}>
                        <RIcon className="h-4 w-4" style={{ color: p.iconColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-brand-400 transition-colors">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.tagline}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Back link */}
          <div className="mt-12 flex items-center justify-between">
            <Link to="/products" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> {t("products.all_products")}
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors">
              {t("products.book_demo")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
