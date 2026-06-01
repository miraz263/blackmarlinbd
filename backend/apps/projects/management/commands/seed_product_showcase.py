from django.core.management.base import BaseCommand
from apps.projects.models import Category, Project

# ─── Project descriptions ──────────────────────────────────────────────────────

HR_MANAGER_DESC = """
## Overview

**BlackMarlin HR Manager** is a complete hire-to-retire human resource platform deployed for Apex Textile Group, one of Bangladesh's largest garment manufacturers with 12,000+ employees across 7 factories.

## The Challenge

Apex Textile was managing payroll via Excel, tracking attendance through punch cards, and storing employee documents in physical filing cabinets. Processing monthly payroll for 12,000 employees took 6 days and produced frequent errors. Statutory deductions (provident fund, income tax, EOBI) were calculated manually, creating compliance risk.

## Solution

BlackMarlin HR Manager was deployed in a phased rollout over 90 days:

### Core Modules
- **Employee Records** — Digital employee files with documents, contracts, and photos
- **Payroll Engine** — Multi-grade salary structures with Bangladesh statutory compliance (PF, income tax, festival bonus)
- **Attendance** — Biometric device integration (ZKTeco) pulling clock-in/out data in real time
- **Leave Management** — Configurable leave policies per grade with mobile self-service
- **Performance** — 360° appraisal cycles with calibration committee workflow
- **Recruitment** — Job posting, applicant tracking, and offer letter generation

### Technical Architecture
- **Backend**: Django REST Framework + PostgreSQL (multi-tenant per factory unit)
- **Mobile App**: React Native — offline-capable attendance and leave requests
- **Integrations**: ZKTeco biometric API, bKash payroll disbursement, NBR e-TDS for tax filing
- **Deployment**: On-premises bare metal + replicated offsite backup (client requirement)

## Results

| Metric | Before | After |
|---|---|---|
| Payroll processing time | 6 days | 4 hours |
| Payroll error rate | ~3% | <0.1% |
| Leave request cycle time | 5 days | Same day |
| Statutory compliance | Manual | Automated filing |
| Employee self-service adoption | 0% | 78% |

## Technologies Used

Django · PostgreSQL · React · React Native · Redis · ZKTeco SDK · bKash API · Docker
"""

ERP_DESC = """
## Overview

BlackMarlin **Enterprise ERP** powers the full back-office of Rahman Brothers Trading Co., a Dhaka-based import-distribution conglomerate managing 4 business units, 200+ staff, and BDT 800 Cr annual revenue.

## Problem Statement

Rahman Brothers ran 7 separate software tools — a Tally installation per entity, a custom stock system, an Excel-based procurement tracker, and QuickBooks for one subsidiary. Consolidating monthly financials took 3 weeks. Inventory transfers between warehouses were tracked via WhatsApp messages.

## Solution Architecture

### Modules Deployed

| Module | Description |
|---|---|
| General Ledger | Multi-entity chart of accounts, real-time P&L and balance sheet |
| Accounts Payable / Receivable | Invoice approval workflow, aging reports, bank reconciliation |
| Inventory | 5 warehouse locations, bin-level tracking, FIFO/LIFO costing |
| Procurement | RFQ → PO → GRN → invoice 3-way match |
| Sales | Quotation → SO → delivery → invoice → collection |
| Fixed Assets | Asset register, depreciation schedules, disposal workflow |
| Reporting | 50+ built-in reports, custom report builder, Excel export |

### Technical Stack
- **Backend**: Django REST Framework, PostgreSQL 15 with row-level security per entity
- **Frontend**: React 18, TypeScript, TanStack Query, AG Grid for data tables
- **Job Queue**: Celery + Redis for scheduled reports and email alerts
- **Auth**: JWT + RBAC — 18 roles across 4 entities
- **Deployment**: Docker Compose on AWS EC2 with RDS PostgreSQL

## Key Outcomes

- Month-end close compressed from **3 weeks → 2 days**
- Eliminated **7 legacy tools** — single source of financial truth
- Inter-company transfer reconciliation reduced from **3 days → automated**
- 98% invoice-to-payment traceability vs 55% previously

## Technologies

Django · PostgreSQL · React · TypeScript · Celery · Redis · AG Grid · Docker · AWS
"""

