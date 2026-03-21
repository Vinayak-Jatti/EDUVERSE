---
description: EduVerse Documentation Standard — Mandatory Modular Documentation Workflow
---

# EduVerse Documentation Standard
# Persistent | Traceable | Enterprise-Grade Documentation

═══════════════════════════════════════════════
STRUCTURE & PLACEMENT
═══════════════════════════════════════════════
All project documentation must be centralized in the `/docs` directory.
The documentation tree must be organized by module to mirror the codebase.

### Mandatory Folder Structure:
`/docs`
  `/[module-name]` (e.g., auth, feed, payments)
    `api.md`         → Detailed description of all module-specific API endpoints.
    `schema.md`      → Data models, fields, indexes, and relationship maps.
    `module.md`      → Architectural overview, business rules, and logic flow.
    `changelog.md`   → Sequential log of what was changed, when, and why.

  `ONBOARDING.md`    → Quick-start guide: setup, tech stack, and project folder roadmap.
  `ENVIRONMENT.md`   → Comprehensive list of all environment variables with descriptions.

═══════════════════════════════════════════════
THE "DOCS-AS-CODE" GOLDEN RULES
═══════════════════════════════════════════════
1. **Modular Isolation**: Every new module or significant feature MUST have its own `/docs/[module-name]/` directory.
2. **Mandatory Quartet**: Every module folder MUST contain all four files: `api.md`, `schema.md`, `module.md`, and `changelog.md`.
3. **Atomic Documentation**: Documentation MUST be updated in the SAME commit as the code change. Never commit code without updating its corresponding documentation.
4. **No Drift**: Outdated documentation is a critical bug. Identify, flag, and fix documentation drift immediately.
5. **Human-Readable**: Write documentation in clear, concise, professional English designed for a senior engineer's onboarding experience.
