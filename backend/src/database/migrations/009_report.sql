-- ============================================================
--  EDUVERSE — REPORT MODULE
--  Database : MySQL 8.0+
--  Depends  : auth (users), admin (admin_users)
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    reporter_id     CHAR(36)        NOT NULL,
    target_type     ENUM(
                        'user',
                        'post',
                        'comment',
                        'community',
                        'message'
                    )               NOT NULL,
    target_id       VARCHAR(36)     NOT NULL,
    reason          ENUM(
                        'spam',
                        'harassment',
                        'hate_speech',
                        'misinformation',
                        'inappropriate_content',
                        'copyright',
                        'impersonation',
                        'other'
                    )               NOT NULL,
    description     TEXT,
    status          ENUM(
                        'pending',
                        'under_review',
                        'resolved_action_taken',
                        'resolved_no_action',
                        'dismissed'
                    )               NOT NULL  DEFAULT 'pending',
    resolved_by     INT UNSIGNED,
    resolution_note TEXT,
    resolved_at     DATETIME,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_report_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_resolver
        FOREIGN KEY (resolved_by) REFERENCES admin_users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS report_evidence (
    id              INT UNSIGNED    NOT NULL  AUTO_INCREMENT,
    report_id       INT UNSIGNED    NOT NULL,
    evidence_type   ENUM('screenshot', 'url', 'text')   NOT NULL,
    content         VARCHAR(512)    NOT NULL,
    created_at      DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_evidence_report
        FOREIGN KEY (report_id) REFERENCES reports(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_reports_status         ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target         ON reports(target_type, target_id);
CREATE INDEX idx_reports_reporter       ON reports(reporter_id);
CREATE INDEX idx_reports_resolver       ON reports(resolved_by);

-- ============================================================
--  TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_report_resolved;
CREATE TRIGGER trg_report_resolved
    BEFORE UPDATE ON reports
    FOR EACH ROW
BEGIN
    IF OLD.status IN ('pending', 'under_review')
    AND NEW.status NOT IN ('pending', 'under_review') THEN
        SET NEW.resolved_at = NOW();
    END IF;
END;
