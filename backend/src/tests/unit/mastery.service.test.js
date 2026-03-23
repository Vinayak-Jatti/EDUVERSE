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

// ─── Mock mastery repository ──────────────────────────────────────────────────
vi.mock('../../modules/mastery/mastery.repository.js', () => ({
  createMasteryStream: vi.fn(),
  getPublicMasteryStreams: vi.fn(),
  getMasteryStreamsByUserId: vi.fn(),
}));

import * as masteryRepository from '../../modules/mastery/mastery.repository.js';
import {
  initializeMasteryStream,
  discoverPublicStreams,
  getUserMasteryStreams,
} from '../../modules/mastery/mastery.service.js';

// ─── Mastery Service: Unit Tests ──────────────────────────────────────────────

describe('Mastery Service — initializeMasteryStream', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should always set mediaType to "video" regardless of input', async () => {
    masteryRepository.createMasteryStream.mockResolvedValue({ id: 'm1' });

    await initializeMasteryStream('u1', {
      body: 'Lesson on algorithms',
      mediaUrl: 'https://cdn.example.com/vid.mp4',
      mimeType: 'video/mp4',
      visibility: 'public',
    });

    const args = masteryRepository.createMasteryStream.mock.calls[0][0];
    expect(args.mediaType).toBe('video');
  });

  it('should default visibility to "public" when not provided', async () => {
    masteryRepository.createMasteryStream.mockResolvedValue({ id: 'm1' });

    await initializeMasteryStream('u1', {
      mediaUrl: 'https://cdn.example.com/vid.mp4',
      mimeType: 'video/mp4',
    });

    const args = masteryRepository.createMasteryStream.mock.calls[0][0];
    expect(args.visibility).toBe('public');
  });

  it('should pass userId and all provided fields correctly to repository', async () => {
    masteryRepository.createMasteryStream.mockResolvedValue({ id: 'm1' });

    await initializeMasteryStream('user-abc', {
      body: 'Deep Dive into Recursion',
      mediaUrl: 'https://cdn.example.com/recursion.mp4',
      mimeType: 'video/mp4',
      visibility: 'connections_only',
    });

    const args = masteryRepository.createMasteryStream.mock.calls[0][0];
    expect(args.userId).toBe('user-abc');
    expect(args.body).toBe('Deep Dive into Recursion');
    expect(args.mediaUrl).toBe('https://cdn.example.com/recursion.mp4');
    expect(args.mimeType).toBe('video/mp4');
    expect(args.visibility).toBe('connections_only');
  });

  it('should set body to null when not provided', async () => {
    masteryRepository.createMasteryStream.mockResolvedValue({ id: 'm1' });

    await initializeMasteryStream('u1', {
      mediaUrl: 'https://cdn.example.com/vid.mp4',
      mimeType: 'video/mp4',
    });

    const args = masteryRepository.createMasteryStream.mock.calls[0][0];
    expect(args.body).toBeNull();
  });

  it('should return the repository result (created stream object)', async () => {
    const mockStream = { id: 'm1', post_type: 'video', user_id: 'u1' };
    masteryRepository.createMasteryStream.mockResolvedValue(mockStream);

    const result = await initializeMasteryStream('u1', {
      mediaUrl: 'https://cdn.example.com/vid.mp4',
      mimeType: 'video/mp4',
    });

    expect(result).toEqual(mockStream);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Mastery Service — discoverPublicStreams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return all public streams from repository', async () => {
    const streams = [{ id: 'm1', visibility: 'public' }, { id: 'm2', visibility: 'public' }];
    masteryRepository.getPublicMasteryStreams.mockResolvedValue(streams);

    const result = await discoverPublicStreams();
    expect(result).toEqual(streams);
    expect(masteryRepository.getPublicMasteryStreams).toHaveBeenCalledOnce();
  });

  it('should return empty array when no public streams exist', async () => {
    masteryRepository.getPublicMasteryStreams.mockResolvedValue([]);
    const result = await discoverPublicStreams();
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Mastery Service — getUserMasteryStreams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return streams for the specified user', async () => {
    const streams = [{ id: 'm1', user_id: 'u1' }];
    masteryRepository.getMasteryStreamsByUserId.mockResolvedValue(streams);

    const result = await getUserMasteryStreams('u1');
    expect(result).toEqual(streams);
    expect(masteryRepository.getMasteryStreamsByUserId).toHaveBeenCalledWith('u1');
  });

  it('should return empty array when user has no mastery streams', async () => {
    masteryRepository.getMasteryStreamsByUserId.mockResolvedValue([]);
    const result = await getUserMasteryStreams('new-user');
    expect(result).toEqual([]);
  });
});
