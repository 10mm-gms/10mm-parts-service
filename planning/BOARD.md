# [Product Name] Project Board
<!-- Standard Version: 0.2 -->

## 📋 Backlog (Future Work)
- [ ] Example Epic A
  - [ ] Example Story 1
  - [ ] Example Story 2

## 🚀 In Progress (Active)
- [ ] [EPIC-001]: Manage high-performance EV/hybrid parts and vehicle compatibility (Ready for Review)

## ✅ Done (Completed)
- [x] [TWEAK-2603011556]: Maximize Dialogue Box Width (95% md+, 98% sm)
- [x] [BUG-2602281925]: Resolved high severity security vulnerabilities in frontend dependencies (ajv, minimatch, rollup) via `npm audit fix`. Verified 100% Green Build Pipeline.
- [x] [BUG-2602102127]: Navigation Tabs (Parts, Vehicles, Locations) and full CRUD for Locations (US-015 to US-019) + Stock Management (US-020) are now implemented. Updated Traceability Matrix and confirmed 100% Green Build Pipeline.
- [x] [BUG-2602101942]: Add Vehicle modal is missing properties required by US-006 (To Year, Variant, Body style, Drive type, Trim level). Successfully added all missing fields and enhanced the vehicle list UI.
- [x] [BUG-2602100520]: Part Create/Edit modal is missing fields required by US-001 (OE Part Number, Price, Supplier, URL, Notes, etc.). Successfully updated PartsPage modal and PartDetailsPage with all missing fields and improved UX.
- [x] [BUG-2602100454]: Resolved issue where landing page returned JSON by configuring FastAPI to serve static files and implementing an SPA catch-all route.
- [x] [BUG-2602100441]: Resolved container build linting failure by fixing import sorting, removing trailing whitespace, and breaking long lines in integration tests.
- [x] [BUG-2602091223]: Container crash/build failure resolved. Fixed missing `uvicorn` dependency in `pyproject.toml`, restored broken `Dockerfile` layers, and corrected file permissions for SQLite database initialization.
- [x] [BUG-2602080742]: Fixed E2E flakiness by enforcing a single serial worker in Playwright config to prevent database collisions.
- [x] [BUG-2602080726]: Resolved container build failure (React types mismatch, App.test path error, and missing ui-core build in Dockerfile).
- [x] [BUG-2602080706]: Frontend refactored to adhere to updated 10mm GMS Design Standards (Light Theme, Green Primary).
- [x] Initial Repository Setup
- [x] [BUG-2602090613]: Verification of Traceability Matrix completed. All requirements associated with EPIC-001 are now covered by passing unit, integration, or E2E tests, including UI support for Vehicles, Search, and Linking.
