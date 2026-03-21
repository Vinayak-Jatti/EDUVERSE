-- ============================================================
-- EDUVERSE MIGRATION: 008_insights.sql
-- Description: Creates the insights table for micro-content
-- ============================================================

CREATE TABLE insights (
    id              CHAR(36)        PRIMARY KEY,
    user_id         CHAR(36)        NOT NULL,
    content         VARCHAR(500)    NOT NULL,
    visibility      ENUM('public', 'connections_only', 'private') NOT NULL DEFAULT 'public',
    
    like_count      INT             NOT NULL DEFAULT 0,
    comment_count   INT             NOT NULL DEFAULT 0,
    share_count     INT             NOT NULL DEFAULT 0,
    
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      DATETIME,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_insight_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Indexes for fast querying
CREATE INDEX idx_insights_user_created     ON insights(user_id, created_at DESC);
CREATE INDEX idx_insights_active           ON insights(is_deleted, created_at DESC);

-- ============================================================
-- TRIGGERS TO UPDATE USER POST COUNTS (Since Insights act like micro-posts)
-- ============================================================

DROP TRIGGER IF EXISTS trg_user_insight_insert;
CREATE TRIGGER trg_user_insight_insert
    AFTER INSERT ON insights
    FOR EACH ROW
BEGIN
    UPDATE user_profiles
    SET post_count = post_count + 1
    WHERE user_id = NEW.user_id;
END;

DROP TRIGGER IF EXISTS trg_user_insight_delete;
CREATE TRIGGER trg_user_insight_delete
    AFTER UPDATE ON insights
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        UPDATE user_profiles
        SET post_count = GREATEST(post_count - 1, 0)
        WHERE user_id = OLD.user_id;
    END IF;
END;
