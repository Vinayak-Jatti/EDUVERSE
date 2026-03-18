-- Stamp revoked_at when a session is revoked
DROP TRIGGER IF EXISTS trg_sessions_revoked_at;
CREATE TRIGGER trg_sessions_revoked_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
BEGIN
    IF NEW.is_revoked = 1 AND OLD.is_revoked = 0 THEN
        SET NEW.revoked_at = NOW();
    END IF;
END;

-- Prevent un-revoking a session
DROP TRIGGER IF EXISTS trg_sessions_no_unrevoke;
CREATE TRIGGER trg_sessions_no_unrevoke
    BEFORE UPDATE ON sessions
    FOR EACH ROW
BEGIN
    IF OLD.is_revoked = 1 AND NEW.is_revoked = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot un-revoke a session. Create a new one instead.';
    END IF;
END;

-- Cleanup procedure: OTPs
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_otps()
BEGIN
    DELETE FROM otp_tokens
    WHERE (used = 1 OR expires_at < NOW())
      AND created_at < NOW() - INTERVAL 24 HOUR;
END;

-- Cleanup procedure: Sessions
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_sessions()
BEGIN
    DELETE FROM sessions
    WHERE (is_revoked = 1 OR expires_at < NOW())
      AND created_at < NOW() - INTERVAL 30 DAY;
END;

-- Log every username change automatically
DROP TRIGGER IF EXISTS trg_username_change_log;
CREATE TRIGGER trg_username_change_log
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
BEGIN
    IF OLD.username != NEW.username THEN
        INSERT INTO username_change_log (user_id, old_username, new_username)
        VALUES (OLD.user_id, OLD.username, NEW.username);
    END IF;
END;
