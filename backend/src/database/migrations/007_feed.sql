-- ============================================================
--  EDUVERSE — FEED MODULE
--  Database : MySQL 8.0+
--  Depends  : auth module (users.id), profile module (user_profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    community_id    CHAR(36),
    post_type       ENUM(
                        'text',
                        'image',
                        'video',
                        'news_link',
                        'poll'
                    )               NOT NULL  DEFAULT 'text',
    title           VARCHAR(300),
    body            TEXT,
    link_url        VARCHAR(512),
    link_preview    JSON,
    visibility      ENUM(
                        'public',
                        'connections_only',
                        'community_only',
                        'private'
                    )               NOT NULL  DEFAULT 'public',

    -- Cached counters
    like_count      INT UNSIGNED    NOT NULL  DEFAULT 0,
    comment_count   INT UNSIGNED    NOT NULL  DEFAULT 0,
    save_count      INT UNSIGNED    NOT NULL  DEFAULT 0,
    share_count     INT UNSIGNED    NOT NULL  DEFAULT 0,
    view_count      INT UNSIGNED    NOT NULL  DEFAULT 0,

    is_pinned       TINYINT(1)      NOT NULL  DEFAULT 0,
    is_deleted      TINYINT(1)      NOT NULL  DEFAULT 0,
    deleted_at      DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_post_soft_delete
        CHECK (
            (is_deleted = 0 AND deleted_at IS NULL)
            OR
            (is_deleted = 1 AND deleted_at IS NOT NULL)
        )
);

CREATE TABLE IF NOT EXISTS post_media (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    post_id         CHAR(36)        NOT NULL,
    media_type      ENUM(
                        'image',
                        'video',
                        'thumbnail'
                    )               NOT NULL,
    url             VARCHAR(512)    NOT NULL,
    mime_type       VARCHAR(100),
    file_size_kb    INT UNSIGNED,
    width_px        SMALLINT UNSIGNED,
    height_px       SMALLINT UNSIGNED,
    duration_sec    SMALLINT UNSIGNED,
    display_order   TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_media_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_options (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    post_id         CHAR(36)        NOT NULL,
    option_text     VARCHAR(200)    NOT NULL,
    display_order   TINYINT UNSIGNED NOT NULL DEFAULT 0,
    vote_count      INT UNSIGNED    NOT NULL  DEFAULT 0,

    PRIMARY KEY (id),

    CONSTRAINT fk_poll_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_votes (
    user_id         CHAR(36)        NOT NULL,
    post_id         CHAR(36)        NOT NULL,
    option_id       INT UNSIGNED    NOT NULL,
    voted_at        DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, post_id),

    CONSTRAINT fk_vote_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_option
        FOREIGN KEY (option_id) REFERENCES poll_options(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communities (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    creator_id      CHAR(36)        NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    description     TEXT,
    avatar_url      VARCHAR(512),
    cover_url       VARCHAR(512),
    category        VARCHAR(50),
    visibility      ENUM(
                        'public',
                        'private',
                        'invite_only'
                    )               NOT NULL  DEFAULT 'public',
    member_count    INT UNSIGNED    NOT NULL  DEFAULT 0,
    post_count      INT UNSIGNED    NOT NULL  DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL  DEFAULT 1,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_community_slug (slug),

    CONSTRAINT fk_community_creator
        FOREIGN KEY (creator_id) REFERENCES users(id),

    CONSTRAINT chk_community_slug
        CHECK (slug REGEXP '^[a-z0-9-]{3,100}$')
);

CREATE TABLE IF NOT EXISTS community_members (
    community_id    CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    role            ENUM(
                        'member',
                        'moderator',
                        'admin'
                    )               NOT NULL  DEFAULT 'member',
    invite_by       CHAR(36),
    joined_at       DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (community_id, user_id),

    CONSTRAINT fk_cm_community
        FOREIGN KEY (community_id) REFERENCES communities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cm_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cm_invite_by
        FOREIGN KEY (invite_by) REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_posts_user_created     ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_community        ON posts(community_id, created_at DESC);
CREATE INDEX idx_posts_type             ON posts(post_type);
CREATE INDEX idx_posts_visibility       ON posts(visibility);
CREATE INDEX idx_posts_active           ON posts(is_deleted, created_at DESC);

CREATE INDEX idx_media_post             ON post_media(post_id, display_order);

CREATE INDEX idx_communities_slug       ON communities(slug);
CREATE INDEX idx_communities_category   ON communities(category);
CREATE INDEX idx_communities_visibility ON communities(visibility);

CREATE INDEX idx_cm_user                ON community_members(user_id);

-- ============================================================
--  TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_post_soft_delete;
CREATE TRIGGER trg_post_soft_delete
    BEFORE UPDATE ON posts
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        SET NEW.deleted_at = NOW();
    END IF;
END;

DROP TRIGGER IF EXISTS trg_community_member_insert;
CREATE TRIGGER trg_community_member_insert
    AFTER INSERT ON community_members
    FOR EACH ROW
BEGIN
    UPDATE communities
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
END;

DROP TRIGGER IF EXISTS trg_community_member_delete;
CREATE TRIGGER trg_community_member_delete
    AFTER DELETE ON community_members
    FOR EACH ROW
BEGIN
    UPDATE communities
    SET member_count = GREATEST(member_count - 1, 0)
    WHERE id = OLD.community_id;
END;

DROP TRIGGER IF EXISTS trg_community_post_insert;
CREATE TRIGGER trg_community_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
BEGIN
    IF NEW.community_id IS NOT NULL THEN
        UPDATE communities
        SET post_count = post_count + 1
        WHERE id = NEW.community_id;
    END IF;
END;

DROP TRIGGER IF EXISTS trg_community_post_delete;
CREATE TRIGGER trg_community_post_delete
    AFTER UPDATE ON posts
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 AND OLD.community_id IS NOT NULL THEN
        UPDATE communities
        SET post_count = GREATEST(post_count - 1, 0)
        WHERE id = OLD.community_id;
    END IF;
END;
