# Node.js + Express + MySQL2 — Production Boilerplate

## 📁 Structure

```
├── server.js                         # Boot: DB connect, migrations, listen, graceful shutdown
├── src/
│   ├── app.js                        # Express: security, logging, middleware, routes
│   ├── config/
│   │   ├── config.js                 # Centralised env config with validation
│   │   ├── db.js                     # MySQL2 pool
│   │   └── logger.js                 # Morgan (dev vs production format)
│   ├── constants/
│   │   └── index.js                  # ROLES, TOKEN_TYPES, TABLES — no magic strings
│   ├── models/
│   │   └── user.model.js             # CREATE TABLE + raw SQL queries
│   ├── repositories/
│   │   └── user.repository.js        # Wraps model queries — no business logic
│   ├── services/
│   │   └── auth.service.js           # All business logic lives here
│   ├── controllers/
│   │   └── auth.controller.js        # Handle req/res only, delegate to service
│   ├── middlewares/
│   │   ├── requestId.js              # Stamps every request with a unique UUID
│   │   ├── auth.js                   # JWT authenticate + authorize (RBAC)
│   │   ├── rateLimiter.js            # General + strict auth rate limiting
│   │   ├── errorHandler.js           # Global error handler (must be last)
│   │   └── notFound.js               # 404 handler
│   ├── routes/
│   │   └── auth.routes.js            # /api/v1/auth/*
│   ├── validations/
│   │   └── auth.validation.js        # express-validator rules
│   └── utils/
│       ├── asyncHandler.js           # Wraps async controllers — no try/catch needed
│       ├── apiResponse.js            # sendSuccess, sendError, sendCreated, sendNoContent
│       ├── errorCodes.js             # All error codes → statusCode + message
│       ├── createError.js            # Typed error factory for services
│       └── jwt.js                    # Token generation + verification
```

## 🏛️ Request Flow

```
Request
  → requestId      (stamp with UUID)
  → morgan         (log request)
  → helmet/cors    (security headers)
  → rateLimiter    (brute force protection)
  → Route
  → Validation     (reject early)
  → authenticate   (JWT verify, optional)
  → asyncHandler   (wraps controller, forwards errors)
  → Controller     (parse req → call service → sendSuccess)
  → Service        (business logic → throw createError on failure)
  → Repository     (DB queries only)
  → Model          (raw SQL)
  ↓ (on error)
  → errorHandler   (formats + sends error response)
```

## 🚀 Setup

```bash
npm install
cp .env.example .env    # fill in DB credentials + JWT secrets
npm run dev
```

## 🔑 Auth Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | Create account |
| POST | `/api/v1/auth/login` | ❌ | Get tokens |
| POST | `/api/v1/auth/refresh-token` | ❌ | Rotate tokens |
| POST | `/api/v1/auth/logout` | ✅ | Invalidate refresh token |
| GET | `/api/v1/auth/profile` | ✅ | Get current user |

**Protected routes:** `Authorization: Bearer <accessToken>`

## 🔒 What's Handled

| Concern | How |
|---|---|
| Secure headers | `helmet` |
| XSS protection | `xss-clean` |
| Brute force | `express-rate-limit` (strict on auth routes) |
| Request tracing | `requestId` middleware + `X-Request-Id` header |
| HTTP logging | `morgan` (dev: colorful, prod: combined) |
| Async errors | `asyncHandler` — no try/catch in controllers |
| Error format | `errorHandler` — operational vs unexpected crash |
| Env validation | `config.js` — throws at startup if required vars missing |
| Graceful shutdown | SIGTERM/SIGINT → close server + drain DB pool |

## ➕ Adding a New Feature

1. `models/product.model.js` — SQL queries
2. `repositories/product.repository.js` — wraps model
3. `services/product.service.js` — business logic, `throw createError(...)`
4. `controllers/product.controller.js` — `asyncHandler` + `sendSuccess/sendError`
5. `validations/product.validation.js` — input rules
6. `routes/product.routes.js` — define endpoints
7. Mount in `src/app.js` → `app.use("/api/v1/products", productRoutes)`
