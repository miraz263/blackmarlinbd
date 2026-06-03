from django.core.management.base import BaseCommand
from apps.products.models import ProductCategory, Product

CATALOG = [
    {
        "category": {"name": "Business Solution", "slug": "business-solution", "icon_name": "Building2", "order": 1},
        "products": [
            {"name": "HR Manager", "slug": "hr-manager", "tagline": "Human Resource Management", "description": "Complete hire-to-retire HR platform with payroll, leave, attendance, and performance management.", "icon_name": "Users", "icon_color": "#10b981", "is_featured": True, "order": 1},
            {"name": "ERP", "slug": "erp", "tagline": "Business ERP Solution / Company Management", "description": "Integrated ERP covering accounting, inventory, procurement, and operations for mid-market companies.", "icon_name": "Database", "icon_color": "#6366f1", "is_featured": True, "order": 2},
            {"name": "M-Store", "slug": "m-store", "tagline": "Multi-Store Inventory Management", "description": "Centralised stock control across unlimited store locations with real-time transfer and reorder alerts.", "icon_name": "Store", "icon_color": "#0ea5e9", "is_featured": True, "order": 3},
            {"name": "Wholesale", "slug": "wholesale", "tagline": "Inventory Management System", "description": "B2B wholesale platform: bulk orders, distributor pricing tiers, credit limits, and delivery tracking.", "icon_name": "Package", "icon_color": "#f59e0b", "order": 4},
            {"name": "Innue", "slug": "innue", "tagline": "Business Live Chatbot Software", "description": "AI-powered live chat and chatbot platform that qualifies leads and routes them to the right agent.", "icon_name": "MessageSquare", "icon_color": "#8b5cf6", "is_new": True, "badge": "AI", "order": 5},
            {"name": "Nirmako", "slug": "nirmako", "tagline": "Construction Cost Estimating Software", "description": "BOQ generation, material takeoff, vendor comparison, and project budget tracking for contractors.", "icon_name": "HardHat", "icon_color": "#ef4444", "order": 6},
            {"name": "CRM Pro", "slug": "crm-pro", "tagline": "Customer Relationship Management", "description": "Sales pipeline, lead scoring, and email automation for growing B2B sales teams.", "icon_name": "Contact", "icon_color": "#06b6d4", "order": 7},
            {"name": "DocuVault", "slug": "docuvault", "tagline": "Document Management System", "description": "Version control, approval workflows, e-signature, and audit trails for enterprise document management.", "icon_name": "FileStack", "icon_color": "#64748b", "order": 8},
        ],
    },
    {
        "category": {"name": "Hotel & Restaurant", "slug": "hotel-restaurant", "icon_name": "Hotel", "order": 2},
        "products": [
            {"name": "HotelOS", "slug": "hotelos", "tagline": "Property Management System", "description": "Full-featured hotel PMS: front desk, reservations, housekeeping, and channel manager integration.", "icon_name": "Hotel", "icon_color": "#6366f1", "is_featured": True, "order": 1},
            {"name": "RestoPOS", "slug": "restopos", "tagline": "Restaurant POS & Kitchen Display", "description": "Cloud POS with table management, KDS, split billing, and loyalty — works offline during internet outages.", "icon_name": "UtensilsCrossed", "icon_color": "#ef4444", "is_featured": True, "order": 2},
            {"name": "TableBook", "slug": "tablebook", "tagline": "Online Table Reservation Platform", "description": "Branded reservation widget, automated reminders, and no-show fee collection for restaurants.", "icon_name": "CalendarCheck", "icon_color": "#f59e0b", "order": 3},
            {"name": "MenuMaster", "slug": "menumaster", "tagline": "Digital Menu & QR Ordering", "description": "QR-code menus with real-time availability, allergy filters, and direct-to-kitchen ordering.", "icon_name": "MenuSquare", "icon_color": "#10b981", "is_new": True, "order": 4},
        ],
    },
    {
        "category": {"name": "FinTech", "slug": "fintech", "icon_name": "BarChart2", "order": 3},
        "products": [
            {"name": "TradeDesk OMS", "slug": "tradedesk-oms", "tagline": "Multi-Asset Order Management System", "description": "FIX-native OMS handling equities, FI, FX, and derivatives with sub-10 µs order routing.", "icon_name": "TrendingUp", "icon_color": "#8b5cf6", "is_featured": True, "badge": "Enterprise", "order": 1},
            {"name": "RiskMatrix", "slug": "riskmatrix", "tagline": "Real-Time Risk Management System", "description": "Pre- and post-trade risk engine: VaR, Greeks, stress testing, and FRTB capital reporting.", "icon_name": "Shield", "icon_color": "#ef4444", "is_featured": True, "order": 2},
            {"name": "AlgoEngine", "slug": "algoengine", "tagline": "Algorithmic Trading Infrastructure", "description": "C++ low-latency algo trading platform with Python strategy API, backtesting, and paper trading.", "icon_name": "Zap", "icon_color": "#f59e0b", "badge": "HFT", "order": 3},
            {"name": "PayGate", "slug": "paygate", "tagline": "Payment Gateway & Processing", "description": "Multi-currency payment gateway supporting cards, bKash, Nagad, SWIFT, and bank transfers.", "icon_name": "Wallet", "icon_color": "#10b981", "is_new": True, "order": 4},
            {"name": "PortfolioIQ", "slug": "portfolioiq", "tagline": "Portfolio Management & Analytics", "description": "Multi-asset portfolio analytics with Brinson attribution, GIPS reporting, and automated rebalancing.", "icon_name": "Briefcase", "icon_color": "#6366f1", "order": 5},
        ],
    },
    {
        "category": {"name": "E-Commerce", "slug": "ecommerce", "icon_name": "ShoppingCart", "order": 4},
        "products": [
            {"name": "MarketX", "slug": "marketx", "tagline": "Multi-Vendor Marketplace Platform", "description": "Launch your own Amazon-style marketplace: vendor onboarding, commission management, and dispute resolution.", "icon_name": "ShoppingCart", "icon_color": "#f59e0b", "is_featured": True, "order": 1},
            {"name": "ShopEngine", "slug": "shopengine", "tagline": "Headless E-Commerce Platform", "description": "Composable headless commerce with Next.js storefront, AI recommendations, and 99+ payment methods.", "icon_name": "ShoppingBag", "icon_color": "#8b5cf6", "is_featured": True, "badge": "AI", "order": 2},
            {"name": "StockHub", "slug": "stockhub", "tagline": "Multi-Channel Inventory & Order Management", "description": "Unified inventory across web, marketplace, and offline channels with automated reorder and WMS integration.", "icon_name": "Boxes", "icon_color": "#0ea5e9", "order": 3},
        ],
    },
    {
        "category": {"name": "Education", "slug": "education", "icon_name": "GraduationCap", "order": 5},
        "products": [
            {"name": "SchoolOS", "slug": "schoolos", "tagline": "K-12 School Management ERP", "description": "Admissions, timetable, attendance, gradebook, fee collection, and parent portal in one platform.", "icon_name": "GraduationCap", "icon_color": "#6366f1", "is_featured": True, "order": 1},
            {"name": "UniERP", "slug": "unierp", "tagline": "University Management System", "description": "Student lifecycle, course registration, credit management, faculty portal, and accreditation reporting.", "icon_name": "BookOpen", "icon_color": "#10b981", "is_featured": True, "order": 2},
            {"name": "LearnIQ LMS", "slug": "learniq-lms", "tagline": "AI-Powered Learning Management System", "description": "Adaptive learning platform with AI tutor, live classes, SCORM content, and detailed learner analytics.", "icon_name": "ClipboardList", "icon_color": "#8b5cf6", "badge": "AI", "is_new": True, "order": 3},
            {"name": "ExamPro", "slug": "exampro", "tagline": "Online Exam & Assessment Portal", "description": "Proctored online exams with AI anti-cheating, auto-grading, and instant result publishing.", "icon_name": "PenLine", "icon_color": "#ef4444", "badge": "AI", "order": 4},
        ],
    },
    {
        "category": {"name": "Healthcare", "slug": "healthcare", "icon_name": "Heart", "order": 6},
        "products": [
            {"name": "Hospital ERP", "slug": "hospital-erp", "tagline": "End-to-End Hospital Management System", "description": "Complete HMS: OPD/IPD, EMR, billing, pharmacy, lab, inventory, and FHIR R4 interoperability.", "icon_name": "Heart", "icon_color": "#ef4444", "is_featured": True, "badge": "FHIR R4", "order": 1},
            {"name": "TeleMed", "slug": "telemed", "tagline": "Telemedicine & Video Consultation", "description": "HIPAA-compliant video consultations, e-prescriptions, and remote patient monitoring platform.", "icon_name": "Stethoscope", "icon_color": "#10b981", "is_featured": True, "order": 2},
            {"name": "DoctorFinder", "slug": "doctorfinder", "tagline": "Doctor Directory & Appointment Platform", "description": "Patient-facing doctor search, speciality filtering, insurance matching, and instant online booking.", "icon_name": "UserSearch", "icon_color": "#6366f1", "order": 3},
            {"name": "HealthRecords", "slug": "healthrecords", "tagline": "Personal Health Record (PHR) Platform", "description": "Patient-owned digital health records with AI symptom checker and care timeline visualization.", "icon_name": "FileHeart", "icon_color": "#8b5cf6", "badge": "AI", "is_new": True, "order": 4},
        ],
    },
    {
        "category": {"name": "News Portal", "slug": "news-portal", "icon_name": "Newspaper", "order": 7},
        "products": [
            {"name": "NewsCMS", "slug": "newscms", "tagline": "Modern News & Media Content Platform", "description": "Multi-author news CMS with SEO tools, AMP support, subscription paywall, and ad management.", "icon_name": "Newspaper", "icon_color": "#0ea5e9", "is_featured": True, "order": 1},
            {"name": "MultiPortal", "slug": "multiportal", "tagline": "Multi-Brand News Network", "description": "Run unlimited news portals from one dashboard — each with its own domain, brand, and editorial team.", "icon_name": "Globe", "icon_color": "#8b5cf6", "order": 2},
        ],
    },
    {
        "category": {"name": "Online Reservation", "slug": "online-reservation", "icon_name": "CalendarDays", "order": 8},
        "products": [
            {"name": "BookNow", "slug": "booknow", "tagline": "Universal Online Booking Platform", "description": "Customisable booking widget for any service business — salons, clinics, fitness studios, and more.", "icon_name": "CalendarDays", "icon_color": "#10b981", "is_featured": True, "order": 1},
            {"name": "EventFlow", "slug": "eventflow", "tagline": "Event Ticketing & Management", "description": "End-to-end event management: ticketing, seat maps, check-in QR, and post-event analytics.", "icon_name": "Ticket", "icon_color": "#6366f1", "order": 2},
        ],
    },
    {
        "category": {"name": "AI Suite", "slug": "ai-suite", "icon_name": "Brain", "order": 9},
        "products": [
            {"name": "AskAI", "slug": "askai", "tagline": "Conversational AI Assistant Platform", "description": "Deploy branded AI assistants powered by GPT-4 with custom knowledge bases, RAG pipelines, and analytics.", "icon_name": "MessageCircleMore", "icon_color": "#8b5cf6", "is_featured": True, "badge": "AI", "is_new": True, "order": 1},
            {"name": "SupportBot", "slug": "supportbot", "tagline": "AI Customer Support Automation", "description": "Deflect 70% of support tickets with AI — integrates with Zendesk, Freshdesk, and custom helpdesks.", "icon_name": "HelpCircle", "icon_color": "#10b981", "badge": "AI", "order": 2},
            {"name": "DocuAI", "slug": "docuai", "tagline": "Intelligent Document Processing", "description": "Extract, classify, and validate data from invoices, contracts, and forms using fine-tuned vision models.", "icon_name": "Brain", "icon_color": "#6366f1", "badge": "AI", "order": 3},
            {"name": "PredictIQ", "slug": "predictiq", "tagline": "Predictive Analytics Platform", "description": "No-code ML platform: demand forecasting, churn prediction, and anomaly detection for business teams.", "icon_name": "Zap", "icon_color": "#f59e0b", "badge": "AI", "order": 4},
        ],
    },
    {
        "category": {"name": "Templates", "slug": "templates", "icon_name": "LayoutTemplate", "order": 10},
        "products": [
            {"name": "SiteCraft Pro", "slug": "sitecraft-pro", "tagline": "Premium Website Template Pack", "description": "50+ professionally designed Next.js templates for SaaS, agencies, and e-commerce — ready to deploy.", "icon_name": "LayoutTemplate", "icon_color": "#6366f1", "is_featured": True, "order": 1},
            {"name": "AdminKit", "slug": "adminkit", "tagline": "React Admin Dashboard Templates", "description": "10 production-ready admin dashboards with charts, tables, auth flows, and dark mode — MIT licensed.", "icon_name": "Globe", "icon_color": "#0ea5e9", "order": 2},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed product catalog from static data"

    def add_arguments(self, parser):
        parser.add_argument("--overwrite", action="store_true", help="Update existing records")

    def handle(self, *args, **options):
        overwrite = options["overwrite"]

        # Safety guard: if products already exist and --overwrite not passed,
        # refuse to run so that manually deleted products are not restored.
        if Product.objects.exists() and not overwrite:
            self.stdout.write(self.style.WARNING(
                f"Skipped — {Product.objects.count()} products already exist. "
                "Use --overwrite to force re-seed (this will restore deleted products)."
            ))
            return

        created_cats = created_prods = updated_prods = 0

        for entry in CATALOG:
            cat_data = entry["category"]
            cat, cat_created = ProductCategory.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={k: v for k, v in cat_data.items() if k != "slug"},
            )
            if cat_created:
                created_cats += 1
            elif overwrite:
                for k, v in cat_data.items():
                    if k != "slug":
                        setattr(cat, k, v)
                cat.save()

            for i, p in enumerate(entry["products"]):
                defaults = {k: v for k, v in p.items() if k not in ("slug",)}
                defaults["category"] = cat
                prod, prod_created = Product.objects.get_or_create(slug=p["slug"], defaults=defaults)
                if prod_created:
                    created_prods += 1
                elif overwrite:
                    for k, v in defaults.items():
                        setattr(prod, k, v)
                    prod.save()
                    updated_prods += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done — {created_cats} categories, {created_prods} products created, {updated_prods} updated."
        ))
