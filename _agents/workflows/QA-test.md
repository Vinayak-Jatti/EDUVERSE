---
description: TESTING-STANDARD - Quality Assurance Protocol
---

# TESTING-STANDARD.md — Antigravity Quality Assurance Protocol
# Zero Bug Tolerance | Enterprise Grade | 10,000+ User Ready

[!CRITICAL] No module is complete until it passes every testing
layer defined in this file. Testing is not optional.
It is the final gate before any merge to dev.

═══════════════════════════════════════════════
TESTING MINDSET
═══════════════════════════════════════════════
Test like a hostile user, not like the developer who built it.
Assume the network is slow, the device is cheap, the user is impatient.
Assume the database is under load, the API is timing out, the input is malicious.
Every test must simulate real-world conditions — not ideal lab conditions.
A feature that works only on your machine is not a feature. It is a liability.
Testing is not a phase. It is woven into every step of development.

═══════════════════════════════════════════════
LAYER 1 — UNIT TESTING
═══════════════════════════════════════════════
Every service function must have isolated unit tests.
Every utility function must have isolated unit tests.
Every repository function must have isolated unit tests.
Test the happy path, the edge case, and the failure case — all three always.
Mock all external dependencies — database, APIs, file system, queues.
No test should depend on another test to pass — full isolation mandatory.
Minimum coverage targets:
  → Services: 90% line coverage minimum
  → Utilities: 95% line coverage minimum
  → Repositories: 85% line coverage minimum
  → Controllers: 80% line coverage minimum
Test naming must clearly describe: what is tested, under what condition,
and what the expected outcome is.
Format: describe('[Unit]').it('should [outcome] when [condition]')
No test should take longer than 100ms to execute in isolation.
All edge cases must be explicitly tested:
  → Empty string inputs
  → Null and undefined values
  → Zero and negative numbers
  → Extremely large payloads
  → Duplicate entries
  → Boundary values at min and max limits

═══════════════════════════════════════════════
LAYER 2 — INTEGRATION TESTING
═══════════════════════════════════════════════
Every API endpoint must have full integration tests.
Test the complete request-response cycle for every route.
Use a dedicated test database — never run integration tests on dev or prod data.
Seed test data before each test suite. Clean up after each suite completes.
Every integration test must verify:
  → Correct HTTP status code returned
  → Correct response body structure and data types
  → Correct database state after the operation
  → Correct error response when invalid data is sent
  → Correct behavior when auth token is missing or expired
  → Correct behavior when required fields are missing
  → Correct behavior when duplicate data is submitted
Test all authentication and authorization boundaries explicitly:
  → Unauthenticated requests to protected routes return 401
  → Unauthorized role accessing restricted resource returns 403
  → Valid token with correct role accesses resource successfully
  → Expired token is rejected with correct error response
Test all validation boundaries:
  → Fields below minimum length are rejected
  → Fields above maximum length are rejected
  → Invalid formats (email, phone, date) are rejected
  → SQL injection attempts are sanitized and rejected
  → XSS payloads in body fields are sanitized and rejected
  → Malformed JSON body returns 400 with clear error message

═══════════════════════════════════════════════
LAYER 3 — LOAD & STRESS TESTING
═══════════════════════════════════════════════
Every critical endpoint must be load tested before module sign-off.
Minimum load test targets for EduVerse:
  → Sustained load: 10,000 concurrent users without degradation
  → Peak spike: 25,000 concurrent users — system must not crash
  → Ramp up: gradual increase from 0 to 10,000 over 5 minutes
  → Soak test: 5,000 users sustained for 30 minutes minimum
Performance thresholds that must be met under full load:
  → API response time P50: under 200ms
  → API response time P95: under 500ms
  → API response time P99: under 1000ms
  → Error rate under load: below 0.1% at 10,000 concurrent users
  → Zero memory leaks detected during soak test duration
  → Zero database connection pool exhaustion under peak load
  → CPU utilization must not exceed 70% under sustained load
  → Database query time P95 must remain under 100ms under load
Test database behavior under load:
  → Connection pool holds under concurrent requests
  → Indexes are being used — verify with explain plans under load
  → No deadlocks occurring under concurrent write operations
  → Pagination prevents unbounded query results under high volume
Tools to use: k6, Artillery, or Apache JMeter for load simulation.
Document load test results in /docs/[module]/load-test-results.md

═══════════════════════════════════════════════
LAYER 4 — SECURITY TESTING
═══════════════════════════════════════════════
Every module must pass security testing before merge.
Authentication Testing:
  → Brute force attack simulation on login endpoint
  → Token replay attack — expired tokens must be rejected
  → Token tampering — modified JWT signature must be rejected
  → Session fixation — verify session regenerates after login
  → Concurrent session handling verified and documented
Input Security Testing:
  → SQL injection on all query parameters and body fields
  → NoSQL injection on all MongoDB query inputs
  → XSS payload injection in all text input fields
  → Command injection in any field that touches file system
  → Path traversal in any file upload or download endpoint
  → CSRF token validation on all state-changing operations
  → Mass assignment attack — only whitelisted fields accepted
API Security Testing:
  → Rate limiting verified — limits enforced and 429 returned
  → CORS policy verified — only allowed origins accepted
  → HTTP security headers verified on all responses
  → Sensitive data never appears in URL query parameters
  → Internal error details never exposed in API responses
  → API versioning verified — old versions reject deprecated calls
  → File upload validated for type, size, and content (not extension)