SCHOOL_OS_DESC = """
## Overview

**BlackMarlin SchoolOS** is a comprehensive K-12 school management ERP deployed at Sunshine International School & College, Chittagong — serving 3,200 students across nursery to HSC.

## Challenge

Sunshine was using paper registers for attendance, Excel for fee tracking, and a basic SMS service for parent communication. End-of-term result processing required 4 admin staff working continuously for 2 weeks. Fee defaulters were identified only at term-end.

## What We Built

### Modules
- **Admissions** — Online application, entrance test scheduling, document checklist, and digital enrolment
- **Timetable** — Automated timetable generation respecting teacher availability, room capacity, and subject requirements
- **Attendance** — Teacher marks attendance on tablet; absent students get SMS to parents within 5 minutes
- **Gradebook** — Continuous assessment, mid-term, and final marks with custom grading scales
- **Fee Management** — Fee structure per class, online payment (bKash/Nagad/card), automatic reminders, defaulter reports
- **Parent Portal** — Mobile app (iOS + Android) for attendance, results, fee receipts, and school announcements
- **Library** — Book cataloguing, issue/return, fine calculation, and barcode scanning

### Architecture
- **Backend**: Django + PostgreSQL, school isolated per subdomain
- **Frontend**: React (admin + teacher) + React Native (parent mobile app)
- **Notifications**: Firebase FCM push + Twilio SMS
- **Payment**: SSLCommerz integration for online fee collection
- **Reports**: PDF generation via WeasyPrint — TC, result cards, fee receipts

## Impact

| Metric | Before | After |
|---|---|---|
| Attendance notification delay | Next day | 5 minutes |
| Result processing time | 2 weeks | 2 hours |
| Fee collection (online) | 0% | 64% |
| Parent app engagement | N/A | 2,100 active users |
| Admin FTE for fee tracking | 2 full-time | 0.5 part-time |

## Technologies

Django · PostgreSQL · React · React Native · Firebase · SSLCommerz · Twilio · WeasyPrint · Docker
"""

RESTO_POS_DESC = """
## Overview

**BlackMarlin RestoPOS** runs the point-of-sale and kitchen operations for Urban Bites — a 12-outlet fast-casual restaurant chain in Dhaka and Chittagong processing 2,000+ orders daily.

## The Problem

Urban Bites was running a legacy desktop POS that went offline whenever the internet dropped — causing lost orders and manual workarounds. Kitchen staff had no display; orders were shouted or printed on paper. Split bills and table transfers frustrated staff and customers equally.

## Solution

RestoPOS was deployed with a 4-week training and go-live plan across all 12 outlets:

### Core Features
- **Cloud POS with Offline Mode** — IndexedDB queues orders locally; syncs when connectivity restores. No orders lost.
- **Kitchen Display System (KDS)** — Wall-mounted tablets per kitchen station; orders appear in real time, colour-coded by age
- **Table Management** — Interactive floor plan; drag-and-drop table merge, transfer, and split
- **Modifier & Combo Builder** — Configurable modifiers (size, extras, removes) and meal combo pricing
- **Split Billing** — Split by item, by person, or custom amount; pay each split with different methods
- **Loyalty Programme** — Points accrual and redemption with customer phone number lookup
- **Live Dashboard** — Outlet manager sees live revenue, order count, average ticket, and kitchen queue depth

### Tech Stack
- **Frontend**: React + TypeScript PWA (installable on any Android tablet)
- **Backend**: Django REST Framework + PostgreSQL per outlet cluster
- **Real-time**: Django Channels + WebSocket for KDS and order synchronisation
- **Offline**: Service Worker + IndexedDB (Dexie.js)
- **Payments**: bKash, Nagad, card via SSLCommerz, cash
- **Hardware**: Star Micronics thermal printers via WebUSB; standard Android tablets

## Results

- Order error rate: **2.8% → 0.3%** (KDS eliminated verbal miscommunication)
- Average order time: **4.2 min → 2.7 min** (26% faster)
- Internet outage incidents resolved without lost orders: **100%**
- Monthly revenue variance from manual tracking: **eliminated**

## Technologies

React · TypeScript · Django · PostgreSQL · Django Channels · Service Workers · Dexie.js · WebUSB · SSLCommerz · bKash
"""

