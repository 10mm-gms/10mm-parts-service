# Standards Summary for EPIC-002: Photographs

This document outlines the inviolable rules and standards applicable to the design and implementation of EPIC-002, derived from the local repository configuration and core product standards.

## 1. Architectural Principles
- **S3-Compatible Storage (DigitalOcean Spaces)**: Direct client-to-storage uploads via presigned URLs. The backend must not act as a proxy for raw image data.
- **Asynchronous Verification**: Post-upload verification of file headers (Magic Bytes) via the backend to ensure data integrity before persistence.
- **UK English (en-GB) (ADR-0013)**: Mandatory for all code (variables, classes), logs, documentation, and database schemas (e.g., `authorisation` instead of `authorization`).
- **Statelessness (ADR-0009)**: No local file system persistence for images in production; all persistence must be in S3-compatible object storage.

## 2. UI & Design Standards (Local Authority: `src/frontend/tailwind.preset.js`)
- **Primary Action**: Use `bg-primary` / `text-primary-foreground` (10mm GMS Green).
- **Secondary/Accent**: Use `bg-secondary` / `text-secondary-foreground` (10mm GMS Blue).
- **Typography**: 
    - Heading: `font-heading` (Poppins)
    - Body/Sans: `font-sans` (Fira Sans)
- **Component Palette**: Use established `libraries/ui-core` components (e.g., `Modal`, `Button`) to ensure visual consistency.
- **Responsive Widths**: Dialogues must follow the 95% (md+) / 98% (sm) width standard established in EPIC-001.

## 3. Technology Stack & Security
- **Frontend**: React, Canvas API (for resizing/compression), MediaDevices API (for rapid-fire camera).
- **Backend**: Python 3.12, FastAPI, `boto3` (for S3 integration).
- **Security**:
    - **Presigned URLs**: Mandatory for all S3 interactions (PUT for upload, GET for private retrieval).
    - **Expiration**: Retrieval URLs must expire within 5 minutes.
    - **Verification**: Mandatory Magic Byte check for `image/webp` signature (`RIFF....WEBP`).
    - **Sanitisation**: All user-provided filenames must be stripped of paths and malicious characters before being stored as metadata.

## 4. Data Standards
- **Normalization**: All images must be normalized to **WebP (75% quality)** on the client-side.
- **Resolution**: Longest side must not exceed **2000px**.
- **Uniqueness**: S3 Keys must be generated as **UUIDs**; original filenames are stored as metadata.
- **Direct Linkage**: Photographs are linked to `Part` entities via a `PartPhotograph` child table.

## 5. Testing & Traceability
- **Traceability**: All requirements must have `REQ-PHOTO-XXX` IDs.
- **Vulnerability Testing**: Must include tests for malicious file uploads (e.g., mismatched magic bytes, path traversal attempts in filenames).
- **System-Mode E2E**: Every functional requirement must be verified by a system-mode (zero-mock) Playwright test.
