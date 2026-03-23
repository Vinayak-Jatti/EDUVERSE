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

// ─── Mock insight repository ─────────────────────────────────────────────────
vi.mock('../../modules/insight/insight.repository.js', () => ({
  default: {
    createInsight: vi.fn(),
    deleteInsight: vi.fn(),
  }
}));

import insightRepository from '../../modules/insight/insight.repository.js';
import { createInsight, deleteInsight } from '../../modules/insight/insight.service.js';

// ─── Insight Service: Unit Tests ──────────────────────────────────────────────

describe('Insight Service — createInsight', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw MISSING_FIELDS when content is empty string', async () => {
    await expect(createInsight('u1', '', 'public'))
      .rejects.toMatchObject({ errorCode: 'MISSING_FIELDS' });
    expect(insightRepository.createInsight).not.toHaveBeenCalled();
  });

  it('should throw MISSING_FIELDS when content is only whitespace', async () => {
    await expect(createInsight('u1', '    ', 'public'))
      .rejects.toMatchObject({ errorCode: 'MISSING_FIELDS' });
  });

  it('should throw INVALID_INPUT when content exceeds 500 characters', async () => {
    const longContent = 'a'.repeat(501);
    await expect(createInsight('u1', longContent, 'public'))
      .rejects.toMatchObject({ errorCode: 'INVALID_INPUT' });
    expect(insightRepository.createInsight).not.toHaveBeenCalled();
  });

  it('should accept content at exactly 500 characters (boundary)', async () => {
    const exactContent = 'a'.repeat(500);
    insightRepository.createInsight.mockResolvedValue({ id: 'ins1' });
    await expect(createInsight('u1', exactContent, 'public')).resolves.toBeDefined();
  });

  it('should trim whitespace from content before saving', async () => {
    insightRepository.createInsight.mockResolvedValue({ id: 'ins1' });
    await createInsight('u1', '  Hello World  ', 'public');
    const savedData = insightRepository.createInsight.mock.calls[0][0];
    expect(savedData.content).toBe('Hello World');
  });

  it('should default visibility to "public" when not provided', async () => {
    insightRepository.createInsight.mockResolvedValue({ id: 'ins1' });
    await createInsight('u1', 'Quick thought');
    const savedData = insightRepository.createInsight.mock.calls[0][0];
    expect(savedData.visibility).toBe('public');
  });

  it('should generate a UUID id and include user_id in saved data', async () => {
    insightRepository.createInsight.mockResolvedValue({ id: 'ins1' });
    await createInsight('user-abc', 'My insight', 'connections_only');
    const savedData = insightRepository.createInsight.mock.calls[0][0];
    expect(savedData.user_id).toBe('user-abc');
    expect(savedData.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    expect(savedData.visibility).toBe('connections_only');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Insight Service — deleteInsight', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw FORBIDDEN when insight not found or user is not owner', async () => {
    insightRepository.deleteInsight.mockResolvedValue(false);
    await expect(deleteInsight('u1', 'ins-nonexistent'))
      .rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
  });

  it('should return success message when deletion succeeds', async () => {
    insightRepository.deleteInsight.mockResolvedValue(true);
    const result = await deleteInsight('u1', 'ins1');
    expect(result.message).toMatch(/deleted/i);
    expect(insightRepository.deleteInsight).toHaveBeenCalledWith('ins1', 'u1');
  });
});