HOSPITAL_ERP_DESC = """
## Overview

**BlackMarlin Hospital ERP** is a full-featured hospital management system deployed at Comfort Care General Hospital, Sylhet — a 250-bed private hospital with 8 departments, 60 doctors, and 500+ daily OPD visits.

## The Challenge

Comfort Care was operating on a 15-year-old DOS-based billing system, paper OPD cards, manual pharmacy stock tracking, and no electronic health records. Patient wait times were excessive, drug stockouts caused prescription failures, and billing disputes were common due to lack of audit trail.

## Solution Delivered

### Clinical Modules
| Module | Capability |
|---|---|
| OPD Management | Registration, token queue, doctor consultation, prescription e-print |
| IPD Management | Admission, ward/bed allocation, nursing rounds, discharge summary |
| Electronic Medical Records | Structured EMR with vitals, diagnosis (ICD-10), medications, lab orders |
| Emergency | Triage scoring, rapid registration, ED board |
| Operation Theatre | OT scheduling, pre-op checklist, implant tracking |

### Ancillary Modules
| Module | Capability |
|---|---|
| Laboratory | Test ordering, result entry, critical value alerts, LIS integration |
| Radiology | DICOM worklist, report template, image viewer link |
| Pharmacy | Formulary, dispensing workflow, expiry alerts, batch tracking |
| Billing | Itemised billing, insurance pre-auth, co-pay split |

### Technical Architecture
- **Backend**: Django REST Framework, PostgreSQL with FHIR R4 resource models
- **HL7 / FHIR**: R4 compliant APIs for interoperability with national health registry
- **Real-time**: WebSocket for OPD queue display boards and bed status
- **Reporting**: Crystal-style PDF reports via WeasyPrint
- **Deployment**: On-premises VMware cluster + daily encrypted backups to S3

## Outcomes

- OPD patient wait time: **45 min → 12 min**
- Pharmacy stockout incidents: **18/month → 1/month**
- Billing dispute rate: **7% → 0.4%**
- Prescription fulfilment tracking: now 100% auditable
- FHIR R4 ready for national HIE integration

## Technologies

Django · PostgreSQL · FHIR R4 · HL7 · React · Django Channels · WeasyPrint · DICOM · Docker · VMware
"""

MARKET_X_DESC = """
## Overview

**BlackMarlin MarketX** powers ShopBazaar.com.bd — a multi-vendor B2C marketplace launched in Dhaka with 850+ registered vendors, 120,000 SKUs, and 15,000 monthly orders at peak.

## The Need

ShopBazaar's founders wanted to build Bangladesh's equivalent of Daraz — a third-party marketplace where vendors manage their own inventory and orders, with the platform handling payments, logistics, and dispute resolution. Building this from scratch would have taken 18+ months. MarketX was deployed and customised in 14 weeks.

## What MarketX Provides

### Vendor Side
- **Vendor Onboarding Portal**: Business registration, NID/TIN upload, bank account verification, and contract e-sign
- **Vendor Dashboard**: Product listing with AI-assisted description generation, inventory management, order fulfilment, earnings, and withdrawal requests
- **Commission Engine**: Category-based commission rates (8%–22%), promotional commission periods, and coupon co-funding rules

### Customer Side
- **Storefront**: Server-side rendered Next.js for SEO; AI product recommendations via collaborative filtering
- **Search**: Elasticsearch-powered full-text + faceted search with spelling correction
- **Reviews**: Verified-purchase review system with photo upload and vendor response
- **Tracking**: Real-time order status with integrated courier tracking (Pathao, Steadfast, RedX)

### Platform Ops
- **Dispute Resolution**: Buyer–seller dispute workflow with evidence upload, admin adjudication, and auto-refund
- **Promotions**: Flash sales, vouchers, bundle discounts, and sponsored product slots
- **Finance**: Automated vendor payouts via bank transfer every 14 days after delivery confirmation

### Tech Stack
- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS
- **Backend**: Django REST Framework, PostgreSQL, Redis
- **Search**: Elasticsearch 8
- **Queue**: Celery + Redis
- **Storage**: AWS S3 + CloudFront CDN
- **Payments**: SSLCommerz, bKash, Nagad
- **Deployment**: AWS EKS (Kubernetes)

## Scale Metrics

| Metric | Value |
|---|---|
| Vendors | 850+ |
| SKUs | 120,000+ |
| Peak orders/day | 500 |
| Page load (LCP) | 1.2s |
| Search response time | <120ms |

## Technologies

Next.js · React · Django · PostgreSQL · Elasticsearch · Redis · Celery · AWS EKS · S3 · CloudFront · SSLCommerz
"""

