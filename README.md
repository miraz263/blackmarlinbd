# BlackMarlinBD — Enterprise IT & AI Engineering Platform

> Production-ready, enterprise-grade website for a global IT firm.
> **Stack:** Django · DRF · React · TypeScript · TailwindCSS · Framer Motion · PostgreSQL · Redis · Celery · Docker · Nginx

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [API Documentation](#api-endpoints)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)
8. [CI/CD](#cicd)
9. [AWS / DigitalOcean Deployment Guide](#cloud-deployment)

---

## Project Structure

```
blackmarlinbd/
├── backend/                    # Django backend
│   ├── apps/
│   │   ├── users/              # Auth, JWT, newsletter
│   │   ├── projects/           # Portfolio projects
│   │   ├── blog/               # Blog + comments
│   │   ├── contacts/           # Contact form + Celery email
│   │   ├── jobs/               # Job board + applications
│   │   └── core/               # Shared models, permissions, WS consumers
│   ├── api/v1/                 # API router
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── asgi.py             # Channels / WebSocket
│   │   ├── wsgi.py
│   │   └── celery.py
│   ├── tests/
│   ├── requirements/
│   ├── manage.py
│   └── Dockerfile
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── home/           # Hero, Services, FeaturedProjects, CTA, TechStack
│   │   │   └── ui/             # Button (ShadCN-style)
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── BlogPage.tsx
│   │   │   ├── CareersPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── dashboard/
│   │   │       ├── DashboardLayout.tsx
│   │   │       └── DashboardOverview.tsx
│   │   ├── hooks/              # useAuth, useWebSocket
│   │   ├── services/api/       # Axios clients (auth, projects, blog, jobs, contacts)
│   │   ├── store/              # Zustand (authStore, themeStore)
│   │   ├── types/              # TypeScript interfaces
│   │   └── lib/utils.ts
│   ├── Dockerfile
│   └── nginx.conf              # SPA nginx config
├── nginx/
│   ├── nginx.conf              # Main nginx config
│   └── conf.d/blackmarlinbd.conf  # Virtual host (SSL, proxy, WS)
├── .github/workflows/
│   ├── ci-cd.yml               # Full CI/CD pipeline
│   └── security-scan.yml       # Weekly dependency + container scan
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Development
├── .env.example
└── .env.dev
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Django 4.2, Django REST Framework |
| Auth | JWT in httpOnly cookies (simplejwt + token blacklist) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 + Celery + django-celery-beat |
| Real-time | Django Channels 4 + channels-redis (WebSockets) |
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | TailwindCSS 3, Radix UI primitives |
| Animation | Framer Motion 11 |
| State | Zustand 4 |
| Data fetching | TanStack Query v5 + Axios |
| Forms | React Hook Form + Zod |
| Server | Gunicorn + Uvicorn workers, Nginx |
| DevOps | Docker, Docker Compose, GitHub Actions |

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Option A — Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/yourorg/blackmarlinbd.git
cd blackmarlinbd

# 2. Copy env files
cp .env.example .env.dev

# 3. Start all services
docker compose -f docker-compose.dev.yml up --build

# Access:
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/api/docs/
# Admin:     http://localhost:8000/admin/
```

### Option B — Local without Docker

```bash
# ─── Backend ──────────────────────────────────────────────────────────────────
cd backend

python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements/development.txt

cp ../.env.example ../.env
# Edit .env with your local DB and Redis settings

export DJANGO_SETTINGS_MODULE=config.settings.development

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# ─── Celery (new terminal) ────────────────────────────────────────────────────
celery -A config worker --loglevel=info
celery -A config beat --loglevel=info   # optional — scheduled tasks

# ─── Frontend ─────────────────────────────────────────────────────────────────
cd ../frontend
npm install
npm run dev

# Access frontend at http://localhost:5173
```

### Load Sample Data

```bash
# Create initial categories, sample projects, and blog posts
python manage.py shell -c "
from apps.projects.models import Category, Project
from apps.blog.models import BlogCategory, BlogPost
from apps.users.models import User

u = User.objects.first()
cat = Category.objects.create(name='AI & ML', color='#6366f1', icon='brain')
bcat = BlogCategory.objects.create(name='Engineering')

Project.objects.create(
    title='AI Trading Platform',
    slug='ai-trading-platform',
    short_description='Real-time ML-powered order execution system',
    description='Full description...',
    category=cat,
    tech_stack=['Python', 'PyTorch', 'Kafka', 'React'],
    status='published',
    is_featured=True,
)

BlogPost.objects.create(
    title='Building High-Frequency Trading Systems',
    slug='building-hft-systems',
    excerpt='Lessons from engineering sub-millisecond systems...',
    content='# Introduction\n\nFull markdown content here.',
    author=u,
    category=bcat,
    status='published',
    is_featured=True,
)
print('Sample data created.')
"
```

---

## Production Deployment

### Server Setup (Ubuntu 22.04)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo apt install docker-compose-plugin

# 3. Clone the repo
git clone https://github.com/yourorg/blackmarlinbd.git /opt/blackmarlinbd
cd /opt/blackmarlinbd

# 4. Set up environment
cp .env.example .env
nano .env  # Fill in all production values

# 5. SSL certificates (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d blackmarlinbd.com -d www.blackmarlinbd.com
sudo cp /etc/letsencrypt/live/blackmarlinbd.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/blackmarlinbd.com/privkey.pem nginx/certs/

# 6. Start production stack
docker compose up -d --build

# 7. Create superuser
docker compose exec backend python manage.py createsuperuser

# 8. Verify
docker compose ps
curl -I https://blackmarlinbd.com
```

### Auto-renew SSL

```bash
# Add to crontab
echo "0 3 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/blackmarlinbd.com/*.pem /opt/blackmarlinbd/nginx/certs/ && docker compose -f /opt/blackmarlinbd/docker-compose.yml restart nginx" | sudo crontab -
```

---

## API Endpoints

All endpoints prefixed with `/api/v1/`

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register/` | Register new user | Public |
| POST | `/auth/login/` | Login (sets httpOnly cookie) | Public |
| POST | `/auth/logout/` | Logout + blacklist token | Auth |
| POST | `/auth/token/refresh/` | Refresh access token | Public |
| GET/PATCH | `/auth/me/` | Get/update current user | Auth |
| POST | `/auth/change-password/` | Change password | Auth |
| POST | `/auth/newsletter/subscribe/` | Subscribe to newsletter | Public |
| GET | `/auth/users/` | List all users | Admin |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/` | List projects (filtered, paginated) |
| POST | `/projects/` | Create project | Editor+ |
| GET | `/projects/featured/` | Featured projects (cached) |
| GET | `/projects/{slug}/` | Project detail |
| PATCH/DELETE | `/projects/{slug}/` | Update/delete | Editor+ |
| GET/POST | `/projects/categories/` | List/create categories |
| GET/PATCH/DELETE | `/projects/categories/{slug}/` | Category operations |

### Blog
| Method | Endpoint | Description |
|---|---|---|
| GET | `/blog/` | List posts (filtered, paginated) |
| POST | `/blog/` | Create post | Editor+ |
| GET | `/blog/featured/` | Featured posts (cached) |
| GET | `/blog/{slug}/` | Post detail |
| PATCH/DELETE | `/blog/{slug}/` | Update/delete | Editor+ |
| POST | `/blog/{slug}/comments/` | Add comment | Auth |
| GET/POST | `/blog/categories/` | List/create categories |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs/` | List open jobs |
| POST | `/jobs/` | Create job | Editor+ |
| GET | `/jobs/{id}/` | Job detail |
| POST | `/jobs/{id}/apply/` | Submit application |
| GET | `/jobs/applications/` | All applications | Admin |
| GET/PATCH | `/jobs/applications/{id}/` | Application detail | Admin |

### Contact
| Method | Endpoint | Description |
|---|---|---|
| POST | `/contacts/` | Submit contact form (rate limited) |
| GET | `/contacts/list/` | All contacts | Admin |
| GET/PATCH | `/contacts/{id}/` | Contact detail | Admin |

### WebSockets
| Path | Description |
|---|---|
| `ws://host/ws/notifications/` | User notifications (authenticated) |
| `ws://host/ws/analytics/` | Live analytics stream |

### Schema
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- OpenAPI JSON: `/api/schema/`

---

## Environment Variables

See [.env.example](.env.example) for the full list. Critical variables:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key (min 50 chars, random) |
| `DEBUG` | `False` in production |
| `DB_PASSWORD` | PostgreSQL password |
| `REDIS_URL` | Full Redis connection URL |
| `EMAIL_HOST_PASSWORD` | SMTP password / App password |
| `SENTRY_DSN` | Sentry error tracking DSN |
| `USE_S3` | `True` to use S3 for media/static |

---

## Testing

### Backend

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# With coverage report
pytest --cov=apps --cov-report=html
open htmlcov/index.html

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test class
pytest tests/test_projects.py::TestProjectEndpoints -v
```

### Frontend

```bash
cd frontend

# Run tests once
npm run test -- --run

# Watch mode
npm run test

# Coverage
npm run test:coverage

# UI test explorer
npm run test:ui
```

---

## CI/CD

GitHub Actions runs on every push/PR:

1. **test-backend** — Pytest with PostgreSQL + Redis services
2. **test-frontend** — TypeScript check, ESLint, Vitest, build
3. **build-and-push** — Docker images pushed to GHCR (main branch only)
4. **deploy** — SSH into production server, pull & restart (main branch only)

### Required GitHub Secrets

```
PROD_HOST          Production server IP/hostname
PROD_USER          SSH username
PROD_SSH_KEY       Private SSH key (PEM format)
PROD_PORT          SSH port (default 22)
```

---

## Cloud Deployment

### AWS (Recommended for scale)

```
Architecture:
  ALB (Load Balancer)
    ├── ECS Fargate (backend containers)
    ├── ECS Fargate (frontend containers)
    └── RDS PostgreSQL (Multi-AZ)
  ElastiCache Redis (cluster mode)
  S3 + CloudFront (static/media files)
  ECR (container registry)
  Route53 (DNS)
  ACM (SSL certificates)
```

### DigitalOcean (Cost-effective)

```
Architecture:
  Droplet (4GB RAM, 2 vCPU)
    └── Docker Compose (all services)
  Managed PostgreSQL ($15/mo)
  Managed Redis ($10/mo)
  Spaces + CDN (S3-compatible)
```

### Minimum Production Specs

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| PostgreSQL | 1 GB RAM | 4 GB RAM |
| Redis | 256 MB | 1 GB |

---

## Frontend Views

| Route | Page |
|---|---|
| `/` | Home — Hero, services, featured projects, CTA |
| `/about` | About — Mission, stats, values, team |
| `/services` | Services — Detailed service pages with capabilities |
| `/projects` | Portfolio — Filterable project grid |
| `/blog` | Blog — Searchable, paginated articles |
| `/careers` | Careers — Job listings with expandable details |
| `/contact` | Contact — Form with validation and email notification |
| `/login` | Authentication |
| `/dashboard` | Admin overview |
| `/dashboard/projects` | Manage projects |
| `/dashboard/blog` | Manage blog posts |
| `/dashboard/jobs` | Manage job listings |
| `/dashboard/users` | Manage users |

---

## License

Proprietary — All rights reserved. © 2024 BlackMarlinBD Ltd.
"# blackmarlinbd" 
