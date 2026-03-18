-- ============================================================
--  EDUVERSE — INTERACTION MODULE
--  Database : MySQL 8.0+
--  Depends  : auth (users), feed (posts)
-- ============================================================

CREATE TABLE IF NOT EXISTS likes (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id         CHAR(36)        NOT NULL,
    target_type     ENUM('post', 'comment')  NOT NULL,
    target_id       CHAR(36)        NOT NULL,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_like (user_id, target_type, target_id),

    CONSTRAINT fk_like_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    post_id         CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    parent_id       CHAR(36),
    body            TEXT            NOT NULL,
    like_count      INT UNSIGNED    NOT NULL  DEFAULT 0,
    reply_count     INT UNSIGNED    NOT NULL  DEFAULT 0,
    is_deleted      TINYINT(1)      NOT NULL  DEFAULT 0,
    deleted_at      DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_comment_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_parent
        FOREIGN KEY (parent_id) REFERENCES comments(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_comment_soft_delete
        CHECK (
            (is_deleted = 0 AND deleted_at IS NULL)
            OR
            (is_deleted = 1 AND deleted_at IS NOT NULL)
        )
);

CREATE TABLE IF NOT EXISTS saves (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id         CHAR(36)        NOT NULL,
    post_id         CHAR(36)        NOT NULL,
    collection_name VARCHAR(100)    NOT NULL  DEFAULT 'default',
    saved_at        DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_save (user_id, post_id),

    CONSTRAINT fk_save_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_save_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shares (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id         CHAR(36)        NOT NULL,
    post_id         CHAR(36)        NOT NULL,
    platform        ENUM(
                        'internal',
                        'whatsapp',
                        'twitter',
                        'linkedin',
                        'copy_link'
                    )               NOT NULL  DEFAULT 'internal',
    shared_at       DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_share_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_share_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    recipient_id    CHAR(36)        NOT NULL,
    actor_id        CHAR(36),
    type            ENUM(
                        'like_post',
                        'like_comment',
                        'comment_post',
                        'reply_comment',
                        'new_follower',
                        'connection_request',
                        'connection_accepted',
                        'community_invite',
                        'post_in_community',
                        'mention',
                        'system'
                    )               NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    VARCHAR(36),
    message         VARCHAR(300),
    is_read         TINYINT(1)      NOT NULL  DEFAULT 0,
    read_at         DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_notif_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notif_actor
        FOREIGN KEY (actor_id) REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_notif_read
        CHECK (
            (is_read = 0 AND read_at IS NULL)
            OR
            (is_read = 1 AND read_at IS NOT NULL)
        )
);

CREATE INDEX idx_likes_target           ON likes(target_type, target_id);
CREATE INDEX idx_likes_user             ON likes(user_id, created_at DESC);

CREATE INDEX idx_comments_post          ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_parent        ON comments(parent_id);
CREATE INDEX idx_comments_user          ON comments(user_id);

CREATE INDEX idx_saves_user             ON saves(user_id, saved_at DESC);
CREATE INDEX idx_saves_collection       ON saves(user_id, collection_name);

CREATE INDEX idx_shares_post            ON shares(post_id);

CREATE INDEX idx_notif_recipient        ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notif_unread           ON notifications(recipient_id, is_read);

-- ============================================================
--  TRIGGERS — keep cached counters in sync
-- ============================================================

DROP TRIGGER IF EXISTS trg_like_insert;
CREATE TRIGGER trg_like_insert
    AFTER INSERT ON likes
    FOR EACH ROW
BEGIN
    IF NEW.target_type = 'post' THEN
        UPDATE posts    SET like_count    = like_count + 1    WHERE id = NEW.target_id;
    ELSEIF NEW.target_type = 'comment' THEN
        UPDATE comments SET like_count    = like_count + 1    WHERE id = NEW.target_id;
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
    END IF;
END;

DROP TRIGGER IF EXISTS trg_comment_insert;
CREATE TRIGGER trg_comment_insert
    AFTER INSERT ON comments
    FOR EACH ROW
BEGIN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    IF NEW.parent_id IS NOT NULL THEN
        UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
END;

DROP TRIGGER IF EXISTS trg_comment_soft_delete;
CREATE TRIGGER trg_comment_soft_delete
    BEFORE UPDATE ON comments
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        SET NEW.deleted_at = NOW();
    END IF;
END;

DROP TRIGGER IF EXISTS trg_comment_delete;
CREATE TRIGGER trg_comment_delete
    AFTER UPDATE ON comments
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.parent_id;
        END IF;
    END IF;
END;

DROP TRIGGER IF EXISTS trg_save_insert;
CREATE TRIGGER trg_save_insert
    AFTER INSERT ON saves
    FOR EACH ROW
BEGIN
    UPDATE posts SET save_count = save_count + 1 WHERE id = NEW.post_id;
END;

DROP TRIGGER IF EXISTS trg_save_delete;
CREATE TRIGGER trg_save_delete
    AFTER DELETE ON saves
    FOR EACH ROW
BEGIN
    UPDATE posts SET save_count = GREATEST(save_count - 1, 0) WHERE id = OLD.post_id;
END;

DROP TRIGGER IF EXISTS trg_share_insert;
CREATE TRIGGER trg_share_insert
    AFTER INSERT ON shares
    FOR EACH ROW
BEGIN
    UPDATE posts SET share_count = share_count + 1 WHERE id = NEW.post_id;
END;

DROP TRIGGER IF EXISTS trg_notification_read;
CREATE TRIGGER trg_notification_read
    BEFORE UPDATE ON notifications
    FOR EACH ROW
BEGIN
    IF NEW.is_read = 1 AND OLD.is_read = 0 THEN
        SET NEW.read_at = NOW();
    END IF;
END;