LEARNIQ_DESC = """
## Overview

**BlackMarlin LearnIQ LMS** is an AI-powered learning management system deployed for BrightMinds EdTech, offering 200+ online courses to 45,000 learners across Bangladesh, India, and the UAE.

## The Problem

BrightMinds was hosting course videos on Vimeo, issuing certificates via Canva, tracking completion in Google Sheets, and managing payments through manual bank transfer — a patchwork that couldn't scale beyond 5,000 learners.

## Platform Capabilities

### Learner Experience
- **Adaptive Learning Paths**: AI analyses quiz performance and adjusts next module recommendations to address weak areas
- **Live Classes**: Integrated video conferencing (Whereby embed) with attendance recording and recording archive
- **AI Tutor**: RAG-based chatbot answers questions using course content as knowledge base; cites specific lesson timestamps
- **Offline Mode**: Mobile app caches video (up to 5 GB) for offline viewing; progress syncs on reconnect

### Instructor Tools
- **Course Builder**: Drag-and-drop builder with video upload, SCORM import, quiz editor, and assignment rubrics
- **Analytics Dashboard**: Learner progress, completion rates, quiz score distributions, and engagement heatmaps
- **Cohort Management**: Batch enrolment, group assignments, and cohort-specific announcements

### Platform Operations
- **Payments**: Stripe (international) + bKash/Nagad (BD local) with instalment plan support
- **Certificates**: Auto-generated PDF certificates with QR verification code
- **Affiliate System**: Instructor revenue sharing and affiliate link tracking
- **Multi-language**: Course content in Bengali and English; UI localised for both

### Technical Architecture
- **Backend**: Django REST Framework + PostgreSQL
- **AI Tutor**: LangChain + OpenAI GPT-4 + Pinecone vector store for RAG
- **Video**: AWS MediaConvert for transcoding; CloudFront for adaptive bitrate delivery (HLS)
- **Mobile**: React Native (iOS + Android)
- **Real-time**: Django Channels for live class chat and Q&A
- **Deployment**: AWS ECS Fargate with auto-scaling

## Results

- Learner base scaled from 5,000 → **45,000** in 14 months
- Course completion rate: **34% → 61%** (AI adaptive paths)
- Support tickets about course access: **-82%** (self-service improved)
- Certificate issuance: fully automated (was 3-day manual process)

## Technologies

Django · PostgreSQL · React Native · LangChain · GPT-4 · Pinecone · AWS ECS · MediaConvert · CloudFront · Stripe · bKash
"""

TRADEDESK_DESC = """
## Overview

**BlackMarlin TradeDesk OMS** is a multi-asset order management system deployed at Pinnacle Securities Ltd., a Dhaka-based brokerage processing equities, fixed income, and mutual fund orders on Dhaka Stock Exchange (DSE) and Chittagong Stock Exchange (CSE).

## Context

Pinnacle's legacy OMS was a decade-old Windows desktop application that couldn't handle the 2023 DSE peak volumes (12,000 trades/day), had no API for algo clients, and required manual intervention for order amendments. Regulatory pressure from BSEC for electronic audit trails also required a platform upgrade.

## What Was Deployed

### Order Management Core
- **FIX 4.4 Gateway**: Connects to DSE/CSE trading engines via FIX protocol; handles new order, cancel, replace, and execution reports
- **Multi-Asset**: Equities, Government T-Bills/Bonds, mutual fund units, and block trades
- **Order Types**: Market, limit, stop, stop-limit, VWAP algo, TWAP algo, iceberg
- **Pre-Trade Risk**: Per-client buying power check, single-order size limit, daily loss limit, and concentration limit — all enforced in <2 ms

### Client-Facing Modules
- **Web Trading Terminal**: React SPA with real-time order book, depth of market, portfolio P&L, and order blotter
- **Mobile App**: React Native — watch-list, quotes, and order entry; biometric authentication
- **Algo API**: REST + WebSocket API for algorithmic clients (hedge funds, prop desks)

### Back Office
- **Trade Reconciliation**: Auto-match executed trades against broker clearing reports
- **Contract Note Generation**: PDF contract notes per trade with digital signature
- **Regulatory Reporting**: BSEC daily trade report, suspicious transaction flagging (AML rules)

### Technical Architecture
- **Order Engine**: Python (asyncio) + QuickFIX for FIX session management; sub-5 ms order latency to exchange
- **Backend API**: Django REST Framework + PostgreSQL with time-series partitioning for tick data
- **Real-time**: Redis Pub/Sub for market data distribution; WebSocket to 500+ concurrent clients
- **Compliance**: Immutable audit log in append-only PostgreSQL schema + S3 archive
- **Deployment**: Co-located servers at DSE data centre for minimum network latency

## Performance

| KPI | Value |
|---|---|
| Order-to-exchange latency | <5 ms (99th percentile) |
| Peak orders/day | 28,000 |
| Concurrent web clients | 500+ |
| Pre-trade risk check | <2 ms |
| Regulatory report accuracy | 100% (BSEC-audited) |

## Technologies

Python · asyncio · QuickFIX · Django · PostgreSQL · Redis · React · React Native · FIX 4.4 · Docker · co-location
"""


