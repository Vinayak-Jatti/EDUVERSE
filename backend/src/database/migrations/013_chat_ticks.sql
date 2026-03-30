-- 1. Add status column to messages table to support WhatsApp style tick verifications
ALTER TABLE messages 
ADD COLUMN status ENUM('sent', 'delivered', 'seen') NOT NULL DEFAULT 'sent' AFTER message_type;
