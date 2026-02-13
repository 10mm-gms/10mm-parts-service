# Implementation Plan: EPIC-001 Parts and Vehicles

This plan outlines the phases for implementing the Parts and Vehicles system. Testing is covered in the separate `testing.md` document.

## Phase 1: Infrastructure & DB Schema
1. **Initialise Module Structure**:
    - Create `src/backend/parts/` and subdirectories (`api`, `core`, `db`, `schemas`).
    - Update `src/backend/main.py` to include the new router.
2. **Database Models**:
    - Define `Part`, `Vehicle`, `Location`, `StockLevel`, and `PartVehicleLink` in `src/backend/parts/db/models.py` using SQLModel/SQLAlchemy.
    - Implement the "Internal Part Code" generation logic (Manufacturer-System-Type-Seq).
3. **Alembic Migrations**:
    - Generate and review migration scripts in `src/backend/db/migrations/`.
    - Apply migrations to the local PostgreSQL instance.

## Phase 2: Core Services (Business Logic)
1. **Base Repositories**:
    - Implement generic CRUD operations for all entities.
2. **PartService**:
    - Logic for creating, updating, and deleting parts.
    - Handle standard UTF-8 string encoding and special character escaping.
3. **VehicleService**:
    - Logic for managing vehicle records.
4. **Linking Service**:
    - Logic for associating parts with vehicles and managing stock levels across locations.

## Phase 3: API & Schemas
1. **Pydantic Schemas**:
    - Define request/response schemas in `src/backend/parts/schemas/`.
    - Ensure field validation matches PRD requirements (e.g., non-null fields).
2. **FastAPI Routers**:
    - Implement endpoints in `src/backend/parts/api/v1/`.
    - Namespace all routes under `/api/v1/parts`, `/api/v1/vehicles`, etc.
3. **OpenAPI Documentation**:
    - Ensure `api/openapi.yaml` (or equivalent generation) reflects the new endpoints.

## Phase 4: Search Functionality
1. **Search Indexing**:
    - Create GIN indexes on relevant columns in PostgreSQL.
    - Implement the `SearchService` using `ts_rank` and `pg_trgm`.
2. **Search API**:
    - Create the `/api/v1/search` endpoint that aggregates results from parts and vehicles.

## Phase 5: Authentication & Security
1. **JWT Middleware**:
    - Implement a FastAPI dependency to verify JWT tokens.
    - Apply this dependency to all write operations (POST, PATCH, DELETE).
2. **Embedded Token Support**:
    - Configure the backend to accept the "Development JWT" specified in environment variables.

## Phase 6: Frontend Development
1. **API Client**:
    - Generate or update the API client to include new endpoints.
    - Configure the client to use the embedded JWT for mutations.
2. **UI Components (shadcn/ui)**:
    - **Parts Management**: List, Detail, and Form components.
    - **Vehicle Management**: List, Detail, and Form components.
    - **Linking UI**: Interface for associating parts with vehicles and updating stock.
3. **Search Interface**:
    - Unified search bar with real-time results and relevance sorting.
4. **UK English Localisation**:
    - Ensure all labels and messages use UK English (en-GB).
5. **Character Resilience**:
    - Verify that the UI correctly renders and handles special characters and non-ASCII titles.
