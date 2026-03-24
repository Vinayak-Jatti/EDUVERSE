# Backend Changelog

## [2026-03-24] - Backend Hygiene & Logging
### Added
- Enterprise-grade logger using `pino` for production-ready request tracing.
- `src/utils/httpLogger.js` (renamed from old `logger.js`) to isolate HTTP logging from general application logging.

### Changed
- Moved all backend documentation to `docs/backend/` for project-wide consistency.
- Replaced all `console.log`, `console.warn`, and `console.error` with the new unified logger.
- Overhauled `backend/README.md` to accurately reflect the modular, domain-driven architecture.
- Optimized `auth.repository.js` by replacing `SELECT *` with explicit column naming.

### Removed
- Cleaned up all `.out` test log artifacts from the root of the backend directory.
- Deleted the legacy `backend/docs` folder after consolidation.
