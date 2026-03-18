-- ============================================================
--  EDUVERSE — PROFILE MODULE
--  Database : MySQL 8.0+
--  Depends  : auth module (users.id)
-- ============================================================


-- ------------------------------------------------------------
--  INTEREST TAGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interest_tags (
    id          INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    name        VARCHAR(50)     NOT NULL,
    slug        VARCHAR(50)     NOT NULL,
    category    VARCHAR(50)     NOT NULL,
    is_active   TINYINT(1)      NOT NULL  DEFAULT 1,
    created_at  DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY  uq_tag_slug (slug)
);


-- ------------------------------------------------------------
--  USER PROFILES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id                  INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id             CHAR(36)        NOT NULL,

    -- Identity
    username            VARCHAR(30)     NOT NULL,
    display_name        VARCHAR(100)    NOT NULL,
    bio                 VARCHAR(300),
    avatar_url          VARCHAR(512),
    cover_url           VARCHAR(512),

    -- Education
    edu_sector          ENUM(
                            'school',
                            'college',
                            'university',
                            'self_learner',
                            'professional'
                        )               NOT NULL  DEFAULT 'college',
    institution_name    VARCHAR(150),
    field_of_study      VARCHAR(100),
    graduation_year     YEAR,

    -- Location
    city                VARCHAR(100),
    country             CHAR(2),

    -- Privacy
    visibility          ENUM(
                            'public',
                            'connections_only',
                            'private'
                        )               NOT NULL  DEFAULT 'public',
    show_email          TINYINT(1)      NOT NULL  DEFAULT 0,
    show_phone          TINYINT(1)      NOT NULL  DEFAULT 0,

    -- Social links
    website_url         VARCHAR(512),
    linkedin_url        VARCHAR(512),
    github_url          VARCHAR(512),

    -- Stats cache
    post_count          INT UNSIGNED    NOT NULL  DEFAULT 0,
    follower_count      INT UNSIGNED    NOT NULL  DEFAULT 0,
    following_count     INT UNSIGNED    NOT NULL  DEFAULT 0,

    created_at          DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                                  ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY  uq_user_profile   (user_id),
    UNIQUE KEY  uq_username       (username),

    CONSTRAINT fk_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_username_format
        CHECK (username REGEXP '^[a-z0-9_]{3,30}$'),

    CONSTRAINT chk_graduation_year
        CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1980 AND 2100)
);


-- ------------------------------------------------------------
--  PROFILE INTERESTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile_interests (
    user_id     CHAR(36)        NOT NULL,
    tag_id      INT UNSIGNED    NOT NULL,
    added_at    DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, tag_id),

    CONSTRAINT fk_pi_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pi_tag
        FOREIGN KEY (tag_id) REFERENCES interest_tags(id)
        ON DELETE CASCADE
);


-- ------------------------------------------------------------
--  USERNAME CHANGE LOG
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS username_change_log (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    user_id         CHAR(36)        NOT NULL,
    old_username    VARCHAR(30)     NOT NULL,
    new_username    VARCHAR(30)     NOT NULL,
    changed_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_ucl_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
--  INDEXES
-- ============================================================

CREATE INDEX idx_profiles_username      ON user_profiles(username);
CREATE INDEX idx_profiles_edu_sector    ON user_profiles(edu_sector);
CREATE INDEX idx_profiles_visibility    ON user_profiles(visibility);
CREATE INDEX idx_profiles_country       ON user_profiles(country);
CREATE INDEX idx_pi_tag                 ON profile_interests(tag_id);
CREATE INDEX idx_ucl_user_date          ON username_change_log(user_id, changed_at);
