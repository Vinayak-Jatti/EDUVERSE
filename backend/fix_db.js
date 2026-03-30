import pool from './src/config/db.js';

const sql = `
CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    room_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    content TEXT,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    status ENUM('sent', 'delivered', 'seen') NOT NULL DEFAULT 'sent',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_msg_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at DESC);
`;

(async () => {
    try {
        await pool.query('DROP TABLE IF EXISTS messages;');
        await pool.query(`
        CREATE TABLE messages (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            room_id CHAR(36) NOT NULL,
            sender_id CHAR(36) NOT NULL,
            content TEXT,
            message_type VARCHAR(50) NOT NULL DEFAULT 'text',
            status ENUM('sent', 'delivered', 'seen') NOT NULL DEFAULT 'sent',
            is_deleted TINYINT(1) NOT NULL DEFAULT 0,
            deleted_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_chat_msg_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
            CONSTRAINT fk_chat_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );
        `);
        console.log("Messages table created");
        process.exit(0);
    } catch (err) {
        console.error("Error", err);
        process.exit(1);
    }
})();
