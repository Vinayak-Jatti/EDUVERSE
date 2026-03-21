---
description: EduVerse Official Git Branching Workflow Guide
---

ALWAYS follow the Modular Pipeline:
(1) Pull and checkout latest 'dev'.
(2) Create 'feature/module-name' from dev.
(3) Develop exclusively within that branch.

COMMIT FREQUENTLY: After any core logic, UI, or UX change.

COMMIT FORMAT: 1-2 lines, simple English in `type: description` format.
(e.g., `feat: build real-time typing indicators` or `style: add spacing to feed filters`)

FINALIZATION: Once a module is complete, raise a PR to merge feature → dev,
confirm merge success, then DELETE the feature branch locally and remotely.

SCOPE BOUNDARY: Agent authority ends at 'dev'. NEVER push directly to
'test', 'prod', or 'main'. Promotion beyond dev is handled by humans only.