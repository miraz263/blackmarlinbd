from django.core.management.base import BaseCommand
from apps.projects.models import Category, Project


OMS_DESCRIPTION = """
## Overview

The **Order Management System (OMS)** is an enterprise-grade platform engineered for high-volume e-commerce and retail operations. It centralises order lifecycle management — from placement through fulfilment and return — across multiple sales channels including web, mobile, marketplace, and POS.

## Problem Statement

The client (a multi-brand retail group) was running four disconnected systems: a legacy ERP for inventory, a Shopify store, a custom warehouse portal, and a manual returns desk. Orders fell through the gaps, inventory counts diverged, and customer support had no single source of truth. Peak-season throughput was capped at ~800 orders/hour before the system buckled.

## Solution Architecture

### Backend
- **Django REST Framework** powers the API layer with multi-tenant support via schema-based PostgreSQL isolation
- **Celery + Redis** handles async order processing, webhook dispatch, and scheduled inventory sync jobs
- **Event-driven architecture**: every state transition publishes to a Redis Streams bus; downstream services (warehouse WMS, courier integrations, analytics) consume independently
- **gRPC** internal service calls for sub-10 ms latency between the order engine and inventory service

### Frontend Dashboard
- **React 18 + TypeScript** single-page application
- **TanStack Query** for server-state management with optimistic updates
- Real-time order board via **WebSocket** (Django Channels)
- Role-based views: admin, warehouse operator, customer support, finance

### Integrations
- **Payment gateways**: Stripe, SSLCommerz, bKash, Nagad
- **Courier APIs**: Pathao, Steadfast, RedX (Bangladesh); DHL, FedEx (international)
- **Accounting**: QuickBooks sync via OAuth 2.0
- **Notifications**: Twilio SMS, SendGrid email, Firebase push

## Key Features

| Feature | Detail |
|---|---|
| Multi-channel ingestion | Web, mobile app, marketplace webhooks, manual entry |
| Real-time inventory | Warehouse bin-level stock, auto reserve on order |
| Smart routing | Rules engine assigns warehouse and courier per order weight/zone |
| Returns & RMA | Customer portal + warehouse scan workflow |
| Reporting | Live GMV dashboard, fulfilment SLA tracker, courier performance |
| Audit trail | Immutable event log for every order state change |

## Performance Results

- Sustained **3,200 orders/hour** at peak (4× improvement)
- Order-to-dispatch time reduced from **48 h → 6 h** average
- Inventory accuracy improved from 87 % → **99.4 %**
- Support ticket volume down **38 %** due to self-service tracking portal

## Tech Stack Details

The system is containerised with Docker Compose for local development and deployed on AWS ECS Fargate with auto-scaling. A CloudFront CDN fronts the React SPA and media assets. RDS PostgreSQL with read replicas handles the database tier; ElastiCache Redis handles caching and the message bus.
""".strip()


