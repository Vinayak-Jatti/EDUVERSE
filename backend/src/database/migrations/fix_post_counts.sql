DROP TRIGGER IF EXISTS trg_user_post_insert;
CREATE TRIGGER trg_user_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
BEGIN
    UPDATE user_profiles
    SET post_count = post_count + 1
    WHERE user_id = NEW.user_id;
END;

DROP TRIGGER IF EXISTS trg_user_post_delete;
CREATE TRIGGER trg_user_post_delete
    AFTER UPDATE ON posts
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        UPDATE user_profiles
        SET post_count = GREATEST(post_count - 1, 0)
        WHERE user_id = OLD.user_id;
    END IF;
END;

/* SYNC EXISTING COUNTS */
UPDATE user_profiles up
SET up.post_count = (
    SELECT COUNT(*) 
    FROM posts p 
    WHERE p.user_id = up.user_id AND p.is_deleted = 0
);
