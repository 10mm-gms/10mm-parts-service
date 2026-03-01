# Traceability & Testing: EPIC-002 Photographs

This document ensures 100% test coverage for the requirements of EPIC-002, as per the [Testing Standard](../../../product_standards/docs/standards/testing-traceability.md).

## 1. Traceability Matrix

| Req. ID | Description | Source | Test Case(s) |
| :--- | :--- | :--- | :--- |
| **REQ-PHOTO-001** | Remove `image_url` property from UI and Database. | US-001 | `test_schema_migration_parts` |
| **REQ-PHOTO-002** | Store photos in private S3-compatible storage (DigitalOcean Spaces). | US-002 | `test_s3_storage_isolation` |
| **REQ-PHOTO-003** | Maximize upload size to 10MB per photograph. | US-002 | `test_upload_size_limit` |
| **REQ-PHOTO-004** | Enforce a maximum of 30 photographs per part. | US-002 | `test_part_photo_limit` |
| **REQ-PHOTO-005** | Preserve and restore original filename during download (`Content-Disposition`). | US-002 | `test_filename_preservation` |
| **REQ-PHOTO-006** | Restricted access via expiring Presigned URLs. | US-002 | `test_unauthorized_s3_access` |
| **REQ-PHOTO-007** | Client-side optimization: 2000px, WebP (75%), EXIF stripping. | US-002 | `test_client_resizing_webp` |
| **REQ-PHOTO-008** | Backend Signature Validation (Content-Type/Length). | US-002 | `test_presigned_url_contract` |
| **REQ-PHOTO-009** | Post-Upload verification of "WebP" Magic Bytes. | US-002 | `test_magic_byte_failure` |
| **REQ-PHOTO-010** | Immediate display of thumbnails after individual upload. | US-002 | `test_live_thumbnail_rendering` |
| **REQ-PHOTO-011** | Delete photographs with confirmation dialogue. | US-003 | `test_photo_delete_flow` |
| **REQ-PHOTO-012** | Mark a specific photograph as the "Primary" image for a part. | US-003 | `test_primary_photo_assignment` |
| **REQ-PHOTO-013** | Rapid-Fire Camera Capture using MediaDevices API. | US-004 | `test_media_devices_snapshot` |
| **REQ-PHOTO-014** | Snapshot counter and camera switching support. | US-004 | `test_viewfinder_controls` |

## 2. Testing Strategy (Standard 5: Testing Hierarchy)

### Unit Tests (70%)
- **`src/backend/tests/test_s3_utils.py`**: Verify presigned URL generation, key sanitization, and signature verification logic.
- **`src/frontend/tests/optimization.test.ts`**: Mock Canvas API to verify image resizing and mimetype filtering.

### Integration Tests (20%)
- **`src/backend/tests/test_photograph_routes.py`**: Verify end-to-end API flows (intent -> confirm -> list) using a mocked S3 bucket.

### System-Mode E2E Tests (10%)
- **`src/frontend/tests/e2e/photographs.spec.ts`**:
    - **Scenario 1**: Upload multiple files via gallery, verify thumbnails appear, set primary, and delete.
    - **Scenario 2**: Simulate "Rapid-Fire" camera snaps (if possible in headless env) or verify viewfinder UI elements.
    - **Scenario 3 (Security)**: Attempt to upload a non-WebP file to a presigned URL and verify the backend rejects completion.

## 3. Vulnerability Verification (Standard 5)

- **Injection Check**: Confirm filenames like `../../../etc/passwd` are sanitized to `etc_passwd`.
- **Zero-Trust Validation**: Ensure the backend refuses to database-persist any S3 key until the Magic Byte check passes.
