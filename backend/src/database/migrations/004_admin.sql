-- ============================================================
--  EDUVERSE — ADMIN MODULE
--  Database : MySQL 8.0+
--  Depends  : auth (users)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id         CHAR(36)        NOT NULL,
    role            ENUM(
                        'super_admin',
                        'moderator',
                        'support',
                        'analyst'
                    )               NOT NULL  DEFAULT 'support',
    is_active       TINYINT(1)      NOT NULL  DEFAULT 1,
    granted_by      INT UNSIGNED,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_user (user_id),

    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_admin_granted_by
        FOREIGN KEY (granted_by) REFERENCES admin_users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id              BIGINT UNSIGNED NOT NULL  AUTO_INCREMENT,
    admin_id        INT UNSIGNED    NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    target_type     VARCHAR(50),
    target_id       VARCHAR(36),
    reason          TEXT,
    metadata        JSON,
    ip_address      VARCHAR(45),
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_audit_admin
        FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);

CREATE TABLE IF NOT EXISTS announcements (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    created_by      INT UNSIGNED    NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    body            TEXT            NOT NULL,
    type            ENUM(
                        'info',
                        'warning',
                        'maintenance',
                        'feature'
                    )               NOT NULL  DEFAULT 'info',
    target_audience ENUM(
                        'all',
                        'students',
                        'admins'
                    )               NOT NULL  DEFAULT 'all',
    starts_at       DATETIME        NOT NULL,
    ends_at         DATETIME,
    is_active       TINYINT(1)      NOT NULL  DEFAULT 1,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_ann_admin
        FOREIGN KEY (created_by) REFERENCES admin_users(id),

    CONSTRAINT chk_ann_dates
        CHECK (ends_at IS NULL OR ends_at > starts_at)
);


CREATE INDEX idx_audit_admin        ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_audit_target       ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_ann_active         ON announcements(is_active, starts_at, ends_at);
