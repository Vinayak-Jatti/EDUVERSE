import pool from "../config/db.js";

const migrate = async () => {
    try {
        console.log("🛠️  Upgrading Mastery Stream Schema...");
        
        // Add 'audio' to post_type enum
        await pool.execute(`
            ALTER TABLE posts MODIFY COLUMN post_type ENUM('text', 'image', 'video', 'news_link', 'poll', 'audio') NOT NULL DEFAULT 'text'
        `);
        console.log("✅ Posts ENUM updated (audio)");

        // Add 'audio' to media_type enum
        await pool.execute(`
            ALTER TABLE post_media MODIFY COLUMN media_type ENUM('image', 'video', 'audio', 'thumbnail') NOT NULL
        `);
        console.log("✅ Post Media ENUM updated (audio)");

        console.log("🏁  Mastery Schema is officially ELITE.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Upgrade Failed:", err.message);
        process.exit(1);
    }
};

migrate();
