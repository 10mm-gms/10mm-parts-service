# Testing Plan: EPIC-001 Parts and Vehicles

This document outlines the testing strategy for EPIC-001, ensuring full coverage of functional and non-functional requirements across the testing pyramid.

## 1. Traceability Matrix

| ID | Requirement (Story) | Test Tier | Status | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-PARTS-001** | Create a new part (US-001) | Unit + E2E | ✅ PASSED | Integration & lifecycle.spec.ts |
| **REQ-PARTS-002** | Edit/Update part (US-002) | Integration + E2E | ✅ PASSED | Integration & update.spec.ts |
| **REQ-PARTS-003** | Delete part (US-003) | Integration + E2E | ✅ PASSED | Integration & delete.spec.ts |
| **REQ-PARTS-005** | View single part (US-005)  | E2E | ✅ PASSED | details.spec.ts |
| **REQ-VEH-001**   | Create vehicle (US-006)    | Unit + E2E | ✅ PASSED | vehicles/lifecycle.spec.ts |
| **REQ-VEH-002**   | Edit/Update vehicle (US-007) | Integration + E2E | ✅ PASSED | vehicles/lifecycle.spec.ts |
| **REQ-VEH-003**   | Delete vehicle (US-008)    | Integration + E2E | ✅ PASSED | vehicles/lifecycle.spec.ts |
| **REQ-VEH-005**   | View single vehicle (US-010) | E2E | ✅ PASSED | Partial coverage in lifecycle |
| **REQ-LOC-001**   | Create location (US-015)   | Unit + E2E | ✅ PASSED | bug_2602102127.spec.ts |
| **REQ-LOC-002**   | Edit location (US-016)     | Integration + E2E | ✅ PASSED | bug_2602102127.spec.ts |
| **REQ-LOC-003**   | Delete location (US-017)   | Integration + E2E | ✅ PASSED | bug_2602102127.spec.ts |
| **REQ-LOC-004**   | View locations (US-018/19) | E2E | ✅ PASSED | bug_2602102127.spec.ts |
| **REQ-STOCK-001** | Manage stock levels (US-020) | Integration + E2E | ✅ PASSED | bug_2602102127.spec.ts |
| **REQ-PARTS-008** | Internal Part Code generation | Unit + E2E | ✅ PASSED | test_logic.py |
| **REQ-PARTS-011** | Link part to vehicle (US-011) | Integration + E2E | ✅ PASSED | Linking UI in PartDetailsPage |
| **REQ-PARTS-020** | Stock level management (US-020) | Integration + E2E | ✅ PASSED | Stock UI in PartDetailsPage |
| **REQ-PARTS-021** | Free text search (US-021) | E2E (System) | ✅ PASSED | Live search hook in PartsPage |
| **REQ-PARTS-UTF8** | Character set robustness | Unit + E2E | ✅ PASSED | test_schemas.py |
| **REQ-PARTS-SEC-1** | JWT Authentication (NFR-002) | Integration + E2E | ✅ PASSED | test_security.py |
| **REQ-PARTS-PERF-1**| Search Performance (NFR-001) | Integration | ✅ PASSED | test_performance.py |

## 2. Test Breakdown

### 2.1 Unit Tests (70%)
- **Location**: `src/backend/parts/tests/unit/`
- **Focus**:
    - Validation logic in Pydantic schemas (Max lengths, mandatory fields).
    - `PartCodeGenerator`: Test edge cases for code generation (e.g., very long manufacturer names).
    - API Exception Handlers: Verify RFC 7807 fallback responses for 404 and 422 errors.
    - **Character Resilience**: Test functions with UTF-8 strings containing accents and special characters.

### 2.2 Integration Tests (20%)
- **Location**: `src/backend/parts/tests/integration/`
- **Focus**:
    - **Full CRUD Lifecycles**:
        - **Part Lifecycle**: Create -> Read -> Update -> Read (verify change) -> Delete -> Read (verify 404).
        - **Vehicle Lifecycle**: Create -> Read -> Update -> Read -> Delete -> Read (verify 404). Verify that deleting a vehicle removes its associations in `PART_VEHICLE_LINK` without deleting the parts themselves.
        - **Location Lifecycle**: Create Location -> Assign Stock -> Delete Location (verify stock is handled/removed).
    - **Database Integrity**: Use `testcontainers-postgres` to verify foreign keys and cascading deletes.
    - **Search Logic**: Verify `pg_trgm` and `tsvector` ranking with a seeded set of 100+ items.
    - **Security Middleware**: Verify that the JWT dependency correctly blocks unauthorised requests for ALL mutation endpoints.

### 2.3 E2E Tests (10%)
- **Location**: `tests/e2e/parts/`
- **Tool**: Playwright
- **Focus**:
    - **The "Full Loop" Flow**: 
        1. Create a Part and a Vehicle.
        2. Link the Part to the Vehicle.
        3. Edit the Part (e.g., update the price).
        4. Search for the Part using the new price or a unique note.
        5. Delete the Vehicle and verify the Part still exists but the link is gone.
        6. Delete the Part and verify the stock levels are removed.
    - **System Mode**: MUST run in `SYSTEM` mode to verify real DB state transitions.
    - **UI Validation**: Ensure `shadcn/ui` components correctly handle "Delete" confirmation modals.

## 3. Acceptance Criteria

| Requirement | Acceptance Criteria |
| :--- | :--- |
| **Part Creation** | API returns 201 Created and the part is retrievable via GET. Special characters are preserved. |
| **Vehicle Lifecycle** | Create -> Read -> Update -> Delete sequence succeeds. Deleting a vehicle removes links but leaves parts intact. |
| **Search** | Query "Brake" returns both parts with "Brake" in description and vehicles with "Brake" in notes. Results sorted by relevance. |
| **Security** | `POST /api/v1/parts` fails with 401 if NO token is provided. Succeeds with valid embedded development token. |
| **Performance** | Search execution time on the backend is consistently < 800ms to allow overhead for frontend rendering. |
| **Localisation** | All UI text (e.g., "Honour", "Initialise", "Summary") uses en-GB spelling. |

## 4. Modified Existing Tests
- **Frontend `App.test.tsx`**: Update to include navigation to the new "Parts" and "Vehicles" routes.
- **Root `Makefile`**: Ensure `make test` includes the new backend module tests.
