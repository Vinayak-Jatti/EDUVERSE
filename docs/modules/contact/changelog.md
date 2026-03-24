# Contact Module Changelog

## 🚀 [2026-03-21] Initial Node Release
### 🆕 Features Added:
- **Application Ingress**: Implemented signal capture for career applications via `/api/v1/contact/apply`.
- **Signal Persistance**: Created `contact_applications` schema and repository for reliable application tracking.
- **Formal Broadcast Node**: Integrated `nodemailer` for instant formal mail alerts when applications are ingested.
- **Binary Support**: Configured specialized `Multer` uploader for Resume files (PDF/Docx) up to 5MB.

### 🛠️ Architecture:
- Separation of concerns: Route → Controller → Service → Repository.
- Secure ingest with mime-type validation.
- Decoupled email service to prevent signal failure during local development.
