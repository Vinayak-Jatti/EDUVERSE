import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Prevent module-load crashes ────────────────────────────────────────────
vi.mock('../../config/env.js', () => ({
  default: {
    server: { port: '3000', env: 'test', isProduction: false },
    cors: { origin: 'http://localhost:5173' },
    db: { host: 'localhost', port: '3306', name: 'test_db', user: 'test', password: 'test' },
    jwt: { secret: 'test-secret', expiresIn: '1h', refreshSecret: 'test-refresh-secret', refreshExpiresIn: '7d' },
    mail: { host: 'smtp.test.com', port: '587', user: 'test@test.com', pass: 'testpass', from: 'EduVerse <no-reply@eduverse.app>' },
    oauth: { google: { clientId: '', clientSecret: '', redirectUri: '' }, github: { clientId: '', clientSecret: '', redirectUri: '' } },
  }
}));
vi.mock('../../config/db.js', () => ({
  default: {
    execute: vi.fn().mockResolvedValue([[], {}]),
    query: vi.fn().mockResolvedValue([[], {}]),
    getConnection: vi.fn().mockResolvedValue({ beginTransaction: vi.fn(), execute: vi.fn().mockResolvedValue([[], {}]), commit: vi.fn(), rollback: vi.fn(), release: vi.fn() }),
  }
}));

// ─── Mock report repository ──────────────────────────────────────────────────
vi.mock('../../modules/feed/report.repository.js', () => ({
  default: {
    createReport: vi.fn(),
  }
}));

import reportRepository from '../../modules/feed/report.repository.js';
import { submitReport } from '../../modules/feed/report.service.js';

const VALID_PAYLOAD = {
  reporterId: 'u1',
  targetType: 'post',
  targetId: 'p1',
  reason: 'spam',
  description: 'This is spam',
};

// ─── Report Service: Unit Tests ───────────────────────────────────────────────

describe('Report Service — submitReport', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── Reason validation ───────────────────────────────────────────────────
  it('should throw BAD_REQUEST for an invalid report reason', async () => {
    await expect(submitReport({ ...VALID_PAYLOAD, reason: 'not_a_real_reason' }))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
    expect(reportRepository.createReport).not.toHaveBeenCalled();
  });

  it.each([
    'spam', 'harassment', 'hate_speech', 'misinformation',
    'inappropriate_content', 'copyright', 'impersonation', 'other'
  ])('should accept valid reason: "%s"', async (reason) => {
    reportRepository.createReport.mockResolvedValue(true);
    await expect(submitReport({ ...VALID_PAYLOAD, reason })).resolves.toBeDefined();
  });

  // ─── Target type validation ───────────────────────────────────────────────
  it('should throw BAD_REQUEST for an invalid target type', async () => {
    await expect(submitReport({ ...VALID_PAYLOAD, targetType: 'unknown_type' }))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
    expect(reportRepository.createReport).not.toHaveBeenCalled();
  });

  it.each(['user', 'post', 'comment', 'community', 'message', 'insight'])(
    'should accept valid target type: "%s"',
    async (targetType) => {
      reportRepository.createReport.mockResolvedValue(true);
      await expect(submitReport({ ...VALID_PAYLOAD, targetType })).resolves.toBeDefined();
    }
  );

  // ─── Happy path ───────────────────────────────────────────────────────────
  it('should call createReport with correct payload on success', async () => {
    reportRepository.createReport.mockResolvedValue(true);
    await submitReport(VALID_PAYLOAD);

    expect(reportRepository.createReport).toHaveBeenCalledOnce();
    expect(reportRepository.createReport).toHaveBeenCalledWith({
      reporterId: 'u1',
      targetType: 'post',
      targetId: 'p1',
      reason: 'spam',
      description: 'This is spam',
    });
  });

  it('should return a success message on valid submission', async () => {
    reportRepository.createReport.mockResolvedValue(true);
    const result = await submitReport(VALID_PAYLOAD);
    expect(result.message).toMatch(/submitted/i);
  });
});
