# Feed & Interaction Module

## Overview
The Feed Module governs the presentation, retrieval, and interaction lifecycle of all user-generated content (`Posts`, `Insights`, `MasteryStreams`). The interaction module enforces a strict 3-action constraint across all content formats, providing a uniform, platform-wide UX behavior.

## Core Features
1. **Polymorphic Interactions:** Interactions are unified at the data layer, dynamically associating with endpoints through `targetType` fields rather than siloed table mappings. 
2. **Unified Interaction UX (3-Action Rule):**
   - **Like:** Immediate optimistic UI reaction, synced async. Toggle state format.
   - **Comment:** Deep-linked, paginated nested threads.
   - **Report / Delete:** Adaptive visibility contextual to the user session. Only the content owner sees `Delete`, while all external users see `Report`.
3. **No Redundancy:** Action bloat (such as Share, Repost, Bookmark) has been completely removed to simplify the user decision matrix.

## Core Components
- `PostCard.jsx`: Handles text and standard image uploads.
- `InsightCard.jsx`: Handles micro-content and focused text (renders with distinct visual quoting).
- `MasteryStreamCard.jsx`: Handles video-centric content with integrated HTML5 player capabilities and thumbnail states.
