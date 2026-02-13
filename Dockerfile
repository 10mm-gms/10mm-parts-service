# Stage 1: Build Frontend
FROM node:22-slim AS frontend-builder
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /libraries/ui-core
COPY libraries/ui-core/ ./
RUN [ -f package.json ] && npm install && npm run build || echo "No ui-core library found, skipping..."

WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ ./
RUN npm run build

# Stage 2: Build Backend Environment
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS backend-builder
WORKDIR /app
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY libraries /app/libraries
COPY pyproject.toml uv.lock ./
RUN uv export --no-dev --format requirements-txt > requirements.txt
RUN uv pip install --system --no-cache -r requirements.txt

# Stage 3: Production (Python Slim)
FROM python:3.12-slim

WORKDIR /app

# Set runtime environment
ENV PYTHONPATH="/app/src/backend:/app"
ENV PYTHONUNBUFFERED=1
# Default DATABASE_URL to match run_docker.sh expectations
ENV DATABASE_URL="sqlite:////app/test-data.db"

# Copy Python site-packages and binaries from builder
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy static assets from frontend
COPY --from=frontend-builder /app/frontend/dist /app/static

# Copy backend source
COPY src/backend /app/src/backend

EXPOSE 8000

# Create a non-root user and ensure they own the app directory
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Run using uvicorn
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
