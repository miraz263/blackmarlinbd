"""
Seeds 4 service categories and 14 industry-vertical services for BlackMarlinBD.
"""
from django.core.management.base import BaseCommand
from apps.services.models import ServiceCategory, Service, Technology


# ─── Service category definitions ─────────────────────────────────────────────

CATEGORIES = [
    {
        "name": "Industry Solutions",
        "slug": "industry-solutions",
        "description": "Sector-specific technology solutions engineered for regulated, high-stakes industries.",
        "icon_name": "Layers",
        "color": "#6366f1",
        "order": 1,
    },
    {
        "name": "Products & Platforms",
        "slug": "products-platforms",
        "description": "Ready-to-deploy SaaS platforms and proprietary accelerators that cut delivery time by 60%.",
        "icon_name": "Package",
        "color": "#0ea5e9",
        "order": 2,
    },
    {
        "name": "Research & Innovation",
        "slug": "research-innovation",
        "description": "Applied research, prototyping, and emerging technology incubation for competitive advantage.",
        "icon_name": "FlaskConical",
        "color": "#8b5cf6",
        "order": 3,
    },
    {
        "name": "Alliances",
        "slug": "alliances",
        "description": "Hyper-scaler and ISV partnerships that extend capability and compress procurement cycles.",
        "icon_name": "HeartHandshake",
        "color": "#10b981",
        "order": 4,
    },
]

# ─── Industry service definitions ──────────────────────────────────────────────

