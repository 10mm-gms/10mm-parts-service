# Design Document: EPIC-002 Photographs

This design adheres to the standards defined in [standards.md](./standards.md).

## 1. Database Schema (Standard 4: Data Standards)

The current `image_url` property in the `Part` table is removed to support multiple photographs and private S3 storage.

### Table: `part_photographs`
| Column | Type | Constraints | Standard |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default: `uuid_generate_v4()` | Clean Architecture/Data |
| `part_id` | `UUID` | Foreign Key (`parts.id`), NOT NULL, ON DELETE CASCADE | Consistency |
| `s3_key` | `String` | Unique, NOT NULL (e.g., `parts/{part_id}/{uuid}.webp`) | Standard 4 (UUID Keys) |
| `original_filename` | `String` | NOT NULL | Standard 4 |
| `is_primary` | `Boolean` | DEFAULT: `false` | Story US-002 |
| `created_at` | `DateTime` | DEFAULT: `now()` | Audit |
| `updated_at` | `DateTime` | DEFAULT: `now()` | Audit |

## 2. API Design (Standard 3: Tech Stack & Security)

All endpoints prefixed with `/api/v1` and follow RFC 7807 for errors.

### `POST /api/v1/parts/{id}/photographs/upload-intent`
Requests a PUT presigned URL to DigitalOcean Spaces.
- **Request Body**: `{ "original_filename": "string", "mime_type": "string" }`
- **Response**: `{ "upload_url": "string", "s3_key": "string" }`
- **Constraint**: URL signed with mandatory `Content-Type: image/webp` and Content-Length (10MB limit).

### `POST /api/v1/parts/{id}/photographs/confirm`
Notifies backend of a successful S3 upload.
- **Request Body**: `{ "s3_key": "string", "original_filename": "string" }`
- **Logic**: 
    1. Backend downloads first 12 bytes from S3.
    2. Verifies **Magic Bytes** for WebP (Standard 3: Security).
    3. Finalises and saves the `part_photographs` record in the database.

### `GET /api/v1/parts/{id}/photographs`
Returns all photographs for a part.
- **Response**: `List<{ "id": "uuid", "view_url": "string", "is_primary": "bool" }>`
- **Constraint**: `view_url` is a GET presigned URL expiring in 5 minutes (Standard 3: Expiration).

## 3. Frontend Architecture (Standard 2: UI & Design Standards)

### `PhotoManagerModal`
- **Container**: Reusable `Modal` component (libraries/ui-core).
- **Styling**: `w-[98%] md:w-[95%]`, `font-sans` (Fira Sans).
- **Primary Actions**: "Capture" (Camera) and "Select" (Gallery).

### `RapidFireViewfinder` (Story US-004)
- **API**: Uses `navigator.mediaDevices.getUserMedia`.
- **Logic**:
    - **Buffer Snap**: Capture frame to `HTMLCanvasElement`.
    - **Optimization**: Resize to 2000px, convert to `Blob` (image/webp, 0.75 quality) on client-side (Standard 4: Normalisation).
    - **Async Upload**: Start upload to S3 immediately after snap; update UI counter.

### `OptimizationUtility`
- **Client-Side**: Strips EXIF/Sensitive metadata automatically via Canvas redraw (Standard 4).

## 4. Security Enforcement (Standard 3)

- **Sanitisation**: The backend uses `path.basename()` and a regex filter `[^a-zA-Z0-9.-_]` on `original_filename` before DB storage.
- **Auth**: All photograph endpoints require a valid JWT with `PartManager` scope.
