-- ============================================================
--  EDUVERSE — CONTACT MODULE
--  Schema   : Career Applications & Inquiries
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_applications (
    id                  CHAR(36)        NOT NULL  DEFAULT (UUID()),
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    campus              VARCHAR(255),
    resume_url          TEXT            NOT NULL,
    status              ENUM('pending', 'reviewed', 'contacted', 'rejected') NOT NULL DEFAULT 'pending',
    created_at          DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);

CREATE INDEX idx_applications_email ON contact_applications(email);
CREATE INDEX idx_applications_status ON contact_applications(status);
