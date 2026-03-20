-- ============================================================
-- EDUVERSE MIGRATION: 009_squads.sql
-- Description: Creates the squads (study circles) and memberships
-- ============================================================

-- 1. Create squads table
CREATE TABLE squads (
    id              CHAR(36)        PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    avatar_url      VARCHAR(255),
    visibility      ENUM('public', 'private', 'hidden') NOT NULL DEFAULT 'public',
    created_by      CHAR(36)        NOT NULL,
    
    member_count    INT             NOT NULL DEFAULT 1,
    post_count      INT             NOT NULL DEFAULT 0,
    
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_squad_creator
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT
);

-- 2. Create squad memberships table
CREATE TABLE squad_memberships (
    squad_id        CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    role            ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
    joined_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (squad_id, user_id),
    CONSTRAINT fk_membership_squad
        FOREIGN KEY (squad_id) REFERENCES squads(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_membership_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- 3. Alter content tables to support squad-based posts
-- This allows any post or insight to be optionally assigned to a squad feed
ALTER TABLE posts 
ADD COLUMN squad_id CHAR(36) DEFAULT NULL,
ADD CONSTRAINT fk_post_squad 
    FOREIGN KEY (squad_id) REFERENCES squads(id)
    ON DELETE SET NULL;

ALTER TABLE insights 
ADD COLUMN squad_id CHAR(36) DEFAULT NULL,
ADD CONSTRAINT fk_insight_squad 
    FOREIGN KEY (squad_id) REFERENCES squads(id)
    ON DELETE SET NULL;

-- 4. Indexes for Enterprise Search & Discovery
CREATE INDEX idx_squads_visibility  ON squads(visibility, is_deleted);
CREATE INDEX idx_squads_active      ON squads(is_deleted, created_at DESC);
CREATE INDEX idx_post_squad         ON posts(squad_id);
CREATE INDEX idx_insight_squad      ON insights(squad_id);

-- ============================================================
-- TRIGGERS TO MAINTAIN MEMBER COUNTS
-- ============================================================

DELIMITER //

-- Increment count on join
CREATE TRIGGER trg_squad_member_insert
    AFTER INSERT ON squad_memberships
    FOR EACH ROW
BEGIN
    UPDATE squads
    SET member_count = member_count + 1
    WHERE id = NEW.squad_id;
END //

-- Decrement count on leave
CREATE TRIGGER trg_squad_member_delete
    AFTER DELETE ON squad_memberships
    FOR EACH ROW
BEGIN
    UPDATE squads
    SET member_count = GREATEST(member_count - 1, 1)
    WHERE id = OLD.squad_id;
END //

DELIMITER ;
