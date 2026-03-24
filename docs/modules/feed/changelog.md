# Changelog: Feed & Interaction Module

## [1.1.0] - Polymorphic UI Updates
### Added
- Local React component cache (`setPost`) to all feed cards (Post, Insight, Stream) to enable zero-latency Optimistic Updates for likes.
- Fully functional HTML5 `<video>` state system dynamically mounted within `MasteryStreamCard.jsx` upon 'Play' clicks.
- Report actions added behind the `!isOwnPost` ownership check.

### Removed
- Exised bloat buttons (Share, Repost, Bookmark) from `PostCard.jsx`, `InsightCard.jsx`, and `MasteryStreamCard.jsx` to enforce a strict 3-Action Interaction Model (Like, Comment, Report/Delete).

### Changed
- Replaced database constraints (`fk_comment_post`) to utilize deep polymorphic schema logic on `comments` for interactions.
- Optimized and isolated the CommentSection to handle null/empty initial arrays gracefully without fatal frontend crashing.
