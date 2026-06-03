from django.db import migrations


CATALOG = [
    {"category": {"name": "Business Solution", "slug": "business-solution", "icon_name": "Building2", "order": 1}, "products": [
        {"slug": "hr-manager",   "name": "HR Manager",   "tagline": "Human Resource Management",              "icon_name": "Users",         "icon_color": "#10b981", "is_featured": True, "order": 1},
        {"slug": "erp",          "name": "ERP",           "tagline": "Business ERP Solution",                  "icon_name": "Database",      "icon_color": "#6366f1", "is_featured": True, "order": 2},
        {"slug": "m-store",      "name": "M-Store",       "tagline": "Multi-Store Inventory Management",        "icon_name": "Store",         "icon_color": "#0ea5e9", "is_featured": True, "order": 3},
        {"slug": "wholesale",    "name": "Wholesale",     "tagline": "Inventory Management System",             "icon_name": "Package",       "icon_color": "#f59e0b", "order": 4},
        {"slug": "innue",        "name": "Innue",         "tagline": "Business Live Chatbot Software",          "icon_name": "MessageSquare", "icon_color": "#8b5cf6", "is_new": True, "badge": "AI", "order": 5},
        {"slug": "nirmako",      "name": "Nirmako",       "tagline": "Construction Cost Estimating Software",   "icon_name": "HardHat",       "icon_color": "#ef4444", "order": 6},
        {"slug": "crm-pro",      "name": "CRM Pro",       "tagline": "Customer Relationship Management",        "icon_name": "Contact",       "icon_color": "#06b6d4", "order": 7},
        {"slug": "docuvault",    "name": "DocuVault",     "tagline": "Document Management System",              "icon_name": "FileStack",     "icon_color": "#64748b", "order": 8},
    ]},
    {"category": {"name": "Hotel & Restaurant", "slug": "hotel-restaurant", "icon_name": "Hotel", "order": 2}, "products": [
        {"slug": "hotelos",    "name": "HotelOS",     "tagline": "Property Management System",          "icon_name": "Hotel",          "icon_color": "#6366f1", "is_featured": True, "order": 1},
        {"slug": "restopos",   "name": "RestoPOS",    "tagline": "Restaurant POS & Kitchen Display",    "icon_name": "UtensilsCrossed","icon_color": "#ef4444", "is_featured": True, "order": 2},
        {"slug": "tablebook",  "name": "TableBook",   "tagline": "Online Table Reservation Platform",   "icon_name": "CalendarCheck",  "icon_color": "#f59e0b", "order": 3},
        {"slug": "menumaster", "name": "MenuMaster",  "tagline": "Digital Menu & QR Ordering",          "icon_name": "MenuSquare",     "icon_color": "#10b981", "is_new": True, "order": 4},
    ]},
    {"category": {"name": "FinTech", "slug": "fintech", "icon_name": "BarChart2", "order": 3}, "products": [
        {"slug": "tradedesk-oms", "name": "TradeDesk OMS", "tagline": "Multi-Asset Order Management System",    "icon_name": "TrendingUp", "icon_color": "#8b5cf6", "is_featured": True, "badge": "Enterprise", "order": 1},
        {"slug": "riskmatrix",    "name": "RiskMatrix",    "tagline": "Real-Time Risk Management System",       "icon_name": "Shield",     "icon_color": "#ef4444", "is_featured": True, "order": 2},
        {"slug": "algoengine",    "name": "AlgoEngine",    "tagline": "Algorithmic Trading Infrastructure",     "icon_name": "Zap",        "icon_color": "#f59e0b", "badge": "HFT", "order": 3},
        {"slug": "paygate",       "name": "PayGate",       "tagline": "Payment Gateway & Processing",           "icon_name": "Wallet",     "icon_color": "#10b981", "is_new": True, "order": 4},
        {"slug": "portfolioiq",   "name": "PortfolioIQ",   "tagline": "Portfolio Management & Analytics",       "icon_name": "Briefcase",  "icon_color": "#6366f1", "order": 5},
    ]},
    {"category": {"name": "E-Commerce", "slug": "ecommerce", "icon_name": "ShoppingCart", "order": 4}, "products": [
        {"slug": "marketx",    "name": "MarketX",     "tagline": "Multi-Vendor Marketplace Platform",          "icon_name": "ShoppingCart", "icon_color": "#f59e0b", "is_featured": True, "order": 1},
        {"slug": "shopengine", "name": "ShopEngine",  "tagline": "Headless E-Commerce Platform",               "icon_name": "ShoppingBag",  "icon_color": "#8b5cf6", "is_featured": True, "badge": "AI", "order": 2},
        {"slug": "stockhub",   "name": "StockHub",    "tagline": "Multi-Channel Inventory & Order Management",  "icon_name": "Boxes",        "icon_color": "#0ea5e9", "order": 3},
    ]},
    {"category": {"name": "Education", "slug": "education", "icon_name": "GraduationCap", "order": 5}, "products": [
        {"slug": "schoolos",    "name": "SchoolOS",    "tagline": "K-12 School Management ERP",               "icon_name": "GraduationCap", "icon_color": "#6366f1", "is_featured": True, "order": 1},
        {"slug": "unierp",      "name": "UniERP",      "tagline": "University Management System",              "icon_name": "BookOpen",      "icon_color": "#10b981", "is_featured": True, "order": 2},
        {"slug": "learniq-lms", "name": "LearnIQ LMS", "tagline": "AI-Powered Learning Management System",    "icon_name": "ClipboardList", "icon_color": "#8b5cf6", "badge": "AI", "is_new": True, "order": 3},
        {"slug": "exampro",     "name": "ExamPro",     "tagline": "Online Exam & Assessment Portal",           "icon_name": "PenLine",       "icon_color": "#ef4444", "badge": "AI", "order": 4},
    ]},
    {"category": {"name": "Healthcare", "slug": "healthcare", "icon_name": "Heart", "order": 6}, "products": [
        {"slug": "hospital-erp",  "name": "Hospital ERP",  "tagline": "End-to-End Hospital Management System",    "icon_name": "Heart",       "icon_color": "#ef4444", "is_featured": True, "badge": "FHIR R4", "order": 1},
        {"slug": "telemed",       "name": "TeleMed",       "tagline": "Telemedicine & Video Consultation",         "icon_name": "Stethoscope", "icon_color": "#10b981", "is_featured": True, "order": 2},
        {"slug": "doctorfinder",  "name": "DoctorFinder",  "tagline": "Doctor Directory & Appointment Platform",   "icon_name": "UserSearch",  "icon_color": "#6366f1", "order": 3},
        {"slug": "healthrecords", "name": "HealthRecords", "tagline": "Personal Health Record (PHR) Platform",     "icon_name": "FileHeart",   "icon_color": "#8b5cf6", "badge": "AI", "is_new": True, "order": 4},
    ]},
    {"category": {"name": "News Portal", "slug": "news-portal", "icon_name": "Newspaper", "order": 7}, "products": [
        {"slug": "newscms",     "name": "NewsCMS",     "tagline": "Modern News & Media Content Platform", "icon_name": "Newspaper", "icon_color": "#0ea5e9", "is_featured": True, "order": 1},
        {"slug": "multiportal", "name": "MultiPortal", "tagline": "Multi-Brand News Network",             "icon_name": "Globe",     "icon_color": "#8b5cf6", "order": 2},
    ]},
    {"category": {"name": "Online Reservation", "slug": "online-reservation", "icon_name": "CalendarDays", "order": 8}, "products": [
        {"slug": "booknow",   "name": "BookNow",   "tagline": "Universal Online Booking Platform", "icon_name": "CalendarDays", "icon_color": "#10b981", "is_featured": True, "order": 1},
        {"slug": "eventflow", "name": "EventFlow", "tagline": "Event Ticketing & Management",      "icon_name": "Ticket",       "icon_color": "#6366f1", "order": 2},
    ]},
    {"category": {"name": "AI Suite", "slug": "ai-suite", "icon_name": "Brain", "order": 9}, "products": [
        {"slug": "askai",     "name": "AskAI",      "tagline": "Conversational AI Assistant Platform",  "icon_name": "MessageCircleMore", "icon_color": "#8b5cf6", "is_featured": True, "badge": "AI", "is_new": True, "order": 1},
        {"slug": "supportbot","name": "SupportBot", "tagline": "AI Customer Support Automation",        "icon_name": "HelpCircle",        "icon_color": "#10b981", "badge": "AI", "order": 2},
        {"slug": "docuai",    "name": "DocuAI",     "tagline": "Intelligent Document Processing",       "icon_name": "Brain",             "icon_color": "#6366f1", "badge": "AI", "order": 3},
        {"slug": "predictiq", "name": "PredictIQ",  "tagline": "Predictive Analytics Platform",         "icon_name": "Zap",               "icon_color": "#f59e0b", "badge": "AI", "order": 4},
    ]},
    {"category": {"name": "Templates", "slug": "templates", "icon_name": "LayoutTemplate", "order": 10}, "products": [
        {"slug": "sitecraft-pro", "name": "SiteCraft Pro", "tagline": "Premium Website Template Pack",       "icon_name": "LayoutTemplate", "icon_color": "#6366f1", "is_featured": True, "order": 1},
        {"slug": "adminkit",      "name": "AdminKit",      "tagline": "React Admin Dashboard Templates",     "icon_name": "Globe",          "icon_color": "#0ea5e9", "order": 2},
    ]},
]


def seed_catalog(apps, schema_editor):
    ProductCategory = apps.get_model("products", "ProductCategory")
    Product = apps.get_model("products", "Product")

    # Only seed if tables are empty (idempotent — safe on re-runs)
    if Product.objects.exists():
        return

    for entry in CATALOG:
        cat_data = entry["category"]
        cat, _ = ProductCategory.objects.get_or_create(
            slug=cat_data["slug"],
            defaults={k: v for k, v in cat_data.items() if k != "slug"},
        )
        for p in entry["products"]:
            defaults = {k: v for k, v in p.items() if k != "slug"}
            defaults["category"] = cat
            Product.objects.get_or_create(slug=p["slug"], defaults=defaults)


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_product_nav_section"),
    ]

    operations = [
        migrations.RunPython(seed_catalog, migrations.RunPython.noop),
    ]
