-- ============================================================
--  EDUVERSE — CONVERSATION MODULE
--  Database : MySQL 8.0+
--  Depends  : auth (users)
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    type            ENUM('direct', 'group')  NOT NULL,
    name            VARCHAR(100),
    avatar_url      VARCHAR(512),
    created_by      CHAR(36)        NOT NULL,
    last_message_at DATETIME,
    is_active       TINYINT(1)      NOT NULL  DEFAULT 1,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_conv_creator
        FOREIGN KEY (created_by) REFERENCES users(id),

    CONSTRAINT chk_group_needs_name
        CHECK (type = 'direct' OR (type = 'group' AND name IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    role            ENUM('member', 'admin')  NOT NULL  DEFAULT 'member',
    last_read_at    DATETIME,
    is_muted        TINYINT(1)      NOT NULL  DEFAULT 0,
    left_at         DATETIME,
    joined_at       DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (conversation_id, user_id),

    CONSTRAINT fk_cp_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cp_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    conversation_id CHAR(36)        NOT NULL,
    sender_id       CHAR(36)        NOT NULL,
    reply_to_id     CHAR(36),
    message_type    ENUM(
                        'text',
                        'image',
                        'video',
                        'file',
                        'voice',
                        'system'
                    )               NOT NULL  DEFAULT 'text',
    content         TEXT,
    media_url       VARCHAR(512),
    media_mime      VARCHAR(100),
    media_size_kb   INT UNSIGNED,
    is_deleted      TINYINT(1)      NOT NULL  DEFAULT 0,
    deleted_at      DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_msg_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_msg_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_msg_reply
        FOREIGN KEY (reply_to_id) REFERENCES messages(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_msg_soft_delete
        CHECK (
            (is_deleted = 0 AND deleted_at IS NULL)
            OR
            (is_deleted = 1 AND deleted_at IS NOT NULL)
        )
);

CREATE TABLE IF NOT EXISTS message_reads (
    message_id      CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    read_at         DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (message_id, user_id),

    CONSTRAINT fk_mr_message
        FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mr_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS call_logs (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    conversation_id CHAR(36)        NOT NULL,
    initiated_by    CHAR(36)        NOT NULL,
    call_type       ENUM('voice', 'video')   NOT NULL,
    status          ENUM(
                        'initiated',
                        'ringing',
                        'answered',
                        'missed',
                        'declined',
                        'ended',
                        'failed'
                    )               NOT NULL  DEFAULT 'initiated',
    duration_sec    INT UNSIGNED,
    started_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    ended_at        DATETIME,

    PRIMARY KEY (id),

    CONSTRAINT fk_call_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),

    CONSTRAINT fk_call_initiator
        FOREIGN KEY (initiated_by) REFERENCES users(id),

    CONSTRAINT chk_call_duration
        CHECK (duration_sec IS NULL OR duration_sec >= 0)
);

CREATE INDEX idx_conv_participants_user     ON conversation_participants(user_id, left_at);
CREATE INDEX idx_messages_conv_created      ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender            ON messages(sender_id);
CREATE INDEX idx_message_reads_user         ON message_reads(user_id);
CREATE INDEX idx_call_logs_conv             ON call_logs(conversation_id, started_at DESC);
CREATE INDEX idx_call_logs_user             ON call_logs(initiated_by);

-- ============================================================
--  TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_message_update_conv;
CREATE TRIGGER trg_message_update_conv
    AFTER INSERT ON messages
    FOR EACH ROW
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
END;

DROP TRIGGER IF EXISTS trg_message_soft_delete;
CREATE TRIGGER trg_message_soft_delete
    BEFORE UPDATE ON messages
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = 1 AND OLD.is_deleted = 0 THEN
        SET NEW.deleted_at = NOW();
        SET NEW.content    = NULL;
        SET NEW.media_url  = NULL;
    END IF;
END;
