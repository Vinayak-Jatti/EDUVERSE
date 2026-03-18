-- ============================================================
--  EDUVERSE — SETTINGS MODULE
--  Database : MySQL 8.0+
--  Depends  : auth (users)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_settings (
    user_id                     CHAR(36)        NOT NULL,

    -- Notification preferences
    notif_likes                 TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_comments              TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_follows               TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_connection_requests   TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_mentions              TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_community_posts       TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_messages              TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_email                 TINYINT(1)      NOT NULL  DEFAULT 1,
    notif_push                  TINYINT(1)      NOT NULL  DEFAULT 1,

    -- Privacy
    who_can_message             ENUM('everyone', 'connections', 'nobody')
                                                NOT NULL  DEFAULT 'connections',
    who_can_see_connections     ENUM('everyone', 'connections', 'nobody')
                                                NOT NULL  DEFAULT 'everyone',
    who_can_find_by_email       TINYINT(1)      NOT NULL  DEFAULT 1,
    who_can_find_by_phone       TINYINT(1)      NOT NULL  DEFAULT 1,
    read_receipts               TINYINT(1)      NOT NULL  DEFAULT 1,
    online_status_visible       TINYINT(1)      NOT NULL  DEFAULT 1,

    -- App preferences
    theme                       ENUM('light', 'dark', 'system')
                                                NOT NULL  DEFAULT 'system',
    language                    CHAR(5)         NOT NULL  DEFAULT 'en',
    timezone                    VARCHAR(60)     NOT NULL  DEFAULT 'UTC',

    -- Feed preferences
    feed_show_nsfw              TINYINT(1)      NOT NULL  DEFAULT 0,
    feed_autoplay_video         TINYINT(1)      NOT NULL  DEFAULT 1,

    updated_at                  DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                                          ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),

    CONSTRAINT fk_settings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_tokens (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id         CHAR(36)        NOT NULL,
    token           VARCHAR(512)    NOT NULL,
    platform        ENUM('ios', 'android', 'web')   NOT NULL,
    device_name     VARCHAR(200),
    is_active       TINYINT(1)      NOT NULL  DEFAULT 1,
    last_used_at    DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_push_token (token),

    CONSTRAINT fk_push_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_push_tokens_user       ON push_tokens(user_id, is_active);
