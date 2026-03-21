---
description: Antigravity — EduVerse Workspace Engineering Standard (Scalable | Secure | Modular | Responsive | Enterprise Production Grade)
---

# Antigravity — EduVerse Workspace Engineering Standard
# Scalable | Secure | Modular | Responsive | Enterprise Production Grade

═══════════════════════════════════════════════
PROJECT CONTEXT
═══════════════════════════════════════════════
This is EduVerse — an enterprise-grade education platform.
Every feature built here must be production-ready, scalable, and maintainable.
This is not a prototype. This is not an MVP. This is a live product standard.
Every module must work independently and integrate cleanly with the system.
Always consider the full user journey, not just the feature in isolation.
Every engineering decision must support long-term growth, not just current needs.

═══════════════════════════════════════════════
ARCHITECTURE & SCALABILITY
═══════════════════════════════════════════════
Always design for horizontal scalability and stateless services from day one.
Use strict modular architecture — every module is self-contained and independently operable.
No tight coupling between modules. All cross-module communication goes through services.
Business logic lives in services only — never in controllers, routes, or UI components.
Data access lives in repositories only — never in services or controllers directly.
Follow layered architecture strictly without deviation:
Route → Controller → Service → Repository → Database.
Design all APIs to be versioned, stateless, and RESTful by default.
Always consider future extension points — use strategy and factory patterns where appropriate.
Database queries must always be indexed, paginated, and bounded — never open-ended.
No N+1 queries. Ever. Use eager loading, joins, or batching appropriately.
Abstract all third-party dependencies behind service interfaces — never use them directly in logic.
Feature flags must be considered for all major feature rollouts to enable safe deployment.
Keep all environment-specific logic isolated and fully configurable via environment variables.
Design data models with normalization, relationships, and future query patterns in mind.
Event-driven patterns should be used for cross-module side effects and notifications.
Background jobs must be queue-based, retryable, and idempotent by design.
API response structure must be consistent across all endpoints — use a standard envelope.
Always version breaking API changes — never silently change existing contract behavior.
Services must be independently deployable in theory even within a monorepo structure.
Prefer configuration-driven behavior over hardcoded conditional branching.

═══════════════════════════════════════════════
PERFORMANCE & OPTIMIZATION
═══════════════════════════════════════════════
Optimize for real-world usage patterns, not just the happy path scenario.
Avoid unnecessary computations inside loops, render cycles, or hot code paths.
Memoize expensive computations. Cache frequently read, rarely changed data aggressively.
Use async/await throughout. No blocking synchronous operations on any main thread.
All promises must be properly handled — no floating promises, no unhandled rejections.
Implement pagination on every list API endpoint and every UI list or feed component.
Use lazy loading for routes, heavy components, images, and non-critical resources.
Database queries must select only required fields — never use SELECT * in production.
Compress all API responses. Avoid over-fetching and under-fetching in API design.
Frontend bundle must remain lean — audit and justify every dependency added.
Use connection pooling for all database connections — never create connections per request.
Implement query result caching at the service layer for repeated expensive reads.
Use CDN for all static assets, media, and user-uploaded content delivery.
Debounce and throttle all user-triggered search, scroll, and resize operations.
Virtual scrolling must be used for any list exceeding 50 items in the UI.
Image optimization is mandatory — use correct formats, sizes, and lazy loading always.
Avoid layout thrashing in frontend — batch DOM reads and writes separately.
Monitor and set performance budgets — page load, API response, and DB query targets.
Use database explain plans to verify query performance before shipping to production.
Background and scheduled tasks must not impact user-facing request performance.

═══════════════════════════════════════════════
UI & UX — ENTERPRISE GRADE
═══════════════════════════════════════════════
Mobile-first design is the law — design from 320px upward without exception.
Every component must be mentally verified at: 320px, 375px, 768px, 1024px, 1440px, 1920px.
No hardcoded pixel widths on any layout container — use fluid, responsive units always.
No overflow issues, no broken layouts, no content clipping at any viewport size.
Every interactive element must have distinct hover, focus, active, and disabled states.
Loading state is mandatory for every async operation — never leave UI in uncertain state.
Empty state is mandatory for every list, feed, or data-driven component in the system.
Error state is mandatory for every form submission and every data fetch operation.
Use skeleton loaders over spinners for all content-heavy or layout-defining sections.
Maintain strict visual consistency: spacing, typography, and color must follow design system.
Accessibility is not optional: semantic HTML, ARIA labels, and keyboard navigation always.
All animations must be subtle, purposeful, and respect prefers-reduced-motion setting.
Touch targets must be minimum 44x44px on all mobile interactive elements.
Forms must have inline, immediate, and clearly worded validation feedback always.
Never block the UI thread — all interactions must feel instant and responsive.
Modals, drawers, and overlays must trap focus, be dismissible, and handle scroll lock.
Navigation must be consistent, predictable, and never disorient the user mid-flow.
Font sizes must never go below 14px for body content on any device or screen.
Color contrast must meet WCAG AA minimum standards across all text and UI elements.
All user-facing copy must be clear, concise, consistent in tone, and free of jargon.
Destructive actions must always require explicit user confirmation before executing.
Success, warning, and error feedback must be visually distinct and immediately obvious.
Forms must preserve user input on validation failure — never clear fields on error.
Infinite scroll and pagination must handle edge cases: end of data, reload, back navigation.
All media — images, videos, embeds — must be responsive and constrained within containers.

═══════════════════════════════════════════════
FLEXIBILITY & MAINTAINABILITY
═══════════════════════════════════════════════
Write code that is easy to change, not just easy to write the first time.
Prefer composition over inheritance in all component and service design.
Prefer configuration-driven behavior over deeply nested conditional logic.
Every component and service must be replaceable without cascading changes elsewhere.
Abstract all third-party integrations — payment, storage, email, SMS — behind interfaces.
Constants, enums, and configuration must be centralized and never duplicated across files.
Shared utilities must be generic, well-documented, and free of business logic coupling.
All reusable UI components must accept props for customization — no hardcoded variants.
Design for testability — pure functions, dependency injection, and clear boundaries always.
Avoid global state unless absolutely necessary — prefer scoped, local, or server state.
Document architectural decisions that are non-obvious or involve meaningful tradeoffs.
Every module must have a clear README or inline documentation explaining its purpose.
Naming conventions must be consistent across the entire codebase without exception.
Folder structure must be intuitive — a new engineer must navigate it without guidance.
Refactoring must be done in dedicated commits — never mixed with feature development.
Breaking changes must be explicitly documented and communicated before merging.
Dependencies must be kept up to date — flag outdated or vulnerable packages proactively.
Prefer standard platform APIs and patterns over custom abstractions where sufficient.
Every abstraction must earn its place — no abstraction is better than a wrong abstraction.
Code reviews must consider: correctness, security, performance, and maintainability equally.