SERVICES = [
    # ── Banking ───────────────────────────────────────────────────────────────
    {
        "title": "Banking",
        "slug": "banking",
        "tagline": "Modernise Core. Grow Digital.",
        "short_description": (
            "End-to-end technology transformation for retail, commercial, and investment banks — "
            "from core modernisation and open-banking APIs to AI-driven credit decisioning."
        ),
        "description": (
            "BlackMarlinBD engineers banking platforms that pass regulator scrutiny on day one and "
            "scale to millions of daily active users. We work across retail banking, commercial lending, "
            "treasury, and trade finance — integrating with SWIFT, ISO 20022, and major core-banking "
            "systems including Temenos, Finacle, and FIS."
        ),
        "icon_name": "Landmark",
        "gradient": "purple-brand",
        "category_slug": "industry-solutions",
        "featured": True,
        "order": 1,
        "capabilities": [
            "Core banking modernisation (monolith → microservices)",
            "Open Banking / PSD2 API gateways",
            "Real-time payment rails (ISO 20022, RTGS, UPI, bKash)",
            "AI credit scoring and underwriting automation",
            "Fraud detection — sub-50 ms latency ML scoring",
            "KYC/AML compliance automation",
            "Customer 360° data platform",
            "Digital onboarding with e-KYC and biometrics",
        ],
        "body": """## Our Banking Engineering Practice

We have delivered mission-critical banking systems across three continents. Our teams hold deep domain knowledge in retail, commercial, and wholesale banking, and we hold ISO 27001 certification to satisfy most banks' vendor risk requirements.

## Core Banking Modernisation

Legacy core systems are a growth bottleneck. We apply a strangler-fig migration pattern:

- Identify bounded contexts (accounts, payments, loans, FX)
- Wrap the legacy core with a translating API layer
- Migrate context by context, running systems in parallel until cutover
- Decommission legacy components incrementally — zero big-bang risk

## Open Banking & API Monetisation

We build production-grade API management platforms:
- Consent management compliant with GDPR and local data-protection law
- Developer portal, sandbox, and key provisioning
- Rate-limiting, abuse detection, and chargeback reconciliation
- Analytics dashboards for API product owners

## AI-Driven Lending

- XGBoost + neural-network ensembles for probability-of-default scoring
- Explainable AI (SHAP values) for regulatory model documentation
- Automated model retraining on distribution drift detection
- Rule engine for credit policy without redeployment""",
        "technologies": [
            ("Java", "☕"), ("Spring Boot", "🍃"), ("Kafka", "📨"),
            ("PostgreSQL", "🐘"), ("Redis", "🔴"), ("Kubernetes", "☸️"),
            ("Python", "🐍"), ("OpenTelemetry", "📡"),
        ],
    },

    # ── Capital Markets ───────────────────────────────────────────────────────
    {
        "title": "Capital Markets",
        "slug": "capital-markets",
        "tagline": "Microsecond Precision. Institutional Grade.",
        "short_description": (
            "Low-latency trading infrastructure, OMS/EMS platforms, risk engines, and regulatory reporting "
            "for equities, fixed income, FX, and derivatives."
        ),
        "description": (
            "We build the systems that execute, clear, and report billions of dollars of trades every day. "
            "Our capital-markets engineering team has deep expertise in FIX protocol, market microstructure, "
            "and the regulatory frameworks of MiFID II, EMIR, Dodd-Frank, and SEBI."
        ),
        "icon_name": "TrendingUp",
        "gradient": "green-emerald",
        "category_slug": "industry-solutions",
        "featured": True,
        "order": 2,
        "capabilities": [
            "Order Management & Execution Management Systems (OMS/EMS)",
            "High-frequency trading engine development (C++/Rust)",
            "Real-time P&L and Greeks calculation",
            "Pre-trade and post-trade risk engines",
            "Smart Order Routing (SOR) across venues",
            "Market data normalisation and distribution",
            "Regulatory reporting (MiFID II, EMIR, CFTC, SEBI)",
            "Back-office settlement and reconciliation automation",
        ],
        "body": """## Capital Markets Technology

Our capital-markets practice is built around three axioms: microsecond latency, zero-tolerance for data loss, and auditability at every step.

## Trading Infrastructure

- **OMS**: Multi-asset OMS with FIX 4.2–5.0 SP2, native connectivity to major exchanges and dark pools
- **HFT Engine**: Kernel-bypass networking (DPDK), CPU affinity, and lock-free queues for sub-10 µs round-trips
- **Smart Order Routing**: Real-time venue analytics, fee optimisation, and liquidity fragmentation handling

## Risk & Compliance

- Pre-trade risk: position limits, credit checks, wash-trade detection — all in-path before order release
- Post-trade risk: real-time Greeks, VaR, and stress scenarios across entire portfolio
- Regulatory reporting: automated transaction reporting to ESMA, DTCC, and SEBI trade repositories

## Market Data

- Normalised feed handlers for Bloomberg, Refinitiv, ICE, and exchange direct feeds
- In-memory time-series store with nanosecond-precision timestamps
- Historical replay for backtesting and what-if scenarios""",
        "technologies": [
            ("C++", "⚡"), ("Rust", "⚙️"), ("Java", "☕"), ("FIX Protocol", "📊"),
            ("Kafka", "📨"), ("Redis", "🔴"), ("ClickHouse", "📈"), ("Python", "🐍"),
        ],
    },

    # ── CPG & Distribution ────────────────────────────────────────────────────
    {
        "title": "Consumer Packaged Goods & Distribution",
        "slug": "consumer-packaged-goods-distribution",
        "tagline": "Shelf to Doorstep. Optimised.",
        "short_description": (
            "Demand forecasting, supply-chain visibility, trade-promotion management, and "
            "D2C e-commerce platforms that close the gap between production and the consumer."
        ),
        "description": (
            "From the factory floor to the last-mile delivery van, BlackMarlinBD connects every "
            "node of the CPG value chain. We build AI-powered demand-sensing platforms, "
            "route-to-market analytics tools, and integrated DTC storefronts that turn "
            "shopper data into margin."
        ),
        "icon_name": "ShoppingCart",
        "gradient": "orange-pink",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 3,
        "capabilities": [
            "AI demand forecasting (SKU-level, store-level)",
            "Supply chain control tower with real-time visibility",
            "Trade promotion management and ROI analytics",
            "Route-to-market optimization",
            "Direct-to-consumer (D2C) e-commerce platforms",
            "Retail execution mobile apps for field sales teams",
            "Dynamic pricing and revenue growth management",
            "Serialisation and track-and-trace for compliance",
        ],
        "body": """## CPG Technology Solutions

Consumer goods companies operate in a world of thin margins, shelf-share battles, and rapidly shifting shopper behaviour. We engineer the data and digital platforms that give CPG teams the speed and visibility to compete.

## Demand Intelligence

- ML demand-sensing that ingests POS sell-out, syndicated data, weather, and promotional calendars
- SKU-level, account-level, and region-level forecasting with 94%+ accuracy at 4-week horizon
- Automated replenishment signals directly into ERP/WMS

## Supply Chain Visibility

- Real-time order, inventory, and shipment tracking across 3PLs and distributor networks
- Exception management: automated alerts for late shipments, stockouts, and overstock
- Carbon-footprint tracking per shipment for ESG reporting

## D2C Commerce

- Headless commerce on Next.js with composable back-end (Medusa/Vendure)
- Loyalty, subscriptions, and bundle configurators
- Personalisation engine using purchase history and browsing behaviour""",
        "technologies": [
            ("Python", "🐍"), ("TensorFlow", "🧠"), ("Next.js", "▲"), ("PostgreSQL", "🐘"),
            ("SAP", "📦"), ("Kafka", "📨"), ("React Native", "📱"), ("Tableau", "📊"),
        ],
    },

    # ── Communications, Media, and Information Services ────────────────────────
    {
        "title": "Communications, Media & Information Services",
        "slug": "communications-media-information-services",
        "tagline": "Streaming. Monetising. Personalising.",
        "short_description": (
            "OSS/BSS transformation, OTT streaming platforms, content supply chains, "
            "and AI-powered personalisation for telcos, broadcasters, and information-services firms."
        ),
        "description": (
            "BlackMarlinBD builds the infrastructure behind media at scale — from CDN-optimised "
            "video pipelines that stream to 10 million concurrent viewers to telco BSS modernisation "
            "that cuts order-to-activate from days to minutes."
        ),
        "icon_name": "Radio",
        "gradient": "brand-cyan",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 4,
        "capabilities": [
            "OTT video streaming platforms (HLS, DASH, DRM)",
            "BSS/OSS modernisation for telcos",
            "5G network orchestration and slicing",
            "Content supply chain and MAM integration",
            "AI content recommendation and personalisation",
            "Ad-tech platforms (programmatic, SSAI, AVOD)",
            "Digital subscriber management and billing",
            "Real-time audience analytics",
        ],
        "body": """## Media & Telco Technology

We serve tier-1 telcos and media companies who demand five-nines availability and global reach.

## OTT Streaming

- Origin and edge architecture using AWS CloudFront / Akamai with origin-shield for cache efficiency
- Adaptive bitrate encoding pipelines on AWS MediaConvert / FFmpeg clusters
- Multi-DRM: Widevine, FairPlay, PlayReady — geo-fencing and device management included
- Real-time analytics: concurrent viewers, buffering ratio, CDN hit rate on a live dashboard

## Telco BSS Modernisation

- Micro-services decomposition of legacy monolithic BSS using DDD and event sourcing
- Product catalog, order management, and billing rebuilt on cloud-native stack
- API gateway exposing B2B partner APIs and MVNO wholesale interfaces
- Order-to-activate automation: average time reduced from 72 h → 4 h

## Personalisation

- Collaborative filtering + transformer-based sequential models for content recommendation
- A/B testing framework built in — every algorithm change is an experiment
- Real-time segment membership updates as users browse""",
        "technologies": [
            ("FFmpeg", "🎬"), ("AWS MediaConvert", "☁️"), ("Kafka", "📨"),
            ("Elasticsearch", "🔍"), ("React", "⚛️"), ("Node.js", "🟩"),
            ("Python", "🐍"), ("Kubernetes", "☸️"),
        ],
    },

    # ── Education ─────────────────────────────────────────────────────────────
    {
        "title": "Education",
        "slug": "education",
        "tagline": "Scalable Learning. Measurable Outcomes.",
        "short_description": (
            "LMS platforms, adaptive learning engines, student analytics dashboards, and "
            "EdTech SaaS products for K-12, higher education, and corporate training."
        ),
        "description": (
            "We build educational technology that works at scale — platforms serving millions of "
            "students, AI tutoring systems that adapt in real time, and analytics products that "
            "give institutions the data to improve outcomes."
        ),
        "icon_name": "GraduationCap",
        "gradient": "cyan-blue",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 5,
        "capabilities": [
            "Learning Management System (LMS) development",
            "Adaptive learning algorithms and AI tutors",
            "Student performance analytics and early-warning systems",
            "Video lecture delivery and transcription pipelines",
            "Assessment and proctoring platforms",
            "Learning experience platforms (LXP)",
            "SCORM / xAPI content standards integration",
            "EdTech SaaS multi-tenancy and white-labelling",
        ],
        "body": """## Education Technology

Education is one of the highest-leverage applications of technology. We build platforms that make great teaching accessible at any scale.

## Learning Management Systems

- Multi-tenant LMS with white-label support per institution
- Rich content authoring: SCORM 1.2/2004, xAPI (Tin Can), H5P interactive content
- Live classes with Zoom/Jitsi integration, recording, and transcript search
- Mobile-first design with offline mode for low-bandwidth contexts

## Adaptive Learning

- Knowledge-graph–based learner model: tracks mastery at concept granularity
- Spaced-repetition scheduler using SM-17 algorithm
- Generative AI tutor (GPT-4 fine-tuned on curriculum) with Socratic dialogue mode
- Difficulty auto-calibration: question selection adapts after every response

## Analytics

- Learning analytics dashboard for instructors: engagement, completion, and assessment trends
- At-risk student identification: intervention triggers sent to advisors automatically
- Institutional reporting: accreditation-ready outcome data exports""",
        "technologies": [
            ("Django", "🐍"), ("React", "⚛️"), ("PostgreSQL", "🐘"), ("Redis", "🔴"),
            ("OpenAI", "🤖"), ("FFmpeg", "🎬"), ("AWS S3", "☁️"), ("Celery", "⚙️"),
        ],
    },

    # ── Energy ────────────────────────────────────────────────────────────────
    {
        "title": "Energy, Resources & Utilities",
        "slug": "energy-resources-utilities",
        "tagline": "Smarter Grids. Cleaner Operations.",
        "short_description": (
            "SCADA integration, smart-grid analytics, predictive asset maintenance, and "
            "ESG reporting platforms for energy producers, utilities, and mining companies."
        ),
        "description": (
            "Energy companies face simultaneous pressures to decarbonise, maintain grid stability, "
            "and squeeze efficiency from ageing infrastructure. BlackMarlinBD delivers the IoT, "
            "analytics, and operational technology integration platforms to meet all three."
        ),
        "icon_name": "Zap",
        "gradient": "yellow-orange",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 6,
        "capabilities": [
            "SCADA and OT/IT convergence platforms",
            "Smart-grid data management and analytics",
            "Predictive maintenance for turbines, transformers, and pipelines",
            "Energy trading and risk management (ETRM) systems",
            "Renewable energy forecasting (solar/wind)",
            "Carbon accounting and ESG reporting dashboards",
            "Smart meter data management systems (MDMS)",
            "Field workforce management apps",
        ],
        "body": """## Energy & Utilities Technology

Industrial environments demand software that is reliable, secure, and integrated with decades-old OT systems. We bridge that gap without disrupting operations.

## OT/IT Integration

- Industrial IoT gateway: MQTT / OPC-UA → cloud data pipeline
- Historian migration from OSIsoft PI to cloud-native time-series (InfluxDB, TimescaleDB)
- SCADA interface via DNP3 and IEC 61850 protocol adapters
- Cybersecurity overlay: Purdue model segmentation, anomaly detection on OT traffic

## Predictive Maintenance

- Vibration, temperature, and acoustic sensor fusion for rotating equipment
- Remaining-useful-life (RUL) models using LSTM and Transformer architectures
- Maintenance work-order automation integrated with SAP PM and IBM Maximo
- Mobile app for field engineers: AR-overlaid asset health data

## Renewable Forecasting

- NWP (numerical weather prediction) integration for solar irradiance and wind speed
- Day-ahead and intra-day forecasting with probabilistic uncertainty bands
- Battery storage optimisation using real-time price signals and forecast output""",
        "technologies": [
            ("Python", "🐍"), ("InfluxDB", "📊"), ("MQTT", "📡"), ("Kafka", "📨"),
            ("TensorFlow", "🧠"), ("React", "⚛️"), ("Kubernetes", "☸️"), ("SAP", "📦"),
        ],
    },

    # ── Healthcare ────────────────────────────────────────────────────────────
    {
        "title": "Healthcare",
        "slug": "healthcare",
        "tagline": "Connected Care. Clinical Intelligence.",
        "short_description": (
            "EHR/EMR integration, clinical decision support, population health analytics, "
            "and patient engagement platforms built to HL7 FHIR, HIPAA, and GDPR standards."
        ),
        "description": (
            "Healthcare technology must be both clinically excellent and rigorously compliant. "
            "BlackMarlinBD builds interoperable health data platforms, AI-assisted diagnostics, "
            "and patient-facing digital health products that providers and patients trust."
        ),
        "icon_name": "Heart",
        "gradient": "red-rose",
        "category_slug": "industry-solutions",
        "featured": True,
        "order": 7,
        "capabilities": [
            "HL7 FHIR R4 integration and interoperability layers",
            "EHR integration (Epic, Cerner, Allscripts)",
            "Clinical decision support (CDS Hooks)",
            "Medical imaging AI — radiology, pathology, dermatology",
            "Population health management platforms",
            "Remote patient monitoring (RPM) and telehealth",
            "Patient engagement apps and care-coordination portals",
            "HIPAA / GDPR compliant cloud architecture",
        ],
        "body": """## Healthcare Technology

Patient outcomes depend on the right information reaching the right clinician at the right moment. We build the data infrastructure and intelligent tools to make that happen reliably.

## Interoperability

- FHIR R4 API servers (HAPI FHIR) with US Core / AU Core profile support
- HL7 v2 ADT / ORU / ORM message processing via Mirth Connect and Azure Health Data Services
- SMART on FHIR app framework for EHR-embedded clinical apps
- CDS Hooks integration for real-time clinical decision support within Epic and Cerner workflows

## AI-Assisted Diagnostics

- Radiology: chest X-ray and CT pathology detection (pneumonia, nodules, PE)
- Pathology: whole-slide image analysis for cancer grading
- All models validated on multi-site datasets; intended-use statements and bias assessments included
- FDA 510(k) / CE mark pre-submission strategy support

## Population Health

- Risk stratification: ML models to identify patients likely to deteriorate or miss follow-ups
- Care-gap closure: automated outreach workflows for preventive screenings
- Chronic-disease management registries with outcome tracking
- Payer–provider data exchange via Da Vinci FHIR Implementation Guides""",
        "technologies": [
            ("Python", "🐍"), ("HAPI FHIR", "🏥"), ("TensorFlow", "🧠"), ("PostgreSQL", "🐘"),
            ("React", "⚛️"), ("AWS HealthLake", "☁️"), ("Kafka", "📨"), ("Django", "🐍"),
        ],
    },

    # ── High Tech ─────────────────────────────────────────────────────────────
    {
        "title": "High Tech",
        "slug": "high-tech",
        "tagline": "Platform Engineering at Hyperscale.",
        "short_description": (
            "Product engineering, developer tooling, SaaS platform architecture, and "
            "AI/ML infrastructure for technology companies building the next generation of software."
        ),
        "description": (
            "Technology companies choose BlackMarlinBD as their engineering partner when they need "
            "to ship faster, scale reliably, and build AI capabilities without building an "
            "AI research team from scratch."
        ),
        "icon_name": "Cpu",
        "gradient": "brand-cyan",
        "category_slug": "industry-solutions",
        "featured": True,
        "order": 8,
        "capabilities": [
            "SaaS platform architecture and multi-tenancy",
            "Developer experience (DX) tooling and internal platforms",
            "AI/ML platform engineering (feature stores, model serving)",
            "API-first product development",
            "Performance engineering and scalability reviews",
            "SDK and CLI development",
            "Infrastructure-as-code and GitOps",
            "Data platform and analytics engineering",
        ],
        "body": """## High-Tech Product Engineering

We embed with product teams to accelerate velocity, improve reliability, and build the AI capabilities that differentiate modern software companies.

## Platform Engineering

- Internal developer platform (IDP): self-service infrastructure, environment provisioning, and observability
- Platform SLOs: 99.99% API availability, < 200 ms p95 latency guaranteed via SRE practices
- Cost engineering: FinOps dashboards, spot-instance orchestration, auto-scaling policy tuning

## AI/ML Infrastructure

- Feature store (Feast / Tecton) with online + offline serving
- Model registry with lineage tracking (MLflow) and automated drift detection
- Model serving: Triton Inference Server, TorchServe, BentoML
- LLM fine-tuning pipelines on A100 clusters with LoRA / QLoRA
- RAG architectures with pgvector / Weaviate / Pinecone

## Developer Tooling

- CI/CD pipeline design: multi-stage Docker, branch previews, canary deployments
- Internal SDK generation from OpenAPI specs (TypeScript, Python, Go)
- Observability stack: OpenTelemetry → Grafana Tempo / Loki / Mimir""",
        "technologies": [
            ("Kubernetes", "☸️"), ("Terraform", "🏗️"), ("Go", "🐹"), ("Python", "🐍"),
            ("React", "⚛️"), ("MLflow", "🧪"), ("Kafka", "📨"), ("Prometheus", "📡"),
        ],
    },

    # ── Insurance ─────────────────────────────────────────────────────────────
    {
        "title": "Insurance",
        "slug": "insurance",
        "tagline": "Underwrite Smarter. Settle Faster.",
        "short_description": (
            "Policy administration modernisation, AI-powered underwriting, real-time claims automation, "
            "and InsurTech platforms for P&C, life, and health insurers."
        ),
        "description": (
            "Insurance companies face mounting pressure from InsurTech competitors and rising "
            "claims inflation. BlackMarlinBD engineers the platforms that let incumbents underwrite "
            "more accurately, settle claims faster, and launch new products in weeks not years."
        ),
        "icon_name": "Shield",
        "gradient": "purple-brand",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 9,
        "capabilities": [
            "Policy Administration System (PAS) modernisation",
            "AI underwriting — risk scoring and pricing models",
            "Automated claims processing and FNOL digitisation",
            "Telematics and IoT-based usage-based insurance (UBI)",
            "Reinsurance data exchange platforms",
            "Agent portal and self-service customer apps",
            "Fraud detection for claims and applications",
            "Solvency II / IFRS 17 reporting engines",
        ],
        "body": """## Insurance Technology

Insurance is a data business. We build the systems that turn vast volumes of structured and unstructured data into pricing accuracy, claims efficiency, and profitable growth.

## Policy Administration

- Microservices-based PAS supporting P&C, life, and health lines on a single platform
- Rule engine for product configuration: launch new covers without code changes
- Document generation: policy documents, endorsements, and cancellation letters via templating
- API-first architecture for seamless broker and aggregator connectivity

## AI Underwriting

- Gradient-boosted models for property risk scoring using satellite imagery, IoT sensor data, and claims history
- Natural language processing to extract structured risk data from broker submissions
- Model risk management: challenger models, backtesting, and regulatory documentation

## Claims Automation

- FNOL via chatbot, mobile app, or telematics event trigger
- AI document extraction from loss reports, invoices, and medical bills
- Straight-through processing for low-complexity claims (< £5k P&C): 78% straight-through rate achieved
- Subrogation detection: ML flags high-probability recovery opportunities automatically""",
        "technologies": [
            ("Python", "🐍"), ("Java", "☕"), ("Kafka", "📨"), ("PostgreSQL", "🐘"),
            ("TensorFlow", "🧠"), ("React", "⚛️"), ("AWS", "☁️"), ("Celery", "⚙️"),
        ],
    },

    # ── Life Sciences ─────────────────────────────────────────────────────────
    {
        "title": "Life Sciences",
        "slug": "life-sciences",
        "tagline": "Accelerate Discovery. De-risk Development.",
        "short_description": (
            "Clinical trial management, regulatory submission platforms, drug-discovery AI, "
            "and commercial analytics for pharma, biotech, and medical-device companies."
        ),
        "description": (
            "BlackMarlinBD applies cutting-edge software engineering to one of the world's most "
            "regulated and high-stakes industries. We build the CTMS, eTMF, and pharmacovigilance "
            "platforms that help life sciences companies bring safe therapies to patients faster."
        ),
        "icon_name": "Microscope",
        "gradient": "cyan-blue",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 10,
        "capabilities": [
            "Clinical Trial Management Systems (CTMS)",
            "Electronic Trial Master File (eTMF)",
            "Pharmacovigilance and adverse-event reporting (ICSR)",
            "Drug-discovery ML: molecular property prediction, virtual screening",
            "Regulatory information management (RIM) systems",
            "Commercial analytics — market access and launch excellence",
            "Real-world evidence (RWE) data platforms",
            "21 CFR Part 11 / EU Annex 11 compliant infrastructure",
        ],
        "body": """## Life Sciences Technology

In life sciences, software is not just a productivity tool — it is part of the regulated process. Every system we build is designed for GxP compliance, full audit trails, and FDA/EMA validation readiness.

## Clinical Development

- CTMS: protocol management, site activation, enrolment tracking, and query management
- eTMF: ISF/TMF structure aligned to DIA Reference Model 3.0; DocuSign integration for investigator sign-off
- EDC integration: Veeva Vault, Medidata Rave, and Oracle Clinical data pipelines

## Drug Discovery AI

- Molecular graph neural networks for ADMET property prediction
- Generative chemistry: diffusion models for de-novo molecule design
- Virtual screening pipelines: 10M compound libraries scored overnight on GPU cluster
- Integration with Schrödinger, OpenEye, and open-source cheminformatics (RDKit)

## Regulatory

- eCTD publishing: automated dossier assembly and validation against FDA / EMA requirements
- Signal detection: disproportionality analysis (PRR, ROR) on spontaneous adverse-event data
- XEVMPD and EudraVigilance E2B(R3) submission automation""",
        "technologies": [
            ("Python", "🐍"), ("PyTorch", "🔥"), ("RDKit", "🧪"), ("PostgreSQL", "🐘"),
            ("AWS", "☁️"), ("Airflow", "🌬️"), ("React", "⚛️"), ("Django", "🐍"),
        ],
    },

    # ── Manufacturing ─────────────────────────────────────────────────────────
    {
        "title": "Manufacturing",
        "slug": "manufacturing",
        "tagline": "Smart Factory. Zero Downtime.",
        "short_description": (
            "MES integration, predictive maintenance, quality inspection AI, "
            "and digital twin platforms for discrete and process manufacturers."
        ),
        "description": (
            "We connect the shop floor to the top floor — integrating PLC, SCADA, and MES data "
            "into actionable operational intelligence that reduces downtime, improves first-pass yield, "
            "and compresses new product introduction cycles."
        ),
        "icon_name": "Factory",
        "gradient": "yellow-orange",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 11,
        "capabilities": [
            "Manufacturing Execution System (MES) integration",
            "Predictive maintenance for CNC, presses, and conveyors",
            "Computer vision quality inspection (defect detection)",
            "Digital twin modelling and simulation",
            "Production scheduling and OEE optimisation",
            "Supply chain traceability and serialisation",
            "ERP integration (SAP S/4HANA, Oracle Manufacturing Cloud)",
            "Worker safety monitoring using IoT and computer vision",
        ],
        "body": """## Manufacturing Intelligence

Manufacturers compete on precision, speed, and cost. We build the software systems that give production teams real-time visibility and predictive intelligence across the entire value stream.

## Shop Floor Connectivity

- Industrial IoT gateway: OPC-UA, MTConnect, and Modbus TCP → cloud pipeline
- Edge computing nodes (Raspberry Pi / industrial PCs) for sub-100 ms local processing
- Data historian: 500k tags at 1-second resolution ingested continuously

## Quality & Vision

- Camera-based defect detection using convolutional neural networks (ResNet, EfficientDet)
- Trained on client's own production images — typical training set: 5,000 labelled defects
- False-reject rate < 0.5%; missed-defect rate < 0.1% after calibration
- Inference on edge GPU (NVIDIA Jetson) — decision in < 50 ms per part

## Digital Twin

- Discrete-event simulation in Python (SimPy) and MATLAB/Simulink
- Real-time synchronisation: twin state updated from MES at every production event
- What-if scenarios: test production schedule changes or maintenance windows before applying
- OEE tracking: availability × performance × quality with root-cause drill-down""",
        "technologies": [
            ("Python", "🐍"), ("TensorFlow", "🧠"), ("OPC-UA", "🏭"), ("Kafka", "📨"),
            ("InfluxDB", "📊"), ("React", "⚛️"), ("AWS", "☁️"), ("NVIDIA Jetson", "🔲"),
        ],
    },

    # ── Public Services ───────────────────────────────────────────────────────
    {
        "title": "Public Services",
        "slug": "public-services",
        "tagline": "Citizen-First Digital Government.",
        "short_description": (
            "Digital transformation for government agencies — citizen portals, legacy modernisation, "
            "data platforms, and case-management systems that improve public-service delivery."
        ),
        "description": (
            "Public services organisations need technology that is accessible to all citizens, "
            "secure by design, and accountable to public scrutiny. BlackMarlinBD delivers GDS-aligned, "
            "WCAG 2.1 AA compliant digital services with government-grade security."
        ),
        "icon_name": "Building2",
        "gradient": "green-emerald",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 12,
        "capabilities": [
            "Citizen self-service portals (WCAG 2.1 AA)",
            "Case management and workflow automation",
            "Legacy system modernisation (COBOL, mainframe)",
            "Open data platforms and APIs",
            "Identity verification and digital identity (eIDAS, GOV.UK Verify)",
            "Social benefits eligibility and payment systems",
            "Interoperability between government departments",
            "GDS / Digital Service Standard alignment",
        ],
        "body": """## Government Digital Services

Government technology must work for everyone — regardless of device, bandwidth, or digital confidence. We build services that are simple, fast, and trusted.

## Citizen Experience

- Service design research: user interviews, accessibility audits, and prototype testing with diverse citizen groups
- Progressive enhancement: core functionality works without JavaScript; enhanced experience for modern browsers
- Accessible by default: WCAG 2.1 AA tested with real users with disabilities and screen-reader tools
- GOV.UK Design System / Material Design Government adapted component library

## Legacy Modernisation

- Strangler-fig migration from COBOL and proprietary 4GL systems
- API wrapping layer to expose legacy data to modern front-ends without business-logic re-write
- Incremental delivery: new features release every two weeks; legacy runs in parallel until retired

## Data & Analytics

- Open data portal (CKAN) for public data publication and API access
- Interoperability: Data Standards Authority alignment, cross-department data sharing via FHIR-inspired patterns
- Performance framework: publish service performance data publicly on a live dashboard""",
        "technologies": [
            ("Python", "🐍"), ("Django", "🐍"), ("React", "⚛️"), ("PostgreSQL", "🐘"),
            ("AWS GovCloud", "🏛️"), ("Terraform", "🏗️"), ("Redis", "🔴"), ("GOV.UK Notify", "📧"),
        ],
    },

    # ── Retail ────────────────────────────────────────────────────────────────
    {
        "title": "Retail",
        "slug": "retail",
        "tagline": "Unified Commerce. Personalised at Scale.",
        "short_description": (
            "Unified commerce platforms, AI personalisation, inventory intelligence, and "
            "omnichannel fulfilment systems for retailers competing in the digital-first era."
        ),
        "description": (
            "Retail is being reinvented by data, digital, and shifting shopper expectations. "
            "BlackMarlinBD builds the composable commerce stacks, AI recommendation engines, "
            "and supply-chain visibility tools that help retailers win online and in-store."
        ),
        "icon_name": "ShoppingBag",
        "gradient": "orange-pink",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 13,
        "capabilities": [
            "Composable / headless e-commerce platforms",
            "AI product recommendations and personalisation",
            "Unified inventory management across channels",
            "Omnichannel order management and fulfilment (BOPIS, ship-from-store)",
            "Loyalty and promotions engine",
            "Store operations apps (mobile POS, clienteling)",
            "Visual search and virtual try-on",
            "Customer data platform (CDP) and marketing analytics",
        ],
        "body": """## Retail Technology

Modern retail demands that digital and physical channels work as one. We engineer the platforms that unify inventory, customer data, and fulfilment across every touchpoint.

## Composable Commerce

- Headless storefront on Next.js with server-side rendering and edge caching
- Composable back-end: Commercetools / Medusa.js for cart/checkout, Algolia for search, Contentful for content
- Performance: < 1 s LCP on mobile, 100 Core Web Vitals score
- A/B testing built in: every UI change is a controlled experiment

## Personalisation

- Real-time recommendation engine: collaborative filtering + session-based transformer
- Segment of one: personalised homepage, search ranking, and email content per shopper
- Merchandising rules layer: manual overrides for seasonal and promotional priorities

## Omnichannel Fulfilment

- Distributed Order Management: inventory across 200+ stores and 3 DCs visible in real time
- BOPIS / curbside: order-ready in < 90 minutes; customer notified via SMS / app push
- Ship-from-store: last-mile cost reduction of 18% on average by routing to nearest stocked store
- Returns portal: instant exchange, store drop-off, and courier collection — all trackable""",
        "technologies": [
            ("Next.js", "▲"), ("React", "⚛️"), ("Commercetools", "🛒"), ("Algolia", "🔍"),
            ("Python", "🐍"), ("Kafka", "📨"), ("PostgreSQL", "🐘"), ("Redis", "🔴"),
        ],
    },

    # ── Travel and Logistics ──────────────────────────────────────────────────
    {
        "title": "Travel & Logistics",
        "slug": "travel-logistics",
        "tagline": "Every Mile. Optimised.",
        "short_description": (
            "Booking platforms, dynamic pricing engines, fleet management systems, "
            "and last-mile delivery optimisation for airlines, hotels, and logistics operators."
        ),
        "description": (
            "Travel and logistics companies operate in an environment of razor-thin margins, "
            "volatile demand, and complex multi-party operations. BlackMarlinBD engineers the "
            "real-time systems, optimisation algorithms, and customer experience platforms that "
            "give operators a competitive edge."
        ),
        "icon_name": "Plane",
        "gradient": "brand-cyan",
        "category_slug": "industry-solutions",
        "featured": False,
        "order": 14,
        "capabilities": [
            "Travel booking engines (NDC, GDS integration, direct-connect)",
            "Dynamic pricing and revenue management systems",
            "Fleet management and telematics platforms",
            "Last-mile route optimisation",
            "Warehouse management systems (WMS)",
            "Cross-border trade compliance and customs clearance",
            "Passenger experience apps and loyalty platforms",
            "Carrier API integrations (DHL, FedEx, UPS, Pathao, Steadfast)",
        ],
        "body": """## Travel & Logistics Technology

We build systems that move people and goods more efficiently — from the algorithm that prices a flight 200 milliseconds before you click "search" to the route-optimisation engine that tells a delivery driver their next stop.

## Travel Booking & Distribution

- NDC Level 4 certified shopping and booking engine
- GDS connectivity: Sabre, Amadeus, Travelport via standard API adapters
- Fare engine: combinatorics solver processing 50M+ fare combinations in < 500 ms
- Ancillary merchandising: seat maps, bags, lounge access with upsell A/B testing

## Revenue Management

- Origin-destination demand forecasting using historical booking curves, events, and competitor pricing
- Dynamic pricing: price updated every 60 seconds based on load factor, pickup pace, and competitor fares
- Overbooking model: stochastic optimisation minimising both spoilage and denied boarding

## Last-Mile Optimisation

- Vehicle routing problem (VRP) solver using OR-Tools and custom heuristics
- Real-time re-routing: driver app receives updated stops when new orders arrive mid-route
- ETA accuracy: ± 8 minutes at 90th percentile
- Proof of delivery: photo, signature, and barcode capture; instant upload to operations dashboard""",
        "technologies": [
            ("Python", "🐍"), ("OR-Tools", "📐"), ("Kafka", "📨"), ("React Native", "📱"),
            ("PostgreSQL", "🐘"), ("Redis", "🔴"), ("Kubernetes", "☸️"), ("AWS", "☁️"),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed industry service categories and 14 industry-vertical services"

    def handle(self, *args, **options):
        # ── Create categories ──────────────────────────────────────────────────
        cat_map: dict[str, ServiceCategory] = {}
        for cat_data in CATEGORIES:
            cat, created = ServiceCategory.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={k: v for k, v in cat_data.items() if k != "slug"},
            )
            cat_map[cat_data["slug"]] = cat
            verb = "Created" if created else "Exists "
            self.stdout.write(f"  {verb} category: {cat.name}")

        self.stdout.write("")

        # ── Create services ────────────────────────────────────────────────────
        for svc_data in SERVICES:
            techs_raw = svc_data.pop("technologies")
            cat_slug = svc_data.pop("category_slug")
            category = cat_map.get(cat_slug)

            svc, created = Service.objects.get_or_create(
                slug=svc_data["slug"],
                defaults={
                    **{k: v for k, v in svc_data.items() if k not in ("slug",)},
                    "category": category,
                    "status": Service.Status.PUBLISHED,
                },
            )

            if created:
                # Attach technologies
                for tech_name, tech_logo in techs_raw:
                    tech, _ = Technology.objects.get_or_create(
                        name=tech_name,
                        defaults={"logo": tech_logo},
                    )
                    svc.technologies.add(tech)
                self.stdout.write(self.style.SUCCESS(f"  Created service: {svc.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"  Exists  service: {svc.title}"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Done. All industry services seeded."))
