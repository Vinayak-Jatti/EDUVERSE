DELIMITER //

DROP TRIGGER IF EXISTS trg_connection_stats_update //
CREATE TRIGGER trg_connection_stats_update 
AFTER UPDATE ON connections 
FOR EACH ROW 
BEGIN 
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN 
        UPDATE user_profiles SET connection_count = connection_count + 1 WHERE user_id = NEW.requester_id; 
        UPDATE user_profiles SET connection_count = connection_count + 1 WHERE user_id = NEW.addressee_id; 
    END IF; 
END //

DROP TRIGGER IF EXISTS trg_connection_stats_delete //
CREATE TRIGGER trg_connection_stats_delete 
AFTER DELETE ON connections 
FOR EACH ROW 
BEGIN 
    IF OLD.status = 'accepted' THEN 
        UPDATE user_profiles SET connection_count = GREATEST(connection_count - 1, 0) WHERE user_id = OLD.requester_id; 
        UPDATE user_profiles SET connection_count = GREATEST(connection_count - 1, 0) WHERE user_id = OLD.addressee_id; 
    END IF; 
END //

DELIMITER ;
