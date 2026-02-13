# Standards Summary for EPIC-001: Parts and Vehicles

This document outlines the inviolable rules and standards applicable to the design and implementation of EPIC-001, derived from the local repository configuration and core product standards.

## 1. Architectural Principles
- **Modular Monolith (ADR-0007)**: Implementation must reside within a bounded module (`src/backend/parts`) with strict interface boundaries. No direct database access from other modules.
- **Clean Architecture Lite**: Follow the standard layer separation:
    - **API**: FastAPI routes and Dependency Injection.
    - **Core**: Pure business logic (Services/Entities).
    - **DB**: SQLAlchemy/SQLModel models and Alembic migrations.
    - **Schemas**: Pydantic models for request/response.
- **Stateless Services (ADR-0009)**: Processes must be stateless; configuration via environment, logs to `stdout`.

## 2. UI & Design Standards (Local Authority: `src/frontend/tailwind.preset.js`)
- **10mm GMS Design System (ADR-0005)**: Use the native visual style of `shadcn/ui`.
- **Inviolable Design Tokens**: All brand colors and typography are defined in `src/frontend/tailwind.preset.js`. These must be used via their semantic Tailwind classes and must not be modified or bypassed with hardcoded values.
    - **Primary Action**: Use `bg-primary` / `text-primary-foreground` (10mm GMS Green).
    - **Secondary/Accent**: Use `bg-secondary` / `text-secondary-foreground` (10mm GMS Blue).
    - **Destructive/Error**: Use `bg-destructive` / `text-destructive-foreground` (10mm GMS Red).
    - **Typography**: Use `font-heading` (Poppins) and `font-sans` (Fira Sans).
    - **Border Radius**: `radius` (modest radii as defined in preset).
- **Styling**: Tailwind CSS only. No hardcoded hex colors; use theme tokens (`text-primary`, `bg-background`, etc.).

## 3. Technology Stack
- **Backend**: Python 3.12+, FastAPI, `uv` for package management, `ruff` for linting/formatting (Local Authority: `ruff.toml`).
- **Database**: PostgreSQL with `SQLAlchemy` (Async) or `SQLModel` (ADR-0008). 
- **Frontend**: React, Tailwind CSS, `shadcn/ui`, `vitest` for unit tests.

## 4. API Standards
- **Contract-First**: Define OpenAPI 3.1 specifications before implementation.
- **Namespace**: All backend API routes must be prefixed with `/api/v1`.
- **Error Handling**: Follow **RFC 7807** (Problem Details for HTTP APIs).
- **Communication**: Async/Await first for all I/O operations.

## 5. Coding & Language Standards
- **UK English (en-GB) (ADR-0013)**: Mandatory for all code (variables, classes), logs, documentation, and database schemas.
- **Type Hints**: Mandatory for all Python code.
- **UTF-8**: Mandatory for all data handling.

## 6. Testing & Traceability (ADR-0010, ADR-0015)
- **Testing Pyramid**: 70% Unit, 20% Integration, 10% E2E (Playwright).
- **Traceability**: All requirements must have `REQ-PARTS-XXX` IDs. Tests must reference these IDs.
- **Mock-Lie Prevention**: Every functional requirement MUST be verified by at least one **System Mode** (zero-mock) E2E test.
- **Matrix Integrity**: The Traceability Matrix (`testing.md`) MUST have an "E2E" entry for every `REQ-` row.

## 7. Database Evolution
- **Alembic**: All schema changes must be handled via Alembic migrations.
- **Expand & Contract**: Avoid destructive changes in the same deployment as code changes.
