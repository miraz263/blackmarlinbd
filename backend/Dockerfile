# -------------------------
# Base Image
# -------------------------
FROM python:3.11-slim

# -------------------------
# Environment Variables
# -------------------------
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# -------------------------
# Set Work Directory
# -------------------------
WORKDIR /app

# -------------------------
# Install System Dependencies
# -------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# -------------------------
# Install Python Dependencies
# -------------------------
COPY requirements/ requirements/
RUN pip install --upgrade pip && \
    pip install -r requirements/production.txt

# -------------------------
# Copy Project Files
# -------------------------
COPY . .

# -------------------------
# Create Non-root User
# -------------------------
RUN addgroup --system app && adduser --system --group app
RUN mkdir -p /app/staticfiles /app/media && chown -R app:app /app
USER app

# -------------------------
# Skip collectstatic in build
# -------------------------
RUN echo "Skipping collectstatic during build"

# -------------------------
# Expose Port
# -------------------------
EXPOSE 8000

# -------------------------
# Start Command (Production)
# -------------------------
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--timeout", "120", \
     "--keep-alive", "5", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--log-level", "info"]