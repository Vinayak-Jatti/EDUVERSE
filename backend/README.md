# Node.js + Express + MySQL2 — EDUVERSE Backend

## 📁 Project Structure

```
├── server.js                         # Boot: DB connect, socket.io, listen, graceful shutdown
├── src/
│   ├── app.js                        # Express: security, logging, middleware, routes
│   ├── loaders/                      # Modular app initialization logic
│   ├── config/                       # Centralized env config, DB & Cloudinary setup
│   ├── modules/                      # Domain-driven feature modules (Auth, Feed, Chat, etc.)
│   │   └── [module]/
│   │       ├── [module].routes.js
│   │       ├── [module].controller.js
│   │       ├── [module].service.js
│   │       ├── [module].repository.js
│   │       └── [module].validation.js
│   ├── middlewares/                  # Shared express middlewares (Error, Auth, Rate limit)
│   ├── services/                     # Cross-module shared services (Mail, etc.)
│   ├── utils/                        # Shared utility functions (Logger, Response, ApiError)
│   ├── database/                     # Migration & Seeding logic
│   └── tests/                        # Unit, Integration & Load testing
```

## 🏛️ Architecture & Standards

- **Layered Architecture**: `Route → Controller → Service → Repository → Database`.
- **Enterprise Logger**: Powered by `pino` with request tracing (`X-Request-Id`).
- **Strict Validation**: All inputs validated via `express-validator` and sanitized.
- **Unified Error Handling**: Operational vs Unexpected error classification.
- **RESTful Design**: Versioned APIs (`/api/v1/*`) with consistent JSON envelopes.

## 🚀 Development

```bash
cd backend
npm install
cp .env.example .env    # Fill in DB credentials + Secrets
npm run dev             # Hot-reload dev server
```

## 🛠 Database Management

```bash
npm run db:migrate      # Apply idempotent SQL migrations
npm run db:seed         # Seed initial data
npm run db:reset        # DROP and recreate database + migrate
```

## 🧪 Testing

```bash
npm run test            # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests with temporary DB
```

## 🔒 Security Baseline

- **Helmet**: Secure HTTP headers
- **CORS**: Domain-restricted access
- **Rate Limiting**: Brute-force protection on all public endpoints
- **JWT**: Stateless session management with rotating refresh tokens
- **Input Sanitization**: XSS and SQL injection protection