class Command(BaseCommand):
    help = "Seed demo projects (OMS and supporting entries)"

    def handle(self, *args, **options):
        # --- Categories ---
        web_cat, _ = Category.objects.get_or_create(
            slug="web-application",
            defaults={
                "name": "Web Application",
                "description": "Full-stack web applications and dashboards",
                "icon": "Globe",
                "color": "#6366f1",
            },
        )
        enterprise_cat, _ = Category.objects.get_or_create(
            slug="enterprise-software",
            defaults={
                "name": "Enterprise Software",
                "description": "Large-scale enterprise platforms and integrations",
                "icon": "Building2",
                "color": "#0ea5e9",
            },
        )
        ai_cat, _ = Category.objects.get_or_create(
            slug="ai-ml",
            defaults={
                "name": "AI & ML",
                "description": "Artificial intelligence and machine learning projects",
                "icon": "Brain",
                "color": "#8b5cf6",
            },
        )
        self.stdout.write(self.style.SUCCESS("Categories ready"))

        # --- OMS Project ---
        oms, created = Project.objects.get_or_create(
            slug="order-management-system",
            defaults={
                "title": "Order Management System (OMS)",
                "short_description": (
                    "Enterprise OMS handling 3,200+ orders/hour across web, mobile, "
                    "and marketplace channels — with real-time inventory, smart courier "
                    "routing, and a full returns workflow."
                ),
                "description": OMS_DESCRIPTION,
                "category": enterprise_cat,
                "tech_stack": [
                    "Django", "Django REST Framework", "Celery", "Redis",
                    "PostgreSQL", "React", "TypeScript", "TanStack Query",
                    "WebSocket", "Django Channels", "Docker", "AWS ECS",
                    "Stripe", "gRPC",
                ],
                "demo_url": "https://oms-demo.blackmarlinbd.com",
                "github_url": "",
                "case_study_url": "",
                "status": Project.Status.PUBLISHED,
                "is_featured": True,
                "order": 1,
                "client_name": "Multi-Brand Retail Group",
                "completion_date": "2024-09-30",
            },
        )
        if created:
            oms.tags.add(
                "order-management", "e-commerce", "enterprise", "real-time",
                "multi-channel", "inventory", "fulfilment", "django", "react",
            )
            self.stdout.write(self.style.SUCCESS(f"Created: {oms.title}"))
        else:
            self.stdout.write(self.style.WARNING(f"Already exists: {oms.title}"))

        # --- AI Fraud Detection Project ---
        fraud, created = Project.objects.get_or_create(
            slug="ai-fraud-detection-engine",
            defaults={
                "title": "AI Fraud Detection Engine",
                "short_description": (
                    "Real-time transaction fraud detection using ensemble ML models, "
                    "processing 10k+ events/second with sub-50 ms latency and 99.2 % accuracy."
                ),
                "description": (
                    "A production ML pipeline that scores every financial transaction in real time. "
                    "Features include: XGBoost + neural network ensemble, explainable AI (SHAP) for "
                    "analyst review, automated model retraining on drift detection, and a case "
                    "management dashboard for the fraud ops team. Deployed on AWS SageMaker with "
                    "Kafka for event streaming."
                ),
                "category": ai_cat,
                "tech_stack": [
                    "Python", "XGBoost", "TensorFlow", "Kafka", "AWS SageMaker",
                    "FastAPI", "React", "PostgreSQL", "Redis", "Docker",
                ],
                "demo_url": "",
                "github_url": "",
                "case_study_url": "",
                "status": Project.Status.PUBLISHED,
                "is_featured": True,
                "order": 2,
                "client_name": "FinTech Solutions Ltd.",
                "completion_date": "2024-06-30",
            },
        )
        if created:
            fraud.tags.add(
                "machine-learning", "fraud-detection", "fintech", "real-time",
                "kafka", "aws", "xgboost",
            )
            self.stdout.write(self.style.SUCCESS(f"Created: {fraud.title}"))
        else:
            self.stdout.write(self.style.WARNING(f"Already exists: {fraud.title}"))

        # --- Multi-Tenant SaaS Dashboard ---
        saas, created = Project.objects.get_or_create(
            slug="multi-tenant-saas-dashboard",
            defaults={
                "title": "Multi-Tenant SaaS Dashboard",
                "short_description": (
                    "White-label analytics and reporting SaaS serving 200+ tenants, "
                    "with schema-based isolation, custom branding per tenant, and "
                    "role-based access control."
                ),
                "description": (
                    "A fully white-labeled SaaS platform built for a data analytics company. "
                    "Each tenant gets an isolated PostgreSQL schema, custom domain, logo, and "
                    "colour theme. The platform supports 50+ pre-built report templates, "
                    "drag-and-drop dashboard builder, scheduled email reports, and a public "
                    "API for data ingestion. Built with Django (multi-tenant), Next.js, and "
                    "deployed on Kubernetes."
                ),
                "category": web_cat,
                "tech_stack": [
                    "Django", "django-tenants", "Next.js", "TypeScript",
                    "PostgreSQL", "Redis", "Kubernetes", "Nginx", "Celery",
                    "Chart.js", "Tailwind CSS",
                ],
                "demo_url": "https://saas-demo.blackmarlinbd.com",
                "github_url": "",
                "case_study_url": "",
                "status": Project.Status.PUBLISHED,
                "is_featured": True,
                "order": 3,
                "client_name": "DataViz Analytics",
                "completion_date": "2025-01-15",
            },
        )
        if created:
            saas.tags.add(
                "saas", "multi-tenant", "analytics", "dashboard",
                "white-label", "nextjs", "django", "kubernetes",
            )
            self.stdout.write(self.style.SUCCESS(f"Created: {saas.title}"))
        else:
            self.stdout.write(self.style.WARNING(f"Already exists: {saas.title}"))

        self.stdout.write(self.style.SUCCESS("\nDone. All demo projects seeded."))
