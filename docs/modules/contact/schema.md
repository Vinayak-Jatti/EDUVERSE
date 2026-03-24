# Contact Module: Information Architecture

## 1. Primary Perspective: `contact_applications`
The core persistence node for all career career ingress signals.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | CHAR(36) | UUID4 - Universal Identifier. (Primary Key) |
| `first_name` | VARCHAR(100) | Given Name - NOT NULL. |
| `last_name` | VARCHAR(100) | Surname - NOT NULL. |
| `email` | VARCHAR(255) | Primary contact node - NOT NULL. |
| `campus` | VARCHAR(255) | Institutional affiliation context. |
| `resume_url` | TEXT | Persistence target for Signal CV (Resume). |
| `status` | ENUM | 'pending', 'reviewed', 'contacted', 'rejected'. |
| `created_at` | DATETIME | Current timestamp of signal ingress. |
| `updated_at` | DATETIME | Last state mutation timestamp. |

## 2. Indexes & Performance
- **Primary Node**: (id).
- **Lookup Node**: `idx_applications_email` (email).
- **Filter Node**: `idx_applications_status` (status).

## 3. Relationships & Handshakes
- This module is currently **Decentralized** — applications exist as independent nodes and are not yet linked to the `users` table, allowing for guest-initiated signals.