Infrastructure Security:
  → Environment variables verified — no secrets in codebase
  → Dependencies scanned for known CVEs before shipping
  → Error logs verified — no PII or credentials in log output

═══════════════════════════════════════════════
LAYER 5 — PERFORMANCE & OPTIMIZATION TESTING
═══════════════════════════════════════════════
Frontend Performance Targets (Lighthouse scores minimum):
  → Performance score: 90+ on mobile, 95+ on desktop
  → First Contentful Paint: under 1.5s on mobile network
  → Largest Contentful Paint: under 2.5s on mobile network
  → Time to Interactive: under 3.5s on mobile network
  → Cumulative Layout Shift: under 0.1 — zero layout jumps
  → Total Blocking Time: under 200ms on mobile network
  → Bundle size: audit and justify every dependency added
  → No render-blocking resources on critical path
  → All images lazy loaded, correctly sized, modern format
  → Fonts loaded with font-display swap — no invisible text
Backend Performance Targets:
  → All database queries verified with explain plan
  → All indexes confirmed active and used by query planner
  → No query returns unbounded results — pagination enforced
  → No N+1 queries exist anywhere in codebase
  → Connection pooling verified and correctly configured
  → Response compression enabled and verified on all routes
  → Cache hit rate monitored and optimized for read-heavy routes
Animation Performance:
  → All animations run at 60fps — verified with DevTools profiler
  → No animations cause layout recalculation or paint operations
  → All transitions use transform and opacity only — GPU accelerated
  → No janky scroll, no frame drops during list rendering
  → Reduced motion media query respected for all animations
  → Animation performance verified on low-end Android device

═══════════════════════════════════════════════
LAYER 6 — DEVICE & COMPATIBILITY TESTING
═══════════════════════════════════════════════
Every UI module must be verified on ALL of the following:

MOBILE DEVICES (mandatory):
  → iPhone SE (375px) — smallest modern iPhone
  → iPhone 14 Pro (393px) — standard modern iPhone
  → iPhone 14 Pro Max (430px) — large iPhone
  → Samsung Galaxy S23 (360px) — standard Android
  → Samsung Galaxy A series (412px) — mid-range Android
  → Google Pixel 7 (412px) — stock Android reference

TABLET DEVICES (mandatory):
  → iPad Mini (768px)
  → iPad Air (820px)
  → iPad Pro 11" (1024px)
  → Samsung Galaxy Tab (800px)

DESKTOP (mandatory):
  → Small laptop (1280px)
  → Standard desktop (1440px)
  → Large desktop (1920px)
  → 4K display (2560px+)

BROWSERS (mandatory on each device category):
  → Chrome (latest) — primary
  → Safari (latest) — critical for iOS
  → Firefox (latest)
  → Samsung Internet — critical for Android mid-range
  → Edge (latest)

For each device and browser verify:
  → Layout renders correctly with no overflow or clipping
  → All touch targets minimum 44x44px on mobile
  → Tap events respond immediately — no 300ms delay
  → Scroll is smooth — no jank or stutter
  → Fonts render correctly — no system font fallback breaking layout
  → Images load and display correctly at all resolutions
  → Forms are usable with on-screen keyboard open
  → No horizontal scroll appears on any viewport
  → Safe area insets respected on notched devices
  → Landscape orientation layout verified on mobile and tablet

═══════════════════════════════════════════════
LAYER 7 — ACCESSIBILITY TESTING
═══════════════════════════════════════════════
Every module must meet WCAG 2.1 AA standard minimum.
  → All images have descriptive alt text
  → All form fields have associated label elements
  → All interactive elements are keyboard navigable
  → Focus order is logical and follows visual layout
  → Focus indicator is clearly visible on all interactive elements
  → Color contrast ratio minimum 4.5:1 for normal text
  → Color contrast ratio minimum 3:1 for large text and UI components
  → No information conveyed by color alone
  → All modals trap focus and return focus on close
  → Screen reader announces dynamic content changes via ARIA live
  → Error messages are associated with their form fields via ARIA
  → Page has one H1. Heading hierarchy is logical and sequential.
  → Skip navigation link provided for keyboard users

═══════════════════════════════════════════════
LAYER 8 — RELIABILITY & RESILIENCE TESTING
═══════════════════════════════════════════════
Simulate real-world failure conditions on every module:
Network Failure Scenarios:
  → API call fails mid-request — UI shows error state gracefully
  → Network drops during file upload — handled without data loss
  → Slow 3G network — UI remains usable, skeleton loaders shown
  → Complete offline state — app degrades gracefully
  → Request timeout — user informed, retry option provided
Server Failure Scenarios:
  → Service returns 500 — handled gracefully, user not stranded
  → Database connection lost — circuit breaker activates correctly
  → Third party API down — fallback behavior verified
  → Response returns empty array — empty state renders correctly
  → Response returns malformed JSON — error caught and handled
Data Edge Cases:
  → User with zero content — empty states render correctly
  → User with maximum content volume — pagination holds correctly
  → Concurrent writes to same resource — no race conditions
  → Duplicate submission prevention — idempotency verified
  → Large file upload at limit boundary — handled correctly
  → Special characters in all text fields — rendered safely

═══════════════════════════════════════════════
MODULE SIGN-OFF CRITERIA
═══════════════════════════════════════════════
A module is only complete when ALL of the following are true:
[ ] Unit tests written and passing at coverage targets
[ ] Integration tests written and passing