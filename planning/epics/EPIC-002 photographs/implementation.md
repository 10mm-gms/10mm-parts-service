# Implementation Plan: EPIC-002 Photographs

This plan follows a phased approach to implementing the [design.md](./design.md).

## Phase 1: Database & Model Refactoring (Standard 4: Data Standards)

1.  **Alembic Migration**:
    - **Expand**: Create `part_photographs` table.
    - **Contract**: Remove `image_url` column from `parts` table.
2.  **SQLModel Updates**:
    - Update `Part` model in `src/backend/parts/models.py` to include `photographs: list["PartPhotograph"]` relationship.
    - Create `PartPhotograph` model.
3.  **Pydantic Schema Updates**:
    - Update `PartRead` to include `photographs: list[PartPhotographRead]`.

## Phase 2: S3 Integration & Backend API (Standard 3: Security)

1.  **S3 Client Configuration**:
    - Integrate `boto3` and configure via environment variables (`S3_ENDPOINT`, `S3_BUCKET`, `S3_KEY`, `S3_SECRET`).
2.  **Presigned URL Logic**:
    - Implement `generate_presigned_id_and_url` for `PUT` operations.
    - Implement `generate_presigned_view_url` for `GET` operations.
3.  **Magic Byte Verification**:
    - Implement `verify_webp_signature` utility to fetch and check the first 12 bytes of newly uploaded files.
4.  **API Route Implementation**:
    - Build `/api/v1/parts/{id}/photographs/upload-intent`.
    - Build `/api/v1/parts/{id}/photographs/confirm` with verification logic.
    - Build `DELETE` route and ensure S3 cleanup.

## Phase 3: Frontend Optimization & Support (Standard 4: Normalisation)

1.  **Dependency Installation**: Add `browser-image-compression`.
2.  **Photo Optimization Utility**:
    - Implement `optimize_for_gms` utility (resize 2000px, convert WebP, strip EXIF).
3.  **S3 Communication Manager**:
    - Build a service to handle `PUT` requests to presigned URLs and report completion to the backend.

## Phase 4: UI Components & User Flow (Standard 2: UI Standards)

1.  **Rapid-Fire Viewfinder (Story US-004)**:
    - Build `CameraViewfinder` using `MediaDevices API`.
    - Implement asynchronous "Snap & Upload" flow.
2.  **File Selector Integration (Story US-002)**:
    - Update `PartDetailsPage` to replace simple image field with the `PhotoManagerModal`.
3.  **Photo Grid & Dashboard**:
    - Implement thumbnail gallery with "Primary" and "Delete" actions (Standard 2: Branding Colors).

## Phase 5: Testing & Verification (Standard 5: Traceability)

1.  **Unit Tests**: Backend S3 signing and verification logic.
2.  **System-Mode E2E**: Playwright tests for multiple uploads, photo verification failure, and deletion recovery.
3.  **Security Audit**: Verify EXIF stripping and magic byte enforcement via manual "malicious" uploads.
