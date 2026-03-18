-- ============================================================
--  EDUVERSE — AUTH MODULE
--  Database : MySQL 8.0+
--  Schema   : Authentication & Session Management
-- ============================================================


-- ------------------------------------------------------------
--  USERS
--  Core identity. One row per real person.
--  Never stores passwords here — that lives in user_auth_providers.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  CHAR(36)        NOT NULL  DEFAULT (UUID()),
    email               VARCHAR(255)    UNIQUE,
    phone               VARCHAR(20)     UNIQUE,
    status              ENUM(
                            'pending',
                            'active',
                            'suspended',
                            'banned',
                            'deactivated'
                        )               NOT NULL  DEFAULT 'pending',
    email_verified      TINYINT(1)      NOT NULL  DEFAULT 0,
    phone_verified      TINYINT(1)      NOT NULL  DEFAULT 0,
    last_login_at       DATETIME,
    failed_login_count  TINYINT         NOT NULL  DEFAULT 0,
    locked_until        DATETIME,
    deleted_at          DATETIME,
    created_at          DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                                  ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT chk_users_contact    CHECK (email IS NOT NULL OR phone IS NOT NULL),
    CONSTRAINT chk_users_phone      CHECK (phone REGEXP '^\\+[1-9][0-9]{6,14}$')
);


-- ------------------------------------------------------------
--  USER AUTH PROVIDERS
--  One row per login method per user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_auth_providers (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    provider        ENUM(
                        'password',
                        'google',
                        'github'
                    )               NOT NULL,
    provider_uid    VARCHAR(255),
    password_hash   VARCHAR(255),
    linked_at       DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_provider_per_user  (user_id, provider),
    UNIQUE  KEY uq_provider_uid       (provider, provider_uid),

    CONSTRAINT fk_providers_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_oauth_must_have_uid
        CHECK (
            (provider = 'password' AND provider_uid IS NULL)
            OR
            (provider != 'password' AND provider_uid IS NOT NULL)
        ),

    CONSTRAINT chk_password_must_have_hash
        CHECK (
            (provider = 'password' AND password_hash IS NOT NULL)
            OR
            (provider != 'password' AND password_hash IS NULL)
        )
);


-- ------------------------------------------------------------
--  OTP TOKENS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_tokens (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    purpose         ENUM(
                        'signup',
                        'login',
                        'password_reset',
                        'email_change',
                        'phone_verify'
                    )               NOT NULL,
    target          VARCHAR(320)    NOT NULL,
    otp_hash        VARCHAR(255)    NOT NULL,
    attempt_count   TINYINT         NOT NULL  DEFAULT 0,
    max_attempts    TINYINT         NOT NULL  DEFAULT 3,
    used            TINYINT(1)      NOT NULL  DEFAULT 0,
    expires_at      DATETIME        NOT NULL,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_otp_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_otp_attempts
        CHECK (attempt_count >= 0 AND attempt_count <= max_attempts)
);


-- ------------------------------------------------------------
--  SESSIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id              CHAR(36)        NOT NULL  DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    jwt_jti         CHAR(36)        NOT NULL  DEFAULT (UUID()),
    device_name     VARCHAR(200),
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    is_revoked      TINYINT(1)      NOT NULL  DEFAULT 0,
    revoked_at      DATETIME,
    expires_at      DATETIME        NOT NULL,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_jwt_jti (jwt_jti),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_revoke_consistency
        CHECK (
            (is_revoked = 0 AND revoked_at IS NULL)
            OR
            (is_revoked = 1 AND revoked_at IS NOT NULL)
        )
);


-- ============================================================
--  INDEXES
-- ============================================================

CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_phone        ON users(phone);
CREATE INDEX idx_users_status       ON users(status);

CREATE INDEX idx_otp_user_purpose   ON otp_tokens(user_id, purpose, expires_at);

CREATE INDEX idx_sessions_user      ON sessions(user_id, is_revoked);
CREATE INDEX idx_sessions_jti       ON sessions(jwt_jti, is_revoked);
CREATE INDEX idx_sessions_expiry    ON sessions(expires_at);


-- ============================================================
--  TRIGGERS & PROCEDURES (Note: Must be run with DELIMITER or separately)
-- ============================================================
