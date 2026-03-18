-- ============================================================
--  EDUVERSE — CONNECTION MODULE
--  Database : MySQL 8.0+
--  Depends  : auth (users), profile (user_profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS connections (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    requester_id    CHAR(36)        NOT NULL,
    addressee_id    CHAR(36)        NOT NULL,
    status          ENUM(
                        'pending',
                        'accepted',
                        'declined',
                        'blocked'
                    )               NOT NULL  DEFAULT 'pending',
    actioned_at     DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_connection (requester_id, addressee_id),

    CONSTRAINT fk_conn_requester
        FOREIGN KEY (requester_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conn_addressee
        FOREIGN KEY (addressee_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_conn_no_self
        CHECK (requester_id != addressee_id)
);

CREATE TABLE IF NOT EXISTS blocks (
    blocker_id      CHAR(36)        NOT NULL,
    blocked_id      CHAR(36)        NOT NULL,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (blocker_id, blocked_id),

    CONSTRAINT fk_block_blocker
        FOREIGN KEY (blocker_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_block_blocked
        FOREIGN KEY (blocked_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_block_no_self
        CHECK (blocker_id != blocked_id)
);

CREATE TABLE IF NOT EXISTS follows (
    follower_id     CHAR(36)        NOT NULL,
    following_id    CHAR(36)        NOT NULL,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (follower_id, following_id),

    CONSTRAINT fk_follow_follower
        FOREIGN KEY (follower_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_follow_following
        FOREIGN KEY (following_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_follow_no_self
        CHECK (follower_id != following_id)
);

CREATE INDEX idx_conn_addressee         ON connections(addressee_id, status);
CREATE INDEX idx_conn_requester         ON connections(requester_id, status);
CREATE INDEX idx_conn_status            ON connections(status);

CREATE INDEX idx_blocks_blocked         ON blocks(blocked_id);

CREATE INDEX idx_follows_following      ON follows(following_id, created_at DESC);
CREATE INDEX idx_follows_follower       ON follows(follower_id,  created_at DESC);

-- ============================================================
--  TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_connection_actioned;
CREATE TRIGGER trg_connection_actioned
    BEFORE UPDATE ON connections
    FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        SET NEW.actioned_at = NOW();
    END IF;
END;

DROP TRIGGER IF EXISTS trg_follow_insert;
CREATE TRIGGER trg_follow_insert
    AFTER INSERT ON follows
    FOR EACH ROW
BEGIN
    UPDATE user_profiles SET follower_count  = follower_count  + 1 WHERE user_id = NEW.following_id;
    UPDATE user_profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
END;

DROP TRIGGER IF EXISTS trg_follow_delete;
CREATE TRIGGER trg_follow_delete
    AFTER DELETE ON follows
    FOR EACH ROW
BEGIN
    UPDATE user_profiles SET follower_count  = GREATEST(follower_count  - 1, 0) WHERE user_id = OLD.following_id;
    UPDATE user_profiles SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
END;
