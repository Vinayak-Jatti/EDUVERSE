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

// ─── Mock interaction repository ─────────────────────────────────────────────
vi.mock('../../modules/feed/interaction.repository.js', () => ({
  default: {
    addComment: vi.fn(),
    getCommentsByTarget: vi.fn(),
    deleteComment: vi.fn(),
    toggleSave: vi.fn(),
  }
}));

import interactionRepository from '../../modules/feed/interaction.repository.js';
import {
  addComment,
  getPostComments,
  deleteComment,
  toggleSave,
} from '../../modules/feed/interaction.service.js';

// ─── Interaction Service: Unit Tests ─────────────────────────────────────────

describe('Interaction Service — addComment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw BAD_REQUEST when body is empty string', async () => {
    await expect(addComment({ postId: 'p1', userId: 'u1', body: '' }))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
    expect(interactionRepository.addComment).not.toHaveBeenCalled();
  });

  it('should throw BAD_REQUEST when body is only whitespace', async () => {
    await expect(addComment({ postId: 'p1', userId: 'u1', body: '   ' }))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
    expect(interactionRepository.addComment).not.toHaveBeenCalled();
  });

  it('should throw BAD_REQUEST when body is null/undefined', async () => {
    await expect(addComment({ postId: 'p1', userId: 'u1', body: null }))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
  });

  it('should default targetType to "post" when not provided', async () => {
    interactionRepository.addComment.mockResolvedValue(true);
    await addComment({ postId: 'p1', userId: 'u1', body: 'Nice!' });
    expect(interactionRepository.addComment).toHaveBeenCalledWith('u1', 'post', 'p1', 'Nice!', null);
  });

  it('should use provided targetType when given', async () => {
    interactionRepository.addComment.mockResolvedValue(true);
    await addComment({ postId: 'ins1', targetType: 'insight', userId: 'u1', body: 'Great insight' });
    expect(interactionRepository.addComment).toHaveBeenCalledWith('u1', 'insight', 'ins1', 'Great insight', null);
  });

  it('should pass parentId for threaded/reply comments', async () => {
    interactionRepository.addComment.mockResolvedValue(true);
    await addComment({ postId: 'p1', userId: 'u1', body: 'Reply!', parentId: 'c0' });
    expect(interactionRepository.addComment).toHaveBeenCalledWith('u1', 'post', 'p1', 'Reply!', 'c0');
  });

  it('should return success message on successful comment creation', async () => {
    interactionRepository.addComment.mockResolvedValue(true);
    const result = await addComment({ postId: 'p1', userId: 'u1', body: 'Hello!' });
    expect(result.message).toMatch(/comment added/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Interaction Service — getPostComments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return comments list from repository', async () => {
    const mockComments = [
      { id: 'c1', body: 'First comment', user_id: 'u1' },
      { id: 'c2', body: 'Second', user_id: 'u2' },
    ];
    interactionRepository.getCommentsByTarget.mockResolvedValue(mockComments);
    const result = await getPostComments('p1');
    expect(result).toEqual(mockComments);
    expect(interactionRepository.getCommentsByTarget).toHaveBeenCalledWith('p1');
  });

  it('should return empty array when post has no comments', async () => {
    interactionRepository.getCommentsByTarget.mockResolvedValue([]);
    const result = await getPostComments('p1');
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Interaction Service — deleteComment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw NOT_FOUND when comment does not exist or user is not owner', async () => {
    interactionRepository.deleteComment.mockResolvedValue({ affectedRows: 0 });
    await expect(deleteComment('c-ghost', 'u1'))
      .rejects.toMatchObject({ errorCode: 'NOT_FOUND' });
  });

  it('should return success message when comment is deleted', async () => {
    interactionRepository.deleteComment.mockResolvedValue({ affectedRows: 1 });
    const result = await deleteComment('c1', 'u1');
    expect(result.message).toMatch(/deleted/i);
    expect(interactionRepository.deleteComment).toHaveBeenCalledWith('c1', 'u1');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Interaction Service — toggleSave', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should delegate to repository and return its result', async () => {
    interactionRepository.toggleSave.mockResolvedValue({ saved: true });
    const result = await toggleSave('u1', 'p1');
    expect(interactionRepository.toggleSave).toHaveBeenCalledWith('u1', 'p1');
    expect(result).toEqual({ saved: true });
  });

  it('should handle toggle-off (unsave) correctly', async () => {
    interactionRepository.toggleSave.mockResolvedValue({ saved: false });
    const result = await toggleSave('u1', 'p1');
    expect(result.saved).toBe(false);
  });
});