class Command(BaseCommand):
    help = "Seed product showcase projects demonstrating BlackMarlin's own deployed software"

    def handle(self, *args, **options):
        # ── Categories ────────────────────────────────────────────────────────
        cat_enterprise, _ = Category.objects.get_or_create(
            name="Enterprise Software",
            defaults={"slug": "enterprise-software", "color": "#6366f1"},
        )
        cat_fintech, _ = Category.objects.get_or_create(
            name="FinTech",
            defaults={"slug": "fintech", "color": "#10b981"},
        )
        cat_ecommerce, _ = Category.objects.get_or_create(
            name="E-Commerce",
            defaults={"slug": "ecommerce", "color": "#f59e0b"},
        )
        cat_healthcare, _ = Category.objects.get_or_create(
            name="Healthcare",
            defaults={"slug": "healthcare", "color": "#ef4444"},
        )
        cat_education, _ = Category.objects.get_or_create(
            name="Education",
            defaults={"slug": "education", "color": "#8b5cf6"},
        )
        cat_hospitality, _ = Category.objects.get_or_create(
            name="Hospitality",
            defaults={"slug": "hospitality", "color": "#0ea5e9"},
        )

        # ── Projects ──────────────────────────────────────────────────────────
        projects = [
            {
                "title": "HR Manager — Apex Textile Group",
                "slug": "hr-manager-apex-textile",
                "tagline": "Payroll for 12,000 employees. 6 days → 4 hours.",
                "description": HR_MANAGER_DESC,
                "category": cat_enterprise,
                "tech_stack": ["Django", "PostgreSQL", "React", "React Native", "Redis", "ZKTeco SDK", "bKash API", "Docker"],
                "tags": ["HR", "Payroll", "Attendance", "Bangladesh", "Garments"],
                "client": "Apex Textile Group",
                "completion_date": "2024-03-15",
                "demo_url": "https://demo.blackmarlinbd.com/hr-manager",
                "github_url": "",
                "is_featured": True,
                "order": 10,
            },
            {
                "title": "Enterprise ERP — Rahman Brothers Trading",
                "slug": "erp-rahman-brothers",
                "tagline": "7 tools unified. Month-end close: 3 weeks → 2 days.",
                "description": ERP_DESC,
                "category": cat_enterprise,
                "tech_stack": ["Django", "PostgreSQL", "React", "TypeScript", "Celery", "Redis", "AG Grid", "AWS"],
                "tags": ["ERP", "Accounting", "Inventory", "Multi-entity", "Trading"],
                "client": "Rahman Brothers Trading Co.",
                "completion_date": "2024-06-30",
                "demo_url": "https://demo.blackmarlinbd.com/erp",
                "github_url": "",
                "is_featured": True,
                "order": 20,
            },
            {
                "title": "SchoolOS — Sunshine International School",
                "slug": "schoolos-sunshine",
                "tagline": "3,200 students. Result processing: 2 weeks → 2 hours.",
                "description": SCHOOL_OS_DESC,
                "category": cat_education,
                "tech_stack": ["Django", "PostgreSQL", "React", "React Native", "Firebase", "SSLCommerz", "Twilio", "Docker"],
                "tags": ["Education", "K-12", "School ERP", "Parent App", "Fee Management"],
                "client": "Sunshine International School & College",
                "completion_date": "2024-01-20",
                "demo_url": "https://demo.blackmarlinbd.com/schoolos",
                "github_url": "",
                "is_featured": True,
                "order": 30,
            },
            {
                "title": "RestoPOS — Urban Bites (12 Outlets)",
                "slug": "restopos-urban-bites",
                "tagline": "2,000 orders/day. Order errors: 2.8% → 0.3%.",
                "description": RESTO_POS_DESC,
                "category": cat_hospitality,
                "tech_stack": ["React", "TypeScript", "Django", "PostgreSQL", "Django Channels", "Service Workers", "Dexie.js", "WebUSB"],
                "tags": ["Restaurant", "POS", "Kitchen Display", "Offline", "Multi-outlet"],
                "client": "Urban Bites Restaurant Group",
                "completion_date": "2023-11-10",
                "demo_url": "https://demo.blackmarlinbd.com/restopos",
                "github_url": "",
                "is_featured": True,
                "order": 40,
            },
            {
                "title": "Hospital ERP — Comfort Care General Hospital",
                "slug": "hospital-erp-comfort-care",
                "tagline": "250-bed HMS. OPD wait time: 45 min → 12 min.",
                "description": HOSPITAL_ERP_DESC,
                "category": cat_healthcare,
                "tech_stack": ["Django", "PostgreSQL", "FHIR R4", "HL7", "React", "Django Channels", "WeasyPrint", "DICOM", "Docker"],
                "tags": ["Hospital", "HMS", "EMR", "FHIR R4", "Pharmacy", "Lab"],
                "client": "Comfort Care General Hospital",
                "completion_date": "2024-08-01",
                "demo_url": "https://demo.blackmarlinbd.com/hospital-erp",
                "github_url": "",
                "is_featured": True,
                "order": 50,
            },
            {
                "title": "MarketX — ShopBazaar Multi-Vendor Marketplace",
                "slug": "marketx-shopbazaar",
                "tagline": "850 vendors. 120,000 SKUs. Built in 14 weeks.",
                "description": MARKET_X_DESC,
                "category": cat_ecommerce,
                "tech_stack": ["Next.js", "React", "Django", "PostgreSQL", "Elasticsearch", "Redis", "Celery", "AWS EKS", "S3"],
                "tags": ["E-Commerce", "Marketplace", "Multi-vendor", "AI Recommendations", "Payments"],
                "client": "ShopBazaar.com.bd",
                "completion_date": "2024-04-22",
                "demo_url": "https://demo.blackmarlinbd.com/marketx",
                "github_url": "",
                "is_featured": True,
                "order": 60,
            },
            {
                "title": "LearnIQ LMS — BrightMinds EdTech",
                "slug": "learniq-brightminds",
                "tagline": "45,000 learners. Completion rate: 34% → 61% with AI.",
                "description": LEARNIQ_DESC,
                "category": cat_education,
                "tech_stack": ["Django", "PostgreSQL", "React Native", "LangChain", "GPT-4", "Pinecone", "AWS ECS", "MediaConvert"],
                "tags": ["LMS", "E-Learning", "AI Tutor", "RAG", "Mobile App", "EdTech"],
                "client": "BrightMinds EdTech Pvt. Ltd.",
                "completion_date": "2024-09-15",
                "demo_url": "https://demo.blackmarlinbd.com/learniq",
                "github_url": "",
                "is_featured": True,
                "order": 70,
            },
            {
                "title": "TradeDesk OMS — Pinnacle Securities",
                "slug": "tradedesk-pinnacle",
                "tagline": "28,000 trades/day. FIX 4.4. <5ms order latency.",
                "description": TRADEDESK_DESC,
                "category": cat_fintech,
                "tech_stack": ["Python", "asyncio", "QuickFIX", "Django", "PostgreSQL", "Redis", "React", "React Native", "FIX 4.4"],
                "tags": ["FinTech", "OMS", "Trading", "DSE", "FIX Protocol", "Algo Trading"],
                "client": "Pinnacle Securities Ltd.",
                "completion_date": "2024-07-10",
                "demo_url": "https://demo.blackmarlinbd.com/tradedesk",
                "github_url": "",
                "is_featured": True,
                "order": 80,
            },
        ]

        created = 0
        updated = 0

        for data in projects:
            obj, is_new = Project.objects.update_or_create(
                slug=data["slug"],
                defaults={
                    "title": data["title"],
                    "short_description": data["tagline"],
                    "description": data["description"],
                    "category": data["category"],
                    "tech_stack": data["tech_stack"],
                    "client_name": data.get("client", ""),
                    "completion_date": data.get("completion_date"),
                    "demo_url": data.get("demo_url", ""),
                    "github_url": data.get("github_url", ""),
                    "is_featured": data.get("is_featured", False),
                    "order": data.get("order", 0),
                    "status": "published",
                },
            )
            # Taggit tags must be set after save
            if data.get("tags"):
                obj.tags.set(data["tags"])
            if is_new:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {obj.title}"))
            else:
                updated += 1
                self.stdout.write(f"  Updated: {obj.title}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {created} created, {updated} updated across {len(projects)} product showcase projects."
        ))
