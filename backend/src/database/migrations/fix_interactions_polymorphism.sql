-- ============================================================
-- FIX: POLYMORPHIC INTERACTIONS (POSTS, INSIGHTS, VIDEOS)
-- ============================================================

-- 1. Update Likes to support Insights
ALTER TABLE likes MODIFY target_type ENUM('post', 'comment', 'insight') NOT NULL;

-- 2. Update Like Triggers to handle Insights
DROP TRIGGER IF EXISTS trg_like_insert;
CREATE TRIGGER trg_like_insert
    AFTER INSERT ON likes
    FOR EACH ROW
BEGIN
    IF NEW.target_type = 'post' THEN
        UPDATE posts    SET like_count    = like_count + 1    WHERE id = NEW.target_id;
    ELSEIF NEW.target_type = 'comment' THEN
        UPDATE comments SET like_count    = like_count + 1    WHERE id = NEW.target_id;
    ELSEIF NEW.target_type = 'insight' THEN
        UPDATE insights SET like_count    = like_count + 1    WHERE id = NEW.target_id;
    END IF;
END;

DROP TRIGGER IF EXISTS trg_like_delete;
CREATE TRIGGER trg_like_delete
    AFTER DELETE ON likes
    FOR EACH ROW
BEGIN
    IF OLD.target_type = 'post' THEN
        UPDATE posts    SET like_count    = GREATEST(like_count - 1, 0)    WHERE id = OLD.target_id;
    ELSEIF OLD.target_type = 'comment' THEN
        UPDATE comments SET like_count    = GREATEST(like_count - 1, 0)    WHERE id = OLD.target_id;
    ELSEIF OLD.target_type = 'insight' THEN
        UPDATE insights SET like_count    = GREATEST(like_count - 1, 0)    WHERE id = OLD.target_id;
    END IF;
END;

-- 3. Update Comments to be polymorphic (Removing strict FK to posts)
-- We'll add target_type and change post_id to target_id (generic)
-- For backward compatibility we keep post_id but make it NULLable or just Add target_type.
-- Best: Add target_type to comments.

ALTER TABLE comments ADD COLUMN target_type ENUM('post', 'insight') NOT NULL DEFAULT 'post' AFTER user_id;
ALTER TABLE comments MODIFY post_id CHAR(36) NULL; -- Rename it mentally to target_id if we want, but let's keep name.

-- 4. Update Comment Triggers
DROP TRIGGER IF EXISTS trg_comment_insert;
CREATE TRIGGER trg_comment_insert
    AFTER INSERT ON comments
    FOR EACH ROW
BEGIN
    IF NEW.target_type = 'post' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSEIF NEW.target_type = 'insight' THEN
        UPDATE insights SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
    
    IF NEW.parent_id IS NOT NULL THEN
        UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
END;

DROP TRIGGER IF EXISTS trg_comment_delete;
CREATE TRIGGER trg_comment_delete
    AFTER UPDATE ON comments
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        IF OLD.target_type = 'post' THEN
            UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        ELSEIF OLD.target_type = 'insight' THEN
            UPDATE insights SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        END IF;

        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.parent_id;
        END IF;
    END IF;
END;

-- 5. Update Reports to support Insights
ALTER TABLE reports MODIFY target_type ENUM('user', 'post', 'comment', 'community', 'message', 'insight') NOT NULL;
